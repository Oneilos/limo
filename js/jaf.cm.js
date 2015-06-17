Jaf.cm = {
    status                : 0,
    database              : null,
    urlDb                 : '/bop3/',
    nameDbDefaut          : 'local',
    actionSynchro         : 'synchronize',
    listeConcept          : {},
	listBind              : [],
    listeDataWait         : {},
    sqlInstalled          : [],
    synchro               : false,
    dataLoad              : false,
    synchro_old           : -1, 
     
    setDatabase : function(name) {
        if ( !Jaf.cm.listeConcept[ name ] ) {
            Jaf.cm.listeConcept[ name ] = {};
        }
        Jaf.cm.database = name;
    },
    
    addConcept  : function (concept) {
        Jaf.cm.listeConcept[Jaf.cm.database][concept.name] = concept;
    },
 
	getConcept  : function (name) {
        var tab      = name.split('.');
        var basename = tab.length > 1 ? tab[0] : Jaf.cm.database;
        if ( tab.length > 1 ) name = tab[1];
        //Jaf.log('getConcept['+basename+']['+name+']');
        if (!Jaf.cm.listeConcept[ basename ][ name ]) {
            Jaf.cm.listeConcept[basename][name]=Jaf.extend( new JafConcept( name , Jaf.cm.configConcepts[name] , basename ) );
		}
        return Jaf.cm.listeConcept[basename][name];
	},

	getListeTML : function(name) {
		var rowset = Jaf.cm.getConcept(name).rowset;
		var tab    = [];
		for(var i in rowset ) {
			var row={};
			for(var j in rowset[i]) {
				if ( rowset[i][j] ) {
                    row[j] = typeof rowset[i][j] == 'string' && rowset[i][j].indexOf('~^') > 0 ? Jaf.translate(rowset[i][j]) : rowset[i][j];
				}
			}
			tab.push(row);
		}
		return {liste:tab}
	},
    
    loadDatasConcept : function() {
        var config = {};
        var wheres = {};
        var flag   = false;
        for(var name in Jaf.cm.listeDataWait) {
            flag           = true;
            var concept    = Jaf.cm.getConceptByTable( name );
            config[ name ] =  { t : name , i : concept.primary };
            Jaf.cm.listeConcept[Jaf.cm.database][ concept.name ].waitingProcess++;
            if ( Jaf.cm.listeDataWait[name] && Jaf.cm.listeDataWait[name].length > 0 ) {
                wheres[ name ] = Jaf.cm.listeDataWait[name];
            }
            //Jaf.log('je load la table '+name);
        }
        if ( flag ) {
            Jaf.cm.loaderData( config , wheres , Jaf.cm.checkOnLoad );
        } else {
            Jaf.cm.checkOnLoad();  
        }
    }, 
    
    onload : function( mafonction ) {
		Jaf.cm.listBind.push( mafonction );
	},
    
    saveDataLocal : function( databases ) {
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            for( var nc in Jaf.cm.configConcepts ) {
                var concept = Jaf.cm.getConcept( nc );
                concept.saveDataLocale();
            }
        }
    },
    
    loadDataLocale : function( databases ) {
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            for( var nc in Jaf.cm.configConcepts ) {
                var concept = Jaf.cm.getConcept( nc );
                concept.loadDataLocale();
            }
        }
    },
    
	makeSynchro : function( databases , mafonction ) {
        var data = [];
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            var params = Jaf.cm.getRowsynchro();
            Jaf.log(params);
            if ( JSON.stringify( params ).length > 2 ) {
                data.push({ limo : databases[i] , params : params } );
            }
        }
        Jaf.log(data);
        if ( data.length > 0 ) {
            Jaf.cm.gds.send(
                Jaf.cm.actionSynchro,
                data,
                function (data) {
                    Jaf.log(data); 
                    Jaf.cm.doneTransaction();
                    for( var i in databases ) {
                        if ( data[ databases[i] ] ) {
                            Jaf.log('je purge les synchros');
                            for(var name in Jaf.cm.configConcepts) {
                                var concept = Jaf.cm.getConcept(databases[i]+'.'+name);
                                concept.synchro_insert = [];
                                concept.synchro_update = [];
                                concept.synchro_delete = [];
                            }
                        }
                    }
                    if ( mafonction ) {
                        mafonction(true);
                    }
                },
                function() {
                    Jaf.cm.failTransaction();
                    if ( mafonction ) {
                        mafonction(false);
                    }
                }
            );
        } else {
            if ( mafonction ) {
                mafonction(true);
            }
        }
        
    },
    
    getRowsynchro : function() {
        var res = {};
        for(var nc in Jaf.cm.configConcepts) {
            var concept = Jaf.cm.getConcept(nc);
            //Jaf.log(Jaf.cm.database+':'+nc);
            var li      = concept.synchro_insert;
            var lu      = concept.synchro_update;
            var ld      = concept.synchro_delete;
            var o       = {};
            var flag    = false;
            if ( li.length > 0 ) {
                o.i = li;
                flag=true;
            }
            if ( lu.length > 0 ) {
                o.u = lu;
                flag=true;
            }
            if ( ld.length > 0 ) {
                o.d = ld;
                flag=true;
            }
            if ( flag ) {
                res[ nc ] = o;
            }
        }
        return res;
    },
    
    setDatas : function( datas) {
        for( var database in datas ) {
            Jaf.cm.database = database;
            var data        = datas[database].data;
            var champs      = datas[database].champs;
            
            for (var nc in data) {
                var concept = Jaf.cm.getConcept( nc );
                concept.setRowsetAvecNomChamp( data[nc] , champs[nc] );
            }
        }
    },
    
    loadData : function ( datas , lnc ) {
        //Jaf.log(datas);
        for( var nc in datas ) {
           var concept = Jaf.cm.getConcept( nc );
           concept.setRowsetAvecNomChamp( datas[ table ] , lnc[ table ] );
        }
    },
    
    doneTransaction : function() {
        if ( Jaf.cm.synchro == false ) {
            Jaf.cm.synchro = true;
            //Jaf.log('passé par doneTransaction');
            Jaf.eve.executeModeDeconnecter();
        }
    },

    failTransaction : function(eve) {
        if ( Jaf.cm.synchro) {
            Jaf.cm.synchro = false;
            Jaf.log('passé par failTransaction');
            Jaf.eve.executeModeDeconnecter();
        }
    },

}
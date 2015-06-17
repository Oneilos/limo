var JafConcept = function(name,trigramme,database){
	var trigramme          = trigramme;
	this.name              = name;
	this.trigramme         = trigramme;
	this.primary           = trigramme+'_ID';
    this.database          = database;
	this.rowAttente        = [];
	this.rowModifier       = [];
	this.rowset            = {};
	this.afterLoadFunction = [];
	this.propageParent     = {};
	this.propageFils       = {};
    this.synchro_insert    = [];
    this.synchro_update    = [];
    this.synchro_delete    = []; 
    this.listeObjetSauver  = [ 'rowset' , 'synchro_insert' , 'synchro_update' , 'synchro_delete' ];
	  
	JafConcept.prototype.getTrigramme = function () {
		return this.trigramme;
	}

	JafConcept.prototype.saveDataLocale = function() {
        var listeObjet = this.listeObjetSauver;        
        var prefixe    = this.database + '.' + this.name +'.';
        for ( var i in this.listeObjet ) {
            var name = prefixe + listeObjet[i];
            var o    = JSON.stringify( this[ listeObjet[i] ] );
            if ( o.length >2 ) {
                localStorage.setItem( name , o );
            } else {
                localStorage.removeItem( name );
            }
        }
    }
    
	JafConcept.prototype.loadDataLocale = function() {
        var listeObjet = this.listeObjetSauver;
        var prefixe    = this.database + '.' + this.name +'.';
        for ( var i in listeObjet ) {
            var name = prefixe + listeObjet[i];
            var o    = localStorage.getItem( name );
            if ( o ) {
                this[ listeObjet[i] ] =  JSON.parse( o );
            }
        }
    }
    
	JafConcept.prototype.load=function (mafonction) {
		var tab     = [];
		var primary = this.primary;
		for(var  i in this.rowAttente ) {
			if (! this.getRow(i) ) {
				tab.push(i.substr(1));
				delete(this.rowAttente[i]);
			}
		}
		if (tab.length>0) {
			var fil={
				type  : 'hidden',
				champ : primary
			};
			var param = { filtres:{}};
			param.filtres[primary]=fil;
			param[primary]=tab;
			this.fetchAll(param,mafonction);
		} else {
			this.checkOnLoad();
		}

		return this;
	}

	JafConcept.prototype.addRow=function (row,mafonc) {
		this.rowset[ 'c' + row[ this.primary ] ] = row; 
        if ( mafonc) mafonc(row);
		return this;
	}

	JafConcept.prototype.checkDeleteRow=function (id , mafonc ) {
        if ( this.rowset[ 'c' + id ] ) {
            delete( this.rowset[ 'c' + id ] );
            if ( mafonc ) mafonc();
        } else {
            if ( mafonc ) mafonc(); 
        }
	}
		 
	JafConcept.prototype.changeRow=function ( id , row ) {
		Jaf.log('changeRow '+this.name+' : '+id+' => '+row[ this.primary ] );
        var concept = this;
        concept.checkDeleteRow(id,function() {
            return concept.addRow(row);
        });
	}
    
    JafConcept.prototype.changeSaveRowset = function (id, nomChamp , valeur ) {
		Jaf.log('changeSaveRowset '+id+' => '+nomChamp+'='+valeur);
    }
    
	JafConcept.prototype.save=function (mafonction) {
		var rowset=[];
		var nb=0;
        var concept=this;
		for(var  i in this.rowModifier) {
			rowset.push(this.rowModifier[i]);
			nb++;
			delete(this.rowModifier[i]);
		}
		if ( nb > 0 ) {
            this.saverowset(rowset,mafonction);
		} else if ( mafonction ) mafonction(rowset);
		return this;
	}
	
    JafConcept.prototype.saverowset= function(rowset,mafonction) {
        if ( rowset.length>0) {
            var concept = this;
            var params  = {};
            params[ this.name ] = rowset;
            var datas   = [ { limo : this.database , params : params } ];
            
            Jaf.cm.gds.send('set-ressource',datas,function(data) {
                if (data && data[concept.database]) {
                    
                    if (mafonction) {
                        mafonction(rowset);
                    }
                } else { 
                    concept.failSaverowset(rowset,mafonction);
                }
            },function() { 
                concept.failSaverowset(rowset,mafonction);
            });

        } else if ( mafonction ) mafonction(rowset);
    }
    
    JafConcept.prototype.addSynchroSave = function(monid,champ,valeur,madate) {
        for(var i in this.synchro_update) {
            if ( this.synchro_update[i].i == monid &&  this.synchro_update[i].c == champ ) {
                this.synchro_update[i]={
                    i : monid,
                    c : champ,
                    v : valeur,
                    d : madate
                }
                return true;
            }
        }
        this.synchro_update.push({
            i : monid,
            c : champ,
            v : valeur,
            d : madate
        });
    }

    JafConcept.prototype.failSaverowset=function(rowset,mafonction) {
        var concept = this;
        Jaf.cm.failTransaction();
        Jaf.log('impossible d\'envoyer les données');
        if ( ! Jaf.cm.hasAlertSyncho ) { 
            alert('Attention : votre connexion internet n\'a pas permis d\'envoyer les dernières informations saisies. Vos données seront automatiquement envoyées dès que la connexion aura été rétablie.');
            Jaf.cm.hasAlertSyncho=true;
        }
        for(var i in rowset) {
            var monid=rowset[i][ concept.primary ];
            if ( rowset[i][ 'date' ] ) {
                var madate = rowset[i][ 'date' ];
            } else {
                var d      = new Date();
                var madate = Math.round( d.getTime() / 1000 );
            }
            Jaf.log(rowset);
            for(var nc in rowset[i]) {
                if ( nc != concept.primary && nc != 'date' ) {
                    concept.addSynchroSave(monid,nc,rowset[i][nc],madate);
                }
            }
        }
        if ( mafonction ) mafonction(rowset);
    }

	JafConcept.prototype.need=function (monid,flag_force) {
		if ( flag_force || ! this.getRow(monid) ) {
            this.rowAttente['c'+monid] = monid;
        }
		return this;
	}

	JafConcept.prototype.isLocal=function () {
        return Jaf.eve.mode_deco;
	}
	
	JafConcept.prototype.setValue=function (monid,nomChamp,valeur,chargementEvenement) {
		if ( this.rowset[ 'c' + monid ] ) {
            valeur    =  valeur==null ? '' : ''+valeur;
            var v_old = this.rowset[ 'c' + monid ][nomChamp] == null ? '' : ''+this.rowset[ 'c' + monid ][nomChamp];
            if ( valeur != v_old ) {
                this.rowset[ 'c' + monid ][nomChamp]=valeur;
                if ( !chargementEvenement ) {
                    if ( !this.rowModifier[ 'c' + monid ] ) {
                        this.rowModifier[ 'c' + monid ]={};
                    }
                    this.rowModifier[ 'c' + monid ][this.primary]=monid;
                    this.rowModifier[ 'c' + monid ][nomChamp]=valeur;
                }
            }
        } else {
            throw  'erreur setValue sur '+this.database+' : '+this.name+' : id='+monid+' row inexistant';
            Jaf.log('**erreur setValue sur '+this.database+' : '+this.name+' : id='+monid+' row inexistant');
        }
        return this;
	}
    
    JafConcept.prototype.setRowsetAvecNomChamp=function (data,listeChamp) {
        var rowset = [];
        for(var i in data) {
			var row={};
            var cpt=0;
            for(var j in listeChamp ) {
                row[ listeChamp[j] ] = data[i][cpt++];
            }
            this.setRow( row );
		}
		return this;
	}
	
    JafConcept.prototype.setRowset=function (data) {
        for(var  i in data) {
			this.setRow(data[i]);
		}
		return this;
	}
        
	JafConcept.prototype.setRow=function (row) {
		this.rowset[ 'c' +row[ this.primary ] ] = row; 
		return this;
	}

	JafConcept.prototype.onload=function ( mafonction ) {
		this.afterLoadFunction.push(mafonction);
		return this;
	}
	
	JafConcept.prototype.checkOnLoad=function () {
		this.propageData();
		if ( this.waitingProcess==0 ) {
			for(var  i in this.afterLoadFunction) {
				this.afterLoadFunction[i]();
			}
			Jaf.cm.checkOnLoad();
		}
		return this;
	}
	
	JafConcept.prototype.getRow=function (monid) {
		if ( !this.rowset[ 'c' + monid ] ) {
			return false;
		}
		return this.rowset[ 'c' + monid ] ;
	}
	
	JafConcept.prototype.getRowset=function () {
		var rowset=[];
		for(var  i in this.rowset) {
		    rowset.push( this.rowset[i] ); 
		}
		return rowset;
	}

	JafConcept.prototype.getRowsetByChamp=function (nomChamp,value,where) {
		var rowset=[];
		for(var  i in this.rowset) {
			if ( this.rowset[i][nomChamp] == value ) {
                var flag=true;
                for(var wc in where ) {
                    flag &= this.rowset[i][wc]==where[wc];
                }
                if ( flag ) rowset.push( this.rowset[i] ); 
			}
		}
		return rowset;
	}
	
	JafConcept.prototype.getSelect=function () {
		return new Jaf.select( this );
	}

	JafConcept.prototype.getTableName=function () {
		return Jaf.cm.configConcepts[ this.name ].name;
	}
	
	JafConcept.prototype.fetchAll=function (params,mafonction) {
		var monConcept=this;
		if ( !params) {
			params = {};
		}
		monConcept.waitingProcess++;
		$.post(Jaf.cm.urlDb+this.name+'/getlistejson',params,function (data) {
			eval(data);
			monConcept.setRowset(data);
			monConcept.waitingProcess--;
			monConcept.checkOnLoad();
			if (mafonction) {
				mafonction(data);
			}
		}); 
		return this;
	}
	
	JafConcept.prototype.getAutocompleteList=function(request,lc,dedans) {
		var res=[]
		var rowset = this.rowset;
		var term = Jaf.toUpperCaseSansAccent(request.term);
		for (var i in rowset ) {
			var label='';
			for(var nc in lc) {
				label += (label.length==0 ? '' : ' ') + rowset[i][ lc[nc] ]; 
			}
			
			if ( dedans ? Jaf.toUpperCaseSansAccent( label ).indexOf( term ) > -1 : Jaf.toUpperCaseSansAccent( label ).indexOf(term)==0 ) {
				res.push({label:label,id:rowset[i][ this.primary ]});
			}
		}

		return res;
	}
	
    JafConcept.prototype.getAutocompleteListFiltrer=function(request,lc,filtres) {
		var rowset = this.getSelect().fetchAll(filtres);
		var res    = [];
		for (var i in rowset ) {
			if ( typeof lc == 'function') {
                var label = lc(rowset[i]);
            } else {
                var label='';
                for(var nc in lc) {
                    label += (label.length==0 ? '' : ' ') + rowset[i][ lc[nc] ]; 
                }
            }
			res.push({label:label,value:rowset[i][ this.primary ]});
		}
		return res;
	}
	
	JafConcept.prototype.setPropageParent=function (concept,nomChamp) {
		this.propageParent[nomChamp]=concept;
		return this;
	}
	
	JafConcept.prototype.setPropageFils=function (concept,nomChamp) {
		this.propageFils[nomChamp]=concept;
		return this;
	}
    
	JafConcept.prototype.propageData=function () {
		//récupère les données parent
		for(var  nomChamp in this.propageParent ) {
			var concept=this.propageParent[nomChamp];
			for(var  i in this.rowset ) {
				if (!concept.getRow( this.rowset[i][ nomChamp ] )) {
					concept.need( this.rowset[i][ nomChamp ] );
				}
			}
			concept.load();
		}
		
		//récupère les données fils 
		for(var  nomChamp in this.propageFils ) {
			var concept=this.propageFils[nomChamp];
			var tab=[];
			for(var  i in this.rowset ) {
				tab.push( this.rowset[i][ this.primary ] );
			}
			var params = {
				filtres:{}
			};
			params.filtres[nomChamp]={
				type  : 'hidden',
				champ : nomChamp
			};
			params[nomChamp]=tab;
			concept.fetchAll( params );
		}
		return this;
	}
};
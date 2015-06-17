Jaf.eve = {
	listBind       : [],
	flagOn         : false,
	flagExecute    : false,
	frequence      : 5000,
	lastEveId      : {},
	filtres        : [],
    mode_deco      : false,
    actionGetEvent : 'get-events',
    callbackDeco   : false,
    
	init     : function( limos , mafonc ) {
        this.flagOn = true;
        for(var l in limos) {
           Jaf.log('init eve avec '+limos[l]);
           Jaf.eve.setLastEveId( limos[l] , 0 );
        }
        Jaf.eve.listBind.push(mafonc);
	},
    
    getLastEveId : function (limo) {
        if ( !Jaf.eve.lastEveId[limo] ) {
            var lastEveId           = localStorage.getItem('eve.'+limos[l]+'.lastEveId');
            Jaf.eve.lastEveId[limo] = lastEveId > 0 ? lastEveId : 0 ;
        }
        return Jaf.eve.lastEveId[limo];
    },
    
    setLastEveId : function(limo,lastEveId) {
        localStorage.setItem( 'eve.'+limo+'.lastEveId', lastEveId );
        Jaf.eve.lastEveId[limo] = lastEveId;
    },

	addEvent : function(params)  {
		alert('faire le addEvent dans le GDS');
	},

    loadNewEvent : function(mafonction) { 
        var params = [];
        for(var l in Jaf.eve.lastEveId) {
            params.push({
                limo      : l,
                lastEveId : Jaf.eve.lastEveId[l]
            });
        }
        
        Jaf.cm.gds.send(
            Jaf.eve.actionGetEvent,
            params,
            function (rowsetEventsLimo) {
                if ( rowsetEventsLimo.code ) {
                    alert(rowsetEventsLimo.msg);
                } else {
                    for(var limo in rowsetEventsLimo ) {
                        var rowsetEvents = rowsetEventsLimo[ limo ].rowset;
                        for(var i in rowsetEvents) {
                            var eve = rowsetEvents[i];
                            eve.limo    = limo;
                            var concept = eve.CPT_CLASS && eve.CPT_CLASS.length > 0 ? Jaf.cm.getConcept(limo+'.'+eve.CPT_CLASS) : null ;
                            switch ( eve.CEV_LIBELLE ) {
                                case "rowInsert" :
                                    eve.EVE_PARAMS[ concept.primary ] = eve.EVE_PRIMARY;
                                    concept.setRow(eve.EVE_PARAMS);
                                break;
                                case "rowUpdate" :
                                    for ( var i in eve.EVE_PARAMS ) {
                                        concept.setValue( eve.EVE_PRIMARY , i , eve.EVE_PARAMS[i] , true );
                                    }
                                break;
                                case "rowDelete" :
                                    concept.checkDeleteRow( eve.EVE_PRIMARY );
                                break;
                            }
                            Jaf.log('EVENEMENT sur '+limo+' : '+eve.EVE_ID+'['+eve.CEV_LIBELLE+':'+eve.CPT_CLASS+':'+eve.EVE_PRIMARY+']==>'+( eve.EVE_PARAMS ? $.param(eve.EVE_PARAMS) : '' ) );
                            
                            for(var i in Jaf.eve.listBind ) {
                                Jaf.eve.listBind[i](eve);
                            }
                        }
                        Jaf.eve.setLastEveId( limo , rowsetEventsLimo[ limo ].lastEveId );
                    }
                    if ( mafonction ) mafonction(  { type : 'loadNewEvent', resultat : 'ok' } );
                }
            },function() {
                Jaf.cm.failTransaction();
                if ( mafonction ) mafonction( { type : 'loadNewEvent', resultat : 'ko' } );
            }
        );
	}
}

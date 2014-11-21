var Mobi = Jaf.extend(new JafController());

Mobi.filtreLoaderMission = 'MIS_DATE_DEBUT >="'+Jaf.date2mysql((new Date()).getTime()-8*24*3600000)+'" AND MIS_DATE_DEBUT <="'+Jaf.date2mysql((new Date()).getTime()+8*24*3600000)+'"';
Mobi.Tri.nomColonne      = 'date_debut';
Mobi.page_concept        = '';
Mobi.page_action         = '';
Mobi.step                = 0;
Mobi.PileFiltres         = [];
Mobi.newversion          = false;
Mobi.version             = '1.4.1';


Mobi.listeConcepts = {
    C_Geo_Pays : '' ,
    C_Geo_Ville : '' ,
    C_Geo_Lieu : '' ,
    C_Geo_TypeLieu : '' ,
    C_Com_StatutCommande : '' ,
    C_Com_Actionstatutcommande : '' ,
    C_Com_TypeService : '' ,
    C_Com_Commande             : 'COM_ID=0',
    C_Com_FraisMission         : 'FMI_ID=0',
    C_Gen_StatutMission : '' ,
    C_Gen_Chauffeur : '' ,
    C_Gen_Client : '' ,
    C_Gen_Contact : '' ,
    C_Gen_Mission              : 'MIS_ID=0',
    C_Gen_Partenaire : '' ,
    C_Gen_Voiture : '' ,
    C_Gen_TypeVehicule : '' ,
    C_Gen_Civilite : '' ,
    C_Com_Grille : '' ,
    C_Gen_Grilleclient : '' ,
    C_Gen_EntiteCommerciale : '' ,
    C_Gen_LegendeMission : ''
}

Mobi.log = function(chaine) {
    Mobi.old_log(chaine);
    //Jaf.chrono(chaine);
    Mobi.zoneMessageDebug_content += chaine+"\n";
    Mobi.zoneMessageDebug.val(Mobi.zoneMessageDebug_content);
}

Mobi.init = function() {
    Jaf.log('step='+Mobi.step);
    switch ( Mobi.step ) {

        case 0 :
            //verification du login
            setTimeout(Mobi.setIsBlocked,15000);
            $('#menu .titre .texte,#init .titre').html('Mobilimo v'+Mobi.version);
            Jaf.cm.initSql();
            $('#login .submit').click(function() {
                var site  = $('#login input[name=site]').val();
                var login = $('#login input[name=login]').val();
                var mdp   = $('#login input[name=mdp]').val();
                localStorage.setItem('connexion_site',site);
                localStorage.setItem('connexion_login',login);
                localStorage.setItem('connexion_mdp'  ,mdp);
                Mobi.closePopup('login');
                Mobi.initConnexion();
            });
            Jaf.eve.mode_deco = true;
            // mise en place du debugger
            Mobi.zoneMessageDebug         = $('#message textarea[name=message]').first();
            Mobi.zoneMessageDebug_content = '';
            Mobi.old_log                  = Jaf.log;
            Jaf.log                       = Mobi.log;
             // Mobi.depannage();
            //chargement de la lib google maps
            Jaf.cm.modeEmbarquer = true;
            Jaf.cm.initSql();
            Mobi.initConnexion();
            Jaf.log('InitConnexion : OK');
        break;


        case 1 : //contruction des tables
            Jaf.cm.bindSqlInstalled = Mobi.bindSqlInstalled;

            for(var i in Mobi.listeConcepts) {
                Mobi.nbProcessus.init++;
            }
            for(var i in Mobi.listeConcepts) {
                var concept = Jaf.cm.getConcept(i);
                if ( concept.isLocal() ) {
                    concept.loadFromSql();
                } else {
                    concept.installSql(Mobi.listeConcepts[i]);
                }
            }
            Jaf.log('installSql : OK');
        break;

        case 2 : //chargement des données
            //Jaf.cm.onload(Mobi.bindDataLoaded);
            Jaf.cm.loadDatasConcept();
            Jaf.log('loadDatasConcept : OK');
        break;

        case 3 :
            //chargement des datas des tables installées
            //On charge les données missions de la période
            Mobi.bindSqlInstalled();
        break;

        case 4 : // chargement des evenements en attente
            if ( Mobi.newversion ) {
                $('#outils').prepend('<p>Une nouvelle version de mobilimo est disponible, voulez vous la télécharger ?</p><a href="#" onclick="javascript:window.location.reload(); return false;">Télécharger</a>');
                Mobi.openPopup('outils');
            }
            Jaf.eve.init_mode_deco( 10000 , Mobi.majMission );
        break;
        case 5 :
            Mobi.initAffichage();
            Jaf.log('InitAffichage : OK');
            Mobi.chargeDataMission();
            Jaf.eve.executeModeDeconnecter();
            Mobi.step=6;
            Mobi.init();
        break;
        case 6 :
            var version_locale = localStorage.getItem('Mobilimo.version');
            if ( version_locale && version_locale != Mobi.version ) {
                if ( confirm('Votre Mobilimo doit être totalement rechargé suite à un changement de version du logiciel. Si vous cliquez sur OK alors toutes vos données seront supprimées et remplacées par celle en ligne.') ) {
                    localStorage.setItem('Mobilimo.version', Mobi.version);
                    Jaf.cm.synchro=true;
                    Mobi.reload();
                }
            }
            localStorage.setItem('Mobilimo.version', Mobi.version);
        break;
    }
}

Mobi.setIsBlocked = function() {
    if ( Mobi.step < 6 ) {
        $('#init').append('Si vous restez bloqué, suivez les étapes suivantes :');
        var bt = $('<div class="rechargement">Etape 1 - Rechargement simple</div>');
        bt.click( function () { window.location.reload(); } );
        $('#init').append(bt);
        var bt = $('<div class="rechargement">Etape 2 - Rechargement complet</div>');
        bt.click(Mobi.reload);
        $('#init').append(bt);
    }
}

Mobi.chargeDataMission = function () {
    var listeTableACharger = [
        {   t : 'nf_gen_mission'               , i : 'MIS_ID' ,
            p :  [
                {   t : 'nf_com_commande'      , i : 'COM_ID'        , s : 'MIS_COM_ID'    , d : 'COM_ID'  ,
                    p : [
                        {   t : "nf_gen_client"  , i : "CLI_ID"        , s : "COM_CLI_ID"    , d : "CLI_ID",
                            p : [
                                {   t :"nf_gen_contact" , i : "COT_ID"     , s : "CLI_ID"        , d:"COT_CLI_ID" }
                            ]
                        }
                    ]
                },
                {   t : 'nf_com_fraisMission'  , i : 'FMI_ID'        , s : 'MIS_ID'        , d : 'FMI_MIS_ID'  } ,
                {   t : 'nf_geo_lieu',           i : 'LIE_ID',         s : 'MIS_PC_LIE_ID',  d : 'LIE_ID',
                    p :  [
                        { t : 'nf_geo_ville'  ,  i : 'VIL_ID'       ,  s : 'LIE_VIL_ID'   ,  d : 'VIL_ID' }
                    ]
                },
                {   t : 'nf_geo_lieu',           i : 'LIE_ID',         s : 'MIS_DE_LIE_ID',  d : 'LIE_ID',
                    p :  [
                        { t : 'nf_geo_ville',  i : 'VIL_ID',  s : 'LIE_VIL_ID',  d : 'VIL_ID' }
                    ]
                },
                {   t : 'nf_gen_voiture'     , i : 'VOI_ID'        , s : 'MIS_VOI_ID'        , d : 'VOI_ID'  } ,
                {   t : 'nf_gen_chauffeur'   , i : 'CHU_ID'        , s : 'MIS_CHU_ID'        , d : 'CHU_ID'  }
            ]
        }
    ];

    var filtres = {
        nf_gen_mission      : 'MIS_COM_ID in (select distinct MIS_COM_ID from nf_gen_mission where ' + Mobi.filtreLoaderMission + ')'
    };
    Jaf.cm.loaderData( listeTableACharger , filtres , function () {
        $('#listeContent>.mission').remove();
        Mobi.analyseMission();
    });
}

Mobi.initConnexion = function() {
    var login = localStorage.getItem('connexion_login');
    var site  = localStorage.getItem('connexion_site');
    if ( login ) {
        $('#connexion_login').val(login);
    }
    if ( site ) {
        $('#connexion_site').val(site);
    } else {
        var base = window.document.baseURI ? window.document.baseURI.substr(7) : '';
        site     = base.substr(0,base.length - 1 );
        $('#connexion_site').val( site );
    }

    if ( login == null || login.length==0 ) {
        if ( !Mobi.openPopup.ouverte || ( Mobi.openPopup.ouverte && Mobi.openPopup.ouverte!='login') ) Mobi.openPopup('login');
    } else {
        var mdp  = localStorage.getItem('connexion_mdp');
        Jaf.cm.connexion = {
            login          : login,
            mot_passe      : mdp,
            type_connexion : 'ajax'
        }
        var trans = $.ajax({
            url  : 'http://'+site+'/bop2/index.php',
            data : Jaf.cm.connexion,
            type : 'POST' ,
            success : function(data) {
                console.log(data);
                eval(data);
                Mobi.step=1;
                Mobi.init();
            }
        });
        trans.fail(function() {
            Jaf.cm.failTransaction();
            Mobi.step=1;
            Mobi.init();
        });
        Jaf.urlSite         = 'http://'+site+'/';
        Jaf.cm.nameDbDefaut = 'mobilimo_'+site.replace(/\./g,"_");
        Jaf.cm.preFixe      = 'mobilimo_'+site.replace(/\./g,"_")+'_';
    }
}

Mobi.deconnexion = function() {
    localStorage.removeItem('connexion_login');
    window.location.reload();
}

Mobi.nbProcessus = {
    init     : 0,
    creating : 0,
    created  : 0,
    loading  : 0,
    loaded   : 0,
    loading2 : 0,
    loaded2  : 0,
    saving   : 0,
    saved    : 0
}

Mobi.bindSqlInstalled = function (concept,type,nb) {
    if ( type ) {
        Mobi.nbProcessus[ type ]+= nb ? nb : 1;
        Jaf.log(concept+' : '+type+' ==> '+Mobi.nbProcessus.created+'/'+Mobi.nbProcessus.creating+', '+Mobi.nbProcessus.loaded2+'/'+Mobi.nbProcessus.loading2+', '+Mobi.nbProcessus.loaded+'/'+Mobi.nbProcessus.loading+', '+Mobi.nbProcessus.saved+'/'+Mobi.nbProcessus.saving);
    }
    var step_old = Mobi.step;
    switch ( Mobi.step ) {
        case 1 :
            if ( Mobi.nbProcessus.created == Mobi.nbProcessus.creating &&
                 ( Mobi.nbProcessus.init    == Mobi.nbProcessus.loading ||
                   Mobi.nbProcessus.init    == Mobi.nbProcessus.loading2
                  )) {
                Mobi.step=2;
            }
            coef = Mobi.nbProcessus.created / Mobi.nbProcessus.init;
            $('#init .progression').css('width',Math.round( 10 + coef * 25 )+'%');
        break;
        case 2 :
            if  ( Mobi.nbProcessus.saved == Mobi.nbProcessus.saving  &&
                  (
                     ( Mobi.nbProcessus.loaded > 0 && 
                       Mobi.nbProcessus.loaded  == Mobi.nbProcessus.loading  ) ||
                     ( Mobi.nbProcessus.loaded2 == Mobi.nbProcessus.loading2 &&
                       Mobi.nbProcessus.init    == Mobi.nbProcessus.loading2
                     )
                  )
            ) 
            {
                Mobi.step=3;
            }
            coef = ( Mobi.nbProcessus.saved + Mobi.nbProcessus.loaded + Mobi.nbProcessus.loaded2 ) / ( Mobi.nbProcessus.saving +  Mobi.nbProcessus.loading +  Mobi.nbProcessus.loading2 );
            $('#init .progression').css('width',Math.round( 35 + coef * 45 )+'%');
        break;
        case 3 :

            if ( Mobi.nbElementSynchro ) {
               var restant = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
            } else {
                Mobi.nbElementSynchro = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
                var restant = Mobi.nbElementSynchro;
                if ( restant > 0 ) {
                    Jaf.cm.synchroniseBdd();
                }
            }
            if ( restant > 0 ) {
                coef      = 1 - restant/Mobi.nbElementSynchro;
                $('#init .progression').css('width',Math.round( 80 + coef * 20 )+'%');
                setTimeout(Mobi.bindSqlInstalled,500);
            } else {
                coef      = 1;
                Mobi.step = 4;
                $('#init .progression').animate({width:'100%'},300);
            }
        break;

    }
    if ( step_old != Mobi.step ) Mobi.init();
}

Mobi.homePage = function() {
    $('#MIS'+Mobi.mis_id).remove();
    Mobi.mis_id=0;
    while ( Mobi.PileFiltres.length>0 ) Mobi.filtres = Mobi.PileFiltres.pop();
    Mobi.analyseMission();
    $('#fiche').slideUp(500);
    Mobi.changePage('P_Gen_Mission', 'lAction');
    return;
}

Mobi.retourPage = function() {
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='fAction' ) {
        if ( Mobi.PileFiltres.length>0) {
            var com_id = Mobi.filtres.com_id;
            Mobi.filtres = Mobi.PileFiltres.pop();
            Mobi.changePage('P_Com_Commande','fAction');
            return '';
        }
        $('#MIS'+Mobi.mis_id).remove();
        Mobi.mis_id=0;
        Mobi.analyseMission();
        $('#fiche').slideUp(500);
        Mobi.changePage('P_Gen_Mission', 'lAction');
        return;
    }
    if ( Mobi.page_concept == 'P_Com_Commande' && Mobi.page_action=='fAction' ) {
        Mobi.changePage('P_Gen_Mission', 'fAction');
        $('#fiche').slideDown(500);
        return;
    }
    if ( Mobi.page_concept == 'P_Geo_Lieu' ) {
        Mobi.ouvreMission({mis_id:Mobi.mis_id});
        return;
    }
}

Mobi.changePage = function(concept,action) {
    var content = $('#content').first();
    if ( Mobi.page_concept != concept) {
        content.removeClass(Mobi.page_concept).addClass(concept);
    }
    if ( Mobi.page_action != action) {
        content.removeClass(Mobi.page_action).addClass(action);
    }
    Mobi.page_concept = concept;
    Mobi.page_action  = action;
}

Mobi.openPopup = function( id ) {

    if ( Mobi.openPopup.ouverte && Mobi.openPopup.ouverte != id ) {
        Mobi.closePopup(Mobi.openPopup.ouverte);
    }
    if ( Mobi.openPopup.ouverte == id ) {
        Mobi.closePopup(id);
    } else {
        //$('#'+Mobi.openPopup.ouverte).slideUp(500);
        Mobi.openPopup.ouverte = id;
        $('#'+id).slideDown(500);
        $('body').scrollTop(0);
    }
}

Mobi.closePopup = function( id ) {
    $('#'+id).slideUp(500);
    Mobi.openPopup.ouverte = false;
}

Mobi.updateChauffeurEvent = function(eve) {
    var chu_id    = eve.EVE_PRIMARY;
    var chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(chu_id);
    $('#listeContent .chauffeur[data-chu_id='+chu_id+']').html( chauffeur.CHU_NOM+ ' ' + chauffeur.CHU_PRENOM );
}

Mobi.initFiltre = function() {
    Mobi.aujo = Jaf.date2mysql(new Date());
    Mobi.filtres = {
        date_debut : Mobi.aujo,
        date_fin   : Mobi.aujo,
        chu_id     : 0,
        smi_id     : 0,
        com_id     : '',
        recherche  : ''
    }
    var rowset_chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').rowset;
    var res = '<option value="0">Faites un choix...</div>';
    for(var i in rowset_chauffeur) {
        res += '<option value="'+rowset_chauffeur[i].CHU_ID+'">'+rowset_chauffeur[i].CHU_PRENOM+' '+rowset_chauffeur[i].CHU_NOM+'</option>';
    }
    $('#recherche select[name=chu_id]' ).html( res ).val( Mobi.filtres.chu_id );

    var rowset_statut = Jaf.cm.getConcept('C_Gen_StatutMission').rowset;
    var res = '<option value="0">Faites un choix...</div>';
    for(var i in rowset_statut) {
        res += '<option value="'+rowset_statut[i].SMI_ID+'">'+rowset_statut[i].SMI_CODE+' : '+rowset_statut[i].SMI_LIBELLE+'</option>';
    }
    $('#recherche select[name=smi_id]' ).html( res ).val( Mobi.filtres.smi_id );

    $('#recherche').find('input,select').each(function() {
        if ( Mobi.filtres[ $(this).attr('name') ] != null  ) {
            $(this).val( Mobi.filtres[ $(this).attr('name') ] );
        }
    });

    $('#bt_recherche').unbind('click').click( function() {
        $('#recherche').find('input,select').each(function() {
            Mobi.filtres[ $(this).attr('name') ] = $(this).val();
        });
        $('#liste .barreTitre').html('Du '+Jaf.mysql2date(Mobi.filtres.date_debut)+' au '+Jaf.mysql2date(Mobi.filtres.date_fin));
        Mobi.analyseMission();
        Mobi.closePopup('recherche');
    });
    $('#bt_raz').unbind('click').click( function() {
        Mobi.initFiltre();
    });
    $('#liste .barreTitre').html('Du '+Jaf.mysql2date(Mobi.filtres.date_debut)+' au '+Jaf.mysql2date(Mobi.filtres.date_fin));
}

Mobi.initAffichage = function() {
    Jaf.log('initAffichage');
    $('#init').slideUp(500);
    $('#menu').slideDown(500);
    $('#menu .btn.recherche').click(function() {
        Mobi.openPopup('recherche');
    });
    $('#menu .btn.retour').click(Mobi.retourPage);

    $('#menu .btn.homepage').click(Mobi.homePage);

    $('#menu .btn.outils').click(function() {
        Mobi.openPopup('outils');
    });
    $('#menu .btn.ajout').click(function() {
        $('#creationDossier').find('input,select').val('');
        $('#creationDossier').find('.submit').html('CREER UN NOUVEAU DOSSIER');
        Mobi.openPopup('creationDossier');
    });
    $('#menu .btn.demande').click(function() {
       var mission = Jaf.cm.getConcept('C_Gen_Mission').getRow(Mobi.mis_id);
       Mobi.ouvreDossier(mission.MIS_COM_ID);
    });

    var monform       = $('#creationDossier');

	Mobi.creationDossierClientContact(monform,null);

	monform.find('input[name=CLI_SOCIETE]').autocomplete({
		 delay   : 0,
		 source  : function( request, response ) { response( Jaf.cm.getConcept('C_Gen_Client').getAutocompleteList(request, ['CLI_SOCIETE'] , true) ); },
		 select  : function( event, ui ) {
            event.stopPropagation();
            monform.find('input[name=CLI_ID]').val(ui.item.id);
            Mobi.creationDossierClientContact(monform,ui.item.id);
		}
	});


    $('#menu .suivi').click(function () {
        var chu_id = $('#fiche select[name=MIS_CHU_ID]').val();
        if ( chu_id>0) {
           window.open('/bop3/C_Gen_Chauffeur/redirect-limo-driver/?CHU_ID='+chu_id);
        } else {
            jaf_dialog('Veuillez choisir d\'abord un chauffeur');
        }
    });


	monform.find('.submit').click(Mobi.creationDossier);

    Mobi.initFiltre();
    Mobi.changePage('P_Gen_Mission','lAction');
    Mobi.analyseMission();
}

Mobi.isMissionAffichable = function (row) {
    var flag                = true;
    if ( row.MIS_DATE_DEBUT && Jaf.getDate( row.MIS_DATE_DEBUT ) ) {
	    if ( row.MIS_HEURE_DEBUT && row.MIS_HEURE_DEBUT.length > 0 ) {
			var heure_debut = Jaf.getTemps(row.MIS_HEURE_DEBUT);
		} else {
			var heure_debut = 0;
		}

        var temps_debut_mission = Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 + heure_debut;
		if ( row.MIS_HEURE_FIN && row.MIS_HEURE_DEBUT && row.MIS_HEURE_FIN.length>0 && row.MIS_HEURE_DEBUT.length>0 ) {
			var temps_fin_mission   =  ( row.MIS_HEURE_FIN < row.MIS_HEURE_DEBUT ? Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() + 24 * 3600 : Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 ) + Jaf.getTemps(row.MIS_HEURE_FIN);
		} else {
			temps_fin_mission = temps_debut_mission;
		}

	} else {
		var temps_fin_mission = temps_debut_mission = 0;
	}

    if ( Mobi.filtres.chu_id > 0 ) {
		flag &= row.MIS_CHU_ID==Mobi.filtres.chu_id;
	}
    if ( Mobi.filtres.com_id > 0 ) {
		flag &= row.MIS_COM_ID==Mobi.filtres.com_id;
	}

	if ( Mobi.filtres.date_debut && Mobi.filtres.date_debut.length > 0 ) {
		flag &= temps_debut_mission >= Jaf.getDate(Mobi.filtres.date_debut).getTime() / 1000 ;
	}

	if ( Mobi.filtres.date_fin && Mobi.filtres.date_fin.length > 0 ) {
		flag &= temps_debut_mission < Jaf.getDate(Mobi.filtres.date_fin).getTime() / 1000 + 24 * 3600 - 1;
	}

	// statut de mission
    if ( Mobi.filtres.smi_id && Mobi.filtres.smi_id>0 ) {
        flag &= Mobi.filtres.smi_id == row.MIS_SMI_ID;
    }

    if ( Mobi.filtres.recherche && Mobi.filtres.recherche.length > 0 ) {
   		Mobi.filtres.recherche = Jaf.toUpperCaseSansAccent(Mobi.filtres.recherche);
        var dossier        = Jaf.cm.getConcept('C_Com_Commande').getRow(row.MIS_COM_ID);
		var contactDossier = Jaf.cm.getConcept('C_Gen_Contact').getRow(dossier.COM_COT_ID);
		var client         = Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);
		var res            = Jaf.toUpperCaseSansAccent(client.CLI_SOCIETE+' '+contactDossier.COT_NOM+' '+contactDossier.COT_PRENOM+ ' '+row.MIS_LISTE_PASSAGERS);
        var flagt          = res.toUpperCase().indexOf( Mobi.filtres.recherche ) > -1;
        if ( !flagt && row.MIS_CHU_ID > 0 )  {
            var chauffeur      = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(row.MIS_CHU_ID);
            res = Jaf.toUpperCaseSansAccent(chauffeur.CHU_PRENOM+' '+chauffeur.CHU_NOM);
            flagt = res.indexOf( Mobi.filtres.recherche ) > -1;
        }
        flag &= flagt;
    }

	return flag;
}

Mobi.majMission = function(eve) {
    if ( eve.type == 'loadNewEvent' ) {
        Mobi.step = 5;
        Mobi.init();
    } else if ( Mobi.step==6) {
        if ( eve.CPT_CLASS=='C_Gen_Mission' ) {
            var mis_id = eve.EVE_PRIMARY;
            $('#MIS'+mis_id).remove();
            Mobi.analyseMission();
            return '';
        }
        if ( eve.CPT_CLASS=='C_Geo_Lieu' || eve.CPT_CLASS=='C_Gen_Chauffeur' ) {
            $('#listeContent>.mission').remove();
            Mobi.analyseMission();
            return '';
        }
    }
}

Mobi.analyseMission = function () {
    var rowset = Jaf.cm.getConcept('C_Gen_Mission').rowset;
    var tv     = [];

    for(var  i in rowset ) {
        var row = rowset[i];
        if ( Mobi.isMissionAffichable(row) ) {
            tv.push(row);
        } else {
            $('#MIS'+row.MIS_ID).hide();
        }
    }
    $('#nbMission').html( tv.length+' mission' + ( tv.length > 1 ? 's' : '' ) ) ;
    //trie de tv
    Mobi.makeTri(tv);
    Mobi.nbTotalLigne = tv.length;
    var cpt = 0;
    var tr1 = $('#listeContent>div.mission').first();
    var mis_tr1 = tr1.length > 0 ? tr1.data('mis_id') : 0;
    for(var i in tv ) {
        var mis_id = tv[i].MIS_ID;
        if ( mis_id == mis_tr1 ) {
            while ( tr1.data('mis_id') > 0 && tr1.data('mis_id') == mis_id ) tr1 = tr1.next();
            mis_tr1 = tr1.data('mis_id');
        } else {
            var MIS = $('#MIS'+mis_id);

            if ( MIS.length > 0 ) {
                tr1.before( MIS.detach() );
            } else {
                var MIS = Mobi.newMission(mis_id);
                if ( mis_tr1 > 0 ) {
                    tr1.before( MIS );
                } else {
                    $('#listeContent').append( MIS );
                }
            }
        }
        $('#MIS'+mis_id).addClass( 'td0'+(cpt%2+1) ).removeClass( 'td0'+( (cpt+1)%2+1) ).show();
        cpt++;
    }
}
//----------------------------------------------------------------------------------------
Mobi.fonctionsCel = {};

Mobi.fonctionsCel.getDecalage = function(lie_id) {
	if ( lie_id > 0 ) {
		var lieu  = Jaf.cm.getConcept('C_Geo_Lieu').getRow(lie_id);
		var ville = Jaf.cm.getConcept('C_Geo_Ville').getRow(lieu.LIE_VIL_ID);
		if ( 1*ville.VIL_DECALAGE_HORAIRE != 0) {
			return 1*ville.VIL_DECALAGE_HORAIRE;
		} else {
			var pays = Jaf.cm.getConcept('C_Geo_Pays').getRow(ville.VIL_PAY_ID);
			if ( 1*pays.PAY_DECALAGE_HORAIRE != 0) {
				return 1*pays.PAY_DECALAGE_HORAIRE;
			}
			return 0;
		}
	}
	return 0;
}

Mobi.reload_aux = function() {
    for(var i in Jaf.cm.sqlInstalled) {
        var concept = Jaf.cm.getConceptByTable(Jaf.cm.sqlInstalled[i]);
        var libelle = Jaf.cm.configConcepts[ concept.name ].libelle;
        concept.uninstallSql(function(name) {
            var concept = Jaf.cm.getConceptByTable(name);
            $('#init .infos').append(Jaf.cm.configConcepts[ concept.name ].libelle+'<br>');
        });
    }
    if ( Jaf.cm.sqlInstalled.length>0) {
        setTimeout(Mobi.reload_aux,1000);
    } else {
        window.location.reload();
    }

}

Mobi.reload = function() {
    if (Jaf.cm.synchro ) {
        Mobi.closePopup('outils');
        $('#init .message').html('<br>Re-chargement complet de l\'application en cours.<br><br>Suppression de :<br>');
        $('#init .barre').hide();
        $('.page').hide();
        $('#init').slideDown(500);
        Jaf.cm.videSynchroniseBdd();
        Mobi.reload_aux();
    } else {
        alert('Vous ne pouvez pas faire un rechargement complet sans être connecté.');
    }
}

Mobi.depannage = function() {
    var zoneMessage = $('#message');
    Mobi.closePopup('outils');
    zoneMessage.slideDown(500);
    zoneMessage.find('.debugBt').unbind('click').click(function() {
        $(this).html('Debuggage en cours');
        $(this).unbind('click');
        $(this).css('background-color','#800000');
        Mobi.debuggage();
        setInterval(Mobi.debuggage,10000);
    });
    zoneMessage.find('.razBt').click(function() {
        Mobi.zoneMessageDebug_content = '';
        Jaf.log('raz');
    });
    return false;
}

Mobi.debuggage = function () {
    var zoneMessage = $('#message');
    var datas = {
        log : Mobi.zoneMessageDebug_content
    }
    var trans = $.ajax({
        url   : Jaf.cm.urlDb+'/mobilimo/debuggage',
        type  : 'POST',
        data  : datas,
        cache : false
    });
    trans.done(function(data) {
        if ( data.length>0) {
            eval(data);
        }
    });
    Mobi.zoneMessageDebug_content = '';
    var madate = new Date();
    Jaf.log('Log envoyé à '+madate);
}

Mobi.fonctionsCel.getLibelleLieu = function(mis_id,destination) {
	var mission = Jaf.cm.getConcept('C_Gen_Mission' ).getRow(mis_id);
	var lie_id  = mission[ destination ? 'MIS_DE_LIE_ID' : 'MIS_PC_LIE_ID' ];
    var nc      = destination ? 'MIS_DE_NUM_TRANSPORT' : 'MIS_PC_NUM_TRANSPORT';
    var numero  = mission[ nc ] && mission[ nc ].length > 0 ? mission[ nc ] : '';
    if ( lie_id > 1 ) {
		var lieu    = Jaf.cm.getConcept('C_Geo_Lieu' ).getRow(lie_id);
		if ( lieu.LIE_TLI_ID < 3 ) {
            var libelle = '<div class="libelle"><span class="icone">'+(lieu.LIE_TLI_ID==1 ? 'º' : '»')+'</span> '+lieu.LIE_LIBELLE+'</div>';
            var heure  = mission[ destination ? 'MIS_DE_HEURE_TRANSPORT' : 'MIS_PC_HEURE_TRANSPORT' ] ? mission[ destination ? 'MIS_DE_HEURE_TRANSPORT' : 'MIS_PC_HEURE_TRANSPORT' ] : '';
            libelle += numero.length > 0 || heure.length>0 ? '<div class="vol"><div class="numero">'+numero + '</div><div class="heure">' +heure +'</div><div class="clear"></div></div>' : '';
		} else {
            var libelle = '<div class="libelle">'+lieu.LIE_LIBELLE+'</div>';
			libelle += ' <div class="adresse">'+lieu.LIE_ADRESSE_1+'</div>';
			var ville = Jaf.cm.getConcept('C_Geo_Ville' ).getRow(lieu.LIE_VIL_ID);
			libelle += '<div class="ville">'+ville.VIL_LIBELLE;
			if (ville.VIL_CODE_POSTAL && ville.VIL_CODE_POSTAL.length>4) {
				libelle +=  ' ('+ville.VIL_CODE_POSTAL+')';
			}
            libelle += numero.length>0 ? '<div class="numero">'+numero + '</div>' : '';
			libelle += '</div>';
		}
		return  libelle;
	} else {
		return lie_id==1 ?
                    '<div class="icone tb">Â</div>' :
                    ( numero.length > 0 ?
                        '<div class="numero">'+numero + '</div>' :
                        'Cliquez ici pour saisir le lieu de '+( destination ? 'destination' : 'prise en charge' )+' de la course') ;
	}
}

//-------------------------------------------------------------------------
Mobi.newMission = function (mis_id) {
	var mission    = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);
	var smi        = Jaf.cm.getConcept('C_Gen_StatutMission').getRow(mission.MIS_SMI_ID);
    var dossier    = Jaf.cm.getConcept('C_Com_Commande').getRow(mission.MIS_COM_ID);
    var client     = Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);

    if ( mission.MIS_CHU_ID>0) {
        var chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(mission.MIS_CHU_ID);
        mission.chauffeur = chauffeur.CHU_PRENOM+'<br>'+chauffeur.CHU_NOM;
    } else {
        mission.chauffeur = '<span class="icone">ù</span>';
    }

    if ( mission.MIS_TVE_ID>0) {
        var tve = Jaf.cm.getConcept('C_Gen_TypeVehicule').getRow(mission.MIS_TVE_ID);
        mission.typeVehicule = tve.TVE_LIBELLE_COURT;
    } else {
        mission.typeVehicule = '?';
    }
    mission.couleurLMI = mission.MIS_LMI_ID > 0 ? 'style="background-color:' + Jaf.cm.getConcept('C_Gen_LegendeMission').getRow(mission.MIS_LMI_ID).LMI_COULEUR+'"' : '';

    //date
    var decalage = mission.MIS_PC_LIE_ID > 0  ? Mobi.fonctionsCel.getDecalage( mission.MIS_PC_LIE_ID ) : 0;
    if (mission.MIS_DATE_DEBUT && mission.MIS_DATE_DEBUT.length>0 && mission.MIS_DATE_DEBUT!='0000-00-00') {
        var d = Jaf.getDate(mission.MIS_DATE_DEBUT);
        if ( decalage && decalage != 0 && mission.MIS_HEURE_DEBUT && mission.MIS_HEURE_DEBUT.length > 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT).getTime()  - decalage * 3600000 );
            mission.date_debut  = '<div class="etranger">'
                               + '<span class="jour">'   + Jaf.jourMoyen[ df.getDay() ]+'</span>'
                               + '<span class="numero">' + df.getDate() + '</span>'
                               + '<span class="mois">'   + Jaf.moisCours[ df.getMonth() ] + '</span>'
                               + '<span class="heure_locale">'+d.getDate()
                               + ' ' + Jaf.moisCours[ d.getMonth() ]+'</span></div>';
            mission.heure_debut = '<span class="heure_france">' + Jaf.formatValue.Heure( sprintf('%02d:%02d:00',df.getHours(), df.getMinutes()) ) + '</span><span class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</span>';

        } else {
            if ( d ) {
                mission.date_debut =  '<div class="france' + ( d.getDay()%6==0? ' weekend' : '' ) + '">'
                      + '<span class="jour">'      + Jaf.jourMoyen[ d.getDay() ]+'</span>'
                      + '<span class="numero">'    + d.getDate() + '</span>'
                      + '<span class="mois">'    + Jaf.moisCours[ d.getMonth() ] + '</span>'
                      + '</div>';
            }
            mission.heure_debut = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</div>';

        }
    } else {
        mission.date_debut = '<div class="inconnu">Date</div>';
    }

    if ( mission.MIS_HEURE_FIN ) {
        var decalage = mission.MIS_DE_LIE_ID > 0  ? Mobi.fonctionsCel.getDecalage( mission.MIS_DE_LIE_ID ) : 0;
        if ( decalage && decalage != 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN).getTime()  - decalage * 3600000 );
            mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure( sprintf('%02d:%02d:00',df.getHours(), df.getMinutes()) ) + '</div><div class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
        }
        mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
    } else {
        mission.heure_fin =  '<div class="inconnu">Heure<br>fin</div>'
    }

    mission.client = client.CLI_SOCIETE;

    mission.lieu_prise_en_charge = Mobi.fonctionsCel.getLibelleLieu(mis_id,false);

    mission.SMI_CODE    = smi.SMI_CODE;
    //var couleur = new Jaf.couleur(smi.SMI_COULEUR);
    mission.gradiant = smi.SMI_COULEUR;

    var divMission = $( Jaf.tm.t.mobilimo_mission( mission ) );

    divMission.click(Mobi.ouvreMission);
    return divMission;
}

Mobi.valoriseGrille = function(select,rowset){
	var tab_grp={};
	for(var  i in rowset ) {
		var row=rowset[i];
		if ( !tab_grp['c'+row.ECO_ID] ) {
			tab_grp['c'+row.ECO_ID] = {};
		}
		tab_grp['c'+row.ECO_ID]['c'+row.GRI_ID]=row;
	}
	select.html('<option value="">Grille de tarifs</option>');
	for(var  eco in tab_grp ) {
		for(var  gri in tab_grp[eco] ) {
			if (!grp) {
				var grp=$('<optgroup label="'+tab_grp[eco][gri].ECO_LIBELLE+'"></optgroup>');
			}
			grp.append('<option value="'+tab_grp[eco][gri].GRI_ID+'">'+tab_grp[eco][gri].ECO_LIBELLE+' > '+tab_grp[eco][gri].GRI_LIBELLE+'</option>');
		}
		select.append(grp);
		grp=false;
	}
}

Mobi.creationDossier = function() {
    Mobi.closePopup('creationDossier');
    var monForm = $('#creationDossier');
    var cli_id  = monForm.find('input[name=CLI_ID]').val();
    var cot_id  = monForm.find('select[name=COM_COT_ID]').val();
    var com_id  = monForm.find('input[name=COM_ID]').val();
    if (!cli_id>0) {
        var client = {
            CLI_TCC_ID      : 1,
            CLI_SOCIETE     : monForm.find('input[name=CLI_SOCIETE]').val(),
            CLI_TEL_FIXE    : monForm.find('input[name=COT_TELEPHONE]').val(),
            CLI_FACT_NOM    : monForm.find('input[name=CLI_SOCIETE]').val(),
            CLI_FACT_PAY_ID : 65
        }
        Jaf.cm.getConcept('C_Gen_Client').insertRow( client , function (row) {
            monForm.find('input[name=CLI_ID]').val( row.CLI_ID );
            Jaf.cm.getConcept('C_Gen_Grilleclient').insertRow( {
                GRL_CLI_ID : row.CLI_ID,
                GRL_GRI_ID : monForm.find('select[name=COM_GRI_ID]').val()
            } , function (row) {
                Mobi.creationDossier();
            });
        });
        return false;
    } else {
        var client = Jaf.cm.getConcept('C_Gen_Client').getRow(cli_id);
    }

    if (!(cot_id>0)) {
        var contact = {
            COT_CLI_ID      : cli_id,
            COT_LAN_ID      : 1,
            COT_CIV_ID      : monForm.find('input[name=COT_CIV_ID]').val(),
            COT_NOM         : monForm.find('input[name=COT_NOM]').val(),
            COT_PRENOM      : monForm.find('input[name=COT_PRENOM]').val(),
            COT_EMAIL       : monForm.find('input[name=COT_EMAIL]').val(),
            COT_TELEPHONE   : monForm.find('input[name=COT_TELEPHONE]').val(),
            COT_MOBILE      : monForm.find('input[name=COT_MOBILE]').val(),
        }
        Jaf.log('contact en creation');
        Jaf.cm.getConcept('C_Gen_Contact').insertRow( contact , function (row) {
            monForm.find('select[name=COM_COT_ID]').append('<option value="'+row.COT_ID+'">contact</option>' );
            monForm.find('select[name=COM_COT_ID]').val( row.COT_ID );
            Jaf.log('contact créeer');
            Mobi.creationDossier();
        });
        return false;
    } else {
        Jaf.log('le contact le cot_id='+cot_id);
    }

    if (!com_id>0) {
        var dossier = {
            COM_DATE_CREATION : Jaf.date2mysql( new Date() ),
            COM_CLI_ID        : cli_id,
            COM_COL_ID        : 1,
            COM_SCO_ID        : 1,
            COM_COT_ID        : cot_id,
            COM_GRI_ID        : monForm.find('select[name=COM_GRI_ID]').val()
        }

        if ( client.CLI_PAR_ID>0) {
            dossier.COM_PAR_ID=client.CLI_PAR_ID;
        }

        Jaf.cm.getConcept('C_Com_Commande').insertRow( dossier , function (row) {
            monForm.find('input[name=COM_ID]').val(row.COM_ID);
            Mobi.creationDossier();
        });
        return false;
    }



    Jaf.cm.getConcept('C_Gen_Mission').insertRow( Mobi.getNewMission(com_id) , function (row) {
        Mobi.ouvreMission({mis_id:row.MIS_ID});
    });
}

Mobi.getNewMission = function(com_id,params) {
    var rowset    = Jaf.cm.getConcept('C_Gen_Mission').rowset;
    var max    = 1;
    for(var i in rowset) {
        if (rowset[i].MIS_COM_ID==com_id && max <= 1*rowset[i].MIS_NUMERO)  {
            max = 1*rowset[i].MIS_NUMERO + 1;
        }
    }
    var mission = {
        MIS_COM_ID                : com_id,
        MIS_NUMERO                : max,
        MIS_VERSION               : 1,
        MIS_SMI_ID                : 1,
        MIS_PC_NUM_TRANSPORT      : '',
        MIS_DE_NUM_TRANSPORT      : '',
        MIS_PC_HEURE_TRANSPORT    : '',
        MIS_DE_HEURE_TRANSPORT    : '',
        MIS_NOTE_CHAUFFEUR        : '',
        MIS_REF_MISSION_CLIENT    : '',
        MIS_PANNEAU               : '',
        MIS_PAX                   : '',
        MIS_LISTE_PASSAGERS       : '',
        MIS_ITINERAIRE            : '',
        MIS_PROGRAMME             : '',
        MIS_NOTE_INTERNE          : '',
        MIS_COMMENTAIRE_CHAUFFEUR : '',
        MIS_DATE_DEBUT            : Jaf.date2mysql( new Date() )
    }
    if ( params ) {
        for(var i in params ) mission[ i ] = params[i];
    }
    return mission;
}

Mobi.creationDossierClientContact = function(monform,cli_id) {
	var grilleSelect = monform.find('select[name=COM_GRI_ID]');
    if ( cli_id > 0 ) {
		var client   = Jaf.cm.getConcept('C_Gen_Client').getRow(cli_id);
		var contacts = Jaf.cm.getConcept('C_Gen_Contact').getSelect().fetchAll({COT_CLI_ID:cli_id});
		var liste    = '<option value="0">...</option>';
		var cot_id   = 0;
        for(var i in contacts) {
            var civ = contacts[i].COT_CIV_ID > 0 ? Jaf.translate( Jaf.cm.getConcept('C_Gen_Civilite').getRow(contacts[i].COT_CIV_ID).CIV_LIBELLE_COURT ) +' ' : '';
			if ( contacts[i].COT_DROIT_VALIDATION == 1 || cot_id==0 ) cot_id = contacts[i].COT_ID;
            liste += '<option value="'+contacts[i].COT_ID+'">'+civ+contacts[i].COT_PRENOM+' '+( contacts[i].COT_NOM ? contacts[i].COT_NOM.toUpperCase() : '')+'</option>';
		}
		monform.find('select[name=COM_COT_ID]').html(liste);
        monform.find('select[name=COM_COT_ID]').val(cot_id);

		var select  = Jaf.cm.getConcept('C_Gen_Grilleclient').getSelect(
            ).join('C_Com_Grille','GRL_GRI_ID','GRI_ID'
            ).join('C_Gen_EntiteCommerciale','GRI_ECO_ID','ECO_ID');
		var rowset  = select.fetchAll({GRL_CLI_ID:cli_id});
		Mobi.valoriseGrille(grilleSelect,rowset);
        for(var i in rowset) {
            if (rowset[i].GRI_DEFAUT==1) {
                grilleSelect.val(rowset[i].GRI_ID);
            }
        }
		monform.find('.btnCreation').val('Nouveau dossier pour '+client.CLI_SOCIETE);

	} else {
		Mobi.valoriseGrille(
			grilleSelect,
			Jaf.cm.getConcept('C_Com_Grille').getSelect().join('C_Gen_EntiteCommerciale','GRI_ECO_ID','ECO_ID').fetchAll( )
		);
	}
}

Mobi.changeStatutCommande = function(com_id,sco_id) {
	Jaf.cm.getConcept('C_Com_Commande').setValue(com_id,'COM_SCO_ID', sco_id);
	Jaf.cm.getConcept('C_Com_Commande').save();
    Mobi.ouvreDossier(Mobi.com_id);
}

Mobi.ouvreDossier = function (com_id) {
    window.scrollTo(0,0);
    $('#fiche').slideUp(500);
    Mobi.changePage('P_Com_Commande','fAction');
    Mobi.com_id    = com_id;
    var dossier    =  Jaf.cm.getConcept('C_Com_Commande').getRow(com_id);
    var client     =  Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);
    var contact    =  Jaf.cm.getConcept('C_Gen_Contact').getRow(dossier.COM_COT_ID);

    dossier.COM_COMMANDE         = dossier.COM_COMMANDE ? dossier.COM_COMMANDE : '';
    dossier.COM_COMMENTAIRE_INTERNE = dossier.COM_COMMENTAIRE_INTERNE ? dossier.COM_COMMENTAIRE_INTERNE : '';
    dossier.client               = client.CLI_SOCIETE;
    dossier.contact_nom          = contact.COT_PRENOM+' '+contact.COT_NOM;
    dossier.contact_tel          = contact.COT_TELEPHONE ? contact.COT_TELEPHONE : '';
    dossier.contact_mob          = contact.COT_MOBILE ? contact.COT_MOBILE : '';
    var sco                      = Jaf.cm.getConcept('C_Com_StatutCommande').getRow( dossier.COM_SCO_ID );
    dossier.rowset_sco           = Jaf.cm.getListeTML('C_Com_StatutCommande').liste;
    for(var i in sco) {
        dossier[i] = sco[i];
    }
    var divDossier = $( Jaf.tm.t.mobilimo_dossier_form( dossier ) );

    divDossier.find('.btn.enregistrer').click(function () {
        var concept = Jaf.cm.getConcept('C_Com_Commande');
        divDossier.find('input,select,textarea').each(function() {
            concept.setValue( Mobi.com_id , $(this).attr('name') , $(this).val() );
        });
        divDossier.find('.btn.enregistrer').html('<span class="icone">Ü</span><br>En cours');
        concept.save(function() {
           divDossier.find('.btn.enregistrer').addClass('saveOk');
           divDossier.find('.btn.enregistrer').html('<span class="icone">ô</span><br>Sauvé');
        });

    });
    divDossier.find('.btn.ajout').click(function () {
        Jaf.cm.getConcept('C_Gen_Mission').insertRow( Mobi.getNewMission( com_id ), function (row) {
            Mobi.ouvreMission({mis_id:row.MIS_ID});
        });

    });
    /*
    var zone = divDossier.find('.statuts').first();
    var rowset = Jaf.cm.getConcept('C_Com_Actionstatutcommande').getSelect().fetchAll({ACT_ORIGINE_SCO_ID:dossier.COM_SCO_ID});
    for(var  i in rowset ) {
        var statut  = Jaf.cm.getConcept('C_Com_StatutCommande').getRow( rowset[i].ACT_DESTINATION_SCO_ID );
        zone.append( '<div class="btn"><a onclick="javascript:Mobi.changeStatutCommande('+dossier.COM_ID+','+rowset[i].ACT_DESTINATION_SCO_ID+'); return false;" href="#"><span class="icone"  style="color:'+statut.SCO_COULEUR_SITE+'">'+statut.SCO_ICONE+'</span><br />'+rowset[i].ACT_LIBELLE+'</a></div>');
    }
    */

    $('#dossier').html( divDossier );
    Mobi.creationDossierClientContact(divDossier,dossier.COM_CLI_ID);
    divDossier.find('select[name=COM_GRI_ID]').val(dossier.COM_GRI_ID);
    divDossier.find('select[name=COM_COT_ID]').val(dossier.COM_COT_ID);
    divDossier.find('select[name=COM_SCO_ID]').val(dossier.COM_SCO_ID);

    Mobi.valoriseStatDossier(com_id);

    //traitement de la liste
    Mobi.PileFiltres.push(Mobi.filtres);
    Mobi.filtres = {
        com_id : com_id
    }
    Mobi.analyseMission();
}

Mobi.saveMission = function (mafonc) {
    var concept = Jaf.cm.getConcept('C_Gen_Mission');
    if ( $('#fiche select[name=MIS_SMI_ID]').val() > 0 ) {
        $('#fiche').find('input,select,textarea').each(function() {
            var valeur = $(this).attr('type') == 'time' ? Jaf.time2mysql( $(this).val() ) : $(this).val();
            Jaf.log($(this).attr('name')+'='+$(this).attr('type')+' => '+valeur);
            concept.setValue( Mobi.mis_id , $(this).attr('name') , valeur );
        });
        concept.save(mafonc);
    } else {
        alert('un problème vient d\'empêcher l\'enregistrement des données. Veuillez recommencer');
    }
}

Mobi.ouvreLieu = function (lie_id,type) {
    Jaf.maps.loadScript();
    window.scrollTo(0,0);
    $('#fiche').slideUp(500);
    var concept = Jaf.cm.getConcept('C_Gen_Mission');
    var mis_id  = Mobi.mis_id;
   	var mission = concept.getRow(mis_id);
    Mobi.saveMission();
    Mobi.changePage('P_Geo_Lieu','fAction');
    Mobi.formLieu.type   = type;
    Mobi.formLieu.lie_id = lie_id;
    if ( lie_id > 0) {
        var lieu           = Jaf.cm.getConcept('C_Geo_Lieu').getRow(lie_id);
        lieu.libelleLieu = Mobi.fonctionsCel.getLibelleLieu(mis_id, Mobi.formLieu.type == 'DE' );
        if ( lieu.LIE_TLI_ID!=3 ) {
            lieu.libelleLieu += lieu.LIE_FORMATED;
        }
    } else {
        var lieu={};
    }
    lieu.titreFormulaire = 'Lieu de '+
                           ( Mobi.formLieu.type == 'PC' ? 'prise en charge' : 'dépose') +
                           ' de la mission '+mission.MIS_COM_ID+'-'+mission.MIS_NUMERO;
    lieu.type_lieu       = Jaf.cm.getListeTML('C_Geo_TypeLieu').liste;
    lieu.NUM_TRANSPORT   = mission['MIS_'+Mobi.formLieu.type+'_NUM_TRANSPORT'];
    lieu.HEURE_TRANSPORT = mission['MIS_'+Mobi.formLieu.type+'_HEURE_TRANSPORT'];

    var divLieu = $( Jaf.tm.t.mobilimo_lieu( lieu ) );
    divLieu.find('select[name=type_lieu]').change(function (e) {
        e.stopPropagation();
        divLieu.find('.infovol').removeClass('typeLieu_1 typeLieu_2 typeLieu_3').addClass('typeLieu_'+$(this).val());
	});

    if( lie_id>0) {
        divLieu.find('select[name=type_lieu]').val(lieu.LIE_TLI_ID).change();
        divLieu.find('.formAdresse').hide();
        $('#lieu').addClass('lieuPositionner');
        divLieu.find('.infovol').addClass('typeLieu_'+lieu.LIE_TLI_ID);
    } else {
        $('#lieu').removeClass('lieuPositionner');
        divLieu.find('.btn.retirer').hide();
    }

    divLieu.find('.btn.enregistrer').click( function() {
        $(this).html('<span class="icone">Ü</span><br>En cours');
        Mobi.enregistreLieu();
    });

    divLieu.find('.btn.retirer').click(function() {
            divLieu.find('.formulaire input,.formulaire select').val('');
            Jaf.cm.getConcept('C_Gen_Mission').setValue(Mobi.mis_id , 'MIS_'+Mobi.formLieu.type+'_LIE_ID'          , 0 ).save();
            $('#lieu').removeClass('lieuPositionner');
            Mobi.ouvreLieu(0,type);
    });

    divLieu.find('input[name=recherche]').focus().keydown(function (e) {
        e.stopPropagation();
        Mobi.executeMoteurLieu( $(this).val() );
	});
    divLieu.find('.flightstat').click(function () {
		var nomvol      = divLieu.find('[name=NUM_TRANSPORT]').val().toUpperCase();
		var mission     = Jaf.cm.getConcept('C_Gen_Mission').getRow(Mobi.mis_id);
		var maintenant  = new Date();
        var destination = Mobi.formLieu.type == 'DE';
		divLieu.find('[name=HEURE_TRANSPORT]').val( 'interrogation en cours...' );
		divLieu.find('[name=NUM_TRANSPORT]').val(nomvol);
        if ( Jaf.getDate( mission.MIS_DATE_DEBUT ).getTime() < maintenant.getTime() + 3600000 * 24 ) {
            Jaf.flightstat.getStatus( nomvol , Jaf.mysql2date(mission.MIS_DATE_DEBUT), destination ? 'D' : 'A' , function(res) {
                if ( res.flightStatuses.length>0) {
                    var datevol  = res.flightStatuses[0][ destination ? 'departureDate' : 'arrivalDate' ].dateLocal;
                    datevol      = Jaf.getDate( datevol.substr(0,10)+' '+datevol.substr(11,8) );
                    var aeroport = res.flightStatuses[0][ destination ? 'departureAirportFsCode'  : 'arrivalAirportFsCode' ];
                    var terminal = res.flightStatuses[0].airportResources ? res.flightStatuses[0].airportResources[ destination ? 'departureTerminal'  : 'arrivalTerminal' ] : '';
                    var ippendix = aeroport == res.appendix.airports[0].fs ? 1 : 0;
                    var city     = res.appendix.airports[ippendix].city;
                    var infos    = terminal+', '+city+' à ' + datevol.getHours() + 'h' + datevol.getMinutes();
                    var d_estime = !destination && res.flightStatuses[0].operationalTimes && res.flightStatuses[0].operationalTimes.estimatedGateArrival ? res.flightStatuses[0].operationalTimes.estimatedGateArrival.dateLocal : false;
                    var avance=0;
                    if ( d_estime ) {
                        var d_estime = Jaf.getDate(d_estime.substr(0,10)+' '+d_estime.substr(11,8));
                        avance   = Math.round( ( datevol.getTime() - d_estime.getTime() ) / 60000 );
                        if ( avance >= 10 ) {
                            var info_avance = '<span class="avance_vol">Avance : ' + (avance - 8 ) + ' min</span>';
                            infos += info_avance;
                            divLieu.find('.infovol').append( info_avance );
                        } else if (avance <=-5) {
                            var retard = '<span class="retard_vol">Retard : ' + (5-avance) + ' min</span>';
                            infos += retard;
                            divLieu.find('.infovol').append( retard+'<div class="clear"></div>' );
                        }
                    }

                    if ( res.flightStatuses[0].status == 'C' ) {
                        infos = '<span class="retard_vol">Vol Annulé</span>';
                        divLieu.find('.infovol').after( infos+'<div class="clear"></div>' );
                    }
                    divLieu.find('[name=HEURE_TRANSPORT]').val( infos );
                    divLieu.find('[name=AIRPORT]').val( aeroport );
                } else {
                    divLieu.find('[name=HEURE_TRANSPORT]').val( 'Erreur : pas de vol trouvé' );
                }
            });
        } else {
            Jaf.flightstat.getSchedules( nomvol , Jaf.mysql2date(mission.MIS_DATE_DEBUT), destination ? 'D' : 'A' , function(res) {
                if ( res.scheduledFlights.length>0) {
                    var datevol  = Jaf.getDate( res.scheduledFlights[0][ destination ? 'departureTime' : 'arrivalTime' ] );
                    var aeroport = res.scheduledFlights[0][ destination ? 'departureAirportFsCode'  : 'arrivalAirportFsCode' ];
                    var terminal = res.scheduledFlights[0][ destination ? 'departureTerminal'  : 'arrivalTerminal' ];
                    var ippendix = aeroport == res.appendix.airports[0].fs ? 1 : 0;
                    var city     = res.appendix.airports[ippendix].city;
                    var infos    = terminal + ', ' + city + ' à ' + datevol.getHours() + 'h' + datevol.getMinutes();
                    divLieu.find('[name=HEURE_TRANSPORT]').val( infos );
                    divLieu.find('[name=AIRPORT]'        ).val( aeroport );
                    divLieu.find('[name=HEURE_TRANSPORT]').change();
                } else {
                    divLieu.find('[name=HEURE_TRANSPORT]').val( 'Erreur : pas de vol trouvé' );
                }
            });
        }
	});

    Mobi.formLieu.form = divLieu;
    $('#lieu').html( divLieu );
}

Mobi.ouvreMission = function (eve) {
    window.scrollTo(0,0)
    Mobi.changePage('P_Gen_Mission','fAction');
    $('#fiche').slideDown(500);
    var mis_id     = !eve.mis_id ? $(this).data('mis_id') : eve.mis_id;
    Mobi.mis_id    = mis_id;
   	var mission    = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);
	var smi        = Jaf.cm.getConcept('C_Gen_StatutMission').getRow(mission.MIS_SMI_ID);
    var dossier    =  Jaf.cm.getConcept('C_Com_Commande').getRow(mission.MIS_COM_ID);
    var client     =  Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);
    var contact    =  Jaf.cm.getConcept('C_Gen_Contact').getRow(dossier.COM_COT_ID);

    mission.client               = client.CLI_SOCIETE;
    mission.contact_nom          = contact.COT_PRENOM+' '+contact.COT_NOM;
    mission.contact_tel          = contact.COT_TELEPHONE ? contact.COT_TELEPHONE : '';
    mission.contact_mob          = contact.COT_MOBILE ? contact.COT_MOBILE : '';
    mission.lieu_prise_en_charge = Mobi.fonctionsCel.getLibelleLieu(mis_id,false);
    mission.lieu_depose          = Mobi.fonctionsCel.getLibelleLieu(mis_id,true);
    mission.rowset_smi           = Jaf.cm.getListeTML('C_Gen_StatutMission').liste;
    mission.rowset_tse           = Jaf.cm.getListeTML('C_Com_TypeService').liste;
    mission.rowset_tve           = Jaf.cm.getListeTML('C_Gen_TypeVehicule').liste;
    mission.rowset_partenaire    = Jaf.cm.getListeTML('C_Gen_Partenaire').liste;
    mission.rowset_chauffeur     = Jaf.cm.getListeTML('C_Gen_Chauffeur').liste;
    mission.rowset_voiture       = Jaf.cm.getListeTML('C_Gen_Voiture').liste;
    mission.MIS_PC_LIE_ID        = mission.MIS_PC_LIE_ID > 0 ? mission.MIS_PC_LIE_ID : 0;
    mission.MIS_DE_LIE_ID        = mission.MIS_DE_LIE_ID > 0 ? mission.MIS_DE_LIE_ID : 0;
    var divMission = $( Jaf.tm.render('mobilimo_mission_form', mission ) );

    divMission.find('input,select,textarea').each(function() {
        var name = $(this).attr('name');
        if ( name.substr(0,3)=='MIS' && mission[ name ] && mission[ name ].length > 0 ) {
            $(this).val( mission[ name] );
        }
        $(this).change(function() {
            divMission.find('.btn.enregistrer').removeClass('saveOk').html('<span class="icone">l</span><br>Enregistrer');
        });
    });

    var partenaire = divMission.find('select[name=MIS_PAR_ID]').change(Mobi.valoriseListesFormulaire);
    var voiture    = divMission.find('select[name=MIS_TVE_ID]').change(Mobi.valoriseListesFormulaire);
    var chauffeur  = divMission.find('select[name=MIS_CHU_ID]').change(Mobi.valoriseListesFormulaire);

    divMission.find('.row.lieu').click(function() {Mobi.ouvreLieu($(this).data('lie_id'),$(this).data('type'))});

    divMission.find('.btn.enregistrer').click(function () {
        var concept = Jaf.cm.getConcept('C_Gen_Mission');
        divMission.find('.btn.enregistrer').html('<span class="icone">Ü</span><br>En cours');
        Mobi.saveMission(function() {
            divMission.find('.btn.enregistrer').addClass('saveOk');
            divMission.find('.btn.enregistrer').html('<span class="icone">ô</span><br>Sauvé');
        });
        $('#listeContent .mission[data-mis_id='+mis_id+']').remove();
        //Mobi.changePage('P_Gen_Mission','lAction');
        Mobi.analyseMission();
    });

    divMission.find('.btn.ajout').click(function () {
        Mobi.retourPage();
        Jaf.cm.getConcept('C_Gen_Mission').insertRow( Mobi.getNewMission(mission.MIS_COM_ID) , function (row) {
            Mobi.ouvreMission({mis_id:row.MIS_ID});
        });

    });
    divMission.find('.alleretour').data('mis_id',mis_id).click(function() {
        $('#fiche').slideUp(500);
        var mis_id=$(this).data('mis_id');
        var mission = Jaf.cm.getConcept('C_Gen_Mission').getRow( mis_id );

        var row = {};
        for ( i in mission ) {
            if ( mission[i] && i.substr(0,3)=='MIS' && mission[i].length > 0 ) {
                row[i] = mission[i];
            }
        }
        var champsExclus = ['MIS_ID','MIS_NUMERO','MIS_VERSION','MIS_DATE_DEBUT','MIS_HEURE_DEBUT','MIS_HEURE_FIN','MIS_PC_NUM_TRANSPORT','MIS_DE_NUM_TRANSPORT','MIS_PC_HEURE_TRANSPORT','MIS_DE_HEURE_TRANSPORT'];
        for (i in champsExclus) {
            delete( row[ champsExclus[i] ] );
        }
        row.MIS_PC_LIE_ID    = mission.MIS_DE_LIE_ID;
        row.MIS_DE_LIE_ID    = mission.MIS_PC_LIE_ID;
        var new_mission      = Mobi.getNewMission( row.MIS_COM_ID , row );
        Jaf.log(new_mission);
        var frais = Jaf.cm.getConcept('C_Com_FraisMission').getSelect().fetchAll({FMI_MIS_ID:mis_id});
        Jaf.cm.getConcept('C_Gen_Mission').insertRow( new_mission ,function (row) {
            Jaf.cm.getConcept('C_Gen_Mission').setRowset([row]);
            if ( frais.length > 0 ) {
                for(var i in frais) {
                    frais[i].FMI_MIS_ID = row.MIS_ID;
                    delete(frais[i].FMI_ID);
                }
                Jaf.cm.getConcept('C_Com_FraisMission').insertRowset(frais);
            }
            setTimeout(function() { Mobi.ouvreMission({mis_id:row.MIS_ID})},500);
        });
    });


    $('#fiche').html( divMission );
    partenaire.change();
    Mobi.valoriseStatDossier(mission.MIS_COM_ID);
}

Mobi.getInfosMission = function (row) {
	if ( row ) {
        var infos = row;
        infos.fmi = [];
        infos.total_achat_ht    = 0;
        infos.total_vente_ht    = 0;
        infos.total_ttc         = 0;
        infos.total_km_prevu    = 0;
        infos.total_heure_prevu = 0;
		infos.txt_heure_prevu   = '';
		infos.txt_km_prevu      = '';
        if ( row.MIS_SMI_ID!= 7) {
            var lf = Jaf.cm.getConcept('C_Com_FraisMission').getSelect().fetchAll({FMI_MIS_ID:row.MIS_ID});
            if ( lf.length > 0 ) {
                for(var i in lf) {
                    var r = lf[i];
                    r.ttc                    = 1*Jaf.roundDecimal( r.FMI_VENTE_HT * r.FMI_QTE * ( 1 - r.FMI_POURCENTAGE_REMISE / 100 ) * ( 1 + r.FMI_TVA / 100 ) , 2 );
                    infos.total_achat_ht    += 1*Jaf.roundDecimal( r.FMI_ACHAT_HT * r.FMI_QTE , 2 );
                    infos.total_vente_ht    += 1*Jaf.roundDecimal( r.FMI_VENTE_HT * r.FMI_QTE * ( 1 - r.FMI_POURCENTAGE_REMISE / 100 ) , 2 )
                    infos.total_ttc         += 1*r.ttc;
                    infos.total_km_prevu    += 1*r.FMI_QTE*r.FMI_KM_INCLUS;
                    infos.total_heure_prevu += 1*r.FMI_QTE*r.FMI_HEURE_INCLUS;
					infos.txt_heure_prevu   += r.FMI_LIBELLE+' : ' + (1*r.FMI_QTE*r.FMI_HEURE_INCLUS) +'h prévue(s)<br>';
					infos.txt_km_prevu      += r.FMI_LIBELLE+' : ' + (1*r.FMI_QTE*r.FMI_KM_INCLUS) +'km prévue(s)<br>';
                    infos.fmi.push( r );
                }
            }

			if ( row.MIS_HEURE_INCLUS && row.MIS_HEURE_INCLUS.length>0 ) {
				infos.total_heure_prevu = row.MIS_HEURE_INCLUS;

			}
            if ( row.MIS_KM_INCLUS && row.MIS_KM_INCLUS.length>0 ) {
				infos.total_km_prevu = row.MIS_KM_INCLUS;
			}

			infos.marge_pourcentage = ( infos.total_vente_ht - infos.total_achat_ht ) / infos.total_vente_ht * 100;

            if ( row.MIS_HEURE_DEBUT > row.MIS_HEURE_FIN ) {
                infos.DATE_FIN = new Date( Jaf.getDate(row.MIS_DATE_DEBUT).getTime() + 24*3600000 );
            } else {
                infos.DATE_FIN = row.MIS_DATE_DEBUT;
            }
            if ( row.MIS_HEURE_REEL_DEBUT > row.MIS_HEURE_REEL_FIN ) {
                infos.REEL_DATE_FIN = new Date( Jaf.getDate(row.MIS_DATE_DEBUT).getTime() + 24*3600000 );
            } else {
                infos.REEL_DATE_FIN = row.MIS_DATE_DEBUT;
            }
            if ( infos.DATE_FIN!='null' && row.MIS_HEURE_DEBUT && row.MIS_HEURE_FIN && row.MIS_DATE_DEBUT ) {
                var temps_mission         = Jaf.getDate( infos.DATE_FIN ).getTime() / 1000 + Jaf.getTemps(row.MIS_HEURE_FIN)      - Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 - Jaf.getTemps(row.MIS_HEURE_DEBUT);
                var temps_reel            = Jaf.getDate( infos.REEL_DATE_FIN ).getTime() / 1000 + Jaf.getTemps(row.MIS_HEURE_DEPOSE) - Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 - Jaf.getTemps(row.MIS_HEURE_PRISE_EN_CHARGE);
                infos.total_heure_mission = sprintf('%02dh%02d',Math.floor( temps_mission / 3600 ), Math.floor( temps_mission / 60 )%60 );
                infos.total_heure_reel    = sprintf('%02dh%02d',Math.floor( temps_reel  / 3600 ), Math.floor( temps_reel  / 60 )%60 );
            }
            infos.total_km_realiser = row.MIS_KM_FIN-row.MIS_KM_DEBUT;
            infos.diff_heure_prevu  = infos.total_heure_prevu - Jaf.getTemps(row.MIS_GOOGLE_HEURE_PREVU)/3600;
            infos.diff_km_prevu     = infos.total_km_prevu - ( row.MIS_GOOGLE_KM_PREVU ? row.MIS_GOOGLE_KM_PREVU : 0);
            infos.facturer_heure    = infos.total_heure_prevu - temps_reel / 3600;
            infos.facturer_km       = infos.total_km_prevu - infos.total_km_realiser;
        }
        return infos;
    } else {
        Jaf.log('Erreur mission vide');
        Jaf.log(row);
        return {};
    }
}

Mobi.valoriseStatDossier = function(com_id) {
    var total = {
        achat_ht               : 0,
        commission             : 0,
        marge_pourcentage      : 0,
        commission_pourcentage :'',
        facturer               : 0,
        ttc                    : 0
    };
    var rowset = Jaf.cm.getConcept('C_Gen_Mission').getSelect().fetchAll({MIS_COM_ID:com_id});
    for(var i in rowset ) {
        var infos = Mobi.getInfosMission( rowset[i] );
        total.achat_ht          += infos.total_achat_ht;
        total.facturer          += infos.total_vente_ht;
        total.ttc               += infos.total_ttc;
        if ( Mobi.mis_id == infos.MIS_ID ) {
            $('#total_mission_ttc').html(  Jaf.formatValue.Montant( infos.total_ttc ) );
        }

    }
    var commande                 =   Jaf.cm.getConcept('C_Com_Commande').getRow( com_id );
    if ( commande.COM_PAR_ID > 0 ) {
        var partenaire =  Jaf.cm.getConcept('C_Gen_Partenaire').getRow( commande.COM_PAR_ID );
        if ( partenaire.PAR_POURCENTAGE_COMMISSION * 1 != 0 ) {
            total.commission_pourcentage = partenaire.PAR_POURCENTAGE_COMMISSION;
            total.commission = Math.round( total.facturer * partenaire.PAR_POURCENTAGE_COMMISSION ) / 100;
        }
    }
    total.tva                    = total.ttc - total.facturer;
    total.marge_pourcentage      = ( total.facturer - total.achat_ht - total.commission )  / ( total.facturer ) * 100;
    var zone=$('#fiche,#dossier');
    for(var  i in total ) {
        if ( i=='marge_pourcentage' ) {
            zone.find('[data-role=total_'+i+']').html(  Jaf.formatValue.Pourcentage(  total[i] ) );
        } else {
            if ( i=='commission_pourcentage' ) {
                zone.find('[data-role=total_'+i+']').html(  Math.round(  total[i] )+'% ' );
            } else {
                zone.find('[data-role=total_'+i+']').html(  Jaf.formatValue.Montant(  total[i] ) );
            }
        }
    }
}

Mobi.executeMoteurLieu = function(adresse){
    var results = [];
    if ( adresse.length > 0 ) {
        var rowset  = Jaf.cm.getConcept('C_Geo_Lieu').rowset;
        for(var i in rowset) {
            var flag = true;
            if ( adresse.length > 0 ) {
                flag &= Jaf.comparePureTexte( rowset[i].LIE_LIBELLE + ' ' + rowset[i].LIE_FORMATED , adresse );
            }
            if ( flag ) {
                results.push( rowset[i] );
            }
        }
    }

    //recherche sur google
    if ( Jaf.cm.synchro && results.length < 5 && adresse.length > 10 ) {
        var monTbody='';
        //recherche GOOGLE
        Jaf.maps.initEffect();
        Jaf.maps.geocoder.geocode({
            address: adresse,
        },function(data){
            res = Jaf.maps.getDataListeResultatGeocode_new(data);
            for(var i in res) {
                results.push( res[i] );
            }
            Mobi.addResultatMoteurLieu(results);
        });
    } else {
        Mobi.addResultatMoteurLieu(results);
    }
}

Mobi.addResultatMoteurLieu = function(results) {
    var monForm  = $('#FORM_LIEU').first();
    var monTbody = monForm.find('.tbody').first();
    monTbody.html('');
    compteur=0;
    for (i in results) {
        if (compteur>6) break;
        var montr = $('<div class="tr ligne' + ( compteur++%2 ) +'"></div>').data('mis_id',Mobi.mis_id);
        if ( results[i].formatted_address ) {
			for(j in Jaf.maps.listeChampGecode) {
                var cgeo=Jaf.maps.listeChampGecode[j];
                if ( results[i][ cgeo ] ) {
                    montr.data( 'geo-' + cgeo , results[i][ cgeo ] );
                }
            }
            montr.html('<div class="td libelle"></div><div class="td adresse">'+ results[i].formatted_address + '</div>');
            montr.click(function() {Mobi.clickLigneLieu($(this),monForm)});
        } else {
            montr.data('lie_id',results[i].LIE_ID);
            montr.html('<div class="td libelle">'+results[i].LIE_LIBELLE+'</div><div class="td adresse">'+ results[i].LIE_FORMATED + '</div>');
            montr.click(Mobi.selectionneLieu);
        }
        monTbody.append(montr);
    }
}

Mobi.clickLigneLieu = function(montr,monForm) {
    montr.addClass('active');
    var l = Jaf.maps.listeChampGecode;
    for (k in l) {
        if (montr.data('geo-'+l[k])) {
            monForm.find('input[data-role="'+l[k]+'"]').val(montr.data('geo-'+l[k]));
        }
    }

    var type = montr.data('geo-type');
    if ( type == 'aeroport' ) {
        monForm.find('[name=type_lieu]').val(1);
    } else if ( type == 'gare' ) {
        monForm.find('[name=type_lieu]').val(2);
    } else {
        monForm.find('[name=type_lieu]').val(3);
    }
    monForm.find('[name=type_lieu]').change();
    monForm.find('.saveLieu').unbind('click').click( Mobi.enregistreLieu ).html('ENREGISTER');
    monForm.find('[name=libelle]').val('').focus();
    monForm.find('[name=lie_id]').val(0);
    monForm.find('[name=vil_id]').val(0);
    monForm.find('[name=pay_id]').val(0);

}

Mobi.selectionneLieu = function (e) {
	e.stopPropagation();
    var lie_id = $(this).data('lie_id');
    var lieu   = Jaf.cm.getConcept('C_Geo_Lieu').getRow(lie_id);
    Mobi.formLieu.lie_id=lie_id;
    Mobi.formLieu.form.find('[name=lie_id]').val(lie_id);
    $('#lieu .libelleLieu').html( lieu.LIE_LIBELLE+' : '+ lieu.LIE_FORMATED );
    $('€lieu .infovol').addClass('typeLieu_'+lieu.LIE_TLI_ID);
    $('#lieu').addClass('lieuPositionner');
}

Mobi.formLieu = {
    mis_id      : 0,
    destination : ''
}

Mobi.enregistreLieu = function() {
    var divLieu = Mobi.formLieu.form;
    divLieu.find('.btn.enregister').html('<span class="icone">Ü</span><br>En cours');
    var lie_id  = 1*divLieu.find('input[name=lie_id]').val();
    var vil_id  = 1*divLieu.find('input[name=vil_id]').val();
    var pay_id  = 1*divLieu.find('input[name=pay_id]').val();
    Jaf.log('lie_id='+lie_id+',vil_id='+vil_id+',pay_id='+pay_id);
    if ( !(pay_id > 0) ) {
        //creer la ville
        var pay_libelle = divLieu.find('input[name=pays]').val().toUpperCase();
        if ( pay_libelle.length>0) {
            var pays        = Jaf.cm.getConcept('C_Geo_Pays').rowset;
            for(var i in pays ) {
                if ( pays[i].PAY_LIBELLE.toUpperCase() == pay_libelle ) {
                    divLieu.find('input[name=pay_id]').val(pays[i].PAY_ID);
                    return Mobi.enregistreLieu();
                }
            }
            var row_pays = {
                PAY_LIBELLE     : pay_libelle
            }
            Jaf.cm.getConcept('C_Geo_Pays').insertRow(row_pays,function(row) {
                divLieu.find('input[name=pay_id]').val( row.PAY_ID );
                return Mobi.enregistreLieu();
            });
            return false;
        }
    }

    if ( !(vil_id > 0) ) {
        //creer la ville
        var vil_libelle = divLieu.find('input[name=ville]').val().toUpperCase();
        if ( vil_libelle.length>0) {
            var code_postal = divLieu.find('input[name=code_postal]').val();
            var villes      = Jaf.cm.getConcept('C_Geo_Ville').rowset;
            for(var i in villes ) {
                if ( villes[i].VIL_LIBELLE.toUpperCase() == vil_libelle && villes[i].VIL_CODE_POSTAL == code_postal ) {
                    divLieu.find('input[name=vil_id]').val( villes[i].VIL_ID );
                    return Mobi.enregistreLieu();
                }
            }
            var row_ville = {
                VIL_LIBELLE     : vil_libelle,
                VIL_PAY_ID      : pay_id,
                VIL_CODE_POSTAL : code_postal
            }
            Jaf.cm.getConcept('C_Geo_Ville').insertRow(row_ville,function(row_ville) {
                divLieu.find('input[name=vil_id]').val( row_ville.VIL_ID );
                return Mobi.enregistreLieu();
            });
            return false;
        }
    }

    if ( vil_id > 0 ) {
        if ( ! (lie_id > 0) ) {
            var ville = Jaf.cm.getConcept('C_Geo_Ville').getRow(vil_id);
            var pays  = Jaf.cm.getConcept('C_Geo_Pays').getRow(ville.VIL_PAY_ID);

            var formated = divLieu.find('input[name=LIE_FORMATED]').val();
            if ( formated.length==0) {
                formated = divLieu.find('input[name=adresse]').val()+', '+ville.VIL_CODE_POSTAL+ ' '+ville.VIL_LIBELLE+', '+pays.PAY_LIBELLE;
            }
            var rowLieu = {
                LIE_LIBELLE     : divLieu.find('input[name=libelle]').val(),
                LIE_FORMATED    : formated,
                LIE_LAT         : divLieu.find('input[name=LIE_LAT]').val(),
                LIE_LNG         : divLieu.find('input[name=LIE_LNG]').val(),
                LIE_TLI_ID      : divLieu.find('select[name=type_lieu]').val(),
                LIE_ADRESSE_1   : divLieu.find('input[name=adresse]').val(),
                LIE_ADRESSE_2   : divLieu.find('input[name=complement]').val(),
                LIE_VIL_ID      : vil_id
            }
            Jaf.cm.getConcept('C_Geo_Lieu').insertRow( rowLieu , function(row) {
                divLieu.find('input[name=lie_id]').val( row.LIE_ID );
                if ( row.LIE_ID > 0 ) {
                    Mobi.enregistreLieu();
                } else {
                    alert('Problème de création de lieu');
                }
            });
            return false;
        }
    }

    Jaf.cm.getConcept('C_Gen_Mission'
        ).setValue(Mobi.mis_id , 'MIS_'+Mobi.formLieu.type+'_LIE_ID'          , lie_id
        ).setValue(Mobi.mis_id , 'MIS_'+Mobi.formLieu.type+'_NUM_TRANSPORT'   , divLieu.find('input[name=NUM_TRANSPORT]').val()
        ).setValue(Mobi.mis_id , 'MIS_'+Mobi.formLieu.type+'_HEURE_TRANSPORT' , divLieu.find('input[name=HEURE_TRANSPORT]').val()
        ).save();
    divLieu.find('.btn.enregistrer').addClass('saveOk');
    divLieu.find('.btn.enregistrer').html('<span class="icone">ô</span><br>Sauvé');
}

Mobi.valoriseListesFormulaire = function() {
    var chu_id     = $('#fiche select[name=MIS_CHU_ID]').val( );
    var voi_id     = $('#fiche select[name=MIS_VOI_ID]').val( );
    var par_id     = $('#fiche select[name=MIS_PAR_ID]').val( );
    var chauffeurs = Jaf.cm.getConcept('C_Gen_Chauffeur').getSelect().fetchAll( { CHU_PAR_ID : par_id } );
    var res = '<option value="">...</option>';
    for(var i in chauffeurs) {
        res += '<option value="'+chauffeurs[i].CHU_ID+'">'+chauffeurs[i].CHU_PRENOM+' '+chauffeurs[i].CHU_NOM+'</option>';
    }

    $('#fiche select[name=MIS_CHU_ID]').html( res ).val(chu_id);

    if ( chu_id > 0 ) {
        var chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow( chu_id );
        var res = '';
        var lc = ['CHU_TEL_FIXE','CHU_TEL_MOBILE_1','CHU_TEL_MOBILE_2'];
        for(var i in lc ) {
            if ( chauffeur[ lc[i] ].length>0 ) res+='<label>Téléphone</label><a href="tel:'+chauffeur[ lc[i] ]+'">'+chauffeur[ lc[i] ]+'</a>';
        }
        $('#fiche .tel_chauffeur').html( res );
    }

    var tve_id   =  $('#fiche select[name=MIS_TVE_ID]').val();
    var voitures = Jaf.cm.getConcept('C_Gen_Voiture').getSelect().join('C_Gen_TypeVehicule','VOI_TVE_ID','TVE_ID').fetchAll( { VOI_PAR_ID : par_id , VOI_TVE_ID : tve_id } );
    var res      = '<option value="">...</option>';
    for(var i in voitures) {
        res += '<option value="'+voitures[i].VOI_ID+'">'+voitures[i].TVE_LIBELLE+' : '+voitures[i].VOI_LIBELLE+'</option>';
    }
    $('#fiche select[name=MIS_VOI_ID]').html( res ).val(voi_id);
}

Mobi.cel = {
    date_debut : {
        tri : function (a,b) {
            var ad = ! a.MIS_DATE_DEBUT ?  '2100-01-01' : a.MIS_DATE_DEBUT;
            var bd = ! b.MIS_DATE_DEBUT ?  '2100-01-01' : b.MIS_DATE_DEBUT;
            var ah = ! a.MIS_HEURE_DEBUT ? '00:00:00'   : a.MIS_HEURE_DEBUT;
            var bh = ! b.MIS_HEURE_DEBUT ? '00:00:00'   : b.MIS_HEURE_DEBUT;

            var d_a= Jaf.getDate(ad+' '+ah);
            if ( ! d_a) {
                d_a = new Date('01/01/2100');
            }
            var d_b= Jaf.getDate(bd+' '+bh);
            if ( ! d_b) {
                d_b = new Date('01/01/2100');
            }
            return d_a.getTime() - d_b.getTime();
        }
    }
}

Jfo.setLoadUpdateReadyFonctions('update',function() {
    if ( Mobi.step > 4 ) {
        $('#outils').prepend('<p>Une nouvelle version de mobilimo est disponible, voulez vous la télécharger ?</p><a href="#" onclick="javascript:window.location.reload(); return false;">Télécharger</a>');
        Mobi.openPopup('outils');
    } else {
        Mobi.newversion = true;
    }
});

Jfo.setNoUpdateFonctions('update',function() {
     Jaf.log('Mobilimo à jour','ok');
});

$(document).ready(function(){
    Mobi.init('mobilimo');
});
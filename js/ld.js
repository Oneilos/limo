var Mobi = Jaf.extend(new JafController());

Mobi.log = function(chaine) {
    Mobi.old_log(chaine); 
    var madate = new Date();
    if ( ! Mobi.identity ) {
        var me = JSON.stringify(Mobi.chu_id);
        Mobi.identity = me && me.length>1 ? me.substr(1,me.length-2).replace(/\"/g,''): 'non logger';
    }
    
    Jaf.zoneMessageDebug_content += sprintf('%s %s %s | ', Mobi.identity ,Jaf.formatValue.Date(madate),Jaf.formatValue.Heure(madate) ) + JSON.stringify(chaine) + "\n";
    localStorage.setItem('ld_log',Jaf.zoneMessageDebug_content);
    Mobi.zoneMessageDebug.val(Jaf.zoneMessageDebug_content);
} 

Mobi.init = function(appName) {
    this.parent.init(appName);

    var log_value                 = localStorage.getItem('ld_log');
    Jaf.zoneMessageDebug_content  = log_value ? log_value : '';
    Mobi.old_log                  = Jaf.log;
    Jaf.log                       = Mobi.log;

    Mobi.version                  = '0.1'; //version multilingue
    Mobi.newversion               = false;
    Mobi.Tri.nomColonne           = 'date_debut';
    Mobi.page_concept             = '';
    Mobi.page_action              = '';
    Mobi.step                     = 0;
    Mobi.PileFiltres              = [];
    Mobi.smis                     = ['16','4','11','8','9']; //visible par le chauffeur
    Mobi.actionLoadData           = 'get-data-chauffeur';
    
    Jaf.cm.configConcepts    = {
        C_Geo_Lieu                 : 'LIE',
        C_Com_Commande             : 'COM',
        C_Com_Facture              : 'FAC', 
        C_Com_Reglement            : 'REL',
        C_Com_Grille               : 'GRI',
        C_Gen_EntiteCommerciale    : 'ECO',
        C_Gen_Client               : 'CLI',
        C_Gen_Chauffeur            : 'CHU',
        C_Gen_Contact              : 'COT',
        C_Gen_Mission              : 'MIS',
        C_Gen_Voiture              : 'VOI',
        C_Gen_TypeVehicule         : 'TVE',
        C_Gen_Civilite             : 'CIV',
        C_Gen_Presence             : 'PRS',
        C_Gen_Passager             : 'PAS',
        C_Gen_EtapePresence        : 'EPR',
        C_Com_ModeReglement        : 'MRE',
        C_Gen_TypePresencePassager : 'TPP'
    };
    Jaf.cm.actionSynchro     = 'synchronize-chauffeur';
    Jaf.cm.urlLoaderData     = '/gdsv2/loader-data';
    Jaf.cm.urlDb             = '/gdsv2/set-data/session/0/concept/';

    Jaf.eve.actionGetEvent   = 'get-events-chauffeur';
    Jaf.eve.callbackDeco     = Mobi.callbackDeco;
   
    Mobi.zoneMessageDebug         = $('#message textarea[name=message]').first();
    setInterval(Mobi.debuggage,60000);

    $('#menu .titre .texte,#init .titre').html('LD v'+Mobi.version);
    
    $('#login .submit').click(function() {
        var login    = $('#login input[name=login]').val();
        var mdp      = $('#login input[name=mdp]').val();
        var lan_code = $('#login select[name=LAN_CODE]').val();
        localStorage.setItem('gds_connexion_login',login);
        localStorage.setItem('gds_connexion_mdp'  ,mdp);
        localStorage.setItem('LAN_CODE'  ,lan_code);
        Mobi.closePopup('login');
        Mobi.loggeChauffeur();
    });

    $('#menu .btn.recherche').click(function() {
        Mobi.openPopup('recherche');
    });
    $('#menu .btn.retour').click(Mobi.retourPage);

    $('#menu .btn.homepage').click(Mobi.homePage);
     
    $('#menu .btn.outils').click(function() {
        Mobi.openPopup('outils');
    });
    $('#menu .btn.liste').click(function() {
        Mobi.initFiltre();       
        Mobi.changePage('P_Gen_Mission','lAction');
    });
    $('#home .boutonBas .btn.confirmer').click(function() {
        Mobi.filtres = {
            date_debut : Jaf.date2mysql(new Date()),
            smi_id     : 16
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID, limo : Mobi.listeMissionFiltree[0].limo} );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    $('#home .boutonBas .btn.modifier').click(function() {
        Mobi.filtres = {
            date_debut : Jaf.date2mysql(new Date()),
            MIS_FLAG_MODIFIER : 1
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID, limo : Mobi.listeMissionFiltree[0].limo} );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    $('#home .boutonBas .btn.cloturer').click(function() {
        Mobi.filtres = {
            cloturer : 1
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID, limo : Mobi.listeMissionFiltree[0].limo}  );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    
    this.status = 1;
    this.execute();
}

Mobi.initAffichage = function () {
    Jaf.log('initAffichage');
    $('#init').slideUp(500);
    $('#menu').slideDown(500);
    Mobi.initFiltre();
    Mobi.ouvreHomepage();
    this.status = 2;
    this.execute();
}

Mobi.changeStatus = function() {
    this.parent.changeStatus();
    $('#menu .JafEveSynchro').attr('class','JafEveSynchro status'+this.status);
}

Mobi.start = function() {
    $('#init').slideUp(500);
    $('#menu').slideDown(500);
    Mobi.initFiltre();
    Mobi.ouvreHomepage();
    Mobi.status = 5;
    Mobi.execute();
}

Mobi.initEvent = function() {
    Mobi.valoriseHomepage();
    this.parent.initEvent();
}

Mobi.callbackDeco = function() {
}

Mobi.initConnexion = function() {
    var login = localStorage.getItem('gds_connexion_login');
    
    if ( login == null || login.length==0 ) { 
        if ( !Mobi.openPopup.ouverte || ( Mobi.openPopup.ouverte && Mobi.openPopup.ouverte!='login') ) {
            Mobi.openPopup('login');   
            $('#connexion_login').val( localStorage.getItem('gds_connexion_login') );
            $('#connexion_mdp'  ).val( localStorage.getItem('gds_connexion_mdp') );
        }
    } else {
        Jaf.cm.gds  = new Jaf.Gds(localStorage.getItem('gds_apiKey') , localStorage.getItem('gds_cleSecrete') );
        Mobi.databases  = localStorage.getItem('gds_limos').split(',');
        Mobi.chu_id = JSON.parse( localStorage.getItem('chu_id') );
        this.status = 3;
        this.execute();
    }
}

Mobi.loggeChauffeur = function() {
    Jaf.log('loggeChauffeur');
    var login = localStorage.getItem('gds_connexion_login');
    var mdp   = localStorage.getItem('gds_connexion_mdp');
    var connexion = {
        CHU_EMAIL      : login ? login : '',
        CHU_MDP        : mdp   ? mdp   : ''
    }
    var trans = $.ajax({  
        url  : 'https://www.limo-vtc.fr/ld/login', 
        data : connexion, 
        type : 'POST' ,
        success : function(data) {
            eval(data);
            if ( localStorage.getItem('chu_id').length > 0 ) {
                Mobi.chu_id         = JSON.parse( localStorage.getItem('chu_id') );
            } else {
                Mobi.chu_id={};
                localStorage.removetItem('gds_connexion_login');
                alert('votre loggin ou mot de passe ne sont pas reconnus.');
            }
            Mobi.initConnexion();
        }
    });
    trans.fail(function() {
        Jaf.cm.failTransaction();
        alert('il n\'y a pas de connexion internet pour vérifier vos accès. Veuillez retrouver une connexion internet puis réessayez');
        localStorage.removetItem('gds_connexion_login');
        Mobi.initConnexion();
    });
}

Mobi.deconnexion = function() {
    localStorage.removeItem('gds_connexion_login');
    //Mobi.reload();
    //window.location.reload(true);
}

Mobi.homePage = function() {
    Mobi.mis_id=0; 
    Mobi.changePage('home', 'lAction');
    return;
}

Mobi.retourPage = function() {
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='fAction' ) {
        if ( Mobi.retourSurListe ) {
            Mobi.retourSurListe = false;
            Mobi.changePage('P_Gen_Mission','lAction');
            $('#MIS'+Mobi.mis_id).remove();
            Mobi.mis_id=0; 
            Mobi.analyseMission();
            return '';
        }
        Mobi.ouvreHomepage();
        return;
    }
    if ( Mobi.page_concept == 'P_Com_Reglement' && Mobi.page_action=='fAction' ) {
        Mobi.ouvreHomepage();
        return;
    }
    if ( Mobi.page_concept == 'P_Gen_Chauffeur' && Mobi.page_action=='fAction' ) {
        Mobi.ouvreHomepage();
        return;
    }
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='frais' ) {
        Mobi.changePage('P_Gen_Mission','fAction');
        return;
    }
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='kmEtHeure' ) {
        Mobi.changePage('P_Gen_Mission','fAction');
        return;
    }    
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='lAction' ) {
        Mobi.ouvreHomepage();
        return;
    }
}

Mobi.changePage = function(concept,action) {
    Jaf.log('ChangePage : '+concept+':'+action);
    var content = $('#content').first();
    if ( Mobi.page_concept != concept) {
        content.removeClass(Mobi.page_concept).addClass(concept);
    }
    if ( Mobi.page_action != action) {
        content.removeClass(Mobi.page_action).addClass(action);
    }
    if ( concept=='home' ) {
        $('#home').slideDown(500);
    } else {
        $('#home').slideUp(500);
    }
    if ( concept=='P_Gen_Mission' && action=='lAction' ) {
        $('#liste').slideDown(500);
    } else {
        $('#liste').slideUp(500);
    }
    if ( concept=='P_Gen_Mission' && action=='fAction' ) {
       $('#fiche').slideDown(500);
    } else {
       $('#fiche').slideUp(500);
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
    var chauffeur = Jaf.cm.getConcept(eve.limo+'.C_Gen_Chauffeur').getRow(chu_id);
    $('#listeContent .chauffeur[data-chu_id='+chu_id+'][data-limo='+eve.limo+']').html( chauffeur.CHU_NOM+ ' ' + chauffeur.CHU_PRENOM );
}

Mobi.initFiltre = function() {
    Mobi.aujo = Jaf.date2mysql(new Date());
    Mobi.filtres = {
        date_debut : Mobi.aujo,
        date_fin   : Mobi.aujo,
        smi_id     : 0,
        com_id     : '',
        recherche  : '' 
    }
   
    $('#recherche').find('input,select').each(function() {
        if ( Mobi.filtres[ $(this).attr('name') ] != null  ) {
            $(this).val( Mobi.filtres[ $(this).attr('name') ] );
        } 
    });
    
    $('#bt_recherche').unbind('click').click( function() {
        $('#recherche').find('input,select').each(function() {
            if ( $(this).val().length>0 ) {
                Mobi.filtres[ $(this).attr('name') ] = $(this).val();
            } else {
                delete(Mobi.filtres[ $(this).attr('name') ]);
            }
        });
        Mobi.analyseMission();
        Mobi.closePopup('recherche');
    });
    $('#bt_raz').unbind('click').click( function() {
        Mobi.initFiltre();
    });
  
}

Mobi.executeModeDeconnecter = function(flag_success) {
    if (Jaf.cm.synchro_old==-1) Jaf.cm.synchro_old = !Jaf.cm.synchro;
    if ( Jaf.cm.synchro_old!=Jaf.cm.synchro ) {
        if ( Jaf.cm.synchro_old ) { 
            //perte de synchro
            Jaf.log( 'Perte de syncho' );
            $('.JafEveSynchro').removeClass('synchro_ok').addClass('synchro_ko');
        } else {
            //reprise de synchro
            Jaf.log( 'Reprise de syncho' );
            $('.JafEveSynchro').removeClass('synchro_ko').addClass('synchro_ok');
        }
        Jaf.cm.synchro_old=Jaf.cm.synchro; 
    }
}

Mobi.depannage = function() {
    var zoneMessage = $('#message');
    Mobi.closePopup('outils'); 
    zoneMessage.slideDown(500);
    zoneMessage.find('.debugBt').unbind('click').click(function() { 
        $(this).html('Debuggage '+Jaf.translate('DIC_MISSION_EN_COURS'));
        $(this).unbind('click');
        $(this).css('background-color','#800000');
        Mobi.debuggage();
        setInterval(Mobi.debuggage,10000);
    });
    zoneMessage.find('.razBt').click(function() {
        Jaf.zoneMessageDebug_content = '';
        Jaf.log('raz');
    });
    return false;
}

Mobi.debuggage = function () {
    if ( Jaf.zoneMessageDebug_content.length>0) {
        var datas = {
            log : Jaf.zoneMessageDebug_content
        }
        var trans = $.ajax({
            url   : '/ld/debuggage',
            type  : 'POST',
            data  : datas,
            cache : false
        });
        trans.done(function(data) {
            if ( data.length>0) {
                eval(data);
            }
        });
        Jaf.zoneMessageDebug_content = ''; 
        var madate = new Date();
    }
}

Mobi.isMissionAffichable = function (row,limo) {
    var flag                = row.MIS_CHU_ID;

    flag &= row.MIS_CHU_ID==Mobi.chu_id[limo];
    
    if ( flag ) {
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
        
        
        if ( Mobi.filtres.com_id > 0 ) {
            flag &= row.MIS_COM_ID==Mobi.filtres.com_id;
        }
        
        if ( Mobi.filtres.date_debut && Mobi.filtres.date_debut.length > 0 ) {
            flag &= temps_debut_mission >= Jaf.getDate(Mobi.filtres.date_debut).getTime() / 1000 ;
        }
        
        if ( Mobi.filtres.date_fin && Mobi.filtres.date_fin.length > 0 ) {
            flag &= temps_debut_mission < Jaf.getDate(Mobi.filtres.date_fin).getTime() / 1000 + 24 * 3600 - 1;
        }
        
        if ( Mobi.filtres.MIS_FLAG_MODIFIER ) {
            flag &= 1*row.MIS_FLAG_MODIFIE==1*Mobi.filtres.MIS_FLAG_MODIFIER;
        }
        
        if ( Mobi.filtres.cloturer ) {
            flag &= ( 1*row.MIS_SMI_ID==9 && row.MIS_HEURE_REEL_FIN && row.MIS_HEURE_REEL_FIN.length > 0 ) ;
        }    
        // statut de mission
        if ( Mobi.filtres.smi_id && Mobi.filtres.smi_id>0 ) {
            flag &= Mobi.filtres.smi_id == row.MIS_SMI_ID;
        }
        flag &= Mobi.smis.indexOf(row.MIS_SMI_ID)>-1;
        
        if ( Mobi.filtres.recherche && Mobi.filtres.recherche.length > 0 ) {
            Mobi.filtres.recherche = Jaf.toUpperCaseSansAccent(Mobi.filtres.recherche);
            var dossier        = Jaf.cm.getConcept(limo+'.C_Com_Commande').getRow(row.MIS_COM_ID);
            var contactDossier = Jaf.cm.getConcept(limo+'.C_Gen_Contact').getRow(dossier.COM_COT_ID);
            var client         = Jaf.cm.getConcept(limo+'.C_Gen_Client').getRow(dossier.COM_CLI_ID);
            var res            = Jaf.toUpperCaseSansAccent(client.CLI_SOCIETE+' '+contactDossier.COT_NOM+' '+contactDossier.COT_PRENOM+ ' '+row.MIS_LISTE_PASSAGERS);
            var flagt          = res.toUpperCase().indexOf( Mobi.filtres.recherche ) > -1;
            if ( !flagt && row.MIS_CHU_ID > 0 )  {
                var chauffeur      = Jaf.cm.getConcept(limo+'.C_Gen_Chauffeur').getRow(row.MIS_CHU_ID);
                res = Jaf.toUpperCaseSansAccent(chauffeur.CHU_PRENOM+' '+chauffeur.CHU_NOM);
                flagt = res.indexOf( Mobi.filtres.recherche ) > -1;
            }
            flag &= flagt;
        }
    }

	return flag;
}

Mobi.getEvent = function(eve) {
    var limo = eve.limo;
    if ( eve.CPT_CLASS=='C_Gen_Mission' ) {
        var mis_id = eve.EVE_PRIMARY;
        $('#MIS'+mis_id).remove();
        Mobi.analyseMission();
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return ''; 
    }
    if ( eve.CPT_CLASS=='C_Com_Reglement' || 
         eve.CPT_CLASS=='C_Gen_Presence' || 
         eve.CPT_CLASS=='C_Gen_EtapePresence' 
    ) {
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return '';
    }
    if ( eve.CPT_CLASS=='C_Geo_Lieu' ||  eve.CPT_CLASS=='C_Geo_Ville') {
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return '';
    }
}

Mobi.analyseMission = function () {
    var tv     = [];
    for(var l in Mobi.databases) {
        var limo   = Mobi.databases[l];
        var rowset = Jaf.cm.getConcept( limo + '.C_Gen_Mission' ).rowset;
        for(var  i in rowset ) {
            var row = rowset[i];
            if ( Mobi.isMissionAffichable(row,limo) ) {
                row.limo = limo;
                tv.push(row);
            } else {
                $('#MIS'+row.MIS_ID+'[data-limo='+limo+']').hide();
            }
        }
    }
    $('#nbMission').html( tv.length+ ( tv.length > 1 ? Jaf.translate('DIC_MISSION_PLURIEL') : Jaf.translate ('DIC_MISSION_SINGULIER') ) ) ;
    //trie de tv
    Mobi.makeTri(tv);
    Mobi.nbTotalLigne        = tv.length;
    Mobi.listeMissionFiltree = tv;
    var cpt = 0;
    var tr1 = $('#listeContent>div.mission').first();
    var mis_tr1  = tr1.length > 0 ? tr1.data('mis_id') : 0;
    var limo_tr1 = tr1.length > 0 ? tr1.data('limo') : 0;
    for(var i in tv ) {
        var mis_id = tv[i].MIS_ID;
        var limo   = tv[i].limo;
        if ( mis_id == mis_tr1 && limo == limo_tr1 ) {
            while ( tr1.data('mis_id') > 0 && tr1.data('mis_id') == mis_id && tr1.data('limo') == limo ) tr1 = tr1.next();
            mis_tr1  = tr1.data('mis_id');
            limo_tr1 = tr1.data('limo');
        } else {
            var MIS = $('#MIS'+mis_id+'[data-limo='+limo+']');
            
            if ( MIS.length > 0 ) {
                tr1.before( MIS.detach() );
            } else {
                var MIS = Mobi.newMission(mis_id,limo);
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
    if ( Mobi.filtres.date_debut && Mobi.filtres.date_fin ) { 
        var filtre_date =  Jaf.translate('DIC_DATE_DU')+Jaf.mysql2date(Mobi.filtres.date_debut) +Jaf.translate('DIC_DATE_AU')+Jaf.mysql2date(Mobi.filtres.date_fin);
    } else  if ( Mobi.filtres.date_debut ) { 
      
        if (Mobi.filtres.MIS_FLAG_MODIFIER) {
            var filtre_date = Jaf.translate('DIC_MISSION_MODIFIER');
        } else  if (Mobi.filtres.smi_id==16) {
            var filtre_date = Jaf.translate('DIC_MISSION_A_CONFIRMER');
        } else {
            var filtre_date = Jaf.translate('DIC_DATE_A_PARTIR_DU') + Jaf.mysql2date(Mobi.filtres.date_debut);
        }
    } else {
        if (Mobi.filtres.cloturer) {
            var filtre_date = Jaf.translate('DIC_MISSION_A_FERMER');
        }   
    }
    $('#liste .barreTitre').html(filtre_date);       
}
//----------------------------------------------------------------------------------------

Mobi.fonctionsCel = {};

Mobi.fonctionsCel.getPresences = function(mis_id,limo) {
   return Jaf.cm.getConcept(limo+'.C_Gen_Presence').getSelect().order('PRS_TRI','asc').fetchAll({PRS_MIS_ID:mis_id});
}

Mobi.fonctionsCel.getEtape = function(mis_id, limo){
    return Jaf.cm.getConcept(limo+'.C_Gen_EtapePresence').getSelect().order('EPR_TRI','asc').fetchAll({EPR_MIS_ID:mis_id,EPR_FLAG_ANNULER:'0'});
}

Mobi.fonctionsCel.getLibelleLieuEtape = function(row,limo) {
    if ( row ) {
        var lie_id = row.EPR_LIE_ID;
        var epr_id = row.EPR_ID;
        var numero = row.EPR_NUM_TRANSPORT && row.EPR_NUM_TRANSPORT.length > 0 ? row.EPR_NUM_TRANSPORT : ''; 
        var heure  = row.EPR_HEURE_TRANSPORT ? row.EPR_HEURE_TRANSPORT : '';
        if ( lie_id > 1 ) {
            var lieu        = Jaf.cm.getConcept(limo+'.C_Geo_Lieu' ).getRow(lie_id);
            var heure_debut = row.EPR_HEURE_DEBUT ? row.EPR_HEURE_DEBUT.substr(0,5).replace(/:/g,'h') : '';
            if ( lieu.LIE_TLI_ID ==1 ) {
                var libelle = '<span class="heure">'+heure_debut+'</span><div class="libelle"><span class="icone">º</span> '+lieu.LIE_LIBELLE+'</div>';
                libelle += numero.length > 0 || heure.length>0 ? '<div class="vol clearAfter"><div class="numero">'+numero + '</div><div class="heure">' +heure +'</div></div>' : '';
            } else if ( lieu.LIE_TLI_ID ==2 ) {
                var libelle = '<span class="heure">'+heure_debut+'</span><div class="libelle"><span class="icone">»</span> '+lieu.LIE_LIBELLE+'</div>';
                libelle += numero.length > 0 || heure.length>0 ? '<div class="gare clearAfter"><div class="numero">'+numero + '</div></div>' : '';
            } else {
                var libelle = '<span class="heure">'+heure_debut+'</span><div class="libelle">';
                libelle += lieu.LIE_LIBELLE && lieu.LIE_LIBELLE.length > 0 ? '<span class="titre">' + lieu.LIE_LIBELLE + '</span>' : '';
                libelle += ' <span class="adresseFormated">'+lieu.LIE_FORMATED+'</span>';
                libelle += lieu.LIE_INFO && lieu.LIE_INFO.length>0 ? ' <span class="infoLieu">'+lieu.LIE_INFO+'</span>' : '' ;
                libelle += numero.length > 0 ? '<span class="numero">'+numero+'</span>' : '';
                libelle += '</div>';
            }
            return  libelle;
        } else {
            return lie_id==1 ? '<div class="icone tb">Â</div>' : ( numero.length > 0 ? '<div class="numero">'+numero + '</div>' : '&nbsp;') ;
        }
    } else {
        return Jaf.translate('DIC_PAS_DE_LIEU_ICI');
    }
}

//-------------------------------------------------------------------------
Mobi.newMission = function (mis_id,l) {
	var limo       = l;
    var mission    = Jaf.cm.getConcept(limo+'.C_Gen_Mission').getRow(mis_id);
	var dossier    = Jaf.cm.getConcept(limo+'.C_Com_Commande').getRow(mission.MIS_COM_ID);
    var client     = Jaf.cm.getConcept(limo+'.C_Gen_Client').getRow(dossier.COM_CLI_ID);

    if ( mission.MIS_CHU_ID>0) {
        var chauffeur = Jaf.cm.getConcept(limo+'.C_Gen_Chauffeur').getRow(mission.MIS_CHU_ID);
        mission.chauffeur = chauffeur.CHU_PRENOM+'<br>'+chauffeur.CHU_NOM;
    } else {
        mission.chauffeur = '<span class="icone">ù</span>';
    }
    
    if ( mission.MIS_TVE_ID>0) {
        var tve = Jaf.cm.getConcept(limo+'.C_Gen_TypeVehicule').getRow(mission.MIS_TVE_ID);
        mission.typeVehicule = tve.TVE_LIBELLE_COURT;
    } else {
        mission.typeVehicule = '?';
    }
   
    //date
    var decalage = 0;
    if (mission.MIS_DATE_DEBUT && mission.MIS_DATE_DEBUT.length>0 && mission.MIS_DATE_DEBUT!='0000-00-00') { 
        var d = Jaf.getDate(mission.MIS_DATE_DEBUT);
        if ( decalage && decalage != 0 && mission.MIS_HEURE_DEBUT && mission.MIS_HEURE_DEBUT.length > 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT).getTime()  - decalage * 3600000 );
            mission.date_debut  = '<div class="etranger">'
                               + '<span class="jour">'   + Jaf.jourMoyen[ Jaf.LAN_CODE ][ df.getDay() ]+'</span>'
                               + '<span class="numero">' + df.getDate() + '</span>' 
                               + '<span class="mois">'   + Jaf.moisCours[ Jaf.LAN_CODE ][ df.getMonth() ] + '</span>'
                               + '<span class="heure_locale">'+d.getDate() 
                               + ' ' + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ]+'</span></div>';
            mission.heure_debut = '<span class="heure_france">' + Jaf.formatValue.Heure( df ) + '</span><span class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</span>';
            
        } else {		 	
            if ( d ) {
                mission.date_debut =  '<div class="france' + ( d.getDay()%6==0? ' weekend' : '' ) + '">'
                      + '<span class="jour">'      + Jaf.jourMoyen[ Jaf.LAN_CODE ][ d.getDay() ]+'</span>'
                      + '<span class="numero">'    + d.getDate() + '</span>' 
                      + '<span class="mois">'    + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ] + '</span>'
                      + '</div>';
            }
            mission.heure_debut = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</div>';
            
        }
    } else {
        mission.date_debut = '<div class="inconnu">Date</div>';
    }
    
    if ( mission.MIS_HEURE_FIN ) {
        var decalage = 0;
        if ( decalage && decalage != 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN).getTime()  - decalage * 3600000 );
            mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure( df ) + '</div><div class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
        }			
        mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
    } else {
        mission.heure_fin =  '<div class="inconnu">'+Jaf.translate('DIC_HEURE_FIN')+'</div>'
    }
    
    mission.client               = client.CLI_SOCIETE;
    var etapes                   = Mobi.fonctionsCel.getEtape(mis_id,limo);
    mission.lieu_prise_en_charge = etapes.length > 0 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[0] , limo )                   : '';
    mission.lieu_depose          = etapes.length > 1 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ etapes.length - 1 ] , limo ) : '';
    mission.limo                 = limo;
   
    var divMission = $( Jaf.tm.t.mission( mission ) );
    divMission.data('limo',limo);
    divMission.click(function() { Mobi.retourSurListe=true;  Mobi.ouvreMission({mis_id:mission.MIS_ID,limo:limo}); });
    return divMission;
}

Mobi.animateBouton = function(couleurFond,icone,label) {
    if ( Mobi.animateBouton.old_label != label || Mobi.animateBouton.old_icone != icone ) {
        var home = $('#home').first();
        home.find('.intGrosBouton'       ).animate({'background-color':couleurFond},2000);
        home.find('.intGrosBouton .icone').animate({'color':couleurFond},2000);
        home.find('.intGrosBouton .label').animate({'color':couleurFond},2000);
        home.find('.Btn .icone').html(icone);    
        home.find('.Btn .label').html(label);    
        home.find('.Btn').fadeIn(500);    
        Mobi.animateBouton.old_label = label;
        Mobi.animateBouton.old_icone = icone;
    }
}

Mobi.animateBouton.old_icone = '';
Mobi.animateBouton.old_label = '';

Mobi.getInfoMissionHome = function(row,limo) {
    var dm       = Jaf.getDate( row.MIS_DATE_DEBUT );
    var zoneDate = '<span class="jour" >' + Jaf.jourMoyen[ Jaf.LAN_CODE ][ dm.getDay() ]    + '</span>'
                 + '<span class="day"  >' + dm.getDate()                   + '</span>'
                 + '<span class="mois" >' + Jaf.moisCours[ Jaf.LAN_CODE ][ dm.getMonth() ] + '</span>'
                 + '<span class="heure">' + Jaf.formatValue.Heure(row.MIS_HEURE_DEBUT)+'</span>';
    var etapes = Mobi.fonctionsCel.getEtape(row.MIS_ID,limo);
    return {
        label         : Jaf.translate('DIC_PROCHAINE_MISSION') + ' : ',
        MIS_COM_ID    : row.MIS_COM_ID,
        MIS_NUMERO    : row.MIS_NUMERO,
        MIS_VERSION   : row.MIS_VERSION,
        zoneDate      : zoneDate,
        lieu          : etapes.length > 0 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[0] ,limo ) : '',
        limo          : limo
    }
}

Mobi.valoriseHomepage = function() {
    Mobi.getEvent.flag_valorise = false;
    var home=$('#home').first();
    //combien de mission
    var confirmer           = 0;
    var modifier            = 0;
    var cloturer            = 0;
    var mis_id_non_terminer = 0;
    var date_prochaine      = 9000000000;
    var statut_prochaine    = ['4','11','8'];                          
    var maintenant          = Jaf.date2mysql(new Date());
    var tab                 = [];
    for(var l in Mobi.databases) {
        var rowset              = Jaf.cm.getConcept(Mobi.databases[l] + '.C_Gen_Mission').rowset;
        for(var i in rowset) {
            var row=rowset[i];
            if ( row.MIS_CHU_ID==Mobi.chu_id[ Mobi.databases[l] ] ) {
                
                if ( row.MIS_SMI_ID==16       && row.MIS_DATE_DEBUT >= maintenant )                                confirmer++;
                if ( row.MIS_FLAG_MODIFIE==1  
                  && row.MIS_DATE_DEBUT >= maintenant 
                  && Mobi.smis.indexOf(row.MIS_SMI_ID)>-1 )                                                        modifier++;
                if ( ( 1*row.MIS_SMI_ID==9  && row.MIS_HEURE_REEL_FIN && row.MIS_HEURE_REEL_FIN.length > 0 )   )   cloturer++;
                
                if ( statut_prochaine.indexOf( row.MIS_SMI_ID) >=0 )  tab.push( row.MIS_DATE_DEBUT+' '+row.MIS_HEURE_DEBUT+'|'+row.MIS_ID+'|'+Mobi.databases[l]);
                //a cloturer
                if ( ( row.MIS_SMI_ID==9 ) && ( !row.MIS_HEURE_REEL_FIN || row.MIS_HEURE_REEL_FIN.length == 0 ) ) {
                    mis_id_non_terminer = row.MIS_ID;
                }
            }
        }
    }
    tab.sort();
    if ( tab.length>0) {
        var res               = tab[0].split('|');
        var mis_id_prochaine  = res[1];
        var limo_prochaine    = res[2];
        if ( tab.length>1) {
            var res              = tab[1].split('|');
            var mis_id_suivante  = res[1];
            var limo_suivante    = res[2];
        } else {
            var mis_id_suivante  = 0;
            
        }
    } else {
        var mis_id_suivante = mis_id_prochaine = 0;
    }
    
    if ( !Mobi.initGrosBouton) {
        var grosBouton = $('#home .grosBouton').first();
        Mobi.valoriseHomepage.grosBouton = grosBouton;
        var width = $('#menu').width()/2;
        grosBouton.css({
            width           : (width+20)+'px',
            height          : (width+20)+'px',
            'border-radius' : (width+20)+'px'
        });
        grosBouton.find('.intGrosBouton').css({
            width           : (width)+'px',
            height          : (width)+'px',
            'border-radius' : (width-20)+'px'
        });
        grosBouton.find('.Btn').css({
            width           : (width-40)+'px',
            height          : (width-40)+'px',
            'border-radius' : (width-40)+'px',
            'padding'       : Math.round(width/15)+'px'
        });
        grosBouton.find('.Btn .icone').css({
            'font-size'           : Math.round(width/3)+'px'
        });
        grosBouton.find('.label').css({
            'font-size'           : Math.round(width/10)+'px'
        });
        grosBouton.click(function() {
            var grosBouton = Mobi.valoriseHomepage.grosBouton;
            grosBouton.find('.Btn').fadeOut(500);
            var smi_id  = grosBouton.data('smi_id');
            var mis_id  = grosBouton.data('mis_id');
            var limo    = grosBouton.data('limo');
            var cd      = grosBouton.data('champ_date');
            var num     = grosBouton.data('num_etape');
            var km      = grosBouton.data('champ_km');
            var mission = Jaf.cm.getConcept( limo + '.C_Gen_Mission');
            var etapes  = Mobi.fonctionsCel.getEtape(mis_id,limo);
            
            mission.setValue(mis_id , 'MIS_SMI_ID' , smi_id);
            if ( cd.length>0) {
                var maintenant = new Date();
                if ( cd.substr(0,3)=='MIS' ) {
                    mission.setValue(mis_id , cd , sprintf('%02d:%02d:%02d',maintenant.getHours(),maintenant.getMinutes(),maintenant.getSeconds() ) );
                } else {
                    Jaf.cm.getConcept( limo + '.C_Gen_EtapePresence').setValue( etapes[num].EPR_ID , cd , sprintf('%02d:%02d:%02d',maintenant.getHours(),maintenant.getMinutes(),maintenant.getSeconds() ) ).save();
                }
            }
            var nb_km=mission.getRow(mis_id)[km];
            
            if ( km.length>0 && !(nb_km > 0) ) {
                var kilometrage = prompt(Jaf.translate('DIC_KILOMETRAGE_COMPTEUR'), nb_km ? nb_km : '');
                if ( kilometrage ) {
                    mission.setValue(mis_id , km , kilometrage );
                }
            }
            mission.save(function() {
                Mobi.valoriseHomepage();
            });
        });
        Mobi.initGrosBouton=true;
    }
    
    //mission non terminer
    if ( mis_id_prochaine > 0 ) {
        var flag_attestation  = false;
        var montant_reglement = 0;
        var row               = Jaf.cm.getConcept( limo_prochaine + '.C_Gen_Mission').getRow(mis_id_prochaine);
        var row_en_cours      = row;
        var grosBouton        = Mobi.valoriseHomepage.grosBouton;
        grosBouton.data({
            champ_date : '',
            champ_km   : '',
            limo       : limo_prochaine
        });
        home.find('.petitBouton').removeClass('visible');
        var info   = Mobi.getInfoMissionHome(row,limo_prochaine);
        var etapes = Mobi.fonctionsCel.getEtape(row.MIS_ID,limo_prochaine);
        for(var num_etape in etapes ) {
            var pas_arriver = etapes[num_etape].EPR_HEURE_ARRIVER == null || etapes[num_etape].EPR_HEURE_ARRIVER.length==0;
            var pas_depart  = etapes[num_etape].EPR_HEURE_DEPART  == null || etapes[num_etape].EPR_HEURE_DEPART.length ==0;
            if ( pas_arriver || pas_depart ) break;
        }
        var etape = etapes[num_etape];
        grosBouton.data('num_etape',num_etape);
        switch (row.MIS_SMI_ID ) {
            case '4' : 
                Mobi.animateBouton('#800000','>',Jaf.translate('DIC_DEMARRER'));
                grosBouton.data('smi_id',11);
                grosBouton.data('champ_date','MIS_HEURE_REEL_DEBUT');

            break;
            case '11' : 
                Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                grosBouton.data('smi_id',8);
                grosBouton.data('num_etape' , 0);
                grosBouton.data('champ_km'  , 'MIS_KM_DEBUT');
                grosBouton.data('champ_date', 'EPR_HEURE_ARRIVER');
                flag_attestation = true;
            break;
            case '8' : 
                if ( row.MIS_FLAG_NOSHOW==1 ) {
                    Mobi.animateBouton('#008000','@',Jaf.translate('DIC_TERMINER'));
                    grosBouton.data('smi_id',9);
                    grosBouton.data('champ_date','MIS_HEURE_REEL_FIN');

                    if ( mis_id_suivante>0) {
                        var row  = Jaf.cm.getConcept( limo_suivante + '.C_Gen_Mission').getRow(mis_id_suivante);
                        var info = Mobi.getInfoMissionHome(row,limo_suivante);
                    } else {
                        info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape , limo_prochaine );
                    }
                } else {
                    if ( num_etape == '0' ) {
                        //premiere etape
                        info.lieu  = Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ 1*num_etape + 1 ] , limo_prochaine );
                        Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPART'));
                        grosBouton.data('smi_id',8);
                        grosBouton.data('champ_date','EPR_HEURE_DEPART');
                    } else if ( 1*num_etape == etapes.length-1 ) {
                        //derniere etape
                        if ( pas_arriver ) {
                            info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape , limo_prochaine );
                            Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                            grosBouton.data('smi_id',8);
                            grosBouton.data('champ_date','EPR_HEURE_ARRIVER');
                            home.find('.petitBouton.droit').addClass('visible');
                        } else {
                            if ( pas_depart ) {
                                info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape , limo_prochaine );
                                Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPOSE_CLIENT'));
                                grosBouton.data('smi_id',8);
                                grosBouton.data('champ_date','EPR_HEURE_DEPART');
                                grosBouton.data('champ_km'  ,'MIS_KM_FIN');
                            } else {
                                Mobi.animateBouton('#008000','@',Jaf.translate('DIC_TERMINER'));
                                grosBouton.data('smi_id',9);
                                grosBouton.data('champ_date','MIS_HEURE_REEL_FIN');

                                if ( mis_id_suivante>0) {
                                    var row  = Jaf.cm.getConcept( limo_suivante + '.C_Gen_Mission').getRow(mis_id_suivante);
                                    var info = Mobi.getInfoMissionHome(row,limo_suivante);
                                } else {
                                    info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape, limo_suivante);
                                }
                            }
                        }
                    } else {
                        if ( pas_arriver ) {
                            info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape , limo_prochaine );
                            Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                            grosBouton.data('smi_id',8);
                            grosBouton.data('champ_date','EPR_HEURE_ARRIVER');
                            home.find('.petitBouton.droit').addClass('visible');
                        } else {
                            info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etapes[1*num_etape+1] , limo_prochaine);
                            Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPART'));
                            grosBouton.data('smi_id',8);
                            grosBouton.data('champ_date','EPR_HEURE_DEPART');
                        }
                    }
                    
                    home.find('.petitBouton.droit').addClass('visible');
                    home.find('.petitBouton.droit .intPetitBouton').html(Jaf.translate('DIC_NO_SHOW'));
                    home.find('.petitBouton.droit').unbind('click').data('limo',limo_prochaine).click(function(e) {
                        e.stopPropagation();
                        var limo    = $(this).data('limo');
                        var message = prompt(Jaf.translate('DIC_NO_SHOW_RAISON'),Jaf.translate('DIC_NO_SHOW_PAS_CLIENT'));
                        if ( message.length>0 ) {
                            var info = row.MIS_COMMENTAIRE_CHAUFFEUR+"\n"+Jaf.translate('DIC_NO_SHOW_RAISON')+' : '+message;
                            Jaf.cm.getConcept( limo + '.C_Gen_Mission'
                            ).setValue(row.MIS_ID,'MIS_SMI_ID',8
                            ).setValue(row.MIS_ID,'MIS_FLAG_NOSHOW',1
                            ).setValue(row.MIS_ID,'MIS_COMMENTAIRE_CHAUFFEUR',info).save();
                        }
                    });

                    flag_attestation = true;
                }
            break;
        }
        //bouton de présence passager
        var presences = Mobi.fonctionsCel.getPresences(row.MIS_ID,limo_prochaine);
        var zonePresence = home.find('.zonePassager');
        if ( row.MIS_FLAG_NOSHOW == "0" && presences.length > 0 ) {
            var res = '';
            for(var i in presences) {
                if ( presences[i].PRS_TPP_ID!=3 ) {
                    var passager = Jaf.cm.getConcept(limo_prochaine+'.C_Gen_Passager').getRow( presences[i].PRS_PAS_ID );
                    var civilite = Jaf.cm.getConcept(limo_prochaine+'.C_Gen_Civilite').getRow( passager.PAS_CIV_ID );
                    passager.nom = Jaf.translate(civilite.CIV_LIBELLE_COURT)+' '+passager.PAS_PRENOM+' '+passager.PAS_NOM + ( passager.PAS_FLAG_TPMR==1 ? '<span class="tpmr icone">Õ</span>' : '');
                    var params = {};
                    $.extend(params , presences[i], passager );
                    params.boutons = [];
                    switch ( presences[i].PRS_TPP_ID ) {
                        case '1' : 
                            if ( row.MIS_SMI_ID=='8' ) {
                                if (    
                                        presences[i].PRS_PC_EPR_ID == 0 ||
                                        presences[i].PRS_PC_EPR_ID == etape.EPR_ID
                                    )
                                 {
                                    if ( pas_arriver ) {
                                        params.info   = '<span class="monter">'+Jaf.translate('DIC_PASSAGER_PROCHAINE')+'</span>';
                                    } else {
                                        params.boutons.push( {label : Jaf.translate('DIC_PASSAGER_PRESENT') , PRS_ID : presences[i].PRS_ID , role : 'POB'    , classe : 'present'} );
                                        params.boutons.push( {label : Jaf.translate('DIC_NO_SHOW'         ) , PRS_ID : presences[i].PRS_ID , role : 'NOSHOW' , classe : 'noshow'} );
                                    }
                                }
                            } else {
                                
                                if (    etape && (
                                        presences[i].PRS_PC_EPR_ID == 0 ||
                                        presences[i].PRS_PC_EPR_ID == etape.EPR_ID)
                                    ){   
                                    params.info   = '<span class="monter">'+Jaf.translate('DIC_PASSAGER_PROCHAINE')+'</span>';
                                }
                            }
                        break;
                        case '2' : params.classe = 'present';
                                if (  presences[i].PRS_DE_EPR_ID == etape.EPR_ID ){   
                                   params.info   = '<span class="descendre">'+( pas_arriver ? Jaf.translate('DIC_PASSAGER_DOIT_DESCEN1') : Jaf.translate('DIC_PASSAGER_DOIT_DESCEN2'))+'</span>';
                                }
                        break;
                        case '4' : params.classe = 'noshow';
                        break;
                    }
                    res += Jaf.tm.t.mission_bouton_passager( params );     
                }
            }
            zonePresence.html(res);
        }
        
        zonePresence.find('.btn').data('limo',limo_prochaine).click(function() {
            var prs_id = $(this).data('prs_id');
            var role   = $(this).data('role');
            var limo   = $(this).data('limo');
            Jaf.cm.getConcept( limo + '.C_Gen_Presence').setValue( prs_id , 'PRS_TPP_ID' ,  role == 'NOSHOW' ? 4 : 2 ).save();
            Mobi.valoriseHomepage();
        });
       
        if ( flag_attestation ) {
            home.find('.petitBouton.gauche').addClass('visible');
            home.find('.petitBouton.gauche .intPetitBouton').html('A');
            home.find('.petitBouton.gauche').unbind('click').click(function(e) {
                e.stopPropagation();
                Mobi.ouvreRecepisse(row_en_cours.MIS_ID,limo_prochaine);
            });
        }
        
        var rels  = Jaf.cm.getConcept(limo_prochaine+'.C_Com_Reglement').rowset;
        for(var i in rels) {
            if ( rels[i].REL_MIS_ID==row_en_cours.MIS_ID && !rels[i].REL_MONTANT_REGLER>0) {
                home.find('.petitBouton.reglement').addClass('visible');
                home.find('.petitBouton.reglement .intPetitBouton').html(Jaf.formatValue.Montant(rels[i].REL_MONTANT_ECHEANCE));
                home.find('.petitBouton.reglement').data('rel_id',rels[i].REL_ID).data('limo',limo_prochaine).unbind('click').click(function(e) {
                    e.stopPropagation();
                    Mobi.ouvreReglement($(this).data('rel_id'),$(this).data('limo'));
                });
                break;
            }
        }
        
        
        home.find('.grosBouton,.cel.infoLieu').data('mis_id',mis_id_prochaine).data('limo',limo_prochaine);
        home.find('.cel.infoLieu').click(function() {
            Mobi.ouvreMission({mis_id:$(this).data('mis_id'),limo:$(this).data('limo')});
        });
        for(var i in info) {
            home.find('[data-role='+i+']').html(info[i]);
        }
        home.find('.zoneBouton').addClass('visible');   
         
        
    } else {
        home.find('.zoneBouton').removeClass('visible');
    }
    
    home.find('.chiffre[data-role=confirmer]').html(confirmer);
    home.find('.chiffre[data-role=modifier]' ).html(modifier);
    home.find('.chiffre[data-role=cloturer]' ).html(cloturer);
}

Mobi.ouvreHomepage = function (eve) {
    window.scrollTo(0,0);
    Mobi.changePage('home','lAction');
    Mobi.valoriseHomepage();
}

Mobi.getInfoMission = function(mis_id,limo) {
    var mission  = Jaf.cm.getConcept(limo+'.C_Gen_Mission').getRow(mis_id);
    var dossier  = Jaf.cm.getConcept(limo+'.C_Com_Commande').getRow(mission.MIS_COM_ID);
    var grille   = Jaf.cm.getConcept(limo+'.C_Com_Grille').getRow(dossier.COM_GRI_ID);
    var eco      = Jaf.cm.getConcept(limo+'.C_Gen_EntiteCommerciale').getRow(grille.GRI_ECO_ID);
    var client   = Jaf.cm.getConcept(limo+'.C_Gen_Client').getRow(dossier.COM_CLI_ID);
    var contact  = Jaf.cm.getConcept(limo+'.C_Gen_Contact').getRow(dossier.COM_COT_ID);
    var voiture  = Jaf.cm.getConcept(limo+'.C_Gen_Voiture').getRow(mission.MIS_VOI_ID);
    var typeVehi = Jaf.cm.getConcept(limo+'.C_Gen_TypeVehicule').getRow(voiture.VOI_TVE_ID);
    var etapes   = Mobi.fonctionsCel.getEtape(mis_id,limo);
    
    mission.ITINERAIRE = '';
    for(var i=0;i<etapes.length;i++) {
        var heure_debut = etapes[i].EPR_HEURE_DEBUT ? etapes[i].EPR_HEURE_DEBUT.substr(0,5) : '';
        mission.ITINERAIRE += '<li>'+Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ i ] , limo )+'</li>';
    }
    
    mission.ECO_IMAT_REGISTRE    = eco.ECO_IMAT_REGISTRE;
    mission.client               = client.CLI_SOCIETE;
    mission.contact_nom          = contact.COT_PRENOM+' '+contact.COT_NOM;
    mission.contact_tel          = contact.COT_TELEPHONE ? Jaf.formatValue.Telephone(contact.COT_TELEPHONE) : '';
    mission.contact_mob          = contact.COT_MOBILE ? Jaf.formatValue.Telephone(contact.COT_MOBILE) : '';
    mission.TVE_LIBELLE          = typeVehi.TVE_LIBELLE;
    mission.VOI_LIBELLE          = voiture.VOI_LIBELLE;
    mission.NOTE_CHAUFFEUR       = mission.MIS_NOTE_CHAUFFEUR ? mission.MIS_NOTE_CHAUFFEUR.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'<br>') : '';
    mission.ITINERAIRE          += mission.MIS_ITINERAIRE     ? mission.MIS_ITINERAIRE.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'<br>')     : '';
    mission.PROGRAMME            = mission.MIS_PROGRAMME      ? mission.MIS_PROGRAMME.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'<br>')      : '';
    var date_dossier             = Jaf.getDate(           dossier.COM_DATE_CREATION );
    mission.date_dossier         = Jaf.formatValue.Date(  date_dossier );
    mission.heure_dossier        = Jaf.formatValue.Heure( date_dossier );
    var presences                = Jaf.cm.getConcept('C_Gen_Presence').rowset;
    var infoPassagers            = '';

    if (mission.MIS_DATE_DEBUT && mission.MIS_DATE_DEBUT.length>0 && mission.MIS_DATE_DEBUT!='0000-00-00') { 
        var d = Jaf.getDate(mission.MIS_DATE_DEBUT);
        if ( decalage && decalage != 0 && mission.MIS_HEURE_DEBUT && mission.MIS_HEURE_DEBUT.length > 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT).getTime()  - decalage * 3600000 );
            mission.date_debut_texte  = Jaf.formatValue.Date(df);
            mission.date_debut  = '<div class="etranger">'
                               + '<span class="jour">'   + Jaf.jourMoyen[ Jaf.LAN_CODE ][ df.getDay() ]+'</span>'
                               + '<span class="numero">' + df.getDate() + '</span>' 
                               + '<span class="mois">'   + Jaf.moisCours[ Jaf.LAN_CODE ][ df.getMonth() ] + '</span>'
                               + '<span class="heure_locale">'+d.getDate() 
                               + ' ' + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ]+'</span></div>';
            mission.heure_debut = '<span class="heure_france">' + Jaf.formatValue.Heure( df ) + '</span><span class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</span>';
            
        } else {		 	
            if ( d ) {
                mission.date_debut_texte  = Jaf.formatValue.Date(d);
                mission.date_debut =  '<div class="france' + ( d.getDay()%6==0? ' weekend' : '' ) + '">'
                      + '<span class="jour">'      + Jaf.jourMoyen[ Jaf.LAN_CODE ][ d.getDay() ]+'</span>'
                      + '<span class="numero">'    + d.getDate() + '</span>' 
                      + '<span class="mois">'    + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ] + '</span>'
                      + '</div>';
            }
            mission.heure_debut = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</div>';
            
        }
    } else {
        mission.date_debut = '<div class="inconnu">Date</div>';
    }
    
    if ( mission.MIS_HEURE_FIN ) {
        var decalage = 0;
        if ( decalage && decalage != 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN).getTime()  - decalage * 3600000 );
            mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure( df ) + '</div><div class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
        }			
        mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
    } else {
        mission.heure_fin =  '<div class="inconnu">'+Jaf.translate('DIC_HEURE_FIN')+'</div>'
    }
    
    if ( mission.MIS_TEL_PASSAGER.length > 0) {
        infoPassagers += '<div class="passager">'
                      +    '<div class="nom">' + Jaf.translate('DIC_CONTACT') + '</div>'
                      +    '<a class="telephone" href="tel:' + mission.MIS_TEL_PASSAGER + '">' + mission.MIS_TEL_PASSAGER + '</a>'
                      + '</div>';
    }
    
    for(var i in presences) {
        if (presences[i].PRS_MIS_ID == mis_id && presences[i].PRS_TPP_ID !=3 ) {
            var passager = Jaf.cm.getConcept('C_Gen_Passager').getRow(presences[i].PRS_PAS_ID);
            infoPassagers += '<div class="passager">'
                          +    '<div class="nom">' + passager.PAS_PRENOM+' '+passager.PAS_NOM + ( passager.PAS_FLAG_TPMR==1 ? '<span class="tpmr icone">Õ</span>' : '' ) + '</div>'
                          +    '<a class="telephone" href="tel:' + passager.PAS_TELEPHONE + '">' + passager.PAS_TELEPHONE + '</a>'
                          +    '<div class="note_chauffeur">' + passager.PAS_INFO_CHAUFFEUR + '</div>' 
                          + '</div>';
        }
    }
    mission.infoPassager = infoPassagers;
    return mission;
}

Mobi.ouvreMission = function (eve) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','fAction');
    var mis_id     = !eve.mis_id ? $(this).data('mis_id') : eve.mis_id;
    var limo       = !eve.limo   ? $(this).data('limo')   : eve.limo;
    Mobi.mis_id    = mis_id;
   	var mission    = Mobi.getInfoMission(mis_id,limo); 
    var chauffeur  =  Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(Mobi.chu_id[limo]);  
    mission.flagBtnHeure =  chauffeur.CHU_FLAG_BTN_HEURE_KM == '1' ? true : false;
    var divMission = $( Jaf.tm.render('mission_form', mission ) );

    divMission.find('.btn.cloturer').click(function () {
        var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
        var mission = concept.getRow(mis_id);  
        $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        concept.setValue(mis_id,'MIS_SMI_ID',19);
        concept.save(function() {
            divMission.find('.btn.cloturer').addClass('saveOk');
            divMission.find('.btn.cloturer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_FERMER'));
        });
        $('#listeContent .mission[data-mis_id='+mis_id+']').remove();
        //Mobi.changePage('P_Gen_Mission','lAction');
        Mobi.analyseMission();
    });
    
    if ( 1*mission.MIS_SMI_ID==16 ) {
        divMission.find('.boutonBas').addClass('confirmation');
        divMission.find('.btn.confirmer').click(function() {
            var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
            $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
            concept.setValue(mis_id,'MIS_SMI_ID',4);
            concept.save(function() {
                divMission.find('.btn.confirmer').addClass('saveOk');
                divMission.find('.btn.confirmer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_CONFIRMER'));
            });
            $('#listeContent .mission[data-mis_id='+mis_id+']').remove();
        });
        
    } else {
        divMission.find('.boutonBas').removeClass('confirmation');
    }
    
    divMission.find('.frais').data('mis_id',mis_id).data('limo',limo).click(function () {
        Mobi.ouvreFrais($(this).data('mis_id'),$(this).data('limo'));
    });
    
    divMission.find('.heures').data('mis_id',mis_id).data('limo',eve.limo).click(function () {
        Mobi.ouvreHeure($(this).data('mis_id'),$(this).data('limo'));
    });    
    if ( mission.MIS_SMI_ID==11 ||mission.MIS_SMI_ID==8 ||mission.MIS_SMI_ID==9 || mission.MIS_SMI_ID==20   ) {
        divMission.find('.boutonBas').addClass('cloture');
    } else {
        divMission.find('.boutonBas').removeClass('cloture');
    }
    if ( mission.MIS_FLAG_MODIFIE==1 ) {
        Jaf.cm.getConcept(eve.limo+'.C_Gen_Mission').setValue(mis_id,'MIS_FLAG_MODIFIE',0).save();
    }
    if ( mission.MIS_PANNEAU && mission.MIS_PANNEAU.length>0 ) {
          divMission.find('.ouvrePanneau').click(function () {
             var panneau = $('<div id="zonePanneau"><p>'+mission.MIS_PANNEAU+'</p></div>');
             panneau.click(function() { $(this).remove(); delete(Mobi.setTaillePanneau.borne) });
             $('body').append(panneau);
             Mobi.setTaillePanneau();
          });
    } else {
         $('#sectionPanneau').hide();
    }
    
    $('#fiche').html( divMission );
}

Mobi.setTaillePanneau = function () { 
    var panneau = $('#zonePanneau p'); 
    if (panneau.length>0) {
        var hauteur = $(window).height();
        $('#zonePanneau').css('height',hauteur+'px');
        window.scrollTo(0,0);
        if ( !Mobi.setTaillePanneau.borne) {
            Mobi.setTaillePanneau.borne = { max : 350 , hauteur : hauteur, largeur : $(window).width() };
        }
        panneau.css('font-size', Mobi.setTaillePanneau.borne.max+'px'); 
        setTimeout(function () {
            var h1   = panneau.height();
            var l1   = panneau.width();
            if ( Mobi.setTaillePanneau.borne && ( h1 > Mobi.setTaillePanneau.borne.hauteur  || l1>Mobi.setTaillePanneau.borne.largeur) ) {
                Mobi.setTaillePanneau.borne.max -= Math.max(1,5*h1/Mobi.setTaillePanneau.borne.hauteur-1,5*l1/Mobi.setTaillePanneau.borne.largeur-1);
                Mobi.setTaillePanneau();
            }
        },100);
    }
};

Mobi.ouvreRecepisse = function (mis_id,limo) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','fAction');
    var mission    = Mobi.getInfoMission(mis_id,limo);  
    var divMission = $( Jaf.tm.render('mission_recepisse', mission ) );
    $('#fiche').html( divMission );
}

Mobi.ouvreReglement = function (rel_id,limo) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Com_Reglement','fAction');
    var reglement     = Jaf.cm.getConcept(limo+'.C_Com_Reglement').getRow(rel_id);  
    reglement.mres    = Jaf.cm.getListeTML(limo+'.C_Com_ModeReglement').liste;
    reglement.montant = reglement.REL_MONTANT_REGLER>0 ?  reglement.REL_MONTANT_REGLER : reglement.REL_MONTANT_ECHEANCE;
    var divReglement = $( Jaf.tm.render('mission_reglement', reglement ) );
    $('#reglement').html( divReglement );
    divReglement.find('.btn.confirmer').data('limo',limo).click(function() {
        var limo = $(this).data('limo');
        if ( $('#REL_MONTANT_REGLER').val().length>0) {
            var concept = Jaf.cm.getConcept(limo+'.C_Com_Reglement'); 
            $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
            divReglement.find('input,select,textarea').each(function () {
                concept.setValue(rel_id, $(this).attr('name') , $(this).val() );
            });
            concept.setValue(rel_id, 'REL_DATE_REGLEMENT' , Jaf.date2mysql( new Date() ) );
            concept.setValue(rel_id, 'REL_CHU_ID' , Mobi.chu_id[limo]);
            concept.setValue(rel_id, 'REL_FLAG_RECEPTION_CHAUFFEUR' , 1);
            
            concept.save(function() {
                divReglement.find('.btn.confirmer').addClass('saveOk');
                divReglement.find('.btn.confirmer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_SAUVER'));
            });
        } else {
            jaf_dialog('Vous devez saisir le montant encaissé');
        }
    });
}

Mobi.ouvreFrais = function (mis_id,limo) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','frais');
    var mission    =  Jaf.cm.getConcept(limo+'.C_Gen_Mission').getRow(mis_id);  
    var divMission = $( Jaf.tm.render('mission_frais', mission ) );
    divMission.find('select[name=MIS_REPAS_QTE]').val(mission.MIS_REPAS_QTE);
    $('#frais').html( divMission );
    divMission.find('.btn.confirmer').data('limo',limo).click(function() {
        var limo    = $(this).data('limo'); 
        var concept = Jaf.cm.getConcept(limo+'.C_Gen_Mission'); 
        $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        divMission.find('input,select,textarea').each(function () {
           
            concept.setValue(mis_id, $(this).attr('name') , $(this).val() );
        });
        
        concept.save(function() {
            divMission.find('.btn.confirmer').addClass('saveOk');
            divMission.find('.btn.confirmer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_SAUVER'));
        });
    });
}

Mobi.ouvreHeure = function (mis_id,limo) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','kmEtHeure');
    var mission    =  Jaf.cm.getConcept(limo+'.C_Gen_Mission').getRow(mis_id);  
    mission.etapes = Mobi.fonctionsCel.getEtape(mis_id);
    for(var i in mission.etapes) {
        mission.etapes[i].libelle = Mobi.fonctionsCel.getLibelleLieuEtape(mission.etapes[i],limo);
    }
                    
    var divMission = $( Jaf.tm.render('mission_heure', mission ) );
    $('#kmEtHeure').html( divMission );
    divMission.find('.btn.confirmer').data('limo',limo).click(function() {
        var limo    = $(this).data('limo');
        var concept = Jaf.cm.getConcept(limo+'.C_Gen_Mission'); 
        $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        divMission.find('input,select,textarea').each(function () {
            var nomChamp = $(this).attr('name');
            if ( nomChamp.substr(0,3)=='EPR') {
                Jaf.cm.getConcept(limo+'.C_Gen_EtapePresence').setValue( $(this).data('epr_id') , $(this).data('role') , $(this).val() );
            } else {
                concept.setValue(mis_id, nomChamp , $(this).val() );
            }
        });
        Jaf.cm.getConcept(limo+'.C_Gen_EtapePresence').save();
        concept.save(function() {
            divMission.find('.btn.confirmer').addClass('saveOk');
            divMission.find('.btn.confirmer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_SAUVER'));
        });
    });
}

// à faire par nicolas
Mobi.ouvreGoogleAgenda = function () {
    Mobi.closePopup('outils');
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Chauffeur','fAction');
    var chauffeur    =  Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(Mobi.chu_id);  
    var params       = { compte : false};
    if ( chauffeur.CHU_GOOGLE_TOKEN && chauffeur.CHU_GOOGLE_TOKEN.length>0 ) {
        params.compte = chauffeur;  
    } 
    var divMission = $( Jaf.tm.render('mission_google', params ) );
   
    $('#googleAgenda').html( divMission );
    divMission.find('.btn.confirmer').click(function() {
       
        $(this).html('<span class="icone">Ü</span><br>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        var params = {
            o            : 'saveGoogleAgendaLimoDriver',
            google_login : divMission.find('[name=google_login]').val(), 
            google_mdp   : divMission.find('[name=google_mdp]'  ).val(), 
        }
        $.post('/mobi/google/agenda/',params,function(msg) {
            divMission.find('.btn.confirmer').addClass('saveOk');
            divMission.find('.btn.confirmer')
            divMission.find('.btn.confirmer').html('<span class="icone">ô</span><br>'+Jaf.translate('DIC_MISSION_SAUVER'));
            alert(msg);
            Mobi.ouvreGoogleAgenda();
        });
    });
    return false;
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
        $('#outils').prepend('<p>'+Jaf.translate('DIC_NOUVELLE_VERSION')+'</p><a href="#" onclick="javascript:window.location.reload(true); return false;">'+Jaf.translate('DIC_TELECHARGER')+'</a>');
        Mobi.openPopup('outils');
    } else {
        Mobi.newversion = true;
    }
}); 

Jfo.setNoUpdateFonctions('update',function() {
     Jaf.log('ld à jour','ok');
});

$(document).ready(function(){
    /*
            var obj = {};
            for( var i=0; i<1000;i++) {
                obj['c'+i] = {"MIS_ID":i,"MIS_COM_ID":"10624","MIS_NUMERO":"1","MIS_VERSION":"2","MIS_DATE_DEBUT":"2015-06-01","MIS_HEURE_DEBUT":"15:00:00","MIS_HEURE_FIN":"19:00:00","MIS_PAX":"2","MIS_VOI_ID":"14","MIS_CHU_ID":"1","MIS_SMI_ID":"4","MIS_PAR_ID":"1","MIS_NOTE_CHAUFFEUR":null,"MIS_REF_MISSION_CLIENT":null,"MIS_PANNEAU":"HOP LE BEAU PANNEAU","MIS_LISTE_PASSAGERS":null,"MIS_PJ":null,"MIS_HEURE_REEL_DEBUT":"14:02:19","MIS_HEURE_REEL_FIN":"14:05:34","MIS_KM_DEBUT":"15204","MIS_KM_FIN":"16117","MIS_PROGRAMME":null,"MIS_NOTE_INTERNE":null,"MIS_TSE_ID":"1","MIS_TVE_ID":"2","MIS_FLAG_CONTROL":"1","MIS_PC_NUM_TRANSPORT":null,"MIS_PC_HEURE_TRANSPORT":null,"MIS_DE_NUM_TRANSPORT":null,"MIS_DE_HEURE_TRANSPORT":null,"MIS_ITINERAIRE":"","MIS_DATE_FLAG_CONTROL":"2015-04-26 14:29:03","MIS_FLAG_MODIFIE":"1","MIS_INFO_FACTURE":null,"MIS_GOOGLE_KM_PREVU":"615.0","MIS_GOOGLE_HEURE_PREVU":"05:49:00","MIS_REPAS_QTE":"1","MIS_PEAGE":null,"MIS_DEBOURS":null,"MIS_PARKING":null,"MIS_COMMENTAIRE_CHAUFFEUR":"gezvz","MIS_LMI_ID":null,"MIS_HEURE_INCLUS":null,"MIS_KM_INCLUS":null,"MIS_HEURE_DEPOSE":null,"MIS_HEURE_PRISE_EN_CHARGE":null,"MIS_TEL_PASSAGER":"","MIS_ITINERAIRE_LABEL":"","MIS_FLAG_INVISIBLE":"0","MIS_FLAG_NOSHOW":"0","MIS_MMI_ID":"2","chauffeur":"iannis<br>COUTY","typeVehicule":"Berline","date_debut":"<div class=\"france\"><span class=\"jour\">Mon</span><span class=\"numero\">1</span><span class=\"mois\">June</span></div>","heure_debut":"<div class=\"heure_france\">15:00</div>","heure_fin":"<div class=\"heure_france\">19:00</div>","client":"LAURE COMPAGNY","lieu_prise_en_charge":"<span class=\"heure\">15h00</span><div class=\"libelle\"><span class=\"titre\">bureau agwc</span> <span class=\"adresseFormated\">30 Rue des Chardonnerets, 93290 Tremblay-en-France, France</span> <span class=\"infoLieu\">+0663942550</span></div>","lieu_depose":"<span class=\"heure\">19h00</span><div class=\"libelle\"> <span class=\"adresseFormated\">33 Rue de la Pompe, 75116 Paris, France</span></div>"};
            }
            var t1 = new Date();
            localStorage.setItem('bdd_dev_C_Gen_Mission',JSON.stringify( obj ) );
            var txt = localStorage.getItem('bdd_dev_C_Gen_Mission');
            var json = JSON.parse(txt);
            var t2 = new Date();
            alert('arrivée : en ' + ( t2.getTime() - t1.getTime() ) +' ms' );
*/
    
    Mobi.init('ld');
});
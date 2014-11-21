/**
 * fonction aide
 */
  function print_r(obj) {
  win_print_r = window.open('about:blank', 'win_print_r');
  win_print_r.document.write('<html><body><ul>');
  r_print_r(obj, win_print_r);
  win_print_r.document.write('</ul></body></html>');
 }

 
 //Sous-fonction pour print_r
 function r_print_r(theObj, win_print_r) {
  if(theObj.constructor == Array ||
   theObj.constructor == Object){
   if (win_print_r == null)
	win_print_r = window.open('about:blank', 'win_print_r');
   }
   for(var p in theObj){
	if(theObj[p].constructor == Array||
	 theObj[p].constructor == Object){
	 win_print_r.document.write("<li>["+p+"] =>"+typeof(theObj)+"</li>");
	 win_print_r.document.write("<ul>")
	 r_print_r(theObj[p], win_print_r);
	 win_print_r.document.write("</ul>")
	} else {
	 win_print_r.document.write("<li>["+p+"] =>"+theObj[p]+"</li>");
	}
   }
  //win_print_r.document.write("</ul>")
 }    
 
 sprintfWrapper = {

 	init : function () {

 		if (typeof arguments == "undefined") { return null; }
 		if (arguments.length < 1) { return null; }
 		if (typeof arguments[0] != "string") { return null; }
 		if (typeof RegExp == "undefined") { return null; }

 		var string = arguments[0];
 		var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
 		var matches = new Array();
 		var strings = new Array();
 		var convCount = 0;
 		var stringPosStart = 0;
 		var stringPosEnd = 0;
 		var matchPosEnd = 0;
 		var newString = '';
 		var match = null;

 		while (match = exp.exec(string)) {
 			if (match[9]) { convCount += 1; }

 			stringPosStart = matchPosEnd;
 			stringPosEnd = exp.lastIndex - match[0].length;
 			strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

 			matchPosEnd = exp.lastIndex;
 			matches[matches.length] = {
 				match: match[0],
 				left: match[3] ? true : false,
 				sign: match[4] || '',
 				pad: match[5] || ' ',
 				min: match[6] || 0,
 				precision: match[8],
 				code: match[9] || '%',
 				negative: parseInt(arguments[convCount]) < 0 ? true : false,
 				argument: String(arguments[convCount])
 			};
 		}
 		strings[strings.length] = string.substring(matchPosEnd);

 		if (matches.length == 0) { return string; }
 		if ((arguments.length - 1) < convCount) { return null; }

 		var code = null;
 		var match = null;
 		var i = null;

 		for(var i=0; i<matches.length; i++) {

 			if (matches[i].code == '%') { substitution = '%' }
 			else if (matches[i].code == 'b') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'c') {
 				matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'd') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'f') {
 				matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'o') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 's') {
 				matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'x') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'X') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
 				substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
 			}
 			else {
 				substitution = matches[i].match;
 			}

 			newString += strings[i];
 			newString += substitution;

 		}
 		newString += strings[i];

 		return newString;

 	},

 	convert : function(match, nosign){
 		if (nosign) {
 			match.sign = '';
 		} else {
 			match.sign = match.negative ? '-' : match.sign;
 		}
 		var l = match.min - match.argument.length + 1 - match.sign.length;
 		var pad = new Array(l < 0 ? 0 : l).join(match.pad);
 		if (!match.left) {
 			if (match.pad == "0" || nosign) {
 				return match.sign + pad + match.argument;
 			} else {
 				return pad + match.sign + match.argument;
 			}
 		} else {
 			if (match.pad == "0" || nosign) {
 				return match.sign + match.argument + pad.replace(/0/g, ' ');
 			} else {
 				return match.sign + match.argument + pad;
 			}
 		}
 	}
 }

 

/**
 * Fonctions communes à tous les FO et tous les BOP
 */ 
 
 
 function jaf_Query(url) {
    var reg=new RegExp("[?&=]", "g");
    var queryString = action.split(reg);
    this['script'] = queryString[0];
    for(var  i = 1  ; i < queryString.length ; i=i+2 ) {
         this[queryString[i]] = queryString[i+1];
    }
    this.getUrl = function () {
        var tab_url = new Array();
        for ( var e in this ) {
             if ( e != 'script' &&
                  e != 'getUrl' )
                tab_url.push(e+'='+this[e]);
        }
        return this['script']+'?'+tab_url.join('&');
    }
}
function jaf_sendForm(obj) {
    action = $(obj).prop('action');// passé à prop car plante dans vos pages, vos objets quand on enregistre un tinymce
	method = $(obj).prop('method');
	// @TODO  il faudrait detected tous les objets contenant o comme nom 
    var o = $(obj).find('[name=o]').val();
    if (o && o.length==0) {
        o = $(obj).attr('o');
    }
    action = action=='' ? window.location.href : action;
	if (o && o.length > 0 ) {
        var maq = new jaf_Query(action);
        maq.o = o;
        action = maq.getUrl();
    }
    window.status=action;
    /*
	if (method == 'post')
		$.post(action,$(obj).serialize(), function(data) {
			  eval(data);
		});
	else
		$.get(action,$(obj).serialize(), function(data) {
			  eval(data);
		});
    */
    
    $.ajax({
        type:method, 
        url:action, 
        data:$(obj).serialize(),
        async:false,
    }).done(function ( data ) {
        if (data.length>0) {
            eval(data);
        }
    });
		
}
function jaf_majAjax( champ , nom_champ , nom_concept , id , cle ) {
	 jaf_majAjax_Aux( champ , nom_champ , nom_concept , id , cle,  $(champ).val() );
}

function jaf_majAjax_Aux( champ , nom_champ , nom_concept , id , cle,val ) {
    $.post('/majAjax',
    		{   id      : champ.id,   
                champ   : nom_champ,      
                concept : nom_concept,
    	        primary : id,         
                valeur  : val,   
                cle     : cle
    		}, function(data) {eval(data);});
}

function zaf_cocheTout(selecteur) {
	$(selecteur).each(function () {
		if ($(this).attr("checked"))
			$(this).removeAttr("checked");
		else {
			$(this).attr("checked",'checked');
		}
		$(this).change();
	});
}
/**
 * jaf_plus : permet de faire apparaire le div class=closed et faire disparaitre le div open sur click de la class=clickable
 * @param speed : temps mis pour l'apparition de la zone fermée
 */
$.fn.jaf_plus = function(options) {
    var defaults = {speed: 350};
    var opts = $.extend(defaults, options);    // la fonction extend() permet d'ajouter la gestion des options par défaut.
    return this.each(function() {
      var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
      $('.closed',this).css('display','none');
      $('.clickable',this).css('cursor','pointer');
      $('.open.clickable,.open .clickable',this).unbind('click').bind('click',function() {zone=$(this).closest('.jaf_plus'); $('.open',zone).slideUp(0); $('.closed',zone).slideDown(o.speed);});
      $('.closed.clickable,.closed .clickable',this).unbind('click').bind('click',function() {zone = $(this).closest('.jaf_plus');$('.closed',zone).slideUp(o.speed);$('.open',zone).slideDown(0);});
    });
};

$.fn.jaf_post = function(options) {
    var defaults = { href : document.location.href }; 
    var opts = $.extend(defaults, options); 
    return this.each(function() { 
        $(this).css('cursor','pointer').unbind('click').bind('click',function(){
            for (var i=0,l=this.attributes.length;i<l;i++) {
          		opts[this.attributes[i].nodeName] = this.attributes[i].nodeValue; 
            }
            opts = addOptsId(opts,this);
            $.post(opts.href,opts,function(data){eval(data);});
            return(false);});});
}; 

function addOptsId(opts,obj) {
    re = new RegExp('^([a-zA-Z_]+)([0-9]+)$');
    if ( m = re.exec(obj.id) )
        opts[m[1]]=m[2];
    return (opts);    
}

function ouvreInfo(id,w) {
  $(id).dialog({ 
                 width: w,
                 modal: true });
}

function zaf_accordeon(id) {
	etat = $(id).css('display');
	if (etat=='none') {
		$(id).show('slow');
		
	} else {
		$(id).hide('slow');
		
	}
}

function compte_a_rebours(obj, annee , mois , jour , heure , min) {
	var date_fin=new Date(annee,mois-1,jour,heure,min)
	var date_jour=new Date();
	var tps=(date_fin.getTime()-date_jour.getTime())/1000;
	var j=Math.floor(tps/3600/24);     	// récupere le nb de jour
	tps=tps % (3600*24);
	var h=Math.floor(tps / 3600);		// recupère le nb d'heure
	tps=tps % 3600;
	var m=Math.floor(tps/60);		// récupère le nb minute
	tps=tps % 60
	var s=Math.floor(tps);
	$(obj).find('.compte_a_rebours_jours').html(j);
	$(obj).find('.compte_a_rebours_heure').html(h);
	$(obj).find('.compte_a_rebours_minute').html(m);
	$(obj).find('.compte_a_rebours_seconde').fadeOut(250,function () {
															  $(this).html(s).fadeIn(250);
													     });
}

function zaf_deplie(obj,id) {
	nom_image = $(obj).prop('src');
	if (nom_image.indexOf('ouvert')>0) {
		var reg=new RegExp("(ouvert)", "g");
		nom_image = nom_image.replace(reg,'fermer');
        $('#'+id).hide('slow');
	} else {
		var reg=new RegExp("(fermer)", "g");
		nom_image = nom_image.replace(reg,'ouvert');
        $('#'+id).show('slow');
	}
	$(obj).prop('src',nom_image);
}

function jaf_indicateur_majAjax(champ) {
	if ($('#'+champ).prop('type') == 'checkbox') {
	  alert('ok');
	} else {
		couleur_fond = $('#'+champ).css('background-color');
    $('#'+champ).animate({backgroundColor: '#80FF80'},300).animate({backgroundColor: '#80FF80'},1000).animate({backgroundColor: couleur_fond},300);
	}
}

function FormulaireEtape_Precedent(id) {
    var numetape = FormulaireEtape_numetape['f'+id];
    var effet    = FormulaireEtape_typeEffect[id];
    if (numetape > 0 ) {
		switch (effet) {
		case 'formulaireEtape-accordion' :
			$('#etape-'+id+'-'+numetape).slideUp(500);
			numetape--;
			FormulaireEtape_numetape['f'+id]--;
			$('#etape-'+id+'-'+numetape).slideDown(500);
			break;
		default:
		    	$('#conteneurForm-etape-'+id+'-'+numetape).hide();
		    	numetape--;
		    	$('#conteneurForm-etape-'+id+'-'+numetape).show();
		    	FormulaireEtape_numetape['f'+id]--;
		    
		break;
		}
	}
}

function FormulaireEtape_Suivant(id,etape_suivante) {
	var numetape = 	FormulaireEtape_numetape['f'+id];
    var effet = FormulaireEtape_typeEffect[id];
	switch (effet) {
	case 'formulaireEtape-accordion' :
		$('#etape-'+id+'-'+numetape).slideUp(500);
		$('#etape-'+id+'-'+numetape).parent().find('.formulaireEtape-accordion').slideUp(500,function () {
			$('#etape-'+id+'-'+numetape).find('#etape_suivante').val(numetape+1);
			$('#etape-'+id+'-'+etape_suivante).slideDown(500);
			$('#etape-'+id+'-'+etape_suivante).parent().find('.description-form').slideDown(500);
		});
		FormulaireEtape_numetape['f'+id] = etape_suivante;
		
		break;
	default:
		$('#conteneurForm-etape-'+id+'-'+numetape).hide();
		numetape++;
		$('#conteneurForm-etape-'+id+'-'+numetape).show();
		FormulaireEtape_numetape['f'+id]=etape_suivante;
		break;
		
	}
}

function FormulaireEtape_submit(id,numetape_next) {
	var numetape = FormulaireEtape_numetape['f'+id];
    var effet    = FormulaireEtape_typeEffect[id];
   //alert(numetape_next);
	switch (effet) {
	case 'formulaireEtape-accordion' :
		//$('#etape-'+id+'-'+numetape).slideUp(500);
		//$('#etape-'+id+'-'+numetape).parent().find('.description-form').slideUp(500);
		break;
	default:
		$('#conteneurForm-etape-'+id+'-'+numetape).hide();
		break;
		
	}
	$('#etape-'+id+'-'+numetape).find('#etape_suivante').val(numetape_next);
	$('#etape-'+id+'-'+numetape).submit();
}

function FormulaireEtape_unsubmit() {
    $('.formulaireEtape').each(function () {
	    $(this).unbind('submit').submit(function () {
	    	jaf_dialog('Chargement du formulaire en cours, veuillez recommencer dans 2 secondes.<br>Installation in progress, please wait');
	    	return false;
	    });
    });
    $('.formulaireEtape-accordion').each(function () {
	    $(this).unbind('submit').submit(function () {
	    	jaf_dialog('Chargement du formulaire en cours, veuillez recommencer dans 2 secondes.<br>Installation in progress, please wait');
	    	return false;
	    });
    });
	
}

function FormulaireEtape_initEffect() {
	// Effet slide de page
	$('.formulaireEtape').each(function () {
        $(this).unbind('submit').submit(function() {
	    	jaf_sendForm(this); 
            return false;
	    });
	    tab = $(this).prop('id').split('-');
	    id = tab[1];
	    numetape = tab[2];
	    if ( FormulaireEtape_numetape['f'+id] == null) {
	    	FormulaireEtape_numetape['f'+id] = 0;
	    }

	    if ( !(numetape ==  FormulaireEtape_numetape['f'+id])) {
			// masque les formulaires des étapes 1 et plus
			$(this).parents('.conteneur-form').each(function () {
				$(this).hide();
			});
	    }
		FormulaireEtape_typeEffect[id]='formulaireEtape';
	});
	
	// Effet slide de page
	$('.formulaireEtape-accordion').each(function () {
		$(this).unbind('submit').submit(function() {
	    	jaf_sendForm(this); 
	        return false;
	    });
	    tab = $(this).prop('id').split('-');
	    var id = tab[1];
	    var numetape = tab[2];
	    var mon_h4 = $(this).parent().find('.label-form');
		mon_h4.css('cursor','pointer');
		mon_h4.unbind('click').click(function() {
	    	 FormulaireEtape_submit(id,numetape);
	    }); 
		if ( FormulaireEtape_numetape['f'+id] == null) {
		    	FormulaireEtape_numetape['f'+id] = 0;
		}
		if ( numetape !=  FormulaireEtape_numetape['f'+id] ) {
			// masque les formulaires des étapes 1 et plus
			$(this).hide();
			$(this).parent().find('.description-form').hide();
		}
		
		FormulaireEtape_typeEffect[id]='formulaireEtape-accordion';
	});
	
	
}
function  FormulaireFichier_ajouteFichier(objId,nomFichier) {
	with (parent) {
		var ancien = $(objId).val();
		$(objId).val(ancien+';'+nomFichier);
		var mon_iframe=$(objId).next();
		var mon_ul = mon_iframe.contents().find('#Fichier');
		//jaf_donneTaille(mon_ul,mon_iframe);
	}
}
/*
function  FormulaireFichier_deleteFichier(objId,nomFichier) {
	with (parent) {
		var ancien = $(objId).val();
		var nouveau = ancien.replace(new RegExp("(\;"+nomFichier+")","g"),'');
		alert('nouveau');
		$(objId).val(nouveau);
		$(objId).next().detach();
		FormulaireFichier_createEffect($(objId));
	}
}
*/
function envoi_en_cours(id) {
	$(id).hide()
	$(id).after('<marquee>Envoi en cours... Veuillez patienter avant de valider le formulaire ou cette étape...</marquee>');
	$(id).submit();
}

function jaf_donneTaille(obj1,obj2) {
	var width = obj1.width();
	var height = obj1.height();
	if (width > 0 && height > 0 ) {
    obj2.css('width',width+10);
  	obj2.css('height',height+10);
  }
}

var FormulaireEtape_numetape= new Array();
var FormulaireEtape_typeEffect= new Array();
var tab_mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function jaf_dialog(chaine) {
	$('<div>'+chaine+'</div>').dialog( { 
		buttons: {
		  Ok: function() {
			  $(this).dialog('close');
		  }
	    }
	   }
	);
}
function jaf_dateListe_recalcul(id) {
		var secondes = $('#'+id+'-secondes').length  ? $('#'+id+'-secondes').val() : 0;
		var minutes  = $('#'+id+'-minutes').length   ? $('#'+id+'-minutes').val()  : 0;
		var heures   = $('#'+id+'-heures').length    ? $('#'+id+'-heures').val()   : 0;
		if ($('#'+id+'-date').length) {
			var tab = $('#'+id+'-date').val().split('/');
			var jours    = tab[0];
			var mois     = tab[1]-1;
			var annees   = tab[2];
		    ma_date= new Date(annees, mois, jours, heures, minutes, secondes);
		} else {
			if ( $('#'+id+'-jours').val().length==0 || 
			     $('#'+id+'-mois').val().length==0  || 
			     $('#'+id+'-annees').val().length==0 ) {
				return 0;
			}
			var jours    = $('#'+id+'-jours').length     ? $('#'+id+'-jours').val()    : 0;
			var mois     = $('#'+id+'-mois').length      ? $('#'+id+'-mois').val()     : 0;
			var annees   = $('#'+id+'-annees').length    ? $('#'+id+'-annees').val()   : 0;
		    ma_date= new Date(annees, mois, jours, heures, minutes, secondes);
		}
		
		var val = sprintf('%04d-%02d-%02d',ma_date.getFullYear(),ma_date.getMonth()+1,ma_date.getDate() );
		if ( !(ma_date.getHours() == 0 && 
			 ma_date.getMinutes() == 0 &&
			 ma_date.getSeconds() == 0 )) {
			val+= ' '+sprintf('%02d:%02d:%02d',ma_date.getHours(),ma_date.getMinutes(),ma_date.getSeconds());
		}
	    $('#'+id).val(val);
	    $('#'+id).change();
	    
}

function jaf_date_install(obj,hasTime,type) {
	var id = obj.prop('id');
	var value = obj.val();
	var mon_heure = '';
	if (value.length > 0 ) {   
       var tab = value.split(new RegExp(" ","g"));
       if (tab.length == 2) {
    	   var value = tab[0]; 
    	   var tab = tab[1].split(new RegExp(":","g")); 
    	   var heure=tab[0]; 
    	   var minute=tab[1]; 
    	   var seconde=tab[2]; 
    	   hasTime=true;
       }
       var tab = value.split(new RegExp("-","g"));
       if ( tab.length==3 )      {
    	   var j=tab[2]; 
    	   var m=tab[1]-1; 
    	   var a=tab[0]; //format anglais
       } else {
            var tab = value.split(new RegExp("/","g"));
            if ( tab.length==3 ) { 
            	var j=tab[0]; 
            	var m=tab[1]-1; 
            	var a=tab[2];
            } //format francais
       }
    }
	var largeur = obj.css('width');
	var lc = hasTime ? 40 : 0;
	largeur = 1*largeur.substr(0,largeur.length-2)-lc*3-28;
	
	if (type == 'liste' ) {
		lj = Math.round(largeur*25/100);
		lm = Math.round(largeur*42/100);
		la = largeur-lj-lm;
		//alert(lj+','+lm+','+la);
		var jours = $('<select id="'+id+'-jours" ><option value="">...</option></select>').css('width',lj+'px');
		for(var i=1;i<32;i++)
			jours.append('<option value="'+i+'"" '+( j==i ? 'selected' : '')+'>'+i+'</option>');
		jours.change(function () {
			jaf_dateListe_recalcul(id);
		});
		
		var mois = $('<select id="'+id+'-mois" ><option value="">...</option></select>').css('width',lm+'px');
		for(var i=0;i<12;i++)
			mois.append('<option value="'+i+'"  '+( m==i ? 'selected' : '')+'>'+tab_mois[i]+'</option>');
		mois.change(function () {
			jaf_dateListe_recalcul(id);
		});
	
		var annee_min = obj.attr('valeurMin');
		var annee_max = obj.attr('valeurMax');
		var aujourdhui = new Date();
		if (!annee_min)
			var annee_min = aujourdhui.getFullYear()-100;
		if (!annee_max)
			var annee_max = aujourdhui.getFullYear();
		
		var annees = $('<select id="'+id+'-annees"><option value="">...</option></select>').css('width',la+'px');
		for(var i=annee_max;i>=annee_min;i--)
			annees.append('<option value="'+i+'"  '+( a==i ? 'selected' : '')+'>'+i+'</option>');
		annees.change(function () {
			jaf_dateListe_recalcul(id);
		});
	}

	
	if (hasTime) {
    	var heures = $('<select id="'+id+'-heures" ><option value="">...</option></select>').css('width',lc+'px');
    	for(var i=0;i<24;i++)
    		heures.append('<option value="'+i+'" '+( heure==i ? 'selected' : '')+'>'+i+'</option>');
    	heures.change(function () {
    		jaf_dateListe_recalcul(id);
    	});
    	var minutes = $('<select id="'+id+'-minutes" ></select>').css('width',lc+'px');
    	for(var i=0;i<61;i++)
    		minutes.append('<option value="'+i+'" '+( minute==i ? 'selected' : '')+'>'+i+'</option>');
    	minutes.change(function () {
    		jaf_dateListe_recalcul(id);
    	});

    	var secondes = $('<select id="'+id+'-secondes"></select>').css('width',lc+'px');
    	for(var i=0;i<61;i++)
    		secondes.append('<option value="'+i+'" '+( seconde==i ? 'selected' : '')+'>'+i+'</option>');
    	secondes.change(function () {
    		jaf_dateListe_recalcul(id);
    	});
    	if (type == 'picker') {
      		//alert(j+','+m+','+a);
    		var valeur = (j && a) ? sprintf("%02d/%02d/%04d",1*j,1*m+1,1*a) : '' ;
    		var dateaff = $('<input type="text" id="'+id+'-date" value="'+valeur+'">').css('width',(largeur-6)+'px').datepicker();
        	dateaff.change(function () {
        		jaf_dateListe_recalcul(id);
        	});

    	} 

    } 
	switch(type) {
		case 'liste'  : 
			if (hasTime)
				obj.after(secondes).after('<span class="separateur">m</span>').after(minutes).after('<span class="separateur">h</span>').after(heures).after('<span class="separateur"> à </span>').after(annees).after(mois).after(jours);
			else
				obj.after(annees).after(mois).after(jours); 	
			obj.hide();
		    break;
		case 'picker' :    	
			if (hasTime) {
				obj.after(secondes).after('<span class="separateur">m</span>').after(minutes).after('<span class="separateur">h</span>').after(heures).after('<span class="separateur"> à </span>').after(dateaff);
				obj.hide();
			}
            break;
		default : 
	}

}

function date_initEffect () {
	$(".dateListe[type=text]").each(function () {
		jaf_date_install($(this),false,'liste');
	});
	$(".dateTimeListe[type=text]").each(function () {
		jaf_date_install($(this),true,'liste');
	});
	$(".datePicker[type=text]").each(function () {
		jaf_date_install($(this),false,'picker');
		});
	$(".dateTimePicker[type=text]").each(function () {
		jaf_date_install($(this),true,'picker');
	});
	if ( $.datepicker ) $(".datePicker").datepicker();
}

function colorPicker_initEffect() {
	$('.Champ_Couleur').each(function () {
		$(this).css({
			'background-color' : $(this).html(),
			'color'            : $(this).html(),
			'background-image' : 'none'
		}).hover(function() {
			$(this).css('color','#000');
		},function() {
			$(this).css('color',$(this).html());
		}
		);
	});
    if ($.jPicker) {
        $('.colorPicker').jPicker({
            position:
            {
              x: 'screenCenter',
              y: 'center'
            },
            window:
            {
              expandable: true,
              liveUpdate: true
            },
            images:
            {
              clientPath:'/jquery/images/'
            }
          
          }, function () {
              $(this).change();
          });
         setTimeout("$('.jPicker.Container').css('top','75px');",1000);
    }
}

function sendForm_initEffect() {
	$('.sendForm').each(function () {
		$(this).unbind('submit').submit(function() {
				jaf_sendForm(this); 
	            return false;
		    });
	});
}

function isTerminated(element) {
	alert(element);
	return element==0;
}
function init_effects() {
	FormulaireEtape_unsubmit();
	$(".jaf_plus").jaf_plus();
	$(".jaf_post").jaf_post(); 
	$(".deplie").hide();   
    setTimeout("date_initEffect()",1500);
    setTimeout("FormulaireEtape_initEffect()",2000);
    // on desactive le submit
	sendForm_initEffect();
	colorPicker_initEffect(); 
}
function init_effect_editable(class_ou_id) {
	$(class_ou_id).each(function () {
		$(this).css('border','2px dotted #ff8000').prop('contentEditable',true);
		var icone = $('<img src="/bop2/images/icone/banque_fichier.png" style="position:absolute;top:-10px;left:-10px;cursor:pointer">');
		icone.click(function() {
			alert($(this).next().html());
		});
		$(this).before(icone);
	});
}

function init_effect_message() {
	$(".jaf_message").dialog({
		  modal:true,
		  hide:'fade',
		  buttons: {
			  Ok: function() {
				  $(this).dialog('close');
			  }
		  }
	  }); 
}

var Jaf = {
    version : '1.0',
	backup  : new Array(),
	timer   : new Array(),
	tailleEcranPossible : {has800:800,has1024:1024,has1280:1260,has1600:1600,has1920:1920},
	widthScreenbody:0,
    isMobile : function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check; 
    },
    env : {
        get : function(name) {
            return Jaf.env[name] ? Jaf.env[name] : null;
        },
        set : function(name,value) {
            Jaf.env[name] = value;
            return Jaf.env;
        },
        add : function(obj) {
            for(var i in obj) {
                Jaf.env[i] = obj[i];
            }
        }
    },
	defineScreen : function () {
		var body=$('body');
		if ( Jaf.widthScreenbody==0) {
			$(window).unbind('resize').resize(function () {Jaf.defineScreen()});
		}
		Jaf.widthScreenbody = body.width();
		var classeScreen='has800';
		for(var  i in Jaf.tailleEcranPossible) {
			if ( Jaf.tailleEcranPossible[i] <= Jaf.widthScreenbody ) {
				classeScreen=i;
			}
			body.removeClass(i);
		}
		body.addClass(classeScreen);
		//Jaf.log('résolution ecran width='+Jaf.widthScreenbody+',class='+classeScreen);
		
	},
	Bop3 : {
		isOnBop : false,
		post : function ( concept , action , params ) {
			$.post(Jaf.cm.urlDb+concept+'/'+action,
		    		params, 
		    		function(data) {eval(data);});
		},
		getrow : function ( concept , id , mafonction ) {
			$.get(Jaf.cm.urlDb+concept+'/getrow',
		    		{ID:id}, 
		    		function(data) {
		    			var myObject = eval('(' + data + ')');
		    			mafonction(myObject);
		    		});
		},
		// insere val dans le tinymce id à la position du curseur
		insereHtmlTinymce: function (id,val) {
			tinyMCE.get(id).execCommand('mceInsertContent', false, val);
            //tinyMCE.execInstanceCommand(id,"mceInsertContent",false,val);
		}
	},
    fullscreen : {
        //met un element portant l'id en mode plein ecran
        openById : function (id) {
        	window.fullScreenApi.requestFullScreen(document.getElementById(id));
        },
        initEffect : function () {
            if ( !Jaf.fullscreen.installed ) {
                var fullScreenApi = { 
                        supportsFullScreen: false,
                        isFullScreen: function() { return false; }, 
                        requestFullScreen: function() {}, 
                        cancelFullScreen: function() {},
                        fullScreenEventName: '',
                        prefix: ''
                    },
                    browserPrefixes = 'webkit moz o ms khtml'.split(' ');
                
                // check for native support
                if (typeof document.cancelFullScreen != 'undefined') {
                    fullScreenApi.supportsFullScreen = true;
                } else {	 
                    // check for fullscreen support by vendor prefix
                    for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
                        fullScreenApi.prefix = browserPrefixes[i];
                        
                        if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                            fullScreenApi.supportsFullScreen = true;
                            
                            break;
                        }
                    }
                }
                
                // update methods to do something useful
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
                    
                    fullScreenApi.isFullScreen = function() {
                        switch (this.prefix) {	
                            case '':
                                return document.fullScreen;
                            case 'webkit':
                                return document.webkitIsFullScreen;
                            default:
                                return document[this.prefix + 'FullScreen'];
                        }
                    }
                    fullScreenApi.requestFullScreen = function(el) {
                        return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
                    }
                    fullScreenApi.cancelFullScreen = function(el) {
                        return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
                    }		
                }

                // jQuery plugin
                if (typeof jQuery != 'undefined') {
                    jQuery.fn.requestFullScreen = function() {
                
                        return this.each(function() {
                            var el = jQuery(this);
                            if (fullScreenApi.supportsFullScreen) {
                                fullScreenApi.requestFullScreen(el);
                            }
                        });
                    };
                }

                // export api
                window.fullScreenApi     = fullScreenApi;	
                Jaf.fullscreen.installed = true;
            }
        }
    },
    maps : {
        initEffect : function() {
            if ( !Jaf.maps.flagInit) {
                Jaf.maps.geocoder   = new google.maps.Geocoder();
                Jaf.maps.itineraire = new google.maps.DirectionsService();
                Jaf.maps.flagInit   = true;
            }
        },
        loadMap : function (idmap,depart,idpanel,macallbackfonction) {
            var div_map = $('#'+idmap);
            if ( div_map.length > 0 ) {
                Jaf.maps.initEffect();
                div_map.html('');
                Jaf.maps.geocoder.geocode({
                    address: depart,
                }, function(geoResult, geoStatus) {
                    var res={};
                    if (geoStatus == google.maps.GeocoderStatus.OK) {
                        map = new google.maps.Map(document.getElementById(idmap), {
                            zoom: 11,
                            center: geoResult[0].geometry.location,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        });
                        var marker = new google.maps.Marker({
                        position: geoResult[0].geometry.location,
                        map: map
                        });

                        if (idpanel && idpanel.length > 0) dirRenderer.setPanel(document.getElementById(idpanel));
                        if ( macallbackfonction ) {
                            macallbackfonction(geoResult);
                        }
                    }
                });
            }
        },
        loadMapItineraire : function (idmap,depart,arrivee,idpanel,macallbackfonction) {
            var div_map = $('#'+idmap);
            if ( div_map.length > 0 ) {
                Jaf.maps.initEffect();
                div_map.html('');
                Jaf.maps.geocoder.geocode({
                    address: depart,
                }, function(geoResult, geoStatus) {
                    var res={};
                    if (geoStatus == google.maps.GeocoderStatus.OK) {
                        res.DEPARTS = geoResult;
                        Jaf.maps.geocoder.geocode({
                            address: arrivee,
                        }, function(geoResult, geoStatus) {
                            if (geoStatus == google.maps.GeocoderStatus.OK) {
                                res.ARRIVEES = geoResult;
                                Jaf.maps.itineraire.route({
                                    origin                   : res.DEPARTS[0].geometry.location,
                                    destination              : res.ARRIVEES[0].geometry.location,
                                    travelMode               : google.maps.DirectionsTravelMode.DRIVING,
                                    unitSystem               : google.maps.DirectionsUnitSystem.METRIC,
                                    provideRouteAlternatives : true
                                }, function(dirResult, dirStatus) {
                                    if (dirStatus != google.maps.DirectionsStatus.OK) {
                                        Jaf.log('Directions failed: ' + dirStatus);
                                        return;
                                    }
                                    res.disResult    = dirResult;
                                    res.distance_km  = dirResult.routes[0].legs[0].distance.value/1000;
                                    res.duree_minute = Math.round(dirResult.routes[0].legs[0].duration.value/60);
                                    var heure        = Math.floor(res.duree_minute/60);
                                    var minute       = res.duree_minute - heure*60;
                                    res.duree        = sprintf('%02d:%02d:00',heure,minute);
                                    // Show directions
                                    map = new google.maps.Map(document.getElementById(idmap), {
                                        zoom: 8,
                                        center: res.DEPARTS[0].geometry.location,
                                        mapTypeId: google.maps.MapTypeId.ROADMAP /*[SATELLITE, HYBRID, TERRAIN, ROADMAP]*/
                                    });
                                    dirRenderer = new google.maps.DirectionsRenderer();
                                    dirRenderer.setMap(map);
                                    if (idpanel && idpanel.length > 0) dirRenderer.setPanel(document.getElementById(idpanel));
                                    dirRenderer.setDirections(dirResult);
                                    if ( macallbackfonction ) {
                                        macallbackfonction(res,map);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },

        // type de role data-maps-role : adresse, cp , ville , pays , departement , listeResultat
        getDataListeResultatGeocode : function(data) {
            var result        = [];
            
            for (i in data.results) { 
                var r=data.results[i];
                if ( data.results[i].formatted_address ) {
                    r.type = 'adresse';
                    for (j in data.results[i].address_components) {
                        var ac=data.results[i].address_components[j];
                        if (ac.types.indexOf('postal_code')>-1) {
                            r.cp = ac.long_name;
                        }
                        if (ac.types.indexOf('street_number')>-1) {
                            r.street_number = ac.long_name;
                        }
                        if (ac.types.indexOf('route')>-1) {
                            r.route = ac.long_name;
                        }
                        if (ac.types.indexOf('locality')>-1) {
                            r.ville = ac.long_name;
                        }
                        if ( ac.types.indexOf('country')>-1) {
                            r.pays = ac.long_name;
                        }
                        
                    }
					
                    r.lat = r.geometry.location.lat();
                    r.lng = r.geometry.location.lng();
                    r.adresse = (r.street_number ? r.street_number + ' ' : '' ) + ( r.route ? r.route : '' );
                    result.push(r);
                }
            }

            return result;
        },
        // type de role data-maps-role : adresse, cp , ville , pays , departement , listeResultat
        getDataListeResultatGeocode_new : function(data) {
            var result        = [];
            
            for (i in data) { 
                var r=data[i];
                if ( r.formatted_address ) {
                    for (j in r.address_components) {
                        if (r.address_components[j].types.indexOf('postal_code')>-1) {
                            r.cp = r.address_components[j].long_name;
                        }
                        if (r.address_components[j].types.indexOf('street_number')>-1) {
                            r.street_number = r.address_components[j].long_name;
                        }
                        if (r.address_components[j].types.indexOf('route')>-1) {
                            r.route = r.address_components[j].long_name;
                        }
                        if (r.address_components[j].types.indexOf('locality')>-1) {
                            r.ville = r.address_components[j].long_name;
                        }
                        if ( r.address_components[j].types.indexOf('country')>-1) {
                            r.pays = r.address_components[j].long_name;
                        }
                        if ( r.address_components[j].types.indexOf('street_address')>-1) {
                            r.type = 'adresse';
                        }
                        if ( r.address_components[j].types.indexOf('airport')>-1) {
                            r.type = 'aeroport';
                            r.libelle = r.address_components[j].long_name;
                        }
                        if ( r.address_components[j].types.indexOf('train_station')>-1) {
                            r.type = 'gare';
                            r.libelle = r.address_components[j].long_name;
                        }
                        
                    }
					if ( r.types.indexOf('airport')>-1) {
                            r.type = 'aeroport';
                    }
                    if ( r.types.indexOf('train_station')>-1) {
                            r.type = 'gare';

                    }					
                    r.lat = r.geometry.location.lat();
                    r.lng = r.geometry.location.lng();
                    r.adresse = (r.street_number ? r.street_number + ' ' : '' ) + ( r.route ? r.route : '' );
                    if ( !r.type || r.type.length==0 ) r.type='adresse'; 

                    result.push(r);
                }
            }
            return result;
        },
        initEffect_completeForm : function( monform , callbackfonction ) {
            var form = $(monform);
            form.find('[data-maps-role="adresse"],[data-maps-role="cp"],[data-maps-role="ville"],[data-maps-role="pays"],[data-maps-role="departement"]').keyup(function(){
                if ($(this).val().length>=5) { 
                    var adresseComplete = 
                                (typeof $('[data-maps-role="adresse"]')!='undefined' ? $('[data-maps-role="adresse"]').val() : '');
                        + ' ' + (typeof $('[data-maps-role="cp"]')!='undefined' ? $('[data-maps-role="cp"]').val() : '');
                        + ' ' + (typeof $('[data-maps-role="ville"]')!='undefined' ? $('[data-maps-role="ville"]').val() : '');
                        + ' ' + (typeof $('[data-maps-role="pays"]')!='undefined' ? $('[data-maps-role="pays"]').val() : '');
                        + ' ' + (typeof $('[data-maps-role="departement"]')!='undefined' ? $('[data-maps-role="departement"]').val() : '');
                    $.get('https://maps.googleapis.com/maps/api/geocode/json', {address:adresseComplete, sensor:false}, function(data){
                        street_number = route = locality = country = postal_code = result = '';
                        var results = Jaf.maps.getDataListeResultatGeocode(data);
                        var res='<ul>';
                        for (i in results) {
                            if ( data.results[i].formatted_address ) {
                                res += '<li data-results="'+ i
                                + '" data-geo-adresse="'   + results[i].street_number+' '+results[i].route
                                + '" data-geo-cp="'        + results[i].cp
                                + '" data-geo-ville="'     + results[i].ville
                                + '" data-geo-pays="'      + results[i].pays
                                + '">' + data.results[i].formatted_address + '</li>';
                            }
                        }
                        $('[data-maps-role="listeResultat"]').html( res + '</ul>');
                        $('[data-maps-role="listeResultat"] li').click(function(){
                            
                            for (k in Jaf.maps.listeChampGecode) {
                                if ($(this).data('geo-'+Jaf.maps.listeChampGecode[k])) {
                                    $('input[data-maps-role="'+Jaf.maps.listeChampGecode[k]+'"]').val($(this).data('geo-'+Jaf.maps.listeChampGecode[k]));
                                }
                            }
                             if ( callbackfonction ) callbackfonction( $(this) );
                        });
                    });
                }
            });
            // a declancher quand on a cliqué sur une adresse possible ou que google n'a trouvé qu'une seule adresse
           
        },
        listeChampGecode : ['adresse', 'cp', 'ville', 'pays', 'departement','formatted_address','lat','lng','type','libelle']
    },
    ContrainteSelect : {
		tabCS : new Array(),
		tabPCS : new Array(),

		// ajoute une contrainte sur des listes déroulantes
		add: function ( nom , param ) {
			var tab = new Array();
			for(var i=0;i<param.listeChamp.length;i++) {
				tab[param.listeChamp[i]] = i+1;
			}
			param.listeChampNiveau = tab;
			this.tabCS[nom] = param;
		},
		getNoeudArray : function (n,tab,niveau,id) {
			if (n==niveau) {
				return tab[id]; 
			} else {
				var i=0;
				for(var i in tab) {
					var t = this.getNoeudArray(n+1,tab[i],niveau,id);
					if (t != null) {
						this.tabPCS[n] = i;
						return t;
					}
				}
				return null;
			}
		},
		consListeParNiveau : function (noeud,niveau) {
			if (noeud!=1) {
				for(var n in noeud) {
					if (this.listeParNiveau[niveau]==null) {
						this.listeParNiveau[niveau] = new Array();
					}
					this.listeParNiveau[niveau][n]=1; //.push(n);
					this.consListeParNiveau(noeud[n],niveau+1);
				}
			}
		},
		// applique la contrainte aux listes déroulantes
		appliqueContrainte : function (champ , nom) {
			this.tabPCS = new Array();
			var conf     = this.tabCS[nom];
			var id       = champ.val();
			var nomChamp = champ.attr('name');
			var niveau   = conf.listeChampNiveau[nomChamp];
			if (id.length==0) {
				niveau--;
				id =   $('#'+nom).find('select[name="'+conf.listeChamp[niveau-1]+'"]').val();
				var noeud    = this.getNoeudArray(1,conf.contrainte,niveau,id);
			} else {
				var noeud    = this.getNoeudArray(1,conf.contrainte,niveau,id);
				//positionne les listes parentes
				for(var n in this.tabPCS) {
					$('#'+nom).find('select[name="'+conf.listeChamp[n-1]+'"]').val(this.tabPCS[n]);
				}
			}
			// positionne les listes filles
			this.listeParNiveau = new Array();
			this.consListeParNiveau(noeud,niveau);
			
			for(var n=niveau;n<conf.listeChamp.length;n++) {
				if (n==niveau) {
					  $('#'+nom).find('select[name="'+conf.listeChamp[n]+'"]').parent().slideDown();
				}
				selectAffiche = $('#'+nom).find('select[name="'+conf.listeChamp[n]+'"]');
				var tab       = this.listeParNiveau[n];
				var obj       = selectAffiche.find('option:last');
				var tbackup   = Jaf.backup[conf.listeChamp[n]];
				//tbackup.sort();
				for(var  id in tbackup) {
					var chaine = Jaf.backup[conf.listeChamp[n]][id];
					if ( tab[ id ] == 1 ) {
						obj.after($('<option value="'+id+'">'+chaine+'</option>'));
						delete tbackup[id];
					}
				}
				selectAffiche.find('option').each(function () {
					if ( $(this).val() > 0 && tab[ $(this).val() ] == null ) {
						$(this).detach();
						tbackup[$(this).val()]=$(this).html();
					}
				});
			}
		},
		
		// initialise l'effet des contraintes sur des listes déroulantes
		initEffect : function ( nom , param ) {
			monForm = $('#'+nom);
            if (param.listeChamp) {
                for(var  i in param.listeChamp ) {
                    nomChamp = param.listeChamp[i];
                    monChamp = monForm.find('select[name="'+nomChamp+'"]');
                    if (i>0) {
                        Jaf.backup[nomChamp] = new Array();
                    }
                    monChamp.change( function () {
                        Jaf.ContrainteSelect.appliqueContrainte($(this),nom);
                    });
                    

                }
                if (monChamp.val() > 0) {
                    Jaf.ContrainteSelect.appliqueContrainte(monChamp,nom);
                }
            }
		}
	},
	MegaSelect : {
		faitDisparaitre : function(nomChamp,temps) {
			//alert(Jaf.timer[nomChamp]-temps);
			if ( temps >= Jaf.timer[nomChamp] ) {
				$('#infoBulle'+nomChamp).children().hide();
				$('select[name='+nomChamp+']').focus();
			}
		},
		keyup : function(nomChamp,e,force) {
			
			var moninput = $('#inputinfobulle'+nomChamp);
			var select   = $('#'+nomChamp);
			var listeUl  = moninput.next();
			Jaf.timer[nomChamp] = e.timeStamp;
			$('#infoBulle'+nomChamp).children().show();
			moninput.focus();
			if ( e.keyCode==40 ) {
				if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					li.removeClass('selected');
					li.next().addClass('selected');
				} else {
					listeUl.find('li:first').addClass('selected');
				}
			}
			if ( e.keyCode==38 ) {
				if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					li.removeClass('selected');
					li.prev().addClass('selected');
				} else {
					listeUl.find('li:last').addClass('selected');
				}
			}
			if ( ! (e.which==38 ||  
				 e.which==40)  ) {
				listeUl.html('');
				if (force) {
					moninput.val(moninput.val()+String.fromCharCode(e.which));
				}
				var machaine = moninput.val().toUpperCase();
				var expression = new RegExp('('+machaine+')',"ig");
				var nombre=0;
				select.find('option').each(function (){
					if (nombre<20) {
						var chaine = $(this).html();
						if ( expression.test( chaine ) ) {
							listeUl.append('<li rel="'+$(this).val()+'">'+chaine.replace(expression,'<span class="surligne">$1</span>')+'</li>');
							nombre++;
						}
					}
				});
				listeUl.find('li:first').addClass('selected');
			}
			if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					select.val(li.attr('rel'));
			}
			setTimeout("Jaf.MegaSelect.faitDisparaitre('"+nomChamp+"','"+e.timeStamp+"')",2000);
		},
		initEffect : function (id) {
			$(id).each(function () {
				//pour plus de 15 elements dans la liste
				if ( $(this).find('option').length > 15) {
					var nomChamp = $(this).attr('name');
					var inputinfobulle = $('<input type="text" value="" id="inputinfobulle'+nomChamp+'" rel="'+nomChamp+'">');
					var infobulle = $('<div class="MegaSelectInfobulle" id="infoBulle' + nomChamp + '">'
									+ '<div class="zoneAffichable ui-widget ui-widget-content ui-corner-all"></div></div>');
					infobulle.children().append(inputinfobulle);
					infobulle.children().append($('<ul></ul>'));
					$(this).after(infobulle);
					
					$(this).keypress(function(e) {
						Jaf.MegaSelect.keyup($(this).attr('name'),e,true);
					});
					
					$(inputinfobulle).keyup(function(e) {
						Jaf.MegaSelect.keyup($(this).attr('rel'),e,false);
					});
				}
			});
		}
	},
	
	iframe : {
	    tab : new Array(),
		setClass_Aux : function (class_ou_id,classe) {
			$(class_ou_id).each(function () {
				$(this).contents().find('body').addClass(classe); 
			});
		},
		setClass : function (class_ou_id,classe) {
			Jaf.iframe.tab[class_ou_id] = classe;
		},
		initEffect : function () {
			for(var  class_ou_id in Jaf.iframe.tab ) {
				Jaf.iframe.setClass_Aux(class_ou_id,Jaf.iframe.tab[class_ou_id]);
			}
		}
	},
	
	FormulaireFichier : {
		createEffect : function (obj) {
            var obj      = $(obj).first();
            if (obj.length>0) {
                var name     = obj.attr('name');
                var id       = obj.attr('id');
                var nbmax    = obj.attr('valeurMax');
                var value    = obj.val();
                if ( !value) value='';
                var row_id   = obj.data('row_id');
                var old_file = '';
                if ( value.indexOf('|') > -1 ) {
                    var tab = value.split('|');
                    value    = tab[0];
                    old_file = tab[1];
                }
                var isOnBop  = ( Jaf.Bop3.isOnBop ? '1' : '0' );
                var params = {
                        files     : value,
                        old_file  : old_file,
                        nomChamp  : name,
                        isOnBop   : isOnBop,
                        row_id    : row_id,
                        idChamp   : id
                }
                
                $('#uploadFichierAjout'+id).remove();
                var lienAjout= $('<div id="uploadFichierAjout'+id+'" class="uploadFichierAjout">+ Ajouter des fichiers</div>');
                for(var i in params) {
                    lienAjout.data(i,params[i]);
                }
                lienAjout.click(function() {
                    var files    = $(this).data('files');
                    var old_file = $(this).data('old_file');
                    var row_id   = $(this).data('row_id');
                    $.fancybox({
                        content    : '<iframe src="/tools/upload-fichier/getformfile?idChamp='+id+'&nomChamp='+name+'&file='+files+'&old_file='+old_file+'&row_id='+row_id+'" id="uploadFichier'+id+'" class="uploadFichierFrame" ALLOWTRANSPARENCY="true"></iframe>'
                    });
                   
                });
                if ( value.length>0) {
                    var t=value.split(';');
                    if ( t.length > nbmax ) {
                       lienAjout.addClass("uploadFichierHide");
                    }
                }
                obj.after(lienAjout);
                $.post('/tools/upload-fichier/load',params,function(data) {
                    $('#uploadFichierVue'+id).remove();
                    $(lienAjout).after('<div id="uploadFichierVue'+id+'" class="uploadFichierContenu">'+data+'</div>');
                });
                obj.hide();
            }
		},
        delete_file : function(obj,nomChamp) {
            var old_file     = $("#uploadFichierAjout"+nomChamp).data('old_file');
            var fichier_supp = obj.parent();
            if (!old_file) old_file='';
            old_file = ';'+fichier_supp.data('value')+old_file;
            fichier_supp.remove();  
            var files='';
            $("#uploadFichierVue"+nomChamp+" li").each(function () {
               files    += ';'+$(this).data('value');
            }); 
            $("#uploadFichierAjout"+nomChamp).data('old_file',old_file);
            if ( old_file.length>0 ) files +='|'+old_file;
            $('#'+nomChamp).val(files).change();
            Jaf.FormulaireFichier.createEffect( $('#'+nomChamp) ); 
            return false;
        },
		initEffect : function () {
			$('.formulaireFichier').each(function () {
				Jaf.FormulaireFichier.createEffect(this);
			});
		}

	},

	ListeChoixMultiple : {
        tabListe       : [],
        tabFunction    : [],
        tabPlaceholder : [],
        initEffect : function () {
            Jaf.ListeChoixMultiple.effect('.listeChoixMultiple');
        },
        init    : function(monId) {
            $('#'+monId).next().find('input[type=Checkbox]:checked').prop('checked',false);
            Jaf.ListeChoixMultiple.execute(monId);
        },
        execute : function(monId) {
            selecteur=$('#'+monId).first();
            var contenu='';
            Jaf.ListeChoixMultiple.tabListe[monId].find('input:checked').each(function() {
                contenu += ( contenu.length==0 ? '' : ', ' ) + $(this).next().html();
            });
            selecteur.html(contenu.length > 0 ? contenu : Jaf.ListeChoixMultiple.tabPlaceholder[monId] );
            if (monId in Jaf.ListeChoixMultiple.tabFunction) {
                Jaf.ListeChoixMultiple.tabFunction[monId](monId);
            }
        },
        effect : function (id_ou_class) {
            $( id_ou_class ).each(function () {
                var filtre      = $(this);
                var rads        = filtre.find('.rad');
                var first_rad   = rads.first();
                var placeholder = first_rad.find('label').first().html();
                var label       = filtre.find('.label').first();
                var nouv_label  = $('<label></label>').prop('class',label.prop('class')).html(label.html()).removeClass('label');
                label.replaceWith(nouv_label);
                var monId = 'lcm'+filtre.prop('id');
                var nouv_rads = $('<div class="row_rad_liste"></div>')
                                .html(rads)
                                .prepend('<a href="" class="jaf_ListeChoixMultiple_decocher" onclick="javascript:Jaf.ListeChoixMultiple.init(\''+monId+'\');return false;">Cliquez ici pour tout décocher</a>')
                                .mouseleave(function () {
                                    Jaf.ListeChoixMultiple.execute(monId);
                                    $(this).fadeOut(500);
                                }); 
                
                nouv_rads.find('input[value=""]').remove();
                Jaf.ListeChoixMultiple.tabPlaceholder[monId] = placeholder; 
                var selecteur = $('<div class="row_rad_liste_selecteur"></div>').prop('id',monId).html(placeholder).click(function () {
                    nouv_rads.fadeToggle(500,Jaf.ListeChoixMultiple.execute(monId)); 
                });
                Jaf.ListeChoixMultiple.tabListe[monId]=nouv_rads;
                nouv_label.after(selecteur);
                selecteur.after(nouv_rads);
                filtre.removeClass('row_rad').addClass('row').addClass('row_liste');
                Jaf.ListeChoixMultiple.execute(monId);
            });
            
        }
    },
	// permet de deplier "selecteur" et de changer le graphisme de l'objet qui a declencher l'evement en rajoutant les classes ouvrir ou fermer
	// exemple : Jaf.deplieZone(this,'#ma_div_a_ouvrir')
	deplieZone : function (obj,selecteur) {
	    $(selecteur).toggle(200,function(){ 
	        	if ( $(this).css('display') == 'none' ) {
	             	$(obj).removeClass('fermer');
	             	$(obj).addClass('ouvrir');
	             } else {
	            	$(obj).removeClass('ouvrir');
	             	$(obj).addClass('fermer');
	             }
	    });
	},
    traduction : function (valeur, langue) {
		if ( valeur && valeur.indexOf('~^')>-1) {
			var tmp = valeur.split('~^');
			var txt = tmp[0];
			for(var i=1; i<tmp.length; i+=2) { if (tmp[i] == langue && tmp[i-1].length > 0 ) { txt = tmp[i-1]; } }
			return(txt);
		} else {
			return valeur ? valeur : '';
		}
    },
	dateToMysql : function (date1) {
	  return date1.getFullYear() + '-' +
		(date1.getMonth() < 9 ? '0' : '') + (date1.getMonth()+1) + '-' +
		(date1.getDate() < 10 ? '0' : '') + date1.getDate();
	},
    getAjax_initEffect : function () {
        $('.jaf_getAjax').each( function () {
            $(this).click( function () {
                $.get($(this).attr('href'),function (data) {
                    eval(data);
                });
                return false;
            });
        });
    },
	// initialise tous les effects
	initEffect : function () {
	    Jaf.log('Jaf version '+Jaf.version);
        Jaf.defineScreen();

		if (window.location.href.indexOf('/bop3/')) {
			Jaf.Bop3.isOnBop = true;
		}
		for(var  nom in Jaf.ContrainteSelect.tabCS )  {
			Jaf.ContrainteSelect.initEffect( nom , Jaf.ContrainteSelect.tabCS[nom] );
		}
		Jaf.MegaSelect.initEffect('.megaSelect');
		Jaf.FormulaireFichier.initEffect();
		if ( $.sortable ) $('.jaf_sortable').sortable(); 
        Jaf.ListeChoixMultiple.initEffect();
        Jaf.getAjax_initEffect();
		Jaf.zoneDeplie.initEffect('.zoneDeplie');

	},
	zoneDeplie : {
	    anim : function ( obj ) {
			var monObjet = $(obj);
			if ( monObjet.data('position')=='ouvert' ) {
			    $('#'+monObjet.data('role')).hide();
				monObjet.data('position','');
			} else {
			    var temps  = monObjet.data('time')   ? monObjet.data('time')   : '0'; 
				if ( monObjet.data('easing') ) {
					$('#'+monObjet.data('role')).show(monObjet.data('easing'),temps);
				} else {
					$('#'+monObjet.data('role')).show(temps);
				}
				
				monObjet.data('position','ouvert');
			}
			var image_tmp = monObjet.attr('src');
			monObjet.attr('src',monObjet.data('image') ? monObjet.data('image') : image_tmp );
			monObjet.data('image',image_tmp);
		},
		initEffect : function (monid_maclass) {
			$(monid_maclass).click(function () {
				Jaf.zoneDeplie.anim(this);
			});
		}
	},
	getScrollPosition : function() {
		return {
			x : (document.documentElement && document.documentElement.scrollLeft) || window.pageXOffset || self.pageXOffset || ( document.body && document.body.scrollLeft),
		    y : (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || self.pageYOffset || ( document.body && document.body.scrollTop)
		}
	},
    /**
     * Arrondi avec décimales, comme round() en php
     * @param float val
     * @param int precision
     * @return float
     */
    roundDecimal : function(val, precision) { return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision); },
	
	log : function(chaine) {
		if (window.console && window.console.log ) {
			console.log(chaine);
		}
	},
    debug : function (chaine) {
       
        $('#zoneDebug').append('<pre>'+chaine+'</pre>');
        Jaf.log(chaine);
    },
	chrono : function ( chaine ) {
		if ( ! Jaf.startTime ) {
			Jaf.startTime=new Date().getTime();  
		}
		maintenant = new Date().getTime();  
		console.log( chaine + ' : '+( maintenant - Jaf.startTime ) + ' ms' );
		Jaf.startTime = maintenant;
    },
	// permet de créer un heritage d'un objet avec comme propriete .parent l'objet initial afin de relancer les méthodes et propriétées du parent
	extend : function ( pere ) {
		var fils = {};
		$.extend(fils,pere,{parent : pere});
		return fils;
	},	
	date2mysql : function (d) {
        if ( typeof d == 'object') {
			return sprintf('%04d-%02d-%02d',d.getFullYear(),d.getMonth()+1,d.getDate());
		} else if (!isNaN( d ) ) {
            var da = new Date(d);
            return Jaf.date2mysql(da);
        } else if ( d.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
            return d;
        } else {
			var tab=d.split('/');
			return tab[2]+'-'+tab[1]+'-'+tab[0];
		}
	},
	mysql2date : function (d) {
		if ( typeof d == 'object') {
			return sprintf('%02d/%02d/%04d',d.getDate(),d.getMonth()+1,d.getFullYear());
		} else if ( typeof d =='number' ) {
            var d=new Date(d);
			return sprintf('%02d/%02d/%04d',d.getDate(),d.getMonth()+1,d.getFullYear());
        } else {
			var tab=d.split('-');
			return tab[2]+'/'+tab[1]+'/'+tab[0];
		}
	},
	getDate : function(chaine) {
		if ( typeof chaine == 'object') {
			return chaine;
		} else if ( chaine ) {
			if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
				// 2013-01-31
				var d = new Date( tab[1] , tab[2]-1 , tab[3] );
			} else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
				// 2013-01-31 15:30:00
				var d = new Date( tab[1] , tab[2]-1 , tab[3] , tab[4] , tab[5] , tab[6] );
			} else if( tab=chaine.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/([0-9]{4})$/) ) {
				// 31/01/2013
				var d = new Date( tab[3] , tab[2]-1 , tab[1] );
			} else if( tab=chaine.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/([0-9]{4}) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
				// 31/01/2013
				var d = new Date( tab[3] , tab[2]-1 , tab[1] , tab[4] , tab[5] , tab[6]  );
			} else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])T([0-5][0-9]):([0-5][0-9]):([0-5][0-9])/) ) {
				// 2013-03-14T12:20:00
				var d = new Date( tab[3] , tab[2]-1 , tab[1] , tab[4] , tab[5] , tab[6]  );
			} else {
				var d = false;
			}
			return d;
		} else 
			return false;
	},
	//renvoi le nombre de seconde dans la journée 
	getTemps : function(value) {
		if ( value && value.indexOf(':')>0 ) {
			var tab=value.split(':');
			return  1*tab[0]*3600 +1*tab[1]*60 +( tab[2]>0 ? 1*tab[2] : 0 );
		} else {
			return 0;
		}
	},
	time2mysql : function(chaine) {
		if ( chaine.match(/^([0-9]{4})$/) ) {
			return chaine.substr(0,2)+':'+chaine.substr(2,4)+':00';
        } else if ( chaine.match(/^([0-9]{2})h([0-9]{2})$/) ) {
			return chaine.substr(0,2)+':'+chaine.substr(3,5)+':00';
		}else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
			// 15:25:00
			return chaine;
		} else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9])$/) ){
			// 15:25
			return chaine+':00';
		} else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9])$/) ){
			// 15h25
			return tab[1]+':'+tab[2]+':00';
		}
		return false;
	},
	moisLong  : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
	moisCours : ['Jan','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'],
	jourLong  : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
	jourCours : ['D','L','M','M','J','V','S'],
	jourMoyen : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
	LAN_CODE  : 'FR',
	currencySymbol : '€',
	translate : function (chaine) {
		if (chaine && chaine.indexOf('~^')>0) {
			var tmp = chaine.split('~^');
			for(var i=1;i<tmp.length;i=i+2) {
				if ( tmp[i]==Jaf.LAN_CODE ) {
					return tmp[i-1];
				}
			}
			return 'Erreur de traduction';
		} else {
			return chaine;
		}
	},
	toUpperCaseSansAccent : function(r) {
		if ( r ) {
            r = r.replace(new RegExp(/[àáâãäå]/g),"a");
            r = r.replace(new RegExp(/ç/g),"c");
            r = r.replace(new RegExp(/[èéêë]/g),"e");
            r = r.replace(new RegExp(/[ìíîï]/g),"i");
            r = r.replace(new RegExp(/[òóôõö]/g),"o");
            r = r.replace(new RegExp(/[ùúûü]/g),"u");
            return r.toUpperCase();
        } else return '';
	},
	comparePureTexte : function (s1,s2) { 
		s1 = s1 ? Jaf.toUpperCaseSansAccent(s1) : '';
		return s2 ? s1.indexOf( Jaf.toUpperCaseSansAccent(s2) ) > -1 : false; 
	},
	formatValue : {
		Montant : function(value) {
		    if ( !value ) {
				return '';
			}
			return sprintf('%.2f',value)+' '+Jaf.currencySymbol;
		},
		Pourcentage : function(value) {
		    if ( !value ) {
				return '';
			}
			return sprintf('%.2f',value)+' %';
		},
		Heure   : function(value) {
			if ( value ) {
                if (typeof value=='object') {
                    return sprintf( '%02dh%02d' , value.getHours() ,value.getMinutes() );
                } else if ( typeof value=='string' ) {
                    if ( value.indexOf(':')>0 ) {
                        var tab=value.split(':');
                        return tab[0]+ 'h' + tab[1];
                    } else {
                        return value;
                    }
                } else if (typeof value=='number') {
                    if  ( value < 0 ) {
                        var heure  = Math.floor(value-0.001)+1;
                        var minute = Math.round( value * 60 - heure * 60 );
                        return  sprintf('%02dh%02d' , heure , 0-minute );
                    } else {
                        var heure  = Math.floor(value);
                        var minute = Math.round( value * 60 - heure * 60 );
                        return  sprintf('%02dh%02d' , heure , minute );
                    }
                } else {  
                    Jaf.log('probleme formatValue.Heure('+value+')');                
                    return '??';
                }
            } else {                    
                return '';
            }

		},
		Date    : function(d) {
		    if ( d==null) {
				return '';
			}
			if (typeof d=='object') {
				return sprintf( '%02d/%02d/%04d' , d.getDate() ,d.getMonth()+1 , d.getFullYear() );
			} else {
				if ( d && d.indexOf('-')>0 ) {
					var tab=d.split('-');
					return tab[2]+'/'+tab[1]+'/'+tab[0];
				} else {
					return '';
				}
			}
		},
        Telephone : function(tel) {
            tel = tel.replace(new RegExp(/[ ._-]/g),'');
            return tel;
        }

	},
	html2mysql : {
		Montant : function(value) {
		    if ( value == '') {
				return 0;
			}
			var pos = value.indexOf(Jaf.currencySymbol);
			if ( pos > 1 ) {
				var montant=value.substr(0,pos);
				return 1*montant;
			} else {
				return 1*value;
			}
		}
	},
    valoriseFonction : {
		Texte     : function(z,nomChamp,value) {
            if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val(  value ? value : ''  );
            }
		},
		Quantite  : function(z,nomChamp,value) {
			if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val( value ? value : '' );
            }
		},
		Montant   : function(z,nomChamp,value) {
			if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val( Jaf.formatValue.Montant( value ? value : 0 ) );
            }
		},
		Textarea  : function(z,nomChamp,value) {
			if ( z.find('textarea[name='+nomChamp+']:focus').length==0) {
                return z.find('textarea[name='+nomChamp+']').val( value ? value : '' );
            }
		},
		HeureHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html( Jaf.formatValue.Heure(  value ? value : ''  ) );
		},
		DateHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html( Jaf.formatValue.Date(  value ? value : ''  ) );
		},
		TexteHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html(  value ? value : ''  );
		},
		Fichier   : function(z,nomChamp,value) {
			var champ = z.find('input[name='+nomChamp+']').first();
			if ( champ.length>0 ) {
				champ.val( value );
				if ( champ.data('status')!='effectOn' ) {
					champ.data('status','effectOn' );
					Jaf.FormulaireFichier.createEffect( champ );
				} 
			}	
			return champ;
		},
		Select    : function(z,nomChamp,value) {
			return  value ? z.find('select[name='+nomChamp+']').val( value ) :  z.find('select[name='+nomChamp+']');
		},
		Tva       : function(z,nomChamp,value) {
			return z.find('select[name='+nomChamp+']').val( sprintf('%.2f',value ? value : 0) );
		},
		Options   : function(z,nomChamp,values) {
			z.find('select[name='+nomChamp+']').each(function() {
				var monselect = $(this);
				monselect.html();
				monselect.append( $('<option value="">...</option>') );
				for(var  i in values ) {
					monselect.append( $('<option value="'+i+'">'+values[i]+'</option>') );
				}
			});
		}
	},
	addRaccourci : function(caractere,mafonction) {
		var flag_control = false;
        if ( caractere.length==1 ) {
            var c = caractere.toUpperCase().charCodeAt(0);
           
        } else {
            var c = 1*caractere;
            flag_control=true; 
            
        }
        Jaf.log('addRaccourci='+c);
		$('body').bind('keydown',function(e) {
			if ( ( flag_control || e.ctrlKey ) && e.keyCode == c ) {
				mafonction(e);
			}
		});
      	}
}


Jaf.eve = {
	listBind    : {},
	flagOn      : false,
	flagExecute : false,
	frequence   : 3000,
	lastEveId   : 0,
	filtres     : [],
    mode_deco   : false,
	init     : function() {
		this.flagOn=true;
		$.ajax({
            url      : '/modbop/data/lastEveId.jaf',
            cache    : false,
            dataType : 'text'
        }).done(function(data){
            Jaf.cm.doneTransaction();
            Jaf.eve.lastEveId=data;
			setInterval( Jaf.eve.execute , Jaf.eve.frequence );
			Jaf.log('Lancement de Jaf.eve');
		}).fail(function () {
            Jaf.cm.failTransaction();
            setTimeout( Jaf.eve.init , Jaf.eve.frequence );
        });
	},
	init_mode_deco : function(frequence,mafonc) {
		Jaf.eve.frequence = frequence ? frequence : Jaf.eve.frequence;
        this.flagOn       = true;
        this.mode_deco    = true;
        var lastId        = localStorage.getItem('eve_lastId');

        for(var i in Jaf.cm.sqlInstalled) {
            var concept = Jaf.cm.getConceptByTable(Jaf.cm.sqlInstalled[i]);
            Jaf.eve.initConceptSurveiller(concept.name , mafonc );
        }
        if ( lastId > 0 ) {
            Jaf.eve.lastEveId   = lastId;
			Jaf.log('Lancement de Jaf.eve');
            Jaf.eve.loadNewEvent(function (eve) {
                setInterval( Jaf.eve.execute , Jaf.eve.frequence );
                mafonc(eve);
            });
        } else {
            Jaf.eve.init();
            mafonc({ type : 'loadNewEvent', resultat : 'ok' });
        }
	},
	//cree la surveillance d'un concept et mets à jour les données locales
	initConceptSurveiller : function(nomConcept,mafonc) {
		this.bind('insertRow'+nomConcept, [ { CPT_CLASS : nomConcept, CEV_LIBELLE : 'rowInsert' } ],function (eve) {Jaf.eve.insertConceptSurveiller(nomConcept,eve,mafonc) });
		this.bind('updateRow'+nomConcept, [ { CPT_CLASS : nomConcept, CEV_LIBELLE : 'rowUpdate' } ],function (eve) {Jaf.eve.updateConceptSurveiller(nomConcept,eve,mafonc) });
		this.bind('deleteRow'+nomConcept, [ { CPT_CLASS : nomConcept, CEV_LIBELLE : 'rowDelete' } ],function (eve) {Jaf.cm.getConcept(nomConcept).checkDeleteRow( eve.EVE_PRIMARY , function() { mafonc(eve)} ) } );
		this.bind('log'      +nomConcept, [ { CPT_CLASS : nomConcept, CEV_LIBELLE : 'log'       } ],function (eve) {if (mafonc) mafonc(eve); });
	},
	insertConceptSurveiller : function(nomConcept,eve,mafonc) {
		var concept =  Jaf.cm.getConcept(nomConcept);
        eve.EVE_PARAMS[ concept.primary ] = eve.EVE_PRIMARY;
        concept.setRow(eve.EVE_PARAMS);
        if ( concept.isLocal() ) {
            concept.setSqlRow(eve.EVE_PARAMS);
        }
		if ( mafonc ) {
			mafonc(eve);
		}
	},
	updateConceptSurveiller : function (nomConcept,eve,mafonc) {
		for ( var i in eve.EVE_PARAMS ) {
			Jaf.cm.getConcept(nomConcept).setValue( eve.EVE_PRIMARY , i , eve.EVE_PARAMS[i] );
		}
		if ( mafonc ) {
			mafonc(eve);
		}
	},
	addEvent : function(params)  {
		params.EVE_COL_ID=ck_id;
		$.post('/tools/eve/add-event',params);
	},
	// associe un appel à une fonction à une demande programmé d'evenement
	bind : function( name , filtres , fonctionbind ) {
		
		Jaf.eve.listBind[name] = { filtres : filtres , fonctionbind: fonctionbind };
		for(var  i in filtres ) {
			this.filtres.push(filtres[i]);
		}
		if ( ! this.flagOn ) {
			Jaf.eve.init();
		}
	},
    loadNewEvent : function(mafonc) { 

        var params = {
            lastEveId : Jaf.eve.lastEveId,
            filtres   : Jaf.eve.filtres
        }

        $.ajax( {
            url      : '/tools/eve/get-events/',
            cache    : false,
            dataType : 'text',
            data     : params
        }).done(function (rowsetEvents) {
            eval(rowsetEvents);
            if (rowsetEvents) {
                for(var i in rowsetEvents) {
                    var evt = rowsetEvents[i];
                    Jaf.log('EVENEMENT '+evt.EVE_ID+'['+evt.CEV_LIBELLE+':'+evt.CPT_CLASS+':'+evt.EVE_PRIMARY+']==>'+( evt.EVE_PARAMS ? $.param(evt.EVE_PARAMS) : '' ) );
                    Jaf.eve.lastEveId=Math.max(1*Jaf.eve.lastEveId,1*evt.EVE_ID);
                    
                    for(var name in Jaf.eve.listBind ) {
                        var mesfiltres = Jaf.eve.listBind[name].filtres;
                        var flag       = false;
                        for(var f in mesfiltres ) {
                            var flag2  = true;
                            var filtre = mesfiltres[f];
                            for(var e in filtre) {
                                flag2&= (evt[e]==filtre[e]);
                            }
                            flag|=flag2;
                        }
                        if (flag) {
                            Jaf.eve.listBind[name].fonctionbind(evt);
                        }
                    }
                }
            }
            localStorage.setItem('eve_lastId',Jaf.eve.lastEveId);
            if ( mafonc ) mafonc( { type : 'loadNewEvent', resultat : 'ok' } );
        }).fail( function() {
            Jaf.cm.failTransaction();
            if ( mafonc ) mafonc( { type : 'loadNewEvent', resultat : 'ko' } );
        });
	},
	execute : function() { 
		var saverowset = 1*localStorage.getItem( 'info_table_synchro_saverowset');
		var insert     = 1*localStorage.getItem( 'info_table_synchro_insert');
        var nb         = ( saverowset ? saverowset : 0 ) + (insert ? insert : 0 );
        if ( !Jaf.eve.flagExecute ) {
            Jaf.eve.flagExecute=true;
            if ( Jaf.eve.lastEveId==0 ) {
                var params = {
                    secondesEveDate : 300,
                    filtres   : Jaf.eve.filtres
                }
            } else {
                var params = {
                    lastEveId : Jaf.eve.lastEveId,
                    filtres   : Jaf.eve.filtres
                }
            }
            //$.get('/modbop/jquery/lastEveId.txt?r='+Math.random(),function(data){
            $.ajax({
                url      : '/modbop/data/lastEveId.jaf',
                cache    : false,
                dataType : 'text'
            }).done(function(data){
                Jaf.cm.doneTransaction();
                if ( nb == 0 ) {
                    if ( data && Jaf.eve.lastEveId!=data) {
                        $.post('/tools/eve/get-events/',params,function (rowsetEvents) {
                            eval(rowsetEvents);
                            if (rowsetEvents.length==0) {
                                Jaf.eve.lastEveId=data;
                            } else {
                                for(var i in rowsetEvents) {
                                    var evt = rowsetEvents[i];
                                    Jaf.log('EVENEMENT '+evt.EVE_ID+'['+evt.CEV_LIBELLE+':'+evt.CPT_CLASS+':'+evt.EVE_PRIMARY+']==>'+( evt.EVE_PARAMS ? $.param(evt.EVE_PARAMS) : '' ) );
                                    Jaf.eve.lastEveId=Math.max(1*Jaf.eve.lastEveId,1*evt.EVE_ID);
                                    
                                    for(var name in Jaf.eve.listBind ) {
                                        var mesfiltres = Jaf.eve.listBind[name].filtres;
                                        var flag       = false;
                                        for(var f in mesfiltres ) {
                                            var flag2  = true;
                                            var filtre = mesfiltres[f];
                                            for(var e in filtre) {
                                                flag2&= (evt[e]==filtre[e]);
                                            }
                                            flag|=flag2;
                                        }
                                        if (flag) {
                                            Jaf.eve.listBind[name].fonctionbind(evt);
                                        }
                                    }
                                }
                            }
                            localStorage.setItem('eve_lastId',Jaf.eve.lastEveId);
                        });
                    }
                }
            }).fail( Jaf.cm.failTransaction );
            
            Jaf.eve.flagExecute=false;
        }
	} ,
    
    executeModeDeconnecter : function() {
        Jaf.log('executeModeDeconnecter');
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
                Jaf.cm.synchroniseBdd();
            }
            Jaf.cm.synchro_old=Jaf.cm.synchro; 
        }
    }
}

Jaf.cm = {
    db                    : [],
    urlDb                 : '/bop3/',
    nameDbDefaut          : 'local',
    urlLoaderData         : '/tools/Jaf/loader-data',
    listeConcept          : {},
	listBind              : [],
    listeDataWait         : {},
    sqlInstalled          : [],
    synchro               : false,
    synchro_old           : -1,
    bindSqlInstalled      : null,
    saverowset_en_attente : 0,
    initSql               : function() {
        var nbElement = localStorage.getItem( 'info_table_synchro_saverowset' );
        if ( nbElement==null ) {
            localStorage.setItem( 'info_table_synchro_saverowset' , 0 );
            var db = Jaf.cm.getDb();
            db.transaction(function(tx) { 
                var sql = 'CREATE TABLE IF NOT EXISTS synchro_saverowset ( '
                        + ' SYN_ID      INTEGER PRIMARY KEY ASC'
                        + ',SYN_CONCEPT TEXT'
                        + ',SYN_PRIMARY INTEGER'
                        + ',SYN_CHAMP   TEXT'
                        + ',SYN_VALUE   TEXT'
                        + ',SYN_DATE    INTEGER'
                        + ')';
                tx.executeSql( sql , [], function(tx){
                    Jaf.log('table synchro_saverowset ajoutée');
                });  
            });
        }
        var nbElement = localStorage.getItem( 'info_table_synchro_insert' );
        if ( nbElement==null ) {
            localStorage.setItem( 'info_table_synchro_insert' , 0 );
            var db = Jaf.cm.getDb();
            db.transaction(function(tx) { 
                var sql = 'CREATE TABLE IF NOT EXISTS synchro_insert ( '
                        + ' SYI_ID      INTEGER PRIMARY KEY ASC'
                        + ',SYI_CONCEPT TEXT'
                        + ',SYI_PRIMARY INTEGER'
                        + ',SYI_DATE    INTEGER'
                        + ')';
                tx.executeSql( sql , [], function(tx){
                    Jaf.log('table synchro_insert ajoutée');
                });  
            });
        }
    },
    addConcept       : function (concept) {
        Jaf.cm.listeConcept[concept.name] = concept;
		Jaf.log('enregistrement du concept '+concept.name);
    },

    getDb : function(nameDb) {
        if (!nameDb) nameDb = Jaf.cm.nameDbDefaut;
        if (! Jaf.cm.db[ nameDb ]) {
            if(window.openDatabase){
                Jaf.cm.db[ nameDb ] = openDatabase(nameDb, '1.0', 'database', 5*1024*1024);
                Jaf.log('ouverture de la base de données '+nameDb);
            }
        }
        if ( Jaf.cm.db[ nameDb ] ) {
            return Jaf.cm.db[ nameDb ];
        } else {
            Jaf.log('window.openDatabase non pris en charge par la navigateur');
            return { transaction : function(f) {} };
        }
    },

	getConcept   : function (name) {
		if (Jaf.cm.listeConcept[name]) {
			return Jaf.cm.listeConcept[name];
		} else {
			if ( Jaf.cm.configConcepts[name] ) {
				Jaf.cm.listeConcept[name]=Jaf.extend(new JafConcept(name));
				return Jaf.cm.listeConcept[name];
			} else {
				Jaf.log('le concept '+name+' n\'existe pas dans Jaf.cm.configConcepts');
				return false;
			}
		}
		
	},

    getConceptByTable : function (name) {
		for ( var nom in Jaf.cm.configConcepts ) {
            if ( Jaf.cm.configConcepts[nom].name == name ) {
                return Jaf.cm.getConcept(nom);
            }
        }
        Jaf.log( 'Impossible de recuperer getConceptByTable(' + name + ')' );
        return false;		
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
	
    needDataConcept : function(name,where) {
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(name,'loading2');
        Jaf.cm.listeDataWait[ name ] = where;
    },
    
    loadDatasConcept : function() {
        var config = {};
        var wheres = {};
        var flag   = false;
        for(var name in Jaf.cm.listeDataWait) {
            flag           = true;
            var concept    = Jaf.cm.getConceptByTable( name );
            config[ name ] =  { t : name , i : concept.primary };
            Jaf.cm.listeConcept[ concept.name ].waitingProcess++;
            if ( Jaf.cm.listeDataWait[name] && Jaf.cm.listeDataWait[name].length > 0 ) {
                wheres[ name ] = Jaf.cm.listeDataWait[name];
            }
            Jaf.log('je load la table '+name);
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

	checkOnLoad : function() {
		for(var  i in Jaf.cm.listeConcept) {
			if ( Jaf.cm.listeConcept[i].waitingProcess > 0 ) {
				return false;
			}
		}
		for(var i in Jaf.cm.listBind ) {
			Jaf.cm.listBind[i]();
		}
	},

    loadData   : function ( datas , lnc ) {
        //Jaf.log(datas);
        for( var table in datas ) {
           var concept = Jaf.cm.getConceptByTable( table );
           if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.name,'loading');
           concept.setRowsetAvecNomChamp( datas[ table ] , lnc[ table ] );
        }
    },
    
    doneTransaction : function() {
        if ( Jaf.cm.synchro == false ) {
            Jaf.cm.synchro = true;
            Jaf.log('passé par doneTransaction');
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

    // config de table a executer , liste des wheres , fonction a executer une fois le chargement terminé
    loaderData : function( config , wheres , mafonction ) {
        if ( ! Jaf.cm.session ) {
            Jaf.cm.session = Math.random();
        }
        if ( Jaf.cm.authLoader ) {
            var data = Jaf.cm.authLoader;
            data.session = Jaf.cm.session;
            data.config  = config;
            data.wheres  = wheres;
        } else {
            var data = {
                session : Jaf.cm.session,
                config  : config , 
                wheres  : wheres 
            }
        }

        var trans = $.ajax({
            url  : Jaf.cm.urlLoaderData,
            type : 'POST',
            data : data
        });
        
        trans.done(function (data) {
            Jaf.log('---------------------------loadData done -----------------');
            Jaf.cm.doneTransaction();
            eval( data ); 
            if ( mafonction ) {
                mafonction();
            }
        });
        
        trans.fail(function(response) {
            Jaf.cm.failTransaction();
            if ( mafonction ) {
                mafonction();
            }
        });
    },

    sql_query : function( sql , params , mafonc ) {
        var db = Jaf.cm.getDb();
        db.transaction(function(tx) {
            tx.executeSql( sql,params,function (tx,data) {
                var rowset = [];
                for(var i = 0; i < data.rows.length; i++){ 
                    rowset.push( data.rows.item(i) );
                } 
                //Jaf.chrono('fin de '+sql);
                if ( mafonc ) mafonc(rowset,tx);
            },function() {
                Jaf.log('erreur sur '+sql);
                if ( mafonc ) mafonc([],tx);
            });
        });
    },
    
    videSynchroniseBdd : function() {
        Jaf.cm.sql_query( 'DROP TABLE synchro_saverowset',[] );
        Jaf.cm.sql_query( 'DROP TABLE synchro_insert',[] );
        localStorage.removeItem( 'info_table_synchro_saverowset');
        localStorage.removeItem( 'info_table_synchro_insert' );
        Jaf.log('videSynchroniseBdd');
    },

    deleteSyi : function(syi_id) {
        Jaf.cm.sql_query( 'DELETE FROM synchro_insert WHERE SYI_ID = ? ' , [ syi_id ] ,function() {
            var nbElement = localStorage.getItem( 'info_table_synchro_insert');
            localStorage.setItem( 'info_table_synchro_insert' , nbElement - 1 );
        }); 
    },

    synchroniseBdd_update : function() {
        //updates
        Jaf.log('synchroniseBdd_update');
        Jaf.cm.sql_query( 'SELECT * FROM synchro_saverowset',[],function(rowset,tx) {
            var res={};
            for(var i in rowset) {
                var row=rowset[i];
                Jaf.log('synchroniseBdd_update:2:'+ row.SYN_CHAMP +' = '+ row.SYN_VALUE);
                var concept = Jaf.cm.getConcept( row.SYN_CONCEPT );
                var obj = {};
                obj[ concept.primary ] = row.SYN_PRIMARY;
                obj[ row.SYN_CHAMP   ] = row.SYN_VALUE;
                obj[ 'date'          ] = row.SYN_DATE;
                if ( res[ row.SYN_CONCEPT ] ) {
                    res[ row.SYN_CONCEPT ].push( obj );
                } else {
                    res[ row.SYN_CONCEPT ] = [ obj ];
                }
                tx.executeSql( 'delete from synchro_saverowset where SYN_ID=?' , [row.SYN_ID] ,function() {
                    var nbElement = localStorage.getItem( 'info_table_synchro_saverowset');
                    localStorage.setItem( 'info_table_synchro_saverowset' , nbElement - 1 );
                });
            }
            var lancement_saverowset = false;
            for(nc in res) {
                lancement_saverowset = true;
                var concept          = Jaf.cm.getConcept( nc );
                Jaf.log('synchroniseBdd_update:3:'+ nc +' = '+ res[nc]);
                concept.saverowset( res[nc] , function() {
                    Jaf.log('synchroniseBdd_update4');
                    if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(null,'synchro_ok');
                    Jaf.eve.execute();
                });
            }

            if ( !lancement_saverowset && Jaf.cm.bindSqlInstalled ) {
                Jaf.cm.bindSqlInstalled(null,'synchro_ok');
            }
        });
    },
    synchroniseBdd_aux : function() {
        if ( Jaf.cm.saverowset_en_attente > 0 ) {
            setTimeout(Jaf.cm.synchroniseBdd_aux,500);
        } else {
            Jaf.cm.synchroniseBdd_update();
        }
    },
    synchroniseBdd : function() {
        Jaf.cm.sql_query( 'SELECT * FROM synchro_insert',[],function(rowset,tx) {
            var rowset_attente={};
            var flag=false;
            for(var i in rowset) {
                var row=rowset[i];
                var concept = Jaf.cm.getConcept( row.SYI_CONCEPT );
                if ( ! rowset_attente[ row.SYI_CONCEPT ] ) {
                    rowset_attente[ row.SYI_CONCEPT ] = [];
                }
                var enr =  concept.getRow( row.SYI_PRIMARY );
                var nouveau = {};
                for(var i in enr) {
                    if ( i.substr(0,3)== concept.trigramme ) {
                        nouveau[i] = enr[i];
                    }
                }
                nouveau.SYI_ID = row.SYI_ID;
                rowset_attente[ row.SYI_CONCEPT ].push( nouveau );
                flag = true;
            }
            if ( flag ) {
                var trans = $.ajax({ 
                    url  : '/tools/Jaf/insertrowset',
                    data : {concepts:rowset_attente},
                    type : 'POST'
                });
                trans.done(function (data) {
                    eval(data);
                    Jaf.cm.synchroniseBdd_aux();
                }); 
                trans.fail(Jaf.cm.failTransaction);
            } else {
                Jaf.cm.synchroniseBdd_update();
            }
        });
    }
}


var JafConcept = function(name){
	var trigramme          = Jaf.cm.configConcepts[name].trigramme;
	this.name              = name;
	this.trigramme         = trigramme;
	this.primary           = trigramme+'_ID';
	this.rowAttente        = [];
	this.rowModifier       = [];
	this.rowset            = {};
	this.waitingProcess    = 0;
	this.afterLoadFunction = [];
	this.propageParent     = {};
	this.propageFils       = {};
	
	JafConcept.prototype.getTrigramme=function () {
		return this.trigramme;
	}
	
	JafConcept.prototype.load=function (mafonction) {
		var tab=[];
		var primary=this.primary;
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
	
	JafConcept.prototype.insertRow=function (row,mafonction) {
		var concept=this;
		var trans = $.ajax({
            url       : Jaf.cm.urlDb + this.name + '/insertrow',
            data      : {row:row},
            type      : 'POST'
        });
        trans.done(function (data) {
                eval(data);
                concept.addRow( data , mafonction ); 
        });
        trans.fail(function () {
            Jaf.cm.failTransaction();
            if ( concept.isLocal() ) {
                concept.setSqlRow( row , function(row_new) {
                    concept.addSynchroInsert(row_new);
                    mafonction(row_new);
                }); 
            }
        });
		return this;
	}
	
	JafConcept.prototype.insertRowset=function (rowset,mafonction) {
		var concept=this;
		var trans = $.ajax({
            url  : Jaf.cm.urlDb+this.name+'/insertrow',
            data : {rowset:rowset},
            type : 'POST'
        });
        trans.done(function (rowset) {
			if ( rowset.length>0) {
                eval(rowset);
                concept.setRowset( rowset )
                if (mafonction) {
                    mafonction(rowset);
                }
            } else {
                //erreur sur creation
                Jaf.log('pas de data au retour de /bop3/'+this.name+'/insertrow');
            }
		}); 
        trans.fail(Jaf.cm.failTransaction);
		return this;
	}

	JafConcept.prototype.addRow=function (row,mafonc) {
		this.rowset[ 'c' + row[ this.primary ] ] = row; 
        if ( this.isLocal() ) {
            this.setSqlRow(row , mafonc );
        } else {
            if ( mafonc) mafonc(row);
        } 
		return this;
	}

	JafConcept.prototype.checkDeleteRow=function (id , mafonc ) {
        var concept = this;
        if ( this.rowset[ 'c' + id ] ) {
            if ( this.isLocal() ) {
                var sql = 'DELETE FROM ' + this.getTableName() + ' WHERE ' + this.primary + ' = ?';
                Jaf.cm.sql_query(sql,[this.rowset[ 'c' + id ][ this.primary ] ],function() {
                    delete( concept.rowset[ 'c' + id ] );
                    if ( mafonc ) mafonc();
                });
            } else {
                delete( this.rowset[ 'c' + id ] );
                if ( mafonc ) mafonc();
            }
        } else {
            if ( mafonc ) mafonc();
        }
	}
		 
	JafConcept.prototype.changeRow=function ( id , row ) {
		Jaf.log('changeRow '+this.name+' : '+id+' => '+row[ this.primary ] );
        var concept = this;
        Jaf.cm.sql_query( 'UPDATE synchro_saverowset set SYN_PRIMARY = ? WHERE SYN_CONCEPT = ? AND SYN_PRIMARY = ?' , [ row[ this.primary ] , this.name , id ] ,function() {
            concept.checkDeleteRow(id,function() {
                return concept.addRow(row);
            });
        });
	}
    
    JafConcept.prototype.changeSaveRowset = function (id, nomChamp , valeur ) {
		Jaf.log('changeSaveRowset '+id+' => '+nomChamp+'='+valeur);
        Jaf.cm.saverowset_en_attente++;
        Jaf.cm.sql_query( 'UPDATE synchro_saverowset set SYN_VALUE = ? WHERE SYN_CONCEPT = ? AND SYN_PRIMARY = ? AND SYN_CHAMP = ?' , [ valeur , this.name , id , nomChamp ],function() {
            Jaf.cm.saverowset_en_attente--;
        });
    }
    
	JafConcept.prototype.deleteRow=function ( id,mafonction) {
		this.checkDeleteRow( id );
		var concept=this;
        $.post(Jaf.cm.urlDb+this.name+'/deleterow',{ id : id } ,function () {
			if (mafonction) 
				mafonction(id);
		}); 
		return this;
	}
	
    JafConcept.prototype.addSynchroSave = function(monid,champ,valeur,madate) {
        var db      = Jaf.cm.getDb();
        var concept = this;
        db.transaction(function(tx) {
            var sql = 'INSERT INTO synchro_saverowset '
                    + '( SYN_CONCEPT,SYN_PRIMARY,SYN_CHAMP ,SYN_VALUE,SYN_DATE ) VALUES ( ? , ? , ? , ? , ? )';
            tx.executeSql( sql , [ 
                    concept.name,
                    monid,
                    champ,
                    valeur,
                    madate
                ] , function(tx){
                Jaf.log('synchro_saverowset ok');  
                var nbElement = 1*localStorage.getItem( 'info_table_synchro_saverowset' );
                localStorage.setItem( 'info_table_synchro_saverowset' , nbElement + 1 );
            });
        });
    }
    
    JafConcept.prototype.addSynchroInsert = function(row) {
        var db      = Jaf.cm.getDb();
        var concept = this;
        db.transaction(function(tx) {
            var sql = 'INSERT INTO synchro_insert '
                    + '( SYI_CONCEPT,SYI_PRIMARY, SYI_DATE ) VALUES ( ? , ? , ? )';
            var madate = new Date();
            tx.executeSql( sql , [ 
                    concept.name,
                    row[ concept.primary ],
                    madate.getTime()
                ] , function(tx){
                Jaf.log('synchro_insert ok');  
                var nbElement = 1*localStorage.getItem( 'info_table_synchro_insert' );
                localStorage.setItem( 'info_table_synchro_insert' , nbElement + 1 );
            });
        });
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
            var datas   = { rowset:rowset};
            for(var i in rowset) {
               for(var j in rowset[i]) Jaf.log('saveroset : '+j+'='+rowset[i][j]);
            }
            var trans = $.ajax({
                url   : Jaf.cm.urlDb+this.name+'/saverowset',
                type  : 'POST',
                data  : datas,
                cache : false
            });
            if (mafonction) {
                trans.done(function() {
                    mafonction(rowset);
                });
            }
            trans.fail(function() {
                Jaf.cm.failTransaction();
                if ( concept.isLocal() ) {
                    Jaf.log('impossible d\'envoyer les données');
                    alert('Attention : Vous avez des données non synchonisées avec votre solution');
                    for(var i in rowset) {
                        var monid=rowset[i][ concept.primary ];
                        if ( rowset[i][ 'date' ] ) {
                            var madate = rowset[i][ 'date' ];
                        } else {
                            var d      = new Date();
                            var madate = Math.round( d.getTime() / 1000 );
                        }
                        for(var nc in rowset[i]) {
                            if ( nc != concept.primary && nc != 'date' ) {
                                concept.addSynchroSave(monid,nc,rowset[i][nc],madate);
                            }
                        }
                    }
                    if ( mafonction ) mafonction(rowset);
                } else {
                    alert('L\'enregistrement sur '+concept.name.substr(6,100)+' n\'a pas fonctionné. Vous êtes peut être déconnecté d\'internet. Veuillez recharger votre page avant de poursuivre');
                }
            });

        } else if ( mafonction ) mafonction(rowset);
    }
    
	JafConcept.prototype.need=function (monid,flag_force) {
		if ( flag_force || ! this.getRow(monid) ) {
            this.rowAttente['c'+monid] = monid;
        }
		return this;
	}

	JafConcept.prototype.isLocal=function () {
        return Jaf.eve.mode_deco && localStorage.getItem( 'info_table_'+this.getTableName() );
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
                if ( this.isLocal() ) {
                    this.setSqlValue(monid,nomChamp,valeur);
                }            
            }
        } else {
            Jaf.log('erreur setValue sur '+this.name+' : id='+monid+' row inexistant');
        }
        return this;
         
	}
    
    JafConcept.prototype.setRowsetAvecNomChamp=function (data,listeChamp) {
        var flag   = this.isLocal();
        var rowset = [];
        for(var i in data) {
			var row={};
            var cpt=0;
            for(var j in listeChamp ) {
                row[ listeChamp[j] ] = data[i][cpt++];
            }
            this.setRow( row );
            if ( flag ) {
                rowset.push(row);
            }
		}
        if ( flag ) this.setSqlRowset(rowset); 
        var c  = Jaf.cm.configConcepts[ this.name ];
        delete Jaf.cm.listeDataWait[c.name ];
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'loaded');
		return this;
	}
	
    JafConcept.prototype.setRowset=function (data) {
        for(var  i in data) {
			this.setRow(data[i]);
		}
        if ( this.isLocal() ) {
            for(var  i in data) {
                this.setSqlRow(data[i]); 
            }
		}
		return this;
	}
     
    JafConcept.prototype.setSqlValue=function (monid,nomChamp,valeur) {
        var db      = Jaf.cm.getDb();
        var concept = this;
        db.transaction(function(tx) {
            var sql = 'UPDATE ' + concept.getTableName() 
                    + ' SET '   + nomChamp + ' = ?'
                    + ' WHERE ' + concept.primary + ' = ? ';
            tx.executeSql( sql , [valeur,monid] , function(tx){
            });
        });
    }
	
    JafConcept.prototype.loadSqlRow=function (id,mafonc) {
        var c       = Jaf.cm.configConcepts[ this.name ];
        var concept = this;
        var sql     = 'SELECT * FROM ' + c.name + ' WHERE ' + c.primary + ' = ?';
        Jaf.cm.sql_query(sql , [ id ] , function(rowset,tx) {
            var row = {};
            for(var i in rowset) {
                for(var j in rowset[i]) {
                    row[j] = '' + rowset[i][j];
                }
                concept.setRow(row);
            }
            if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'saved');
            
            if ( mafonc ) mafonc(row);
        });
    }
	
	JafConcept.prototype.setSqlRow=function (row,mafonc) {
        //le row exite il ?
        var db      = Jaf.cm.getDb();
        var concept = this;
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saving');
        db.transaction(function(tx) {
            if ( row[ concept.primary ] > 0 ) {
                //possède deja un id
                var sql = 'DELETE FROM ' + concept.getTableName() + ' WHERE ' + concept.primary + ' = ? ';
                var tag = concept.primary.substr(0,4);
                tx.executeSql( sql , [ row[ concept.primary ] ], function(tx){
                    var lc = [];
                    var li = [];
                    var lv = [];
                    for(var i in row) {
                        if ( i.substr(0,4)== tag ) {
                            lc.push(i);
                            li.push('?');
                            lv.push(row[i]);
                        }
                    }
                    var sql = 'INSERT INTO ' + concept.getTableName() 
                            + '( ' + lc.join(',') + ')'
                            + 'VALUES ( ' + li.join(',') + ' ) ';
                    tx.executeSql( sql , lv  , function() {
                        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saved');
                    },function(tx,error) {
                        //error
                        Jaf.log('erreur sql ('+error.message+') '+sql);
                         
                    });
                    if ( mafonc ) mafonc(row);
                });
            } else {
                //ne possède pas de valeur sur id donc à creer 
                var lc = [];
                var li = [];
                var lv = [];
                for(var i in row) {
                    lc.push(i);
                    li.push('?');
                    lv.push(row[i]);
                }
                var sql = 'INSERT INTO ' + concept.getTableName() 
                        + '( ' + lc.join(',') + ')'
                        + 'VALUES ( ' + li.join(',') + ' ) ';
                tx.executeSql( sql , lv , function(tx,result){
                    var id = result.insertId;
                    concept.loadSqlRow( id , mafonc );
                });
            }
        });
	}

	JafConcept.prototype.setSqlRowset=function (rowset,mafonc) {
        //le row exite il ?
        var db       = Jaf.cm.getDb();
        var concept  = this;
        var nbsaving = Math.floor(rowset.length/400)+1;
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saving',nbsaving);
        var ids      = [];
        for(var j in rowset) {
            ids.push(rowset[j][concept.primary]);
        }

        db.transaction(function(tx) {
            //possède deja un id
            var sql = 'DELETE FROM ' + concept.getTableName() 
                    + ' WHERE '+concept.primary+' IN ( '+ ( ids.length==0 ? '0' : ids.join(',') ) +' )';
            var tag = concept.primary.substr(0,4);
            tx.executeSql( sql , [] , function(tx){
                var lc = [];
                var li = [];
                var lv = [];
                var row=rowset[0];
                for(var i in row) {
                    if ( i.substr(0,4)== tag ) {
                        lc.push(i);
                        li.push('?');
                    }
                }
                var cpt=0;
                if ( rowset.length>0) {
                    for(var j in rowset) {
                        var l   = [];
                        var row = rowset[j];
                        for(i in row) {
                            if ( i.substr(0,4)== tag ) {
                                if ( typeof row[i]=='string' && row[i].indexOf("'") > -1 ) {
                                    l.push( row[i].replace(/\'/g,"''") );
                                } else {
                                    l.push(  row[i] );
                                }
                            }
                        }
                        lv.push("'"+l.join("','")+"'");
                        cpt++;
                        if ( cpt==400 ) {
                            var sql = 'INSERT INTO ' + concept.getTableName() 
                                    + '( ' + lc.join(',') + ') '
                                    + 'SELECT '+lv.join( ' UNION SELECT ');

                            tx.executeSql( sql , []  , function() {
                                if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saved');
                            },function(tx,error) {
                                Jaf.log('erreur sql ('+error.message+') '+sql);
                            });
                            var lv=[];
                            cpt=0;
                        }
                    }
                    if ( lv.length>0) {
                        var sql = 'INSERT INTO ' + concept.getTableName() 
                                + '( ' + lc.join(',') + ') '
                                + 'SELECT '+lv.join( ' UNION SELECT ');
                        tx.executeSql( sql , []  , function() {
                            if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saved');
                        },function(tx,error) {
                            Jaf.log('erreur sql ('+error.message+') '+sql);
                        });
                    }
                } else {
                    if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(concept.getTableName(),'saved');
                }
                if ( mafonc ) mafonc(row);
            });
        });
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
			var label='';
			for(var nc in lc) {
				label += (label.length==0 ? '' : ' ') + rowset[i][ lc[nc] ]; 
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
    
    JafConcept.prototype.installSql = function(where) {
        var c = Jaf.cm.configConcepts[ this.name ];
        //Jaf.log('installSql de '+c.name);
        var listeChamps = localStorage.getItem( 'info_table_'+c.name );
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'creating');
        if ( !listeChamps ) {
            var db = Jaf.cm.getDb();
            db.transaction(function(tx) {
                var colonnes = []; 
                var listeChamps = [];
                for(var i in c.champs) {
                    var typeChamp = 'TEXT';
                    var info      = c.champs[i];
                    var champ     = i + ' ';
                    switch ( info.classPhp ) {
                        case 'Zaf_Db_Concept_Champ_FlagNewsletter' : 
                        case 'Zaf_Db_Concept_Champ_Datetime' : 
                        case 'Zaf_Db_Concept_Champ_Quantite' : 
                        case 'Zaf_Db_Concept_Champ_Liaison' : 
                        case 'Zaf_Db_Concept_Champ_Etat' : 
                        case 'Zaf_Db_Concept_Champ_Time' : 
                        case 'Zaf_Db_Concept_Champ_Date' : 
                        case 'Zaf_Db_Concept_Champ_Tri' : 
                        case 'Zaf_Db_Concept_Champ_Flag' : 
                            champ += 'INTEGER';
                        break;
                        case 'Zaf_Db_Concept_Champ_Montant' : 
                            champ += 'NUMERIC';
                        break;
                        case 'Zaf_Db_Concept_Champ_Id' : 
                            champ += 'INTEGER PRIMARY KEY ASC';
                        break;
                    }
                    
                    if ( info['default'] ) {
                        champ += ' DEFAULT "' + info['default'] + '"';
                    }
                    
                    colonnes.push( champ );
                    listeChamps.push(i);
                }
                var sql = 'CREATE TABLE IF NOT EXISTS ' + c.name + ' ( ' +colonnes.join(' , ') + ' )';
                //Jaf.log(sql);
                tx.executeSql( sql , [], function(tx){
                    Jaf.log('table ' + c.name + ' ajoutée');
                    localStorage.setItem( 'info_table_'+c.name ,  listeChamps.join('|') );
                    Jaf.cm.needDataConcept( c.name , where );
                    Jaf.cm.sqlInstalled.push(c.name);
                    if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'created');
                    
                }, function() {
                    Jaf.log('erreur createTable '+c.name+', sql = ' + sql );
                });
                
            });
        }
    }
    
    JafConcept.prototype.uninstallSql = function(mafonc) {
        var c  = Jaf.cm.configConcepts[ this.name ];
        var db = Jaf.cm.getDb();
        db.transaction(function(tx) {
            var sql = 'DROP TABLE IF EXISTS ' + c.name;
            var index = Jaf.cm.sqlInstalled.indexOf(c.name);
            if(index > -1){
                Jaf.cm.sqlInstalled.splice(index,1);
            }

            localStorage.removeItem( 'info_table_'+c.name );
            tx.executeSql( sql , [], function(tx){
                Jaf.log('table ' + c.name + ' supprimée');
                if ( mafonc ) mafonc(c.name);
            });
        });
    }
    
    JafConcept.prototype.loadFromSql = function() {
        var c       = Jaf.cm.configConcepts[ this.name ];
        var concept = this;
        var sql     = 'SELECT * FROM ' + c.name ;
        if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'loading2');
        
        //on determine le tri du concepts
        var tab = [];
        for(var nomChamp in c.champs ) {
           if ( 1*c.champs[nomChamp].inclusDansTri>0 ) {
                tab.push( sprintf('%02d',c.champs[nomChamp].inclusDansTri)+'|'+nomChamp+' '+c.champs[nomChamp].sensTri);
           }           
        }
        if ( tab.length >0 ) {
            var res=[];
            tab.sort();
            for(var i in tab) {
                var v = tab[i];
                var t = v.split('|');
                res.push(t[1]);
            }
            sql += ' ORDER BY '+res.join(',');
        } 
        Jaf.cm.sql_query(sql, [] , function(rowset) {
            for(var i in rowset) {
                var row = {};
                for(var j in rowset[i]) {
                    row[j] = typeof rowset[i][j] == 'string' ? rowset[i][j] : typeof rowset[i][j] == 'number' ? ''+rowset[i][j] : null;
                }
                concept.setRow(row);
            }
            
            //Jaf.log('loadFromSql:'+c.name);
            Jaf.cm.sqlInstalled.push(c.name);
            if ( Jaf.cm.bindSqlInstalled ) Jaf.cm.bindSqlInstalled(c.name,'loaded2');
        });
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

Jaf.select = function( concept ){
	this.concepts  = [];
	this.jointures = [];
	this.typeJoin  = [];
	this.wheres    = [];
    this.orders    = [];
	this.concepts.push(concept);
	
	// join au select un nouveau concept portant le nom name et relié au select par le champ cp et relié au nouveau concept par le champ cd , optionnel wc,wv tel que where wc=wl sur la jointure
	Jaf.select.prototype.joinAux = function (type,name,cp,cd,where) {
		this.concepts.push( Jaf.cm.getConcept(name) );
		this.jointures.push( {cp:cp,cd:cd} );
		this.wheres.push( where );
        this.typeJoin.push( type );
		return this;
	}
    // champ : nom du champ de tri, sens : true=croissant, false=decroissant
    Jaf.select.prototype.order = function (champ,sens) {
		this.orders.push({champ:champ,sens:sens});
		return this;
	}
	Jaf.select.prototype.join = function (name,cp,cd,where) {
		this.joinAux(1,name,cp,cd,where);
		return this;
	}
    
	Jaf.select.prototype.leftJoin = function (name,cp,cd,where) {
		this.joinAux(2,name,cp,cd,where);
		return this;
	}
	
    Jaf.select.prototype.fetchAll_where = function(row,where) {
        if ( where ) {
            var flag=true;
            for(var wc in where) {
                flag &= where[wc] == row[wc];
            }
            if ( flag ) {
                return row;
            } else {
                return null;
            }
        } else {
            return row;
        }
    }
    
	// renvoi un array d'objet contenant la fusion des champs des concepts du select relié par leurs jointures définies
	Jaf.select.prototype.fetchAll = function(filtres) {
		var cpt    = 1;
		var nbRow  = 0;
		var rowset = [];
		
		for(var  i in this.concepts[0].rowset) {
			var r = {};
            for(var j in this.concepts[0].rowset[i]) {
                r[j] = this.concepts[0].rowset[i][j];
            }
            rowset[nbRow++] = r;
		}
		//Jaf.log('Pour '+this.concepts[0].name+' ==> rowset.length='+rowset.length);

		while ( cpt<this.concepts.length ) {
			var champJointure = this.jointures[ cpt - 1 ].cp;
			var champJoin     = this.jointures[ cpt - 1 ].cd;
			var typeJoin      = this.typeJoin[ cpt - 1 ];
			var where         = this.wheres[ cpt - 1 ];
			var modePrimary   = this.concepts[cpt].primary == champJoin;
			for(var  i in rowset ) {
                if ( modePrimary ) {
                    var row = this.fetchAll_where ( this.concepts[cpt].getRow( rowset[i][ champJointure ] ) , where  );
                    if (row) { 
                        $.extend( rowset[i], row );
                    } else if ( typeJoin == 1 ) {
                        delete( rowset[i] );
                    }
                } else {
                    var rowsetJoin=this.concepts[cpt].getRowsetByChamp( champJoin , rowset[i][ champJointure ]  , where );
                    if ( rowsetJoin.length==0) {
                        if ( typeJoin == 1 ) {
                            delete( rowset[i] );
                        }
                    } else if ( rowsetJoin.length==1 ) {
                        $.extend( rowset[i], rowsetJoin[0] );
                    } else {
                        for(var  j in rowsetJoin ) {
                            var r = {};
                            $.extend( r , rowset[i] , rowsetJoin[j]);
                            rowset.push(r);
                        }
                    }
                }
			}
			nbRow=rowset.length;
  		    //Jaf.log('Join '+this.concepts[cpt].name+' ==> rowset.length='+nbRow);

            cpt++;
            
		}
		var res_rowset=[];
		var pre=0;
        for(var j in filtres ) {
             if ( filtres[j] ) {pre++;break;}
        }
        if ( pre>0) {
            for(var i in rowset) {
                var flag=true;
                for(var j in filtres ) {
                    if ( filtres[j] ) {
                        if (rowset[i][j]) {
                            if ( typeof filtres[j] == 'object' ) {
                                for(var operateur in  filtres[j] ) {
                                    var value = filtres[j][operateur];
                                    switch (operateur) {
                                        case 'in'           : flag &= value.indexOf( rowset[i][j] ) > -1; break;
                                        case 'sup'          : flag &= rowset[i][j] >= value;              break;
                                        case 'inf'          : flag &= rowset[i][j] <= value;              break;
                                        case 'sups'         : flag &= rowset[i][j] > value;               break;
                                        case 'infs'         : flag &= rowset[i][j] < value;               break;
                                        case 'like'         : 
                                            if ( typeof value == 'object' ) {
                                                var res='';
                                                for(var k in value.listeChamp ) {
                                                    res += rowset[i][ value.listeChamp[k] ]+' ';
                                                }
                                                flag &= Jaf.comparePureTexte( res , value.value );
                                            } else {
                                                flag &= Jaf.comparePureTexte( rowset[i][j], value );
                                            }
                                            break;
                                        case 'between'      : flag &= rowset[i][j] >= value[0] && rowset[i][j] <= value[1];           break;
                                    }
                                }
                            } else {				
                                flag &= rowset[i][j] == filtres[j];
                            }
                        } else {
                            flag=false;
                        }
                        if (!flag) break;
                    } 
                }
                if (flag) {
                    res_rowset.push(rowset[i]);
                } 
            }
        } else {
            //Jaf.log('Pas de filtre');
            res_rowset=rowset;
        }
        
        if ( this.orders.length > 0 ) {
            var tris = this.orders;
            var new_rowset = res_rowset.sort(function (a, b) {
                var a_sup_b = 0;
                for(var i in tris) {
                    var key = tris[ i ].champ;
                    if ( isNaN( a[key] ) ) {
                        if ( a[key] != b[key] ) {
                            a_sup_b =  ( tris[ i ].sens ? 1 : -1 ) * ( a[key] > b[key] ? 1 : -1 );
                            break;
                        }
                    } else if (  a[key] != b[key] ) {
                        a_sup_b =  tris[ i ].sens ? a[key] - b[key] : b[key] - a[key];
                        break;
                    }
                }
                return a_sup_b;
            });
            res_rowset = new_rowset;
        }
        var res=[];
        for(var i in res_rowset) {
            res.push(res_rowset[i]);
        }
	    //Jaf.log('FetchAll ==> '+res.length);

		return res;
	}
} 

var JafController = function () {
	this.opener ={};
	this.closer ={};
	this.droits ={};
    this.obj    ={};
	this.Tri    ={
		nomColonne : '',
		desc       : false
	}
	
    JafController.prototype.init=function(name) {
		this.name=name;
		Jaf.log('Lancement du controller : '+name);
	}
	
    JafController.prototype.setObj=function(name,value) {
		this.obj[ name ] = value;
		return this;
	}
    
    JafController.prototype.getObj=function(name) {
		return this.obj[ name ];
	}
	
    JafController.prototype.allowedEffect=function(zone) {
		if ( !zone ) {
			zone=$('#body');
		} else if ( typeof zone == 'string') {
			zone=$(zone);
		} 
		for(var j in this.droits) {
			for(var i in this.droits[j] ) {
				if ( !this.droits[j][i] ) {
					zone.find('.droit_'+j+'_'+i).each(function() {
						var tagName=$(this).get(0).tagName.toLowerCase();
						if ( tagName == 'div' || tagName == 'span' ) {
							$(this).hide();
						} else {
							$(this).attr('disabled','disabled');
						}
					});
				} else {
					zone.find('.droit_'+j+'_'+i).removeAttr('disabled');
				}
			}
		}
	}
	
	JafController.prototype.setEffectTri=function(class_id,mafonction) {
		var controlleur=this;
		$(class_id).each(function() {
			var month        = $(this);
			var classColonne = month.attr('class');
			if ( classColonne && classColonne.length>0) {
				var tab   = month.attr('class').split(' ');
				for(var i in tab) {
					var nomColonne = tab[i];
					if ( controlleur.cel[ nomColonne ].tri ) {
						month.append('<span class="icone sens" />');
						month.click(function() {
							if ( controlleur.Tri.nomColonne != nomColonne ) {
								month.parent().find('.sens').html('');
								month.parent().find('th').removeClass('tri_asc');
								month.parent().find('th').removeClass('tri_desc');
								controlleur.Tri.nomColonne = nomColonne;
							}
							if ( month.hasClass('tri_desc') || !month.hasClass('tri_asc') ) {
								month.removeClass('tri_desc');
								month.addClass('tri_asc');
								controlleur.Tri.desc = false; 
								month.find('.sens').html('#');
							} else {
								month.removeClass('tri_asc');
								month.addClass('tri_desc');
								controlleur.Tri.desc = true; 
								month.find('.sens').html("'");
							}
							mafonction();
						});
						if ( controlleur.Tri.nomColonne == nomColonne ) {
							month.addClass('tri_asc');
							month.find('.sens').html('#');
						}
						month.css('cursor','pointer');
					}
				}
			}
		});
	}
	
	JafController.prototype.makeTri=function(tv) {
		tv.sort( this.cel[ this.Tri.nomColonne ].tri );
		if ( this.Tri.desc ) tv.reverse(); 
	}
	
	JafController.prototype.setOpen=function(name,mafonction) {
		this.opener[name]=mafonction;
	}
	
	JafController.prototype.open=function(name,monid) {
		this.opener[name](monid);
	}

	JafController.prototype.setClose=function(name,mafonction) {
		this.closer[name]=mafonction;
	}
	
	JafController.prototype.close=function(name,monid) {
		this.closer[name](monid);
	}
	
	JafController.prototype.addEffect = {
		Texte : function(nomConcept,zone,monid,nomChamp,mafonc) {
			zone.find('[name='+nomChamp+']').change(function() {
				Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , $(this).val() ).save( mafonc );
			});
		},
		Montant : function(nomConcept,zone,monid,nomChamp,mafonc) {
			zone.find('[name='+nomChamp+']').change(function() {
				Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , Jaf.html2mysql.Montant( $(this).val() ) ).save( mafonc );
			});
		},
        Flag : function(nomConcept,zone,monid,nomChamp,mafonc) {
			var o=zone.find('[data-role='+nomChamp+']');
            
            if ( o.data('value')==1) {
                o.addClass('selection');
            }
            
            o.click(function() {
				var obj=$(this);
                if ( obj.data('value')==0 ) {
                    var value=1;
                    obj.addClass('selection');
                } else {
                    var value=0;
                    obj.removeClass('selection');
                }
                obj.data('value',value);
                Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , value ).save( mafonc );
                return false;
			});
		},
	}
    JafController.prototype.addEffect.Quantite = JafController.prototype.addEffect.Texte;
	JafController.prototype.addEffect.Fichier  = JafController.prototype.addEffect.Texte;
	JafController.prototype.addEffect.Select   = JafController.prototype.addEffect.Texte;
	JafController.prototype.addEffect.Tva      = JafController.prototype.addEffect.Texte;
	JafController.prototype.addEffect.Textarea = JafController.prototype.addEffect.Texte;

	JafController.prototype.valorise = function ( zone , champ , value ) {
        var obj = zone.find( '[data-champ='+champ+']' ).first(); 
        if ( obj.length > 0 ) {
            var type = obj.get(0).tagName;
            var valueFormated = obj.data('format') ? Jaf.formatValue[ obj.data('format') ]( value ) : value ; 
            if ( type == 'INPUT' ||
                 type == 'SELECT' ) {
                obj.val( valueFormated );
            } else {
                obj.html( valueFormated );
            }
            if ( obj.data('action') ) {
                var controller=this;
                controller[ obj.data('action') ](obj,champ,value,valueFormated); 
            }
        }
    }
    
    JafController.prototype.bindSqlInstalled = function (concept,type,nb) {
        if ( type ) { 
            this.nbProcessus[ type ]+= nb ? nb : 1;
            Jaf.log(concept+' : '+type+' ==> '+this.nbProcessus.created+'/'+this.nbProcessus.creating+', '+this.nbProcessus.loaded+'/'+this.nbProcessus.loading+', '+this.nbProcessus.saved+'/'+this.nbProcessus.saving);
        }
        var step_old = this.step;
        switch ( this.step ) {
            case 1 :
                if ( this.nbProcessus.created == this.nbProcessus.creating && 
                     this.nbProcessus.init    == this.nbProcessus.loading ) {
                    this.step=2;
                }
                coef = this.nbProcessus.created / this.nbProcessus.init;
                $('#init .progression').css('width',Math.round( 10 + coef * 25 )+'%');
            break;
            case 2 :
                if ( this.nbProcessus.saved  == this.nbProcessus.saving && 
                     this.nbProcessus.loaded == this.nbProcessus.loading && 
                     this.nbProcessus.init   == this.nbProcessus.loaded )  {
                    this.step=3;
                }
                coef = ( this.nbProcessus.saved + this.nbProcessus.loaded ) / ( this.nbProcessus.saving +  this.nbProcessus.loading );
                $('#init .progression').css('width',Math.round( 35 + coef * 45 )+'%');
            break;
            case 3 :
                
                if ( this.nbElementSynchro ) {
                   var restant = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
                } else {
                    this.nbElementSynchro = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
                    var restant = this.nbElementSynchro;
                    if ( restant > 0 ) {
                        Jaf.cm.synchroniseBdd(); 
                    }
                }
                if ( restant > 0 ) {
                    coef      = 1 - restant/this.nbElementSynchro;
                    $('#init .progression').css('width',Math.round( 80 + coef * 20 )+'%');
                    setTimeout(this.bindSqlInstalled,500);
                } else {
                    coef      = 1;
                    this.step = 4;
                    $('#init .progression').animate({width:'100%'},300);
                }
            break;
            
        }
        if ( step_old != this.step ) this.init();
    }
}
/**
********************** TEMPLATE MANAGER
**/
Jaf.tm = {
	t           : {},
	ficTml      : {},
	TmlWaiting  : 0,
    dossier     : '/modbop/template',
	require     : function (filename) {
		if ( !Jaf.tm.ficTml[filename] ) {
			Jaf.tm.TmlWaiting++;
			$.ajax({
				url      : Jaf.tm.dossier +'/' + filename,
                dataType : 'text'
			}).done(function (tmlContent) {
				var pos = filename.indexOf('?');
				if ( pos > 0 ) filename = filename.substr(0,pos);
				Jaf.tm.ficTml[filename] = tmlContent;
                Jaf.tm.multiCompile(filename,tmlContent);
				Jaf.tm.TmlWaiting--;
				Jaf.tm.checkOnLoad();
			});
		}
	},
	require_new: function (filename) {
		if ( !Jaf.tm.ficTml[filename] ) {
			Jaf.tm.TmlWaiting++;
			$.ajax({
				url      : Jaf.tm.dossier +'/' + filename,
                dataType : 'text'
			}).done(function (tmlContent) {
				var regex = /([a-zA-Z0-9_-]+).([0-9]+).tml/gi
                var res = regex.exec(filename);
                filename = res[1]+'.tml';
				Jaf.tm.ficTml[filename] = tmlContent;
                Jaf.tm.multiCompile(filename,tmlContent);
				Jaf.tm.TmlWaiting--;
				Jaf.tm.checkOnLoad();
			});
		}
	},
	multiCompile     : function (filename,tmlContent) {
		var preFixe = filename.substr(0,filename.length-4);
		preFixe = preFixe.replace(/\//g,'_');
		var code = $('<div>'+tmlContent+'</div>');
		code.children().each(function () {
			var nomTemplate = $(this).attr('id') ? preFixe + '_' + $(this).attr('id') : preFixe ;
			//alert( $(this).html());
			Jaf.tm.compile( nomTemplate , $(this).html() );
		});
	},
	compile : function ( nomTemplate , monHtml ) {
		//Jaf.log('new template : '+nomTemplate);
		Jaf.tm.t[ nomTemplate ] = Mustache.compilePartial( nomTemplate , monHtml );
	},
    getRow : function(row) {
        if ( $.isArray(row) ) {
            var o=[];
            for(var i in row) {
                if ( row[i] ) {
                    o.push( typeof row[i] == 'object'  ? Jaf.tm.getRow( row[i] )  : row[i] );
                } else {
                    o.push( '' );
                }
            }
        }
        else {
            var o={};
            for(var i in row) {
                if ( row[i] ) {
                    o[i] = typeof row[i] == 'object' ? Jaf.tm.getRow( row[i] ) : row[i];
                } else {
                    o[i] = '';
                }
            }
        }
        return o;
    },
    render : function(nomTemplate,row) {
        var res = Jaf.tm.getRow(row) ;
        return Jaf.tm.t[ nomTemplate ]( res );
    },
	checkOnLoad : function () {
		if ( Jaf.tm.afterLoadFunction && Jaf.tm.TmlWaiting==0 ) {
			Jaf.tm.afterLoadFunction();
		}
	},
	onload : function ( mafonction ) {
		Jaf.tm.afterLoadFunction = mafonction;
		Jaf.tm.checkOnLoad();
	}
}

var Jfo = {
    onLoadUpdateReadyFonctions : {},
    onLoadNoUpdateFonctions    : {},
    init : function() {
        Jaf.log('Jfo init');
        window.applicationCache.addEventListener('updateready', function(e) {
            Jaf.log('Appcache status='+window.applicationCache.status);
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                // Lancer les fonctions en cas de mise à jour
                for(var i in Jfo.onLoadUpdateReadyFonctions) {
                    Jfo.onLoadUpdateReadyFonctions[i]();
                }
            }
        }, false);

        window.applicationCache.addEventListener('noupdate', function(e) {
          // Pas de mise à jour
            for(var i in Jfo.onLoadNoUpdateFonctions) {
                Jfo.onLoadNoUpdateFonctions[i]();
            }            
            
        }, false);
    },
    
    setLoadUpdateReadyFonctions : function (name,mafonc) {
        Jfo.onLoadUpdateReadyFonctions[name] = mafonc;
        return this;
    },
    
    setNoUpdateFonctions : function (name,mafonc) {
        Jfo.onLoadNoUpdateFonctions[name] = mafonc;
        return this;
    }
}
Jfo.init();	

Jaf.couleur = function( couleur , opacity ) {
	if ( couleur && couleur.length > 0 ) {
		this.r = parseInt ( couleur.substr(1,2) , 16 );
		this.v = parseInt ( couleur.substr(3,2) , 16 );
		this.b = parseInt ( couleur.substr(5,2) , 16 );
		this.t = opacity ? opacity : 1;
	}
	
	Jaf.couleur.prototype.toString = function () {
		if ( this.t==1 ) {
			return 'rgb('+this.r+','+this.v+','+this.b+')';
		} else {
			return 'rgba('+this.r+','+this.v+','+this.b+','+this.t+')';
		}
	}

	Jaf.couleur.prototype.addColor = function (r,v,b,t) {
		this.r = Math.floor( this.r > r ? ( this.r - r ) * t + r : ( r - this.r ) * t + this.r );
		this.v = Math.floor( this.v > v ? ( this.v - v ) * t + v : ( v - this.v ) * t + this.v );
		this.b = Math.floor( this.b > b ? ( this.b - b ) * t + b : ( b - this.b ) * t + this.b );
		return this;
	}

	Jaf.couleur.prototype.getGradient = function (r,v,b,t,orientation) {
		r = Math.floor( this.r > r ? ( this.r - r ) * t + r : ( r - this.r ) * t + this.r );
		v = Math.floor( this.v > v ? ( this.v - v ) * t + v : ( v - this.v ) * t + this.v );
		b = Math.floor( this.b > b ? ( this.b - b ) * t + b : ( b - this.b ) * t + this.b );
		if ( $.browser.chrome ) {
			var res = '-webkit-linear-gradient';
		} else if ( $.browser.mozilla ) {
			var res = '-moz-linear-gradient';
		} else {
			return 'rgb('+r+','+v+','+b+')';
		}
		res += '('+orientation+' , rgb('+this.r+','+this.v+','+this.b+') 30%, rgb('+r+','+v+','+b+') 100%)';
		return res;
	}
	
}

sprintf = sprintfWrapper.init;
$(document).ready(function(){
	

	var tab= new Array();
	
	init_effects();
	
	Jaf.initEffect();
    
	$(".nondispo").click(function () {
                 $mess = $('<div></div>').html('Fonctionnalité pas encore disponible.<br><br>Prochainement sur votre solution').dialog({ autoOpen: false, 
                                                                                                                                         title: 'Information',
                                                                                                                                         buttons: {
                                                                                                                                  				  Fermer: function() {
                                                                                                                                  					             $(this).dialog('close');
                                                                                                                                  				           }
                                                                                                                                                  }
                                                                                                                                           } );
                 $mess.dialog('open'); 
                 return(false);
                 }
  );
	
  //class=jq_txt_defaut
  //Version 1.02 du 12/02/2009
  //Permet de mettre une valeur par défaut à l'interieur d'un input type=text, lorsqu'il a la classe jq_txt_defaut et un alt
  //Ex : <input type=\"text\" name=\"RECH\" id=\"RECH\" alt=\"Indiquez un produit\" class=\"jq_txt_defaut\" value=\"".htmlentities(stripslashes($RECH))."\" />
  $("input.jq_txt_defaut[value=]") //pour ceux qui n'ont pas de value
      .attr("value", function(){
        return this.alt;            //on met leur alt comme value
      });
    
  var txt_defaut_tab_deja_clique = new Array(); //pour déterminer le premier click
  var txt_defaut_i=0;                           //pour attribuer un id aux formulaires qui n'en ont pas
  $("form:has(input.jq_txt_defaut)")            //pour les formulaires qui ont des input class=jq_txt_defaut
    .each(function(){                           //on les parcourt pour pouvoir incrémenter txt_defaut_i
      //si le formulaire n'a pas d'id, on lui en attribue un
      if(this.id.length==0){
        if(this.name.length>0)
          this.id = this.name;           //on met le name s'il y en a un
        else                  
          this.id = 'form_'+txt_defaut_i;//sinon on prend une variable incrémentale  
      }
    
      $(this).click(function(){                   //onClick du formulaire
        if(!txt_defaut_tab_deja_clique[this.id]){ //seulement le premier click
          txt_defaut_tab_deja_clique[this.id]=true;
          $(this).find("input.jq_txt_defaut")     //on cherche les input concernés de ce formulaire
            .each(function(){                     //on les parcourt
              if(this.value==this.alt)            //si leur value vaut toujours le alt
                this.value='';                    //on vide leur value
            })    
        }   
      }) 
      txt_defaut_i++;                                              
    })
    
    
    
    
  //class=jq_suiveuse
  //Version 1.0 du 22/09/2008
  //Mouche suiveuse jQuery : mettre class=jq_suiveuse à un conteneur. Son padding-top s'adaptera pour que son contenu reste à l'écran
  //Ex : Texte qui disparaît <div class="jq_suiveuse">Texte qui reste à l'écran</div>  
  //NECESSITE LA FONCTION JS findPos() !!
  if($("body").find(".jq_suiveuse").length){         //si on a des mouches suiveuses
    $(window).scroll(function(){                     //onScroll
      $(".jq_suiveuse").each(function(){             //On parcourt les mouches suiveuses
        pos_y=findPos(this).y;                       //position du conteneur par rapport au haut de la page
        scroll_y=document.documentElement.scrollTop; //position du scrolling actuel
        var jq_padding_top = 0;
        if(scroll_y>pos_y)                           //on a scrollé plus bas que le haut du conteneur
          jq_padding_top = scroll_y - pos_y;
        //$(this).css("padding-top", paddingTop+"px"); 
        $(this).stop().animate({paddingTop: jq_padding_top+"px"}, 'normal');
      }); 
    });
  }


  // class= jq_menu
  // Version 1.0 du 18/11/2008
  // Menu avec Sous menus qui apparaissent
  $(".jq_menu li ul").css("display", "none")
                     .css("opacity", 0);
    $(".jq_menu li:has(ul)").hover(function() {
      $(this).children("ul").css("display", "block");
      $(this).children("ul").fadeTo('fast', 0.9);
    }, function() {
      $(this).children("ul").fadeTo('fast', 0, function(){
                                                   $(this).css("display", "none");
                                                 });
    });
    
  init_effect_message();
  
  // HoverAccordion
  if ($.hoverAccordion ) {
      $('#jquery_faq').hoverAccordion({
        activateItem: '1',
        speed: 'fast'
      });
   }
  $('#jquery_faq').children('li:first').addClass('firstitem');
  $('#jquery_faq').children('li:last').addClass('lastitem');
  
  $('#reponses .reponse').hide();
  
  $('#jquery_faq li li')
  .css({cursor: 'pointer'})
  .click(function(){
    $('#reponses .reponse').hide();
    $('#jquery_faq li li').removeClass('lihover');
    $(this).addClass('lihover');
    $('#rep_'+$(this).prop('id')+'').slideDown('slow');
  });
  var isCtrl = false;
  $(document).keyup(function (e) {
	  if(e.which == 17) isCtrl=false;
	  }).keydown(function (e) {
	      if(e.which == 17) isCtrl=true;
	      
	      //NE PAS UTILISER 69 (E) car déclenché par ALTGR+E (euro)
	      if(e.which == 83 && isCtrl == true) {
	          // Votre fonction à déclencher au Ctrl+S
	    	  init_effect_editable('.zafEditable'); 
	   	return false;
	   }
	  });
});  



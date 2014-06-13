Jaf.flightstat= {
	urlAPI    : 'https://api.flightstats.com/flex/',
	appId     : 'adc52131',
	appKey    : '9a6cd231ba8d19416375a5650d5c984b',
	mdp       : 'avadmin',
	getStatus : function(numvol,madate,type,mafonction) {
		var infos  = numvol.match( /^([A-Z]{1,3})([0-9]{2,5})$/ );
		if ( infos ) {
		    var codeCompagny = infos[1];
		    var codeVol      = infos[2];
			var d            = Jaf.getDate(madate);
			var dr           = sprintf('%04d/%02d/%02d',d.getFullYear(),d.getMonth()+1,d.getDate());
			type             = type=='D' ? 'dep' : 'arr';
			var monurl       = Jaf.flightstat.urlAPI + 'flightstatus/rest/v2/json/flight/status/'+codeCompagny+'/'+codeVol+'/'+type+'/'+dr
			$.ajax({
				url    : 'proxyUrl.php',
				type   : 'POST',
				async  : false,
				data : {
					url    : monurl,
					appId  : Jaf.flightstat.appId,
					appKey : Jaf.flightstat.appKey,
					utc    : 'false',
					mdp    : Jaf.flightstat.mdp
				}
			}).done(function (data) {
				eval('var res='+data);
				if ( mafonction ) {
					mafonction(res);
				}
			});
			return true;
		} else {
			return false;
		}
	},
	getSchedules : function(numvol,madate,type,mafonction) {
		Jaf.log('je passe par getSchedules');
        var infos  = numvol.match( /^([A-Z]{1,3})([0-9]{2,5})$/ );
		if ( infos ) {
		    var codeCompagny = infos[1];
		    var codeVol      = infos[2];
			var d            = Jaf.getDate(madate);
			var dr           = sprintf('%04d/%02d/%02d',d.getFullYear(),d.getMonth()+1,d.getDate());
			type             = type=='D' ? 'departing' : 'arriving';
			var monurl       = Jaf.flightstat.urlAPI + 'schedules/rest/v1/json/flight/'+codeCompagny+'/'+codeVol+'/'+type+'/'+dr
			$.ajax({
				url    : 'proxyUrl.php',
				type   : 'POST',
				async  : false,
				data : {
					url    : monurl,
					appId  : Jaf.flightstat.appId,
					appKey : Jaf.flightstat.appKey,
					utc    : 'false',
					mdp    : Jaf.flightstat.mdp
				}
			}).done(function (data) {
				eval('var res='+data);
				if ( mafonction ) {
					mafonction(res);
				}
			});
			return true;
		} else {
			return false;
		}
	}
    
}
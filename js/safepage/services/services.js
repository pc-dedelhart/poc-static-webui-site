// http://personalcapital.jira.com/wiki/display/PFA/Second+Generation+of+Account+APIs
window.PersonalCapital = window.PersonalCapital || {};
window.PersonalCapital.globals = window.PersonalCapital.globals || {};
$(function(){
	// capture the elusive csrf
	if( !PersonalCapital.globals.csrf && typeof csrf !='undefined'){
		PersonalCapital.globals.csrf = csrf;
	}
});

PersonalCapital.services = {};

PersonalCapital.services.request = function(url, params, callback){
	params = params || {};
	params.csrf = PersonalCapital.globals.csrf;
	/*PFA-5994: Remove flash cookie: DEVISE_FSO
	 * 
		if(typeof PersonalCapital.globals.DEVICE_FSO != "undefined")params.DEVICE_FSO = PersonalCapital.globals.DEVICE_FSO;
	*/
	//TODO: params.apiClient should be set at the caller level since we have more than one client: sidebar, login, web, plugin etc.
	//		if any, the default should be more generic one: web
	if(!params.apiClient)params.apiClient = 'WEB';

	$.post(url, params, 'json')
	.success(function(response){
		//If csrf is returned as part of response, it should update globals.csrf
		if(response && response.spHeader && response.spHeader.csrf){
			PersonalCapital.globals.csrf = response.spHeader.csrf;
		}
		/*PFA-5994: Remove flash cookie: DEVISE_FSO
		 * 
			//If deviceFSO is returned as part of response, it should set the flash cookie and update globals.DEVICE_FSO
			if(response && response.spHeader && response.spHeader.DEVICE_FSO){
				PersonalCapital.utils.deviceFSO.set(response.spHeader.DEVICE_FSO);
				PersonalCapital.globals.DEVICE_FSO = PersonalCapital.utils.deviceFSO.get();
			}
		*/
		if( typeof callback == 'function' ){
			callback(response);
		}
		if( typeof handleEventFromSwf == 'function' && response && response.spHeader ){
			var encodedHeaders;
			try{
				encodedHeaders = JSON.stringify(response.spHeader);
			}catch(e){}
			handleEventFromSwf('SPHeader::CHANGED', encodedHeaders);
		}
	 })
	.error(function(response){
		window.rr = response;
		var description = 'API Error (HTML Client):\n';
		description += url + '\n';
		try{
			description += JSON.stringify(params) + '\n';
		}catch(e){}
		description += response.status + '\n';
		description += response.statusText + '\n';
		description += response.getAllResponseHeaders() + '\n';
		$.post('/api/feedback/logFeedback', { description: description } );
	});
};

PersonalCapital.services.Accounts = {
	get: function(params, callback){
		if( typeof params == 'function' ){
			callback = params;
			params = null;
		}
		PersonalCapital.services.request('/api/newaccount/getAccounts', params, callback);
	}
};

PersonalCapital.services.Session = {
	get: function(params, callback){
		if( typeof params == 'function' ){
			callback = params;
			params = null;
		}
		PersonalCapital.services.request('/api/login/querySession', params, callback);
	}
};

PersonalCapital.services.Feedback = {
	send: function(title, description, callback){
		var params = params || {};
		params.description = title + ": " + description;
		PersonalCapital.services.request('/api/feedback/logFeedback', params, callback);
	}
};

PersonalCapital.services.InvestmentProfile = {
	get: function(callback){
		PersonalCapital.services.request('/api/profile/getAdvisorInterviewInfo', null, callback);
	},

	update: function(params, callback){
		PersonalCapital.services.request('/api/profile/updateAdvisorInterviewInfo', params, callback);
	}
};

PersonalCapital.services.Login = {
		validateSession: function(params, callback){
			PersonalCapital.services.request('/api/login/validateSession', params, callback);
		},
		
		identifyUser: function(params, callback){
			PersonalCapital.services.request('/api/login/identifyUser', params, callback);
		},
		
		authenticatePassword: function(params, callback){
			PersonalCapital.services.request('/api/credential/authenticatePassword', params, callback);
		},
		
		authenticatePin: function(params, callback){
			PersonalCapital.services.request('/api/credential/authenticatePin', params, callback);
		},
		
		authenticateEmailCode: function(params, callback){
			PersonalCapital.services.request('/api/credential/authenticateEmailByCode', params, callback);
		},
		
		authenticatePhoneAuth: function(params, callback){
			PersonalCapital.services.request('/api/credential/authenticatePhone', params, callback);
		},
		
		authenticateUserSite: function(params, callback){
			PersonalCapital.services.request('/api/credential/authenticateUserSiteKnowledge', params, callback);
		},
		
		getChallengeUserSites: function(params, callback){
			PersonalCapital.services.request('/api/credential/challengeUserSiteKnowledge', params, callback);
		},
		
		registerPassword: function(params, callback){
			PersonalCapital.services.request('/api/credential/registerCredentials', params, callback);
		},
		
		resetPassword: function(params, callback){
			PersonalCapital.services.request('/api/credential/resetPassword', params, callback);
		},
		
		challengeEmail: function(params, callback){
			PersonalCapital.services.request('/api/credential/challengeEmail', params, callback);
		},
		
		challengePhone: function(params, callback){
			PersonalCapital.services.request('/api/credential/challengePhone', params, callback);
		},
		
		switchUser: function(params, callback){
			PersonalCapital.services.request('/api/login/switchUser', params, callback);
		},
		
		suggestDeviceName: function(params, callback){
			PersonalCapital.services.request('/api/credential/suggestDeviceName', params, callback);
		}
}
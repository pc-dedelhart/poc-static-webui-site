// assume SP is defined (in sp-base.js)
SafePage.admin = (function() {
	return {
		
		get: function (url, params, success, failure) {    
		    // Reset the session timeout
		    url = getFullUrlPath(url);
		
		    $.get(url, params,
		    	function (data) {
		    		var header = data.spHeader;
			        if (header.success === true && success) 
			        {
			            success(header, data.spData);
			        } 
			        else 
			        {
					  var message = header.errorMessages;
			       	  if (failure) 
			       	  {
						failure(message);
					  } 
					  else  
					  {
						alert(message);
					  }
					}
			    }, "json");
		},
		
		post: function (url, params, success, failure) {
		    // Reset the session timeout
		    url = getFullUrlPath(url);
		
			/*
			 * Add CSRF param if available
			 */
			var csrf = window.SP.csrf;
			if (csrf)
			{
				if (params)
				{
					params.csrf = csrf;
				}
				else
				{
					params = {csrf: csrf};
				}
			}
		    $.post(url, params,
		    	function (data) {
		    		var header = data.spHeader;
			        if (header.success === true && success) 
			        {
			            success(header, data.spData);
			        } 
			        else 
			        {
					  var message = header.errorMessages;
			       	  if (failure) 
			       	  {
						failure(message);
					  } 
					  else  
					  {
						alert(message);
					  }
					}
			    }, "json");
		},

		deleteYodleeUser: function (yodleeId, callback, error) {
			this.post("api/admin/deleteYodleeUser", {yodleeId: yodleeId}, callback, error);
		},

		deleteUser: function (userId, callback, error) {
			this.post("api/admin/deleteUser", {userId: userId}, callback, error);
		},

		inviteUser: function (email, betaTester, callback, error) {
			this.post("api/admin/inviteUser", {email: email, betaTester: betaTester}, callback, error);
		},

		changeUserStatus: function (userId, newStatus, keepSites, callback, error) {
			this.post("api/admin/changeUserStatus", {userId: userId, newStatus: newStatus, keepSites: keepSites}, callback, error);
		},
		
		changeUserType: function (userId, newType, callback, error) {
			this.post("api/admin/changeUserType", {userId: userId, newType: newType}, callback, error);
		},
		
		clearNeverDomains: function (userId, callback, error) {
			this.post("api/admin/clearNeverDomains", {userId: userId}, callback, error);
		},

		profileSite: function (loginUrl, username, password, callback, error) {
			this.post("api/siteadmin/profileSite", {loginUrl: loginUrl, username: username, password: password}, callback, error);
		},
		
		getLoginData: function(loginDataId, productDataId, callback){
			this.post("api/siteadmin/getLoginDataDetails", {loginDataId:loginDataId, productDataId:productDataId}, callback);				
		},
			
		revertLoginData: function(loginDataId, productDataId,  callback){
			this.post("api/siteadmin/revertLoginData", {loginDataId:loginDataId, productDataId:productDataId}, callback);				
		}		
	};
})();

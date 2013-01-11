// assume SP is defined (in sp-base.js)
			
$(document).ready(function(){
    window.SP.csrf = $("#csrf").val();
});

function getFullUrlPath(url)
{
	if (url) {
		if (url.indexOf("http") != 0) {
			if (url.indexOf('/') != 0) {
				url = '/' + url;
			}
			url = window.location.protocol + "//" + window.location.host + url;
		}
	}
	return url;
}

if (typeof SafePage == "undefined") {
	window.SafePage = (function () {
		return {
			version: "1.0",
			standalone: true
		};
	})();
}
	
if (typeof SP == "undefined") {
	window.SP = window.SafePage;
}

SafePage.api = (function() {
	return {
		
		get: function (url, params, success, failure) {    
		    // Reset the session timeout
		    url = getFullUrlPath(url);
		
		    // Add API client param
		    if (params)
			{
		    	params.apiClient = "WEB";
			}
			else
			{
				params = {apiClient: "WEB"};
			}
		    
		    $.get(url, params,
		    	function (data) {
		    		var header = data.spHeader;
			        if (header.success === true && success) 
			        {
			            success(header, data.spData);
			        } 
			        else 
			        {
					  var errors = header.errors;
					  
			       	  if (failure) 
			       	  {
						  var messages = "";
						  for (var i = 0; errors && i < errors.length; i++) {
							messages = " " + errors[i].message;
						  }
						  failure(messages);
					  } 
					  else  
					  {
						self.location = "/page/error/showError";
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
			
			// Add API client param			
		    if (params)
			{
		    	params.apiClient = "WEB";
			}
			else
			{
				params = {apiClient: "WEB"};
			}

			$.post(url, params,
		    	function (data) {
		    		var header = data.spHeader;
			        if (success && (header.success === true || (!header.success && header.errorCode === 1))) 
			        {
			            success(header, data.spData);
			        } 
			        else 
			        {
						  var errors = header.errors;
						  
				       	  if (failure) 
				       	  {
							  var messages = "";
							  for (var i = 0; errors && i < errors.length; i++) {
								messages = " " + errors[i].message;
							  }
							  failure(messages);
						  } 
						  else  
						  {
							self.location = "/page/error/showError";
						  }
					}
			    }, "json");
		},
		
		getRedirectPost: function (targetModule, extraAttributes, callback, error) {
			this.post("api/sso/getRedirectPost", {targetModule: targetModule, extraAttributes: extraAttributes}, callback, error);
		},		
		
		getSite: function (siteId, siteName, callback, error) {
			this.post("api/site/getSiteDetails", {siteId: siteId, siteName: siteName}, callback, error);
		},		
		
		importCredentials: function (siteParams, callback, error) {
			this.post("api/site/importCredentials", {siteParams: siteParams}, callback, error);
		},		
		
		getBookmarks: function (sortColumn, sortType, updatePreference, callback) {
			params = {updatePreference: updatePreference};
			if (sortColumn)
			{
				params.sortColumn = sortColumn;
			}
			if (sortType)
			{
				params.sortType = sortType;
			}
			params.verbose = true;
			this.post("api/site/getUserSites", params, callback);
		},
		
		getBookmark: function (userSiteId, callback) {
			this.post("api/site/getUserSiteDetails", { userSiteId: userSiteId}, callback);
		},		
		
		addBookmark: function (siteParams, callback, error) {
			this.post("api/site/addUserSite", {siteParams: siteParams} , callback, error);
		},	

	   	updateBookmark: function (siteParams, callback, error) {
	   		this.post("api/site/updateUserSite", {siteParams: siteParams}, callback, error);
	   	},

	   	updateUserSiteCredentials: function (siteParams, callback, error) {
	   		this.post("api/site/updateUserSiteCredentials", {siteParams: siteParams}, callback, error);
	   	},
	   	
		updateBookmarkAccess: function (userSiteId, callback) {
			this.post("api/site/updateUserSiteAccess", { userSiteId: userSiteId }, callback);
		},
		
		removeBookmark: function (userSiteId, callback) {
			this.post("api/site/deleteUserSite", { userSiteId: userSiteId }, callback);
		},
		
		getBookmarkCredentials: function (userSiteId, passwd, callback, error) {
	    	this.post("api/site/getUserSiteCredentials", {userSiteId: userSiteId, passwd: passwd}, callback, error);
		},
		
		refreshBookmark: function (userSiteId, callback) {
			this.post("api/site/refreshUserSite", { userSiteId: userSiteId }, callback);
		},
				
		getFinancialAccounts: function (callback, error) {
			this.post("api/account/getFinancialAccounts", {}, callback, error);
		},
				
		getMailTransactions: function (callback, error) {
			this.post("api/account/getMailTransactions", {}, callback, error);
		},
				
		getMailAccounts: function (callback, error) {
			this.post("api/account/getMailAccounts", {}, callback, error);
		},
			
		updateTransactionViewStatus: function (txId, callback) {
				this.post("api/account/updateTransactionViewStatus", { transactionId: txId }, callback);
	    },
	    
	    updateEventViewStatus: function (eventId, callback) {
	    	this.post("api/event/updateEventViewStatus", { eventId: eventId }, callback);
	    },
	    
	    ping: function (callback) {	    	
	    	this.post("api/login/ping", {}, callback);
	    },
	    
	    authenticatePassword: function (passwd, callback) {
	    	this.post("api/credential/authenticatePassword", { passwd: passwd }, callback);
	    },
	    
	    signout: function (callback) {
	    	this.post("api/login/logoff", {}, callback);
	    },
	    
	    getNextDeviceName: function (deviceName, callback) {
	    	this.post("api/device/getNextDeviceName", {deviceName: deviceName}, callback);
		},
	    
	    pullPhoneAuthStatus: function (callback) {
	    	this.post("api/phone/pullAuthStatus", { }, callback);
		},
	    
	    browseTwoWayImages: function (imageCategory, callback) {
	    	this.post("api/image/browseTwoWayImages", {imageCategory: imageCategory}, callback);
		},
	    
	    browseTwoWayImageCategories: function (callback) {
	    	this.post("api/image/browseTwoWayImageCategories", { }, callback);
		},
		
		saveUserNews: function (permalink, callback) {
	    	this.post("api/news/saveUserNews", {permalink: permalink}, callback);
		},
		
		getUserSavedNews: function (callback) {
			this.post("api/news/getUserSavedNews", { }, callback);
		},
		
		deleteUserNews: function (permalink, callback) {
	    	this.post("api/news/deleteUserNews", {permalink: permalink}, callback);
		},
		
		deleteUserSavedNews: function (permalink, callback) {
	    	this.post("api/news/deleteUserSavedNews", {permalink: permalink}, callback);
		},
		
		registerCredentials: function (params, callback) {
			this.post("api/registration/registerCredentials", params, callback);
		},
		
		checkPassword: function (params, callback) {
			this.post("api/credential/authenticatePassword", params, callback);
		},
		
		resetPassword: function (params, callback) {
			this.post("api/credential/resetPassword", params, callback);
		},						
		
		markBillpaymentAsViewed: function(billPayId, callback){
			this.post("api/account/markBillpaymentAsViewed", {billPayId: billPayId}, callback);
		},
		
		clearEvents: function(eventId, callback){
			this.post("api/event/clearEvents", {eventId: eventId}, callback);
		},
		
		checkInvitation: function(username, callback){
			this.post("api/login/identifyUser", {username:username}, callback);
		},
		
		checkSentEmail: function(params, callback){
			this.post("api/registration/sendVerificationEmail", params, callback);
		},
		
		autocomplete: function(keywords, fullsearch, callback){
			this.post("api/site/searchSites", {keywords: keywords, fullSearch: SP.fullSearch}, callback);
		},
		
		getGridInfo: function(accountId, callback){
			this.post("api/account/getGridInfo", {accountId: accountId}, callback);
		},
		
		suggestFriend: function(email, callback){
			this.post("api/login/suggestFriend", {email: email}, callback);
		},
		
		logFeedback: function(description, callback){
			this.post("api/feedback/logFeedback", {description: description}, callback);
		},
			
		deepSearch: function(keywords, fullsearch, callback){
			this.post("api/site/searchSites", {deepSearch: true, keywords: keywords, fullSearch: SP.fullSearch}, callback);
		},
			
		checkSiteUrl: function(siteUrl, callback, error){
			this.post("api/site/checkUrl", {siteUrl: siteUrl}, callback, error);
		},
			
		userFeedback: function(result, userSiteId, callback, error){
			this.post("api/feedback/autologinFeedback", {result: result, userSiteId:userSiteId}, callback, error);
		},
	};
})();

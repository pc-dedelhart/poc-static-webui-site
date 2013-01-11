//namespacing
var PC = window.PersonalCapital = window.PersonalCapital || {};
var globals = PC.globals = PC.globals || {};
var views=PC.views = PC.views || {};
var utils=PC.utils = PC.utils || {};
//analytics
PC.tracking = {};
PC.tracking.googleAnalytics = {
		recordEvent: function(data){
			try{
				_gaq.push(['_trackEvent', data.join()]);
			}catch(e){}
		}
};
PC.tracking.kissmetrics = {
		recordEvent: function(event,data){
			var args = ['record', event];
			if(typeof data != 'undefined'){
				args.push(data);
			}
			try{
				_kmq.push(args);
			}catch(e){}
		},
		identify: function(data){
			try{
				_kmq.push(['identify', data]);
			}catch(e){}
		},
		set: function(data){
			try{
				_kmq.push(['set', data]);
			}catch(e){}
		}
};
//login module
var LOGIN = views.LOGIN=views.LOGIN || {};
(function(login, $){

	var form_email=$("#form-email"),
		form_password=$("#form-password"),
		form_forgotPassword=$("#form-forgotPassword"),
		form_createPassword=$("#form-createPassword"),
		form_pin=$("#form-pin"),
		form_deviceAuthorization=$("#form-deviceAuthorization"),
		form_showRegistration=$("#form-registration"),
		form_challengeRequest=$("#form-challengeRequest"),
		form_challengeResponse_email=$("#form-challengeResponse-email"),
		form_challengeResponse_phone=$("#form-challengeResponse-phone"),
		form_userSiteKnowledge=$("#form-userSiteKnowledge"),
		form_contactSupport=$("#form-contactSupport");
	
	var KissMetrics=PC.tracking.kissmetrics,
		googleAnalytics=PC.tracking.googleAnalytics;
	
	 login.determineState=function(data){
		var status=login.model.status=data.spHeader.status,
			authLevel=login.model.authLevel=data.spHeader.authLevel,
			formData=login.model.formData=data.spData;
		if(data.spData && data.spData.allCredentials)login.authType.set(data.spData.allCredentials);
		switch(status){
			case "NONE":{
				login.showEmail({username:""});
				break;
			}
			case "PARTIAL_ENROLLMENT":{
				login.showRegistration(formData);
				break;
			}
			case "INACTIVE":{
				login.showRegistration(formData);
				break;
			}
			case "LOCKED":{
				login.showForgotPinOrPassword(formData);
				break;
			}
			case "ACTIVE":{
				switch(authLevel){
					case "USER_IDENTIFIED":{
						login.showDeviceAuthorization();
						break;
					}
					case "DEVICE_AUTHORIZED":{
						login.showDeviceAuthorized();
						break;
					}
					case "USER_REMEMBERED":{
						login.showPinOrPassword(formData);
						break;
					}
					case "SESSION_AUTHENTICATED":{
						login.showDashboard();
						break;
					}
				}
				break;
			}
		}
	};
	//public functions that can be overriden
	login.model={
			status:"NONE",
			authLevel:"NONE",
			authType:"PASSWORD",
			challengeReason:"DEVICE_AUTH",
			formData:{}
	};
	login.securityImage={
			get:function(){
				$("img.securityImage").attr('src','/images/loadingSecurityImage.png');
				$("img.securityImage").attr('src','/servlet/image/getUserImage?t='+Math.round(Math.random()*100000000));
			},
			set:function(src){
				$("img.securityImage").attr('src',src);
			}
	};
	login.authType={
			set:function(allCredentials){
				var usedCredentials=[];
				$.each(allCredentials,function(index,obj){
					if(obj.status=="ACTIVE"||obj.status=="LOCKED")usedCredentials.push(obj.name);
				})
				//if credentials contains password, show password
				if($.inArray("PASSWORD",usedCredentials)!=-1){
					login.model.authType="PASSWORD";
					return;
				}
				//if credentials do not contain password but contains pin, show pin
				if($.inArray("PASSWORD",usedCredentials)==-1 && $.inArray("PIN",usedCredentials)!=-1){
					login.model.authType="PIN";
					return;
				}
			},
			get:function(){
				return login.model.authType;
			}
	};
	login.addDefaultPostData=function(params){
		var p=params||{};
		if(typeof p.apiClient == 'undefined')p.apiClient="WEB";
		if(typeof p.bindDevice == 'undefined')p.bindDevice=false;
		return p;
	};
	login.responseContainsErrors=function(response){
		if(!response.spHeader){
			//TODO:will have to check if this is a possible scenario
		}
		var errors=response.spHeader.errors
		var error=(typeof(errors)!=="undefined") ? errors[errors.length-1] : undefined;
		if(error && error.code == 202){
			//TODO:session is not valid
			//window.location=globals.baseUrl;
		}
		return error;
		
	};
	login.phoneAuthPolling=(function(){
		var id=-1,
			interval=3000,
			maxAttempts=40,
			attempts=0;
		return{
			start:function(params,callback,timeout){
				login.phoneAuthPolling.stop();				//to be safe
				id=setInterval(function(){
					PersonalCapital.services.Login.authenticatePhoneAuth(params,callback);
					if(++attempts>maxAttempts){
						timeout();
					}
				},interval);
			},
			stop:function(){
				clearInterval(id);
				attempts=0;
			}
		}
	})();
	login.showEmail=function(data){
		form_email.showForm(data);
		KissMetrics.recordEvent("viewed sign-in page");
	};
	login.showPinOrPassword=function(data){
		if(login.authType.get()=="PIN"){
			login.showPin(data);
		}else{
			login.showPassword(data);
		}
	};
	login.showPassword=function(data){
		login.securityImage.get();
		data.passwd="";
		if(typeof data.bindDevice == "undefined")data.bindDevice=false;
		form_password.showForm(data);
		form_password.find(".control-group.bindDevice").hide();
		form_password.find("input[name=deviceName]").hide();
		form_password.find("label[for=deviceName]").show();
		KissMetrics.recordEvent("viewed passwordImage page");
	};
	login.showForgotPinOrPassword=function(data){
		if(login.authType.get()=="PIN"){
			login.showEmail(data);
			utils.setFieldValidationFlags($.FORM_CURR.find("[name=username]"),utils.validationMessages["lockedPIN"]);
		}else{
			login.showForgotPassword();
		}
	};
	login.showForgotPassword=function(){
		login.showChallengeRequest("PWD_RESET");
	};
	login.showDeviceAuthorization=function(){
		login.showChallengeRequest("DEVICE_AUTH");
	};
	login.showPin=function(data){
		//login.securityImage.get();
		if(data)data.pinNumber="";
		form_pin.showForm(data);
		form_pin.find(".control-group.bindDevice").hide();
		form_pin.find("input[name=deviceName]").hide();
		form_pin.find("label[for=deviceName]").show();
	};
	login.showChallengeRequest=function(challengeReason){
		login.model.challengeReason=challengeReason;
		var formData={};
		if(challengeReason=="PWD_RESET"){
			formData.legend="Forgot Password";
			formData.challengeStep="Step 1 of 4";
			formData.challengeDescription="Select a method to reset your password";
		}else if(challengeReason=="DEVICE_AUTH"){
			formData.legend="Sign in to Personal Capital";
			formData.challengeDescription="For your security, please choose how you would like to authorize this device.";
		}
		formData.challengeReason=login.model.challengeReason;
		form_challengeRequest.find("[name=challengeType]:first").attr("checked",true);
		form_challengeRequest.find("button.cancel").addClass(challengeReason);
		form_challengeRequest.showForm(formData);
		KissMetrics.recordEvent("viewed verify computer page");
	};
	login.showChallengeEmail=function(repeat){
		var challengeReason=login.model.challengeReason,
			formData={};
		if(challengeReason=="PWD_RESET"){
			formData.legend="Forgot Password";
			formData.challengeStep="Step 2 of 4";
			formData.challengeDescription="We sent a message to your E-mail Address with a Code to enable you to reset your password";
		}else if(challengeReason=="DEVICE_AUTH"){
			formData.legend="Sign in to Personal Capital";
			formData.challengeDescription="We sent a message to your E-mail Address with a Code to enable you to register this device.";
		}
		formData.challengeReason=challengeReason;
		formData.code="";
		form_challengeResponse_email.find("button.cancel").addClass(challengeReason);
		form_challengeResponse_email.showForm(formData);
		KissMetrics.recordEvent("viewed verify computer page 2");
	};
	login.showChallengePhone=function(){
		var challengeReason=login.model.challengeReason,
			formData={};
		if(challengeReason=="PWD_RESET"){
			formData.legend="Forgot Password";
			formData.challengeStep="Step 2 of 4";
			formData.challengeDescription="We are calling your phone to reset your password.";
		}else if(challengeReason=="DEVICE_AUTH"){
			formData.legend="Sign in to Personal Capital";
			formData.challengeDescription="We are calling your mobile phone to authorize this device.";
		}
		formData.challengeReason=challengeReason;
		form_challengeResponse_phone.find("button.cancel").addClass(challengeReason);
		form_challengeResponse_phone.find("label.controls.polling").show();
		form_challengeResponse_phone.showForm(formData);
		form_challengeResponse_phone.submit();
		KissMetrics.recordEvent("viewed verify computer page 2");
	};
	login.showUserSiteKnowledge=function(){
		var challengeReason=login.model.challengeReason,
			formData={};
		PersonalCapital.services.Login.getChallengeUserSites(login.addDefaultPostData({challengeReason:challengeReason,count:3}), function(data){
			var error=login.responseContainsErrors(data);
			if(error){
				//userSites locked
				login.showContactSupport();
				return;
			}
			if(data.spData.autoSuccess==true){
				login.showCreatePassword();
				return;
			}
			var count=data.spData.count;
			var userSites=data.spData.userSites;
			var htmlAry=[],checked=false;
			for(var i=0;i<count;i++){
				var userSite=userSites[i];
				htmlAry.push('<li><label class="'+(userSite.locked==true?"disabled":"")+'"><input type="radio" class="input-xlarge" '+(userSite.locked==true?"disabled":"")+' name="userSiteId" '+((userSite.locked==false && checked==false)?"checked":"")+' value="'+userSite.userSiteId+'"><span class="relText2">'+userSite.userSiteName+'</span></label></li>');
				if(userSite.locked==false && checked==false)checked=true;
			}
			form_userSiteKnowledge.find("[name=userSites]").html(htmlAry.join(""));
			formData.legend="Forgot Password";
			formData.challengeStep="Step 3 of 4";
			formData.challengeDescription="For your security, choose one of the sites listed below and verify your password for that site.";
			formData.challengeReason=challengeReason;
			formData.PASSWORD="";
			form_userSiteKnowledge.find("button.cancel").addClass(challengeReason);
			form_userSiteKnowledge.showForm(formData);
		});
	};
	login.showCreatePassword=function(){
		var challengeReason=login.model.challengeReason,
			formData={};
		if(challengeReason=="PWD_RESET"){
			formData.legend="Forgot Password";
			formData.challengeStep="Step 4 of 4";
			formData.challengeDescription="Create new password.";
			form_createPassword.find("button.cancel").show();
		}else if(challengeReason=="PWD_CREATE"){
			formData.legend="Create Password";
			formData.challengeStep="";
			formData.challengeDescription="Create Password";
			formData.flags="Pw";
			form_createPassword.find("button.cancel").hide();
		}
		formData.passwd="";formData.passwd2="";
		formData.challengeReason=challengeReason;
		form_createPassword.find("button.cancel").addClass(challengeReason);
		form_createPassword.showForm(formData);
	};
	login.showDeviceAuthorized=function(){
		PersonalCapital.services.Login.suggestDeviceName(login.addDefaultPostData($(this).serializeObject()), function(data){
			var error=login.responseContainsErrors(data);
			if(error){
				//do nothing
			}
			if(data.spData && data.spData.deviceName)data.spHeader.deviceName=data.spData.deviceName;
			data.spHeader.bindDevice=true;
			login.showPinOrPassword(data.spHeader);
			//TODO: should be done with respect to form
			$(".control-group.bindDevice").show();
			$("label[for=deviceName]").hide();
			$("input[name=deviceName]").show();
		});
	};
	login.showContactSupport=function(){
		form_contactSupport.showForm();
	};
	login.showDashboard=function(){
		window.location=globals.baseUrl;
	};
	login.showRegistration=function(data){
		//window.location=globals.baseUrl+"page/login/registerUser";
		form_email.showForm(data);
		utils.setFieldValidationFlags($.FORM_CURR.find("[name=username]"),utils.validationMessages["inactiveUsername"]);
	};
	login.switchUser=function(){
		try{
			PersonalCapital.services.Login.switchUser(login.addDefaultPostData(), function(data){
				var error=login.responseContainsErrors(data);
				if(error){
					utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
					return;
				}
				//query current session to determine login state and get latest csrf
				PersonalCapital.services.Login.validateSession(login.addDefaultPostData(), function(data){
					var error=login.responseContainsErrors(data);
					if(error){
						login.showEmail({"form-error":error.message});
						return;
					}
					login.determineState(data);
				});
			});
		}catch(e){}
	};
	login.validateSession=function(){
		PersonalCapital.services.Login.validateSession(login.addDefaultPostData(), function(data){
			var error=login.responseContainsErrors(data);
			if(error){
				login.showEmail({"form-error":error.message});
				return;
			}
			login.determineState(data);
		});
	};
	login.initKissmetrics = function(){
		KissMetrics.init(globals.kmApiKey);
		KissMetrics.identify(globals.userGuid);
		if(BrowserDetect && BrowserDetect.browser && BrowserDetect.version)
			KissMetrics.set({'Browser' : BrowserDetect.browser + " " +BrowserDetect.version });
	};
	login.initGoogleAnalytics = function(){
		googleAnalytics.init(globals.gaApiKey,globals.domainName);
	};
	login.disableUserSite = function(){
		$.each($("input[name=userSiteId]"),function(){
			var obj=$(this);
		    if (obj.is(":checked")){
		    	obj
		    	.attr("checked",false)
		    	.attr("disabled",true)
		    	.parent().addClass("disabled");
		    }
		});
		$($("input[name=userSiteId]").not('[disabled="disabled"]')[0]).attr("checked",true);
	};
	login.disableSubmitButton = function(btn){
		if(typeof btn == "undefined"){
			btn = $.FORM_CURR.find("button.btn-primary");
		}
		btn.attr("disabled", true)
		   .addClass("disabled");
	};
	login.enableSubmitButton = function(btn){
		if(typeof btn == "undefined"){
			btn = $.FORM_CURR.find("button.btn-primary");
		}
		btn.attr("disabled", false)
		   .removeClass("disabled");
	};
	login.init = function(initData){
		//determine initial state
		if(typeof initData == "object"){
			//if initial state is know, display the state
			login.determineState(initData);
		}else{
			//query current session to determine the login state
			login.validateSession();
		}
		//bind form submit events
		form_email.submit(function(){
			if(!utils.validateForm($(this)))return false;
			KissMetrics.recordEvent("sign-in continue button_sign-in page");
			login.disableSubmitButton();
			PersonalCapital.services.Login.identifyUser(login.addDefaultPostData($(this).serializeObject()), function(data){
				login.enableSubmitButton();
				var error=login.responseContainsErrors(data);
				if(error){
					utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
					return;
				}
				if(data.spData){
					data.spData.username=data.spHeader.username;
					data.spData.deviceName=data.spHeader.deviceName;
				}
				login.determineState(data);
			});
			return false;
		});
		form_password.submit(function(){
			if(!utils.validateForm($(this)))return false;
			KissMetrics.recordEvent("sign-in continue button_passwordImage page");
			login.disableSubmitButton();
			PersonalCapital.services.Login.authenticatePassword(login.addDefaultPostData($(this).serializeObject()), function(data){
				login.enableSubmitButton();
				var error=login.responseContainsErrors(data);
				if(error){
					var fieldName = error.details.fieldName;
					var field = $.FORM_CURR.find('[name='+fieldName+']');
					utils.setFieldValidationFlags(field,error.message);
					if(error.code == 312)
						field.val("");
					return;
				}
				//If DEVICE_FSO is returned as part of response, it should update fso and globals.DEVICE_FSO
				/* this is now being done on every service response
				 * if(data.spHeader.DEVICE_FSO){
					utils.deviceFSO.set(data.spHeader.DEVICE_FSO);
					PersonalCapital.globals.DEVICE_FSO = utils.deviceFSO.get();
				}*/
				login.determineState(data);
			});
			return false;
		});
		form_challengeRequest.submit(function(){
			var challengeType=$('input[name=challengeType]:checked').val();
			if(challengeType=="challengeEmail"){
				KissMetrics.recordEvent("verification continue button_verify computer page", {VerifyCompMeth: "Email"});
				login.disableSubmitButton();
				PersonalCapital.services.Login.challengeEmail(login.addDefaultPostData($(this).serializeObject()), function(data){
					login.enableSubmitButton();
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					login.showChallengeEmail();
				});
			}else if(challengeType=="challengePhone"){
				KissMetrics.recordEvent("verification continue button_verify computer page", {VerifyCompMeth: "Phone"});
				login.disableSubmitButton();
				PersonalCapital.services.Login.challengePhone(login.addDefaultPostData($(this).serializeObject()), function(data){
					login.enableSubmitButton();
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					login.showChallengePhone();
				});
			}
			return false;
		});
		form_challengeResponse_email.submit(function(){
			if(!utils.validateForm($(this)))return false;
			login.disableSubmitButton();
			PersonalCapital.services.Login.authenticateEmailCode(login.addDefaultPostData($(this).serializeObject()), function(data){
				login.enableSubmitButton();
				var error=login.responseContainsErrors(data);
				if(error){
					utils.setFieldValidationFlags($.FORM_CURR.find("[name=code]"),error.message);
					return;
				}
				if(login.model.challengeReason=="PWD_RESET"){
					login.showUserSiteKnowledge();
				}else if(login.model.challengeReason=="DEVICE_AUTH"){
					login.showDeviceAuthorized();
				}
			});
			return false;
		});
		form_challengeResponse_phone.submit(function(){
			var form=$(this);
			login.phoneAuthPolling.start(
					login.addDefaultPostData($(this).serializeObject()),
					function(data){
						var error=login.responseContainsErrors(data);
						if(error){
							login.phoneAuthPolling.stop();
							form.find("label.controls.polling").hide();
							utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
							return;
						}
						if(data.spHeader.success && data.spData && data.spData.pullStatus){
							login.phoneAuthPolling.stop();
							if(login.model.challengeReason=="PWD_RESET"){
								login.showUserSiteKnowledge();
							}else if(login.model.challengeReason=="DEVICE_AUTH"){
								login.showDeviceAuthorized();
							}
						}
					},
					function(){
						login.phoneAuthPolling.stop();
						form.find("label.controls.polling").hide();
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),"We received no response from your phone.");
					}
			);
			return false;
		});
		form_userSiteKnowledge.submit(function(){
			if(!utils.validateForm($(this)))return false;
			login.disableSubmitButton();
			PersonalCapital.services.Login.authenticateUserSite(login.addDefaultPostData($(this).serializeObject()), function(data){
				login.enableSubmitButton();
				var error=login.responseContainsErrors(data);
				if(error){
					if(error.code==206){
						login.showContactSupport();
					}else{
						if(error.code==383){
							login.disableUserSite();
						}
						utils.setFieldValidationFlags($.FORM_CURR.find("[name=PASSWORD]"),error.message);
					}
					return;
				}
				login.showCreatePassword();
			});
			return false;
		});
		form_createPassword.submit(function(){
			if(!utils.validateForm($(this)))return false;
			try{
				if($(this).find("[name=passwd]").val()!=$(this).find("[name=passwd2]").val()){
					utils.setFieldValidationFlags($.FORM_CURR.find("[name=passwd2]"),utils.validationMessages["passwordMismatch"]);
					return false;
				}
			}catch(e){
				return false;
			}
			if(login.model.challengeReason=="PWD_RESET"){
				login.disableSubmitButton();
				PersonalCapital.services.Login.resetPassword(login.addDefaultPostData($(this).serializeObject()), function(data){
					login.enableSubmitButton();
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					login.determineState(data);
				});
			}else if(login.model.challengeReason=="PWD_CREATE"){
				login.disableSubmitButton();
				PersonalCapital.services.Login.registerPassword(login.addDefaultPostData($(this).serializeObject()), function(data){
					login.enableSubmitButton();
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					login.determineState(data);
				});
			}
			return false;
		});
		form_pin.submit(function(){
			if(!utils.validateForm($(this)))return false;
			login.disableSubmitButton();
			PersonalCapital.services.Login.authenticatePin(login.addDefaultPostData($(this).serializeObject()), function(data){
				login.enableSubmitButton();
				var error=login.responseContainsErrors(data);
				if(error){
					if(error.code==206||error.code==321)error.message="You have locked out your PIN, please use your Personal Capital Mobile application to unlock your PIN.";
					utils.setFieldValidationFlags($.FORM_CURR.find("[name=pinNumber]"),error.message);
					return;
				}
				login.model.challengeReason="PWD_CREATE";
				login.showCreatePassword();
			});
			return false;
		});
		
		//bind form cancel & other click events
		$("a#forgotPassword").bind("click",function(){
			try{
				$("button.cancel").removeClass("DEVICE_AUTH");
				login.showForgotPassword();
			}catch(e){}
			return false;
		});
		$("a[name=challengeEmail]").bind("click",function(){
			try{
				var self=$(this);
				if(self.attr("disabled")=="disabled")return false;
				login.phoneAuthPolling.stop();
				login.disableSubmitButton(self);
				PersonalCapital.services.Login.challengeEmail(login.addDefaultPostData({challengeReason:login.model.challengeReason,challengeMethod:"OP"}), function(data){
					login.enableSubmitButton(self);
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					if(self.attr("class")=="resend"){
						$.FORM_CURR.find(".help-block.error").html("A new verification email was sent successfully").hide().show(500);
					}else{
						login.showChallengeEmail();
					}
				});
			}catch(e){}
			return false;
		});
		$("a[name=challengePhone]").bind("click",function(){
			try{
				var self=$(this);
				if(self.attr("disabled")=="disabled")return false;
				login.phoneAuthPolling.stop();
				login.disableSubmitButton(self);
				PersonalCapital.services.Login.challengePhone(login.addDefaultPostData({challengeReason:login.model.challengeReason,challengeMethod:"OP"}), function(data){
					login.enableSubmitButton(self);
					var error=login.responseContainsErrors(data);
					if(error){
						utils.setFormValidationFlags($.FORM_CURR.find(".form-error"),error.message);
						return;
					}
					if(self.attr("class")=="resend"){
						$.FORM_CURR.find(".form-error").html("");
						$.FORM_CURR.find(".controls.polling").hide().show(500);
						$.FORM_CURR.submit();
					}else{
						login.showChallengePhone();
					}
				});
			}catch(e){}
			return false;
		});
		$("input[name=bindDevice]").change(function(){
			if($(this).is(":checked")){
				$(this).val("true");
				$(".control-group.deviceName").show();
			}else{
				$(this).val("false");
				$(".control-group.deviceName").hide();
			}
		});
		$("button.resetUser").bind("click",function(){
			try{
				login.switchUser();
			}catch(e){}
			return false;
		});
		$("button.cancel.DEVICE_AUTH").live("click",function(){
			try{
				login.phoneAuthPolling.stop();
				$(this).removeClass("DEVICE_AUTH");
				login.switchUser();
			}catch(e){}
			return false;
		});
		$("button.cancel.PWD_RESET").live("click",function(){
			try{
				login.phoneAuthPolling.stop();
				$(this).removeClass("PWD_RESET");
				if(login.model.status=="LOCKED"){
					login.switchUser();
				}else{
					login.showPassword({});
				}
			}catch(e){}
			return false;
		});
		//bind form controls validation
		$("input.validate.blur").blur(function(){
			if($(this).val().length>0)utils.validateField($(this));
		});
		$("input.validate").keyup(function(e){
			//TODO: consider only valid key strokes
			if(e.keyCode==13)return;
			utils.clearValidationFlags($(this));
		});
	};
	return login;
})(views.LOGIN, jQuery);		//exporting login module to global namespace:windows.personalcapital

/*
 * interface for plugin interaction
 */
function handleEventToSwf(eventName, data) {
	var jdata=jQuery.parseJSON(data);
	try{
		switch(eventName){
			case "ServerChange":{
				if(jdata.eventType=="UPDATE_SESSION"){
					if(jdata.details && jdata.details.csrf){
						globals.csrf=jdata.details.csrf;
					}
					LOGIN.validateSession();
				}
				break;
			}
		}
	}catch(e){
		utils.logException(e);
	}
}

/*
 * used to serialize form controls into a json object
 * jquery's serializeArray returns an array object rather than a json object
 * and that makes it difficult to alter the object if need be.
 * the following extends serializeArray and returns json object
 * taken from the following link: http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
 * 
 * if we do have complex forms we should use form2js library which also provides for nested json object
 */
jQuery.fn.serializeObject = function(){
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
/*
 * extending jquery's show function for forms with the following:
 * setting form data, setting form as current, hiding previous and showing current form
 * TODO: 
 * 		extending this for any views in general
 * 		namespacing properties
 * 		setting data for all controls
 */
//TODO: Adding a namespace should prevent with name conflicts
jQuery.fn.FORM_CURR = null;
jQuery.fn.FORM_PREV = null;
jQuery.fn.showForm = function(data){
	//set form data
	if(data){
		//input controls
		this.find("input[type=text],input[type=hidden],input[type=password],input[type=checkbox]").val(function(index,value){
			var val=data[this.name];
			if(val===undefined)val=value;
			return val;
		});
		//label controls
		this.find("label.dynamic").html(function(index,value){
			var val=data[$(this).attr("for")];
			if(val===undefined)val=value;
			if(val)return val;
		});
		//legend
		this.find("div.legend").html(function(index,value){
			var val=data["legend"];
			if(val===undefined)val=value;
			if(val)return val;
		});
	}
	//set form as current form
	$.FORM_PREV=$.FORM_CURR;
	$.FORM_CURR=this;
	//hide previous form
	if($.FORM_PREV)$.FORM_PREV.hide();
	//clear any validation flags from previous instance
	utils.clearFormValidationFlags($.FORM_CURR);
	//show current form
	$.FORM_CURR.show();
	//set foucs
	$.FORM_CURR.find("[autofocus]").focus().select();
}
/*
 * form validation
 * we should think about using a validation library such as
 * http://docs.jquery.com/Plugins/Validation
 */
utils.validateForm = function(form){
	var isValid=true;
	try{
		form.find("input.validate").each(function(){
			isValid=utils.validateField($(this)) && isValid
		});
		return isValid;
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.validateField = function(field){
	var isValid=false;
	try{
		var fName=field.attr("name"),
			fVal=jQuery.trim(field.attr("value"));
		//validate the field
		switch(fName){
			case "username":{
				isValid = ((fVal.length<=50) && (fVal.indexOf("'") == -1) && (fVal.indexOf('"') == -1) && utils.regex.email.test(fVal));
				break;
			}
			case "passwd": case "passwd2":{
				isValid = (fVal.length >= 8 && fVal.length <= 25
						&& utils.regex.hasNumber.test( fVal ) 
						&& utils.regex.hasLetter.test( fVal ));
				break;
			}
			case "code":{
				isValid = (utils.regex.code.test( fVal ));
				break;
			}
			case "PASSWORD":{
				isValid = (fVal.length>0);
				break;
			}
			case "pinNumber":{
				isValid = (utils.regex.pinNumber.test(fVal));
				break;
			}
			case "deviceName":{
				isValid = (fVal.length>0);
				break;
			}
		}
		//style the field accordingly
		if(isValid){
			utils.clearValidationFlags(field);
		}else{
			utils.setFieldValidationFlags(field,utils.validationMessages[fName]);
		}
		return isValid;
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.clearValidationFlags=function(field){
	try{
		field.siblings(".help-block.error").html("").hide();
		field.closest(".control-group.error").removeClass("error");
		field.siblings(".help-block.helpText").show();
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.clearFormValidationFlags=function(form){
	try{
		form.find(".help-block.error").html("");
		form.find(".form-error").html("");
		form.find(".control-group.error").removeClass("error");
		form.find(".help-block.helpText").show();
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.setFormValidationFlags=function(field,msg){
	try{
		field.html(msg);
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.setFieldValidationFlags=function(field,msg){
	try{
		field.siblings(".help-block.helpText").hide();
		field.siblings(".help-block.error").html(msg).show();
		field.closest(".control-group").addClass("error");
	}catch(e){
		utils.logException(e);
		return false;
	}
};
utils.validationMessages={
	username:			"Must be a valid email address, 50 characters or less.",
	passwd: 			"Must be 8-25 and contain letters and numbers.",
	passwd2: 			"Must be 8-25 and contain letters and numbers.",
	phone:				"Must be a valid 10 digit phone number.",
	code:				"Must be a four digit number",
	pinNumber:			"Must be a six digit number",
	PASSWORD:			"Please provide a password for the chosen site",
	passwordMismatch:	"Password mis-match",
	inactiveUsername:	'Username not found. Check spelling or <a class="inactiveUserLink" href="/page/login/registerUser">sign up.</a>',
	lockedPIN:			'You have locked out your PIN, please use your Personal Capital Mobile application to unlock your PIN.',
	deviceName:			'Device Name is required'
};
utils.regex={
		email:				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		simpleEmail:		/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
		hasNumber:			/[\d]/,
		hasLetter:			/[a-zA-Z]/,
		phone:				/^[\d]{3}[-. ]?[\d]{3}[-. ]?[\d]{4}$/,
		code:				/^[\d]{4}$/,
		pinNumber:			/^[\d]{6}$/
};
utils.log=function(msg){
	if(globals.baseUrl=="https://home.personalcapital.com")return;
	if(console && console.log)console.log(msg);
};
utils.logException=function(e){
	var msg="exception: "+e.message;
	if(e.lineNumber)msg+=" lineNumber: "+e.lineNumber;
	if(e.fileName)msg+=" fileName: "+e.fileName;
	utils.log(msg);
};
utils.deviceFSO = {
	obj: null,
	init:function(){
		var self = this;
		var swfVersionStr = "9.0.115.0";
	    var flashvars = {initFunctionName:PersonalCapital.utils.deviceFSO.ready},
	    	params = {},
	    	attributes = {};
	    params.quality = "high";
	    params.bgcolor = "#ffffff";
	    params.allowScriptAccess = "always";
	    params.allowNetworking = "all";
	    params.allowfullscreen = "true";
	    params.wmode = "opaque";
	    attributes.id = "deviceFSOSwf";
	    attributes.name = "deviceFSOSwf";
    	swfobject.embedSWF(
                "/swf/deviceFSO.swf", "deviceFSODiv", 
                "1px", "1px", 
                swfVersionStr, "", 
                flashvars, params, attributes,
                function(e){
                	if(e.success){
                		self.obj=document.getElementById("deviceFSOSwf");
                	}
                }
        );
	},
	set:function(val){
		this.obj.setDEVICE_FSO(val);
	},
	get:function(){
		return this.obj.getDEVICE_FSO();
	},
	ready:function(){
		var fso = utils.deviceFSO.get();
		if(fso != null){
			globals.DEVICE_FSO = fso;
		}
	}
};



/*
 *TODO: 
 *1. add a utility function for checking if a property/variable is undefined/null
 *2.implement a simple pubsub pattern that would help set the data returned by service calls to a model
 *which would trigger the events that subsribed to the model change
 */

/*
 * http://www.quirksmode.org/js/detect.html
 */
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();
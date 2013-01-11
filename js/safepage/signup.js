/**
 * 
 */
//PC.namespace("signupProcess");
var signupProcess = (function() {
	//PRIVATE MEMBER
	var config={
			baseUrl:"http://local.safepage.com:8080/",
			cmsUrl:"http://personalcapital.thegoodlab.com/",
			csrf:null,
			usernameID:"#username",
			usernameLabel:"#usernameLabel",
			passwordID:"#password",
			passwordLabel:"#passwordLabel",
			submitID:"#signup",
			formID:"#signupForm",
			msgBoxID: "#msgBox",
			message1:"<div>Not a valid email address.</div>",
			message2:"<div>Password must be 8-25 characters long and must include at least one letter and one number.</div>",
			message3:"<div>This email is already registered to a Personal Capital customer. To continue, click on Sign in below.</div>",
			userStatus:{
				active:"ACTIVE",
				locked:"LOCKED",
				inactive:"INACTIVE",
				invited:"INVITED",
				invitation_requested:"INVITATION_REQUESTED",
				user_referred:"USER_REFERRED",
				none:"NONE"
			}
	};
	var elements={
			username:null,
			password:null,
			usernameLabel:null,
			passwordLabel:null,
			submit:null,
			form:null,
			msgBox:null
	};
	var userValidated=false,pwdValidated=false,userActive=false,isSubmit=false;
	function validateUser(callback){
		var username=elements.username;
		if(!username)return;
		//VALIDATE IF VALUE ALLOWED
		var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;		//RFC
		if(username.val().match(emailRegex)){
			userValidated=true;
			clearMessage(username);
			//VALIDATE USER STATUS
			identifyUser(callback);
			username.attr("lastVal",username.val());
		}else{
			userValidated=false;
			showMessage(username,config.message1);
		}
	};
	function validatePassword(){
		var password=elements.password;
		if(!password)return;
		  //VALIDATE IF VALUE ALLOWED
		  //var pwdRegex=/^(?=.*\d)(?=.*[a-zA-Z]).{8,25}$/;     	//IE7 had a problem with lookahead syntax. had to move the length to front   
		  var pwdRegex=/^(?=.{8,25}$)(?=.*\d)(?=.*[a-zA-Z]).*/;    //check if password is of length between 8 and 25 and contains at least one alphabet and one number
		  if(password.val().match(pwdRegex)){
		   pwdValidated=true;
		   clearMessage(password);
		  }else{
			pwdValidated=false;
			showMessage(password,config.message2);
		}
	};
	function submitForm(){
		isSubmit=true;
		if(userValidated && pwdValidated){					//IF USERNAME AND PASSWORD VALIDATED
			if(userActive){
				resetAll();
				try{
					top.location=config.baseUrl+'page/login/goPfa';
				}catch(e){}
			}else{
				registerUser();
			}
		}else{												//ELSE INITIATE VALIDATE PROCESS
			if(!userValidated){
				validateUser(function(){
					if(!pwdValidated)validatePassword();
					if(pwdValidated)submitForm();
				});
			}else{
				validatePassword();
				if(pwdValidated)submitForm();
			}
		}
	};
	function showMessage(src,msg,className){
		if(!src)return;
		if(!className)className="error";
		var msgBox=elements.msgBox;
		msgBox.removeClass("error").removeClass("warning").addClass(className)
			  .html(msg);
		var pos=0,cls="";
		if(src==elements.username){
			cls="msg_usr";
			elements.password.val("");
		}else if(src==elements.password){
			cls="msg_pwd";
		}
		msgBox.parent().removeClass("msg_usr").removeClass("msg_pwd").addClass(cls);
		//IE7 needs z-index set up to the parent level
		msgBox.parent().parent().removeClass("msg_usr").removeClass("msg_pwd").addClass(cls);
		msgBox.show();
		src.parent().addClass(className);
		$(src.attr("labelBox")).hide();
		isSubmit=false;
		window.setTimeout(function(){
			src.show().focus();
			src.select();
		},100);
	};
	function clearMessage(src){
		if(!src)return;
		var msgBox=elements.msgBox;
		msgBox.html("")
			  .removeClass("error").removeClass("warning");
		msgBox.parent().removeClass("msg_usr").removeClass("msg_pwd");
		msgBox.parent().parent().removeClass("msg_usr").removeClass("msg_pwd");
		src.parent().removeClass("error").removeClass("warning");
	};
	function isEmpty(src){
		if(!src)return;
		if(src.val().length==0){
			return true;
		}else{
			return false;
		}
	};
	function showLabel(src){
		if(!src)return;
		src.hide();
		$(src.attr("labelBox")).show();
		if(src.parent().hasClass("error")||src.parent().hasClass("warning"))clearMessage(src);
	};
	function resetAll(){
		userValidated=pwdValidated=userActive=isSubmit=false;
		elements.username.val("");
		elements.password.val("");
		showLabel(elements.username);
		showLabel(elements.password);
		clearMessage(elements.submit);
	};
	function identifyUser(callback){
		//Make the call if the user's email address is different from last attempt
		if(elements.username.val().toUpperCase()==elements.username.attr("lastVal").toUpperCase()){
			//if the user is active, then show the signin message
			if(userActive==true){
				showMessage(elements.username, config.message3,"warning");
			}
			return;
		}
		jQuery.ajax({
          type:'POST',
		  url: '/api/login/identifyUser',
		  dataType: 'json',
		  data: {"username":elements.username.val()},
		  success: function(data){
			  if(!data || !data.spHeader)return;
			  var header=data.spHeader;
			  config.csrf=header.csrf;
			  if(header.errors){
				  userActive=false;
			  }else{
				  var status=header.status.toUpperCase();
				  switch(true){
					  case (status==config.userStatus.active):case (status==config.userStatus.locked):{
						  userActive=true;
						  pwdValidated=true;
						  showMessage(elements.username, config.message3,"warning");
						  break;
					  }
					  case (status==config.userStatus.invited):case (status==config.userStatus.inactive):{
						  userActive=false;
						  break;
					  }
					  default:{
						  //fail
						  resetAll();
					  }
				  }
			  }
			  if(callback)callback();
        	},
		  error:function(xhr,text){
			  //fail
			  resetAll();
		  }
		});
	};
	function registerUser(callback){
		var mkt_source="",mkt_param="";
		//get GA marketing info and set it to marketing params
		mkt_source="ga_registration";
		mkt_param=getCookieInformation("__utmz");
		jQuery.ajax({
          type:'POST',
		  url: '/api/registration/registerUser',
		  dataType: 'json',
		  data: {"csrf":config.csrf,"passwd":elements.password.val(),"email":elements.username.val(),"termsVersion":1,"apiClient":"WEB","flags":"PwEm","marketing_source":mkt_source,"marketing_param":mkt_param},
		  success: function(data){
			  if(!data || !data.spHeader || !data.spHeader.status)return;
			  var status=data.spHeader.status.toUpperCase();
			  switch(true){
				  case (status==config.userStatus.active):case (status==config.userStatus.locked):case (status==config.userStatus.invited):{
					  break;
				  }
				  case (status==config.userStatus.inactive):{
					  try{
						  resetAll();
						  registerKissmetrics();
						  registerGoogleAnalytics();
						  window.setTimeout(registerGoogleAdwordsConversion,0);
						  //introducing some latency before we navigate to a different page
						  //so that current initiated requests have enough time to be properly processed.
						  window.setTimeout(function(){
							  top.location=config.baseUrl+'page/login/goPfa#securityInfo';
						  },1000);
					  }catch(e){}
					  break;
				  }
				  case (status==config.userStatus.invitation_requested):case (status==config.userStatus.user_referred):{
					  //let the user know that he/she will be invited in due time
					  break;
				  }
				  default:{
					  //fail
					  resetAll();
				  }
			  }
		  },
		  error:function(xhr,text){
			  //fail
			  resetAll();
		  }
		});
	};
	function getCookieInformation(cookieName){
		try{
			var docCookie=document.cookie;
			//enable the following line for testing
			//docCookie='s_nr=1323275903548-Repeat; s_vnum=1325404800227%26vn%3D6; __utma=235431070.457906265.1322864344.1323199753.1323274505.8; __utmz=235431070.1323134010.6.3.utmcsr=joetest|utmccn=test3|utmcmd=Ravitest|utmcct=RaviGmoney; exp_last_visit=1323105359; exp_last_activity=1323275902; s_invisit=true; gpv_p12=pcapital-%2Fhome.html; undefined_s=First%20Visit; __utmb=235431070.4.10.1323274505; exp_tracker=a%3A1%3A%7Bi%3A0%3Bs%3A5%3A%22index%22%3B%7D; s_cc=true; s_sq=%5B%5BB%5D%5D; __utmc=235431070';
			var utmzIndex=docCookie.indexOf(cookieName);
			return utmzIndex>=0?docCookie.substring(utmzIndex).split(";")[0]:"";
		}catch(e){
			return "";
		}
	};
	function registerGoogleAnalytics(){
		try{
			_gaq.push(['_trackEvent', 'Registration', 'Signup']);
		}catch(e){}
	}
	function registerGoogleAdwordsConversion(){
		try{
			$("#AdwordsConversionDiv").html("<iframe src='"+config.cmsUrl+"content/uploads/conversiontracking.html' frameborder='0'></iframe>");
		}catch(e){}
	}
	function registerKissmetrics(){
		try{
			_kmq.push(['record', 'joinUsButton_iframe']);
		}catch(e){}
	}
	//PUBLIC INTERFACE
	return {
		init:function(baseUrl,cmsUrl,csrf){
			if(baseUrl)config.baseUrl=baseUrl;
			if(cmsUrl)config.cmsUrl=cmsUrl;
			if(csrf)config.csrf=csrf;
			var username=elements.username=jQuery(config.usernameID);
			var password=elements.password=jQuery(config.passwordID);
			var usernameLabel=elements.usernameLabel=jQuery(config.usernameLabel);
			var passwordLabel=elements.passwordLabel=jQuery(config.passwordLabel);
			var submit=elements.submit=jQuery(config.submitID);
			var form=elements.form=jQuery(config.formID);
			var msgBox=elements.msgBox=jQuery(config.msgBoxID);
			if(!username || !password || !submit)return;
			username.attr("lastVal","")
					.attr("labelBox",config.usernameLabel)
					.keyup(function(evt){
						var kcode=evt.keyCode;
						if(kcode==9||kcode==13||(kcode>=37 && kcode<=40))return;
					})
					.blur(function(){
						var t=$(this);
						if(!isSubmit && isEmpty(t)){
							userValidated=false;
							showLabel(t);
						}else{
							validateUser();
						}
					})
					.keyup(function(data){
						if(data.keyCode==9)return;
						clearMessage($(this));
					});
			password.attr("lastVal","")
					.attr("labelBox",config.passwordLabel)
					.focusout(function(){})
					.blur(function(){
						var t=$(this);
						if(!isSubmit && isEmpty(t)){
							pwdValidated=false;
							showLabel(t);
						}else{
							validatePassword();
						}
					})
					.keyup(function(data){
						if(data.keyCode==9)return;
						clearMessage($(this));
					});
			usernameLabel.focus(function(){
				var t=$(this);
				t.hide();
				username.show().focus();
			});
			passwordLabel.focus(function(){
				var t=$(this);
				t.hide();
				password.show().focus();
			});
			form.attr("action","javascript:signupProcess.submit()");
			resetAll();
		},
		submit:function(){
			return submitForm();
		}
	};
})();
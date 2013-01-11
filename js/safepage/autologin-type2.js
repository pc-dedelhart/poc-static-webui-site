var safepage_debugging = false;
 
function loginWindowOnloadWithDelay() {
	if (!safepage_debugging) 
	{  	 
		setTimeout(stepOne, 1000);
	}		   
	    
    // refresh opener if needed
	if (opener && typeof safepageHome !== "undefined") {
		opener.location = safepageHome;
	}
}

function loginWindowOnload() {
 	if (!safepage_debugging) {	    
	    if (originalUrlWindow) {
	    	originalUrlWindow.close();
	    }
		
		// ask for feedback if needed
		if (opener && typeof askForFeedback !== "undefined" && opener.feedbackWindow) {
			opener.feedbackWindow(userSiteName, userSiteId);		
		}

		dologin();
 	}
}
 
var spLoginForm;
var useridField;
var passwdField;
var username;
var password;
var spLoginButton;
 
function dologin() { 
	var sp00k = SafePage.crypto.getKeyData();
	var unsp00ked = (sp00v && sp00k) ? SafePage.crypto.decrypt(sp00v, sp00k) : null;
	if (unsp00ked) {
	    credentials =eval('('+unsp00ked+')');
	    unameFld=sp00f.LOGIN;
	    passwdFld=sp00f.PASSWORD;
	    username=credentials.LOGIN; 
	    password=credentials.PASSWORD;
	    spLoginForm =fillField(unameFld,username,'userid');
	    spLoginButton= getLoginButton(spLoginForm);
	    fillField(passwdFld,password,'password'); 
	    if (spLoginForm) 
	    { 
			submitForm();
	    /*	if (/MSIE/.test(navigator.userAgent))
				spLoginForm.fireEvent('onsubmit');
			else if (/gecko/i.test(navigator.userAgent))
			{
		      var Event = document.createEvent('HTMLEvents');
	    		Event.initEvent('submit', true, false);
				spLoginForm.dispatchEvent(Event);
			}
			spLoginForm.submit();*/
		}
	} else if (safepage_debugging){
		alert(unsp00ked);
	}
}

function fill(jsonObject)
{
	for(var i=0;i<jsonObject.length;i=i+2)
	{
		fieldName=jsonObject[i].fieldName;
		fieldValue=jsonObject[i+1].fieldValue;
		fillField(fieldName,fieldValue);
	}
}

function fillField(fieldName,fieldValue,fieldSpType)
{
	var allForms=document.getElementsByTagName('form');
	var num=allForms.length;found=false;
	for(var i=0,maxI=allForms.length;i<maxI&&!found;++i)
	{
		frm=allForms[i];found=fillForm(frm,fieldName,fieldValue,fieldSpType) 
    } 
	if(found)
	{ 
		return frm;
	}
}
function getLoginButton(frm)
{
	if(!frm||!frm.elements)
	{
		return;
	}
	var loginButton;
    var elms=frm.elements;found=false;
    for(var i=0,maxI=elms.length;i<maxI&&!found;++i) 
    {
    	var elm=elms[i];
    	if(elm.type=="image" || elm.type == "submit" || elm.type == "button")
      {
      	loginButton =elm;
      	found=true;
      }
    }
  /*    if (!found)
     { 
        for(var i=0,maxI=elms.length;i<maxI&&!found;++i)
        {
          var elm=elms[i]; 
          var atts = elm.attributes;
          for(var j=0,maxJ=atts.length;j<maxJ;++j)
          {
          	if (atts[j].nodeName =="alt" && atts["alt"].nodeValue.toLowerCase() == "login")
             {
              loginButton =elm;
    		    found=true;
            }    
           }
        }
     }
        */
     return loginButton;
 }

function fillForm(frm,fieldName,fieldValue,fieldSpType)
{ 
	if(!frm||!frm.elements)
	{return;}
    var elms=frm.elements;found=false;
    for(var i=0,maxI=elms.length;i<maxI&&!found;++i) 
    {
		var elm=elms[i];
		if(elm.name===fieldName ||(elm.name!=undefined && elm.name.toLowerCase()===fieldName ))
	    {
		    elm.value=fieldValue;
		    
			if (fieldSpType=='password')
				passwdField = elm;
			else if (fieldSpType == 'userid')
				useridField = elm;
			
		    found=true;
	    }
	}
    return found;
}
 function getLoginForm(frmName)
 {
 	var allForms=document.getElementsByTagName('form');
	var num=allForms.length;
	found=false;
	for(var i=0,maxI=allForms.length;i<maxI&&!found;++i)
	{ 
		frm=allForms[i];
		if (frm.name == frmName)
		{
			found=true;
			theForm=frm; 
		}
	}
    if (found) return theForm; 
 }
 function submitForm()
 {
    

    if (/MSIE/.test(navigator.userAgent))
    {
      var eventObj = document.createEventObject();
      eventObj.keyCode = 13
      passwdField.fireEvent("onkeypress", eventObj)
      //alert("fired passwd **onkeypress** event");
    }
    else if (/gecko/i.test(navigator.userAgent))
    {
        if (/KHTML/.test(navigator.userAgent))
        {
         var Event = document.createEvent('UIEvents');
           Event.initUIEvent('keypress', true, true, window, 1);
           Event.keyCode = 13;
        }
        else
        {
           var Event = document.createEvent('KeyboardEvent');
           Event.initKeyEvent('keypress', true, false, this, false, false, false, false, 0, 13)
        }
        passwdField.dispatchEvent(Event);
       // alert("fired passwd **onkeypress** event");
    }

    
    if(spLoginButton)
    {
      spLoginButton.click();
    //  alert("fired spLoginButton **click** event");
      return;
    }

    if (/MSIE/.test(navigator.userAgent))
    {
        spLoginForm.fireEvent("onsubmit");
      //   alert("fired loginForm **onsubmit** event");
    }
    else if (/gecko/i.test(navigator.userAgent))
    {
      var Event = document.createEvent('HTMLEvents');
      Event.initEvent('submit', true, false);
     // alert("fired loginForm **onsubmit** event");
      spLoginForm.dispatchEvent(Event);
    }
//	alert("submitting loginform");
    spLoginForm.submit();
    
 
    return;
}
 
function sp_getCookie(name) {
	var value = null;
	if (document.cookie && document.cookie != '') {
	    var cookies = document.cookie.split(';');
	    for (var i = 0; i < cookies.length; i++) {
	        var cookie = sp_trim(cookies[i]);
	        if (cookie.substring(0, name.length + 1) == (name + '=')) {
	            value = decodeURIComponent(cookie.substring(name.length + 1));
	            break;
	        }
	    }
	}
	return value;
}

function sp_trim(text) {
	return(text||"").replace(/^\s+|\s+$/g,"");
}

function sp_killCookie(name) {
	document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT";
}

function stepOne() {
	setTimeout(stepTwo, 1000);
	nextStep(1);
}

function stepTwo() {
	setTimeout(loginWindowOnload, 1000);
	nextStep(2);
}

function nextStep(which){
 	var where;
 	if (which === 1) { where = "165px" }
 	if (which === 2) { where = "220px" }
 	
 	var after = which+1;
 	
 	document.getElementById('safepageCss_stepOk' + which).setAttribute("style","display: block;");
 	document.getElementById('safepageCss_spStep' + which).setAttribute("class","safepageCss_spStepOk");
 	document.getElementById('safepageCss_loadingSP').setAttribute("style","top:"+ where);
 
 	document.getElementById('safepageCss_spStep' + after).removeAttribute("class");
 	document.getElementById('safepageCss_spStep' + which ).setAttribute("animate","{opacity: '.25'}, 750");
 	document.getElementById('safepageCss_stepOk' + which ).setAttribute("animate" ,"{opacity: '.25'}, 750");
 
}

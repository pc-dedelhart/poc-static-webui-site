var installedPlugin=false,betaTester=false,developer=false;
var activeTab=null,iframeHeight=1000;
$(document).ready(function(){
	if(installedPlugin){
		$("#mainContainer").css("padding-left","0px");
	}else{
		if(typeof numberOfAccounts == 'undefined' || numberOfAccounts < 1){
			minimizeSidebarSwf();
		}else{
			openSidebarSwf();
		}
	}
	if(betaTester || developer){
		$(".betaMenus").removeClass("hidden");
	}
	var liItems=$("#main-navigation>li.item1");
	liItems.hover(function(){
		$(this).find("ul").show();
	},function(){
		$(this).find("ul").hide();
	});
	liItems.click(function(){
		menuItemClick($(this));
	});
	var subMenuULs=$("#main-navigation>li.item1>ul");
	subMenuULs.hover(function(){
		$(this).parent().find("a").addClass("liDroppedDown");
	},function(){
		$(this).parent().find("a").removeClass("liDroppedDown");
	});
	$("#advisorFAQs").click(function(e){
		try{
			_kmq.push(['record','Viewed Advisor: HelpFAQ']);
		}catch(e){
			//kissmetrics exception
		}
		return true;
	});
	if(!window.addEventListener){
		window.addEventListener=function(n,f,e){
			window.attachEvent("on"+n,function(){f(event);});
		};
	}
	window.addEventListener('message',function(e){
		if(e.origin=='http://localhost:8080' || e.origin=="http://personalcapital.thegoodlab.com" ||e.origin=='http://mybeta.personalcapital.com'||e.origin=='https://mybeta.personalcapital.com'||e.origin=='https://www.personalcapital.com'||e.origin=='http://www.personalcapital.com'||e.origin=='https://staging.personalcapital.com'){
			var data=e.data;
			handleCrossDomainMessages(data);
		}
	},false);
	window.onURLHashChange();
	if(cmsUrl){
		var cmsLiItems=$(".cmsHref");
		cmsLiItems.each(function(){
			this.href=cmsUrl+$(this).attr("href");
		});
		var cmsLiItems2=$(".cmsHref_iframe");
		cmsLiItems2.each(function(){
			//this.href="#/iframe?url="+cmsUrl+$(this).attr("href");
			//cmsUrl is being set by the swf and the prefix "cms" is used for encoding/decoding the url
			this.href="#/iframe?url=%cms%"+$(this).attr("href");
		});
	}
	showFooter();
	//pass browser properties to kissmetrics
	if(typeof BrowserDetect != 'undefined' && BrowserDetect && BrowserDetect.browser && BrowserDetect.version) {
		_kmq.push(['set', {'Browser' : BrowserDetect.browser + " " +BrowserDetect.version }]);
	}
});
function menuItemClick(mItem){
	if(!mItem)return;
	mItem.find("ul").hide();
	if(activeTab)activeTab.removeClass("liActive");
	activeTab=mItem.children().first();
	activeTab.addClass("liActive");
}
function disableMenu(){
	$("#menuOverlay").show();
}
function enableMenu(){
	$("#menuOverlay").hide();
}
window.onSWFHeightChange = function(id, height){
	$("#bodyContainer").height(height);
};
window.onURLHashChange=function(){
	//var hash=window.location.hash.split("?")[0].replace("#/","").replace("#","");
	var hash=window.location.hash.replace("#/","").replace("#","");
	if (hash.indexOf("iframe?url=")>=0){
		var hAry=hash.split("/");
		hash=hAry[hAry.length-1];
		if(hash=="no-nav")hash=hAry[hAry.length-2];
	};
	var liItems=$("#main-navigation>li.item1");
	switch(true){
		case hash.startsWith('dashboard'):{
			menuItemClick($(liItems[0]));
			break;
		}
		case hash.startsWith('accounts'): case hash.startsWith('all_transactions'):{
			menuItemClick($(liItems[1]));
			break;
		}
		case hash.startsWith('cashManager'): case hash.startsWith('billsReminder'): case hash.startsWith('us-savings'): case hash.startsWith('international-savings'): case hash.startsWith('savings-concierge'):{
			menuItemClick($(liItems[2]));
			break;
		}
		case hash.startsWith('portfolioManager'): case hash.startsWith('goPfs'): case hash.startsWith('pc_landing_page'): case hash.startsWith('pc_what_is_a_personal_fund'): case hash.startsWith('pc_what_is_a_personal_strategy'): case hash.startsWith('investmentCheckup'): case hash.startsWith('pc_tearsheet'):{
			menuItemClick($(liItems[3]));
			break;
		}
		case hash.startsWith('advisor'):{
			menuItemClick($(liItems[4]));
			break;
		}
		case hash.startsWith('profile'): case hash.startsWith('edocs'):{
			menuItemClick($(liItems[5]));
			break;
		}
		case hash.startsWith('how-to-invest'):case hash.startsWith('personal-funds'): case hash.startsWith('personal-strategy'):case hash.startsWith('stock-option-tracker'):{
			menuItemClick($(liItems[3]));
			break;
		}
		default:{
			menuItemClick($(liItems[0]));
		}
	}
	//kissmetrics events for marketing content
	if(hash.startsWith('us-savings')){
		_kmq.push(['record','Viewed Banking: US Savings']);
	}
	if(hash.startsWith('international-savings')){
		_kmq.push(['record','Viewed Banking: International Savings']);
	}
	if(hash.startsWith('how-to-invest')){
		_kmq.push(['record','Viewed Investing: How to Invest']);
	}
	if(hash.startsWith('personal-strategy')){
		_kmq.push(['record','Viewed Investing: Personal Strategy']);
	}
}
function handleCrossDomainMessages(data){
	try{
		switch(data.split("?")[0]){
			case "changeHeight":{
				var arg=data.split("?");
				if(arg.length==0 || arg[1].split("=").length==0)return;
				var hNum=arg[1].split("=")[1];
				hNum=parseInt(hNum);
				if(!isNaN(hNum)){
					changeFrameHeight(document.getElementById("htmlContent"),hNum+75);
				}
				break;
			}
			case "navigateToFundSelector":{
				window.location.href="/page/login/goPfa#/iframe?url=%pch%page/login/goPfs";
				break;
			}
			case "navigateToAdvisor":{
				window.location.href="/page/login/goPfa#/advisor";
				break;
			}
			default:{
				
			}
		}
	}catch(e){}
}
function handleEventToSwf(action, params) {
    try {
    	//delaying the dispatch to main swf so that sidebar swf has enough time to evaluate the session
    	window.setTimeout(function(){
		 	var mainSwf = document.getElementById("flash");
	        if (mainSwf) {
	            if (mainSwf.dispatchExternalJsEvent) {
					mainSwf.dispatchExternalJsEvent(action, params);
	            } else {
	            	// swf is not loaded yet, so try the message in 10 seconds.
	            	setTimeout(function(){
	                    if (mainSwf.dispatchExternalJsEvent) {
	            			mainSwf.dispatchExternalJsEvent(action, params);
	            		}
	            	}, 10000);
	            }
	        }
    	},200);
	  	var sidebarSwf = swfobject.getObjectById("SafePageSidebar");
        if (sidebarSwf) {
			if (action == "HTML_RESIZE") {
				openSidebarSwf();
           		return;
        	}

            if (sidebarSwf.dispatchExternalJsEvent) {
				sidebarSwf.dispatchExternalJsEvent(action, params)
            } else {
            	// swf is not loaded yet, so try the message in 10 seconds.
            	setTimeout(function(){
                    if (sidebarSwf.dispatchExternalJsEvent) {
            			sidebarSwf.dispatchExternalJsEvent(action, params);
            		}
            	}, 10000);
            }
        }
    } catch (e) {
		// ignore
    }
}
function scrollToTop() {
	if(window.scrollTo)window.scrollTo( 0, 0 );		//checking if scrollTo function is supported on the browser
}
function updateDocHeight(h){
	if(h.split("=").length==0)return;
	iframeHeight=h.split("=")[1];
	changeFrameHeight(document.getElementById("htmlContent"));
}
function changeFrameHeight(frame,height){
	if( $("#htmlContainer").css( "display" ) != "none" ){
		var h=0,fr=$(frame);
		if(height){				//HEIGHT IS GENERALLY PASSED FOR CROSS-DOMAIN DOCS
			h=height;
		}else{
			try{					//DETERMINE HEIGHT BASED ON CONTENT
				h=fr.contents().height();
			}catch(e){				//MOST CROSS DOMAINS DOCS COME WITH HEIGHT, IF THEY DON'T THEN THEY ARE SET TO DEFAULT IFRAME HEIGHT
				h=iframeHeight;
			}
			if(h===null)h=iframeHeight;
		}
		frame.style.height = "";
		fr.height(h);
		$("#bodyContainer").height(h);
	}
}
function hideHTMLContainer(){
	// console.log( 'hiding html container' );
	document.getElementById("htmlContent").style.height = "";
  $("#htmlContent").attr('src',"");
  $("#htmlContainer").hide();
  $("#flash").css('visibility','visible');
}
function showHTMLContainer(url){
	// console.log( 'showing html container' );
	document.getElementById("htmlContent").style.height = "";
	$("#htmlContent").attr('src',url);
	$("#htmlContainer").show();
	$("#flash").css('visibility','hidden');
	$("#flashContent").css('height','200px');	
	$("#flash").css('height','200px');	
}
function showFooter(){
	$("#footerContainer").show();
}
function openCMSResource(path){
	path=cmsUrl+path;
	window.open(path,'_blank');
}
window.updateUsername=function(name){
	username = name;
	$("#userTitle").html(username);
	//reset extole cookies
};
//extole referall program code
window.showReferralPopup=function(){
	try{
		var extoleWidget = extole.widgets('dashboard');
		extoleWidget.params.email = username;
		extoleWidget.show();
	}catch(e){}
};
var _xtq = [];
window.triggerReferralEvent=function(){
	try{
			_xtq.push(['log_host', 'refer.personalcapital.com']);
			var _xtq_options = {};
			_xtq_options['status'] = 1;
			_xtq_options['client_id'] = 955088664;
			_xtq_options['userGuid'] = userGuid;
			_xtq.push(['log_conversion', _xtq_options]);
			(function() {
				var x = document.createElement("script"); x.type = "text/javascript"; x.async = true;
				x.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + "//media.extole.com/track/traction.min.js";
				var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(x, s);
			})();
	}catch(e){
	}
};
//read utmz aka GA cookie
window.getGACookie=function(){
	try{
		var docCookie=document.cookie;
		var utmzIndex=docCookie.indexOf("__utmz");
		return utmzIndex>=0?docCookie.substring(utmzIndex).split(";")[0]:"";
	}catch(e){
		return "";
	}
};
//adding startsWith support to browser that do not supoort it natively/by default
if(!String.prototype.startsWith){
    String.prototype.startsWith = function (input) {
        return this.substring(0, input.length) === input
    }
}
//adding indexOf support to browser that do not supoort it natively/by default
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}
//all functions that i believe are no longer needed. dmitriy miller needs to verify - ravi
function changeHeight(h) {
	//if( $("#htmlContainer").css( "display" ) != "none" ){
		//alert( "from AS3 setting flash height to html height: " + ($("#htmlContainer").height() + 80) );
		//$("#flashContent").height( $("#htmlContainer").height() + 80 );
	//}else{
		//alert( "from AS3 setting flash height to: " + h );
    	//swffit.configure( {target:"flashContent", minHei:h } );
	    //}
}
function inlineSidebarOpened(){
	//$('#htmlContainer').css('left', '221px');
	//$('#htmlContent').css('width', '970px');
	//$('#menuContainer').css('left', '221px');
}
function inlineSidebarClosed(){
	//$('#htmlContainer').css('left', '25px');
	//$('#htmlContent').css('width', '970px');
	//$('#menuContainer').css('left', '25px');
}

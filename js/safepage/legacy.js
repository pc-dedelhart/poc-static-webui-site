define([
        'jquery'
        , 'swfobject'
        , 'browserDetect'
    	, 'libs/pcap/utils/extoleWidget'
], function($, swfobject, BrowserDetect, ExtoleWidget){
	var activeTab=null,iframeHeight=1000;
	//functions required for main swf
	window.isReady = function(){
		return true;
	};
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
			case hash.startsWith('accounts/add'): case hash.startsWith('accounts/manage'):{
				break;
			}
			case hash.startsWith('accounts/details'): case hash.startsWith('all_transactions'):{
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
	};
	window.updateUsername=function(name){
		username = name;
		$("#userTitle").html(username);
		//reset extole cookies
	};
	
	//extole referall program code
	/*window.showReferralPopup=function(){
		//return;
		var extoleWidget = extole.widgets('dashboard');
		extoleWidget.params.email = username;
		extoleWidget.show();
	};*/
	
	window.showReferralPopup=function(){
		ExtoleWidget.show();
	}
	
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
	
	window.scrollToTop = function() {
		if(window.scrollTo)window.scrollTo( 0, 0 );		//checking if scrollTo function is supported on the browser
	}

	window.hideHTMLContainer = function(){
		// console.log( 'hiding html container' );
		document.getElementById("htmlContent").style.height = "";
	  $("#htmlContent").attr('src',"");
	  $("#htmlContainer").hide();
	  $("#flash").css('visibility','visible');
	}
	
	window.showHTMLContainer = function(url){
		// console.log( 'showing html container' );
		document.getElementById("htmlContent").style.height = "";
		$("#htmlContent").attr('src',url);
		$("#htmlContainer").show();
		$("#flash").css('visibility','hidden');
		$("#flashContent").css('height','200px');	
		$("#flash").css('height','200px');	
	}
	
	window.openCMSResource = function(path){
		path=cmsUrl+path;
		window.open(path,'_blank');
	}
	
	window.handleEventToSwf = function(action, params) {
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
	    } catch (e) {
			// ignore
	    }
	}
	
	window.disableMenu = function(){
		$("#menuOverlay").show();
	}
	
	window.enableMenu = function(){
		$("#menuOverlay").hide();
	}
	
	window.changeFrameHeight = function(frame,height){
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
	
	//private functions
	
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
	
	function loadMainSwf(){
		//For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
	    var swfVersionStr = "10.0";
	    //To use express install, set to playerProductInstall.swf, otherwise the empty string.
	    var xiSwfUrlStr = "/swf/playerProductInstall.swf";
	    xiSwfUrlStr = "";			//disabling adobe's default express install
	    var flashvars = {
	    	SAFEPAGE_BASE_URL: baseUrl,
	    	SAFEPAGE_CSRF_VALUE: csrf,
	    	SERVER_CMS_URL: cmsUrl,
	    	SERVER_KISSMETRICS_API_KEY: kmApiKey,
	    	SERVER_USERGUID: userGuid,
	    	SERVER_FEED_URL: feedUrl,
	    	POST_REMOVE_USER_REDIRECT_URL: postRemoveUserRedirectUrl,
			ALLOW_RESIZE: true, //!showFirstUse,
			SERVER_SIDE_SIDEBAR: !installedPlugin,
			SHOW_FIRST_USE: showFirstUse
	    };

	    var handleEmbedResult = function(event){
	      if( event.success === false ){
	      	// simply redirect              	
			window.PFA_FLASH_SUPPORTED = false;
	      	if( !showFirstUse ){
	        	window.location = '/page/login/redirectFlash';
	      	}
	      }else{
	      	window.PFA_FLASH_SUPPORTED = true;
	      	$("#leftContainer").css('display','block');
	      	/*
	      	 *	PFA-6641: moving out of swf load event
	      	 *	if( typeof redirectTo == 'string' && redirectTo != '' ){
	        		window.location = redirectTo;
	      		}
	      	*/
	      }
	    };

		var params = {};
	        params.quality = "high";
	        params.bgcolor = "#ffffff";
	        params.allowscriptaccess = "always";
	        params.allowNetworking = "all";
	        params.wmode = "opaque";
	    var attributes = {};
	        attributes.id = "flash";
	        attributes.name = "flash";
	        attributes.align = "middle";

	    swfobject.embedSWF(
	        "/swf/Main"+resourceVersion+".swf", "flash", 
	        "100%", "100%", 
	        swfVersionStr, xiSwfUrlStr, 
	        flashvars, params, attributes, handleEmbedResult);
	}
	
	function menuItemClick(mItem){
		if(!mItem)return;
		mItem.find("ul").hide();
		if(activeTab)activeTab.removeClass("liActive");
		activeTab=mItem.children().first();
		activeTab.addClass("liActive");
	}
	
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
	
	//return function
	var legacyJS = {};
	legacyJS.init = function(){
		//load main swf
		loadMainSwf();
		//wire menu items
		var liItems=$("#main-navigation>li.item1");
		liItems.hover(function(){
			$(this).find("ul").show();
		},function(){
			$(this).find("ul").hide();
		});
		liItems.click(function(e){
			if(typeof e.target != 'undefined'){
				var href = $(e.target).attr('href');
				switch(href){
					case '/page/login/goPfa#/accounts/manage': {
						//to prevent it from changing the url
						e.preventDefault();
						
						eventBus.trigger(customEvents.editAccounts);
						break;
					}
					case '/page/login/goPfa#/accounts/add': {
						//to prevent it from changing the url
						e.preventDefault();
						
						eventBus.trigger(customEvents.linkAccount);
						break;
					}
				}
			}
			//menuItemClick($(this));
		});
		var subMenuULs=$("#main-navigation>li.item1>ul");
		subMenuULs.hover(function(){
			$(this).parent().find("a").addClass("liDroppedDown");
		},function(){
			$(this).parent().find("a").removeClass("liDroppedDown");
		});
		//event listener for message from cross-domain
		if(!window.addEventListener){
			window.addEventListener=function(n,f,e){
				window.attachEvent("on"+n,function(){f(event);});
			};
		}
		window.addEventListener('message',function(e){
			if(e.origin=='http://pcapital.local' || e.origin=='http://localhost:8080' || e.origin=="http://personalcapital.thegoodlab.com" ||e.origin=='http://mybeta.personalcapital.com'||e.origin=='https://mybeta.personalcapital.com'||e.origin=='https://www.personalcapital.com'||e.origin=='http://www.personalcapital.com'||e.origin=='https://staging.personalcapital.com'){
				var data=e.data;
				handleCrossDomainMessages(data);
			}
		},false);
		window.onURLHashChange();
		//wire kissmetrics
		BrowserDetect.init();
		if(BrowserDetect.browser && BrowserDetect.version) {
			_kmq.push(['set', {'Browser' : BrowserDetect.browser + " " +BrowserDetect.version }]);
		}
		$("#advisorFAQs").click(function(e){
			_kmq.push(['record','Viewed Advisor: HelpFAQ']);
			return true;
		});
	}
	return legacyJS;
});
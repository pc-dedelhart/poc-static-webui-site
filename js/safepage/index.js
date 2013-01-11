var installedPlugin=false,betaTester=false,developer=false;
var activeTab=null;
var winLocation=window.location.protocol+"//"+window.location.host+'/';
//For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
var swfVersionStr = "10.3.0";
//To use express install, set to playerProductInstall.swf, otherwise the empty string.
var xiSwfUrlStr = "/swf/playerProductInstall.swf";
xiSwfUrlStr = "";			//disabling adobe's default express install
var flashvars = {
	SAFEPAGE_BASE_URL:winLocation,
	SERVER_SIDE_SIDEBAR:false
}
var params = {};
    params.quality = "high";
    params.bgcolor = "#ffffff";
    params.allowscriptaccess = "always";
    params.allowNetworking = "all";
    params.wmode = "transparent";
var mainSwfattr = {};
    mainSwfattr.id = "flash";
    mainSwfattr.name = "flash";
    mainSwfattr.align = "middle";
var spConsts = {
    SP_SERVER_DEFAULT_URL:winLocation
};
var scripts3S=['/js/modules/platform_web.js','/js/modules/utils.js','/js/modules/sitemanager.js','/js/modules/safepageapi.js','/js/modules/sidebarmanager.js','/js/modules/sidebarinterface_web.js'];



$(document).ready(function(){
    var url=winLocation+'api/sidebar/getSidebarInfo';
    jQuery.ajax({
      type:'POST',url: url,dataType: 'json',
	  success: function(data){
	  		var spHeader=data.spHeader;
	  		var spData=data.spData;
	  		if(spData.sidebarVersion){
	  			flashvars.SERVER_SIDE_SIDEBAR=false;
	  			$("#container").css("left","0px");
	  			$("#SideBarSWFDiv").addClass("hidden");
	  			$("#SideBarImageDiv").addClass("hidden");
	  		}else{
	  			$("#container").css("left","220px");
	  			$("#SideBarSWFDiv").removeClass("hidden");
	  			$("#SideBarImageDiv").removeClass("hidden");
	  			flashvars.SERVER_SIDE_SIDEBAR=true;
	  			for(var i=0,len=scripts3S.length;i<len;i++){
	  				$('<script><\/script>').attr('src', scripts3S[i]).appendTo($('head')[0]);
	  			}
	  			doload();
	  		}
	  		$("#userTitle").html("Hello "+spHeader.username);
			if(spHeader.betaTester || spHeader.developer){
				$("#mi_investing").removeClass("hidden");
			}
			swffit.showScrollV(); //Should always be called before swfobject or it will make the flash to reload
			swfobject.embedSWF(
			    "/swf/Main.swf", "flash", 
			    "100%", "100%", 
			    swfVersionStr, xiSwfUrlStr, 
			    flashvars, params, mainSwfattr);
    	}
	});
	var liItems=$("#main-navigation>li.item1");
	liItems.hover(function(){
		$(this).find("ul").show();
	},function(){
		$(this).find("ul").hide();
	});
	liItems.click(function(){
		$(this).find("ul").hide();
		if(activeTab)activeTab.removeClass("liActive");
		activeTab=$(this).children().first();
		activeTab.addClass("liActive");
	});
	if(activeTab)activeTab.addClass("liActive");
	showFooter();
});
function isReady() {
    return true;
}
window.onSWFHeightChange = function(id, height){
	$("#bodyContainer").height(height);
};
function handleEventToSwf(action, params) {
    try {
	 	var mainSwf = document.getElementById("flash");
        if (mainSwf) {
            if (mainSwf.dispatchExternalJsEvent) {
				mainSwf.dispatchExternalJsEvent(action, params)
            } else {
            	// swf is not loaded yet, so try the message in 10 seconds.
            	setTimeout(function(){
                    if (mainSwf.dispatchExternalJsEvent) {
            			mainSwf.dispatchExternalJsEvent(action, params);
            		}
            	}, 10000);
            }
        }

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
function changeFrameHeight(frame){
	if( $("#htmlContainer").css( "display" ) != "none" ){
		var fr=$(frame);
		var h=fr.contents().height();
		fr.height(h);
		$("#bodyContainer").height(h);
	}
}
function hideHTMLContainer(){
  $("#htmlContent").attr('src',"");
  $("#htmlContainer").hide();
  $("#flash").css('visibility','visible');
}
function showHTMLContainer(url){
	$("#htmlContent").attr('src',url);
	$("#htmlContainer").show();
	$("#flash").css('visibility','hidden');
}
function showFooter(){
	$("#footerContainer").show();
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
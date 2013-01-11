
if (typeof SafePage == "undefined") {
    window.SafePage = (function(){
        return {
            version: "1.0",
            standalone: false,
            fullSearch: false,
            siteId: 0,
            csrf: null
        };
    })();
}

if (typeof SP == "undefined") {
    window.SP = window.SafePage;
}

var newsFTHTimeout;
var loginTimeout; //for login button option dropdown
var animationQueue = 0;
var changedPassword = false;

$(document).ready(function(){

    $("input:text:visible:enabled:first").not(".noinitialFocus").focus();
    $("input:password:visible:enabled:first").not(".noinitialFocus").focus();
    $(".initialfocus:visible").focus();
    // Checks if mouse has left Sign-out button menu and resets it to hidden
    $('#signoutoptions').bind('mouseleave', function(event){
        $('#hideshowoptions').css('display', 'none');
    }).bind('mouseenter', function(event){
        clearTimeout(loginTimeout);
    });
    
    //add hover effect on add link
    $("#addSiteLink").hover(function(){
        $(this).addClass("hov");
    }, function(){
        $(this).removeClass("hov");
    });
    
    //add FTH hover effect for news
    $("#newsBox").hover(function(){
        if ($('#firstTime').val() === 'true') {
            if ($('#newsFTH').length > 0) {
                newsFTHTimeout = setTimeout("$('#newsFTH').slideDown(1000).addClass('.viewedFTH');", 3000);
            }
        }
    }, function(){
        clearTimeout(newsFTHTimeout);
    });
});

function goHome(){
    self.location = "/";
}

function pingSession(){
    SP.api.ping(function(header, data){
        tb_remove();
    });
}

// Function for sign-out button menu
function clicksignoutoptions(){
    if ($('#hideshowoptions').css('display') === 'none') {
        $('#hideshowoptions').css('display', 'block');
        loginTimeout = setTimeout("$('#hideshowoptions').css('display', 'none');", 5000);
    }
    else {
        $('#hideshowoptions').css('display', 'none');
    }
}

/**
 * Utility function to replace an element in a div
 * @param {Object} o
 */
$.fn.replace = function(o){
    return this.after(o).remove();
};

function unsecureMode(){
    $("logoffForm").submit();
    tb_remove();
}

function replaceTmpl(tmpl, toReplace, conditions){
    //tmpl is the template or string to search and replace
    //toReplace are the pairs your are searching and replacein as an array, ie ["old", "new",...]
    // The new item is expected to be a selector which will lead to html to replace the placeholder with
    //conditions are the search conditions ie. g (for global) i(case insensitive) and 
    if (!tmpl || !toReplace) 
        return false;
    if (!conditions) 
        conditions = "";
    
    for (i = 0; i < toReplace.length; i += 2) {
        if (typeof toReplace[i] != "undefined") {
            var pattern = new RegExp("\\$" + toReplace[i] + "\\$", conditions);
            
            if (typeof toReplace[i + 1] === "undefined") {
                toReplace[i + 1] = ""
            }
            if (toReplace[i + 1].toString().substring(0, 1) === "#") {
                tmpl = tmpl.replace(pattern, $(toReplace[i + 1]).html());
            }
            else {
                tmpl = tmpl.replace(pattern, toReplace[i + 1]);
            }
        }
    }
    return tmpl;
}

jQuery.fn.hint = function(){
    return this.each(function(){
        // get jQuery version of 'this'
        var t = jQuery(this);
        // get it once since it won't change
        var title = t.attr("title");
        // only apply logic if the element has the attribute
        if (title) {
            // on blur, set value to title attr if text is blank
            t.blur(function(){
                if (t.val() === "") {
                    t.val(title);
                    t.addClass("fadetitle");
                }
            });
            // on focus, set value to blank if current value
            // matches title attr
            t.focus(function(){
                if (t.val() == title) {
                    t.val("");
                    t.removeClass("fadetitle");
                }
            });
            
            // clear the pre-defined text when form is submitted
            t.parents("form:first()").submit(function(){
                if (t.val() == title) {
                    t.val("");
                    t.removeClass("fadetitle");
                }
            });
            
            // now change all inputs to title
            t.blur();
        }
    });
};

function searchbackground(n){

    if ($("#" + n).val() === "") {
        $("#" + n).addClass(n);
    }
    else if ($(n).val() !== "") {
        $("#" + n).removeClass(n);
    }
}

function clearsearch(n){
    $("#" + n).val("");
    $("#" + n).blur();
    searchbackground(n);
}

function updateWidgetState(){
    // this is brittle code that hardwires ids of widgets
    var widgetState = "";
    if ($("#myAlerts").is(":visible")) 
        widgetState += "A";
    if ($("#rssfeed-box").is(":visible")) 
        widgetState += "N";
    if ($("#search").is(":visible")) 
        widgetState += "S";
    
    document.cookie = "WS=" + widgetState;
}

function closeProvider(t, id){
    // All you need to pass for this to work is the ID of the div 
    // you want to hide and the tick image must be within the element 
    // which called this function image must have opened/closed in 
    // the title for the appropriate states of the tick image
    if ((!t) || (t.length === 0)) 
        return false;
    if (id === "signInPlease") {
        tb_show("Sign-In", "#TB_inline?height=auto&width=650&inlineId=loginUserInline&modal=true", null);
        return;
    }
    var pvdr = "#" + id;
    var pvdrImg = $(t).find("img", ":first");
    var imgSrc = $(pvdrImg).attr("src");
    var animTime = $(pvdr).height() / 1.5;
    if (animTime < 250) 
        animTime = 250;
    if (animTime > 1500) 
        animTime = 1500;
    
    var closing = isOpen();
    if ($(pvdrImg).is(".toggleme")) {
        srcQuery();
        $(pvdrImg).removeClass("toggleme");
        $(pvdrImg).removeClass("openDwr"); 
        if (closing) 
            animateMe(pvdr, null, this, animTime, "slideUp", null);
        else 
            animateMe(pvdr, null, this, "slow", "slideDown", null);
    }
    else {
        if (closing) 
            animateMe(pvdr, null, this, animTime, "slideUp", null);
        else 
            animateMe(pvdr, null, this, "slow", "slideDown", null);
        srcQuery();
        $(pvdrImg).addClass("toggleme");
        if($(pvdrImg).hasClass("alignPWMIcon"))
        {
        	$(pvdrImg).addClass("openDwr");
        }
    }
    
    setTimeout(updateWidgetState, 1000);
    
    function isOpen(){
        var imgQuery = /opened/;
        var pos = imgSrc.search(imgQuery);
        return pos != -1;
    }
    
    function srcQuery(){
        if (isOpen()) {
            imgSrc = imgSrc.replace("opened", "closed");
            return false;
        }
        else {
            imgSrc = imgSrc.replace("closed", "opened");
            return true;
        }
    }
}

function checkYodleePlugin(){
    var hasLoginHelper = false;
    if ($.browser.browser === "MSIE") {
        //var yodleeHelper = "EC8C56B1-D027-4AB2-AF63-F845CCEE59B5";
        document.body.addBehavior("#default#clientCaps");
        var yodleeHelper = "FrameAccess.DocumentAccessor";
        hasLoginHelper = activeXDetection(yodleeHelper);
    }
    
    if (($("#safePageXferPlugin").val() === "false")) {
        return false;
    }
    else {
        return true;
    }
}


/*
 Misc. Utility Functions
 */
function activeXDetection(componentClassName){
    var p;
    var result = false;
    try {
        p = new ActiveXObject(componentClassName);
    } 
    catch (e) {
        // active x object could not be created
        // alert (componentClassName +' plugin is not installed...');
        result = false;
    }
    if (p) {
        // alert(componentClassName + 'plugin is installed!');
        result = true;
    }
    return result;
}

function schedulePluginCheck(userSiteId, userSiteName){
    if (checkYodleePlugin() !== true) {
        setTimeout("schedulePluginCheck(" + userSiteId + ", \"" + userSiteName + "\")", 1000);
    }
    else {
        var downloadCompletedDiv = "<div class='basic'>Download completed. To continue to " + userSiteName + " site please select \"go to site\" below.<div>";
        
        var downloadCompletedButtons = "<div style='float: right'><a class='primarybutton' href='page/autologin/start?session=" + session + "&csrf=" + window.SP.csrf + "' target='_blank' onclick='location.reload(true);'><span>Go To Site<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div style='float: right'><a class='secondarybutton buttontoright' href='javascript: void(0);' onclick='location.reload(true);'><span>Cancel<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div class='clearfloat'></div>";
        $("#TB_PLUGIN_INSTALLED").find(".TB_body").empty().append(downloadCompletedDiv);
        $("#TB_PLUGIN_INSTALLED").find(".TB_footer").empty().append(downloadCompletedButtons);
        
        $("#TB_ajaxContent").empty().css({
            width: "450px"
        }).append($("#TB_PLUGIN_INSTALLED").removeClass("hidden"));
    }
}


function isValidURL(url){
    var RegExp = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;
    if (RegExp.test(url)) {
        return true;
    }
    else {
        return false;
    }
}

function animateMe(who, what, where, when, how, callback){
    if (animationQueue > 10) {
        return false;
    }
    else {
        //who is the object that will animate REQUIRED
        //how is the type of animation (animate, slideDown, slideUp, or custom) REQUIRED
        if (!who || !how) 
            return false;
        //what is the parameters being animated REQUIRED if using animate or a custom predefined animation
        if (((how === "animate") || (how === "custom")) && (!what)) 
            return false;
        //where is a referance to the object calling the animation OPTIONAL
        if (!where) {
            where = "";
        }
        //when is overides the default animation time OPTIONAL
        if (!when) {
            when = 0;
        }
        
        if (!callback) {
            callback = "";
        }
        
        animationQueue += 1;
        //Check to see if who is an object, if it is not, set it as an id
        if ($(who).length < 1) {
            who = "#" + who;
        }
        
        if (how === "animate") {
            $(who).animate(what, when, callback);
        }
        else if (how === "slideDown") {
            $(who).slideDown(when, callback);
        }
        else if (how === "slideUp") {
            $(who).slideUp(when, callback);
        }
        else if (how === "custom") {
            //Enter custom animation scripts here
        }
        else {
            return false;
        }
        
        animationQueue -= 1;
        return true
    }
}

function disableItem(f, d, w, g){
    //f is the Object or ID to be faded REQUIRED
    //d is the Object or ID to be disabled REQUIRED
    //g is the Object or ID to hide OPTIONAL
    //w is set to disable or enable REQUIRED
    if ((!f && !d) || !w) 
        return false;
    //Check to see if who is an object, if it is not, set it as an id
    for (i = 0; (i < f.length); i += 1) {
        if ($(f[i]).length < 1) {
            f[i] = "#" + f[i];
        }
        if (w === "disable") { //if DISABLING
            $(f[i]).addClass('fadedisabledforms');
            if (typeof g !== "undefined") 
                $(g).hide();
        }
        else { //else ENABLE
            $(f[i]).removeClass('fadedisabledforms');
            if (typeof g !== "undefined") 
                $(g).show();
        }
    }
    
    for (j = 0; (j < d.length); j += 1) {
        if ($(d[j]).length < 1) {
            d[j] = "#" + d[j];
        }
        if (w === "disable") { //if DISABLING
            $(d[j]).attr('disabled', true);
        }
        else { //else ENABLE
            $(d[j]).removeAttr('disabled');
        }
    }
}


function addCommas(nStr){
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


function toggleFeedSize(object, defaultNum){
    if (!object || !defaultNum) 
        return;
    
    if ($(object).length < 1) {
        object = $("#" + object);
    }
    
    if ($(object).css("display") === "none") 
        return;
    
    var childNum = $(object).children().not(".hidden").length;
    var childHeight = $(object).children().outerHeight();
    var newSize = childNum * childHeight;
    var defaultSize = childHeight * defaultNum;
    if (childNum <= defaultNum) {
        $(object).prev().find(".feedView").empty().append("");
        return;
    }
    
    if ($(object).outerHeight() <= defaultSize + 2) {
        $(object).animate({
            height: newSize
        }, 500, function(){
            $(object).css({
                height: "auto"
            });
        });
        $(object).prev().find(".feedView").empty().append("View Less ");
    }
    else {
        $(object).animate({
            height: defaultSize
        }, 500);
        $(object).prev().find(".feedView").empty().append("View All ");
    }
    
}

function updateFeedNumber(updateObj, countObj, defaultNum){
    if (!updateObj) 
        return;
    if (!defaultNum) 
        defaultNum = 0;
    if ($(updateObj).length < 1) {
        updateObj = $("#" + updateObj);
    }
    if ($(countObj).length < 1) {
        countObj = $("#" + countObj);
    }
    
    var numLeft = $(countObj).children().not(".hidden").length;
    
    if (numLeft <= defaultNum) {
        $(updateObj).find(".feedView").empty().append("");
        $(countObj).css({
            height: "auto"
        });
    }
    $(updateObj).find(".feedNumber").empty().append("" + numLeft);
    
    
}

function sp_trim(text){
    return (text || "").replace(/^\s+|\s+$/g, "");
}

function sp_getCookie(name){
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

function sp_killCookie(name){
    document.cookie = name + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT";
}

function inlinefocus(){
    $("#TB_window").find("input:text:visible:enabled:first").not(".noinitialFocus").focus();
    $("#TB_window").find("input:password:visible:enabled:first").not(".noinitialFocus").focus();
    $("#TB_window").find(".initialfocus:visible").focus();
}

function submitFieldOnEnter(){
    $('#passwd').keypress(function passEnter(e){
        if (e.which == 13) {
            document.passwordForm.submit();
        }
    });
}

function unbindSubmitOnEnter(){
    $('#passwd').unbind('keypress');
}

function changeCategory(who){
    $("#TB_window .asPList").hide();
    if (who === "Most Popular") {
        $("#TB_window .IDasMostPopular").show();
    }
    else if (who === "Financial") {
        $("#TB_window .IDasFinance").show();
    }
    else if (who === "Travel &amp; Shopping") {
        $("#TB_window .IDasRewards").show();
    }
    else if (who === "Email &amp; Social") {
        $("#TB_window .IDasEmail").show();
    }
    else if (who === "Other") {
        $("#TB_window .IDasOther").show();
    }
    waitCursor(false);
}

function waitCursor(working){
    if (working) {
        $("body").css("cursor", "wait")
    }
    else {
        $("body").css("cursor", "")
    }
}

function sendComment(){
    var description = $("#description").val();
    if (description !== "") {
        SP.api.logFeedback(description, function(header, data){
            $('#feedbackMsg').html("Thank you for your feedback!").removeClass("clean-error").addClass("clean-msg").show();
            $('#description').val("");
        })
    }
    else {
        $('#feedbackMsg').html("Please type your feedback in the box.").removeClass("clean-msg").addClass("clean-error").show();
    }
    setTimeout("$('#feedbackMsg').hide()", 6000);
}

function sendCommentPopup(){
    var description = $("#inlineDescription").val();
    if (description !== "") {
        SP.api.logFeedback(description, function(header, data){
            $('#inlineDescription').val("");
        })
        tb_remove();
    }
    else {
        $('#feedbackMsgPopup').html("Please type your feedback in the box.").removeClass("clean-msg").addClass("clean-error").show();
    }
    setTimeout("$('#feedbackMsgPopup').hide()", 3000);
}

function alertUser(title, body, footer, width){
    if (!title) 
        title = "Alert";
    if (!body) 
        return;
    if (body.substring(0, 1) === "#" || body.substring(0, 1) === ".") 
        body = $(body).html();
    if (!footer) 
        footer = $("#tmplAlertFrg .footer .generic").html();
    if (footer.substring(0, 1) === "#" || footer.substring(0, 1) === ".") 
        footer = $(footer).html();
    if (!width) 
        width = "550";
    
    var output = replaceTmpl($("#tmplAlertBase").html(), ["title", title, "body", body, "footer", footer], "g");
    $("#TB_alertUser").empty().append(output);
    tb_show(null, "#TB_inline?height=auto&width=" + width + "&inlineId=TB_alertUser&modal=true", null);
}

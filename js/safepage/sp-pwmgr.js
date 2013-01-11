$(document).ready(function(){


});


/*
 * Displaying bookmarks
 */
var pwm = {
    moreInfo: function(userSiteId){
        var t = null;
        $("#pwmLink" + userSiteId).addClass("pwmISelect");
        if ($("#pwmInfo" + userSiteId).css("display") === "none") {
            $(".pwmInfo").each(function(){
                if ($(this).css("display") != "none") {
                    t = this;
                    return;
                }
            });
            if (t !== null && t !== $("#pwmInfo" + userSiteId)) {
                var lastId = $(t).attr("id").replace("pwmInfo", "");
                closeProvider($(t).siblings().find("a.nooutline"), null);
                $(t).slideUp(250, function(){
                    pwm.hideUserPass(lastId, false);
                    $("#pwmInfo" + userSiteId).slideDown(250);
                });
                
                $("#pwmLink" + lastId).removeClass("pwmISelect");
            }
            else {
                $("#pwmInfo" + userSiteId).slideDown(250);
            }
        }
        else {
            $("#pwmInfo" + userSiteId).slideUp(250, function(){
                pwm.hideUserPass(userSiteId, false);
            });
            $("#pwmLink" + userSiteId).removeClass("pwmISelect");
        }
    },
    
    showUserPass: function(userSiteId){
        if (userSiteId === 0) {
            showSitePass($('#editBookmarkId').val(), $("#upPass" + userSiteId).val());
        }
        else {
            SP.api.getBookmarkCredentials(userSiteId, $("#upPass" + userSiteId).val(), function(header, data){
                if (typeof data.inputErrors !== "undefined" && data.inputErrors !== "") {
                    $('#passInstTitle' + userSiteId).empty().prepend("<div id='pwmPassError' class='errorcolor floatit'>Password Incorrect</div>");
                    $("#upPass" + userSiteId).focus(function(){
                        $("#upPass" + userSiteId).unbind().removeClass('formerror').val('');
                        $('#passInstTitle' + userSiteId).empty().prepend("<b>SafePage Password</b>");
                    }).addClass('formerror');
                    return;
                }
                
                if (data.LOGIN === undefined) {
                    data.LOGIN = 'Not set';
                }
                
                if (data.PASSWORD === undefined) {
                    data.PASSWORD = 'Not set';
                }
                
                $('#hidePassControl' + userSiteId).show();
                $('#userPass' + userSiteId).hide(0, function(){
                    $('#userPass' + userSiteId).empty();
                }).before(replaceTmpl($("#frgPWMINFO .siteInfo .showPass").html(), ["username", data.LOGIN, "password", data.PASSWORD, "userSiteId", userSiteId], "g"));
                
            }, function(message){
                $('#passInstTitle' + userSiteId).empty().prepend("<div id='pwmPassError' class='errorcolor floatit'>" + message + "</div>");
                $("#upPass" + userSiteId).focus(function(){
                    $("#upPass" + userSiteId).unbind().removeClass('formerror').val('');
                    $('#passInstTitle' + userSiteId).empty().prepend("<b>SafePage Password</b>");
                }).addClass('formerror');
            });
        }
    },
    
    hideUserPass: function(userSiteId, anim){
        $('#pwmLogin' + userSiteId).empty().remove();
        if (anim) {
            $('#userPass' + userSiteId).slideUp(250, function(){
                $('#userPass' + userSiteId).empty();
                if ($('#secure').val() === 'true') {
                    $('#showPassControl' + userSiteId).removeClass('hidePass');
                }
            });
        }
        else {
            $('#userPass' + userSiteId).empty().css({
                display: "none"
            });
            if ($('#secure').val() === 'true') {
                $('#showPassControl' + userSiteId).removeClass('hidePass');
            }
        }
        if (userSiteId === 0) {
            hideLink();
        }
    },
    
    askPass: function(userSiteId, anim){
        if ($("#showPassControl" + userSiteId).is(".hidePass")) {
            pwm.hideUserPass(userSiteId, true);
        }
        else {
            $('#pass' + userSiteId).empty().append("Please Authenticate");
            $('#showPassControl' + userSiteId).addClass('hidePass');
            var passwordField = replaceTmpl($("#frgPWMINFO .siteInfo .askPass").html(), ["userSiteId", userSiteId], "g");
            if (!anim) {
                $('#userPass' + userSiteId).empty().append(passwordField).show();
                setTimeout("$('#upPass" + userSiteId + "').focus();", 600);
            }
            else {
                $('#userPass' + userSiteId).empty().append(passwordField).slideDown(250, function(){
                    setTimeout("$('#upPass" + userSiteId + "').focus();", 1);
                });
            }
        }
    }
    
};

var BookmarksForLogin = {
    initialize: function(){
        var data = $("#jsonUserSites").text();
        var userSites;
        if (data) {
            userSites = JSON.parse(data);
        }
        if (userSites) {
            BookmarksForLogin.removeRows();
            BookmarksForLogin.toHeader();
            $.each(userSites.root, function(i, userSite){
                BookmarksForLogin.addRow(userSite);
            });
            prepPWMTips();
        }
    },
    toTable: function(sortColumn, sortType){
		// Check to see if there is an open drawer
		if($(".openDwr").length > 0)
    	{
    		//alert("open drawer");
    	}
		
        SP.api.getBookmarks(sortColumn, sortType, true, function(header, data){
            BookmarksForLogin.removeRows();
            BookmarksForLogin.toHeader();
            if (data) {
	            $.each(data.root, function(i, data){
	                BookmarksForLogin.addRow(data);
	            });
            }
        });
    },
    toHeader: function(){
    },
    addRow: function(data){
        // flags
        var secureSession = $('#secure').val() === 'true';
        
        if (!data.flags) {
        	data.flags = new Object();
        }
        var invalidCredential = data.flags.showInvalidCredentialWarning;
        var disableLogin = data.flags.showInvalidCredentialError;
        var verifyingCredential = data.flags.showVerifyingCredential;
        var unsupported = data.loginTypeName === 'UNSUPPORTED';
        var noAutologin = data.loginTypeName === 'NONE';
        var showPassword = secureSession && data.flags.showSitePassword;
        var autologinLink = data.flags.autoLoginSupported;
        var remindSitePassword = data.flags.remindSitePassword || data.flags.doNotAskRemindSitePasswordQuestion === false;
        var doNotAskRemindSitePasswordQuestion = true;
        
        // plugin flags
        var needYodleePlugin = autologinLink && data.loginTypeName === 'YODLEE' && data.yodleeType === 3;
        var needSessionXfer = autologinLink && data.loginTypeName === 'CLIENT_SESSION_XFER' || data.loginTypeName === 'SERVER_BROWSER';
        var downloadIEPlugin_Type3 = (needYodleePlugin && $.browser.browser === "MSIE" && checkYodleePlugin() !== true);
        var downloadIEPlugin_Type9 = (needSessionXfer && checkYodleePlugin() !== true && $.browser.browser === "MSIE");
        var downloadIEPlugin = downloadIEPlugin_Type3 || downloadIEPlugin_Type9;
        var downloadIEPluginImpossible = (needYodleePlugin && $.browser.browser !== "MSIE");
		var unsupportedSafariPlugin =(needSessionXfer && $.browser.browser === "Safari");
        var downloadFFPlugin = (needSessionXfer && $("#safePageXferPlugin").val() === "false" && $.browser.browser === "Firefox");
        
        // data
        var name = data.userSiteName;
        var userSiteId = data.userSiteId;
        var session = data.session;
        var url = data.userSiteUrl;
        var shortURL = url.replace("http://", "").replace("https://", "").replace("www.", "");
        var loginUrl = data.loginUrl;
        var accounts = data.accounts;
        var accessed = data.accessed;
        if (!accessed) {
            accessed = "Not Accessed";
        }
        
        // handle hover effect
        $("#pwmLink" + userSiteId).hover(function(){
            $(this).addClass("hov");
        }, function(){
            $(this).removeClass("hov");
        });
        
        // handle name   
        var shortname;
        var needTips = "";
        var title = "";
        if (name) {
            if (name.length > 24) {
                shortname = name.substring(0, 24) + "..";
                needTips = "tips";
                title = name;
            }
            else {
                shortname = name;
                needTips = "";
                title = "";
            }
        }
        
        // handle template Replacement
        var output = $("#basePWM").html();
        
        //Set secure or remembered mode edit button
        if ($('#secure').val() === 'true') {
            output = replaceTmpl(output, ["editButton", "#frgPWMINFO .editButton"], "g");
        }
        else {
            output = replaceTmpl(output, ["editButton", "#frgPWMINFO .editButtonChallenge"], "g");
        }
        
        //Set Show Password Button           
        if (showPassword) { // if Secure Site & logged in
            var username = "error";
            if (data.LOGIN !== "") {
                username = data.LOGIN;
            }
            output = replaceTmpl(output, ["login", "#frgPWMINFO .siteInfo .login", "username", username], "g");
        }
        else { // they are logged out or site has no username and password dont show password options
            output = replaceTmpl(output, ["login", "#frgPWMINFO .siteInfo .loginDisabled"], "g");
        }
        
        //handle Error Messages
        var errorMessageCode = data.errorMessageCode;
        if (typeof errorMessageCode !== "undefined" && errorMessageCode !== 0) {
            var errorType;
            if (errorMessageCode === 1) {
                errorType = "PASSWORD_EXPIRED";
            }
            else 
                if (errorMessageCode === 2) {
                    errorType = "ACCOUNT_LOCKED";
                }
                else 
                    if (errorMessageCode === 4) {
                        errorType = "ACCOUNT_CANCELLED";
                    }
                    else 
                        if ((errorMessageCode === 5 || errorMessageCode === 6) && invalidCredential) {
                           	errorType = "AGGREGATION_FAILED";
                        }
                        else 
                            if (errorMessageCode === 7 || errorMessageCode === 0) {
                                errorType = "AGGREGATION_FAILED_SCHEDULED";
                            }
                            else 
                                if ((errorMessageCode === 5 || errorMessageCode === 6) && invalidCredential === false) {
                                    errorType = "AGGREGATION_FAILED_INVESTIGATING";
                                }
                                else {
                                    output = replaceTmpl(output, ["addError", ""], "g");
                                }
            output = replaceTmpl(output, ["addError", "#frgPWMINFO .invalid", "error", "#frgPWMError ." + errorType], "g");
        }
        else {
            output = replaceTmpl(output, ["addError", ""], "g");
        }
        
        if (disableLogin) { // If invalid credentials
            output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .invalid", "nameLink", "#frgPWM .link .invalid"], "g");
        }
        else 
            if (invalidCredential) { // If invalid credentials
                if (showPassword) {
                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .warn", "nameLink", "#frgPWM .link .invalidCredential"], "g");
                }
                else {
                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .warn", "nameLink", "#frgPWM .link .bookmark"], "g");
                }
            }
            else {
                if (unsupported) { // If not supported (act like a regular bookmark)            	
                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"], "g");
                }
                else {
                    if (autologinLink) { // Autologin is generally supported
                        if (downloadIEPluginImpossible || unsupportedSafariPlugin) { //Not IE so can't use plugin
                            if (doNotAskRemindSitePasswordQuestion) {
                                if (remindSitePassword) {
                                    if (showPassword) {
                                        output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .remindPassword"]);
                                    }
                                    else {
                                        output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                    }
                                }
                                else {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                }
                            }
                            else {
                                if (showPassword) {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .unsupported"]);
                                }
                                else {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                }
                            }
                        }
                        else 
                            if (downloadIEPlugin) { //Ask User To Download IE Plugin
                                output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .autoLogin", "nameLink", "#frgPWM .link .downloadIE"], "g");
                            }
                            else 
                                if (downloadFFPlugin) { //Ask User To Download FF Plugin
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .autoLogin", "nameLink", "#frgPWM .link .downloadFF"], "g");
                                }
                                else { //Can autoLogin 
										output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .autoLogin", "nameLink", "#frgPWM .link .autoLogin"], "g");
                                }
                    }
                    else {
                        if (showPassword) { // If regular bookmark with credentials
                            if (doNotAskRemindSitePasswordQuestion) {
                                if (remindSitePassword) {
                                    if (showPassword) {
                                        output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .remindPassword"]);
                                    }
                                    else {
                                        output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                    }
                                }
                                else {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                }
                            }
                            else {
                                if (showPassword) {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .unsupported"]);
                                }
                                else {
                                    output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"]);
                                }
                            }
                        }
                        else { // Regular Bookmark                           
                            output = replaceTmpl(output, ["imgTick", "#frgPWM .tick .bookmark", "nameLink", "#frgPWM .link .bookmark"], "g");
                        }
                    }
                }
            }
        
        output = replaceTmpl(output, ["userSiteId", userSiteId, "name", name, "shortname", shortname, "needTips", needTips, "title", title, "url", url, "shortURL", shortURL, "session", session, "window.SP.csrf", session + "&csrf=" + window.SP.csrf], "g");
        
        $("#bookmarks_table").append(output);
        if (disableLogin) { //Bind on click behavior for error site and add class to make cursor change
            $("#pwmLink" + userSiteId).addClass("changecursor").click(function(){
                pwm.moreInfo(userSiteId);
            });
        }
        
        // handle extra info base
        output = $("#basePWMInfo").html();
        
        //URL, Last Login & Phone Number
        var phone = "";
        var variableURL = url;
        if (variableURL.length > 25) {
            variableURL = shortURL;
        }
        if (data.phone && typeof data.phone !== "undefined") {
            output = replaceTmpl(output, ["URL", url, "shortURL", shortURL, "variableURL", variableURL, "phone", "#frgPWMINFO .siteInfo .phone", "phoneNum", data.phone, "lastLogin", accessed], "g");
        }
        else {
            output = replaceTmpl(output, ["URL", url, "shortURL", shortURL, "variableURL", variableURL, "phone", "", "lastLogin", accessed], "g");
        }
        
        //handle balances
        if (accounts && showPassword && accounts[0] && accounts[0].summaryName && typeof accounts[0].summaryBalance != "undefined") {
            var sbData = "";
            var base = $("#frgPWMINFO .siteBalances .balance").html();
            $.each(accounts, function(i, account){
                if (account && account.summaryName && typeof account.summaryBalance != "undefined") {
                    var accountTitle = "";
                    if (account.summaryName.length > 15) {
                        var summaryName = account.summaryName.substring(0, 15);
                        accountTitle = account.summaryName;
                    }
                    else {
                        var summaryName = account.summaryName;
                    }
                    var formatBalanceCommas = null;
                    
                    if (account.summaryCurrency === "USD") {
                        if (account.summaryBalance.toFixed) 
                            account.summaryBalance = account.summaryBalance.toFixed(2);
                        var addDollar = null;
                        if (account.summaryBalance.toString().charAt(0) === "-") {
                            addDollar = "-" + "$" + account.summaryBalance.toString().substring(1, account.summaryBalance.toString().length)
                        }
                        else {
                            if (account.summaryBalance !== "0.00") {
                                addDollar = "$" + account.summaryBalance;
                            }
                            else {
                                addDollar = "$<span>0.00</span>"; //fixes bug in safari where $0 wouldnt work correctly
                            }
                        }
                        formatBalanceCommas = addCommas(addDollar);
                    }
                    else {
                        formatBalanceCommas = addCommas(account.summaryBalance.toString());
                    }
                    
                    sbData += replaceTmpl(base, ["accountName", $("#frgPWMINFO .siteBalances .accountName").html(), "accountId", account.summaryId, "accountName", summaryName, "accountTitle", accountTitle, "accountBalance", formatBalanceCommas], "g");
                }
            });
            output = replaceTmpl(output, ["balances", "#frgPWMINFO .siteBalances .base", "sbData", sbData], "g");
        }
        else {
            output = replaceTmpl(output, ["balances", ""], "g");
        }
        
        //handle last data update
        if (data.yodleeType && showPassword) {
            output = replaceTmpl(output, ["lastDataUpdate", "#frgPWMINFO .updateBase"], "g");
            var lastDataUpdate = data.lastRefreshed;
            
            if (data.status === 0) { // completed
                if (typeof data.lastRefreshed === "undefined") {
                    lastDataUpdate = "Not Updated";
                }
                
                // output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .refresh"], "g");
                output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
            }
            else 
                if (data.status === 3 || data.status === 1) { // Verifying data or started to verify data
                    if (typeof data.lastRefreshed === "undefined") {
                        lastDataUpdate = "Processing";
                    }
                    
                    //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .updating"], "g");
                    output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                }
                else 
                    if (data.status === 2) { // Account not found
                        if (typeof data.lastRefreshed === "undefined") {
                            lastDataUpdate = "Not Updated";
                        }
                        
                        //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
                        output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                    }
                    else 
                        if (data.status === 4) { // Invalid credentials
                            if (typeof data.lastRefreshed === "undefined") {
                                lastDataUpdate = "Not Updated";
                            }
                            
                            //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
                            output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                        }
                        else 
                            if (data.status === 5) { // Verification failed
                                if (typeof data.lastRefreshed === "undefined") {
                                    lastDataUpdate = "Scheduled";
                                }
                                
                                //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .refresh"], "g");
                                output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                            }
                            else 
                                if (data.status === 6) { // User action required
                                    if (typeof data.lastRefreshed === "undefined") {
                                        lastDataUpdate = "Not Updated";
                                    }
                                    
                                    //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
                                    output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                                }
                                else 
                                    if (data.status === 8) { // Registration failed
                                        if (typeof data.lastRefreshed === "undefined") {
                                            lastDataUpdate = "Not Updated";
                                        }
                                        
                                        //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
                                        output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                                    }
                                    else { // should not happen
                                        if (typeof data.lastRefreshed === "undefined") {
                                            lastDataUpdate = "Not Updated";
                                        }
                                        
                                        //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
                                        output = replaceTmpl(output, ["updated", lastDataUpdate], "g");
                                    }
        }
        else {
            //output = replaceTmpl(output, ["refreshIcon", "#frgPWMINFO .refreshIcon .nothing"], "g");
            output = replaceTmpl(output, ["lastDataUpdate", ""], "g");
        }
        
        //Write Output
        output = replaceTmpl(output, ["userSiteId", userSiteId], "g");
        $("#pwmInfo" + userSiteId + " #pwmCTRL" + userSiteId).after(output);

        //Temporary POC Seals Code
	        if (typeof data.certSealName !== "undefined") {
	        	// Chris to add different seals for different cert authorities
	        	$(".seals" + userSiteId).show();
	        	if (typeof data.certSealUrl !== "undefined") {
	        		$(".seals" + userSiteId + " a").attr("href", data.certSealUrl);
	        	}
	        }	
        //END Temporary POC Seals Code
        
    },
    removeRows: function(){
        $("#bookmarks_table").empty();
    },
    updateBookmarkAccess: function(userSiteId){
        SP.api.updateBookmarkAccess(userSiteId, function(header, data){
        });
    },
    updateUserSiteFlags: function(userSiteId, userSiteFlags, rewrite){
        SP.api.updateUserSiteFlags(userSiteId, userSiteFlags, function(header, data){
            if (rewrite) {
                BookmarksForLogin.toTable();
            }
        });
    },
    displayErrors: function(message){
        $("#autologinErrors").replace(message);
    }
};

function clearCredentialsDialog(){
    tb_remove();
    $('#bookmarkCredentials').html("");
    $('#spPassword').val("");
}

function dontShowAgain(userSiteId){
    if ($("#unsupportDontShow").is(".checked")) {
        BookmarksForLogin.updateUserSiteFlags(userSiteId, "N", true);
        var url = $("#siURLLink" + userSiteId).attr("href");
        $("#pwmTick" + userSiteId).next().attr({
            href: url,
            target: "_blank"
        });
        $("#pwmTick" + userSiteId).next().click(function(){
            BookmarksForLogin.updateBookmarkAccess(userSiteId);
        });
    }
}

function fetchCredentials(userSiteId, spPassword){
    if (!userSiteId) {
        userSiteId = $("#userSiteId").val();
    }
    if (!spPassword) {
        spPassword = $("#spPassword").val();
    }
    
    SP.api.getBookmarkCredentials(userSiteId, spPassword, function(header, data){
        if (typeof data.inputErrors !== "undefined" && data.inputErrors !== "") {
            $("#bookmarkCredentials").hide();
            
            $("#credentialsErrorMessage").html(message);
            $("#credentialsError").show();
            return;
        }
        
        $("#credentialsError").hide();
        
        if (data.LOGIN === undefined) {
            data.LOGIN = 'Not set';
        }
        if (data.PASSWORD === undefined) {
            data.PASSWORD = 'Not set';
        }
        
        $("#bookmarkUsername").html(data.LOGIN);
        $("#bookmarkPassword").html(data.PASSWORD);
        
        $("#bookmarkCredentials").show();
    }, function(message){
        $("#bookmarkCredentials").hide();
        
        $("#credentialsErrorMessage").html(message);
        $("#credentialsError").show();
    });
}

function remindCredentialsBeforeLogin(userSiteId, step){
    var spPassword = $('#TB_window #remindPassCheck').val();
    
    if (typeof spPassword === "undefined" || spPassword === "") {
        showPasswordError("Password Required", "#TB_window .spPasswordLabel", "#TB_window #remindPassCheck");
        return;
    }
    
    SP.api.getBookmarkCredentials(userSiteId, spPassword, function(header, data){
        if (typeof data.inputErrors !== "undefined" && data.inputErrors !== "") {
            showPasswordError("Incorrect Password", "#TB_window .spPasswordLabel", "#TB_window #remindPassCheck");
            return;
        }
        
        if (data.LOGIN === undefined) {
            data.LOGIN = 'Not set';
        }
        if (data.PASSWORD === undefined) {
            data.PASSWORD = 'Not set';
        }
        $("#TB_window .remindDataUser").empty().append(data.LOGIN);
        $("#TB_window .remindDataPass").empty().append(data.PASSWORD);
        
        $("#TB_window .IDremindPass1").hide();
        $("#TB_window .IDremindPass2").show();
        $("#TB_window .IDprClickCont").show();
        cCredStep(step);
    }, function(message){
        showPasswordError(message, "#TB_window .spPasswordLabel", "#TB_window #remindPassCheck");
    });
}

function clearReminderPasswords(){
    $("#TB_window .remindDataPass").empty();
    $("#TB_window .remindDataUser").empty();
}

function alertAutoLoginIssue(type, userSiteId, session, url, title, name){
    if (type === "iePlugin") {
        var pluginIEDiv = "<div class='basic'>To auto-log you into " + name + ", SafePage needs to download an additional security plugin for your browser.  If you do not want to download the plugin now, you may continue to <a href='" + url + "' target='_blank'  onclick='BookmarksForLogin.updateBookmarkAccess(" + userSiteId + ")' title='" + title + "' class='' >" + name + "</a><div>";
        var pluginIEButtons = "<div style='float: left'><a class='secondarybutton' target='_blank' href='" + url + "' onclick='BookmarksForLogin.updateBookmarkAccess(" + userSiteId + ");tb_remove();'><span>Go To Site<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div style='float: right'><a class='primarybutton' href='../getPlugin/SafePageSetupDebug.msi' onclick='schedulePluginCheck(" + userSiteId + ", \"" + name + "\");tb_remove();'><span>Download<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div style='float: right'><a class='secondarybutton buttontoright' href='javascript: void(0);' onclick='tb_remove();'><span>Cancel<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div class='clearfloat'></div>";
        $("#TB_IE_PLUGIN").find(".TB_body").empty().append(pluginIEDiv);
        $("#TB_IE_PLUGIN").find(".TB_footer").empty().append(pluginIEButtons);
        tb_show("Plugin Required", "#TB_inline?height=auto&width=504&inlineId=TB_IE_PLUGIN&modal=true", null);
    }
    else 
        if (type === "ffPlugin") {
            var pluginFFDiv = "<div class='basic'>To auto-log you into " + name + ", SafePage needs to download an additional security plugin for your browser.  If you do not want to download the plugin now, you may continue to " + name + " using our secure servers.<div>";
            var pluginFFButtons = "<div style='float: left'><a class='secondarybutton' target='_blank' href='" + url + "' onclick='tb_remove();'><span>Go To Site<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div style='float: right'><a class='primarybutton' href='../getPlugin/safepage.xpi' onclick='tb_remove();'><span>Download<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div style='float: right'><a class='secondarybutton buttontoright' href='javascript: void(0);' onclick='tb_remove();'><span>Cancel<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div class='clearfloat'></div>";
            $("#TB_FF_PLUGIN").find(".TB_body").empty().append(pluginFFDiv);
            $("#TB_FF_PLUGIN").find(".TB_footer").empty().append(pluginFFButtons);
            tb_show("Plugin Required", "#TB_inline?height=auto&width=504&inlineId=TB_FF_PLUGIN&modal=true", null);
        }
        else 
            if (type === "invalidCredential") {
                var oneClickLogin = "page/autologin/start?session=" + session + "&csrf=" + window.SP.csrf;
                
                var output = $("#tmplAlertFrg .body .confirmCred").html();
                output = replaceTmpl(output, ["userSiteId", userSiteId, "formName", "cCredEditActive", "url", url], "g");
                
                var outputFooter = $("#tmplAlertFrg .footer .confirmCred").html();
                outputFooter = replaceTmpl(outputFooter, ["userSiteId", userSiteId, "oneClickLogin", oneClickLogin], "g");
                alertUser(name + " Troubleshooting", output, outputFooter, "654");
            }
            else 
                if (type === "unsupported") {
                    var output = $("#tmplAlertFrg .body .noOneClick").html();
                    output = replaceTmpl(output, ["userSiteId", userSiteId], "g");
                    output = replaceTmpl(output, ["userSiteName", name], "g");
                    output = replaceTmpl(output, ["siteUrl", url], "g");
                    alertUser(name + " Login Options", output, "#tmplAlertFrg .footer .noOneClick", "654");
                }
                else 
                    if (type === "remindPassword") {
                        var output = $("#tmplAlertFrg .body .remindPassword").html();
                        output = replaceTmpl(output, ["userSiteId", userSiteId], "g");
                        output = replaceTmpl(output, ["userSiteName", name], "g");
                        output = replaceTmpl(output, ["siteUrl", url], "g");
                        
                        var outputFooter = $("#tmplAlertFrg .footer .remindPassword").html();
                        outputFooter = replaceTmpl(outputFooter, ["userSiteId", userSiteId, "siteUrl", url], "g");
                        alertUser("One-Click Login Unsupported: " + name, output, outputFooter, "654");
                    }
}

function alertAggregationIssue(userSiteId){
    SP.api.getBookmark(userSiteId, function(header, data){
        var userActionRequired = data.flags && data.flags.userActionRequired === true;
        var basicCredentialsValidated = data.flags && data.flags.basicCredentialsValidated === true;
        var hasChallengeQuestions = data.flags && data.flags.hasChallengeQuestions === true;
        var extraCredentialsValidated = data.flags && data.flags.extraCredentialsValidated === true;
        
        var output = $("#tmplAlertFrg .body .fixAggregation").html();
        var outputFooter = $("#tmplAlertFrg .footer .fixAggregation").html();
        
        var nextStepIfPassCorrect = "";
        var nextStepAfterPassCorrected = "";
        var nextStepAfterCQCorrected = "";
        var nextStepAfterInvestigation = "cSetInvestigation(" + userSiteId + ");";
        var nextStepAfterCQConfirmed = "5";
        
        var step = 1;
        if (userActionRequired) {
            step = 0;
        }
        
        // if password is verified
        if (basicCredentialsValidated === true) {
            if (hasChallengeQuestions && extraCredentialsValidated === false) {
                if (userActionRequired === false) {
                    step = 4;
                }
                
                nextStepAfterCQCorrected = "tb_remove";
            }
            else {
                cCredCorrect(userSiteId, false);
                
                if (userActionRequired === false) {
                    step = 5;
                }
            }
        }
        // if password is not verified
        else {
            output = replaceTmpl(output, ["formName", "cCredEditActive"], "g"); //Activate Form
            if (hasChallengeQuestions === true && extraCredentialsValidated === false) {
                nextStepIfPassCorrect = "cCredStep(4);";
                nextStepAfterPassCorrected = "cCredStep(4);";
                nextStepAfterCQCorrected = "tb_remove";
            }
            else {
                nextStepIfPassCorrect = "cCredStep(5);";
                nextStepAfterPassCorrected = "tb_remove();";
            }
        }
        
        if (hasChallengeQuestions && extraCredentialsValidated === false) {
            var challengeQuestions = processFields(data.extraFields, "", 1);
            output = replaceTmpl(output, ["cFormName", "cChallengeEditActive", "challengeQuestions", challengeQuestions], "g");
        }
        output = replaceTmpl(output, ["userSiteId", userSiteId, "url", data.userSiteUrl, "name", data.userSiteName], "g");
        outputFooter = replaceTmpl(outputFooter, ["userSiteId", userSiteId, "nextStepIfPassCorrect", nextStepIfPassCorrect, "nextStepAfterPassCorrected", nextStepAfterPassCorrected, "nextStepAfterCQCorrected", nextStepAfterCQCorrected, "nextStepAfterInvestigation", nextStepAfterInvestigation, "nextStepAfterCQConfirmed", nextStepAfterCQConfirmed], "g");
        
        alertUser(data.userSiteName + " Troubleshooting", output, outputFooter, "788");
        
        switchButton = function(){
            $("#TB_window .IDfixAggregationCorrect").hide();
            $("#TB_window .IDfixAggregationSave").show();
            $("#TB_window #cChallengeEditActive :input").unbind("focus", "cCredDirty");
        };
        
        $("#TB_window #cChallengeEditActive :input").unbind("focus", "cCredDirty").bind("focus", function cCredDirty(){
            $(this).bind("keyup", switchButton).bind("change", switchButton).bind("blur", function(){
                $(this).unbind("change").unbind("keyup");
            });
        });
        cCredStep(step);
    });
}

function setNo1ClickDeafult(flag, userSiteId, siteName, siteUrl){
    BookmarksForLogin.updateUserSiteFlags(userSiteId, "E" + flag, true);
    tb_remove();
    if (flag === "K") { // user chose to be reminded of password
        setTimeout(function(){
            alertAutoLoginIssue("remindPassword", userSiteId, "", siteUrl, "", siteName);
        }, 50);
    }
}

function gotoShowPassword(userSiteId){
    var inputShown = $("#userPass" + userSiteId).css("display");
    if ($("#pwmInfo" + userSiteId).css("display") === "none") {
        $("#pwmTick" + userSiteId).click();
        pwm.askPass(userSiteId, false);
    }
    else 
        if (inputShown === "none") {
            pwm.askPass(userSiteId, true);
        }
        else {
            setTimeout("$('#upPass" + userSiteId + "').focus();", 1);
        }
    dontShowAgain(userSiteId);
}

function requestRefresh(userSiteId){
    SP.api.refreshBookmark(userSiteId, function(header, data){
        $('#iconRefreshData' + userSiteId).empty().append("<img src='../images/anim_loading_13x13.gif' alt='L' title='Refreshing Data' />");
    });
}

function alertError(errorMessage){
    var errorDiv = "<div class='basic'>We are unable to add this bookmark because \"" + errorMessage + "\"<div>";
    var errorButtons = "<div style='float: right'><a class='secondarybutton buttontoright' href='javascript: void(0);' onclick='JavaScript:location.reload(true);'><span>Continue<br /><img src='./images/spacer.gif' width='70' height='1' /></span></a></div><div class='clearfloat'></div>";
    $("#TB_ERROR").find(".TB_body").empty().append(errorDiv);
    $("#TB_ERROR").find(".TB_footer").empty().append(errorButtons);
    tb_show(errorMessage, "#TB_inline?height=auto&width=454&inlineId=TB_ERROR&modal=true", null);
}

$.fn.clearForm = function(){
    return this.each(function(){
        var type = this.type, tag = this.tagName.toLowerCase();
        if (tag == 'form') 
            return $(':input', this).clearForm();
        if (type == 'text' || type == 'password' || tag == 'textarea') 
            this.value = '';
        else 
            if (type == 'checkbox' || type == 'radio') 
                this.checked = false;
            else 
                if (tag == 'select') 
                    this.selectedIndex = -1;
    });
};

function hideLink(newPass, passId){
    //$('#editUsername').val("***********");
    if (changedPassword === true) {
        $('#TB_window input[name=SP_PASS]').replace("<input type='password' size='20' class='noinitialFocus formnormal formsizemanage' id='" + passId + "' name='SP_PASS' value='" + newPass + "'  title='******' tabindex=4 />");
    }
    else {
        $('#TB_window input[name=SP_PASS]').replace("<input type='password' size='20' class='noinitialFocus formnormal formsizemanage' id='" + passId + "' name='SP_PASS' value='******'  title='******' tabindex=4 />");
    }
}

function showSitePass(userSiteId, inputValue){
    SP.api.getBookmarkCredentials(userSiteId, inputValue, function(header, data){
        if (typeof data.inputErrors !== "undefined" && data.inputErrors !== "") {
            showPasswordError("Incorrect Password", '#passInstTitle0', "#upPass0")
            return;
        }
        
        if (data.LOGIN === undefined) {
            data.LOGIN = 'Not set';
        }
        if (data.PASSWORD === undefined) {
            data.PASSWORD = 'Not set';
        }
        //$('.popup').hide();
        $("#TB_window #managePass").val("");
        
        // if ($('input[name=SP_PASS]').val() !== '') {
        var passId = $('input[name=SP_PASS]').attr("id");
        var passTitle = $('input[name=SP_PASS]').attr("title");
        if ($('input[name=SP_PASS]').val() === $('input[name=SP_PASS]').attr("title")) {
            $('input[name=SP_PASS]').replace("<input type='text' size='20' class='noinitialFocus formnormal formsizemanage' id='" + passId + "' name='SP_PASS' value='" + data.PASSWORD + "' tabindex=4 />");
            // Not sure about this change, need to think about it further
            changedPassword = true;
        }
        else {
            var newPass = $('input[name=SP_PASS]').val();
            $('input[name=SP_PASS]').replace("<input type='text' size='20' class='noinitialFocus formnormal formsizemanage' id='" + passId + "' name='SP_PASS' value='" + data.PASSWORD + "' tabindex=4 />");
            $('input[name=SP_PASS]').val(newPass);
            changedPassword = true;
        }
        //}
        if ($('#TB_window').css("display") === "block") {
            $('#TB_window #enterPassContent').empty();
        }
        else {
            $('#bookmarks_table #enterPassContent').empty();
        }
        $('#TB_window #showPassForEdit').hide();
    }, function(message){
        showPasswordError(message, '#passInstTitle0', "#upPass0")
    });
}

function showPasswordError(message, labelDivId, passwordInputId){
    $(labelDivId).empty().prepend("<b id='pwmPassError' class='errorcolor'>" + message + "</b>");
    $(passwordInputId).focus(function(){
        $().unbind().removeClass('formerror').val('');
        $(labelDivId).empty().prepend("<b>SafePage Password</b>");
    }).addClass('formerror');
}

/* 
 * Displaying bookmarks
 */
var verifySites = {
    initialize: function(){
        var data = $("#jsonUserSites").text();
        var userSites;
        if (data) {
            userSites = JSON.parse(data);
        }
        if (userSites) {
            BookmarksForLogin.toTable();
            verifySites.removeRows();
            $.each(userSites.root, function(i, data){
                verifySites.toRow(data.userSiteName, data.userSiteUrl, data.accessed, data.deviceName, "<span class='control'><a href='javascript:void(0)' id='editSiteLink' onclick='verifySites.editBookmark(" +
                data.userSiteId +
                ")'>Edit</a></span> | <span class='control'><a href='javascript:void(0);'  onclick='saveDeleteSiteData(" +
                data.userSiteId +
                "," +
                "\"" +
                escape(data.userSiteName) +
                "\"" +
                ")'>Delete</a></span>");
            });
        }
    },
    toTable: function(){
        SP.api.getBookmarks("updated", "DESC", false, function(header, data){
            BookmarksForLogin.toTable();
            verifySites.removeRows();
            $.each(data.root, function(i, data){
                verifySites.toRow(data.userSiteName, data.userSiteUrl, data.accessed, data.deviceName, "<span class='control'><a href='javascript:void(0)' id='editSiteLink' onclick='verifySites.editBookmark(" +
                data.userSiteId +
                ")'>Edit</a></span> | <span class='control'><a href='javascript:void(0);'  onclick='saveDeleteSiteData(" +
                data.userSiteId +
                "," +
                "\"" +
                escape(data.userSiteName) +
                "\"" +
                ")'>Delete</a></span>");
            });
        });
    },
    toRow: function(name, url, username, password, control){
        if (name) {
            if (name.length > 20) {
                name = "<label class='tips' title='" + name + "' >" + name.substring(0, 20) + "...</label>";
            }
        }
        if (url) {
            // Filter 'http://' or 'https://'
            if (url.substring(0, 5) === 'https') {
                url = url.substring(8, url.length);
            }
            if (url.substring(0, 4) === 'http') {
                url = url.substring(7, url.length);
            }
            
            if (url.length > 20) {
                url = "<label class='tips' title='" + url + "' >" + url.substring(0, 20) + "...</label>";
            }
        }
        $("#verificationBody").createAppend("tr", {}, ["td", {
            className: 'basic'
        }, "<div style='padding: 0 3px 0 3px'>" + name + "</div>", "td", {
            className: 'basic'
        }, url, "td", {
            className: 'basic'
        }, username, "td", {
            className: 'basic'
        }, password, "td", {
            align: 'right'
        }, control]);
    },
    removeRows: function(){
        $("#verificationBody").empty();
    },
    
    refreshBookmark: function(userSiteId){
    
        SP.api.refreshBookmark(userSiteId, function(header, data){
            verifySites.toTable();
        });
        
    },
    editBookmark: function(userSiteId){
        SP.api.getBookmark(userSiteId, function(header, data){
            $("#TB_editSite").empty().append($("#frgEditSite .esBaseHeader").contents().clone());
            $("#TB_editSite .esBodyContent").append($("#tmplAddSite .IDasEditSite").clone());
            $("#TB_editSite .ASFooter").append($("#frgEditSite .esSaveControls").contents().clone());
            populateLoginInfo(data, true);
            bindEditSite(data.userSiteId, data.userSiteName);
            $("#TB_editSite .IDInlineTitle").empty().append("Edit Site");
            tb_show("Edit Site", "#TB_inline?height=auto&width=925&inlineId=TB_editSite&modal=true", null);
            
        });
    },
    removeBookmark: function(userSiteId){
        SP.api.removeBookmark(userSiteId, function(header, data){
            self.location = "/";
        });
    }
};

function managePass(userSiteId){
    var passwordField = "<form id='pwmSubmitPassword" + userSiteId + "' action='javascript: pwm.showUserPass(" + userSiteId + ", true);' name='pwmSubmitPassword" + userSiteId + "'><div id='enterPass' class='passBox'><div id='enterPassContent'><div id='enterPassInstruct'><div class='floatit' id='passInstTitle" + userSiteId + "'><b>Enter SafePage Password</b></div><div class='floatright control hidden'><a href='javascript: void(0);'>Why?</a></div><div class='clearfloat'></div></div><div class='sectiontitlespacer'><input class='password formnormal formphonesize' type='password' id='upPass" + userSiteId + "'  name='upPass" + userSiteId + "' /></div><div class='control' id='showPassCtrls' align='right'><a href='javascript: void(0);' onclick='manageHidePass(" + userSiteId + ", true)'>Cancel</a> | <a href='javascript: void(0);' onclick='document.pwmSubmitPassword" + userSiteId + ".submit(); return false;'>Submit</a></div></div></div></form>";
    $('#TB_window #userPass' + userSiteId).empty().append(passwordField).show();
    $('#TB_window #showPassForEdit').slideDown(250, function(){
        setTimeout("$('#TB_window #upPass" + userSiteId + "').focus();", 1);
    });
    $('#TB_window #showUPButton' + userSiteId).empty().append("<a id='showHide" + userSiteId + "' href='javascript: void(0);' onclick='manageHidePass(" + userSiteId + ", true);' >Hide Password</a>");
}

function manageHidePass(userSiteId, anim){
    if (anim) {
        $('#TB_window #userPass' + userSiteId).slideUp(250, function(){
            $('#TB_window #userPass' + userSiteId).empty();
        });
        $('#TB_window #addPass' + userSiteId).empty().append("********");
        if ($('#secure').val() === 'true') {
            $('#TB_window #showUPButton' + userSiteId).empty().append("<a id='showHide" + userSiteId + "' href='javascript: void(0);' onclick='managePass(" + userSiteId + ");' >Show Password</a>");
        }
    }
    else {
        $('#TB_window #userPass' + userSiteId).css({
            display: "none"
        });
        $('#TB_window #userPass' + userSiteId).empty();
        if ($('#secure').val() === 'true') {
            $('#TB_window #showUPButton' + userSiteId).empty().append("<a id='showHide" + userSiteId + "' href='javascript: void(0);' onclick='managePass(" + userSiteId + ");' >Show Password</a>");
        }
    }
    if (userSiteId === 0) {
        $('#TB_window #showPassForEdit').hide();
        var newPass = $('#TB_window input[name=SP_PASS]').val();
        var passId = $('#TB_window input[name=SP_PASS]').attr("id");
        hideLink(newPass, passId);
    }
    
}

function setLocation(location){
    $('#nextPageFlow').val(location);
    if (location === '/pop/addSites') {
        $('#addSitePopup').val("true");
    }
    else {
        $('#addSitePopup').val("false");
    }
}

// Ehsan: why is this param defined outside the method?
var deleteSiteId = null;
function saveDeleteSiteData(userSiteId, siteName){
    if ($("#tb_window").css("display") != "none") {
        resetAddSite(false);
    }
    deleteSiteId = userSiteId;
    setTimeout(function(){
        tb_show('', '#TB_inline?height=auto&width=400&inlineId=confirmDelete&modal=true', null);
    }, 50);
    $('#deleteText').html("<p>Are you sure you want to delete <b> " + unescape(siteName) + "</b>?</p>");
}

function deleteSite(){
    verifySites.removeBookmark(deleteSiteId);
    tb_remove();
}

function cCredStep(step){
    if (step < 1) {
        $("#TB_window .ccFooter" + step).show();
        $("#TB_window .IDremindPass" + step).show();
    }
    else {
        for (var i = 0; i < step; i++) {
            $("#TB_window .ccFooter" + i).hide();
            $("#TB_window .IDremindPass" + i).hide();
        }
        $("#TB_window .ccFooter" + step).show();
        $("#TB_window .IDremindPass" + step).show();
    }
}

function cCredCorrect(userSiteId, update){
    BookmarksForLogin.updateUserSiteFlags(userSiteId, "CQ", true);
    clearReminderPasswords();
    if (update) {
        tb_remove();
        BookmarksForLogin.toTable();
    }
    //setTimeout(function(){cCredPostLogin(userSiteId)}, 500);
}

function cCredVerifyInputs(){
    var noError = true;
    $("#TB_window .challengeData :input").each(function(){
        var t = $(this)
        var inputVal = $(t).val().trim();
        if (inputVal === "") {
            $(t).addClass("formerror").unbind("blur", "cCredError").bind("blur", function cCredError(){
                $(t).removeClass("formerror").unbind();
            });
            noError = false;
        }
    });
    return noError;
}

function cExraCredCorrect(userSiteId, update, step){
    var noError = cCredVerifyInputs();
    if (noError) {
        BookmarksForLogin.updateUserSiteFlags(userSiteId, "CJX", true);
        clearReminderPasswords();
        cCredStep(step);
    }
    else {
        $("#TB_window #cCredInputError").show();
    }
}

function cSetInvestigation(userSiteId){
    BookmarksForLogin.updateUserSiteFlags(userSiteId, "CJ", true);
    clearReminderPasswords();
}

function cActionRequiredInvalid(userSiteId){
    BookmarksForLogin.updateUserSiteFlags(userSiteId, "a", true);
    cCredStep(1);
}

function cCredWrong(userSiteId){
    SP.api.getBookmark(userSiteId, function(header, data){
    
        //var u = $("#TB_window .remindDataUser").html();
        var p = $("#TB_window .remindDataPass").html();
        
        processFields(data.basicFields, $('#TB_window .remindData'), 4);
        var id = $('#TB_window .remindData :input:password').attr("id");
        var name = $('#TB_window .remindData :input:password').attr("name");
        
        $('#TB_window .remindData :input:password').after('<input id="' + id + '" autocomplete="off" class="formnormal formsizemanage" type="text" maxlength="40" size="20" name="' + name + '" tabindex="5" value="' + p + '" />').remove();
        cCredStep(3);
    });
}

function cCredSaveBasicLogin(userSiteId){
    var siteParams = getSiteParams(userSiteId, 'cCredEditActive');
    BookmarksForLogin.updateUserSiteFlags(userSiteId, "CQ", true);
    SP.api.updateUserSiteCredentials(siteParams, function(){
        tb_remove();
        clearReminderPasswords();
        BookmarksForLogin.toTable();
    });
}

function cCredSaveExtraLogin(userSiteId, step){
    var noError = cCredVerifyInputs();
    if (noError) {
        var siteParams = getSiteParams(userSiteId, 'cChallengeEditActive');
        SP.api.updateUserSiteCredentials(siteParams, function(){
            clearReminderPasswords();
            if (step === "tb_remove") {
                tb_remove();
            }
        });
    }
    else {
        $("#TB_window #cCredInputError").show();
    }
}

function cCredPostLogin(userSiteId){
    //TO DO
}

function passRemindOff(userSiteId){
    tb_remove();
    clearReminderPasswords();
    if ($('#TB_window #dontRemindChk').is(".checked")) {
        BookmarksForLogin.updateUserSiteFlags(userSiteId, "EN", true);
        BookmarksForLogin.toTable();
    }
}

function feedbackWindow(sitename, userSiteId){
    $.jGrowl('Were you able to login to <b>' + sitename + '</b>?' + '<div class="linkaccent">&nbsp;&nbsp<a class="userSuccess" href="javascript:void(0)" onclick="autologinSuccess(this,' + userSiteId + ')">[Yes, I was able to login.]</a></div><div class="linkaccent">&nbsp;&nbsp;<a class="userFail" href="javascript: void(0)" onclick="autologinFail(this,' + userSiteId + ')">[No, I had a problem with logging in.]</a></div>', {
        header: '1-Click Login Feedback',
        sticky: false,
        closer: true
    });
}

//$('.userSuccess').bind("click", function(){autologinSuccess(1);});
//$('.userFail').bind("click", function(){autologinFail(1);});

function autologinSuccess(selector, userSiteId){
    // Make API call to populate Feedback Table
    SP.api.userFeedback("pass", userSiteId, function(){
        // Update User Flags
        //BookmarksForLogin.updateUserSiteFlags(userFeedback,userSiteFlags, false);
    });
    $(selector).parent().parent().parent().trigger('jGrowl.close').remove();
}

function autologinFail(selector, userSiteId){

    // Make API call to populate Feedback table
    SP.api.userFeedback("fail", userSiteId, function(){
        // Update User Flags
        //BookmarksForLogin.updateUserSiteFlags(userFeedback,userSiteFlags, false);
    });
    $(selector).parent().parent().parent().trigger('jGrowl.close').remove();
}

function showPWMTip(){
    if ($(".pwmItem").length > 1 && $(".pwmItem").length < 7) {
        var r = Math.floor(Math.random() * 4);
        var imgSrc = (r * 104 + r);
        $("#pwm_inline_tips div").css({
            backgroundPosition: "0 -" + imgSrc + "px"
        });
        $("#pwm_inline_tips").removeClass('hidden');
        $(".pwmItem").expire();
    }
}

function prepPWMTips(){
    if ($(".pwmItem").length > 1) {
        showPWMTip();
    }
    else {
        $(".pwmItem").livequery(function(){
            showPWMTip();
        });
    }
}

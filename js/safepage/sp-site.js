$(document).ready(function(){

    $('#debugMode').livequery(function(){
        $('#debugMode').click(function(){
            var checked = this.checked;
            $('#debugOnly').toggle();
        });
    });
    
    $('#TB_window input[name=SP_PASS]').livequery("keyup", function(){
    	if ($(this).val() !== '******' && $(this).val() !== ''){
    		$('#TB_window #asConfirmPass').attr('disabled', false);
    		$('#TB_window #comfirmPassDiv').removeClass('doNotConfirm');
    	} else {
    		$('#TB_window #asConfirmPass').attr('disabled', true);
    		$('#TB_window #comfirmPassDiv').addClass('doNotConfirm');
    	}
    });
    
    /*
     * Setup search
     */
    SP.fullSearch = false;
});

/*
 * ADD SITE ***********
 */
function resetAddSite(another){
    if (another) {
        $("#TB_ajaxContent .asBodyContent").empty().append($("#tmplAddSite .IDasBrowse").clone());
    }
    else {
        tb_remove();
        setTimeout(function(){
        $('#TB_addSite').empty();
        $('#TB_editSite').empty();
        $("#TB_ajaxContent").empty();
        }, 50);
    }
	$("#TB_ajaxContent .asSearchBox").focus();
}
function asGoBack(){
	if ($("#TB_ajaxContent .IDasSearchResult").length > 0){
		$("#TB_ajaxContent .IDasAddSite").hide();
		$("#TB_ajaxContent .IDasSearchResult").show();
		$("#TB_ajaxContent .IDasAddSite").empty().remove();
	} else if ($("#TB_ajaxContent .IDasBrowse").length === 1){
		$("#TB_ajaxContent .IDasAddSite").hide();
		$("#TB_ajaxContent .IDasBrowse").show();
		$("#TB_ajaxContent .IDasAddSite").empty().remove();
	} else {
		resetAddSite(true);
	}
}
function asSaveSite(){

		if ($('#TB_ajaxContent #PASSWORD').val() === $('#TB_ajaxContent #asConfirmPass').val()) {
			$('#TB_ajaxContent #siteRating').hide();
			$("#TB_ajaxContent .saveControls").hide();
			$("#TB_ajaxContent #savingSite").show();
			saveSite();
		}
		else{
		    $('#TB_ajaxContent  #siteRating').html("<p> Passwords Do Not Match. </p>").show();
		}
	}

function search(keywords, cont){
    SP.api.autocomplete(keywords, SP.fullSearch, function(header, data){
 
        var res = [];
        if (header.success === true) {

            var sites = data.root;
            for (var i = 0; i < sites.length;) {
                var site = sites[i];
                res.push({
                    id: site.id,
                    value: site.name,
                    extra: true
                });
                i = i + 1;
            }
            
            //res.push({ id: 0 , value: "Get Full Search Result", extra: true});
            if (data.maxed) {
                res.push({
                    id: -1,
                    value: "Too many results"
                });
            }
            cont(res);
        }
        else {
            if (header.success === false) {
                $('#siteRating').html("<p>" + header.errorMessages + "</p>").show();
            }
        }
    }, "json");
    SP.fullSearch = false;
}

function getSiteInfo(data){
    var siteId = null;
    // Popular Sites
    if (!data.id) {
        siteId = data;
    }
    else {
        siteId = data.id;
    }
    
    getSite(siteId);
}

function getSiteInfoByName(siteName){
    getSite('', siteName);
}

function getSite(siteId, siteName){
    SP.api.getSite(siteId, siteName, function(header, data){

		populateLoginInfo(data);
        
    }, function(message){
        $('#siteRating').html("<p>" + message + "</p>").show();
    });
}

function showAddSites(){
	$("#TB_addSite").empty().append($("#frgAddSite .asBaseHeader").contents().clone());
	$("#tmplAddSite .IDasBrowse").clone().appendTo("#TB_addSite .asBodyContent");
	tb_show('Add Site', '#TB_inline?height=auto&amp;width=925&amp;inlineId=TB_addSite&amp;modal=true', null);
    if ($('#firstTime').val() === 'true') {
        setTimeout('$(\'#addSiteFTH\').slideDown(1000);', 750);
    }
}

function asSearch(searchType, searchVal){
	var searchQuery = "";
    if($("#TB_ajaxContent .asSearchBox").val() === "" && !searchVal)
	{
		return false;
	}
	waitCursor(true);
	if (searchType === "name"){
        searchQuery = searchVal;
        } else {
		searchQuery = $("#TB_ajaxContent .asSearchBox").val();
	}
	$(".jqac-menu").remove();
		if ($("#TB_ajaxContent .IDasSearchResult").length > 0){
			$("#TB_ajaxContent .IDasSearchResult").attr("id", "").addClass("oldSearch");
		}
	    $("#TB_ajaxContent .asBodyContent").append($("#tmplAddSite .IDasSearchResult").clone().addClass("hidden").attr("id", "asResults1"));
	    $("#asResults1 .ASBody").attr("id", "asResultsPage1");
	    $("#TB_ajaxContent #asResults1 .searchQuery").empty().append(searchQuery.substring(0, 25));
        $("#TB_ajaxContent #asResults1 #searchQueryVal").val(searchQuery);
        $("#TB_ajaxContent #asResults1 #asSearchBox").val(searchQuery);
        if (searchType === "name"){
        	SP.api.autocomplete(searchQuery, SP.fullSearch, function(header, data){
		       asProcessSearch(header, data, searchQuery);
	        },function() {
	        	waitCursor(false);
	        	alert('ERROR!');
	        });
        } else {
		    SP.api.deepSearch(searchQuery, true, function(header, data){
		       asProcessSearch(header, data, searchQuery);
	        },function() {
	        	waitCursor(false);
	        	alert('ERROR!');
	        });
        }
        $(".jqac-menu").remove();
        setTimeout(function(){$(".jqac-menu").remove();}, 125);
        setTimeout(function(){$(".jqac-menu").remove();}, 250);
        setTimeout(function(){$(".jqac-menu").remove();}, 500);
        setTimeout(function(){$(".jqac-menu").remove();}, 1000);
}

function asProcessSearch(header, data, searchQuery){
	if ($("#TB_ajaxContent .oldSearch").length > 0){
					$("#TB_ajaxContent .oldSearch").empty().remove();
				}
		       if (data.totalCount < 1){
		       		$("#TB_ajaxContent .IDasResults").hide();
		       		$("#TB_ajaxContent .IDasNoResults").show();
		       		$("#TB_ajaxContent .IDasSiteNotListed").hide();
		       		waitCursor(false);
		            $("#TB_ajaxContent .IDasBrowse").empty().remove();
		            $("#TB_ajaxContent #asResults1").show();
		       		return;
		       }
		        $("#TB_window .as_searchS2 .asSearchNum").empty().append(data.totalCount);
	            var column = 1;
	            var page = 1;
	            var count = 1;
	            if (header.success === true) {
	                var sites = data.root;
					$('#TB_ajaxContent  #nonSecureSuggest').show();
	                for (var i = 0; i < sites.length; i += 1) {
	                    var site = sites[i];
	                    if (count === 7) {
							column = 2; 
						} else if (count === 12 && data.totalCount >= 11 * page) {
							asSetPaging(count, page, data.totalCount);	
							count = 1;
							column = 1;
							page += 1;
							$("#TB_ajaxContent #asResults1 #asResultsPage1").after($("#tmplAddSite .IDasSearchResult .ASBody").clone().attr("id", "asResultsPage" + page).addClass("hidden"));
							$("#TB_ajaxContent #asResults" + page +" .searchQuery").empty().append(searchQuery);
						}
						if (page > 1 && (count + (11 * page) - 11) === data.totalCount){
							asSetPaging(count, page, data.totalCount, true);
						}
						var addCss = "even";
						if (count % 2 === 0) { addCss = "odd";}
						var resultURL = site.url.replace("http://", "");
						resultURL = resultURL.replace("www.", "");
	                    $("#asResultsPage" + page + " .IDasSearchColumn" + column + " .as2ColumnBody").append(
	                    	replaceTmpl($("#frgAddSite .resultBoxes").html(), ["resultAction", "getSite(" + site.id + ")", "resultName", site.name, "resultURL", resultURL, "addCss", addCss], "g"));
	                    count += 1;
	                }
	            }
	            if (page > 1) {
	            	$("#TB_window .IDasSearchPages").removeClass("hidden");
	            }
	            waitCursor(false);
	            $("#TB_ajaxContent .IDasBrowse").empty().remove();
	            $("#TB_ajaxContent #asResults1").show();
}

function asSetPaging(count, page, totalCount, lastPage){
	var cur = (11 * page) - 10;
	if (count === 12){ count = 11; }
	var displayTo = cur + count - 1;
	if (page === 1) { displayTo = 11; }
	$("#TB_window #asResultsPage" + page + " .asSearchPageNum").append("Page " + page);
	if (cur === totalCount){
		$("#TB_window #asResultsPage" + page + " .asSearchPage").append(cur + " of " + totalCount + " Results");
	} else {
		$("#TB_window #asResultsPage" + page + " .asSearchPage").append(cur + " - " + displayTo + " of " + totalCount + " Results");
	}
	if (!lastPage){
		$("#TB_window #asResultsPage" + page + " .IDasNextPage")
			.attr("href", "javascript: asNextPage(" + (page + ", " + (page + 1)) + ");")
			.parent().removeClass("controldisabled");
	}	
	if (page > 1){	
		$("#TB_window #asResultsPage" + page + " .IDasPrevPage")
			.attr("href", "javascript: asNextPage(" + (page + ", " + (page - 1)) + ");")
			.parent().removeClass("controldisabled");	
	}
}

function asNextPage(hideMe, showMe){
	$("#TB_window #asResultsPage" + (hideMe)).hide();
	$("#TB_window #asResultsPage" + showMe).show();
}

function addCustomSite(){
    var siteId = 0;
    
	$(".jqac-menu").remove();
	if ($("#TB_ajaxContent .IDasAddSite").length < 1){
	    $("#TB_ajaxContent .asBodyContent").append($("#tmplAddSite .IDasAddSite").clone().addClass("hidden"));
	    $("#TB_ajaxContent .IDasAddSite .ASFooter").append($("#frgAddSite .asSaveControls").contents().clone());
    }
        var nonyodlee =  $("#TB_ajaxContent #asResults1 #searchQueryVal").val();
        // Do a check to see if siteName exists in sitetable
        getSiteInfoByName(nonyodlee);
        
        $('#TB_ajaxContent #siteName').val(nonyodlee);
        if (nonyodlee.indexOf(".") != -1) {
            $('#TB_ajaxContent #siteUrl').val(nonyodlee);
            $('#TB_ajaxContent #siteName').val('').focus();
        }
        else {
            $('#TB_ajaxContent #siteUrl').focus();
        }
}

function saveSite(){
    var siteId = $('#TB_ajaxContent #siteId').val();
    var siteUrl = $('#TB_ajaxContent #siteUrl').val();
    if (siteUrl) {
        siteUrl = jQuery.trim(siteUrl);
    }
    var siteName = $('#TB_ajaxContent #siteName').val();
    
    var isValid = (siteId || isValidURL(siteUrl)) && siteName !== "";
    if (isValid) {
    	$("#TB_ajaxContent #sitesForm").attr("id", "sitesFormActive");
        var siteParams = getSiteParams(null, 'sitesFormActive');
        SP.api.addBookmark(siteParams, function(header, data){
            if (data.inputErrors) {
                var inputErrors = data.inputErrors;
                for (var inputName in inputErrors) {
                    $('#' + inputName).addClass("formerror");
                }
                $('#TB_ajaxContent #siteRating').html("<p>Please fill all the required fields</p>").show();
                $("#TB_ajaxContent #savingSite").hide();
                $("#TB_ajaxContent .saveControls").show();
                if ($("#TB_ajaxContent #tabAddExtraInfo").css("display") != "none") {toggleAddTabs("addSiteExtra", "tabAddExtraInfo"); }
            }
            else {
                $('#tmplAddSite .IDasConfirm').clone().addClass("hidden").appendTo("#TB_ajaxContent .asBodyContent");            
                $('#TB_ajaxContent #confirmSitename').html("<span>" + siteName + "</span>");
                $('#TB_ajaxContent .IDasAddSite').hide();
                $('#TB_ajaxContent .IDasConfirm').show();
                $('#TB_ajaxContent .IDasAddSite').empty().remove();
                BookmarksForLogin.toTable();
                if ($('#isManage').val() === 'bookmark/manage') {
                    verifySites.toTable();
                }
            }
        }, function(message){
            $('#TB_ajaxContent #siteRating').html("<p>" + message + "</p>").show();
            $("#TB_ajaxContent #savingSite").hide();
            $("#TB_ajaxContent .saveControls").show();
        });
    }
    else {
        //TODO: Add More Sophisticated Validation
        $('#TB_ajaxContent #siteRating').html("Please correct fields.").show();
        $("#TB_ajaxContent #savingSite").hide();
        $("#TB_ajaxContent .saveControls").show();
    }
}

/*
 * EDIT SITE ***********
 */
 
function bindEditSite(userSiteId, siteName){
    $("#TB_editSite .IDasSaveEditSite").unbind().click(function(){
    // if disabled, don't check password
    
    if($('#TB_window #comfirmPassDiv').hasClass('doNotConfirm'))
    {	
    	$('#TB_window #siteRating').hide();
		$("#TB_window .saveControls").hide();
		$("#TB_window #savingSite").show();
		updateSite(userSiteId);
    }
    else
    {
	if (($('#TB_ajaxContent #saveCred ').val() === 'true')) {
		if ($('#TB_window #PASSWORD').val() === $('#TB_window #asConfirmPass').val()) {
			$('#TB_window #siteRating').hide();
			$("#TB_window .saveControls").hide();
			$("#TB_window #savingSite").show();
			updateSite(userSiteId);
		}
		else {
			$('#TB_window  #siteRating').html("<p> Passwords Do Not Match. </p>").show();
		}
	}
	else{
		$('#TB_window #siteRating').hide();
		$("#TB_window .saveControls").hide();
		$("#TB_window #savingSite").show();
		updateSite(userSiteId);
	}
    }
   
   
   
    });

    $("#TB_editSite .IDas3Button").unbind().click(function(){
		saveDeleteSiteData(userSiteId, siteName);
	});
	var hideShowPass;
	if ($("#TB_editSite .IDhasPassword").is(".checked") === false) { hideShowPass = "hidden";} else { hideShowPass = "";}
	$("#TB_editSite input[name=SP_PASS]").after(
		"<span id='showUPButton0' class='control floatit " + hideShowPass + "'>"+
			"<a href='javascript: managePass(0)' class='block'>Show Password</a>"+
		"</span><input type='hidden' value='" + userSiteId + "' name='editBookmarkId' id='editBookmarkId' /><br class='clearfloat' />");
}

function updateSite(userSiteId){
	
	$("#TB_ajaxContent #sitesForm").attr("id", "sitesFormActive");
    var siteParams = getSiteParams(userSiteId, 'sitesFormActive');
        SP.api.updateBookmark(siteParams, function(header, data){
            if ($('#isManage').val() === 'bookmark/manage') {
                verifySites.toTable();
            }
            BookmarksForLogin.toTable();
            resetAddSite(false);
        }, function(message){
            $('#TB_window #siteRating').html("<p>" + message + "</p>").show();
            $('#TB_window #savingSite').hide();
            $('#TB_window .saveControls').show();
        });
}

/*
 * COMMON ***********
 */
function getSiteParams(userSiteId, formName){
	var jsonParams = {};
	if (typeof userSiteId !== "null") {
		jsonParams.userSiteId = userSiteId;
	}
    var formElements = document.getElementById(formName);
    if (formElements === null || typeof formElements === "undefined") {
        return;
    }
    var formLength = formElements.length;
    for (var i = 0; i < formLength; i++) {
        var element = formElements[i];
		elementName = element.id;
		elementValue = unescape(element.value);
		eval('jsonParams.'+elementName+'="'+elementValue+'"');
    }
	
    var loginTypeObject = $('#TB_window input[name=loginTypeName]:checked');
    if (typeof loginTypeObject !== "undefined" && typeof loginTypeObject.val() !== "undefined") {
		jsonParams.loginTypeName=loginTypeObject.val();  
    }
    if ($("#TB_window #enableSecurityChk").is('.checked')) {
		jsonParams.sitePolicyTemplate="ENHANCED_POLICY_SET";
    } else {
		jsonParams.sitePolicyTemplate="STANDARD_POLICY_SET";
    }
    var credObject = $('#TB_window input[name=hasPassword]:checked');
    if (typeof credObject !== "undefined" && typeof credObject.val() !== "undefined") {
        jsonParams.hasPassword=credObject.val();
    }

    var jsonText = JSON.stringify(jsonParams);
    return jsonText;
}

function processFields(fields, div, tabIndex){
    if (typeof fields === "undefined" || fields.length === 0) {
        $("#TB_ajaxContent #addSiteExtra").hide();
        $("#TB_ajaxContent #tabAddExtraInfo").hide().removeClass("selected");
        $("#TB_ajaxContent #tabAddHelp").addClass("selected");
        $("#TB_ajaxContent #addSiteHelp").show();
        return;
    }
    var fieldsStr = "";
    for (var i = 0; i < fields.length; i++) {
        var fieldStr = "";
        var field = fields[i];
        if (!field) {
            continue;
        }
        if (field.isRequired === true) {
            fieldStr += "<span style='color: red'>*</span> ";
        }
        fieldStr += "<span class='label'>" + field.label + ":</span><br/>";
        var parts = field.parts;
        if (typeof parts === "undefined") {
            fieldStr = "";
            continue;
        }
        for (var j = 0; j < parts.length; j++) {
            if (j > 0) {
                fieldStr += " - ";
            }
            var part = parts[j];
            var fieldType;
            if (part.size < 10) { fieldType = "formdynamic"; }
            else { fieldType = "formsizemanage"; }
            if (part.type === "TEXT" || part.type === "URL" || part.type === "IF_LOGIN") {
                fieldStr += " <input type='TEXT' class='formAddSite " + fieldType + "' tabindex=" + tabIndex;
                fieldStr += " id='" + part.id + "'";
                fieldStr += " name='" + part.id + "'";
                if (typeof part.value !== "undefined") {
                    fieldStr += " value='" + part.value + "'";
                }
                fieldStr += " size='" + part.size + "'";
                fieldStr += " maxlength='40'";
                fieldStr += " />";
            }
            else if (part.type === "PASSWORD" || part.type === "IF_PASSWORD") {
                fieldStr += " <input type='PASSWORD' class='noinitialFocus fadetitle formAddSite secureForm " + fieldType + "' tabindex=" + tabIndex;
                fieldStr += " id='" + part.id + "'";
                if (field.isPassword === true) {
                	fieldStr += " name='" + "SP_PASS" + "'";
                } else {
                	fieldStr += " name='" + part.id + "'";
                }
                if (typeof part.value !== "undefined") {
                    fieldStr += " value='" + part.value + "' title='" + part.value + "'";
                }
                fieldStr += " size='" + part.size + "'";
                fieldStr += " maxlength='" + part.maxLength + "'";
                fieldStr += " />";
                if (field.isPassword === true) {
                	fieldStr += "<br/><br/>";
                	fieldStr += replaceTmpl($("#frgAddSite .asFields .confirmPass").html(), ["passwordLabel", "Confirm " + field.label + ":"], "g");
                }	
            }
            else if (part.type === "OPTIONS" || part.type === "RADIO") {
                fieldStr += " <select id='" + part.id + "' name='" + part.id + "' tabindex=" + tabIndex + ">";
                if (typeof part.validIds !== "undefined" && part.validIds.length > 0) {
                	if (part.isChallengeQuestion) {
                    	fieldStr += "<option value=''></option>";
                    } else {
                    	fieldStr += "<option value=''>Select the question you picked at the site</option>";
                    }
                    for (var k = 0; k < part.validIds.length; k++) {
                        var validId = escape(part.validIds[k]);
                        var validValue = escape(part.validValues[k]);
                        var selected = "";
                        if (unescape(validId) === part.value || unescape(validValue) === part.value) {
                            selected = " selected='selected' ";
                        }
                        fieldStr += "<option value='" + validId + "' " + selected + ">" + unescape(validValue) + "</option>";
                    }
                }
                fieldStr += "</select>";
            }
            else {
                fieldStr = "";
                continue;
            }
            var hint = "";
            if (typeof field.hint !== "undefined") {
                hint = field.hint;
            }
            tabIndex++;
        }
        fieldsStr += fieldStr + hint + "<br/><br/>";
    }
	if (typeof div === "undefined" || div === "" || typeof div === null){
		return fieldsStr;
	}    
    div.html(fieldsStr);	
}

function toggleAddTabs(which, select){
    $("#TB_window .as_tabContent").hide();
    $("#TB_window #addSiteTabNav .asCat").removeClass("selected");
    $("#TB_window #" + which).show();
    $("#TB_window #" + select).addClass("selected");
}

function toggleSiteType(isEdit){
	var buildLocation = "#TB_ajaxContent";
	if (isEdit) { buildLocation = "#TB_editSite"; }
    var who1 = $(buildLocation + ' #basicFields').children();
    var who2 = $(buildLocation + ' #extraFields').children();
    var who3 = $(buildLocation + ' #asConfirmPass');
    if ($(buildLocation + ' .IDhasPassword').is(".checked")) {
    	$(buildLocation + ' .IDhasPassword').removeClass("checked");
    	$(buildLocation + ' input[@name="hasPassword"]:checked').val(false)
        disableItem([who1, who2], [who1, who2, who3], "disable");
        $(buildLocation + " #showUPButton0").hide();
        $(buildLocation + ' .IDasfOn').hide();
        $(buildLocation + ' .IDasfOff').show();
    }
    else {
    	$(buildLocation + ' .IDhasPassword').addClass("checked");
    	$(buildLocation + ' input[@name="hasPassword"]:checked').val(true)
        disableItem([who1, who2], [who1, who2], "enable");
        if (!$(buildLocation + ' #comfirmPassDiv').is('.doNotConfirm')){ disableItem([], [who3], "enable");}
        $(buildLocation + " #showUPButton0").show();
        $(buildLocation + ' .IDasfOff').hide();
        $(buildLocation + ' .IDasfOn').show();
    }
    $(buildLocation + ' #siteRating').hide();
}

function populateLoginInfo(data, isEdit){ 
	if ($("#TB_ajaxContent .IDasAddSite").length < 1 && !isEdit){
	    $("#TB_ajaxContent .asBodyContent").append($("#tmplAddSite .IDasAddSite").clone().addClass("hidden"));
	    $("#TB_ajaxContent .IDasAddSite .ASFooter").append($("#frgAddSite .asSaveControls").contents().clone());
    }
    
	var buildLocation = "#TB_ajaxContent";
	if (isEdit) { buildLocation = "#TB_editSite"; }
	if (typeof data !== "undefined") {    
		   // set logo, url, id and name        
           if (typeof data.logoPath !== "undefined" ) {
               $(buildLocation + ' #siteLogo').html("<img src='" + data.logoPath + "' id='siteLogo' />");
           }
           var siteName = data.userSiteName;
           if (typeof siteName == "undefined") {
        	   siteName = data.siteName;
           }
           var url = data.homeUrl;
           if (typeof url == "undefined") {
        	   url = data.userSiteUrl;
           }
           if(typeof url !== "undefined")
           {
	            $(buildLocation + ' #userSiteUrl').val(url);
				if (typeof data.siteId !== "undefined" && typeof data.siteId !== null && data.siteId !== "") {
		           	var urlShort = url.replace("http://", "").replace("https://", "").replace("www.", "")
		            $(buildLocation + ' #siteUrlLabelBox').hide();
		            $(buildLocation + ' #siteUrlText').empty().append(urlShort).attr("title", url).show();
	            }
           }
           if(typeof data.siteId !== "undefined")
           {
            $(buildLocation + ' #siteId').val(data.siteId);
           }           
           if(typeof data.userSiteId !== "undefined")
           {
            $(buildLocation + ' #userSiteId').val(data.userSiteId);
           }           
           if(typeof siteName !== "undefined")
           {
            $(buildLocation + ' #userSiteName').val(siteName);
           }
                   
           // set login type
			if (typeof data.loginTypeName !== "undefined") {
				setTimeout("$('input[name=loginTypeName][value="+data.loginTypeName+"]').attr('checked', true);", 1);
				if (data.loginTypeName === "YODLEE") {
				    if (data.yodleeType === 1) {
				        $(buildLocation + ' #yodleeType').html("Type 1");
				    }
				    else if (data.yodleeType === 2) {
				        $(buildLocation + ' #yodleeType').html("Type 2");
				    }
				    else if (data.yodleeType === 3) {
				        $(buildLocation + ' #yodleeType').html("Type 3");
				    }
				}		
			}
            
            // set default site policy
			if (data.sitePolicyTemplate !== "ENHANCED_POLICY_SET") {
        		$(buildLocation + ' #enableSecurityChk').removeClass("checked");
			} else {
        		$(buildLocation + ' #enableSecurityChk').addClass("checked");
			}		
			            
            //Populate Key Features
            var flags = data.flags; 
			if (typeof flags !== "undefined") {
				// show the specialized features
				var featuresLength = 0;				
				if (flags.supportsBillReminders === true) {
			        $(buildLocation + ' .asfBills').show();
			        featuresLength =+ 1;
				} 
				if (flags.supportsRewards === true) {
			        $(buildLocation + ' .asfRewards').show();
			        featuresLength =+ 1;
				}
				if (flags.supportsAutoLogin === true) {
			        $(buildLocation + ' .asfOneClick').show();
			        $(buildLocation + ' .asfLoginSecurity').show();
			        featuresLength =+ 2;
				}
				if (flags.supportsFraudTracker === true) {
			        $(buildLocation + ' .asfFraud').show();
			        featuresLength =+ 1;
				}
				if (flags.supportsFinancialTracker === true) {
			        $(buildLocation + ' .asfFinance').show();
			        featuresLength =+ 1;
				
		            if (data.siblings && data.siblings.length > 0) {
		                var siblingsDiv = "";
		                var countThis = 0;
		                $.each(data.siblings, function(i, sibling){
		                    if (sibling.typeName) {
		                    	countThis += 1
		                        siblingsDiv += sibling.typeName + ", ";
		                    }
		                });
		                siblingsDiv = siblingsDiv.substring(0, (siblingsDiv.length - 2));
		                if (countThis === 1) siblingsDiv += " Only";
		                $(buildLocation + ' .asfAccountTypes').html(siblingsDiv);
		            }
		        }

				// hide generic features depending on how many specialized features are available
				if (featuresLength > 0) {
					$(buildLocation + ' .asfStorePassword').hide();
				}
            }
            else  {
				var betaTester = $("#betaTester").val();
				if (betaTester === "false") {
					$(buildLocation + ' #tabAddAdvanced').hide();
				}
            }
            
            //Temporary POC Seals Code
	        if (typeof data.certSealName !== "undefined") {
	        	// Chris to add different seals for different cert authorities
	        	if (typeof data.certSealUrl !== "undefined") {
	        		$(buildLocation + " .IDCertSeal").show().append(
		        		replaceTmpl($("#frgAddSite .certBase .verify").html(), ["certSealName", data.certSealName, "certSealUrl", data.certSealUrl], "g")
		        	);
	        	} else {
		        	$(buildLocation + " .IDCertSeal").show().append(
						"<img src='/images/seals/" + data.certSealName + ".jpg' title='Verified by " + data.certSealName + "' />"
		        	);
	        	}
	        }	
        	//END Temporary POC Seals Code
        
        	// set credentials
                
            $(buildLocation + ' #basicFields').show();
            processFields(data.basicFields, $(buildLocation + ' #basicFields'), 4);
            if (typeof data.extraFields !== "undefined"){
	            if (data.siteId !== 0 && data.extraFields !== "" && data.extraFields.length > 0) {
	            	if (!(data.flags && data.flags.moreThanTwoRequiredFields)) {
				        $(buildLocation + " #tabAddExtraInfo").removeClass("selected");
				        $(buildLocation + " #tabAddHelp").addClass("selected");
				        $(buildLocation + " #addSiteExtra").hide();
				        $(buildLocation + " #addSiteHelp").show();
			        }    
			        
		            $(buildLocation + ' #extraFields').show();
		            processFields(data.extraFields, $(buildLocation + ' #extraFields'), 4 + data.basicFields.length + 1);
		        } else {
			        	$(buildLocation + " #addSiteExtra").hide();
				        $(buildLocation + " #tabAddExtraInfo").hide().removeClass("selected");
				        $(buildLocation + " #tabAddHelp").addClass("selected");
				        $(buildLocation + " #addSiteHelp").show();
		        }
			} else {
		        	$(buildLocation + " #addSiteExtra").hide();
			        $(buildLocation + " #tabAddExtraInfo").hide().removeClass("selected");
			        $(buildLocation + " #tabAddHelp").addClass("selected");
			        $(buildLocation + " #addSiteHelp").show();
		    }       
        }
        if ((typeof data.flags === "undefined" || typeof data.flags.showSitePassword === "undefined" || data.flags.showSitePassword === 0) && isEdit) {
        	toggleSiteType(isEdit);
        	$(buildLocation + " #saveCred").attr("checked", false);
        	$(buildLocation + " #dontSaveCred").attr("checked", true);
        }
        if (isEdit){
	        if (data.flags && (typeof data.flags.showSitePassword === "undefined" || data.flags.showSitePassword === false)) {
	            toggleSiteType(isEdit);
	        }
	    }    
        showAddSite(data.siteId);
}

function showAddSite(siteId){
	$('#TB_ajaxContent #siteId').val(siteId);
    $('#TB_ajaxContent .jqac-warning').hide();
    $('#TB_ajaxContent .jqac-menu').hide();
	if ($("#tmplAddSite .IDasSearchResult").length > 0){
		$("#TB_ajaxContent .IDasSearchResult").hide();
	}
	if ($("#tmplAddSite .IDasBrowse").length > 0){
		$("#TB_ajaxContent .IDasBrowse").hide(); 
	}
    $("#TB_ajaxContent .IDasAddSite").show();
    $('#siteName').focus();
}

function RemoveDuplicates(arr){
    //get sorted array as input and returns the same array without duplicates.
    var result = new Array();
    var lastValue = "";
    for (var i = 0; i < arr.length; i++) {
        var curValue = arr[i];
        if (curValue != lastValue) {
            result[result.length] = curValue;
        }
        lastValue = curValue;
    }
	
    return result;
}

function updateAddSites(name){
    getSiteInfoByName(name);
    $('#nonSecureSuggest').hide();
}

function basicToggle(t){
	$(t).toggleClass("checked");
}
$(document).ready(function(){

    BookmarksForLogin.initialize();
    
    // image related initialization
    $("#imageCategory").val("All Images");
    $(".OCfadeImages").click(function(){
        Images.fadeRows();
        tb_show(null, "#TB_inline?height=auto&width=650&inlineId=changeTwoWayImage&modal=true", null);
    });
    
    if ($('#yesEmail').attr("checked") === true) {
    
        $('#savedEmailPref').val("true");
    }
    else {
    
        $('#savedEmailPref').val("false");
    }
    
});


function cancelUsername(){
    tb_remove();
    $('#username').val($('#savedUsername').val());
}

function cancelPassword(){
    tb_remove();
    $('#oldPasswd').val("");
    $('#passwd').val("");
    $('#confirmPasswd').val("");
}

function cancelAuth(){
    tb_remove();
    var savedAuth = $('#savedAuth').val();
    // delay set so answers don't show up before inline dialog closes
    setTimeout(function(){
        if (savedAuth === 'CHALLENGE_QUESTION') {
            $('#challengePreference1').attr("checked", true);
        }
        else if (savedAuth === 'OOB_EMAIL') {
            $('#challengePreference2').attr("checked", true);
        }
        else if (savedAuth === 'OOB_SMS') {
            $('#challengePreference3').attr("checked", true);
        }
        else if (savedAuth === 'OOB_PHONE') {
            $('#challengePreference4').attr("checked", true);
        }
    }, 600);
}

function cancelQuestions(){
    tb_remove();
    setTimeout(function(){
        $('#question1').val(($('#savedQuestion1').val()));
        $('#question2').val(($('#savedQuestion2').val()));
        $('#answer1').val($('#savedAnswer1').val());
        $('#answer2').val($('#savedAnswer2').val());
    }, 600);
    
}

function cancelPhrase(){
    tb_remove();
    setTimeout(function(){
        $('#phrase').val($('#savedPhrase').val());
    }, 600);
}


function cancelPhone(){
    tb_remove();
    setTimeout(function(){
        $('#phoneArea').val($('#savedPhoneArea').val());
        $('#phonePrefix').val($('#savedPhonePrefix').val());
        $('#phoneSuffix').val($('#savedPhoneSuffix').val());
    }, 600);
}


function cancelEmailPref(){
    tb_remove();
    var savedEmailAuth = $('#savedEmailPref').val();
    
    
    setTimeout(function(){
        if (savedEmailAuth === 'true') {
            $('#yesEmail').attr("checked", true);
            $('#noEmail').attr("checked", false);
        }
        else if (savedEmailAuth === 'false') {
        
            $('#noEmail').attr("checked", true);
            $('#yesEmail').attr("checked", false);
        }
        
    }, 600);
}



$.googleMap = {
    maps: {},
    marker: function(m){
        if (!m) {
            return null;
        }
        else if (m.lat == null && m.lng == null) {
            return $.googleMap.marker($.googleMap.readFromGeo(m));
        }
        else {
            var marker = new GMarker(new GLatLng(m.lat, m.lng));
            if (m.txt) {
                GEvent.addListener(marker, "click", function(){
                    marker.openInfoWindowHtml(m.txt);
                });
            }
            return marker;
        }
    },
    readFromGeo: function(elem){
        var latElem = $(".latitude", elem)[0];
        var lngElem = $(".longitude", elem)[0];
        if (latElem && lngElem) {
            return {
                lat: parseFloat($(latElem).attr("title")),
                lng: parseFloat($(lngElem).attr("title")),
                txt: $(elem).attr("title")
            }
        }
        else {
            return null;
        }
    },
    mapNum: 1
};

$.fn.googleMap = function(lat, lng, zoom, options){

    // If we aren't supported, we're done
    if (!window.GBrowserIsCompatible || !GBrowserIsCompatible()) 
        return this;
    
    // Default values make for easy debugging
    if (lat == null) 
        lat = 37.4419;
    if (lng == null) 
        lng = -122.1419;
    if (!zoom) 
        zoom = 5;
    
    // Sanitize options
    if (!options || typeof options != 'object') 
        options = {};
    options.mapOptions = options.mapOptions ||
    {};
    options.markers = options.markers || [];
    options.controls = options.controls ||
    {};
    
    // Map all our elements
    return this.each(function(){
        // Make sure we have a valid id
        if (!this.id) 
            this.id = "gMap" + $.googleMap.mapNum++;
        // Create a map and a shortcut to it at the same time
        var map = $.googleMap.maps[this.id] = new GMap2(this, options.mapOptions);
        // Center and zoom the map
        map.setCenter(new GLatLng(lat, lng), zoom);
        // Add controls to our map
        for (var i = 0; i < options.controls.length; i++) {
            var c = options.controls[i];
            eval("map.addControl(new " + c + "());");
        }
        // If we have markers, put them on the map
        var marker = null;
        for (var i = 0; i < options.markers.length; i++) {
            if (marker = $.googleMap.marker(options.markers[i])) 
                map.addOverlay(marker);
        }
    });
    
};


function saveQuestions(){
    var newAnswer1 = $('#answer1').val();
    var newAnswer2 = $('#answer2').val();
    var savedAnswer1 = $('#savedAnswer1').val();
    var savedAnswer2 = $('#savedAnswer2').val();
    
    // No Changes
    // TODO: should check the questions too
    if ((newAnswer1 === savedAnswer1) && (newAnswer2 === savedAnswer2)) {
        tb_remove();
    }
    
    document.questionForm.submit();
}

/* Image related */

var Images = {
    toTable: function(){
    
        $("#loading").fadeIn("fast");
        var imageCategory = $("#imageCategory").val();
        SP.api.browseTwoWayImages(imageCategory, function(header, data){
            if (!data || !data.root || data.root.length === 0) {
                return;
            }
            Images.removeImageRows();
            var images = data.root;
            for (var i = 0; i < 3; i += 1) {
                Images.addFirstRows(images[i]);
                if (i < 2) {
                    Images.addFirstSpace();
                }
            }
            for (var j = 3; j < 6; j += 1) {
                Images.addSecondRows(images[j]);
                if (j < 5) {
                    Images.addSecondSpace();
                }
            }
            uploadCustom(0);
        });
        SP.api.browseTwoWayImageCategories(function(header, data){
            if (!data || !data.root || data.root.length === 0) {
                return;
            }
            Images.removeImageCategoriesRows();
            var categories = data.root;
            for (var i = 0; i < categories.length;) {
                Images.addCategoryRow(categories[i].category);
                i = i + 1;
            }
        });
        setTimeout("$('#loading').fadeOut('fast', function(){Images.fadeInRows();});", 500);
        
    },
    addFirstSpace: function(){
        $("#images_row1").createAppend("td", {}, "<img src='../images/spacer.gif' height='100' width='42' alt='spacer' />");
    },
    addSecondSpace: function(){
        $("#images_row2").createAppend("td", {}, "<img src='../images/spacer.gif' height='100' width='42' alt='spacer' />");
    },
    addFirstRows: function(image){
        $("#images_row1").createAppend("td", {}, "<a  href='javascript:void(0)' onclick='Images.changeImage(\"" + image.path + "\",\"" + image.altText + "\")'><img style='border: solid 2px #74a0c8' src='servlet/image/getImage?imagePath=" + image.path + "' height='100' width='100' alt='" + image.altText + "' title='" + image.altText + "' /></a>");
    },
    addSecondRows: function(image){
        $("#images_row2").createAppend("td", {}, "<a  href='javascript:void(0)' onclick='Images.changeImage(\"" + image.path + "\",\"" + image.altText + "\")'><img style='border: solid 2px #74a0c8' src='servlet/image/getImage?imagePath=" + image.path + "' height='100' width='100' alt='" + image.altText + "' title='" + image.altText + "' /></a>");
    },
    removeImageRows: function(){
        $("#images_row1").empty();
        $("#images_row2").empty();
    },
    addCategoryRow: function(categoryName){
        var content = categoryName;
        var currentImageCategory = $("#imageCategory").val();
        if (categoryName === currentImageCategory) {
            content = "<b>" + categoryName + "</b>";
        }
        $("#images_categories").createAppend("tr", {}, ["td", {}, "<a href='javascript:void(0)' onclick='Images.changeCategory(\"" + categoryName + "\");'>" + content + "</a>"]);
    },
    removeImageCategoriesRows: function(){
        $("#images_categories").empty();
    },
    changeCategory: function(imageCategory){
        $("#imageCategory").val(imageCategory);
        Images.fadeRows();
    },
    changeImage: function(path, altText){
        $("#imagePath").val(path);
        
        $("#userImage > img").livequery(function(){
        
            $(this).attr({
                src: "servlet/image/getImage?imagePath=" + path,
                alt: altText,
                title: altText
            });
        });
    },
    fadeRows: function(){
        $("#images_row1").fadeOut("fast");
        $("#images_row2").fadeOut("fast", function(){
            Images.toTable();
        });
    },
    fadeInRows: function(){
        $('#images_row1').fadeIn('fast');
        $('#images_row2').fadeIn('fast');
    },
    cleanInline: function(){
        Images.removeImageRows();
        $("#userImage > img").livequery(function(){
        
            $(this).attr({
                src: "servlet/image/getUserImage",
                alt: $("#originalAlt").attr("name"),
                title: $("#originalAlt").attr("name")
            });
        });
    }
};

var voided = false;
function uploadCustom(item){
    if (voided !== true) {
        if (($("#safepageImages.toggleMe").length > 0) && item === 0) {
            $("#uploadImage").addClass("toggleMe");
            $("#safepageImages").removeClass("toggleMe");
            $("#uploadImage").fadeOut("fast", function(){
                $("#safepageImages").fadeIn("fast");
            });
        }
        else {
            if (($("#uploadImage.toggleMe").length > 0) && item === 1) {
                $("#safepageImages").addClass("toggleMe");
                $("#uploadImage").removeClass("toggleMe");
                $("#safepageImages").fadeOut("fast", function(){
                    $("#uploadImage").fadeIn("fast");
                });
            }
            else {
                if (item === 3) {
                    voided = true;
                    $("#disableOptions").show(1);
                    $("#safepageImages").fadeOut("fast");
                    $("#uploadImage").fadeOut("fast", function(){
                        $("#uploading").fadeIn("fast");
                    });
                }
            }
        }
    }
}

/* Phone related */

var phoneIntervalId;
var phone_field_length = 0;

function pull(){
    SP.api.pullPhoneAuthStatus(function(header, data){
        if (data.pullStatus === true) {
            if (data.pullResultCode === 0) {
                $("#callStatus").empty().append(data.pullResultDesc);
                return;
            }
            else if (data.pullResultCode === 1) {
                clearInterval(phoneIntervalId);
                $("#callStatus").empty().append(data.pullResultDesc);
                $("#cancelPhone").hide();

                $("#continuePhone").show();
                document.continuePhoneForm.submit();
            }
            else {
                clearInterval(phoneIntervalId);
                $("#callStatus").empty().append(data.pullResultDesc);
                $("#tryAgainPhone").show();
            }
        }
        else {
            $("#callStatus").empty().append(data.pullResultDesc);
        }
    });
}

function pullPhoneAuthStatus(){
    pull();
    phoneIntervalId = setInterval("pull()", 5000);
}

function TabNext(obj, event, len, next_field){
    if (event == "down") {
        phone_field_length = obj.value.length;
    }
    else {
        if (event == "up") {
            if (obj.value.length != phone_field_length) {
                phone_field_length = obj.value.length;
                if (phone_field_length == len) {
                    next_field.focus();
                }
            }
        }
    }
}

function prepUpload(){
    uploadCustom(3);
    $('#checkBindState').val("");
    $('#saveDeviceName').val($('#deviceName').val());
    if ($('#dontbindDevice').attr("checked") === false) {
        $('#saveBindDevice').val("false");
    }
    else {
        $('#saveBindDevice').val("true");
    }
    $('#savePhrase').val($('#phrase').val());
    document.uploadForm.submit();
}

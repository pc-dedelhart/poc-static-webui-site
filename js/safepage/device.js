$(document).ready(function(){
    $("#deviceBinding").hide();
    
    
    /*
     var latList = ($(":input:(.latitude)"));
     var longList = ($("input:(.longitude)"));
     var coordinate = null;
     $("input:hidden").each()
     {
     var lati, longi = null;
     var $lat = $(o);
     lati = $lat.val();
     alert(lati);
     
     $(":input:(.longitude)").each(i,o)
     {
     var $long = $(o);
     longi = $long.val();
     }
     
     coordinate = lati +',' + longi + ',' + 'blue' + coordinate;
     
     
     }
     
     $('#markerList').val(coordinate);
     
     // Getting Start Coordinates
     var startLat = $('.latitude').val();
     var startLong = $('.longitude').val();
     
     var map = new GMap2(document.getElementById("map"));
     
     // Initial Setup
     map.setCenter(new GLatLng(startLat, startLong), 7);
     
     // Navigation Controls
     map.addControl(new GLargeMapControl());
     map.enableDoubleClickZoom();
     
     // MarkerManager
     mgr = new MarkerManager(map);
     mgr.addMarkers(getComputerCoordinates(), 7);
     mgr.refresh();
     */
});

//---------------------------------------------------------
/*
 // Get all the lat/long coordinates
 function getComputerCoordinates(){
 var batch = [];
 var deviceNum = $(".longitude").size();
 for (var i = 0; i < deviceNum; ++i) {
 batch.push(new GMarker(getDevicePoints(), {
 icon: getComputerIcon()
 }));
 }
 return batch;
 
 }
 // This function will return an array of coordinate points
 function getDevicePoints(){
 var lat = 37.332852841224856;
 var lng = -121.90627098083496;
 return new GLatLng(Math.round(lat * 10) / 10, Math.round(lng * 10) / 10);
 }
 function getComputerIcon(){
 var icon = new GIcon();
 icon.image = "../images/computer.png";
 icon.iconAnchor = new GPoint(16, 16);
 icon.infoWindowAnchor = new GPoint(16, 0);
 icon.iconSize = new GSize(32, 32);
 return icon;
 }
 */
//------------------------------------------------

function generateDeviceName(){
	var deviceBound = $("#deviceBound").val();
	if (typeof deviceBound !== "undefined" && deviceBound === "true") {
		return;
	}

    var deviceName = $.browser.OS + " " + $.browser.browser + " #";
    SP.api.getNextDeviceName(deviceName, function(header, data){
        $('.deviceName').val(data.nextDeviceName);
    });
}

function enableDisableDeviceName(boxName, bind){
    if (bind === true) {
        if (boxName.checked === true) {
            $("#deviceName").removeAttr("disabled");
            $("#computername").slideDown("fast");
            $("#bindlabel").addClass("label");
            $("#dontbindlabel").removeClass("label");
        }
        else {
            $("#deviceName").attr("disabled", "disabled");
            $("#computername").slideUp("fast");
            $("#bindlabel").removeClass("label");
            $("#dontbindlabel").addClass("label");
        }
    }
    else {
        if (boxName.checked === false) {
            $("#deviceName").removeAttr("disabled");
            $("#computername").slideDown("fast");
            $("#bindlabel").addClass("label");
            $("#dontbindlabel").removeClass("label");
        }
        else {
            $("#deviceName").attr("disabled", "disabled");
            $("#computername").slideUp("fast");
            $("#bindlabel").removeClass("label");
            $("#dontbindlabel").addClass("label");
        }
    }
}

$(document).ready(function() {	
	//select all the a tag with name equal to modal
	$('a[name=modal]').click(function(e) {
	    //Cancel the link behavior
	    e.preventDefault();
	    //Get the A tag
	    var id = $(this).attr('href');
 
	    //Get the screen height and width
//	    var maskHeight = $(document).height();
//	    var maskWidth = $(window).width();
 
	    //Set height and width to mask to fill up the whole screen
//	    $('#mask').css({'width':maskWidth,'height':maskHeight});
//	    $('#mask').css({'width':'100%','height':'100%'});
     
	    //transition effect     
	    $('#mask').fadeIn(250);    
	    $('#mask').fadeTo("fast",0.8);  
 
	    //Get the window height and width
//	    var winH = $(window).height();
//	    var winW = $(window).width();
           
	    //Set the popup window to center
//	    $(id).css('top',  winH/2-$(id).height()/2);
//	    $(id).css('left', winW/2-$(id).width()/2);
 
	    //transition effect
	    $(id).fadeIn(500); 
 
	});

	//if close button is clicked
	$('.window .close').click(function (e) {
	    //Cancel the link behavior
	    e.preventDefault();
	    $('#mask, .window').hide();
	});     
 
	//if mask is clicked
	$('#mask').click(function () {
	    $(this).hide();
	    $('.window').hide();
	});

});
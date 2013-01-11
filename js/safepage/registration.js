$(function(){

	// VARIABLES
	var BASE_IMAGE_PATH = "/servlet/image/getImage?imagePath=";
	var DUMMY_PASSWORD = "********";
	var passwordHasNumberRegex = /[\d]/;
	var passwordHasLetterRegex = /[a-zA-Z]/;
	// email regex: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
	// plus enabling uppercase letters
	var emailRegex = new RegExp("^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$");
	var phoneRegex = /^[\d]{3}[-. ]?[\d]{3}[-. ]?[\d]{4}$/;

	var passwordValid = false, 
		emailValid = false, 
		phoneValid = false;

	var form = $('#registrationForm'),
		submitButton = form.find('#submitRegistrationButton'),
		errors = [];

	// UTILITIES
	
	function log(message){
		if( typeof console != 'undefined'){
			errors.push( message );
			console.log( message );
		}else{
			errors.push( message );
		}
	}

	function getImageCategories(callback){
		$.post('/api/image/browseTwoWayImageCategories', function(categories){
			if( categories ){
				categories = categories.spData.root;
				// categories = [
				// 	{"category":"All Images"},
				// 	{"category":"Nature and Animals"},
				// 	{"category":"Food and Beverages"},
				// 	{"category":"House and Home"},
				// 	{"category":"Business and Technology"},
				// 	{"category":"Sports and Leisure"},
				// 	{"category":"Travel and Culture"}
				// ];
				var list = $("#imageCategoryList");
				for( var i = 0; i < categories.length; i++ ){
					list.append('<li class="image-category'+(i == 0 ? ' active': '')+'">'+ categories[i].category +'</li>');
				}
				// wire up the security image category switching
				// when we receive all the categories from the server
				$('#imageCategoryList li').click(function(){
					$('#imageCategoryList li').each(function(index, element){
						$(element).removeClass('active');
					});
					// select this category as active
					$(this).addClass('active');
					// get the images for this category
					getImagesForCategory( $(this).html() );
				});
				// pass all categories to the callback
				if( callback ){
					callback(categories);
				}
			}else{
				log('server returned invalid data for: /api/image/browseTwoWayImageCategories');
			}
		}, 'json');
	}

	function getImagesForCategory(categoryName){
		var params = categoryName ? { imageCategory: categoryName } : null;
		$.post('/api/image/browseTwoWayImages', params, function(images){
			if( images ){
				// clear selection
				$('#securityImageGrid td').removeClass('active');

				// images = {"root":[{"altText":"Nature and Animals 601","path":"IAN_CL1_PX01562.jpg"},{"altText":"Nature and Animals 601","path":"IAN_CL1_PX01562.jpg"},{"altText":"Nature and Animals 505","path":"IAN_CL1_PX01216.jpg"},{"altText":"Nature and Animals 581","path":"IAN_CL1_PX00741.jpg"},{"altText":"Nature and Animals 595","path":"IAN_CL1_PX01613.jpg"},{"altText":"Nature and Animals 502","path":"IAN_CL1_PX01445.jpg"},{"altText":"Nature and Animals 519","path":"IAN_CL1_PX01601.jpg"},{"altText":"Nature and Animals 527","path":"IAN_CL1_PX00859.jpg"},{"altText":"Nature and Animals 528","path":"IAN_CL1_PX01101.jpg"}]} 

				images 			= images.spData.root;
				var imageTags 	= $("#securityImageGrid img");
				// update the security image grid
				for( var i = 0; i < images.length && i < imageTags.length; i++ ){
					$(imageTags[i]).attr('src', BASE_IMAGE_PATH + images[i].path);
				}
				// if we don't have a default security image for this
				// registration, set it now
				if( $("#securityImage").attr('src') == '' ){
					$("#securityImage").attr('src', BASE_IMAGE_PATH + images[0].path );
					$("#imagePath").val( images[0].path );
				}
			}else{
				log('server returned invalid data for: /api/image/browseTwoWayImages');
			}
		}, 'json');
	}

	// FORM UTILITY FUNCTIONS

	function updateSubmitButtonState(){
		if( passwordValid && emailValid && phoneValid ){
			submitButton.removeAttr('disabled');
		}else{
			submitButton.attr('disabled', 'disabled');
		}
	}
	function addErrorClasses( $input ){
		$input = $($input);
		$input.addClass('error');
		$input.removeAttr("disabled");
		$input.parents('.clearfix').addClass('error');

		// Uncomment to allow positive feedback
		// $input.removeClass('success');
		// $input.parents('.clearfix').removeClass('success');
	}
	function removeErrorClasses( $input ){
		$input = $($input);
		$input.removeClass('error');
		$input.parents('.clearfix').removeClass('error');

		// Uncomment to allow positive feedback
		// $input.addClass('success');
		// $input.parents('.clearfix').addClass('success');
	}
	function updateFormFeedback( success, $input ){
		if( success ){
			removeErrorClasses( $input );
		}else{
			addErrorClasses( $input );
		}
		// updateSubmitButtonState();
	}

	// FORM VALIDATION HANDLERS

	function validatePassword(){
		var self = $("#passwordInput");
		var value = self.val();
		var isDummyPassword = value == DUMMY_PASSWORD;
		passwordValid = isDummyPassword || (value && value.length >= 8 && value.length <= 25
						&& passwordHasNumberRegex.test( value ) 
						&& passwordHasLetterRegex.test( value ));
		updateFormFeedback( passwordValid, self );
	}

	function validateEmail(){
		var self = $("#emailInput");
		emailValid = (self.val().length<=50) && (self.val().indexOf("'") == -1) && (self.val().indexOf('"') == -1) && emailRegex.test( self.val() );
		updateFormFeedback( emailValid, self );
		if( !emailValid ){
			$('#emailHelpBlock').html('Must be a valid email address, 50 characters or less.');
		}else{
			$('#emailHelpBlock').html('');
		}
	}

	function validatePhone(){
		var self = $("#phoneInput");
		phoneValid = phoneRegex.test( self.val() );
		updateFormFeedback( phoneValid, self );
		if( phoneValid ){
			var val = self.val();
			val = val.replace(/[^\d]/g,'');
			val = val.substr(0,3) + '-' + val.substr(3,3) + '-' + val.substr(6,4);
			self.val( val );
		}else{
			$('#phoneHelpBlock').html('Please enter a valid 10 digit phone number.');
		}
	}

	function validateAll(){
		validatePassword();
		validateEmail();
		validatePhone();
	}

	// clear out the dummy password from the password input if it's in there
	form.find('#passwordInput').focus(function(){
		if( $('#passwordInput').val() == DUMMY_PASSWORD ){
			$('#passwordInput').val('');
		}
	});

	// if user changes the username *and* password is a dummy one, it means that the user was redirected and we're assuming that 
	// the password is already part of the session, but since the user is changing the username, she needs to reenter the password
	// as well, so clear the password field.
	form.find('#emailInput').focus(function(){
		if( $('#passwordInput').val() == DUMMY_PASSWORD ){
			$('#passwordInput').val('');
		}
	});

	// validate password field input
	form.find('#passwordInput').blur(function(){
		validatePassword();
	});

	// validate email field input
	form.find('#emailInput').blur(function(){
		validateEmail();
	});

	// validate phone field input
	form.find('#phoneInput').blur(function(){
		validatePhone();
	});

	
	// EVENT HANDLERS

	// wire up the form's submit
	form.submit(function(event){
		event.preventDefault();

		validateAll();
		var valid = passwordValid && emailValid && phoneValid;
		if( valid ){
			_kmq.push(['record','sign up button_registration v2']);
			var form = this;
			setTimeout(function () {
				if( $("#passwordInput").val() == DUMMY_PASSWORD ){
					$("#passwordInput").val('');
				}
	        	form.submit();
	    	}, 500); // in milliseconds
		}
		return false;
	});

	// wire up the submit button
	submitButton.mousedown(function(){
		form.find('#phoneInput').val( form.find('#phoneInput').val().replace(/[^\d]/g,'') );
	});
	// wire up the toggler for changing to image selection mode
	$('#changeImageLink').mousedown(function(){
		$('#registrationContainer').fadeToggle(function(){
			$('#imageSelectionContainer').fadeToggle();
		});
	});
	// wire up the security image selector ok and cancel buttons
	$('#securityImageConfirmationButton, #securityImageCancelButton').mousedown(function(){
		$('#imageSelectionContainer').fadeToggle(function(){
			$('#registrationContainer').fadeToggle();
		});
	});
	// wire up the security image selector ok button
	$("#securityImageConfirmationButton").mousedown(function(){
		var imageUrl = $('#securityImageGrid td[class*=active] img').attr('src');
		log('chose security image image url: ' + imageUrl );
		var imagePath = imageUrl;
		if (imagePath) {
			imagePath = imagePath.replace(BASE_IMAGE_PATH, "");
		}
		$("#imagePath").val( imagePath );
		$("#securityImage").attr('src', imageUrl);
	});
	// wire up clicking on a security image
	$("#securityImageGrid img").mousedown(function(){
		$('#securityImageGrid td').removeClass('active');
		$(this).parent('td').addClass('active');
	});
	// wire up the more images link
	$("#moreImagesLink").mousedown(function(){
		getImagesForCategory( $('#imageCategoryList li.active').html() );
	});

	// METRICS TRACKING
	
	// wire up kissmetrics for submit button click
	// _kmq.push(['trackSubmit', 'registrationForm', 'sign up button_registration v2']);
	// submitButton.mousedown(function(){
	// 	_kmq.push(['record','sign up button_registration v2']);
	// });
	// wire up kissmetrics event for clicking on the security info modal trigger
	$("#showSecurityInfoLink").mousedown(function(){
		_kmq.push(['record','security button_registration v2']);
	});
	// wire up kissmetrics for clicking to change the security image
	$("#changeImageLink").mousedown(function(){
		_kmq.push(['record','open security image button_registration v2']);
	});
	// wire up kissmetrics for actually selecting a new security image
	$("#securityImageConfirmationButton").mousedown(function(){
		_kmq.push(['record','change security image button_registration v2']);
	});
	// wire up kissmetrics for clicking the terms of service link
	$("#termsOfUseLink").mousedown(function(){
		_kmq.push(['record','terms of use button_registration v2']);
	});
	
	//GA TRACKING
	
	//read utmz cookie set up google analytics on our domain
	//helpful in tracking where a user came from (search engine, search keyword, link)
	//sample cookie value:s_nr=1323275903548-Repeat; s_vnum=1325404800227%26vn%3D6; __utma=235431070.457906265.1322864344.1323199753.1323274505.8; __utmz=235431070.1323134010.6.3.utmcsr=joetest|utmccn=test3|utmcmd=Ravitest|utmcct=RaviGmoney; exp_last_visit=1323105359; exp_last_activity=1323275902;
	function getUTMZCookie(){
		try{
			var docCookie=document.cookie;
			var utmzIndex=docCookie.indexOf('__utmz');
			return utmzIndex>=0?docCookie.substring(utmzIndex).split(';')[0]:'';
		}catch(e){
			return '';
		}
	};
	var utmz=getUTMZCookie();
	//if utmz cookie value exists pass it along
	if(utmz.length>0){
		$("#marketingSource").val('ga_registration');
		$("#marketingParam").val(utmz);
	}

	// INIT

	function init(){
		//set cmsurl for footer links
		if(cmsUrl){
			var cmsLiItems=$("#footerContainer .cmsHref");
			cmsLiItems.each(function(){
				this.href=cmsUrl+$(this).attr("href");
			});
			$("#footerContainer").show();
		}
		// initialize security images
		getImageCategories(function(categories){
			getImagesForCategory( categories[0].category );
		});
		var focusedInput = false;
		if($("#emailInput").val() != ''){
			validateEmail();
		}else{
			$("#emailInput").focus();
			focusedInput = true;
		}
		if($("#passwordInput").val() != ''){
			validatePassword();
		}else if (!focusedInput){
			$("#passwordInput").focus();
			focusedInput = true;
		}
		if($("#phoneInput").val() != ''){
			validatePhone();
		}else if (!focusedInput){
			$("#phoneInput").focus();
		}
		//pass browser properties to kissmetrics
		if(BrowserDetect && BrowserDetect.browser && BrowserDetect.version)
			_kmq.push(['set', {'Browser' : BrowserDetect.browser + " " +BrowserDetect.version }]);
	}
	
	init();
});
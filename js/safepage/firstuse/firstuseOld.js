$(function(){
	window.PersonalCapital = window.PersonalCapital || {};
	window._kmq = window._kmq || [];
	welcomePopup.init();
});
var welcomePopupRouter = Backbone.Router.extend({
	routes:{
		'welcomePopup/:id': 'showWelcomePopup'
	}
	, showWelcomePopup: function(id){
		welcomePopup.clearContainer();
		switch(id){
			case '1': {
				new welcomePopup1();
				break;
			}
			case '2': {
				new welcomePopup2();
				break;
			}
			default: {
				new welcomePopup1();
			}
		}
	}
});
var welcomePopup = {
	container: $('#firstUseScreen')
	, init: function(){
		// hide double-scrollbars for now
		$("#bodyContainer").css('min-height', '0px');
		
		//wire router
		var router = new welcomePopupRouter();
		Backbone.history.start({root: '/page/login/goPfa'});
		
		//fail-safe navigation if optimizely fails
		setTimeout(function(){
			if(window.location.hash == '#/welcomePopup'){
				welcomePopup.container.find('.variantLoader').show();
			}
		}, 500);
		setTimeout(function(){
			if(window.location.hash == '#/welcomePopup'){
				//trigger kissmetrics to indicate optimizely has failed
				try{
					_kmq.push(['record','Welcome Pop-up Optimizely Failed']);
				}catch(e){}
				router.navigate('#/welcomePopup/1', {trigger: true, replace: true});
			}
		}, 2500);
		
		// override contact us link click event to close the welcome dialog
		$('#firstUseScreen .footerContainer a[class!="cmsHref"]').click(function(e){
			e.preventDefault();
			welcomePopup.close(true);
			window.location.replace($(this).attr('href'));
		});
	}
	, enableSwfHeightResizing: function(){
		var self = this;
		if( typeof BrowserUtils != 'undefined' ){
			try{
				BrowserUtils.enableSwfHeightResizing();
			}catch(e){
				if( typeof console != 'undefined' ){
					console.log(e);
				}
			}
		}else{
			// try again when it's available
			setTimeout(function(){
				// console.log(self);
				self.enableSwfHeightResizing();
			},1000);
		}
	}
	, close: function(disableRedirect){
		//remove backbone history event handler
		Backbone.history.stop();
		
		//check for flash and redirect
		if( window.PFA_FLASH_SUPPORTED === true){
			if( disableRedirect !== true ){
				if( typeof redirectTo == 'string' && redirectTo != '' ){
	            	//window.location = redirectTo;
	            	window.location.replace(redirectTo);
              	}else{
					//window.location = "#/accounts/add";
					window.location.replace('#/accounts/add');
				}
			}
			//hide welcome popup container
			this.container.hide();
			
			// enable flash resizing now
			$("#bodyContainer").css('min-height', '700px');
			this.enableSwfHeightResizing();
		}else{
			//window.location = '/page/login/redirectFlash';
			window.location.replace('/page/login/redirectFlash');
		}
	}
	, trackSuccessfulSubmission: function(){
		var rand = Math.random() + "";
		var rand = rand * 100000;
		var wsodHTML = '<iframe src="//ad.wsod.com/activity/3d6bcab09d0adfe7fd69dcc5d841e73a/4.iframe.activity/'+rand+'" width="1" height="1" frameborder="0"></iframe>';
		$('body').append(wsodHTML);
	}
	, clearContainer: function(){
		this.container.find('.variantLoader').hide();
		$("div.variant").hide();
	}
};
var urlHashChange = function(){
	var urlHash = this.location.hash;
	$("div.variant").hide();
	switch(urlHash){
		case '#/welcomePopup1':{
			new welcomePopup1();
			break;
		}
		case '#/welcomePopup2':{
			new welcomePopup2();
			break;
		}
		default: {
			new welcomePopup1();
		}
	}
}
/*
 * WELCOME POPUP 1
 */
var welcomePopup1 = function(){
	// validations
	this.ageValidator 			= /^[0-9]{2,3}$/;
	this.firstNameValidator 	= /^[a-zA-Z0-9_\-]{3,}$/;

	this.container				= $("#variant1");
	this.firstUseScreen			= $('#firstUseScreen');
	this.submitButton			= this.container.find('#investmentProfileForm .btn-submit');
	this.firstNameInput			= this.container.find('input[name=firstName]');
	this.ageInput				= this.container.find('input[name=age]');
	this.retirementHorizonInput	= this.container.find('select[name=retirementHorizon]');
	this.riskToleranceInput		= this.container.find('input:radio[name=riskTolerance]');
	this.investableAssetsInput	= this.container.find('input:radio[name=investableAssets]');

	this.init();
}
welcomePopup1.prototype.init = function(){
	var self = this;

	// wire security info hide/show
	this.container.find('#securityInfoLink').click(function(e){
		e.preventDefault();
		$('#light').fadeIn();
		$('#fade').fadeIn();
	});
	this.firstUseScreen.find('#closeSecurityInfoLink').click(function(e){
		e.preventDefault();
		$('#light').fadeOut();
		$('#fade').fadeOut();
	});

	// wire skip step - variant1
	this.container.find('.skipStep').click(function(){
		_kmq.push(['record','Skip Step Button_Welcome Pop-up 1']);
		welcomePopup.close(false);
	});
	
	// wire the form submission - variant1
	$(this.submitButton).click(function(event){
		event.preventDefault();
		self.submit();
		return false;
	});

	// on init, get the existing investment profile, if any
	PersonalCapital.services.InvestmentProfile.get(function(response){
		if( response && response.spHeader.success === true ){
			self.populateFirstUseForm(response.spData);
		}
	});
	
	this.container.show();
	_kmq.push(['record','Viewed Welcome Pop-up 1']);
};	
welcomePopup1.prototype.populateFirstUseForm = function(profile){
	if( profile.age ){
		$(this.ageInput).val(profile.age)
	}
	if( profile.firstName ){
		$(this.firstNameInput).val(profile.firstName);
	}
	if( profile.retirementHorizon ){
		$(this.retirementHorizonInput).val(profile.retirementHorizon);
	}
	if( profile.investableAssets ){
		$(this.container.find('input:radio[name=investableAssets][value='+profile.investableAssets+']'))
			.attr('checked','checked')
	}
	if( profile.riskTolerance ){
		$(this.container.find('input:radio[name=riskTolerance][value='+profile.riskTolerance+']'))
			.attr('checked','checked')	
	}
};

welcomePopup1.prototype.submit = function(){

	var firstName 				= $(this.firstNameInput).val();
	var age 					= $(this.ageInput).val();
	var retirementHorizon 		= this.container
									.find('select[name=retirementHorizon] option:selected').val();
	var riskTolerance 			= this.container
									.find('input:radio[name=riskTolerance]:checked').val();
	var investableAssets 		= this.container
									.find('input:radio[name=investableAssets]:checked').val();

	var validFirstName 			= firstName && firstName.match(this.firstNameValidator);
	var validAge 				= age && age.match(this.ageValidator);
	var validRetirementHorizon 	= retirementHorizon != '';		
	var validInvestableAssets 	= investableAssets != undefined;
	var validRiskTolerance 		= riskTolerance != undefined;

	$('.error-message').removeClass('error-message');

	if( validFirstName 
		&& validAge 
		&& validRetirementHorizon 
		&& validInvestableAssets 
		&& validRiskTolerance ){
		// form inputs are good, post to server
		// disable submit button
		$(this.submitButton).attr('disabled', 'disabled').val('Saving');

		var params = {
			firstName: firstName,
			age: age,
			retirementHorizon: retirementHorizon,
			riskTolerance: riskTolerance,
			investableAssets: investableAssets
		};

		if( typeof PersonalCapital != 'undefined' 
			&& PersonalCapital.services != undefined
			&& PersonalCapital.services.InvestmentProfile != undefined ){
			PersonalCapital.services.InvestmentProfile.update( params, function(response){
				// console.log( response );
				if( response.spHeader.success !== true ){
					var jsonParams;
					try{
						jsonParams = JSON.stringify(params);
					}catch(e){}
					PersonalCapital.services.Feedback.send('HTML First Use Submission Error', jsonParams );
				}
			});
			_kmq.push(['record','Save & Next Button_Welcome Pop-Up 1', {'AssetEstimate': investableAssets}]);
		}

		welcomePopup.trackSuccessfulSubmission();
		welcomePopup.close();
	}else{
		// form inputs failed validation, show messages
		if( !validFirstName ){
			$(this.firstNameInput).addClass('error-message');
		}
		if( !validAge ){
			$(this.ageInput).addClass('error-message');
		}
		if( !validRetirementHorizon ){
			$(this.retirementHorizonInput).addClass('error-message');
		}
		if( !validInvestableAssets ){
			$(this.container.find('#investableAssets')).addClass('error-message');
		}
		if( !validRiskTolerance ){
			$(this.container.find('#riskTolerance')).addClass('error-message');
		}
	}
	return false;
};
/*
* WELCOME POP UP 2
*/
var welcomePopup2 = function(){
	// validations
	this.ageValidator 			= /^[0-9]{2,3}$/;
	this.firstNameValidator 	= /^[a-zA-Z0-9_\-]{3,}$/;

	this.container				= $("#variant2");
	this.firstUseScreen			= $('#firstUseScreen');
	this.submitButton			= this.container.find('#investmentProfileForm .btn-submit');
	this.firstNameInput			= this.container.find('input[name=firstName]');
	this.ageInput				= this.container.find('input[name=age]');
	this.retirementHorizonInput	= this.container.find('select[name=retirementHorizon]');
	this.riskToleranceInput		= this.container.find('input:radio[name=riskTolerance]');
	this.investableAssetsInput	= this.container.find('input:radio[name=investableAssets]');

	this.init();
}
welcomePopup2.prototype.init = function(){
	var self = this;

	// wire security info hide/show
	this.container.find('#securityInfoLink').click(function(e){
		e.preventDefault();
		$('#light').fadeIn();
		$('#fade').fadeIn();
	});
	this.firstUseScreen.find('#closeSecurityInfoLink').click(function(e){
		e.preventDefault();
		$('#light').fadeOut();
		$('#fade').fadeOut();
	});

	// wire skip step - variant2
	this.container.find('.skipStep').click(function(){
		_kmq.push(['record','Skip Step Button_Welcome Pop-up 2']);
		welcomePopup.close(false);
	});
	
	// wire the form submission - variant2
	$(this.submitButton).click(function(event){
		event.preventDefault();
		self.submit();
		return false;
	});

	// on init, get the existing investment profile, if any
	PersonalCapital.services.InvestmentProfile.get(function(response){
		if( response && response.spHeader.success === true ){
			self.populateFirstUseForm(response.spData);
		}
	});
	
	this.container.show();
	_kmq.push(['record','Viewed Welcome Pop-up 2']);
};	
welcomePopup2.prototype.populateFirstUseForm = function(profile){
	if( profile.age ){
		$(this.ageInput).val(profile.age)
	}
	if( profile.firstName ){
		$(this.firstNameInput).val(profile.firstName);
	}
	if( profile.retirementHorizon ){
		$(this.retirementHorizonInput).val(profile.retirementHorizon);
	}
	if( profile.investableAssets ){
		$('input:radio[name=investableAssets][value='+profile.investableAssets+']')
			.attr('checked','checked')
	}
	if( profile.riskTolerance ){
		$('input:radio[name=riskTolerance][value='+profile.riskTolerance+']')
			.attr('checked','checked')	
	}
};

welcomePopup2.prototype.submit = function(){

	var firstName 				= $(this.firstNameInput).val();
	var age 					= $(this.ageInput).val();
	var retirementHorizon 		= this.container
									.find('select[name=retirementHorizon] option:selected').val();
	var riskTolerance 			= this.container
									.find('input:radio[name=riskTolerance]:checked').val();
	var investableAssets 		= this.container
									.find('input:radio[name=investableAssets]:checked').val();

	var validFirstName 			= firstName && firstName.match(this.firstNameValidator);
	var validAge 				= age && age.match(this.ageValidator);
	var validRetirementHorizon 	= retirementHorizon != '';		
	var validInvestableAssets 	= investableAssets != undefined;
	var validRiskTolerance 		= riskTolerance != undefined;

	$('.error-message').removeClass('error-message');

	if( validFirstName 
		&& validAge 
		&& validRetirementHorizon 
		&& validInvestableAssets 
		&& validRiskTolerance ){
		// form inputs are good, post to server
		// disable submit button
		$(this.submitButton).attr('disabled', 'disabled').val('Saving');

		var params = {
			firstName: firstName,
			age: age,
			retirementHorizon: retirementHorizon,
			riskTolerance: riskTolerance,
			investableAssets: investableAssets
		};

		if( typeof PersonalCapital != 'undefined' 
			&& PersonalCapital.services != undefined
			&& PersonalCapital.services.InvestmentProfile != undefined ){
			PersonalCapital.services.InvestmentProfile.update( params, function(response){
				// console.log( response );
				if( response.spHeader.success !== true ){
					var jsonParams;
					try{
						jsonParams = JSON.stringify(params);
					}catch(e){}
					PersonalCapital.services.Feedback.send('HTML First Use Submission Error', jsonParams );
				}
			});
			_kmq.push(['record','Save & Next Button_Welcome Pop-Up 2', {'AssetEstimate': investableAssets}]);
		}

		welcomePopup.trackSuccessfulSubmission();
		welcomePopup.close();
	}else{
		// form inputs failed validation, show messages
		if( !validFirstName ){
			$(this.firstNameInput).addClass('error-message');
		}
		if( !validAge ){
			$(this.ageInput).addClass('error-message');
		}
		if( !validRetirementHorizon ){
			$(this.retirementHorizonInput).addClass('error-message');
		}
		if( !validInvestableAssets ){
			$(this.container.find('#investableAssets')).addClass('error-message');
		}
		if( !validRiskTolerance ){
			$(this.container.find('#riskTolerance')).addClass('error-message');
		}
	}
	return false;
};
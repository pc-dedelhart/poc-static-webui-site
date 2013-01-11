$(function(){
	window.PersonalCapital = window.PersonalCapital || {};

	var FirstUse = function(){
		// validations
		this.ageValidator 			= /^[0-9]{2,3}$/;
		this.firstNameValidator 	= /^[a-zA-Z0-9_\-]{3,}$/;

		this.firstUseScreen			= $('#firstUseScreen');
		this.submitButton			= $(this.firstUseScreen).find('#investmentProfileForm .btn-submit');
		this.firstNameInput			= $('input[name=firstName]');
		this.ageInput				= $('input[name=age]');
		this.retirementHorizonInput	= $('select[name=retirementHorizon]');
		this.riskToleranceInput		= $('input:radio[name=riskTolerance]');
		this.investableAssetsInput	= $('input:radio[name=investableAssets]');
		this.contactUsLink			= $('#firstUseScreen .footerContainer a[class!="cmsHref"]');

		this.init();
	};

	FirstUse.prototype.init = function(){
		var self = this;

		// wire security info hide/show
		$(this.firstUseScreen).find('#securityInfoLink').click(function(){
			$('#light').fadeIn();
			$('#fade').fadeIn();
		});
		$(this.firstUseScreen).find('#closeSecurityInfoLink').click(function(){
			$('#light').fadeOut();
			$('#fade').fadeOut();
		});

		// wire skip step - variant1
		$(this.firstUseScreen).find('.skipStep').click(function(){
			window._kmq = window._kmq || [];
			_kmq.push(['record','Skip Step Button_Welcome Pop-up']);
			self.closeFirstUse(false);
		});
		
		// wire the form submission - variant1
		$(this.submitButton).click(function(event){
			event.preventDefault();
			self.submit();
			return false;
		});
		
		//wire hasAdvisor anchor elements - variant2
		$(this.firstUseScreen).find('.hasAdvisor').click(function(e){
			e.preventDefault();
			self.closeFirstUse(false);
		});

		// on init, get the existing investment profile, if any
		PersonalCapital.services.InvestmentProfile.get(function(response){
			if( response && response.spHeader.success === true ){
				self.populateFirstUseForm(response.spData);
			}
		});

		// init contact us link
		$(this.contactUsLink).click(function(){
			self.closeFirstUse(true);
		});

		// hide double-scrollbars for now
		$("#bodyContainer").css('min-height', '0px');
	};	

	FirstUse.prototype.enableSwfHeightResizing = function(){
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
	};

	FirstUse.prototype.closeFirstUse = function(disableRedirect){
		if( window.PFA_FLASH_SUPPORTED === true){
			if( disableRedirect !== true ){
				if( typeof redirectTo == 'string' && redirectTo != '' ){
	            	window.location = redirectTo;
              	}else{
					window.location = "#/accounts/add";
				}
			}
			$(this.firstUseScreen).hide();
			// enable flash resizing now
			$("#bodyContainer").css('min-height', '700px');
			this.enableSwfHeightResizing();
		}else{
			window.location = '/page/login/redirectFlash';
		}
	};

	FirstUse.prototype.trackSuccessfulSubmission = function(){
		var rand = Math.random() + "";
		var rand = rand * 100000;
		var wsodHTML = '<iframe src="//ad.wsod.com/activity/3d6bcab09d0adfe7fd69dcc5d841e73a/4.iframe.activity/'+rand+'" width="1" height="1" frameborder="0"></iframe>';
		$('body').append(wsodHTML);
	};

	FirstUse.prototype.populateFirstUseForm = function(profile){
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

	FirstUse.prototype.submit = function(){

		var firstName 				= $(this.firstNameInput).val();
		var age 					= $(this.ageInput).val();
		var retirementHorizon 		= $(this.firstUseScreen)
										.find('select[name=retirementHorizon] option:selected').val();
		var riskTolerance 			= $(this.firstUseScreen)
										.find('input:radio[name=riskTolerance]:checked').val();
		var investableAssets 		= $(this.firstUseScreen)
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
				window._kmq = window._kmq || [];
				_kmq.push(['record','Save & Next Button_Welcome Pop-Up', {'AssetEstimate': investableAssets}]);
			}

			this.trackSuccessfulSubmission();
			this.closeFirstUse();
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
				$('#investableAssets').addClass('error-message');
			}
			if( !validRiskTolerance ){
				$('#riskTolerance').addClass('error-message');
			}
		}
		return false;
	};

	PersonalCapital.FirstUse = new FirstUse();
	
	window._kmq = window._kmq || [];
	_kmq.push(['record','Viewed Welcome Pop up']);

		// This is ugly because we are overlaying the welcome screen on top of PFA
	$('#main-navigation').on('click', 'li', function(){
		try{
			// when clicking on a menu item we want to close first use
			// but not redirect ourselves since the user is choosing where to go
			PersonalCapital.FirstUse.closeFirstUse(true);
		}catch(e){}
	});
});
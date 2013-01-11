/** TODO: 
	- unit tests!
**/

$(function(){

	window.PersonalCapital = window.PersonalCapital || {};

	function log(msg){
		if( typeof console != 'undefined' ){
			console.log( msg );
		}
	}

	/**
		Class that implements and manages sidebar functionality.
	**/
	function Sidebar(element){
		// setup
		this.element 				= $(element);
		this.accountListElement 	= this.element.find('.accountList');
		this._forceOpenedSidebar 	= false;
		this._initializeEvents();
		this._initializeTemplates();
		this._initializePinger();
		this._initializeHighlighter();
	}

	// NOTE: this function is used by sitemanager.js to notify
	// the sidebar when it needs to update, do not modify this
	// function without modifying sitemanager.js#handleSafePageHeaders
	Sidebar.prototype.onExternalServerChange = function(serverChanges){
		var self = this;
		setTimeout(function(){
			self._onExternalServerChange.call(self,serverChanges);
		}, 150);
	};

	Sidebar.prototype._onExternalServerChange = function(serverChanges){
		window.wee = this;
		if( serverChanges ){
			for( var i = 0; i < serverChanges.length; i++ ){
				if( serverChanges[i].serverChangeId > this.pinger.lastServerChangeId ){
					this.pinger.lastServerChangeId = serverChanges[i].serverChangeId;
				}
			}
			var self = this;
			PersonalCapital.services.Accounts.get(function(){
				self.updateAccountsList.apply(self,arguments);
			});
		}
	};

	Sidebar.prototype._initializeHighlighter = function(){
		var self = this;
		$(window).hashchange( function(){
			self.handleHashChange();
		});
	};

	Sidebar.prototype.handleHashChange = function(){
		var self = this;
		log( 'hash changed: ' + location.hash );

		// de-highlight all
		self.accountListElement.find('li').removeClass('sidebar-highlight');

		var hash = location.hash,
			selector,
			targetElement;
		if( hash.match(/ua=/) ){
			// highlight by data-account-id
			selector = hash.match(/ua=[0-9]+/)[0].substring(3);
			targetElement = self.accountListElement.find('li[data-account-id='+selector+']').addClass('sidebar-highlight');
		}else if( hash.match(/userProductId=/) ){
			// highlight by data-product-id
			selector = hash.match(/userProductId=[0-9]+/)[0].substring(14);
			targetElement = self.accountListElement.find('li[data-product-id='+selector+']').addClass('sidebar-highlight');
		}

		// attempt to scroll to element in the page and expand the appropriate category group
		try{
			if( targetElement ){
							log( targetElement );
				// slide toggling
				var groupArrow = $(targetElement).closest('.accountGroup').find('.arrow');
				if( groupArrow.length > 0 
					&& $(groupArrow).hasClass('arrow-close') ){
					$(groupArrow).removeClass('arrow-close').addClass('arrow-open');
					$(targetElement).closest('ul').slideToggle();
				}

				var accountListHeight = $(self.accountListElement).height(),
					anchorOffsetTop = $(self.accountListElement).find('.accountListAnchor').position().top,
					currentScrollTop = $(self.accountListElement).scrollTop(),
					targetOffsetTop = $(targetElement).position().top;

				// console.log('target position top: ' + targetOffsetTop ); 

				if( targetOffsetTop < 0 || targetOffsetTop > accountListHeight ){
					if( targetOffsetTop < 0 ){
						targetOffsetTop = Math.abs(anchorOffsetTop - targetOffsetTop);
					}else{
						targetOffsetTop = targetOffsetTop + currentScrollTop;
					}
					// console.log('current scroll position: ' + $(self.accountListElement).scrollTop() ); 
					// console.log('scrolling to: ' + targetOffsetTop ); 

					$(self.accountListElement).animate({
						scrollTop: targetOffsetTop + 'px'
					}, 'fast');
				}
			}
		}catch(e){
			log(e);
		}
	}

	Sidebar.prototype._initializePinger = function(){
		var self = this;

		// Query Session Pinger
		self.pinger = {
			STARTUP_INTERVAL: 30000,
			STEADY_INTERVAL: 15000,
			STARTUP_LIMIT: 10,
			numberOfPings: 0,
			intervalID: -1,
			_started: false,
			lastServerChangeId: -1,
			start: function(){
				// log( 'sidebar started pinging' );
				if( self.pinger.intervalID > 0 ){return;}
				PersonalCapital.services.Accounts.get(self.updateAccountsList);
				self.pinger.ping();			
			},
			stop: function(){
				clearTimeout(self.pinger.intervalID);
				self.pinger.intervalID = -1;
			},
			ping: function(){
				self.pinger.numberOfPings++;
				PersonalCapital.services.Session.get({
					lastServerChangeId: PersonalCapital.Sidebar.pinger.lastServerChangeId
				}, PersonalCapital.Sidebar.processSession);
				var interval = self.pinger.numberOfPings > self.pinger.STARTUP_LIMIT 
								? self.pinger.STEADY_INTERVAL : self.pinger.STARTUP_INTERVAL;

				// refresh all accounts after timeout period
				if( self.pinger.numberOfPings == self.pinger.STARTUP_LIMIT ){
					PersonalCapital.services.Accounts.get(PersonalCapital.Sidebar.updateAccountsList);
				}
				log( 'ping # ' + self.pinger.numberOfPings + ' interval length: ' + interval );

				self.pinger.intervalID = setTimeout(function(){
					self.pinger.ping();
				}, interval);
			}
		};
	};

	Sidebar.prototype._initializeTemplates = function(){
		// Sidebar managed templates
		this.templates = {
			account: '<li class="account" data-product-id="{{userProductId}}" data-account-id="{{userAccountId}}">\
						{{#warningIcon}}\
							<a href="{{detailsLink}}" class="warning">\
								<img class="warningImage" src="{{warningIcon}}"/>\
							</a>\
						{{/warningIcon}}\
						<div class="fiName">\
							<a href="{{detailsLink}}" title="{{firmName}}">\
								{{firmName}}\
							</a>\
						</div>\
						<div class="balance">{{balance}}</div>\
						<div class="accountName" title="{{name}}">{{name}}</div>\
					</li>'
		};

		// compile templates
		for( var key in this.templates ){
			this.templates[key] = Hogan.compile(this.templates[key]);
		}

		this.spinnerElement = this.element.find('.spinner');
	};

	Sidebar.prototype.generateDetailsLink = function(account){
		var link = '#/accounts';
		if( account.aggregationError ){
			if( account.aggregationError.PERSISTENT_ERROR !== true ){
				link += '/authorize?changeSignInOnly=false&userProductId=' + account.userProductId;
			}else{
				// persistent errors are usually resolved via add/remove, so redirect to manage accounts
				link += '/manage';
			}
		}else{
			if( account.isEsog ){
				link += '/esogDetails?ua=' + account.userAccountId;
			}else if( account.isManualPortfolio ){
					link += '/manualInvestmentDetails?ua=' + account.userAccountId;
			}else if( account.isManual ){
				link += '/editOffline?ua=' + account.userAccountId;
			}else{
				link += '/details?ua=' + account.userAccountId;
			}
		}
		return link;
	};

	Sidebar.prototype._initializeEvents = function(){
		var self = this;

		// wire up close aggregation error notification
		self.element.find('.closeAttention').click(function(){
			self.hideAggregationNotification();
		});

		// wire up the slide-toggles
		self.element.find('[data-slide-toggle]').click(function(){
			if( $(this).hasClass('arrow-open') ){
				$(this).removeClass('arrow-open').addClass('arrow-close');
			}else{
				$(this).removeClass('arrow-close').addClass('arrow-open');
			}
			$('.' + $(this).attr('data-slide-toggle')).slideToggle();
		});

		// wire up the feedback form
		self.element.find('.launchFeedback').click(function(){
			self.element.find('.feedback').fadeIn();
		});
		self.element.find('.feedback .cancel').click(function(){
			self.element.find('.feedback').fadeOut();
			self.element.find('.feedback .feedbackSubject').removeClass('error').val('');
			self.element.find('.feedback .feedbackMessage').removeClass('error').val('');
		});
		self.element.find('.feedback .submit').click(function(){
			var subjectElement = self.element.find('.feedback .feedbackSubject')
				messageElement = self.element.find('.feedback .feedbackMessage');
			var subject = subjectElement.val(),
				message = messageElement.val();
			if( typeof subject != 'undefined' && subject != '' &&
				typeof message != 'undefined' && message != '' ){
				subjectElement.removeClass('error');
				messageElement.removeClass('error');
				PersonalCapital.services.Feedback.send(subject, message);
				self.element.find('.feedback').fadeOut();
				self.element.find('.feedback .feedbackSubject').val('');
				self.element.find('.feedback .feedbackMessage').val('');
			}else{
				subjectElement.addClass('error');
				messageElement.addClass('error');
			}
		});

		// wire up the collapse button
		self.element.find('.headerContainer .minimize').click(function(){
			try{
				minimizeSidebarSwf();
			}catch(e){
				log( e );
			}
		});
	};

	Sidebar.prototype.processSession = function(response){
		// when session times out, redirect the page
		if( response 
			&& response.spHeader 
			&& response.spHeader.authLevel != 'SESSION_AUTHENTICATED' ){
			window.location = '/';
		}

		var changes = 	response 
						&& response.spHeader 
						&& response.spHeader.SP_DATA_CHANGES 
						? response.spHeader.SP_DATA_CHANGES : [];
		var refreshRequired = false;
		for( var i = 0; i < changes.length; i++ ){
			if( changes[i].serverChangeId > PersonalCapital.Sidebar.pinger.lastServerChangeId ){
				PersonalCapital.Sidebar.pinger.lastServerChangeId = changes[i].serverChangeId;
			}
			switch( changes[i].eventType ) {
				case 'USER_SITE_ADDED':
				case 'USER_SITE_UPDATED':
				case 'USER_SITE_REMOVED':
				case 'USER_ACCOUNT_UPDATED':
				case 'USER_ACCOUNT_ADDED':
				case 'USER_HOLDING_ADDED':
				case 'USER_HOLDING_UPDATED':
				case 'USER_HOLDING_REMOVED':
					refreshRequired = true;
					break;
				case 'USER_REGISTERED':
					_kmq.push(['record','completed registration']);
					PersonalCapital.utils.Marketing.wsod(PersonalCapital.utils.Marketing.USER_REGISTERED);
					break;
				case 'USER_AGGREGATED_100K':
					PersonalCapital.utils.Marketing.wsod(PersonalCapital.utils.Marketing.USER_AGGREGATED_100K);
					break;
				case 'USER_AGGREGATED_FIRST_ACCOUNT':
					PersonalCapital.utils.Marketing.wsod(PersonalCapital.utils.Marketing.USER_AGGREGATED_FIRST_ACCOUNT);
					break;
			}
		}
		if( refreshRequired ){
			PersonalCapital.services.Accounts.get(PersonalCapital.Sidebar.updateAccountsList);
			PersonalCapital.Sidebar.refreshMainSwf(response);
		}
	};

	Sidebar.prototype.onAccountAdded = function(){
		if( this._forceOpenedSidebar !== true ){
			this._forceOpenedSidebar = true;
			PersonalCapital.services.Accounts.get(PersonalCapital.Sidebar.updateAccountsList);
			try{
				openSidebarSwf();
			}catch(e){
				log(e);
			}
		}
	};

	Sidebar.prototype.refreshMainSwf = function(response){
		if( typeof handleEventToSwf == 'function' ){
			response = JSON.stringify(response);
			handleEventToSwf('ServerChange', response);
		}
	};

	Sidebar.prototype.updateAccountsList = function(response){
		var self = PersonalCapital.Sidebar
			, Currency = PersonalCapital.utils.Currency;

		if( response && response.spHeader && response.spHeader.success === false ){
			// document.location = '/';
			log( 'API returned success = false' );
			return;
		}
		var accounts = response.spData.accounts,
			numAggregatingAccounts = 0,
			numAggregatedAccounts = 0,
			numAggregationErrors = 0,
			invalidAccounts = 0,
			html = {
				BANK: '',
				INVESTMENT: '',
				CREDIT_CARD: '',
				LOAN: '',
				MORTGAGE: '',
				OTHER_ASSETS: '',
				OTHER_LIABILITIES: ''
			},
			account = null,
			accountGroups = {
				BANK: [],
				INVESTMENT: [],
				CREDIT_CARD: [],
				LOAN: [],
				MORTGAGE: [],
				OTHER_ASSETS: [],
				OTHER_LIABILITIES: []
			},
			length = accounts ? accounts.length : 0,
			i;

		if( length > 0 && this._forceOpenedSidebar !== true ){
			this._forceOpenedSidebar = true;
			try{
				openSidebarSwf();
			}catch(e){
				log(e);
			}
		}

		// account processing loop
		for( i = 0; i < length; i++ ){
			account = accounts[i];
			// skip accounts with no UserProduct
			if( typeof account.userProductId != 'undefined' ){
				// 1. count the number of aggregating accounts
				if( account.aggregating ){
					numAggregatingAccounts++;
				}

				// 2. sort the accounts into their groups
				if (typeof accountGroups[account.productType] == 'undefined' ){
					// if for whatever reason the server returns a type that is not handled (e.g. insurance) then just skip this account.
					continue;
				}
				accountGroups[account.productType].push(account);

				// 3. floor all the balances for display
				var multiplier = account.isLiability === false ? 1 : -1;
				account.balance = Currency.format(Currency.truncate( account.balance * multiplier ));

				// ?. detect whether the aggregation error is persistent or not
				if( account.aggregationError ){
					numAggregationErrors++;
					for( var j = 0; j < account.aggregationError.tags.length; j++ ){
						account.aggregationError[ account.aggregationError.tags[j] ] = true;
					}
				}
				// generate calculated properties
				account.detailsLink = PersonalCapital.Sidebar.generateDetailsLink(account);
				if( typeof account.aggregationError != 'undefined' ){
					if( account.aggregationError.PERSISTENT_ERROR === true ){
						// if( account.aggregationError.type != 'AGENT_ERROR' ){
							account.warningIcon = '/images/sidebar/alert_16x16.png';
						// }
					}else{
						account.warningIcon = '/images/sidebar/error_16x16.png';
					}
				}
			}else{
				invalidAccounts++;
			}
		}

		// 4. sort and add the list items rendered into the proper group
		for( var key in accountGroups ){
			// 4a. sort
			accountGroups[key].sort(PersonalCapital.utils.Accounts.compare);
			// 4b. generate the html
			for( i = 0; i < accountGroups[key].length; i++ ){
				html[key] += PersonalCapital.Sidebar.templates.account.render(accountGroups[key][i]);
			}
		}
		// log(accountGroups);
		// log(html);


		// 4c. render the html and show/hide appropriate groups
		if( accountGroups.BANK.length == 0 ){
			self.accountListElement.find('.cash').hide();
		}else{
			self.accountListElement.find('.cash .accounts').html(html.BANK);
			self.accountListElement.find('.cash').show();
		}
		if( accountGroups.INVESTMENT.length == 0 ){
			self.accountListElement.find('.investment').hide();
		}else{
			self.accountListElement.find('.investment .accounts').html(html.INVESTMENT);
			self.accountListElement.find('.investment').show();
		}
		if( accountGroups.CREDIT_CARD.length == 0 ){
			self.accountListElement.find('.creditCard').hide();
		}else{
			self.accountListElement.find('.creditCard .accounts').html(html.CREDIT_CARD);
			self.accountListElement.find('.creditCard').show();
		}
		if( accountGroups.LOAN.length == 0){
			self.accountListElement.find('.loan').hide();
		}else{
			self.accountListElement.find('.loan .accounts').html(html.LOAN);
			self.accountListElement.find('.loan').show();
		}
		if( accountGroups.MORTGAGE.length == 0 ){
			self.accountListElement.find('.mortgage').hide();
		}else{
			self.accountListElement.find('.mortgage .accounts').html(html.MORTGAGE);
			self.accountListElement.find('.mortgage').show();
		}
		if( accountGroups.OTHER_ASSETS.length == 0 ){
			self.accountListElement.find('.otherAssets').hide();
		}else{
			self.accountListElement.find('.otherAssets .accounts').html(html.OTHER_ASSETS);
			self.accountListElement.find('.otherAssets').show();
		}
		if( accountGroups.OTHER_LIABILITIES.length == 0 ){
			self.accountListElement.find('.otherLiabilities').hide();
		}else{
			self.accountListElement.find('.otherLiabilities .accounts').html(html.OTHER_LIABILITIES);
			self.accountListElement.find('.otherLiabilities').show();
		}

		// 5. inject aggregated stats
		self.accountListElement.find('.cash .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.cashAccountsTotal), '$')
		);
		self.accountListElement.find('.investment .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.investmentAccountsTotal), '$')
		);
		self.accountListElement.find('.creditCard .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.creditCardAccountsTotal * -1), '$')
		);
		self.accountListElement.find('.loan .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.loanAccountsTotal * -1), '$')
		);
		self.accountListElement.find('.mortgage .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.mortgageAccountsTotal * -1), '$')
		);
		self.accountListElement.find('.otherAssets .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.otherAssetAccountsTotal), '$')
		);
		self.accountListElement.find('.otherLiabilities .accountTypeHeader .aggregateBalance').html(
			Currency.format(Currency.truncate(response.spData.otherLiabilitiesAccountsTotal * -1), '$')
		);

		// 6. inject networth
		if( accounts && accounts.length > 0 ){
			self.element.find('.netWorth').html(
				Currency.format(Currency.truncate(response.spData.networth), '$')
			);
			self.element.find('.netWorthbg').show();
		}else{
			// hide networth
			self.element.find('.netWorthbg').hide();
		}

		// 7. inject the aggregating n of N display
		length = length - invalidAccounts;
		numAggregatedAccounts = length - numAggregatingAccounts;
		
		log('refreshed ' + (length - numAggregatingAccounts) + ' of ' + length + ' accounts');

		if( numAggregatingAccounts > 0 ){
			 self.element.find('.aggregationStatus').html('refreshed ' + numAggregatedAccounts + ' of ' + length + ' accounts').show();
			 self.spinnerElement.show();
		}else{
			 self.element.find('.aggregationStatus').hide();
			 self.spinnerElement.hide();
		}

		// 8. show/hide aggregation error notification
		if( numAggregationErrors > 0 ){
			self.showAggregationNotification( numAggregationErrors );
		}else{
			self.hideAggregationNotification();
		}

		// 9. maintain list highlight
		self.handleHashChange();
	};

	Sidebar.prototype.showAggregationNotification = function(numberOfAccountsInError){
		this.element.find('.attention').show();
		this.accountListElement.css('top', '69px');
		this.element.find('.numberOfAccountsInError').html(numberOfAccountsInError);
	};

	Sidebar.prototype.hideAggregationNotification = function(){
		this.element.find('.attention').hide();
		this.accountListElement.css('top', '46px');
	};

	// create the sidebar
	PersonalCapital.Sidebar = new Sidebar( $('#sidebar') );
	// start pinging
	PersonalCapital.Sidebar.pinger.start();
});
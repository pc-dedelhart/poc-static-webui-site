window.PersonalCapital = window.PersonalCapital || {};
PersonalCapital.utils = {};

PersonalCapital.utils.Currency = {

	truncate: function(amount){
		if( typeof amount == 'undefined' || isNaN( amount ) ){
			return 0;
		}
		var truncatedAmount = amount < 0 ? Math.ceil(amount) : Math.floor(amount);
		return truncatedAmount;
	},
	/**
		Formats a number into a currency string.

		@param amount the amount you want to convert
		@param currencySymbol the currency symbol you want to use, if any
		@return the formatted currency string
	**/
	format: function(amount, currencySymbol){
		if( typeof amount == 'undefined' || isNaN( amount ) ){
			return '';
		}
		if( typeof currencySymbol == 'undefined' ){
			currencySymbol = '';
		}
		var formattedAmount = '';
		if( amount < 0 ){
			formattedAmount += '-';
			amount *= -1;
		}
		// convert to string
		amount = amount + '';
		// inject thousandnths separator
		if( amount.length > 3 ){
			var tempAmount = amount.split('').reverse();
			amount = [];
			for( var i = 0; i < tempAmount.length; i++ ){
				amount.unshift( tempAmount[i] );
				if( i % 3 == 2 && i != tempAmount.length - 1){
					amount.unshift(',');
				}
			}
			amount = amount.join('');
		}
		formattedAmount += currencySymbol + amount;
		return formattedAmount;
	}
};

PersonalCapital.utils.Accounts = {
	/**
		For use with the Array#sort function, sorts two accounts
		by firmName first and name second.

		@param a the first Account to compare
		@param b the second Account to compare
		@return -1 if a should be before b, 1 if be should be before a, 0 if they are equivalent
	**/
	compare: function( a, b ){
		if( !a && !b ){ return 0 }
		if( !a ){ return 1 }
		if( !b ){ return -1 }

		var temp,
			result = 0;
		if( a.firmName.toLowerCase() == b.firmName.toLowerCase() ){
			// sort by name
			if( typeof a.name == 'undefined' && typeof b.name == 'undefined'){
				result = 0;
			}else if( typeof a.name == 'undefined' ){
				result = 1;
			}else if( typeof b.name == 'undefined' ){
				result = -1;
			}else{
				if( a.name.toLowerCase() != b.name.toLowerCase() ){
					temp = [a.name.toLowerCase(), b.name.toLowerCase()].sort();
					result = temp[0] == a.name.toLowerCase() ? -1 : 1;
				}
			}
		}else{
			// sort by firmName
			temp = [a.firmName.toLowerCase(), b.firmName.toLowerCase()].sort();
			result = temp[0] == a.firmName.toLowerCase() ? -1 : 1;
		}
		return result;
	}
};


PersonalCapital.utils.Marketing = {
	USER_REGISTERED: 1,
	USER_AGGREGATED_100K: 2,
	USER_AGGREGATED_FIRST_ACCOUNT: 3,
		
	/**
	Tracking wsod events is the same across and the only difference is the "number":

	@param number represents the event:
		1:
		2:
		3:
	@return does not return any values
	**/
	wsod: function( number ){
		try{
			var cookieString = getGACookie(),
				cookieValues = cookieString ? cookieString.split('|') : [],
				localUserGuid = userGuid, // TODO: danger! injected globally into pfa.jsp
				source, medium, campaign, cookieValue, valueIndex;
	
			for( var i = 0; i < cookieValues.length; i++ ){
				cookieValue = cookieValues[i];
				valueIndex = cookieValue.indexOf('utmscr=');
				if( valueIndex != -1 ){
					source = cookieValue.slice( valueIndex + 7 );
				}
				valueIndex = cookieValue.indexOf('utmcmd=');
				if( valueIndex != -1 ){
					medium = cookieValue.slice( valueIndex + 7 );
				}
				valueIndex = cookieValue.indexOf('utmccn=');
				if( valueIndex != -1 ){
					campaign = cookieValue.slice( valueIndex + 7 );
				}
			}
	
			var rand = Math.random() + "";
			rand = rand * 100000;
			var html = '<iframe src="//ad.wsod.com/activity/3d6bcab09d0adfe7fd69dcc5d841e73a/' + number + '.iframe.activity/' + rand + ';userGuid=' + localUserGuid + ';tpid1=' + source + '_' + medium + '_' + campaign + '" width="1" height="1" frameborder="0"></iframe>';
			var trackingdiv = document.createElement('div');
			trackingdiv.innerHTML = html;
			document.body.appendChild( trackingdiv );
		}catch(err){
			log('Could not track ' + number + ' through wsod', err);
		}
	}
};

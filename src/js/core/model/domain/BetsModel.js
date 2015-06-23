import BetSelection from 'core/model/bets/BetSelection';
import BetTypeCalculator from 'core/model/bets/BetTypeCalculator';
import BetJsonGenerator from 'core/model/bets/BetJsonGenerator';
import BetsSummary from 'core/model/bets/BetsSummary';
import BetPart from 'core/model/bets/BetPart';
import SingleBet from 'core/model/bets/SingleBet';
import SystemBet from 'core/model/bets/SystemBet';
import Bet from 'core/model/bets/Bet';

import eventCache from 'core/model/EventCache';


export default Marionette.Controller.extend({

	MAX_NUMBER_SELECTIONS: 20,
	MAX_NUMBER_OF_LINES: 1800,
	moreSystemBetsAvailable: false,
	calculateForecastBets: false,
	rejectionObj: null,
	acceptedBetsCollection: [],
	rejectedBetsCollection: [],
	openBetsCollection: [],
	cashoutCollection: [],

	betConfirmationResult: [],
	betSelectionsDictionary: [],
	selectionCount: 0,
	singleBets: [],
	singleBetCount: 0,
	systemBets: [],
	systemBetCount: 0,
	forecastBets: [],
	forecastBetCount: 0,
	asianHandicapMap: [],
	subscriptionMap: [],
	useHTTPCashoutAPI: true,
	placeBetJson: null,
	acceptPriceChange: false,

	totalNumberOfBets: 0,
	lastError: null,


	initialize: function () {
		_.bindAll(this, 'onSelectionClick', 'onSelectionClickRemove', 'onLogin', 'onLogout', 'onBetUpdate', 'onRouteChange', 'onLocaleChange', 'onSelectionDataComplete');

		this.cache = eventCache;
		this.vent = ctx.get('vent');
		this.oddsFactory = ctx.get('oddsFactory');
		this.sessionModel = ctx.get('sessionModel');
		this.streamingService = ctx.get('streamingService');
		this.bonusModel = ctx.get('bonusEntitlementModel');

		this.vent.bind('selection:clickAdd', this.onSelectionClick);
		this.vent.bind('selection:clickRemove', this.onSelectionClickRemove);
		this.vent.bind('session:loggedin', this.onLogin);
		this.vent.bind('session:loggedout', this.onLogout);
		this.vent.bind('globals:localeChange', this.onLocaleChange);

		this.listenTo(this.streamingService, 'streaming:accountBalanceUpdate', this.onAccountBalanceUpdate);
		this.listenTo(this.streamingService, 'streaming:betUpdate', this.onBetUpdate);
		this.listenTo(this.streamingService, 'streaming:calculateCashout', this.setCashoutResultResponse);
		this.listenTo(this.bonusModel, 'bonusEntitlementChange', this.onBonusEntitlementsChange);

		this.routeController = ctx.get('routeController');
		this.routeController.register(this);

	},

	onLogout: function () {
		this.cashoutCollection = [];
		this.openBetsCollection = [];
		this.bonusModel.removeAllEntitlements();
		this.onBonusEntitlementsChange();
	},

	onLogin: function () {
		this.getBonusEntitlements();
	},

	getBonusEntitlements: function () {
		this.commands.execute('command:getBonusEntitlement');
	},

	onLocaleChange: function () {
		var singles = _.values(this.singleBets);
		var selectionArray = [];

		for (var i = 0; i < singles.length; i++) {
			var singleBet = singles[i];
			selectionArray.push(singleBet.selectionId());
		}

		var ids = selectionArray.join(',');
		var that = this;
		if (_.size(selectionArray) > 0) {
			this.commands.execute('command:getSelectionEvents', ids)
				.done(that.onSelectionDataComplete);
		}
	},

	onSelectionDataComplete: function (data, textStatus, jqXHR) {
		var events = data.Events.event;
		var singles = _.values(this.singleBets);

		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			var markets = event.markets;

			for (var j = 0; j < singles.length; j++) {
				var singleBet = singles[j];
				if (singleBet.eventId() == event.id) {
					var betPart = singleBet.betPart;
					betPart.selection.eventName = event.name;

					for (var k = 0; k < markets.length; k++) {
						var mk = markets[k];
						if (mk.id == singleBet.marketId()) {
							var market = mk;
							betPart.selection.marketName = market.name;
							for (var m = 0; m < market.selection.length; m++) {
								var selection = market.selection[m];
								if (selection.id == singleBet.selectionId()) {
									betPart.selection.selectionName = selection.name;
									break;
								}
							}
							break;
						}
					}

				}
			}
		}

		this.trigger("bets:translationComplete");
	},

	addSelection: function (betSelection) {
		var selId = 'sel-' + betSelection.selectionId;
		if (this.betSelectionsDictionary.hasOwnProperty(selId)) {
			return null;
		}

		this.betSelectionsDictionary[selId] = betSelection;
		this.selectionCount++;

		var newBetPart = new BetPart(betSelection, 1);
		var newBet = new SingleBet(newBetPart, '');

		this.singleBets[newBet.betId()] = newBet;
		this.singleBetCount++;

		this.updateSystemBets();
		this.updateTotalNumberOfBetsWithStake();

		return newBet;
	},

	hasSelectionLimit: function () {
		var singles = _.values(this.singleBets);
		if (singles.length >= this.MAX_NUMBER_SELECTIONS) {
			return true;
		}
		else {
			return false;
		}
	},


	buildBetSelection: function (selectionObj) {
		var eventId = selectionObj.eventId;
		var selectionId = selectionObj.selectionId;
		var event;

		if (this.hasSelectionLimit()) {
			var reason = App.translator.translate('MAX_SELECTIONS');
			var rejectionObj = {};
			rejectionObj.bets = [];
			rejectionObj.reasonCode = reason;
			rejectionObj.status = "MAX_SELECTIONS";
			this.showRejection(rejectionObj);
			return;
		}

		if (selectionObj.hasOwnProperty('event')) {
			event = selectionObj.event;
		}
		else {
			event = this.cache.getEvent(eventId);
		}

		if (_.isUndefined(event)) return;

		var eventName = event.attributes.name;
		var selectionid = parseInt(selectionId);
		var selection = event.findSelection(selectionid);
		if (_.isUndefined(selection)) return;

		var selectionName = selection.getSelectionName();
		var rootIdx = selection.attributes.rootIdx;
		var marketId = selection.attributes.marketId;
		var market = event.findMarket(marketId);
		var marketName = market.attributes.name;
		var marketType = market.attributes.type;

		var decimalOdds;
		var fractionalOdds;
		var americanOdds;

		//TEMP STUB TO THROW PRICE CHANGE ERROR.
		//if (_.isUndefined(this.testVar)) {
		//    this.testVar = false;
		//    rootIdx +=10;
		//}

		var oddsObj = this.oddsFactory.getOddsByIndex(rootIdx);
		if (oddsObj) {
			decimalOdds = oddsObj.decimal;
			fractionalOdds = oddsObj.fractional;
			americanOdds = oddsObj.american;
		}
		else {
			fractionalOdds = selection.attributes.fractionalOdds;
			decimalOdds = selection.attributes.decimalOdds;
			americanOdds = '';
		}

		var sportCode = App.Globals.sport;
		if (event.attributes.code != "") {
			sportCode = event.attributes.code;
		}
		else {
			sportCode = event.attributes.sport;
		}

		var betSelection = new BetSelection(eventId, eventName, marketId, marketName, marketType,
			selectionid, selectionName, fractionalOdds, decimalOdds, americanOdds,
			selection.attributes.multipleKeys, sportCode.toLowerCase());

		//US Sports Line property.
		if (!_.isNull(market.attributes.line)) {
			betSelection.line = market.attributes.line;
		}

		var newBet = this.addSelection(betSelection);

		if (!_.isNull(selectionObj.freeBet) && !_.isUndefined(selectionObj.freeBet)) {
			var bonusStake = selectionObj.freeBet.bonusStakes[0];
			var minStakeAmount = bonusStake.amount;
			newBet.freeBet = selectionObj.freeBet;
			newBet.isFreeBet = true;
			newBet.freeBetDescription = minStakeAmount + ' FREE BET ON ' + selectionObj.freeBet.description;
		}

		if (newBet) {
			this.checkForHandicapMarket(newBet);
			this.trigger("bets:addSingleBet", newBet);
		}

		this.trigger("bets:showDefaultBetView");
		this.updateMultiples();
		this.updateCombiBets();

		if (this.sessionModel.isLoggedIn()) {
			$("span[name*='bet-currencySymbol']").html(App.translator.translateCurrency(this.sessionModel.getCurrency()));
		} else {
			var localeCurrency = App.translator.translate("CURRENCY_NAME");
			$("span[name*='bet-currencySymbol']").html(App.translator.translateCurrency(localeCurrency));
		}
	},

	checkForHandicapMarket: function (bet) {
		var betSelection = bet.betPart.selection;
		var marketType = betSelection.marketType;
		var eventId = betSelection.eventId;
		if (marketType == 'AHCP') {
			var event = this.cache.getEvent(eventId);
			if (event.getInplay()) {
				betSelection.inplayScore = event.getInplayScore();
			}
			this.addInplayScoreListener(eventId);
		}
	},

	addInplayScoreListener: function (eventId) {
		var event = this.cache.getEvent(eventId);
		if (event) {
			if (!_.has(this.asianHandicapMap, eventId)) {
				this.asianHandicapMap[eventId] = eventId;
				this.listenTo(event, 'change:inplayScore', this.onInplayScoreChange);
			}
		}
	},

	removeInplayScoreListener: function (eventId) {
		if (_.has(this.asianHandicapMap, eventId)) {
			var event = this.cache.getEvent(eventId);
			this.stopListening(event, 'change:inplayScore', this.onInplayScoreChange);
			var singleBetsKeys = _.keys(this.singleBets);
			var remainingSelections = false;
			for (var i = 0; i < singleBetsKeys.length; i++) {
				var currKey = singleBetsKeys[i];
				var bet = this.singleBets[currKey];
				if (bet.eventId() == eventId) {
					remainingSelections = true;
				}
			}
			if (!remainingSelections) {
				delete this.asianHandicapMap[eventId];
			}
		}
	},

	onInplayScoreChange: function (event) {
		this.trigger("onInplayScoreChange", event);
	},

	clearAllBets: function () {
		this.placeBetJson = null;
		this.betSelectionsDictionary = [];
		this.singleBets = [];
		this.systemBets = [];
		this.singleBetCount = 0;
		this.selectionCount = 0;
		this.trigger("bets:clearSingleBets");
		this.updateSystemBets();
		this.moreSystemBetsAvailable = false;
		this.updateMultiples();
		this.vent.trigger('selectionState:removeAll');
		this.updateTotalNumberOfBetsWithStake();
	},

	getOpenBets: function () {
		if (this.sessionModel.isLoggedIn()) {
			this.commands.execute('command:getOpenBets');
		}
	},

	betHistoryCount: function (timeFrom, timeTo, status) {
		if (this.sessionModel.isLoggedIn()) {
			this.commands.execute('command:getBetHistoryCount', timeFrom, timeTo, status);
		}
	},

	betHistory: function (firstResult, maxResults, timeFrom, timeTo, status, betIds) {
		if (this.sessionModel.isLoggedIn()) {
			this.commands.execute('command:getBetHistory', firstResult, maxResults, timeFrom, timeTo, status, betIds);
		}
	},

	getClosedBets: function () {
		var today = new Date();
		today.setDate(today.getDate() + 1);

		var fromDate = new Date();
		fromDate.setDate(today.getDate() - 30);

		var fromDay = ('0' + (fromDate.getDate())).slice(-2);
		var toDay = ('0' + (today.getDate())).slice(-2);

		var fromMonth = ('0' + (fromDate.getMonth() + 1)).slice(-2);
		var toMonth = ('0' + (today.getMonth() + 1)).slice(-2);

		var fromDate = fromDate.getFullYear() + '-' + fromMonth + '-' + fromDay + "T00:00:00";
		var toDate = today.getFullYear() + '-' + toMonth + '-' + toDay + "T00:00:00";

		this.commands.execute('command:getClosedBets', fromDate, toDate);
	},

	updateSystemAndMultiples: function () {
		this.updateSystemBets();
		this.updateMultiples();
	},

	includeFreeBetSelection: function (bet) {
		bet.redeemFreeBet = true;
	},

	excludeFreeBetSelection: function (bet) {
		bet.redeemFreeBet = false;
	},

	includeBetSelection: function (bet) {
		bet.setIncludeInMultiples(true);
		this.updateSystemAndMultiples();
	},

	excludeBetSelection: function (bet) {
		bet.setIncludeInMultiples(false);
		this.updateSystemAndMultiples();
	},

	removeBetSelection: function (bet) {
		if (!_.isUndefined(bet)) {
			var betId = bet.betId();
			delete this.singleBets[betId];
			var selId = betId.replace('bet', 'sel');

			if (_.has(this.betSelectionsDictionary, selId)) {
				delete this.betSelectionsDictionary[selId];
			}
		}

		this.singleBetCount--;
		this.selectionCount--;

		this.updateSystemBets();
		this.updateMultiples();

		this.trigger("bets:removeSingleBet");

		if (!_.isUndefined(bet)) {
			var betSelection = bet.betPart.selection;
			if (betSelection.marketType == 'AHCP') {
				var eventId = betSelection.eventId;
				this.removeInplayScoreListener(eventId);
			}
			this.unsubscribeToBetSelection(bet);
		}
		this.updateTotalNumberOfBetsWithStake();
	},

	updateMultiples: function () {
		var systemBets = this.getSystemBets();
		this.trigger("bets:addMultipleBet", systemBets);
	},

	updateCombiBets: function () {
		var newCombiBets = BetTypeCalculator.calculateCombiBets(this.singleBets);
		console.log('new combi bets');
	},

	getTotalNumberOfBets: function () {
		return this.totalNumberOfBets;
	},

	updateTotalNumberOfBetsWithStake: function () {
		var count = 0;
		var systemBetsKeys = _.keys(this.systemBets);
		for (var idx = 0; idx < systemBetsKeys.length; idx++) {
			var currKey = systemBetsKeys[idx];
			var systemBet = this.systemBets[currKey];
			var totalStake = parseFloat(systemBet.totalStake()).toFixed(2);
			if (totalStake > 0.00) {
				count++;
			}
		}

		var singleBetsKeys = _.keys(this.singleBets);
		for (var i = 0; i < singleBetsKeys.length; i++) {
			var currKey = singleBetsKeys[i];
			var bet = this.singleBets[currKey];
			var totalStake = parseFloat(bet.totalStake()).toFixed(2);
			if (totalStake > 0.00) {
				count++;
			}
		}

		if (count != this.totalNumberOfBets) {
			this.totalNumberOfBets = count;
			this.trigger("bets:updateTotalNumberOfBets", this.totalNumberOfBets);
		}
	},

	updateStake: function (betId, newStake) {
		var bet = this.getBet(betId);
		if (bet) {
			bet.stake = newStake;
			this.updateTotalNumberOfBetsWithStake();
		}
		return bet;
	},

	totalStake: function () {
		return BetTypeCalculator.totalStake(this.singleBets, this.systemBets, this.forecastBets);
	},

	totalStakeDisplayVal: function () {
		var totalStake = BetTypeCalculator.totalStake(this.singleBets, this.systemBets, this.forecastBets);
		if (isNaN(totalStake)) {
			return '0.00';
		}
		return totalStake.toFixed(2);
	},

	estimatedReturns: function () {
		return BetTypeCalculator.estimatedReturns(this.singleBets, this.systemBets);
	},

	estimatedReturnsDisplayVal: function (displayCurrency) {
		var returns = this.estimatedReturns();
		if (isNaN(returns)) {
			return '0';
		}

		return App.format(returns, displayCurrency);
	},

	getBet: function (betId) {
		var singleBet = this.singleBets[betId];
		if (singleBet) {
			return singleBet;
		}
		var systemBet = this.systemBets[betId];
		if (systemBet) {
			return systemBet;
		}
		var forecastBet = this.forecastBets[betId];
		if (forecastBet) {
			return forecastBet;
		}
		return null;
	},

	getSystemBets: function () {
		var bets = [];
		var systemBetsKeys = _.keys(this.systemBets);
		for (var idx = 0; idx < systemBetsKeys.length; idx++) {
			var currKey = systemBetsKeys[idx];
			var systemBet = this.systemBets[currKey];
			var lines = systemBet.bets.length;
			if (lines < this.MAX_NUMBER_OF_LINES) {
				bets.push(systemBet);
			}
		}
		return bets;
	},

	updateForecastBets: function () {
		if (this.calculateForecastBets) {
			var newForecastBets = BetTypeCalculator.calculateForecastBets(this.singleBets);
			var newForecastBetsCount = 0;
			_.each(newForecastBets, function (key, name) {
				var existingForecastBet = this.forecastBets[key];
				if (existingForecastBet != null) {
					newForecastBets[key].stake = existingForecastBet.stake;
				}
				newForecastBetsCount++;
			});

			this.forecastBets = newForecastBets;
			this.forecastBetCount = newForecastBetsCount;
		}
	},

	calculateSystemBets: function () {
		var newSystemBets = BetTypeCalculator.calculateSystemBets(this.singleBets);
		var newSystemBetsKeys = _.keys(newSystemBets);
		var newSystemBetsCount = newSystemBetsKeys.length;
		this.systemBets = newSystemBets;
		this.systemBetCount = newSystemBetsCount;
		this.moreSystemBetsAvailable = false;
		this.updateMultiples();
	},

	updateSystemBets: function () {
		var newSystemBets = BetTypeCalculator.calculateAccumulatorBets(this.singleBets);
		this.moreSystemBetsAvailable = BetTypeCalculator.systemBetsAvailable();
		var newSystemBetsKeys = _.keys(newSystemBets);
		var newSystemBetsCount = newSystemBetsKeys.length;
		this.systemBets = newSystemBets;
		this.systemBetCount = newSystemBetsCount;
		this.updateForecastBets();
	},

	onSelectionClick: function (selectionObj) {
		var selection = selectionObj.selection;
		this.checkSelectionIsFreeBet(selectionObj);
		this.buildBetSelection(selectionObj);

		var event = selectionObj.event;
		var eventId = event.attributes.id;
		var sportCode = event.attributes.sport;
		var market = event.Markets.models[0];
		var marketType = market.attributes.type;

		this.subscribeToBetSelection(sportCode, eventId, marketType);
	},

	onRouteChange: function () {
		var keys = _.keys(this.subscriptionMap);
		for (var i = 0; i < keys.length; i++) {
			var currKey = keys[i];
			var subData = currKey.split(":");
			var eventId = subData[0];
			var marketType = subData[1];
			var sportCode = this.subscriptionMap[currKey];
			this.commands.execute('command:add:eventView', sportCode, eventId, marketType);
		}

		if (_.size(this.cashoutCollection) > 0) {
			this.subscribeToCashoutBets(this.cashoutCollection);
		}
	},

	subscribeToBetSelection: function (sportCode, eventId, marketType) {
		if (!_.isNull(sportCode) || !_.isUndefined(sportCode)) {
			sportCode = App.Globals.sport;
		}

		var ref = eventId + ':' + marketType;
		if (!_.has(this.subscriptionMap), ref) {
			this.subscriptionMap[ref] = sportCode;
			this.commands.execute('command:add:eventView', sportCode, eventId, marketType);
		}
	},

	unsubscribeToBetSelection: function (bet) {
		var eventId = bet.eventId();
		var marketType = bet.marketType();
		var ref = eventId + ':' + marketType;
		var removeSubscription = true;

		if (_.has(this.subscriptionMap), ref) {
			var singleBetsKeys = _.keys(this.singleBets);
			for (var i = 0; i < singleBetsKeys.length; i++) {
				var currKey = singleBetsKeys[i];
				var bet = this.singleBets[currKey];
				var remainingBetRef = bet.eventId() + ':' + bet.marketType();
				if (_.has(this.subscriptionMap), remainingBetRef) {
					removeSubscription = false;
				}
			}
		}

		if (removeSubscription) {
			if (_.has(this.subscriptionMap), ref) {
				//var sportCode = this.subscriptionMap[ref];
				//this.commands.execute('command:remove:eventView', sportCode, eventId, marketType);
				delete this.subscriptionMap[ref];
			}
		}
	},

	validateFreeBetCriteria: function (freeBet, event, decimalOdds) {
		if (!_.isNull(freeBet) && !_.isUndefined(freeBet)) {
			var validFreeBet = true;

			var inplay = freeBet.inplay;
			var prematch = freeBet.prematch;
			var minOdds = freeBet.minOdds;

			var eventInplay = event.attributes.inplay;
			var offeredInplay = event.attributes.offeredInplay;

			if (inplay == false && eventInplay == true) {
				validFreeBet = false;
			}

			if (prematch == false && eventInplay == false) {
				validFreeBet = false;
			}

			if (minOdds > decimalOdds) {
				validFreeBet = false;
			}

			return validFreeBet;
		}

		return false;
	},

	checkSelectionIsFreeBet: function (selectionObj) {
		if (this.sessionModel.isLoggedIn()) {
			var event = selectionObj.event;
			var selection = selectionObj.selection;

			var path = event.attributes.path;
			var freeBet = this.bonusModel.checkFreeBetsPaths(path);

			var isValid = this.validateFreeBetCriteria(freeBet, event, selection.attributes.decimalOdds);
			if (isValid) {
				selectionObj.freeBet = freeBet;
			}
		}
	},

	onSelectionClickRemove: function (selectionObj) {
		var eventid = selectionObj.eventId;
		this.removeInplayScoreListener(eventid);
	},


	getMaxAllowedStake: function (bet) {
		var betsArray = [];
		var betType = bet.betType();
		var isMaxRequestBetMultiple = betType != 'SINGLE';
		var betJson;
		var betRef;

		if (isMaxRequestBetMultiple) {

			var betRef = bet.betId();
			betsArray[bet.betId()] = bet;
			bet.stake = 1; //Temp fix to pass zero stake validation.
			betJson = BetJsonGenerator.generateJson(this.sessionModel.getAccountId(),
				this.sessionModel.getCurrency(), this.singleBets, betsArray, [], false, App.Globals.priceFormat, false, isMaxRequestBetMultiple);
		}
		else {

			var betRef = bet.betPart.selection.selectionId;
			bet.stake = 1; //Temp fix to pass zero stake validation.
			betsArray.push(bet);
			betJson = BetJsonGenerator.generateJson(this.sessionModel.getAccountId(),
				this.sessionModel.getCurrency(), betsArray, [], [], false, App.Globals.priceFormat, false, isMaxRequestBetMultiple);
		}

		var promise = this.commands.execute('command:getMaxAllowedBetStake', betJson);
		promise.ref = betRef;
	},


	setMaxStake: function (data) {
		this.trigger('bets:setMaxStake', data);
	},

	setAcceptPriceChange: function (value) {
		this.acceptPriceChange = value;
	},

	getAcceptPriceChange: function () {
		if (App.Globals.autoAcceptLowerBetSlipPriceChanges) {
			return true;
		}
		else {
			//Has User selected YES from the betslip price change prompt?
			return this.acceptPriceChange;
		}
	},

	resetBeforePlacement: function () {
		this.highlightMultiples = false;
		this.rejectedSinglesCount = 0;
		this.rejectedMultiplesCount = 0;
		this.acceptedBetsCollection = [];
		this.rejectedBetsCollection = [];
		this.rejectionObj = null;
	},

	maxLinesLimit: function () {
		var lines = 0;
		var systemBetsArray = _.values(this.systemBets);
		for (var i = 0; i < systemBetsArray.length; i++) {
			var bet = systemBetsArray[i];
			if (bet.totalStake() > 0) {
				//lines += bet.countLines();
				lines += bet.bets.length;
			}
		}

		if (lines > this.MAX_NUMBER_OF_LINES) {
			return true;
		}
		else {
			return false;
		}
	},

	placeBet: function () {
		if (this.maxLinesLimit() == true) {
			var reason = App.translator.translate('MAX_LINES_BET_PLACEMENT');
			var rejectionObj = {};
			rejectionObj.bets = [];
			rejectionObj.reasonCode = reason;
			rejectionObj.status = "MAX_LINES_BET_PLACEMENT";
			this.showRejection(rejectionObj);
			return;
		}


		this.trigger("bets:addLoader", this);
		this.resetBeforePlacement();

		var isCashout = false;
		var acceptPriceChange = this.getAcceptPriceChange();

		this.placeBetJson = BetJsonGenerator.generateJson(this.sessionModel.getAccountId(),
			this.sessionModel.getCurrency(),
			this.singleBets, this.systemBets, this.forecastBets,
			isCashout, App.Globals.priceFormat, acceptPriceChange, false);

		//console.log(this.placeBetJson);
		this.commands.execute('command:placeBets', this.placeBetJson);

		//Reset back after bet placement.
		if (!App.Globals.autoAcceptLowerBetSlipPriceChanges) {
			this.setAcceptPriceChange(false);
		}
	},

	placeBetsComplete: function () {
		//There could be a mixture of Accepted or Rejected bets or Over-ask bets.
		if (this.acceptedBetsCollection.length > 0) {
			this.trigger("bets:addConfirmations", this.acceptedBetsCollection);
			if (!_.isNull(this.rejectionObj)) {
				//Show Confirmation view and rejection view.
				this.trigger("bets:addRejections", this.rejectionObj);
				this.showConfirmationAndRejectionView();
			}
			else {
				//Just show the confirmation view.
				this.showConfirmationView();
			}
		}
		else if (!_.isNull(this.rejectionObj)) {
			this.showRejection(this.rejectionObj);
		}

		this.trigger("bets:removeLoader", this);
		this.vent.trigger('bets:placementSuccess');
		this.getBonusEntitlements();
	},

	placeBetsFailure: function () {
		this.trigger("bets:removeLoader", this);
		var rejectionObj = {};
		rejectionObj.bets = [];

		var translatedStatus = App.translator.translateRejection('BETSLIP_FAILURE');
		var rejectionStatus = 'BETSLIP_FAILURE';
		rejectionObj.status = rejectionStatus;
		rejectionObj.reasonCode = translatedStatus;
		this.showRejection(rejectionObj);
	},

	setRejectedBetResults: function (betResult) {
		var betSelections = betResult.betPartPlacementResult;
		var betType = betResult.betType;
		var otherWalletErrorCodes = ['10023', '10045', '10046', '10047', '10048'];

		//Check for External wallet codes and translate.
		if (_.has(betResult, 'rejectionReason')) {
			if (betResult.rejectionReason == "WALLET_ERROR") {
				if (_.has(betResult, 'walletErrorCode')) {
					betResult.rejectionReason = "EXTERNAL_BET_REF_" + betResult.walletErrorCode;
					if (betResult.walletErrorCode == 2 && this.lastError !== "TIMEOUT") {
						this.vent.trigger('session:retryExternalLoginPlaceBet');
						betResult.rejectionReason = "TIMEOUT";
					}
				}
			} else {
				// This is workaround to deal with some errors that contain
				// a relevant walletErrorCode and whose rejectionReason is not  WALLET_ERROR.
				if (_.has(betResult, 'walletErrorCode') && _.contains(otherWalletErrorCodes, betResult.walletErrorCode + '')) {
					betResult.rejectionReason = "EXTERNAL_BET_REF_" + betResult.walletErrorCode;
				}
			}
			// Set the next 'lastError'
			this.lastError = betResult.rejectionReason;
		}

		var translatedStatus = App.translator.translateRejection(betResult.rejectionReason);
		var selectionStatus = translatedStatus;

		if (betResult.rejectionReason == 'UNAVAILABLE_SELECTION') {
			selectionStatus = App.translator.translateRejection('UNAVAILABLE_SELECTION_SINGLE_ITEM');
		}

		for (var i = 0; i < betSelections.length; i++) {
			var bet = betSelections[i];
			var betSelection = 'bet-' + bet.selectionId;
			var singleBet = this.singleBets[betSelection];

			if (_.has(bet, 'newOdds')) {
				var newOddsDecimal = bet.newOdds.decimal;
				var oddsObj = this.oddsFactory.getRootIndexFromDecimal(newOddsDecimal);
				var betWrapper = {};
				betWrapper.bet = singleBet;
				betWrapper.type = 'SINGLE';
				betWrapper.newOdds = oddsObj;
				betWrapper.reasonCodeForSelection = selectionStatus;
				this.addRejectedBet(betWrapper);
			}
			else if (bet.status != 'UNCHANGED' && betSelections.length > 1 && betType != 'SINGLE') {
				//more than one bet part so only include unchanged status.
				//And if a system bet or multiple bet placed with the below rejections don't display selections
				if (this.addSingleRejectedByStatus(betResult.rejectionReason)) {
					var betWrapper = {};
					betWrapper.bet = singleBet;
					betWrapper.type = 'SINGLE';
					betWrapper.reasonCodeForSelection = selectionStatus;
					this.addRejectedBet(betWrapper);
				}
			}
			else if (betType == 'SINGLE') {
				if (betResult.rejectionReason != 'BETSLIP_REJECTED' &&
					betResult.rejectionReason != 'INSUFFICIENT_FUNDS' &&
					betResult.rejectionReason != 'TIMEOUT') {
					var betWrapper = {};
					betWrapper.bet = singleBet;
					betWrapper.type = 'SINGLE';
					betWrapper.reasonCodeForSelection = selectionStatus;
					this.addRejectedBet(betWrapper);
				}
			}
		}


		if (betType != 'SINGLE') {
			var betTypeName = BetTypeCalculator.getMultipleNamesAlias(betType);
			if (_.has(this.systemBets, betTypeName)) {
				var sysBet = this.systemBets[betTypeName];

				if (this.addMultipleRejectedByStatus(betResult.rejectionReason)) {
					var betWrapper = {};
					betWrapper.bet = sysBet;
					betWrapper.type = 'MULTIPLE';
					betWrapper.reasonCodeForSelection = selectionStatus;
					this.addRejectedBet(betWrapper);
				}
				else {
					this.highlightMultiples = true;
				}

			}
			else {
				betTypeName = BetTypeCalculator.getMultipleBetNamesByIndex(betSelections.length);
				if (_.has(this.systemBets, betTypeName)) {
					var sysBet = this.systemBets[betTypeName];
					var resultStake = parseFloat(betResult.totalStake).toFixed(2);
					var systemBetStake = parseFloat(sysBet.totalStake()).toFixed(2);
					if (this.addMultipleRejectedByStatus(betResult.rejectionReason)) {
						var betWrapper = {};
						betWrapper.bet = sysBet;
						betWrapper.type = 'MULTIPLE';
						betWrapper.reasonCodeForSelection = selectionStatus;
						this.addRejectedBet(betWrapper);
					}
					else {
						this.highlightMultiples = true;
					}
				}
			}
		}

		this.rejectionObj = {};
		this.rejectionObj.bets = this.rejectedBetsCollection;
		var rejectionStatus = betResult.rejectionReason;

		if (this.rejectedSinglesCount > 0 || this.rejectedMultiplesCount > 1) {
			//DISPLAY GENERIC MESSAGE INSTEAD OF DUPLICATING WHAT'S HIGHLIGHTED AT SELECTION LEVEL.
			translatedStatus = App.translator.translateRejection(betResult.rejectionReason);
		}
		this.rejectionObj.status = rejectionStatus;
		this.rejectionObj.reasonCode = translatedStatus; //THIS IS FOR THE BOTTOM REJECTION VIEW.
	},

	highlightMultiples: false,
	rejectedSinglesCount: 0,
	rejectedMultiplesCount: 0,

	addRejectedBet: function (betWrapper) {
		if (betWrapper.type == 'SINGLE') {
			this.rejectedSinglesCount++;
		}
		else {
			this.rejectedMultiplesCount++;
		}
		this.rejectedBetsCollection.push(betWrapper);
	},

	addMultipleRejectedByStatus: function (rejectionCode) {
		if (rejectionCode != 'BETSLIP_REJECTED' &&
			rejectionCode != 'INSUFFICIENT_FUNDS' &&
			rejectionCode != 'LIVE_SUSPENSION' &&
			rejectionCode != 'LIVE_ODDS_DECREASE' &&
			rejectionCode != 'PRELIVE_ODDS_CHANGE' &&
			rejectionCode != 'UNAVAILABLE_SELECTION' &&
			rejectionCode != 'TIMEOUT' &&
			rejectionCode != 'LIVE_ODDS_INCREASE') {
			return true;
		}
		return false;
	},


	addSingleRejectedByStatus: function (rejectionCode) {
		if (rejectionCode != 'MIN_STAKE' &&
			rejectionCode != 'STAKE_LIMIT' &&
			rejectionCode != 'BET_LIMIT' &&
			rejectionCode != 'BETSLIP_REJECTED' &&
			rejectionCode != 'TIMEOUT' &&
			rejectionCode != 'INSUFFICIENT_FUNDS') {
			return true;
		}
		return false;
	},

	showRejection: function (rejectionObj) {
		this.trigger("bets:addRejections", rejectionObj);
		this.trigger("bets:showRejectionView");
	},

	setAcceptedBetResult: function (betResult) {
		//status ACCEPTED or OVER_ASK
		var status = betResult.status;
		var betSelections = betResult.betPartPlacementResult;
		var betType = betResult.betType;

		this.lastError = null;

		var betWrapper = {};
		betWrapper.type = betSelections.length > 1 ? 'MULTIPLE' : 'SINGLE';
		betWrapper.name = "";
		betWrapper.betId = betResult.betId;
		betWrapper.betPlacedRef = betResult.betId;
		betWrapper.betSlipId = betResult.betSlipId;
		betWrapper.betParts = [];
		betWrapper.stake = betResult.totalStake.toFixed(2);
		betWrapper.status = status;
		betWrapper.potentialPayout = '0.00';

		if (_.has(betResult, 'potentialPayout')) {
			betWrapper.potentialPayout = parseFloat(betResult.potentialPayout).toFixed(2);
		}


		var betParts = [];

		for (var i = 0; i < betSelections.length; i++) {
			var bet = betSelections[i];
			var betSelection = 'bet-' + bet.selectionId;
			var singleBet = this.singleBets[betSelection];
			singleBet.stake = 0;
			betParts.push(singleBet);
		}

		//This is to get the System Bet name for the Bet Confirmation.
		//Ideally returned from the API.

		var sentBetsJson = JSON.parse(this.placeBetJson);
		var sentBets = sentBetsJson.PlaceBetsRequest.bets.bet;
		for (var i = 0; i < sentBets.length; i++) {
			var bet = sentBets[i];
			if (bet.parts.betPart.length == betSelections.length) {
				for (var j = 0; j < bet.parts.betPart.length; j++) {
					var part = bet.parts.betPart[j];
					var betSelection = betSelections[j];
					if (part.selectionId == betSelection.selectionId) {
						if (j == bet.parts.betPart.length - 1) {
							if (_.has(this.systemBets, bet.type)) {
								var sysBet = this.systemBets[bet.type];
								var resultStake = parseFloat(betResult.totalStake).toFixed(2);
								var systemBetStake = parseFloat(sysBet.totalStake()).toFixed(2);

								if (systemBetStake == resultStake) {
									betWrapper.name = bet.type;
									betWrapper.stake = resultStake;
									break;
								}
							}
							else {
								//SYSTEM_? MULTIPLE BET NAMES.
								var betTypeName = BetTypeCalculator.getMultipleNamesAlias(bet.type);
								if (_.has(this.systemBets, betTypeName)) {
									var sysBet = this.systemBets[betTypeName];
									var resultStake = parseFloat(betResult.totalStake).toFixed(2);
									var systemBetStake = parseFloat(sysBet.totalStake()).toFixed(2);
									var potentialReturns = parseInt(betResult.potentialPayout);
									var sysBetPotentialReturns = parseInt(sysBet.estimatedReturns());

									if (systemBetStake == resultStake && potentialReturns == sysBetPotentialReturns) {
										betWrapper.name = betTypeName + 'S';
										betWrapper.stake = resultStake;
										break;
									}
								}
								else { //JUST 'MULTIPLE' BET NAMES.
									var betTypeName = BetTypeCalculator.getMultipleBetNamesByIndex(bet.parts.betPart.length);
									if (_.has(this.systemBets, betTypeName)) {
										var sysBet = this.systemBets[betTypeName];
										var resultStake = parseFloat(betResult.totalStake).toFixed(2);
										var systemBetStake = parseFloat(sysBet.totalStake()).toFixed(2);
										var potentialReturns = parseInt(betResult.potentialPayout);
										var sysBetPotentialReturns = parseInt(sysBet.estimatedReturns());

										if (systemBetStake == resultStake && potentialReturns == sysBetPotentialReturns) {
											betWrapper.name = betTypeName;
											betWrapper.stake = resultStake;
											break;
										}
									}
								}
							}
						}
					}
					else {
						break;
					}
				}
			}
		}


		betWrapper.betParts = betParts;
		this.acceptedBetsCollection.push(betWrapper);
	},

	showConfirmationAndRejectionView: function () {
		//TEMP Fix for displaying old data in template.
		var that = this;
		setTimeout(function () {
			that.trigger("bets:showConfirmRejectionView");
		}, 500);
	},

	showConfirmationView: function () {
		//TEMP Fix for displaying old data in template.
		var that = this;
		setTimeout(function () {
			that.trigger("bets:showConfirmationView");
		}, 500);
	},

	setClosedBetsResult: function (closedBetsResult) {
		var closedBets = closedBetsResult;
		for (var i = 0; i < closedBets.length; i++) {
			var bet = closedBets[i];
			for (var j = 0; j < bet.parts.betPart.length; j++) {
				var part = bet.parts.betPart[j];
				if (_.includes(part.selection.name, '{homeLine}')) {
					if (_.has(part, 'line')) {
						var val = part.selection.name;
						var homeLine = part.line;
						part.selection.name = val.replace('{homeLine}', homeLine);
					}
				}
				else if (_.includes(part.selection.name, '{awayLine}')) {
					if (_.has(part, 'line')) {
						var val = part.selection.name;
						var homeLine = part.line;
						var awayLine = homeLine * -1;
						part.selection.name = val.replace('{awayLine}', awayLine);
					}
				}
				else if (_.includes(part.selection.name, '{Line}')) {
					if (_.has(part, 'line')) {
						var val = part.selection.name;
						var line = part.line;
						part.selection.name = val.replace('{Line}', line);
					}
				}
			}
		}
		this.trigger("bets:closedBetsViewDataComplete", closedBets);
	},


	setOpenBetsResult: function (openBetsReceived) {

		var openBets = openBetsReceived;
		var openBetsCollection = [];

		for (var i = 0; i < openBets.length; i++) {
			var openBet = {};
			openBet.cashoutEnabled = false;
			openBet.cashoutValue = 0.00;
			openBet.state = 'ACTIVE';

			var bet = openBets[i];
			var betName = bet.type;
			var stake = bet.stake.amount;

			var myReturn = 0;
			var totalReturn = 0;
			if (bet.type == 'SINGLE') {
				var stake = bet.stake.amount;
				totalReturn = 1;
				for (var j = 0; j < bet.parts.betPart.length; j++) {
					var part = bet.parts.betPart[j];
					myReturn = part.odds.decimal * stake;
					totalReturn = totalReturn * myReturn;
					var oddsObj = this.oddsFactory.getRootIndexFromDecimal(part.odds.decimal);
					part.odds.fractional = oddsObj.fractional;
					part.odds.american = oddsObj.american;

					if (_.includes(part.selection.name, '{homeLine}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var homeLine = part.line;
							part.selection.name = val.replace('{homeLine}', homeLine);
						}
					}
					else if (_.includes(part.selection.name, '{awayLine}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var homeLine = part.line;
							var awayLine = homeLine * -1;
							part.selection.name = val.replace('{awayLine}', awayLine);
						}
					}
					else if (_.includes(part.selection.name, '{Line}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var line = part.line;
							part.selection.name = val.replace('{Line}', line);
						}
					}
				}
			}
			else {
				var openBetsArray = [];

				for (var j = 0; j < bet.parts.betPart.length; j++) {
					var part = bet.parts.betPart[j];
					var oddsObj = this.oddsFactory.getRootIndexFromDecimal(part.odds.decimal);
					part.odds.fractional = oddsObj.fractional;
					part.odds.american = oddsObj.american;

					if (_.includes(part.selection.name, '{homeLine}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var homeLine = part.line;
							part.selection.name = val.replace('{homeLine}', homeLine);
						}
					}
					else if (_.includes(part.selection.name, '{awayLine}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var homeLine = part.line;
							var awayLine = homeLine * -1;
							part.selection.name = val.replace('{awayLine}', awayLine);
						}
					}
					else if (_.includes(part.selection.name, '{Line}')) {
						if (_.has(part, 'line')) {
							var val = part.selection.name;
							var line = part.line;
							part.selection.name = val.replace('{Line}', line);
						}
					}

					var selectionObj = {};
					selectionObj.eventId = part.event.id;
					var selectionId = part.selection.id;
					selectionObj.selectionId = selectionId;
					selectionObj.eventName = part.event.name;
					selectionObj.selectionName = part.selection.name;
					selectionObj.marketId = part.market.id;
					selectionObj.marketName = part.market.name;
					selectionObj.marketType = part.market.code;
					selectionObj.decimalOdds = part.odds.decimal;

					var newBet = this.buildBetSelectionFromOpenBet(selectionObj);
					openBetsArray['bet-' + selectionId] = newBet;
				}

				var newSystemBets = BetTypeCalculator.calculateSystemBets(openBetsArray);
				betName = BetTypeCalculator.getMultipleNamesAlias(bet.type);
				var systemBet = newSystemBets[betName];

				if (betName == 'MULTIPLE') {
					var indexName = BetTypeCalculator.getMultipleBetNamesByIndex(bet.parts.betPart.length);
					systemBet = newSystemBets[indexName];
				}

				if (systemBet) {
					var numberOfBets = systemBet.bets.length;
					var stakePerLeg = stake / numberOfBets;
					systemBet.stake = stakePerLeg;
				}
				var totalReturn = BetTypeCalculator.estimatedReturns([], newSystemBets);
			}

			openBet.bet = bet;
			openBet.bet.potentialReturns = parseFloat(totalReturn).toFixed(2);
			openBetsCollection.push(openBet);
		}


		this.openBetsCollection = openBetsCollection;
		this.trigger("bets:openViewDataComplete", openBetsCollection);
		this.calculateCashoutBets(openBetsCollection);
	},

	buildBetSelectionFromOpenBet: function (selectionObj) {
		var eventId = selectionObj.eventId;
		var selectionId = selectionObj.selectionId;

		var eventName = selectionObj.eventName;
		var selectionid = parseInt(selectionId);

		var selectionName = selectionObj.selectionName;
		var marketId = selectionObj.marketId;

		var marketName = selectionObj.marketName;
		var marketType = selectionObj.marketType;

		var decimalOdds = selectionObj.decimalOdds;

		var betSelection = new BetSelection(eventId, eventName, marketId, marketName, marketType,
			selectionid, selectionName, "", decimalOdds, "", 0);

		var newBet = this.addSelectionFromOpenBet(betSelection);
		return newBet;
	},

	addSelectionFromOpenBet: function (betSelection) {
		var newBetPart = new BetPart(betSelection, 1);
		var newBet = new SingleBet(newBetPart, '');
		return newBet;
	},


	onAccountBalanceUpdate: function (data) {
		var balance = data.balance;
		this.sessionModel.setBalance(balance);
	},

	subscribeToCashoutBets: function (bets) {
		if (_.size(bets) > 0) {
			var openBetCollection = [];
			for (var i = 0; i < bets.length; i++) {
				var betObj = bets[i];
				openBetCollection.push(betObj.bet);
			}
			var betIds = _.pluck(openBetCollection, 'id').join(',');
			this.commands.execute('command:subscribe:cashout', betIds);
		}
	},

	calculateCashoutBets: function (bets) {

		var filteredBets = _.filter(bets,
			function (betObj) {
				return betObj.bet.betStatus == 'ACCEPTED' && betObj.bet.freeBet == false;
			});

		if (this.useHTTPCashoutAPI) {
			var openBets = BetTypeCalculator.jsonToBets(filteredBets);
			var multiplesArray = [];

			for (var i = 0; i < filteredBets.length; i++) {
				var betObj = bets[i];
				if (betObj.bet.type == 'MULTIPLE') {
					betObj.bet.fullCover = false;
					multiplesArray.push(betObj.bet);
				}
			}

			//Remove the below for testing.
			//var myArray = [];
			//for (var j=0;j<bets.length;j++) {
			//    var bet = bets[j];
			//    if ( bet.bet.id == 150826870000105 ) {
			//        myArray.push(bet);
			//    }
			//}
			//var openBets = BetTypeCalculator.jsonToBets(myArray);

			if (_.has(openBets, 'singleBets')) {
				var betJson = BetJsonGenerator.generateJson(this.sessionModel.getAccountId(), this.sessionModel.getCurrency(),
					openBets.singleBets, multiplesArray, [], true, App.Globals.priceFormat, false, false);
				if (!_.isNull(betJson)) {
					this.commands.execute('command:calculateCashout', betJson);
				}
			}
		}
	},

	updateCashoutValues: function (cashoutResult) {
		this.cashoutCollection = [];

		for (var i = 0; i < cashoutResult.length; i++) {
			var cashoutBet = cashoutResult[i];
			for (var j = 0; j < this.openBetsCollection.length; j++) {
				var openbet = this.openBetsCollection[j];
				if (openbet.bet.id == cashoutBet.betId && cashoutBet.status == 'OK') {
					openbet.cashoutEnabled = true;
					openbet.cashoutValue = cashoutBet.cashoutValue;
					this.cashoutCollection.push(openbet);
					break;
				}
			}
		}

		this.trigger("bets:calculateCashoutDataComplete", this.cashoutCollection);
	},

	setCashoutResultResponse: function (cashoutResult) {
		this.updateCashoutValues(cashoutResult);
		this.trigger("bets:cashoutStreamingDataComplete", this.cashoutCollection);
	},

	setCashoutResult: function (cashoutResult) {
		this.updateCashoutValues(cashoutResult);
		if (_.size(this.cashoutCollection) > 0) {
			this.subscribeToCashoutBets(this.cashoutCollection);
		}
	},

	cashoutBetById: function (betId) {
		var selectionId,
			cashOutStake;

		for (var i = 0; i < this.cashoutCollection.length; i++) {
			var cashoutBet = this.cashoutCollection[i];
			if (cashoutBet.bet.id == betId) {
				cashOutStake = cashoutBet.cashoutValue;
				var parts = cashoutBet.bet.parts;
				selectionId = parts.betPart[0].selectionId;
				cashoutBet.cashoutEnabled = false;
				this.commands.execute('command:cashoutBet', betId, selectionId, cashOutStake);
				break;
			}
		}

	},

	cashoutResultComplete: function (data) {
		if (_.has(data), 'rejectionCode') {
			var translatedStatus = App.translator.translate(data.rejectionCode);
			data.rejectionCode = translatedStatus;
		}
		this.trigger("bets:cashoutBetComplete", data);
		this.vent.trigger('requestExternalBalanceRefresh');

		if (_.has(data), 'status') {
			var betId = data.betId;
			var status = data.status;
			if (status == "SUCCESS") {
				for (var i = 0; i < this.cashoutCollection.length; i++) {
					var cashoutBet = this.cashoutCollection[i];
					if (cashoutBet.bet.id == betId) {
						this.cashoutCollection.splice(i, 1);
						break;
					}
				}
			}
		}

	},

	cashoutError: function (error) {
		this.trigger("bets:cashoutError", error);
	},


	onBetUpdate: function (data) {
		var betId = data.id;
		var status = data.betStatus;
		var balance = data.balance;

		var betsCollection = [];

		for (var i = 0; i < this.acceptedBetsCollection.length; i++) {
			var betWrapper = this.acceptedBetsCollection[i];
			if (betId == betWrapper.betId) {
				betWrapper.status = status;
				betsCollection.push(betWrapper);
				break;
			}
		}

		if (status == 'ACCEPTED') {
			this.trigger("bets:addConfirmations", betsCollection);
			this.showConfirmationView();
			this.vent.trigger('requestExternalBalanceRefresh');
		}
		else if (status == 'REJECTED') {
			if (betsCollection.length > 0) {

				var traderMessage = "Your bet could not be accepted following a trader review." + ' ' +
					"Please try again using the ‘Max Stake’ or by entering a lower stake manually." + ' ' +
					"Please read our FAQs for more information.";

				this.trigger("bets:hideMaxStakeInfo");

				//Re-add the selections back in.
				var singleArray = _.values(this.singleBets);
				for (var i = 0; i < singleArray.length; i++) {
					var bet = singleArray[i];
					this.trigger("bets:addSingleBet", bet);
					this.getMaxAllowedStake(bet);
				}

				var betParts = betsCollection[0].betParts;
				var rejectionObj = {};
				rejectionObj.bets = [];
				rejectionObj.status = 'OVER_ASK_TRADER_REJECTION';
				rejectionObj.reasonCode = traderMessage;
				this.showRejection(rejectionObj);

			}
		}
	},

	onBonusEntitlementsChange: function () {
		var singles = _.values(this.singleBets);
		for (var i = 0; i < singles.length; i++) {
			var singleBet = singles[i];
			var eventId = singleBet.eventId();
			var event = this.cache.getEvent(eventId);
			var path = event.attributes.path;

			var freeBet = this.bonusModel.checkFreeBetsPaths(path);
			var decimalOdds = singleBet.getOdds("DECIMAL");
			var isValid = this.validateFreeBetCriteria(freeBet, event, decimalOdds);
			if (isValid) {
				var bonusStake = freeBet.bonusStakes[0];
				var minStakeAmount = bonusStake.amount;
				singleBet.isFreeBet = true;
				singleBet.freeBet = freeBet;
				singleBet.freeBetDescription = minStakeAmount + ' FREE BET ON ' + freeBet.description;
			}
			else {
				singleBet.isFreeBet = false;
				singleBet.redeemFreeBet = false;
				singleBet.freeBetDescription = '';
			}
		}
		this.trigger("bets:translationComplete");
	}
});


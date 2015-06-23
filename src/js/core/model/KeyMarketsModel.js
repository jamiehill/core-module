

export default Backbone.Model.extend({

	markets: {
		soccer:     { defaults: true, markets: ['MRES','OVUN','H1RS','DNOB','OUH1']},
		handball:   { defaults: true, markets: ['HBMRES','HBTG']},
		tennis:   { defaults: true, markets: ['AB']},
		snooker:   { defaults: true, markets: ['SOMO','SOTFOU']},
		volleyball: { defaults: true, markets: ['VOMB','VOMR','VOTO']},
		rugby_union: { defaults: true, markets: ['RUMR']},
		rugby_league: { defaults: true, markets: ['RLMR']},
		badminton:   { defaults: true, markets: ['BNML','BNTO']},
		futsal:   { defaults: true, markets: ['FUML','FUTSMO','FUTO']},
		bowls:   { defaults: true, markets: ['BOML','BOTO']},
		floorball:   { defaults: true, markets: ['FLMR','FLML','FLTO']},
		darts:   { defaults: true, markets: ['DAMO']},
		golf:   { defaults: true, markets: ['GO3B']},
		table_tennis:   { defaults: true, markets: ['TTML','TTTO']},
		waterpolo:   { defaults: true, markets: ['WPMR','WPTO']},
		e_sports:   { defaults: true, markets: ['ESML','ESHC']},
		boxing:   { defaults: true, markets: ['BOFW']},

		american_football: { defaults: true, markets: ['AFML','AFTO','AF2U']},
		baseball:   { defaults: true, markets: ['BBML','BBRL','BBTR']},
		basketball: { defaults: true, markets: ['BAML','BATO','BA1W']},
		ice_hockey: { defaults: true, markets: ['IHMR']}
	},


	donbest: {
		sports: ['ice_hockey'],
		countries: ['usa', 'united states', 'canada'],
		ice_hockey: 'IHML'
	},


	defaults: {
		keyMarkets: null,
		marketNames:{}
	},


	/**
	 *
	 */
	initialize: function() {
		_.bindAll(this, 'onSportChange', 'hasMarkets');
		this.listenTo(App.vent, 'globals:sportChange', this.onSportChange);

	},


	/**
	 * Parse all market types into objects for each market group
	 * @param templates
	 * @param sport
	 */
	parse: function(sport, markets) {
		sport = sport.toLowerCase();
		markets = markets || [];

		// store markets and set as current if sport is same as global sport
		this.markets[sport] = {defaults: false, markets: markets};
		if (App.Globals.sport == sport){
			this.set({keyMarkets: this.markets[sport]});
			this.trigger("marketNameDataComplete");
		}

		this.trigger('keyMarketsLoaded:'+sport);
	},


	/**
	 * @param sport
	 * @param marketNames
	 */
	setMarketNames: function(sport, marketNames) {
		sport = sport.toLowerCase();
		var marketNameArray = this.getMarketNames();
		marketNameArray[sport] = marketNames;
		this.set({marketNames: marketNameArray});
		this.trigger('change:marketNames', marketNames);
		this.trigger("updateComplete", sport);
	},


	/**
	 * @returns {*}
	 *
	 */
	getMarketNames: function() {
		return this.get('marketNames');
	},


	/**
	 * @param sport
	 * @param code
	 * @returns {*}
	 */
	getMarketNameByCode: function(sport, code) {
		var marketNames = this.getMarketNames();
		var marketDescription = code;

		if (_.has(marketNames, sport)) {
			var sportMarketNames = marketNames[sport];
			if (_.has(sportMarketNames, code)) {
				marketDescription = sportMarketNames[code];
			}
		}
		return marketDescription;
	},


	/**
	 * Returns true if market group types have been loaded previously
	 * @param sport
	 * @returns {*}
	 */
	hasMarkets: function(sport) {
		var market = this.markets[sport.toLowerCase()];
		return (!_.isUndefined(market) && !market.defaults);
	},


	/**
	 * Returns all market type codes for the specified market group and sport
	 * @param sport
	 */
	getMarkets: function(sport, delimit) {
		sport = (sport || App.Globals.sport).toLowerCase();
		delimit = delimit !== false;

		if (!_.has(this.markets, sport)) return [];

		var markets = this.markets[sport].markets;
		return delimit ? markets.join(',') : markets;
	},


	/**
	 * Returns all market type codes for the specified market group and sport
	 * @param sport
	 */
	getAllMarkets: function(sports, delimit) {
		var allMarkets = [];
		_.each(sports, function(sport) {
			var markets = this.getMarkets(sport.toLowerCase(), false);
			allMarkets = allMarkets.concat(markets);
		}, this);

		return  delimit ? allMarkets.join(',') : allMarkets;
	},


	/**
	 * Returns all key markets for all current sports
	 * @param delimit
	 * @returns {*}
	 */
	getAllSportMarkets: function(delimit) {
		var sports = _.keys(this.markets);
		return this.getAllMarkets(sports, delimit);
	},


	/**
	 * Returns the default/first key market for specified sport
	 * @param sport
	 * @returns {*}
	 */
	getDefaultMarket: function(sport, country) {
		sport = (sport || App.Globals.sport).toLowerCase();

		// if the country/sport is a donbest country, we need to substitute
		// the default market type for the donbest version (if specified)
		if (this.isDonBest(sport, country)) {
			return this.donbest[sport];
		}

		var markets  = this.markets[sport].markets,
			multiple = App.Config.client == 'baba234234';

		//return multiple ? markets.join(',') : _.first(markets);
		return _.first(markets);
	},


	/**
	 * @param sport
	 * @param country
	 * @returns {boolean}
	 */
	isDonBest: function(sport, country) {
		if (!sport || !country) return false;
		var countryMatch = _.contains(this.donbest.countries, country.toLowerCase()),
			sportMatch   = _.contains(this.donbest.sports, sport.toLowerCase());
		return (sportMatch && countryMatch);
	},


	/**
	 * @param sports
	 * @returns {Array}
	 */
	getDefaultMarkets: function(sports) {
		return _.map(sports, function(sport) {
			return this.getDefaultMarket(sport.toLowerCase());
		}, this);
	},


	/**
	 * @param sports
	 * @returns {Array}
	 */
	getAllDefaultMarkets: function() {
		return _.map(this.markets, function(val, key) {
			return this.getDefaultMarket(key.toLowerCase());
		}, this);
	},


	/**
	 * Returns an object literal of key market types and names
	 * @param sport
	 * @returns {Array}
	 */
	getMarketObjs: function(sport) {
		var keyMarkets = this.getMarkets(sport, false);
		return _.reduce(keyMarkets, function(memo, km) {
			var kmName = this.getMarketNameByCode(sport, km);
			memo.push({name:km, code: kmName || km});
			return memo;
		}, [], this);
	},


	/**
	 * @param sport
	 */
	onSportChange: function(sport) {
		sport = sport || App.Globals.sport;

		// if previously loaded, set as current
		if (this.hasMarkets(sport)) {
			this.set('keyMarkets', this.markets[sport]);
		}
		else {
			// TODO var commands = ctx.get('commands');
			// TODO commands.execute('command:getAvailableMarketsForSports', sport);
			// TODO commands.execute('command:getKeyMarketsForSport', sport);
		}
	},

	onLocaleChange: function() {
		var needToTranslateSports = [];
		for (name in this.markets) {
			 if (name && this.hasMarkets(name)){
				needToTranslateSports.push(name);
			 }
		}
		//we will always have a minimum of 2 sports to translate (soccer / tennis);
		if(needToTranslateSports.length > 0 ){
			var sportsToTranslate = needToTranslateSports.join(',');
			// TODO var commands = ctx.get('commands');
			// TODO commands.execute('command:getAvailableMarketsForSports', sportsToTranslate);
		}
	},

	getGoalScorerMarketTypes: function(marketType) {
		var goalScorerMarkets = ['FGSC','LGSC','PSCR','HATR','PTS2'];
		return $.inArray(marketType, goalScorerMarkets) !== -1;
	}

});

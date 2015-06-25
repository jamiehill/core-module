
var Model = Backbone.Model.extend({

	defaults: {
		"sports": []
	},


	/**
	 * Returns the list of available sports
	 * @returns {Array|Iterator.<number>|Iterator.<K>|Iterator.<T>}
	 */
	getSports: function() {
		var sports = this.get('sports');
		return _.keys(sports);
	},


	/**
	 * Returns the sport object for a specified sport
	 * @param sport
	 * @returns {*}
	 */
	getSport: function(sport) {
		var sports = this.get('sports');
		sport = (sport || App.Globals.sport).toUpperCase();
		return sports[sport];
	},

	/**
	 *
	 * Returns market types for a specified sport
	 * @param sport
	 * @returns {*}
	 */
	getMarkets: function(sport) {
		var sport = this.getSport(sport);
		return sport.markets;
	},


	/**
	 * Returns the market groups for the specified sport
	 * @param sport
	 * @returns {exports.groups|{}|Array|groups|*}
	 */
	getGroups: function(sport) {
		var sport = this.getSport(sport);
		return sport.groups;
	},


	/**
	 * returns a market object matching the specified market type
	 * @param type
	 * @param sport
	 * @returns {*}
	 */
	getMarketByType: function(type, sport) {
		var markets = this.getMarkets(sport);
		return markets[type];
	},


	/**
	 * @param sport
	 * @returns {*}
	 */
	getKeyMarket: function(sport) {
		var sport = this.getSport(sport);
		return _.first(sport.keyMarkets);
	},


	/**
	 * Get all key markets for sport
	 * @param sport
	 * @returns {"MRES": }
	 */
	getKeyMarkets: function(sport) {
		var sport = this.getSport(sport);
		return _.reduce(sport.keyMarkets, function(memo, type) {
			memo[type] = this.getMarketByType(type);
			return memo;
		}, {}, this);
	},


	/**
	 * Returns the markets groups relevant to this event
	 * @param event
	 * @returns {"Match": ["MRES", "AB1", "AB2"]}
	 */
	getGroupsForEvent: function(event) {
		var code  = event.get('code'),
			sport = this.getSport(code);

		var markets = event.Markets.pluck('type');
		var groups  = _.reduce(sport.groups, function(memo, name, group) {
			// an array of markets for this event,
			// that are present in this market group
			var present = _.intersection(markets, group.types);
			if (present.length) {
				memo[name] = present;
			}
			return memo;

		}, {}, this);
		return groups;
	}

});

let inst = new Model();
export default inst;

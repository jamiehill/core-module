import Event from './Event';

export default Backbone.Model.extend({

	defaults: {
		popularBets :[],
		excess: 0,
		limit: 5
	},


	/**
	 *
	 */
	initialize: function() {
		this.listenTo(App.vent, 'globals:localeChange', this.ready);
	},


	/**
	 *
	 */
	ready: function() {
		//TODO this.commands.execute('command:getPopularBets');
	},


	/**
	 * @param bets
	 */
	parseBets: function(bets) {
		var market, selection;

		var tmp = _.map(bets, function(bet) {
			// map 'sport' to 'code' as is the wrong property coming in!
			bet.code = bet.sport; delete bet.sport;

			// store popular bet market and selection ids
			market = _.first(bet.markets);
			selection = _.first(market.selection);

			// convert data to real Event object
			var event = ctx.get('eventCache').updateEvent(bet);

			// retrieve the real versions of the data
			market = event.findMarket(market.id);
			selection = market.findSelection(selection.id);

			return {event: event, popularMarket: market, popularSelections: selection, time: event.get('eventTime'), sport: event.get('code')};
		}, this);

		this.updateBets(_.sortBy(tmp, function(b) {
			return b.time;
		}), 5);
	},


	/**
	 * @param bets
	 * @param limit
	 */
	updateBets: function(bets, limit) {

		//TEMP FIX to EXCLUDE OUTRIGHT POPULAR BETS.
		var filteredBets = _.filter(bets, function(bet) {
			return bet.sport != 'GOLF' && bet.sport != 'HORSE_RACING';
		});

		this.setLimit(limit, filteredBets);
		this.set({popularBets: filteredBets});
	},


	/**
	 * @param limit
	 */
	setLimit: function(limit, bets) {
		var allBets = bets || this.get('popularBets'),
			excess  = Math.max(0, allBets.length - limit);
		this.set({excess: excess});
		this.set({limit: limit});
	},


	/**
	 * Returns bets upto the limited maximum number
	 * @returns {Backbone.Collection.models|*}
	 */
	getBets: function(sport) {
		var limit = this.attributes.limit,
			bets  = _.first(this.attributes.popularBets, limit);
		var filtered  = this.filterSport(bets, sport);
		return filtered || [];
	},


	/**
	 * @param eventId
	 * @returns {*}
	 */
	getBetById: function(eventId) {
		var bets = this.get('popularBets');
		return _.findWhere(bets, {id: eventId});
	},


	/**
	 * @param quicklinks
	 * @returns {*}
	 */
	filterSport: function(bets, sport) {
		if (_.isEmpty(sport)) return bets;
		return _.filter(bets, function(bet) {
			var betSport  = bet.sport.toLowerCase(),
				fltrSport = sport.toLowerCase();
			return betSport === fltrSport;
		});
	}
});

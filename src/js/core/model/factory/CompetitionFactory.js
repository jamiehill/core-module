import Backbone from 'backbone';
import Collection from 'core/collection/CompetitionsCollection';
import Competition from 'core/model/Competition';
import service from 'core/service/ApiService';
import cache from 'core/model/EventCache';

var Model = Backbone.Model.extend({

	deferred: null,
	collection: new Collection(),
	defaultEvents: {},
	Sports: {},
	Countries: {},
	Leagues: {},
	All: {},


	/**
	 * @param eventId
	 */
	fetch: function(callback) {
		var sport = App.Globals.sport.toLowerCase(),
			that = this;

		// if not loaded yet we need to get them
		if (!_.has(this.Sports, sport)) {

			// if they're in the process of being loading, hijack the current
			// deferred object and invoke the callback once resolved
			if (this.deferred) {
				this.deferred.done(function(){
					var competitions = that.getSport(sport);
					if (callback) callback(competitions);
				});
				return;
			}

			// otherwise initialise the load ourselves, and
			// and invoke the callback once resolved
			else {
				this.loadCompetitions(sport)
					.done(function() {
						var competitions = that.getSport(sport);
						if (callback) callback(competitions);
					});
				return;
			}
		}

		// data already loaded so return it
		var competitions = that.getSport(sport);
		if (callback) callback(competitions);
		else this.collection.reset(competitions.models);
	},


	/**
	 * Loads the competitions for the specified sport
	 * @param sport
	 * @returns {*}
	 */
	loadCompetitions: function(sport) {
		this.deferred = $.Deferred();
		var that = this;

		service.getSportTree(sport.toUpperCase(), true, true)
			.done(function(resp){
				if (_.has(resp, 'Sport') && _.has(resp.Sport, 'competitions')) {
					that.parseCompetitions(resp.Sport.competitions.category, sport);
				}
				that.deferred.resolve();
				that.deferred = null;
			});
		return that.deferred;
	},


	/**
	 * @param countries
	 */
	parseCompetitions: function(data, s) {
		var countries, leagues, country;
		var sport = this.getSport(s);

		// kill the comparator so that the competitions
		// maintain the sort order from the server
		sport.comparator = undefined;
		countries = _.map(data, function(cntry) {
			_.extend(cntry, {level: 'country', code: s});
			country = this.store(cntry, this.Countries);

			// map out the leagues for this country
			leagues = _.map(cntry.competition, function(lg) {
				_.extend(lg, {level: 'league', parent: country, code: s});

				var league = this.store(lg, this.Leagues);
				var evvvttss = _.filter(lg.event, function(eeeee) {
					return eeeee.markets && eeeee.markets.length;
				})

				var marketTypes = _.groupBy(evvvttss, function(ee) {
					if (ee.markets && ee.markets.length) {
						return _.first(ee.markets).type;
					}
					return '';
				}, this);

				var events = _.reduce(evvvttss, function(memo, e) {
					_.extend(e, {level: 'event', parent: league});

					var index = e.name.indexOf('-');
					if (index != -1) {
						e.name = e.name.substring(index+2);
					}

					//console.log("Comp: Country: "+cntry.name+", League: "+lg.name+", Event: "+ e.name);

					var evt = cache.updateEvent(e);
					if (!this.defaultEvents[s]) {
						this.defaultEvents[s] = evt;
					}

					if (!!evt.get('numMarkets')) {
						this.All[evt.id] = evt;
						memo.push(evt);
					}

					return memo;
				}, [], this);

				league.Children.reset(events);
				return league;

			}, this);

			// add the leagues to the country
			country.Children.reset(leagues);
			return country;

		}, this);

		sport.reset(countries);
		return sport;
	},


	/**
	 * @param country
	 */
	getCountries: function(spt) {
		spt = (spt || App.Globals.sport).toLowerCase();
		return this.getSport(spt);
	},


	/**
	 * @param id
	 */
	getCompetition: function(id) {
		if (!_.has(this.All, id)) {
			return this.getDefaultCompetition(true);
		}
		return this.All[id];
	},


	/**
	 * Returns the specified competitions parent
	 * @param id
	 * @returns {*}
	 */
	getParent: function(id) {
		var comp = this.All[id];
		return comp ? comp.get('parent') : null;
	},


	/**
	 * Adds the events ancestors to the event
	 * @param event
	 */
	addAncestors: function(event) {
		var parentId = event.get('compId'),
			comp = this.getParent(parentId);
		if (comp) {
			event.set({parent: comp});
			var country = comp.get('parent');
			if (country) event.set({country: country});
		}
	},


	/**
	 * @param id
	 * @returns {*}
	 */
	getCountryForCompetition: function(compId) {
		if (!compId) return this.getDefaultCountry();
		var competition = this.All[compId];
		if (!competition) return this.getDefaultCompetition();
		return competition.get('parent');
	},


	/**
	 * @param eventId
	 * @returns {*}
	 */
	getCountryForEvent: function(eventId) {
		if (!eventId) return this.getDefaultCountry();
		var event  = cache.getEvent(eventId),
			compId = event.get('compId');
		return this.getCountryForCompetition(compId);
	},


	/**
	 * @param event
	 * @returns {*}
	 */
	getCompetitionForEvent: function(event) {
		var competitionId = event.get('compId');
		return this.getCompetition(competitionId);
	},


	/**
	 * @returns {*}
	 */
	getDefaultCountry: function() {
		var sport = App.Globals.sport.toLowerCase(),
			countries = this.getSport(sport);
		return _.first(countries.models).id;
	},


	/**
	 * @param sport
	 * @returns {*}
	 */
	getDefaultCompetition: function(returnComp) {
		var sport = App.Globals.sport.toLowerCase(),
			countries = this.getSport(sport),
			country = countries.at(0);

		returnComp = returnComp || false;
		if(!_.isUndefined(country)) {
			var comp = _.first(country.Children.models);
			return returnComp ? comp : comp.id;
		}
		return '';
	},


	/**
	 * @param sport
	 * @returns {*}
	 */
	getSport: function(sport) {
		sport = (sport || App.Globals.sport).toLowerCase();

		if (_.isUndefined(this.Sports))
			this.Sports = {};

		if (!_.has(this.Sports, sport))
			this.Sports[sport] = new Collection();

		return this.Sports[sport];
	},


	/**
	 * @param sport
	 * @returns {boolean}
	 */
	hasSport: function(sport) {
		sport = (sport || App.Globals.sport).toLowerCase();
		return _.has(this.Sports, sport);
	},


	/**
	 * Store the specified competition for easy lookup
	 * @param data
	 * @param obj
	 * @returns {Competition}
	 */
	store: function(data, obj) {
		// create the new Competition object
		var comp = new Competition(data);
		comp.Children = new Collection();
		comp.Children.comparator = undefined;
		// store the competition in general lookup hash,
		// and the appropriate sport/competition/league hash
		this.All[data.id] = comp;
		obj[data.id] = comp;
		// return comp
		return comp;
	}
});

let inst = new Model();
export default inst;

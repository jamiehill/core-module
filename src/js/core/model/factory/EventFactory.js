import Marionette from 'backbone.marionette';
import EventsCollection from 'core/collection/EventsCollection';
import dataModel from 'core/model/SportDataModel';
import compFactory from 'core/model/factory/CompetitionFactory';
import cache from 'core/model/EventCache';
import service from '../../service/ApiService';
import {abbr} from 'core/utils/AppUtil';

// default Model params
let Model = {headers: ['1', 'x', '2'], sport: '', marketType: 'MRES', sortType: 'date', event: null, state: 'SUSPENDED', autoLoad: true, displayed: true};

var Factory = Marionette.Controller.extend({

	collection: null,
	maxInplayEvents: 100,
	model: null,


	/**
	 * @param options
	 */
	initialize: function() {
		this.collection = new EventsCollection();
		this.model = new Backbone.Model(Model);
	},


	/**
	 * Fetch events using the specified criteria
	 * @param marketType
	 * @param spt
	 * @param dys
	 * @param prmtch
	 * @param inply
	 */
	fetch: function(marketType, spt, dys, prmtch, inply, max) {
		var that  = this,
			mt    = marketType || dataModel.getKeyMarket(),
			sport = spt || App.Globals.sport,
			days  = dys || 0;

		service.getSportSchedule(sport.toUpperCase(), mt, days, false, prmtch, inply)
			.done(function(resp){
				if (_.has(resp, 'Sport')) {
					that.parseSchedule(resp.Sport, mt, prmtch, inply, max);
				}
			});
	},


	/**
	 * Helper function to return inplay events
	 * @param marketType
	 * @param spt
	 * @param dys
	 */
	fetchInplay: function(marketType, spt, dys) {
		this.fetch(marketType, spt, dys, 0, this.maxInplayEvents);
	},


	/**
	 * @param marketType
	 * @param dys
	 */
	fetchAllSportsInplay: function() {
		var that  = this;

		service.getFrontPageSchedule("", false, false, null, 0, this.maxInplayEvents)
			.done(function(resp){
				if (_.has(resp, 'FrontPageSchedule')) {
					that.parseInplaySports(resp.FrontPageSchedule.sports, this.maxInplayEvents);
				}
			});
	},


	fetchEvents: function(eventIds, marketType) {
		eventIds = _.isArray(eventIds) ? eventIds.join(',') : eventIds;
		var mt   = marketType || dataModel.getKeyMarket(),
			that = this;
		service.getEventsById(eventIds, marketType)
			.done(function(resp){
				if (_.has(resp, 'Events')) {
					that.parseEvents2(resp.Events.event, App.Globals.sport.toLowerCase(), mt);
				}
			});
	},


	/**
	 * @param marketType
	 * @param date
	 */
	fetchDaily: function(marketType, date, grouped) {
		date = moment(parseInt(date));
		var that  = this,
			mt    = marketType || dataModel.getKeyMarket(),
			sport = App.Globals.sport.toUpperCase(),
			from  = date.startOf('day').valueOf(),
			to    = date.endOf('day').valueOf(),
			gp    = _.isUndefined(grouped) ? true : grouped;

		service.getEvents(sport, from, to, mt)
			.done(function(resp){
				if (_.has(resp, 'Events')) {
					that.parseDailyEvents(resp.Events.event, App.Globals.sport.toLowerCase(), mt, gp);
				}
			});
	},


	/**
	 * @param compId
	 */
	fetchCompetition: function(compId, marketType) {
		var that = this;
		compFactory.fetch(function() {
			// retrieves the specified competition or default if no id
			var competition = compFactory.getCompetition(compId);
			var sport  = App.Globals.sport.toLowerCase(),
				market = marketType || dataModel.getKeyMarket(sport);

			market = 'MRES';

			service.getCompetitionEvents(competition.id, market)
				.done(function(resp){
					if (_.has(resp, 'Competition')) {
						that.parseCompetition(resp.Competition.event, App.Globals.sport, competition.id, market);
					}
				});
		});
	},


	/**
	 * @param sport
	 * @param marketType
	 */
	fetchFrontLinks: function(sport, marketType, maxfrontlinks) {
		var that = this;

		service.getFrontPageSchedule('', false, true, marketType,'','','',maxfrontlinks )
			.done(function(resp){
				if (_.has(resp, 'FrontPageSchedule')) {
					that.parseFrontLinks(resp.FrontPageSchedule, sport, marketType);
				}
			})
			.fail(function(er) {
				console.log('Frontlinks: Failed! '+JSON.stringify(er));
			});
	},


	/**
	 * @param schdl
	 */
	parseSchedule: function(schdl, marketType, prmtch, inply, max) {
		var total, events = [];
		max = max || 999;

		// add inplay events, upto the maximum specified
		if (inply != 0 && schdl.inplay) {
			total  = this.parseEvents(schdl.inplay.event);
			if (total.length) {
				events = events.concat(_.first(total, max));
			}
		}
		// if events doesn't contain maiximum allowed amount,
		// fill with prematch events upto the maximum amount
		if (prmtch != 0 && schdl.prematch && events.length < max) {
			var remainder = max - events.length;
			total = this.parseEvents(schdl.prematch.event);
			if (total.length) {
				events = events.concat(_.first(total, remainder));
			}
		}

		//this.parseCompetitions(schdl.competitions);
		events = this.parseModel(schdl, events, marketType);

		//this.currentEvents.reset(events);
		this.collection.reset(events);
	},


	/**
	 * @param schdl
	 */
	parseCompetition: function(schdl, sport, compId, mt) {
		_.extend(schdl, {code: sport});

		var events = this.parseEvents(schdl),
			marketType = mt || dataModel.getKeyMarket();

		// parse relevant model data
		if (!!events.length)
			events = this.parseModel(schdl, events, marketType);

		// store the competition on the model
		this.model.set({comp: compFactory.getCompetition(compId)});

		// and add to collections
		//this.currentEvents.reset(events);
		this.collection.reset(events);
	},


	/**
	 * @param resp
	 * @param sport
	 * @param marketType
	 */
	parseEvents2: function(resp, sport, mt) {
		var events = this.parseEvents(resp),
			marketType = mt || dataModel.getKeyMarket();
		// parse relevant model data
		if (!!events.length) {
			events = this.parseModel({code: sport}, events, marketType);
		}
		this.collection.reset(events);
	},


	/**
	 * @param resp
	 * @param sport
	 * @param marketType
	 */
	parseDailyEvents: function(resp, sport, mt, grouped) {
		var sort = this.model.get('sortType');
		if (sort == 'competition') {
			this.parseDailyCompetitions(resp, mt);
			return;
		}

		var events = this.parseEvents(resp),
			marketType = mt || dataModel.getKeyMarket();

		// parse relevant model data
		if (!!events.length) {
			events = this.parseModel({code: sport}, events, marketType);
			events = _.sortBy(events, function(e) {
				return e.get('eventTime');
			});
		}

		//this.currentEvents.reset(events);
		var models = events;

		if (grouped) {
			this.model.set({events: events, code: sport});
			models = [this.model.clone()];
		}

		this.collection.reset(models);
	},


	/**
	 * @param resp
	 * @param mt
	 */
	parseDailyCompetitions: function(resp, mt) {
		var events = this.parseEvents(resp),
			marketType = mt || dataModel.getKeyMarket();

		// group events by compId
		var competitions = _.groupBy(events, function(evt) {
			return evt.get('compName');
		});

		var groups = _.reduce(competitions, function(memo, evts, compName) {
			var evt    = _.first(evts);
			var sport  = evt.get('code');
			var weight = evt.get('compWeighting');


			// parse out the required events
			evts = this.parseModel({sport: sport}, evts, marketType);
			if (!!evts.length) {
				evts = _.sortBy(evts, function(e) {
					return e.get('eventTime');
				});
				// add sport specific attributes to the model
				// and return a cloned copy so not to affect the rest
				this.model.set({code: sport, events: evts, compName: compName, compWeight: weight, marketType: marketType});
				memo.push(this.model.clone());
			}
			return memo;

		}, [], this);

		//this.currentEvents.reset(events);
		this.collection.reset(groups);
	},


	/**
	 * @param schdl
	 */
	parseFrontLinks: function(schdl, sport, marketType) {
		// if is an empty array, clear out the events
		// so old events are not displayed incorrectly
		if (_.isArray(schdl.frontLinks) && !schdl.frontLinks.length) {
			this.collection.reset([]);
			return;
		}

		var schedule = _.first(schdl.frontLinks);
		if (!schedule) {
			console.log("parseFrontLinks :: no schedule aborting");
			return;
		}

		sport = (sport || schedule.sport).toLowerCase();
		_.extend(schdl, {code: sport});

		var mt = marketType || dataModel.getKeyMarket(sport),
			sports = {};

		var frontLinks = _.reduce(schdl.frontLinks, function(memo, fl) {
			var sprt = fl.sport.toLowerCase();
			sports[sprt] = true;
			// only process links for the specified sport
			if (sprt == sport) {
				memo.push(fl.event);
			}
			return memo;
		}, [], this);

		// set the available sports on the model
		this.model.set({sports: _.keys(sports)});

		var events = this.parseEvents(frontLinks);
		if (!!events.length)
			events = this.parseModel(schdl, events, mt);

		this.collection.reset(events);
	},


	/**
	 * Parses an event object into actual Events
	 * @param evts
	 * @param sport
	 * @returns {*}
	 */
	parseEvents: function(evts, sport) {
		return _.reduce(evts, function(memo, e) {
			// only process if the event has markets
			if (!!e.markets.length) {
				var isCorrectSport = sport == e.sport;
				// if a sport has been specified, make sure the
				// event matches, if none specified just add it
				if (_.isUndefined(sport) || isCorrectSport) {
					var event = cache.updateEvent(e);
					compFactory.addAncestors(event);
					memo.push(event);
				}
			}
			return memo;
		}, [], this);
	},


	/**
	 * @param comps
	 */
	parseCompetitions: function(comps) {
		if (!_.isUndefined(comps)) {
			compFactory.parseCompetitions(comps.category);
		}
	},


	/**
	 * @param schdl
	 */
	parseInplaySports: function(sports, marketType, inply) {
		var groups = _.reduce(sports, function(memo, sport) {
			// get the events for this sport, and default keyMarket
			var evts = cache.parseEvents(sport.inplay.event),
				market = dataModel.getKeyMarket(sport.code);

			// parse out the required events
			evts = this.parseModel(sport, evts, market);
			if (!!evts.length) {
				// add sport specific attributes to the model
				// and returned a cloned copy so not to affect the rest
				_.extend(this.model.attributes, {events: evts});
				memo.push(this.model.clone());
			}
			return memo;

		}, [], this);

		//this.currentEvents.reset(groups);
		this.collection.reset(groups);
	},


	/**
	 *
	 */
	parseModel: function(schdl, evts, marketType) {
		this.model.set({headers:[]});

		// if a marketType has been specified, we need to filter
		// out events that don't have that key market type
		if (!_.isEmpty(marketType)) {
			// multiple market types specified
			if (_.contains(marketType, ',')) {
				evts = _.filter(evts, function(e) {
					var types = marketType.split(',');
					e.set({currentMarkets: marketType});
					e.oldKeyMarkets = e.keyMarkets;
					e.keyMarkets = e.findMarketsByTypes(types, true);

					// If e.keyMarkets is a single object, wrap an array around it
					if (e.keyMarkets && !(_.isArray(e.keyMarkets))){
						e.keyMarkets = [e.keyMarkets];
					}

					return !!e.keyMarkets.length;
				}, this);
			}

			// single key market specified
			else {
				evts = _.filter(evts, function(e) {
					// if the event has the specified market, add as a new
					// property 'keyMarket' for ease of use in template
					var market = e.findMarketByType(marketType, true);
					if (market) {
						e.set({currentMarkets: marketType});
						e.oldKeyMarket = e.keyMarket;
						e.keyMarket = _.isArray(market) ? _.first(market) : market;
						if (e.keyMarket) {
							// set the headers for the market group
							this.model.set({headers: _.map(e.keyMarket.Selections.models, function(s) {
								return abbr(s.get('type'));
							})});
						}
					}
					// include the event, if the key market is present
					return !!e.keyMarket;

				}, this);
			}
		}

		this.model.set({marketType: marketType});
		if (!_.isUndefined(schdl.code)) {
			this.model.set({sport: schdl.code.toLowerCase()});
		}
		return evts;
	}

});

export default new Factory();

import Event from './Event';


var Collection = Backbone.Collection.extend({

	model: Event,
	sports: {},

	/**
	 * Adds an event instance to the cache
	 * @param event
	 */
	addEvent: function(evt) {
		if (_.isUndefined(evt)) return null;
		if (this.hasntEvent(evt.id)) {
			this.add(this.create(evt));
		}
		return this.getEvent(evt.id);
	},


	/**
	 * Utility method to create an event
	 * @param evt
	 */
	create: function(evt) {
		return new Event(evt, {parse: true});
	},


	/**
	 * Parses event data in Event objects
	 * @param evts
	 * @param sport
	 * @returns {*}
	 */
	parseEvents: function(evts) {
		return _.reduce(evts, function(memo, e) {
			// only process if the event has markets
			if (!!e.markets.length) {
				memo.push(this.updateEvent(e));
			}
			return memo;
		}, [], this);
	},


	/**
	 * If an event with matching id currently exist, updates
	 * that event, otherwise creates a new event with the data
	 */
	updateEvent: function(evt) {
		if (this.hasntEvent(evt.id))
			this.addEvent(evt);

		var event = this.getEvent(evt.id);
		var data = event.parse(evt);
		event.set(data);
		if (event.get('code') == "") {
			var defaultSport = App.Globals.sport;
			event.set('code',defaultSport)
		}
		return event;
	},


	/**
	 * Retrieve an Event from the collection
	 * @param id
	 */
	getEvent: function(id){
		return this.get(id);
	},


	/**
	 * Returns all events for a sport
	 * @param sport
	 * @returns {Array}
	 */
	getEvents: function(sport) {
		sport = (sport || App.Globals.sport).toLowerCase();
		return _.filter(this.models, function(evt) {
			if (_.isEmpty(evt.attributes.code)) return false;
			return sport == evt.get('code').toLowerCase();
		})
	},


	/**
	 * Query if an event is already cached
	 * @param id
	 */
	hasEvent: function(id){
		return !this.hasntEvent(id);
	},


	/**
	 * Query if an event is not already cached
	 * @param id
	 */
	hasntEvent: function(id){
		var event = this.getEvent(id);
		return _.isUndefined(event) || _.isNull(event);
	}
});

let inst = new Collection();
export default inst;

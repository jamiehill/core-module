import Marionette from 'backbone.marionette';

export default  Marionette.Object.extend({

	Checker: null,
	name: 'topic',
	wildcard: '*',
	ids: {},


	initialize: function() {
		this.name = this.options.name;
	},


	/**
	 * Adds a comma delimited list of ids to this topic
	 * @param ids
	 */
	add: function(ids, dump) {
		ids = ids.toString().split(',');
		_.each(ids, function(id) {
			id = _.trim(id);
			if (this.ids[id]) this.ids[id] ++;
			else this.ids[id] = 1;
		}, this);
		return this.get(!!dump ? null : ids);
	},


	/**
	 * Removes a comma delimited list of ids from this topic
	 * @param ids
	 */
	remove: function(ids, dump) {
		ids = ids.toString().split(',');
		_.each(ids, function(id) {
			id = _.trim(id);
			// if the id is currently stored, decrement it's value
			if (this.ids[id]) {
				this.ids[id] --;
				// if it's value is now lower than one, delete it
				if (this.ids[id] < 1) {
					delete this.ids[id];
				}
			}
		}, this);
		return this.get(!!dump ? null : ids);
	},


	/**
	 * Returns the number of ids in this topic
	 * @returns {number}
	 */
	size: function() {
		return _.size(this.ids);
	},


	/**
	 * Clear out the topic
	 */
	reset: function() {
		this.ids = {};
	},


	/**
	 * Performs the specified action on the topic
	 * @param type
	 * @param ids
	 */
	action: function(type, ids) {
		// if no ids have been provided, assume
		// that a wildcard (*) was intended
		ids = ids || this.wildcard;
		if (type == 1) return this.add(ids);
		if (type == 2) return this.remove(ids);
		return this.add(ids, true);
	},


	/**
	 * Returns the serialized version of this topic
	 * @returns {*}
	 */
	get: function(idees) {
		var ids;
		if (!idees) ids = _.keys(this.ids);
		else {
			if (_.isArray(idees)) ids = idees;
			else ids = idees.split(',');
		}
		// return empty string if no ids
		if (ids.length == 0) return "";

		// if another Topic has supremacy over this,
		// let his id subscription precede over this.
		if (this.Checker != null) {
			ids = _.difference(ids, _.keys(this.Checker.ids));
		}

		// then return the stringify topic
		return JSON.stringify({name: this.name, ids: ids.join(',')});
	},


	/**
	 * If there is, for example, an 'eventDetails' subscription registered for id 1234,
	 * we shouldn't also be sending a eventSummary subscription for the same id.  By
	 * registering a 'checker' topic here, the checker will always have supremacy over
	 * a matching id, and the inferior id will not be returned.
	 * @param topic
	 */
	check: function(topic) {
		this.Checker = topic;
	}

});

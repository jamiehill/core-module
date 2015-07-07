import Backbone from 'backbone';

export default {
	__observing: [],
	__dynamic: [],
	__listener: _.extend({}, Backbone.Events),
	observe: true,


	/**
	 * Mimics the backbone events' listenTo method
	 */
	listenTo(observable, evts, dynamic = false) {
		if (this.__observing[observable.uuid]) return;
		this.__observing[observable.uuid] = observable;

		var events = this.getEvents(observable, evts);
		if (dynamic) {
			this.__dynamic.push({observable: observable, events: events});
		}

		var isModel = observable instanceof Backbone.Model,
			that = this;

		this.__listener.listenTo(observable, events, function(evt) {
			var method = isModel ? 'onModelUpdate' : 'onCollectionUpdate';
			if (_.isFunction(that[method])) {
				that[method].call(that, observable);
			}
			if (that.isMounted()) {
				that.forceUpdate.call(that);
			}
		});
	},

	/**
	 *
	 */
	unlistenTo(observable) {
		if (!observable) return;
		// remove observable from array
		if (this.__observing[observable.uuid]) {
			delete this.__observing[observable.uuid];
		}
		// and kill the listeners
		this.__listener.stopListening(observable);
	},

	/**
	 * Utility for binding methdos
	 */
	bind(...methods) {
		_.bindAll.apply(_, [this].concat(methods));
	},

	/**
	 *
	 */
	getEvents(observable, events) {
		if (!_.isEmpty(events)) return events;
		var isModel = observable instanceof Backbone.Model;
		return isModel ? 'change' : 'add remove reset sort';
	},

	/**
	 * Listen to model/collection's and any dynamically observered objects
	 */
	componentDidMount() {
		if (!this.observe) return [];
		var that = this;
		this.getBackboneProps().forEach(function(prop) {
			that.listenTo(prop);
		});
		this.__dynamic.forEach(function(obj) {
			that.listenTo(obj.observable, obj.events);
		})
	},

	/**
	 *
	 */
	componentDidUpdate() {
		//this.componentWillUnmount();
		//this.componentDidMount();
	},

	/**
	 * Removes any listeners if previously added
	 */
	componentWillUnmount() {
		var that = this;
		this.__observing.forEach(function(observable) {
			that.unlistenTo(observable);
		});
	},


	/**
	 * Reduce all react props to just backbone models and collections
	 */
	getBackboneProps() {
		return _.reduce(this.props, function(props, prop, key) {
			if (prop instanceof Backbone.Model || prop instanceof Backbone.Collection) {
				props.push(prop);
			}
			return props;
		}, [], this);
	}
};

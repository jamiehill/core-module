import Marionette from 'backbone.marionette';
import Backbone from 'backbone';

export const BEFORE_ROUTE_CHANGE = 'router:before:routeChange';
export const ROUTE_CHANGE = 'router:routeChange';

export default Marionette.Controller.extend({

	currentRoute: '',
	appRoutes: {},
	staticRoutes: [],
	controllers: [],
	history: [],


	initialize() {
		_.bindAll(this, 'onRouteChange', 'register');
	},


	/**
	 *
	 */
	start() {
		new Marionette.AppRouter({appRoutes: this.appRoutes, controller: this});
		return this;
	},


	/**
	 * @param route
	 */
	onRouteChange: function(args){
		var args = Array.prototype.slice.call(arguments),
			fragment = Backbone.history.getFragment(),
			callback = args.pop();

		this.currentRoute = fragment;
		// don't add static routes to the history
		if (!_.contains(this.staticRoutes, fragment)) {
			this.history.push({fragment: fragment, callback: callback});
		}

		// trigger 'before' route
		App.router.trigger(BEFORE_ROUTE_CHANGE, fragment);

		// iterate through each controller, ordered by priority,
		// invoking the route handler if it exists as a function
		// on that controller.
		_.each(this.getControllers(), function(obj){
			if (_.isFunction(obj.ctrl[callback])){
				obj.ctrl[callback].apply(obj.ctrl, _.initial(args));
			}

			else if (_.contains(this.staticRoutes, fragment)) {
				if (_.isFunction(obj.ctrl.onStaticRoute)) {
					obj.ctrl.onStaticRoute.apply(obj.ctrl, [callback]);
				}
			}

			else if(_.isFunction(obj.ctrl.onNoMatch)) {
				obj.ctrl.onNoMatch.apply(obj.ctrl, [callback]);
			}



			// invoke general route handler on controller
			if (_.isFunction(obj.ctrl.onRouteChange)){
				obj.ctrl.onRouteChange.apply(obj.ctrl, [callback]);
			}
		}, this);

		App.router.trigger(ROUTE_CHANGE, fragment);
		console.log('Router: RouteChange - '+fragment.toLowerCase());

		return true;
	},


	/**
	 * @returns {Array.<T>|*}
	 */
	getControllers: function() {
		return _.sortBy(this.controllers, function(ctrl) {
			return ctrl.priority;
		}).reverse();
	},


	/**
	 * Returns the previously visited route, or home page if none exist
	 * @returns {*}
	 */
	getPrevious: function() {
		if (!this.history.length) return {fragment: ''};
		return _.last(this.history);
	},


	/**
	 *  Registers a controller with the router
	 */
	register: function(ctrl, priority) {
		this.controllers = this.controllers || [];
		this.controllers.push({ctrl: ctrl, priority: priority || 999});
	}
});

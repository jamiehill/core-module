import Deferred from '../defer/Deferred';
import Marionette from 'backbone.marionette';


export default class MarionetteConfig extends Deferred {
	constructor() {
		super('MarionetteConfig');
	}


	/**
	 *
	 */
	initialize() {
		this.addApplicationStop();
		this.addRouterMods();
		this.addHrefInterceptor();
		this.success();

	}


	/**
	 * All navigation that is relative should be passed through the navigate
	 * method, to be processed by the router. If the link has a `data-bypass`
	 * attribute, bypass the delegation completely.
	 */
	addHrefInterceptor() {
		$(document).on('click', 'a:not([data-bypass])', function(e) {
			// Get the absolute anchor href.
			var href = {
				prop: $(this).prop('href'),
				attr: $(this).attr('href')
			},
			root = location.protocol + '//' + location.host + '/' + App.Urls.root;

			// Ensure the root is part of the anchor href, meaning it's relative.
			if (href.prop && href.prop.slice(0, root.length) === root) {
				e.preventDefault();
				Backbone.history.navigate(href.attr, true);
			}
		});

		$(document).on('click', 'a[data-bypass]', function(e) {
			e.preventDefault();
		});
	}


	/**
	 * Adds stop functionality to the main application
	 */
	addApplicationStop() {
		Marionette.Application.prototype.stop = function(options) {
			this.triggerMethod('before:top', options);
			this.triggerMethod('stop', options);
		};
	}


	/**
	 * Overrides native functionality to NOT throw error when
	 * checking if a route handler exists on this controller.`
	 */
	addRouterMods() {
		Marionette.AppRouter.prototype._addAppRoute = function(controller, route, methodName) {
			var method = controller['onRouteChange'];
			this.route(route, methodName, _.bind(method, controller));
		};

		Marionette.AppRouter.prototype.route = function(route, name, callback) {
			if (!_.isRegExp(route)) route = this._routeToRegExp(route);
			if (_.isFunction(name)) {
				callback = name;
				name = '';
			}
			if (!callback) callback = this[name];
			var router = this,
				controller = this._getController();
			Backbone.history.route(route, function(fragment) {
				var args = router._extractParameters(route, fragment);
				args.push(name);

				controller['onRouteChange'].apply(this, args);

				router.trigger.apply(router, ['route:' + name].concat(args));
				router.trigger('route', name, args);
				Backbone.history.trigger('route', router, name, args);
			});
			return this;
		};
	}
}

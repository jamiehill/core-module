import DeferredQueue from './system/defer/DeferredQueue';
import {load} from './utils/SystemUtil';

export default Marionette.Module.extend({

	startWithParent: false,
	socket: null,
	api: null,

	/**
	 *
	 */
	initialize(moduleName, app, options) {
		this.moduleName = moduleName;
		this.options = options;
		this.app = app;
	},

	/**
	 * Boot up the module
	 */
	boot(modules) {
		console.log('Bootstrap - start');

		var queue, that = this;
		return new Promise(function(resolve, reject) {
			queue = new DeferredQueue(modules);
			queue.init().then(function() {
				that.start(resolve);
			});
		})
	},

	/**
	 * Start controllers
	 */
	onStart(resolve) {
		console.log('Bootstrap - Complete');
		var that = this;

		Promise.all([
			// load the controllers
			System.import('core/controller/SocketController'),
			System.import('core/controller/ApiController')

		]).then(function(mods) {

			// setup/start controllers
			that.socket = mods[0].default;
			that.socket.start();
			that.api = mods[1].default;
			that.api.start();

			App.bus.trigger('core:complete');
			resolve();
		})
	},

	/**
	 * Stop controllers
	 */
	onStop() {
		this.socket.stop();
		this.api.stop();
	}
});

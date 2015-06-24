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
		var queue, promise, that = this;

		queue = new DeferredQueue(modules),
		promise = queue.init().then(function() {
			that.start();
		});

		return promise;
	},

	/**
	 * Start controllers
	 */
	onStart() {
		console.log('Bootstrap - Complete');

		var modules = ['core/controller/SocketController','core/controller/ApiController'],
			that = this;

		load(modules).then(function(mods){
			that.socket = mods[0].default;
			that.socket.start();
			that.api = mods[1].default;
			that.api.start();
			App.bus.trigger('core:complete');
		});
	},

	/**
	 * Stop controllers
	 */
	onStop() {
		this.socket.stop();
		this.api.stop();
	}
});

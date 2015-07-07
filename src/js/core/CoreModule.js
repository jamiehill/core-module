import DeferredQueue from './system/defer/DeferredQueue';
import AppConfig from 'app/AppConfig';
import DomainResolver from 'core/system/bootstrap/DomainResolver';
import MarionetteConfig from 'core/system/bootstrap/MarionetteConfig';
import GetSportData from 'core/system/bootstrap/GetSportData';
import GetRootLadder from 'core/system/bootstrap/GetRootLadder';
import EventModel from 'core/model/domain/EventModel';

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
		modules = [
			AppConfig,
			DomainResolver,
			MarionetteConfig,
			GetRootLadder,
			GetSportData
		];

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
			System.import('core/controller/ApiController'),
			System.import('core/controller/CommandController')

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

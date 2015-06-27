import Marionette from 'backbone.marionette';
import service  from '../service/ApiService';
import {isNotLoggedIn} from '../service/HttpResponse';
import {LOGGED_IN, LOGGED_OUT, NOT_LOGGED_IN_ERROR} from '../model/SessionModel';

var Controller = Marionette.Controller.extend({
	debug: false,

	/**
	 *
	 */
	initialize: function() {
		_.bindAll(this, 'onLoggedIn', 'onLoggedOut', 'onSuccess', 'onFail');
		App.session.on(LOGGED_IN, this.onLoggedIn);
		App.session.on(LOGGED_OUT, this.onLoggedOut);
	},

	/**
	 * Start controller
	 */
	start: function() {
		var loggedIn = App.session.request('loggedIn');
		if (loggedIn) this.ping(false);
	},

	/**
	 * Shutdown
	 */
	stop: function() {
		clearInterval(this.timerId);
		this.currentDelay = 0;
	},

	/* ------- Methods -------- */

	/**
	 * Action the keep alive request, if already alive,
	 * otherwise try and establish the connection
	 */
	ping: function() {
		var that = this;
		this.timerId = _.delay(function() {

			// don't bother if not logged in
			var loggedIn = App.session.request('loggedIn');
			if (loggedIn == false) return;

			// do the request
			service.keepAlive()
				.then(that.onSuccess, that.onFail);

		}, App.Config.apiKeepAlive);
	},

	/* ------- Handlers -------- */

	/**
	 * Upgrade the public login on session start
	 */
	onLoggedIn: function() {
		if (this.timerId >  0) return;
		this.currentDelay = 0;
		this.ping();
	},

	/**
	 * Stop the keep alives
	 */
	onLoggedOut: function() {
		clearInterval(this.timerId);
		this.timerId = 0;
	},

	/**
	 * @param resp
	 */
	onSuccess: function(resp) {
		if (isNotLoggedIn(resp)) {
			this.onFail(resp);
			return;
		}
		this.log('Ok');
		this.ping();
	},

	/**
	 * @param er
	 */
	onFail: function(er) {
		this.log('Fail');
		if (isNotLoggedIn(er)) {
			App.session.trigger(NOT_LOGGED_IN_ERROR, er);
		}
		this.ping();
	},

	log: function(msg) {
		if (this.debug) {
			console.log('Api :: '+msg);
		}
	}
});

let inst = new Controller();
export default inst;

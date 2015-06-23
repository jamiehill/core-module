import HttpResponse from './HttpResponse';
import keepAlive from './ApiService';
import {LOGGED_IN, LOGGED_OUT, ERROR} from '../model/SessionModel'


export default Marionette.Controller.extend({
	keepAliveInterval: 10 * 1000,
	reconnectInterval: 12 * 1000,


	/**
	 *
	 */
	initialize: function() {
		_.bindAll(this, 'onSessionStarted', 'onSessionEnded', 'onKeepAliveSuccess', 'onKeepAliveFail');

		this.sessionModel = ctx.get('sessionModel');
		this.service = ctx.get('apiService');

		this.listenTo(App.vent, LOGGED_IN, this.onSessionStarted);
		this.listenTo(App.vent, LOGGED_OUT, this.onSessionEnded);

		// if already logged in, start keepalive
		if (this.sessionModel.isLoggedIn())
			this.onSessionStarted();
	},


	/**
	 * When a session is validated, start the keep alive request
	 */
	onSessionStarted: function() {
		console.log('KeepAlive :: Started');
		this.keepAlive();
	},


	/**
	 *
	 */
	onSessionEnded: function() {

	},


	/**
	 * Action the keep alive request
	 */
	keepAlive: function() {
		if (this.sessionModel.isNotLoggedIn()) return;
		var that = this;
		_.delay(function() {
			keepAlive().then(that.onKeepAliveSuccess, that.onKeepAliveFail);
			console.log('KeepAlive :: Ok');
		}, this.keepAliveInterval);
	},


	/**
	 * @param resp
	 */
	onKeepAliveSuccess: function(resp) {
		if (HttpResponse.isNotLoggedIn(resp)) {
			App.vent.trigger(NOT_LOGGED_IN_ERROR);
			return;
		}
		this.keepAlive();
	},


	/**
	 * @param er
	 */
	onKeepAliveFail: function(er) {
		App.vent.trigger(NOT_LOGGED_IN_ERROR);
		console.log('KeepAlive :: Fail');
	}
})

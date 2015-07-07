import Marionette from 'backbone.marionette';
import SocketService, {SOCKET_CLOSED} from '../service/SportsSocketService';
import {LOGGED_IN, LOGGED_OUT} from '../model/SessionModel';

var Controller = Marionette.Controller.extend({

	socket: new SocketService(),
	reconnectInt: App.Config.socketReconnect,
	pingInterval: App.Config.socketKeepAlive,
	currentDelay: 0,

	/**
	 *
	 */
	initialize: function() {
		_.bindAll(this, 'onLoggedIn', 'onLoggedOut', 'onClosed');
		var that = this;

		App.session.on(LOGGED_IN, this.onLoggedIn);
		App.session.on(LOGGED_OUT, this.onLoggedOut);
		App.socket.on(SOCKET_CLOSED, this.onClosed);
		// expose the socket send method on the socket channel
		App.socket.send = function(data) {
			that.socket.send(data);
		};
	},


	/**
	 * Start controller
	 */
	start: function() {
		this.ping(false);
	},

	/**
	 * Shutdown
	 */
	stop: function() {
		clearInterval(this.timerId);
		this.currentDelay = 0;
	},


	/* ------- Handlers -------- */


	/**
	 * Upgrade the public login on session start
	 */
	onLoggedIn: function() {
		this.socket.upgrade();
	},

	/**
	 * Stop the keep alives
	 */
	onLoggedOut: function() {

	},

	/**
	 * When socket connection dies, clear currentDelay and restart ping, so that the connection is re-establish
	 */
	onClosed: function() {
		this.stop();
		this.ping();
	},


	/* ------- Methods -------- */


	/**
	 * Action the keep alive request, if already alive,
	 * otherwise try and establish the connection
	 */
	ping: function() {
		var connected, delay, that = this;
		this.timerId = _.delay(function() {

			// decide the delay interval based on whether
			// we need to keepAlive or reconnect the socket
			connected = that.socket.state() == WebSocket.OPEN;
			delay = connected ? that.pingInterval : that.reconnectInt;

			// do the required task
			connected ?
				that.socket.sendKeepAlive() :
				that.socket.connect();

			// update delay and init next ping
			that.currentDelay = delay;
			that.ping();

		}, this.currentDelay);
	}
});

let inst = new Controller();
export default inst;

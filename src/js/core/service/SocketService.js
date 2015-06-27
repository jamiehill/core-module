import Radio from 'backbone.radio';

export const PUBLIC_LOGIN_REQ_ID = 0;
export const KEEP_ALIVE_REQ_ID = 1;
export const USER_LOGIN_REQ_ID = 2;

export const SOCKET_OPEN = 'socket:open';
export const SOCKET_CLOSED = 'socket:closed';
export const SOCKET_ERROR = 'socket:error';
export const PUBLIC_LOGIN_SUCCESS = 'socket:publicLoginSuccess';
export const PUBLIC_LOGIN_FAILURE = 'socket:publicLoginFailure';

export default Marionette.Controller.extend({
	initialize() {
		_.bindAll(this, 'connect', 'onOpen', 'onMessage', 'onClose', 'onError');
		this.pendingMessages = [];
		this.pending = false;
		this.socket = null;
		this.log('Start');
	},


	/**
	 * Initiate the socket
	 */
	connect: function() {
		this.log('Connecting ...');
		this.pending = false;
		this.socket  = this.ConnectSocket();
		this.socket.onopen = this.onOpen;
		this.socket.onmessage = this.onMessage;
		this.socket.onclose = this.onClose;
		this.socket.onerror = this.onError;
	},

	/**
	 * Disconnect the socket
	 */
	close() {
		//this.socket.readyState = WebSocket.CLOSING;
		this.socket.close();
	},

	/**
	 * Send a message across the socket
	 * @param data
	 */
	send(data) {
		if (_.isObject(data)) {
			data = JSON.stringify(data);
		}

		// WebSocket.OPEN
		if (this.socket.readyState == WebSocket.OPEN)
			this.socket.send(data);

		else {
			// WebSocket.CONNECTING:
			// WebSocket.CLOSING:
			// WebSocket.CLOSED:
			// socket not ready so add to pending messages
			this.pendingMessages.push(data);
		}
	},


	/**
	 * Returns the state of the socket
	 */
	state() {
		// if there's a pending keepAlive, notify the state to be CLOSED,
		// so that a reconnect is invoked rather than another keepAlive
		if (this.pending || !this.socket) {
			return WebSocket.CLOSED;
		}
		// otherwise just return it's state
		return this.socket.readyState;
	},


	/**
	 * Abstract method. Override in Subclass.
	 * @param data
	 */
	parseMessage(data) {

	},


	/**
	 * Handlers --------------------------------------------------------
	 */


	/**
	 * Handle socket onOpen events
	 */
	onOpen(event) {
		this.log('Open');
		App.socket.trigger(SOCKET_OPEN);
		this.send(this.PublicLogin());
	},


	/**
	 * handle received socket messages
	 */
	onMessage(event) {
		var data = JSON.parse(event.data);
		if (_.has(data, 'Response')) {
			var status = data.Response.status,
				lowerError = status.toLowerCase();
			if (lowerError == 'error') {
				//this.throwError('There is a problem with the WebSocket');
				return;
			}
			var reqId = data.Response.reqId;
			if (reqId == PUBLIC_LOGIN_REQ_ID) {
				App.socket.trigger(PUBLIC_LOGIN_SUCCESS);
				this.sendPendingMessages();
				return;
			}
			if (reqId == KEEP_ALIVE_REQ_ID) {
				this.pending = false;
			}
		}
		if (_.has(data, 'error')) {
			//this.throwError(data.error);
			return;
		}

		this.parseMessage(data);
	},


	/**
	 *
	 */
	onClose(event) {
		App.socket.trigger(SOCKET_CLOSED);
		//this.log('Closed');
	},

	/**
	 * Handle socket error events
	 */
	onError(err) {
		this.throwError(err);
	},


	/**
	 * Private --------------------------------------------------------
	 */

	/**
	 * @returns {WS}
	 * @constructor
	 */
	ConnectSocket: function() {
		// clean up any previous socket
		if (this.socket) {
			this.socket.close();
			delete this.socket.onopen;
			delete this.socket.onmessage;
			delete this.socket.onclose;
			delete this.socket.onerror;
		}


		// decide which type of socket we should use
		var WS = "MozWebSocket" in window ? 'MozWebSocket' : "WebSocket";

		// and return a new instance
		return new window[WS](App.Urls.wsendpoint);
	},



	/**
	 * Connecting - readyState: 0,
	 * Open       - readyState: 1,
	 * Closing    - readyState: 2,
	 * Closed     - readyState: 3
	 */
	sendKeepAlive() {
		if (this.pending) {
			this.log('KeepAlive - Failed');
			this.close();
		}
		this.pending = true;
		this.send('{KeepAlive:{reqId:' +KEEP_ALIVE_REQ_ID + '}}');
		this.log('KeepAlive');
	},


	/**
	 * Send all messages queued before socket was connected
	 */
	sendPendingMessages() {
		if (this.pendingMessages.length) {
			this.log('SendingPendingMessages');
			_.each(this.pendingMessages, this.send, this);
			this.pendingMessages = [];
		}
	},


	/**
	 * Convenience method for throwing socket errors
	 * @param message
	 */
	throwError(error) {
		//this.log('Error :: '+JSON.stringify(error));
		App.socket.trigger(SOCKET_ERROR, error);
	},


	/**
	 * @param msg
	 */
	log: function(msg) {
		//if (msg == this.lastMsg) return;
		console.log('Websocket :: '+msg);
		this.lastMsg = msg;
	},


	/**
	 * Public login
	 */
	PublicLogin() {
		return {
			PublicLoginRequest: {
				application: App.Config.appid,
				locale: App.Config.defaultChannel,
				channel: App.Config.channel,
				apiVersion: App.Config.apiVersion,
				reqId: PUBLIC_LOGIN_REQ_ID
			}
		}
	},


	/**
	 * Upgrade login
	 */
	UpgradePublicLogin() {
		var details = App.session.request('session:details', ['name', 'accountId', 'sessionToken']);
		return {
			UpgradePublicLoginRequest: {
				userName: details.name,
				accountId: details.accountId,
				apiSessionToken: details.sessionToken,
				reqId: USER_LOGIN_REQ_ID
			}
		}
	}
});

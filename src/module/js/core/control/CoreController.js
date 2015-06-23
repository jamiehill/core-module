import Marionette from 'backbone.marionette';

export default Marionette.Controller.extend({

});


define(function (require) {
	var Marionette = require('marionette');

	return Marionette.Controller.extend({

		dependencies: 'session=sessionModel, cookieName, commands, vent, streamingService',

		placeBetsAfterLogin:false,
		timerRunning : false,
		eventTimerInterval: 1000,
		eventTimerCount: 0,

		//For WebSocket Streaming
		keepAliveInterval: 10,

		//For Api Server
		keepAliveApiInterval: 20,
		keepAliveApiTimerCount: 0,
		keepAliveApiStarted: false,


		ready: function(options){
			_.bindAll(this, 'onLoginSuccess', 'onLogout', 'onValidationFailure', 'onValidationSuccess',
				'onPostStartup', 'onWSPublicLoginComplete','onTimerTick');
			this.vent.bind('application:complete', this.onPostStartup);
			this.vent.bind('streaming:publicLoginComplete', this.onWSPublicLoginComplete);
			this.vent.bind('session:loggedin', this.onLoginSuccess);
			this.vent.bind('session:loggedout', this.onLogout);
			this.listenTo(this.vent, 'streaming:error', this.onWSStreamingError);
			this.onPostStartup();
		},


		//FIXME Must be a better way of client config in vanilla code?
		onPostStartup: function() {
			if ( App.config.client != 'pokerstars' ) {
				var cookieFound = this.checkForCookie();
				if (!cookieFound) {
					this.vent.trigger('session:publicLogin');
				}
			}
			else {
				this.vent.trigger('session:publicLogin');
			}
		},

		onWSPublicLoginComplete: function() {
			this.startTimer();
		},

		checkForCookie: function() {
			var loginData = $.cookie(this.cookieName);
			if (loginData) {
				this.session.storeSessionFromCookie(loginData);
				this.validateExistingSessionToken();
				return true;
			}
			return false;
		},

		deleteCookie: function() {
			if (App.config.client != 'pokerstars') {
				$.removeCookie(this.cookieName);
			}
		},

		addCookie: function() {
			if (App.config.client != 'pokerstars') {
				var currentSession = this.session.getSession();
				$.cookie(this.cookieName, currentSession);
			}
		},

		validateExistingSessionToken: function() {
			this.commands.execute('command:getbalance')
				.done(this.onValidationSuccess)
				.fail(this.onValidationFailure);
		},

		onValidationSuccess: function(data, textStatus, jqXHR) {
			this.vent.trigger('session:loggedin');
		},

		onValidationFailure: function(data, textStatus, jqXHR) {
			this.keepAliveApiStarted = false;
			this.deleteCookie();
			this.session.clearSession();
		},

		onLoginSuccess: function(event) {
			if (!this.timerRunning){
				this.startTimer();
			}
			this.keepAliveApiStarted = true;
			this.addCookie();
			this.loginUserToStreaming();
		},


		placeBetsAfterLoginSuccess: function() {
			this.trigger("onAutoBetPlacementSuccess");
		},

		onLogout: function() {
			this.keepAliveApiStarted = false;
			this.deleteCookie();
			this.stopTimer();
		},

		onWSStreamingError: function(){
			this.vent.trigger('popup:message', {
				content : 'Connectivity :: Error'
			});
		},

		startTimer: function() {
			this.vent.trigger('app:log', 'Starting timer');
			if (!this.timerRunning) {
				this.interval = window.setInterval(this.onTimerTick, this.eventTimerInterval, this);
				this.timerRunning = true;
			}
		},

		stopTimer: function() {
			clearInterval(this.interval);
			this.timerRunning = false;
		},

		onTimerTick: function(scope) {
			this.eventTimerCount++;

			if (this.eventTimerCount == this.keepAliveInterval) {
				this.keepAliveStreaming();
				this.eventTimerCount = 0;
			}

			//Only keep Alive API when user logged in.
			if (this.keepAliveApiStarted) {
				this.keepAliveApiTimerCount++;
				if (this.keepAliveApiTimerCount == this.keepAliveApiInterval) {
					this.keepAliveApi();
					this.keepAliveApiTimerCount = 0;
				}
			}

			this.triggerTimerEvent();
		},

		//Global Timer Event for Scoreboard timers etc etc.
		triggerTimerEvent: function() {
			this.vent.trigger('app:timer');
		},

		keepAliveApi: function() {
			var sessionToken = this.session.getSessionToken();
			this.commands.execute('command:keepAliveApiCommand', sessionToken);
		},

		keepAliveStreaming: function() {
			this.streamingService.keepAlive();
		},


		loginUserToStreaming: function() {
			this.streamingService.loginUser();
		}

	});
});



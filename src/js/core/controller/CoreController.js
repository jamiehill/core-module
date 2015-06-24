import Marionette from 'backbone.marionette';
import socket from 'SocketController';
import api from 'ApiController';

export default Marionette.Controller.extend({

	/**
	 * Start controllers
	 */
	start: function() {
		socket.start();
		api.start();
	},

	/**
	 * Stop controllers
	 */
	stop: function() {
		socket.stop();
		api.stop();
	}
});

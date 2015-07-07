import Marionette from 'backbone.marionette';
import {isClass} from 'core/utils/AppUtil';

var Controller = Marionette.Controller.extend({
	replies: {

		'subscribe:events': 'core/command/Subscription',
		'subscribe:eventView': 'core/command/Subscription',
		'subscribe:eventSummaryAndSchedule': 'core/command/Subscription',
		'subscribe:eventDetails': 'core/command/Subscription',
		'subscribe:markets': 'core/command/Subscription',
		'subscribe:schedule': 'core/command/Subscription',
		'subscribe:cashout': 'core/command/Subscription',

		'add:events': 'core/command/SubscriptionAdd',
		'add:eventView': 'core/command/SubscriptionAdd',
		'add:eventSummaryAndSchedule': 'core/command/SubscriptionAdd',
		'add:eventDetails': 'core/command/SubscriptionAdd',
		'add:markets': 'core/command/SubscriptionAdd',
		'add:schedule': 'core/command/SubscriptionAdd',
		'add:cashout': 'core/command/SubscriptionAdd',

		'remove:events': 'core/command/SubscriptionRemove',
		'remove:eventView': 'core/command/SubscriptionRemove',
		'remove:eventSummaryAndSchedule': 'core/command/SubscriptionRemove',
		'remove:eventDetails': 'core/command/SubscriptionRemove',
		'remove:markets': 'core/command/SubscriptionRemove',
		'remove:schedule': 'core/command/SubscriptionRemove',
		'remove:cashout': 'core/command/SubscriptionRemove'
	},

	/**
	 * Initialize all command triggers
	 */
	initialize: function() {
		var that = this;
		// iterate through all replies, adding each as a channel reply
		_.each(this.replies, function(command, trigger) {
			// create the proxied reply function
			var func = _.wrap(this, function(sc) {
				var args = Array.prototype.slice.call(arguments);
				// remove first argument as is a Backbone.Radio one
				args.shift();
				return new Promise(function(resolve, reject) {
					// load the command then execute it
					System.import(command).then(function(c) {
						// if the command returns a promise
						// wait for it to resolve or reject
						var params = [trigger].concat([args]);
						var promise = c.execute.apply(c.execute, params);
						if (promise) {
							promise.done(function(){
								that.success(trigger, resolve);
							}).fail(function(){
								that.fail(reject);
							});
						}
						// otherwise just
						else that.success(trigger, resolve);
					});
				});
			});
			// add the reply to the channel
			App.bus.reply(trigger, func);

		}, this);
	},


	/**
	 * Handle success
	 * @param callback
	 */
	success: function(trigger, callback) {
		console.log('Command: '+trigger+':success');
		callback();
	},


	/**
	 * Handle failure
	 * @param callback
	 */
	fail: function(callback) {
		callback();
	}
});

let inst = new Controller();
export default inst;

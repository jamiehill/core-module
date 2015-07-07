import Topic from './Topic';
import Marionette from 'backbone.marionette';
import {PUBLIC_LOGIN_SUCCESS} from '../../service/SocketService';

var Controller = Marionette.Controller.extend({

	currentRoute: '',
	previousSubs: [],
	topics: {
		EventDetails:   new Topic({name: 'eventDetails'}),
		EventSummary:   new Topic({name: 'eventSummaries'}),
		MarketTypes:    new Topic({name: 'marketTypes', wildcard: ''}),
		Schedule:       new Topic({name: 'schedule'}),
		Cashout:        new Topic({name: 'cashout'})
	},


	/**
	 * Bind all public methods to this scope
	 */
	initialize: function(){
		_.bindAll(this, 'add', 'remove', 'send', 'resend', 'clear', 'reset', 'func', 'sendUpdate');

		App.socket.on(PUBLIC_LOGIN_SUCCESS, this.resend);
		App.router.on('router:before:routeChange', this.reset);

		this.topics.EventSummary.check(this.topics.EventDetails);
	},


	//------------------------------------------------------
	// Subscription methods
	//------------------------------------------------------


	/**
	 * Specific subscription for EventView, er, views.
	 */
	subscribeToEventView: function(type, sport, eventIds, marketTypes) {
		if (_.isEmpty(eventIds)) return;
		this.func(type)([
			this.topics.EventSummary.action(type, eventIds),
			this.topics.MarketTypes.action(type, marketTypes),
			this.topics.Schedule.action(type, sport)
		]);
	},


	/**
	 * @param sports
	 * @param eventIds
	 * @param marketTypes
	 */
	subscribeToMarketsAndSchedule: function(type, sports, eventIds, marketTypes) {
		if (_.isEmpty(eventIds) || _.isempty(marketTypes)) return;
		this.func(type)([
			this.topics.EventSummary.action(type, eventIds),
			this.topics.MarketTypes.action(type, marketTypes),
			this.topics.Schedule.action(type, sport)
		]);
	},


	/**
	 * @param sports
	 * @param eventIds
	 */
	subscribeToEventsAndSchedule: function(type, sports, eventIds) {
		if (_.isEmpty(eventIds)) return;
		this.func(type)([
			this.topics.EventSummary.action(type, eventIds),
			this.topics.Schedule.action(type, sport)
		]);
	},


	/**
	 * @param eventIds
	 */
	subscribeToEventDetails: function(type, eventIds) {
		if (_.isEmpty(eventIds)) return;
		this.func(type)([
			this.topics.EventDetails.action(type, eventIds)
		]);
	},


	/**
	 * @param eventIds
	 */
	subscribeToEventSummaryAndSchedule: function(type, sports, eventIds) {
		if (_.isEmpty(eventIds)) return;
		this.func(type)([
			this.topics.EventSummary.action(type, eventIds),
			this.topics.Schedule.action(type, sports)
		]);
	},


	/**
	 * @param sports
	 */
	subscribeToSchedule: function(type, sports) {
		if (_.isEmpty(sports)) return;
		this.func(type)([
			this.topics.Schedule.action(type, sports)
		]);
	},


	/**
	 * @param betids
	 */
	subscribeToCashout: function(type, betIds) {
		if (_.isEmpty(betIds)) return;
		this.func(type)([
			this.topics.Cashout.action(type, betIds)
		]);
	},


	//------------------------------------------------------
	// Internal
	//------------------------------------------------------


	/**
	 * Adds a subscription topic/s
	 */
	add: function(s) {
		this.sendUpdate(s, 'toAdd');
	},


	/**
	 * Removes subscription topics
	 */
	remove: function(s) {
		this.sendUpdate(s, 'toRemove');
	},


	/**
	 * Sends the subscription request to the socket
	 */
	send: function(s) {
		this.sendUpdate(s);
	},


	/**
	 * Resends the previous subscription request
	 */
	resend: function() {
		this.sendUpdate(null, null, 'ResendSubscriptions');
	},


	/**
	 * Clears all current subscriptions
	 */
	clear: function() {
		var s = this.removeAllTopics();
		this.sendUpdate(s, 'toRemove', 'ClearSubcriptions');
	},


	/**
	 * Resets all topics, removing all ids from each.
	 */
	reset: function() {
		var topics = _.values(this.topics);
		_.each(topics, function(t) {
			t.reset();
		});
		this.previousSubs = [];
	},


	/**
	 * Sends a subscription update - either 'toAdd' or 'toRemove'
	 * @param data
	 * @param type
	 */
	sendUpdate: function(subs, type, log) {
		subs = subs || this.previousSubs;
		type = type || 'subscriptions';
		log  = log  || 'UpdateSubcriptions';

		var data = this.serializeSubs(subs, type);
		if (data) {
			console.log('Socket: '+log+': '+data);
			App.socket.send(data);
		}
	},


	/**
	 * Serializes the subscription instances, ensuring there are no duplicates
	 * @returns {*}
	 */
	serializeSubs: function(subs, type) {
		if (subs.length == 0) return;
		var subs = _.map(_.values(subs), function(s){
			return JSON.parse(s);
		});

		// sort the subs by name
		_.sortBy(subs, function(sub) {
			return sub.name;
		});

		var sub = this.Subscription(type, subs, true);
		if (JSON.stringify(sub) !== JSON.stringify(this.previousSub)) {
			this.previousSub = sub;
			return sub;
		}
	},


	/**
	 * @returns {*[]}
	 */
	removeAllTopics: function() {
		var topics = _.values(this.topics);
		this.func(2)(_.map(topics, function(t) {
			t.action.apply(t, 2);
		}));
	},


	/**
	 * Resolves which subscription function should be used
	 * @param type
	 * @returns {string}
	 */
	func: function(type) {
		//console.log('Type: '+type);
		if (type == 1) return this.add;
		if (type == 2) return this.remove;
		return this.send;
	},


	Subscription: function(type, subs, snapshot) {
		var obj = { UpdateSubcriptions: {}};
		if (type == 'toAdd') {
			obj.UpdateSubcriptions.snapshotResponse = snapshot || false;
		}
		obj.UpdateSubcriptions[type] = subs;
		return JSON.stringify(obj);
	}

});

let inst = new Controller();
export default inst;

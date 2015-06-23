import Incidents from './Incidents';
import TennisIncidents from './TennisIncidents';
import EventDataSync from './EventDataSync';
import {
	EVENT_TRADING_STATE,
	INCIDENTS,
	EVENT,
	DATA_SYNC,
	SUBSCRIBE_RESPONSE,
	SCHEDULE_AMENDMENT,
	ACCOUNT_BALANCE_UPDATE,
	BET_UPDATE,
	CALCULATE_CASHOUT,
} from '../../service/SportsSocketService';


export default Marionette.Controller.extend({
	initialize() {
		this.service = ctx.get('sportsSocketService');
		this.cache = ctx.get('eventCache');
		this.listenTo(this.service, EVENT_TRADING_STATE, this.onEventTradingStateChange);
		this.listenTo(this.service, INCIDENTS, this.onIncidentsChange);
		this.listenTo(this.service, EVENT, this.onEventChange);
		this.listenTo(this.service, SUBSCRIBE_RESPONSE, this.onSubscribeResponse);
		this.listenTo(this.service, SCHEDULE_AMENDMENT, this.onScheduleAmendmentChange);
		this.listenTo(this.service, DATA_SYNC, this.onEventDataSync);
	},

	/**
	 * @param data
	 */
	onEventDataSync: function(data) {
		var eventDataSync;

		var event = this.cache.getEvent(data.id);
		if (event == null) return;

		if (!event.has('eventDataSync'))
			event.set({eventDataSync: new EventDataSync()});

		eventDataSync = event.get('eventDataSync');
		eventDataSync.parse(data);

		if (event) {
			event.set("numMarkets", data.numMarkets);
			App.vent.trigger('event:numMarkets:change',event);
		}
	},

	/**
	 * @param event
	 */
	//onLoginSuccess: function(event) {
	//	this.commands.execute('command:getPriceAdjustment');
	//},


	/**
	 * @param eventScheduleModel
	 */
	//onInplayScheduleChange: function(eventScheduleModel) {
	//	if (_.has(eventScheduleModel.attributes, 'inplay')) {
	//		for (var i = 0; i < eventScheduleModel.attributes.inplay.length; i++) {
	//			var eventObj = eventScheduleModel.attributes.inplay[i];
	//			if (!this.hasIncidentsForEvent(eventObj.id)) {
	//				this.updateIncidentScoreFromEvent(eventObj);
	//			}
	//		}
	//	}
	//},


	/**
	 * Adds newly inplay events from the ScheduleAdapter to the incident mechanism.
	 * Only currently required/enabled for Pokerstars
	 * @param evts
	 */
	//onScheduleAddInplay: function(evts) {
	//	_.each(evts, function(e) {
	//		if (!this.hasIncidentsForEvent(e.id)) {
	//			this.updateIncidentScoreFromEvent(e);
	//		}
	//	}, this);
	//},


	/**
	 * Set the score from the schedule API.
	 * @param event
	 */
	//updateIncidentScoreFromEvent: function(event) {
	//	var incidentModel = this.getIncidentsForEvent(event.id, event.attributes.code);
	//	var score = event.getInplayScore();
	//	incidentModel.setGoalScore(score);
	//	var participantA = event.getParticipantA();
	//	var participantB = event.getParticipantB();
	//	incidentModel.setParticipants(participantA,participantB);
	//},


	/**
	 * Websocket push messages
	 * @param data
	 */
	onEventTradingStateChange: function(data) {
		if (_.has(data, 'prices')) {
			this.parseEventTradingState(data);
		}
	},


	/**
	 * Websocket push messages
	 * @param data
	 */
	onIncidentsChange: function(data) {
		var incidents = data["new"].incident;
		var eventId = data.id;
		this.parseIncidents(eventId,incidents);
	},

	/**
	 * Websocket push messages
	 * @param data
	 */
	onEventChange: function(data) {
		if (_.has(data, 'id')) {
			var markets = data.market;
			_.each(markets, function(m) {
				console.log("MarketAdded :: "+ m.name);
			});
			var event = this.cache.getEvent(data.id);
			if (event) {
				this.listenToOnce(event,"change", this.onEventPropertyChange);
				event.populate(data);

				if (!!event.attributes.hasNewMarkets) {
					this.onEventMarketsChange(event);
				}
			}
		}
	},


	/**
	 * @param event
	 */
	onEventPropertyChange: function(event) {
		var eventChangeObj = {};
		eventChangeObj.id = event.attributes.id;
		eventChangeObj.changed = event.changed;

		App.vent.trigger('event:propertyChange', eventChangeObj);
	},


	/**
	 * @param event
	 */
	onEventMarketsChange: function(event) {
		var eventChangeObj = {};
		eventChangeObj.id = event.attributes.id;
		eventChangeObj.changed = event.changed;

		App.vent.trigger('event:marketChange', eventChangeObj);
	},


	/**
	 * @param data
	 */
	onSubscribeResponse: function(data) {
		var match = data.match || data.matches || [];
		for (var i=0; i< match.length; i++) {
			var matchObj = match[i];
			if (_.has(matchObj, 'matchDetails')) {
				this.parseMatchDetails(matchObj.matchDetails);
			}
			if (_.has(matchObj, 'incidents')) {
				var incidents = matchObj.incidents["new"];
				var eventId = matchObj.incidents.id;
				if (incidents && eventId) {
					if (_.has(matchObj, 'matchDetails')) {
						var sportCode = matchObj.matchDetails.sportcode;
						var incidentModel = this.getIncidentsForEvent(eventId,sportCode);
						if (_.has(matchObj.matchDetails),'attribute') {
							incidentModel.populateInplayAttributes(matchObj.matchDetails);
						}
					}
					this.parseIncidents(eventId, incidents.incident);
					var inplayState = null;
					if (_.has(matchObj.incidents,'inplayState')) {
						inplayState = matchObj.incidents.inplayState;
						//matchTimeInSecs
						//period
					}
				}
			}
			if (_.has(matchObj, 'eventTradingState')) {
				var eventTradingState = matchObj.eventTradingState;
				if (eventTradingState) {
					this.parseEventTradingState(eventTradingState);
				}
			}
		}
	},


	/**
	 * @param eventTradingState
	 */
	parseEventTradingState: function(update) {
		var event = this.cache.getEvent(update.id);
		if (event) {
			event.update(update);
		}
	},


	/**
	 * @param eventTradingState
	 */

	/**
	 * @param eventId
	 * @param incidents
	 */
	parseIncidents: function(eventId, incidents) {
		var incidentModel = this.getIncidentsForEvent(eventId);
		if (_.isNull(incidentModel) || _.isUndefined(incidentModel)) {
			return;
		}

		var incidentPropertyChanged = false;
		incidentModel.setPropertyChanged(false);
		this.listenTo(incidentModel,"change:type", this.onIncidentTypeChange);
		this.listenTo(incidentModel,"onGoalScoreChange", this.onIncidentGoalScore);

		for (var i=0; i< incidents.length; i++) {
			incidentModel.populate(incidents[i]);
			if (incidentModel.getPropertyChanged()) {
				incidentPropertyChanged = true;
			}
		}

		if (incidentPropertyChanged) {
			App.vent.trigger('incidents:change', incidentModel);
		}
	},


	onIncidentGoalScore: function(incidentModel) {
		//Sync the Event.js inplayAttributes with the new value.
		var event = this.cache.getEvent(incidentModel.attributes.eventId);
		if (event) {
			event.setInplayScore(incidentModel.getGoalScore());
		}
	},

	onIncidentTypeChange: function(incidentModel) {
		if (this.isIncidentTypeTimerRelated(incidentModel.attributes.type)) {
			App.vent.trigger('incidents:timerChange', incidentModel);
		}

		if(incidentModel.attributes.type == 'PeriodStart')
			App.vent.trigger('incidents:periodStart', incidentModel);
	},

	isIncidentTypeTimerRelated: function(type) {
		if (type == 'ClockChange' || type == 'PeriodStart' || type == 'Finished') {
			return true;
		}
		return false;
	},

	hasIncidentsForEvent: function(eventId) {
		return _.has(this.incidentEventXref, eventId);
	},


	createIncidentModel: function(eventId, sportCode) {
		var lowerSportCode = sportCode.toLowerCase();
		var incidentModel;

		switch(lowerSportCode) {
			case 'soccer':
				incidentModel = new Incidents(eventId);
				//TEMP fix for new Incidents not creating new object in memory?
				incidentModel.resetDefaults();
				break;
			case 'tennis':
				incidentModel = new TennisIncidents(eventId);
				incidentModel.resetDefaults();
				break;
			default:
				incidentModel = new Incidents(eventId);
				break;
		}
		this.incidentEventXref[eventId] = incidentModel;
		return incidentModel;
	},

	getIncidentsForEvent: function(eventId, optionalSportCode) {
		if (this.hasIncidentsForEvent(eventId)) {
			return this.incidentEventXref[eventId];
		}

		var event = this.cache.getEvent(eventId);
		var incidentModel;

		if (event) {
			incidentModel = this.createIncidentModel(eventId,event.attributes.code);
			var scoreFromSchedule = event.getInplayScore();
			//FIXME CHANGE setGoalScore to generic method implemented by all models.
			incidentModel.setGoalScore(scoreFromSchedule);
		}
		else {
			if ( !_.isUndefined(optionalSportCode) && !_.isNull(optionalSportCode)) {
				incidentModel = this.createIncidentModel(eventId,optionalSportCode);
			}
		}

		this.incidentEventXref[eventId] = incidentModel;
		return this.incidentEventXref[eventId];
	},


	parseMatchDetails: function(matchDetails) {
		//if (_.has(matchDetails, 'participants')) {
		//    var eventId = matchDetails.matchId;
		//    var participantArray = matchDetails.participants.participant;
		//    var event = this.cache.getEvent(eventId);
		//    if (event) {
		//        event.setParticipants(participantArray);
		//    }
		//}
	},

	onScheduleAmendmentChange: function(data) {
		var scope = this;
		if (data) {
			var schedule = data.sport;
			var sportCode = data.sport.code;

			if (_.isArray(schedule.noLongerPrematch)) {
				for (var i = 0; i < schedule.noLongerPrematch.length; i++) {
					var eventId = schedule.noLongerPrematch[i];
					scope.eventScheduleModel.removeEventFromPrematchById(eventId);
					var frontPageSchedule = scope.frontPageModel.getSchedule(sportCode);
					frontPageSchedule.removeEventFromPrematchById(eventId);
				}
			}
			if (_.isArray(schedule.noLongerInplay)) {
				for (var i = 0; i < schedule.noLongerInplay.length; i++) {
					var eventId = schedule.noLongerInplay[i];
					scope.eventScheduleModel.removeEventFromInplayById(eventId);
					var frontPageSchedule = scope.frontPageModel.getSchedule(sportCode);
					frontPageSchedule.removeEventFromInplayById(eventId);
				}
			}
			if (_.isArray(schedule.newInplay.event)) {
				_.each(schedule.newInplay.event, function(eventObj){
					scope.eventScheduleModel.addEventToInplay(eventObj);
					var frontPageSchedule = scope.frontPageModel.getSchedule(sportCode);
					frontPageSchedule.addEventToInplay(eventObj);
				});
			}
			if (_.isArray(schedule.newPrematch.event)) {
				_.each(schedule.newPrematch.event, function(eventObj){
					scope.eventScheduleModel.addEventToPrematch(eventObj);
					var frontPageSchedule = scope.frontPageModel.getSchedule(sportCode);
					frontPageSchedule.addEventToPrematch(eventObj);
				});
			}

			this.eventScheduleModel.updateComplete();
			this.frontPageModel.updateComplete();
		}
	}
});

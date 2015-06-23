import Event from './Event';
import eventModel from './domain/EventModel';


var Model = Backbone.Model.extend({

	defaults: {
		eventDetails:null
	},

	setEventDetails: function(event) {
		//Always trigger a Backbone Change event
		if (event.attributes.inplay == true) {
			if (!eventModel.hasIncidentsForEvent(event.id)) {
				eventModel.updateIncidentScoreFromEvent(event);
			}
		}
		this.set('eventDetails',null,{"silent":true});
		this.set('eventDetails',event);
	},

	getEventDetails: function() {
		return this.get('eventDetails');
	},

	getNumberOfMarkets: function() {
		var event = this.get('eventDetails');
		if (event) {
			return event.attributes.numMarkets;
		}
		else {
			return 0;
		}
	},

	getMarkets: function() {
		var event = this.get('eventDetails');
		return (event) ? event.Markets : null;
	},

	getDisplayedMarkets: function() {
		var event = this.get('eventDetails');
		return (event) ? event.Markets.byDisplayed() : null;
	}

});


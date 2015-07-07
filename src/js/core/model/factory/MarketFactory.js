import MarketsCollection from 'core/collection/MarketsCollection';
import dataModel from 'core/model/SportDataModel';
import service from '../../service/ApiService';
import cache from 'core/model/EventCache';

// default Model params
let Model = {sport: 'soccer', sortType: 'date', event: null, state: 'SUSPENDED'};

var Factory = Marionette.Controller.extend({

	marketGroups: ['AHCP', 'HCMR', 'OUHG,OUH1', 'OUAG,OUA1', 'OU2H,OUH2',
		'OU2A,OUA2', 'OVUN', 'BATS', 'BAPS', 'HCH1', 'HCH2',
		'IHTI', 'IHTG', 'IHEH', 'IHGS', 'IHGT', 'IHTT', 'IHTS',
		'VO1S', 'VO1T', 'VOHA',
		'HBGS', 'HBH2W',
		'RUPS', 'RUTO', 'RU1P',
		'RLPS', 'RLTO', 'RL1P'
	],
	collection: null,
	model: null,


	/**
	 * @param options
	 */
	initialize: function () {
		this.collection = new MarketsCollection();
		this.model = new Backbone.Model(Model);
	},


	/**
	 * @param eventId
	 */
	fetch: function (eventId) {
		var that = this;
		service.getEvent(eventId)
			.done(function (resp) {
				that.parseEvent(resp.Event);
			});
	},


	/**
	 * @param evt
	 */
	parseEvent: function (evt) {
		var event = cache.updateEvent(evt),
			markets = event.Markets.byDisplayed();

		this.model.set({event: event});
		this.model.set({name: event.get('name')});
		this.model.set({inplay: event.get('inplay')});

		this.collection.reset(markets.models);
	}
});

export default new Factory();


import Market from './Market';
import MarketsCollection from '../collection/MarketsCollection';
import Backbone from 'backbone';

export default Backbone.Model.extend({

	Markets:null,
	defaults: {
		id : 0,
		path:'',
		code:'', //SOCCER
		compId : 0,
		compName:'',
		compWeighting: -1,
		name : "",
		state : "ACTIVE",
		displayed : true,
		offeredInplay : false,
		formattedEventTime:'',
		eventTime : 0,
		numMarkets : 0,
		inplay: false,
		watchAndBetId: "",//data
		watchAndBetId2: "", //video
		streamingVideoUrl:"",
		betradarId:null,
		hasNewMarkets: false,

		score:'0-0',
		period:'',
		clock:'',
		participantA:'',
		participantB:'',
		bestOf: null,

		eventDataSync: null,
		cashoutAvailable:false,
		scorecastAvailable:false,
		timecastAvailable:false,
		wincastAvailable:false,
		isOutRight:false

	},


	parse: function(data){
		data.id = String(data.id);

		// we sometimes get a collection of markets, incorrectly named
		// 'market'.  to rectify this, we will simply rename it.
		if (_.has(data, 'market')) {
			data.markets = data.market;
			delete data.market;
		}

		if (_.has(data, 'markets')) {
			this.parseMarkets(data.markets, this.id);
			delete data.markets;
		}

		if (_.has(data, 'sport') && !_.has(data, 'code')) {
			data.code = data.sport;
		}

		if (_.has(data, 'compWeighting') && parseInt(data.compWeighting) == -1) {
			data.compWeighting = 99999;
		}

		if (data.state == 'S') data.state = 'SUSPENDED';
		if (data.state == 'A') data.state = 'ACTIVE';
		if (data.state == 'V') data.state = 'VOID';

		if (_.has(data, 'attributes')) {
			// add all attributes into main data
			_.each(data.attributes.attrib, function(obj) {
				if (obj.key == 'clock' || obj.key == 'period' || obj.key == 'score') {
					data.offeredInplay = true;
					data.inplay = true;
				}
				data[obj.key] = obj.val;
			});
			delete data.attributes;
		}

		if (_.has(data, 'participants')) {
			_.each(data.participants.participant, function(participant){
				if (participant.type == 'HOME') {
					data.participantA = participant.name;
				}
				if (participant.type == 'AWAY') {
					data.participantB = participant.name;
				}
			});
		}
		return data;
	},


	/**
	 * Updates the event from the web socket updates
	 * @param data
	 */
	update: function(data) {
		var that = this;
		data = this.parse(data);

		if (_.has(data, 'prices')) {
			var marketsArray = data.prices.market;
			_.each(marketsArray, function(marketObj){

				var market = that.Markets.get(marketObj.id);
				if (_.has(marketObj, 'channel')) {
					if (marketObj.channel.length >0) {
						marketObj.selection = marketObj.channel[0].selection;
					}
					else {
						if (_.has(marketObj, 'line')) {
							var line = marketObj.line;
							if (!_.isUndefined(market)) {
								if (market.attributes.line != line) {
									//EventTradingState Line Change. Update the selections.
									market.updateSelectionsWithLine(line);
								}
							}
						}
						else if (_.has(marketObj, 'subType')) {
							var subType = marketObj.subType;
							if (!_.isUndefined(market)) {
								if (market.attributes.subType != subType) {
									market.updateSelectionsWithLine(subType);
								}
							}
						}
					}
				}

				if (!_.isUndefined(market)) {
					that.listenToOnce(market,"change", that.onMarketPropertyChange);
					market.populate(marketObj,false);
				}
			});
		}
	},

	/**
	 * @param market
	 */
	onMarketPropertyChange: function(market) {
		App.vent.trigger('market:propertyChange', {
			eventId: market.attributes.eventId,
			changed: market.changed,
			id: market.id
		});
	},


	/**
	 * @param mkts
	 * @param eventId
	 * @returns {boolean}
	 */
	parseMarkets: function(mkts, eventId){
		if (_.isNull(this.Markets))
			this.Markets = new MarketsCollection();

		var that = this, changed = false;
		_.each(mkts, function(m) {
			// ensure parent ids are set
			_.defaults(m, {eventId: eventId, parent: that});

			// if market doesn't already exist, create with the new market data
			if (that.Markets.get(m.id) == null) {
				that.Markets.add(new Market(m, {parse: true}));
				changed = true;
				return;
			}

			// otherwise update the existing market
			that.Markets.get(m.id).populate(m);
		});
		return changed;
	},

	/**
	 * @param type
	 * @returns {*}
	 */
	findMarketByType: function(type, mostBalanced) {
		if (!!mostBalanced) {
			// if most balanced, get all markets that match the type
			var markets = this.Markets.byType(type);

			// if only one found, return that market
			if (markets.length == 1) return markets.at(0);

			// if more than one found, attempt to select the mostBalanced
			if (markets.length > 1) {
				var mostBalanced = markets.findWhere({mostBalanced: true});
				if (mostBalanced) return mostBalanced;
			}
		}

		// otherwise just find the first market that matches
		return this.Markets.findWhere({type: type});
	},


	/**
	 * @param type
	 * @returns {*}
	 */
	findMarketsByTypes: function(types, mostBalanced) {
		if (!!mostBalanced) {
			// if most balanced, get all markets that match the type
			var markets = this.Markets.byTypes(types);

			// if only one found, return that market
			if (markets.length == 1) return markets.at(0);

			// if more than one found, attempt to select the mostBalanced
			if (markets.length > 1) {
				var groups = _.groupBy(markets.models, function(market) {
					return market.get('type');
				});

				return _.reduce(groups, function(memo, group) {
					var mostBalanced = _.find(group, function(market) {
						return market.get('mostBalanced') == true;
					});

					// if most balanced found just push that
					if (mostBalanced) {
						memo.push(mostBalanced);
					}
					// push all markets from the group into memo
					else {
						Array.prototype.push.apply(memo, group);
					}
					return memo;
				}, [], this);
			}
		}

		// otherwise just find the first market that matches
		return this.Markets.byTypes(types).models;
	},

	/**
	 * @param selectionId
	 * @returns {*}
	 */
	findSelection: function(selectionId){
		var selection;
		_.find(this.Markets.models, function(market) {
			var s = market.Selections.get(selectionId);
			if (!_.isUndefined(s)) {
				selection = s;
			}
		});
		return selection;
	}
});

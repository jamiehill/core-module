import dataModel from '../model/SportDataModel';
import Market from '../model/Market';
import Selection from '../model/Selection';

var Markets = Backbone.Collection.extend({

	model: Market,
	marketGroups: [['AHCP'], ['HCMR'], ['OUHG'], ['OUH1'], ['OUAG'], ['OUA1'],
		['OU2H'], ['OUH2'], ['OU2A'], ['OUA2'], ['OVUN'], ['BATS'], ['BAPS'], ['HCH1'], ['HCH2'],
		['IHTI'], ['IHTG'], ['IHEH'], ['IHGS'], ['IHGT'], ['IHTT'], ['IHTS'],
		['VO1S'], ['VO1T'], ['VOHA'],
		['HBGS'], ['HBH2W'],
		['RUPS'], ['RUTO'], ['RU1P'],
		['RLPS'], ['RLTO'], ['RL1P'],
		['TGOU']
	],

	newMarketGroups: [
		{ type: 'AHCP' }, { type: 'HCMR' }, { type: 'OUHG' }, { type: 'OUH1' }, { type: 'OUAG' }, { type: 'OUA1' },
		{ type: 'OU2H' }, { type: 'OUH2' }, { type: 'OU2A' }, { type: 'OUA2' }, { type: 'OVUN' }, { type: 'BATS' }, { type: 'BAPS' }, { type: 'HCH1' }, { type: 'HCH2' },
		{ type: 'IHTI' }, { type: 'IHTG' }, { type: 'IHEH' }, { type: 'IHGS' }, { type: 'IHGT' }, { type: 'IHTT' }, { type: 'IHTS' },
		{ type: 'VO1S' }, { type: 'VO1T' }, { type: 'VOHA' },
		{ type: 'HBGS' }, { type: 'HBH2W' },
		{ type: 'RUPS' }, { type: 'RUTO' }, { type: 'RU1P' },
		{ type: 'RLPS' }, { type: 'RLTO' }, { type: 'RL1P' },
		{ type: 'TGOU', subtype: '1#'},
		{ type: 'TGOU', subtype: '2#'}
	],


	/**
	 * Sort by displayOrder, then type, then subtype
	 * @param market
	 * @returns {*}
	 */
	comparator: function(a, b) {
		return this.sortByDisplayOrder(a, b);
	},


	/**
	 * @param a
	 * @param b
	 * @returns {*}
	 */
	sortByDisplayOrder: function(a, b) {
		var ad = parseInt(a.get('displayOrder')),
			bd = parseInt(b.get('displayOrder'));
		if (ad < bd) return -1;
		if (ad > bd) return 1;
		return this.sortByType(a, b);
	},


	/**
	 * @param a
	 * @param b
	 * @returns {*}
	 */
	sortByType: function(a, b) {
		var at = a.get('type'),
			bt = b.get('type');
		if (at < bt) return -1;
		if (at > bt) return 1;
		return this.sortBySubType(a, b);
	},


	/**
	 * @param a
	 * @param b
	 * @returns {number}
	 */
	sortBySubType: function(a, b) {
		var ast = parseInt(a.get('subtype')),
			bst = parseInt(b.get('subtype'));
		if (ast < bst) return -1;
		if (ast > bst) return 1;
		return 0;
	},


	/**
	 * @param options
	 */
	byDisplayed: function() {
		var filtered = this.filter(function(market) {
			return ((market.get("displayed") === true || market.get("displayed") === 'true') && market.get("state") != 'CLOSED');
		});
		return new Markets(filtered);
	},


	/**
	 * @returns {Markets}
	 */
	hasSelections: function() {
		var filtered = this.filter(function(market) {
			return (market.Selections.length >0);
		});
		return new Markets(filtered);
	},


	/**
	 * @param types
	 * @returns {Markets}
	 */
	byTypes: function(types) {
		// firstly make sure all market types are uppercase

		var marketTypes = _.map(types, function(type){
			type = type.toString();
			return type.toUpperCase()
		});

		if (_.size(types) == 0) {
			return this;
		}

		// then filter out markets with matching types
		var filtered = this.filter(function(market) {
			var marketType = market.get('type');
			return _.contains(marketTypes, marketType);
		});
		return new Markets(filtered);
	},

	/**
	 * @param type
	 * @returns {Markets}
	 */
	byType: function(type) {
		 if (type == 0 || type == null || type == undefined) {
			return this;
		}

		// firstly make sure all market types are uppercase
		var marketType = type.toUpperCase();

		// then filter out markets with matching types
		var filtered = this.filter(function(market) {
			var marketType = market.get('type');
			return type == marketType;
		});
		return new Markets(filtered);
	},


	/**
	 * @param attrib
	 * @param value
	 * @returns {Markets}
	 */
	byAttrib: function(attrib, value) {
		var filtered = this.filter(function(market) {
			return market.get(attrib) == value;
		});
		return new Markets(filtered);
	},


	/**
	 * @returns {Markets}
	 */
	byMostBalanced: function() {
		var filtered = this.filter(function(market) {
			if (market.attributes.displayed == false)
				return false;
			if (market.attributes.type == 'OVUN' && market.attributes.mostBalanced == false)
				return false;
			if (market.attributes.type == 'OUH1'&& market.attributes.mostBalanced == false)
				return false;
			return true;
		});
		return new Markets(filtered);
	},


	/**
	 * @param sport
	 * @returns {Markets}
	 */
	byKeyMarkets: function(sport) {
		sport = sport || App.Globals.sport;

		var keyMarkets = dataModel.getKeyMarkets(sport);
		var filtered = this.filter(function(market) {
			return _.includes(keyMarkets, market.get('type'));
		});
		return new Markets(filtered);
	},


	/**
	 * @param sport
	 * @returns {Markets}
	 */
	byKeyMarket: function(sport) {
		sport = sport || App.Globals.sport;

		var keyMarket = dataModel.getKeyMarket(sport);
		var filtered = this.filter(function(market) {
			return market.get('type') == keyMarket;
		});
		return new Markets(filtered);
	},


	/**
	 * Groups common markets together
	 * @returns {*}
	 */
	groupMarkets: function() {
		var markets = this.clone();
		_.each(this.newMarketGroups, function(group) {
			markets = this.groupSelections(markets, group);
		}, this);

		return markets;
	},


	/**
	 * Returns a markets collection, with all grouped markets types'
	 * selections consolidated into one 'container' market.  Used primarily
	 * to group handicap line markets into one container market
	 * @param col
	 * @param types
	 * @returns {*}
	 */
	groupSelections: function(col, type) {
		var markets = col.byTypesAndSub(type);
		var container = _.first(markets.models);

		if (markets.length == 0) return col;
		var markets = _.map(markets.models, function(market) {
			// if the market is not the container market,
			// remove from the markets collection
			if (market.id != container.id) {
				col.remove(market.id);
			}
			return market;
		}, this);

		// add related markets to the conatiner market
		container.RelatedMarkets = new Markets(markets);

		//console.log('GroupedMarket: '+container.attributes.name+', type: '+container.attributes.type+', subtype: '+container.attributes.subtype);
		//_.each(container.RelatedMarkets.models, function(m) {
		//    console.log('- Market: '+m.attributes.name+', type: '+m.attributes.type+', subtype: '+m.attributes.subtype);
		//});
		//console.log(' ');

		return col;
	},


	/**
	 * @param filterMarket
	 * @returns {*}
	 */
	byTypesAndSub: function(filterMarket) {
		// firstly make sure all market types are uppercase

		if (_.size(filterMarket) == 0) {
			return this;
		}

		// then filter out markets with matching types
		var filtered = this.filter(function(market) {
			var marketIsIn = (market.get('type') === filterMarket.type);
			if ( marketIsIn && filterMarket.subtype) {
				marketSubTypeMatches = market.get('subtype').indexOf(filterMarket.subtype) !== -1 ;
				marketIsIn = marketIsIn && marketSubTypeMatches;
			}

			return marketIsIn;
		});

		return new Markets(filtered);
	}

});

export default Markets;


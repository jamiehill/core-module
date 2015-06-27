

var Factory = Backbone.Model.extend({

	defaults: {
		priceAdjustment: 0,
		decimals: {},
		ladder: {}
	},


	/**
	 * Returns the rootLadder api endpoint
	 */
	url() {
		var useSecure = App.Config.useSecure || false,
			endpoint  = App.Urls[useSecure ? 'sendpoint' : 'endpoint'];
		return endpoint+'/getRootLadder';
	},


	/**
	 * Parse the response data to fit with our model implementation
	 * @param resp
	 * @param options
	 * @returns {*}
	 */
	parse: function(resp, options) {
		if (_.has(resp, 'PriceAdjustmentDetailsResponse')){
			resp.ladder = resp.PriceAdjustmentDetailsResponse.rootLadder;
			resp.decimals = _.map(resp.ladder, function(val) {
				var obj = {};
				obj[val.decimal] = val;
				return obj;
			})
			delete resp.PriceAdjustmentDetailsResponse;
		}
		resp.priceAdjustment = 0;
		return resp;
	},


	/**
	 *
	 */
	getRootIndexFromDecimal(decimal) {
		var lookup = this.get('decimals');
		if (decimal) {
			var oddsObj = lookup[decimal];
			if (_.isUndefined(oddsObj)) {
				var roundedDec = parseFloat(decimal).toFixed(2);
				oddsObj = lookup[roundedDec];
				if (_.isUndefined(oddsObj)) {
					oddsObj = {};
					oddsObj.fractional = decimal; //No Lookup found default to decimal.
					oddsObj.decimal = decimal;
				}
			}

			oddsObj.american = this.getMoneyLine(decimal);
			return oddsObj;
		}
	},


	/**
	 *
	 */
	getOddsByIndex(index) {
		var newIndex = this.get('priceAdjustment') + index;
		var oddsObj  = this.get('ladder')[newIndex];
		if (newIndex >= 0) {
			oddsObj = oddsObj || {decimal: 0};
			var decimalOdds = oddsObj.decimal;
			var americanOdds = this.getMoneyLine(decimalOdds);
			oddsObj.american = americanOdds;
			return oddsObj;
		}
		return null;
	},


	/**
	 *
	 */
	getMoneyLine(decimalOdds) {
		var moneyLine = decimalOdds >= 2 ? (decimalOdds - 1) * 100 : (-100) / (decimalOdds - 1);
		var americanOdds = parseInt(moneyLine);
		if (americanOdds > 0) {
			americanOdds = '+'+americanOdds;
		}

		return americanOdds;
	}
});

let inst = new Factory();
export default inst;




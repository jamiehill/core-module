define(['underscore'], function(_) {

	/**
	 * example:
	 * parts = [BetPart object, BetPart object, ...] refer BetPart.js
	 * stake = 1
	 * type = SINGLE, usually
	 */

	function Bet(parts, stake, type) {
		this.parts = parts;
		this.stake = stake;
		this.type = type;
	}

	_.extend(Bet.prototype, {

		estimatedReturns: function() {
			var result = this.stake == '' ? 0.0 : parseFloat(this.stake);

			for (var i = 0; i < this.parts.length; i++) {
				result = result * parseFloat(this.parts[i].selection.decimalOdds);
			}

			return result;
		},

		decimalOdds: function() {
			var result = 1.0;

			for (var i = 0; i < this.parts.length; i++) {
				result = result * parseFloat(this.parts[i].selection.decimalOdds);
			}

			return result;
		},

		fractionalOdds: function() {
			return '';
		},

		totalStake: function() {
			return this.stake == '' ? 0.0 : parseFloat(this.stake);;
		},
		
		marketIdsString: function() {
			var marketIds = [];
			for (var i = 0; i < this.parts.length; i++) {
				marketIds.push(this.parts[i].selection.marketId);
			}
			marketIds.sort();

			var retValue = "mkt";
			for (var i = 0; i < marketIds.length; i++) {
				retValue = retValue + '-' + marketIds[i];
			}
			return retValue;
		},

		betId: function() {
			var selectionIds = [];
			for (var i = 0; i < this.parts.length; i++) {
				selectionIds.push(this.parts[i].selection.selectionId);
			}
			selectionIds.sort();

			var retValue = "bet";
			for (var i = 0; i < selectionIds.length; i++) {
				retValue = retValue + '-' + selectionIds[i];
			}
			return retValue;
		},

		eventName: function() {
			return '';
		},

		marketName: function() {
			return '';
		},

		selectionName: function() {
			return '';
		},

		clone: function() {
			var cloneBet = new Bet([], 0.0);
			cloneBet.type = this.type;
			for (var i = 0; i < this.parts.length; i++) {
				var cloneBetPart = this.parts[i].clone();
				cloneBet.parts.push(cloneBetPart);
			}
			return cloneBet;
		},

		countLines: function() {
			return this.parts.length;
		}
	})

	return Bet;
});


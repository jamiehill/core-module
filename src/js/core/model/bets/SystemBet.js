define(function(){
	/**
	 * A system bet is a combination of bets. like 2 DOUBLE bets or a TRIXIE that covers all probable bets.
	 * Again each Bet inside the SystemBet can have multiple betparts (selections).
	 *
	 * example:
	 * bets = [Bet object, Bet object, ...]; refer Bet.js
	 * stake = 1
	 * name = DOUBLE, TREBLE, TRIXIE etc
	 * fullCover = true, for the bets like TRIXIE, PATENT
	 */
	function SystemBet(bets, stake, name) {

		this.bets = bets;
		this.stake = stake;
		this.name = name;

		//useful while building json.
		//for full cover bets, instead of sending multiple bets, we will send one bet with all betparts
		this.fullCover = false;

		//populated after receiving server response
		this.betTime = null;
		this.id = null;
		this.cashoutValue = null;

	}

	SystemBet.prototype.estimatedReturns = function() {
		var bestMarketBets = [];

		for (var i = 0; i < this.bets.length; i++) {
			var bet = this.bets[i];

			if (bet == null) {
				alert(bet);
			}

			var mktIdString = bet.marketIdsString();

			if (bestMarketBets[mktIdString] == null
				|| bestMarketBets[mktIdString] < bet.decimalOdds()) {
				bestMarketBets[mktIdString] = bet.decimalOdds();
			}
		}

		var floatStake = this.stake == '' ? 0.0 : parseFloat(this.stake);
		var result = 0.0;

		var bestMarketBetsKeys = _.keys(bestMarketBets);
		for (var idx = 0; idx < bestMarketBetsKeys.length; idx++) {
			var currKey =  bestMarketBetsKeys[idx];
			result = result + (parseFloat(bestMarketBets[currKey]) * floatStake);
		}

		//for (var key in bestMarketBets) {
		//	result = result + (parseFloat(bestMarketBets[key]) * floatStake);
		//}

		return result;
	};


	SystemBet.prototype.estimatedReturnsDisplayVal = function(displayCurrency) {
		var returns = this.estimatedReturns();
		if (isNaN(returns)) {
			return '0';
		}

        return App.format(returns, displayCurrency);
	};

	SystemBet.prototype.decimalOdds = function() {
		if (this.bets.length == 1) {
			return this.bets[0].decimalOdds().toFixed(2);
		}
		return '';
	};

	SystemBet.prototype.totalStake = function() {
		return (this.stake == '' ? 0.0 : parseFloat(this.stake)) * this.bets.length;
	};

	SystemBet.prototype.betId = function() {
		return this.name;
	};

	SystemBet.prototype.betType = function() {
		return "SYSTEM";
	};

	SystemBet.prototype.eventName = function() {
		return this.name;
	};

	SystemBet.prototype.betCount = function() {
		return this.bets.length;
	};

    SystemBet.prototype.toJSON = function(options){
        var attribs = _.clone(this.attributes);

        // remove transient attribs
        delete attribs.defaultRendering;
        delete attribs.defaultChevron;
        delete attribs.displayName;
        return attribs;
    };

	SystemBet.prototype.countLines = function(){

		var lines = 0;
		for (var i = 0; i < this.bets.length; i++) {
			lines = lines + this.bets[i].countLines();
		}

		return lines;
	}




	return SystemBet;
})

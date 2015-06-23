define(function() {
	/**
	 *
	 */
	function ForecastBet(forecastHeader, numBets, stake, name) {

		this.forecastHeader = forecastHeader;
		this.numBets = numBets;
		this.stake = stake;
		this.name = name;
	}

	ForecastBet.prototype.betId = function() {
		return 'bet-' + this.forecastHeader.marketId + '-' + this.name;
	};

	ForecastBet.prototype.eventName = function() {
		return name;
	};

	ForecastBet.prototype.estimatedReturns = function() {
		return 0.0;
	};

	ForecastBet.prototype.decimalOdds = function() {
		return 0.0;
	};

	ForecastBet.prototype.totalStake = function() {
		return this.stake == '' ? 0.0 : parseFloat(this.stake);
	};

	ForecastBet.prototype.countLines = function() {
		return this.numBets.length;
	};

	return ForecastBet;
})


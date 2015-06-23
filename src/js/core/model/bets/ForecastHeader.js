define(function(){
	/**
	 *
	 */
	function ForecastHeader(marketId, selections, name) {

		this.headerKey = 'hdr-' + marketId;
		this.marketId = marketId;
		this.name = name;
		this.betParts = [];
		this.isReverseAvailable = true;

		for (var i = 0; i < selections.length; i++) {
			this.betParts.push(new BetPart(selections[i], i+1));
		}

	};

	ForecastHeader.prototype.selectionNames = function() {

		var selectionNamesArray = [];

		for (var i = 0; i < this.betParts.length; i++) {
			var nameObj = {name: this.betParts[i].selection.selectionName};
			selectionNamesArray.push(nameObj)
		}

		return selectionNamesArray;
	};

	ForecastHeader.prototype.betId = function() {
		return this.headerKey;
	};

	ForecastHeader.prototype.eventName = function() {
		return '-';
	};


	ForecastHeader.prototype.estimatedReturns = function() {
		return 0.0;
	};

	ForecastHeader.prototype.decimalOdds = function() {
		return 0.0;
	};

	ForecastHeader.prototype.totalStake = function() {
		return 0;
	};

	return ForecastHeader;
})
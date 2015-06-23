define(['underscore'], function(_){

	function BetSelection(eventId, eventName, marketId, marketName, marketType,
						  selectionId, selectionName, fractionalOdds, decimalOdds, americanOdds,
						  multipleKeys, sport, displayOrder) {

		this.sport = sport;
		this.eventId = eventId;
		this.eventName = eventName;
		this.marketId = marketId;
		this.marketName = marketName;
		this.marketType = marketType;
		this.state = "ACTIVE";
		this.selectionId = selectionId;
		this.selectionName = selectionName;

		this.fractionalOdds = fractionalOdds;
		this.decimalOdds = decimalOdds;
		this.americanOdds = americanOdds;
		this.multipleKeys = multipleKeys;

		this.displayOrder = displayOrder || 0;

		//These are optional attributes from getEvent api.
		this.isEachWayAvailable = false;
		this.isTricastAvailable = false;
		this.numPlaces = 0;
		this.deduction = "";
		this.isForecastAvailable = false;
		this.isSPAvailable = false;

		this.line = null;

		//This is for Asian Handicap Markets added to the betSlip.
		this.inplayScore = '';

		this.selected = false;
		this.includeInMultiples = true;
	}

	_.extend(BetSelection.prototype, {
		getOdds: function(format) {
			var odds = this.fractionalOdds;
			switch(format) {
				case 'DECIMAL' : odds = this.decimalOdds; break;
				case 'AMERICAN' : odds = this.americanOdds; break;
			}
			return odds;
		}
	});

	return BetSelection;
});
define(function() {

	/**
	 * example:
	 * selection = Selection object; refer Selection.js
	 * partNo = serial number of this BetPart in Bet object
	 */
	function BetPart(selection, partNo) {
		this.selection = selection;
		this.partNo    = partNo;
	}

	BetPart.prototype.betId = function() {
		return this.selection.selectionId;
	};

	BetPart.prototype.clone = function() {
		return new BetPart(this.selection, this.partNo);
	};

	return BetPart;
});



	

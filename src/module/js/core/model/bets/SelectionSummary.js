define(['underscore'], function(_){

    function SelectionSummary(marketId, marketName, selectionId, selectionName, fractionalOdds, decimalOdds, eventName) {

        this.marketId       = marketId;
        this.marketName     = marketName;
        this.selectionId    = selectionId;
        this.selectionName  = selectionName;
        this.fractionalOdds = fractionalOdds;
        this.decimalOdds    = decimalOdds;

        this.matchName = eventName;
        this.isRacing = false;
    }

    return SelectionSummary;
});
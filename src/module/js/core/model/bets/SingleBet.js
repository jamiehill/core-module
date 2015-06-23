define(function(){
    /**
     * example:
     * betPart = BetPart object; refer BetPart.js
     * stake = 1
     */
    function SingleBet(betPart, stake) {

        this.betPart = betPart;
        this.stake = stake;
        this.type = 'SINGLE';

        this.isFreeBet = false;
        this.freeBetDescription = "";
        this.redeemFreeBet = false;

        this.isRacing = false;
        this.isSPAvailable = false;
        this.useSP = false;

        this.isEachWayAvailable = false;
        this.eachWay = false;
        this.eachWayOddsAPlace = 0.0;

        this.isForecastAvailable = false;
        this.isTricastAvailable = false;

        //populated after receiving server response
        this.betTime = null;
        this.id = null;
        this.cashoutValue = null;
    }

    SingleBet.prototype.setIncludeInMultiples = function(include) {
        this.betPart.selection.includeInMultiples = include;
    };

    SingleBet.prototype.getIncludeInMultiples = function () {
        return this.betPart.selection.includeInMultiples;
    };

    SingleBet.prototype.estimatedReturns = function () {
        var result = this.stake == '' ? 0.0 : parseFloat(this.stake);
        var returns = result * parseFloat(this.betPart.selection.decimalOdds);
        if (this.redeemFreeBet) {
            return returns - parseFloat(this.stake);
        }
        return returns;
    };


    SingleBet.prototype.estimatedReturnsDisplayVal = function (displayCurrency) {
        var returns = this.estimatedReturns();
        if (isNaN(returns)) {
            return '0';
        }
        return App.format(returns, displayCurrency);
    };

    SingleBet.prototype.setOdds = function (oddsObj) {
        this.betPart.selection.decimalOdds = oddsObj.decimal;
        this.betPart.selection.fractionalOdds = oddsObj.fractional;
        this.betPart.selection.americanOdds = oddsObj.american;
    };

    SingleBet.prototype.getOdds = function (format) {
        var odds = this.betPart.selection.getOdds(format);
        return odds;
    };

    SingleBet.prototype.setState = function(state) {
        this.betPart.selection.state = state;
    };

    SingleBet.prototype.getState = function() {
        return this.betPart.selection.state;
    };

    SingleBet.prototype.decimalOdds = function () {
        var result = 1.0;
        return result * parseFloat(this.betPart.selection.decimalOdds);
    };

    SingleBet.prototype.fractionalOdds = function () {
        return this.betPart.selection.fractionalOdds;
    };

    SingleBet.prototype.totalStake = function () {
        return this.stake == '' ? 0.0 : parseFloat(this.stake);
    };

    SingleBet.prototype.marketIdsString = function () {
        return 'mkt-' + this.betPart.selection.marketId;
    };

    SingleBet.prototype.betId = function () {
        return 'bet-' + this.betPart.selection.selectionId;
    };

    SingleBet.prototype.eventName = function () {
        return this.betPart.selection.eventName;
    };

    SingleBet.prototype.eventId = function () {
        return this.betPart.selection.eventId;
    };

    SingleBet.prototype.marketId = function () {
        return this.betPart.selection.marketId;
    };

    SingleBet.prototype.marketName = function () {
        return this.betPart.selection.marketName;
    };

    SingleBet.prototype.marketType = function () {
        return this.betPart.selection.marketType;
    };

    //This is for Asian Handicap Markets.
    SingleBet.prototype.inplayScore = function () {
        return this.betPart.selection.inplayScore;
    };

    SingleBet.prototype.selectionName = function () {
        return this.betPart.selection.selectionName;
    };

    SingleBet.prototype.selectionId = function () {
        return this.betPart.selection.selectionId;
    };

    SingleBet.prototype.betType = function() {
        return "SINGLE";
    };

    SingleBet.prototype.sport = function () {
        return this.betPart.selection.sport;
    };

    SingleBet.prototype.clone = function () {
        return new SingleBet(this.betPart.clone(), this.stake);
    };

    SingleBet.prototype.countLines = function () {
        return 1;
    };

    return SingleBet;
})
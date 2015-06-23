define(function(){

    var multipleNames = {
        'DOUBLE': 'SYSTEM_2',
        'TREBLE': 'SYSTEM_3',
        'FOURFOLD': 'SYSTEM_4',
        'FIVEFOLD': 'SYSTEM_5',
        'SIXFOLD': 'SYSTEM_6',
        'SEVENFOLD': 'SYSTEM_7',
        'EIGHTFOLD': 'SYSTEM_8',
        'NINEFOLD': 'SYSTEM_9'
    };

    var betToJson = function(betParts, betTime, stake, currencyCode, type, bet, priceFormat) {
        var betObject = {};
        var betPartArray = [];

        for (var j = 0; j < betParts.length; j++) {
            var betPartObject = {};
            betPartObject.partNo = betParts[j].partNo;
            betPartObject.selectionId = betParts[j].selection.selectionId;
            if (bet.useSP) {
                betPartObject.odds = {priceType: 'STARTING'};
            } else {
                if (priceFormat == 'FRACTIONAL') {
                    betPartObject.odds = {
                        decimal: betParts[j].selection.decimalOdds,
                        fractional: betParts[j].selection.fractionalOdds
                    };
                }
                else {
                    betPartObject.odds = {decimal: betParts[j].selection.decimalOdds};
                }

            }

            if (!_.isUndefined(betParts[j].selection.line) &&  !_.isNull(betParts[j].selection.line)) {
                betPartObject.line = betParts[j].selection.line;
            }

            betPartArray.push(betPartObject);
        }

        if (bet.isFreeBet == true && bet.redeemFreeBet == true) {
            var freeBet = bet.freeBet;
            betObject.accountBonusId = freeBet.accountBonusId;
            var bonusStake = freeBet.bonusStakes[0];
            var amount = bonusStake.amount;
            betObject.bonusStake = {amount: amount, currency: currencyCode};
        }
        else {
            betObject.stake = {amount: stake, currency: currencyCode};
        }

        betObject.parts = {betPart: betPartArray};
        if (bet.id) {
            betObject.id = bet.id;
        }
        betObject.type = type;
        if (bet.eachWay) {
            betObject.winType = 'EACH_WAY';
        } else {
            betObject.winType = 'WIN';
        }

        return betObject;
    };

    var openBetToJson = function(betParts, betTime, stake, currencyCode, type, bet, priceFormat) {
        var betObject = {};
        var betPartArray = [];

        for (var j = 0; j < betParts.length; j++) {
            var betPartObject = {};
            betPartObject.partNo = betParts[j].partNo;
            betPartObject.selectionId = betParts[j].selectionId;
            if (bet.useSP) {
                betPartObject.odds = {priceType: 'STARTING'};
            } else {
                if (priceFormat == 'FRACTIONAL') {
                    betPartObject.odds = {
                        decimal: betParts[j].selection.decimalOdds,
                        fractional: betParts[j].selection.fractionalOdds
                    };
                }
                else {
                    betPartObject.odds = {decimal: betParts[j].odds.decimal};
                }

            }

            if (bet.line !== undefined) {
                betPartObject.line = bet.line;
            }

            betPartArray.push(betPartObject);
        }

        if (bet.isFreeBet == true && bet.redeemFreeBet == true) {
            var freeBet = bet.freeBet;
            betObject.accountBonusId = freeBet.accountBonusId;

            var bonusStake = freeBet.bonusStakes[0];
            betObject.bonusStake = bonusStake;
        }
        else {
            betObject.stake = {amount: stake, currency: currencyCode};
        }

        betObject.parts = {betPart: betPartArray};
        if (bet.id) {
            betObject.id = bet.id;
        }
        betObject.type = type;
        if (bet.eachWay) {
            betObject.winType = 'EACH_WAY';
        } else {
            betObject.winType = 'WIN';
        }

        return betObject;
    };


    /**
     * example:
     * accountId = 1;
     * singleBets = ['bet-1' : Bet object, 'bet-2' : Bet object]; refer Bet.js
     * systemBets = ['bet-DOUBLE' : SystemBet object, 'bet-TREBLE' : SystemBet object]; refer SystemBet.js
     */
    var generateJson = function(accountId, currencyCode, singleBets,
                                systemBets, forecastBets, isCashout, priceFormat, acceptPriceChange, isMaxAllowedBetMultiple) {

        var betTime = new Date().getTime();
        var betArray = [];
        var singleBetsKeys = _.keys(singleBets);

        if (isMaxAllowedBetMultiple == false) {
            for (var idx = 0; idx < singleBetsKeys.length; idx++) {
                var currKey = singleBetsKeys[idx];
                var bet = singleBets[currKey];
                if (bet.stake && parseFloat(bet.stake) > 0 && bet.redeemFreeBet == false){
                    betArray.push(betToJson([bet.betPart], betTime, bet.stake, currencyCode, 'SINGLE', bet));
                }
                else {
                    if (bet.isFreeBet == true && bet.redeemFreeBet == true) {
                        var stake = bet.freeBet.bonusStakes[0].amount;
                        betArray.push(betToJson([bet.betPart], betTime, stake, currencyCode, 'SINGLE', bet));
                    }
                }
            }
        }

        //allBetParts will be required for full cover bets, example: TRIXIE
        var allBetParts = [];
        var index = 1;

        for (var idx = 0; idx < singleBetsKeys.length; idx++) {
            var currKey = singleBetsKeys[idx];
            var bet = singleBets[currKey];
            var betPartClone = bet.betPart.clone();
            var betselection = betPartClone.selection;
            if (betselection.includeInMultiples == true) {
                betPartClone.partNo = index++;
                allBetParts.push(betPartClone);
            }
        }

        var systemBetsKeys = _.keys(systemBets);
        for (var idx = 0; idx < systemBetsKeys.length; idx++) {
            var currKey = systemBetsKeys[idx];
            var systemBet = systemBets[currKey];
            if (systemBet.stake && parseFloat(systemBet.stake) > 0) {
                var betName = systemBet.name;
                if (!systemBet.fullCover) {
                    if (systemBet.hasOwnProperty('bets')) {
                        if (systemBet.bets.length == 1) {
                            betName = 'MULTIPLE';
                        } else {
                            betName = multipleNames[systemBet.name];
                            if (!betName) {
                                betName = systemBet.name.replace('ACCUMULATOR', 'SYSTEM_');
                            }
                        }
                    }
                }

                betArray.push(betToJson(allBetParts, betTime, systemBet.stake, currencyCode, betName, systemBet, priceFormat));
            }
            else if (systemBet.stake && systemBet.stake.hasOwnProperty('amount')) {
                betArray.push(openBetToJson(systemBet.parts.betPart, betTime, systemBet.stake.amount, currencyCode, 'MULTIPLE', systemBet, priceFormat));
            }
        }


        var forecastBetsKeys = _.keys(forecastBets);
        for (var idx = 0; idx < forecastBetsKeys.length; idx++) {
            var currKey = forecastBetsKeys[idx];
            var forecastBet = forecastBets[currKey];
            if (forecastBet.headerKey) {//header
                return;
            }
            if (forecastBet.stake && parseFloat(forecastBet.stake) > 0) {
                var forecastHeader = forecastBet.forecastHeader;
                betArray.push(betToJson(forecastHeader.betParts, betTime, forecastBet.stake, currencyCode, forecastBet.name, forecastBet, priceFormat));
            }
        }


        if (betArray.length == 0) {
            return null;
        }

        var betObj;

        if (isCashout) {
            betObj = {'CalculateCashoutRequest':
            {'accountId': accountId,
                'bets': {bet: betArray},
                'channelId': 6}
            };
        }
        else {
            betObj = {'PlaceBetsRequest':
            {'accountId': accountId,
                'bets': {bet: betArray},
                'channelId': 6,
                'reqId':0,
                'acceptPriceChange':acceptPriceChange}
            };
        }

        //console.log('placing bet ::  '+JSON.stringify(betObj));
        //return null;
        return JSON.stringify(betObj);
    };

    return {
        generateJson: generateJson
    };
});
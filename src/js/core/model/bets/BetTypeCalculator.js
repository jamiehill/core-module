define(function(require){
    var SingleBet = require('core/model/bets/SingleBet');
    var SystemBet = require('core/model/bets/SystemBet');
    var ForecastHeader = require('core/model/bets/ForecastHeader');
    var ForecastBet = require('core/model/bets/ForecastBet');
    var BetPart = require('core/model/bets/BetPart');
    var BetsSummary = require('core/model/bets/BetsSummary');
    var Bet = require('core/model/bets/Bet');
    var SelectionSummary = require('core/model/bets/SelectionSummary');

    var multipleNames = {
        '2': 'DOUBLE',
        '3': 'TREBLE',
        '4': 'FOURFOLD',
        '5': 'FIVEFOLD',
        '6': 'SIXFOLD',
        '7': 'SEVENFOLD',
        '8': 'EIGHTFOLD',
        '9': 'NINEFOLD'
    };

    var fullCoverNames = {
        '3': 'TRIXIE',
        '4': 'YANKEE',
        '5': 'CANADIAN',
        '6': 'HEINZ',
        '7': 'SUPER_HEINZ',
        '8': 'GOLIATH',
        '9': 'SUPER_GOLIATH'
    };

    var fullCoverWithSinglesNames = {
        '3': 'PATENT',
        '4': 'LUCKY_15',
        '5': 'LUCKY_31',
        '6': 'LUCKY_63'
    };


    var multipleNamesAliases = {
        'SYSTEM_2': 'DOUBLE',
        'SYSTEM_3': 'TREBLE',
        'SYSTEM_4': 'FOURFOLD',
        'SYSTEM_5': 'FIVEFOLD',
        'SYSTEM_6': 'SIXFOLD',
        'SYSTEM_7': 'SEVENFOLD',
        'SYSTEM_8': 'EIGHTFOLD',
        'SYSTEM_9': 'NINEFOLD'
    };

    var defaultStake = '';
    var moreSystemBetsAvailable = false;

    //private members
    var marketRepeated = function (selections) {
        var marketIds = [];
        var repeated = false;

        _.each(selections, function(selection) {
            if (marketIds.indexOf(selection.marketId) >= 0) {
                repeated = true;
            }
            marketIds.push(selection.marketId);

        })
        return repeated;
    };

    var eventRepeated = function (selections) {
        var eventIds = [];
        var repeated = false;

        _.each(selections, function(selection) {
            if (eventIds.indexOf(selection.eventId) >= 0) {
                repeated = true;
            }
            eventIds.push(selection.eventId);
        });
        return repeated;
    };


    var relatedContingency = function (selections) {
        var multipleKeysArray = [];
        _.each(selections, function(selection) {
            if (selection.multipleKeys != null && selection.multipleKeys != 0) {
                var multipleKeys = selection.multipleKeys.split(',');

                _.each(multipleKeys, function(key) {
                    if (multipleKeysArray.indexOf(key) > -1) {
                        return true;
                    }
                    multipleKeysArray.push(key);

                })
            }
        });
        return false;
    };

    var uniqueEvents = function (selections) {
        var eventIds = [];
        _.each(selections, function(selection) {
            if (eventIds.indexOf(selection.eventId) < 0) {
                eventIds.push(selection.eventId);
            }
        });
        return eventIds;
    };

    var uniqueMarketsCount = function (selections) {
        var marketIds = [];
        _.each(selections, function(selection) {
            if (marketIds.indexOf(selection.marketId) < 0) {
                marketIds.push(selection.marketId);
            }
        });
        return marketIds.length;
    };

    var combinations = function (numArr, choose, callback) {
        var n = numArr.length;
        var c = new Array();
        var inner = function (start, choose_) {
            if (choose_ == 0) {
                callback(c);
            } else {
                for (var i = start; i <= n - choose_; ++i) {
                    c.push(numArr[i]);
                    inner(i + 1, choose_ - 1);
                    c.pop();
                }
            }
        };
        inner(0, choose);
    };

    //if there are 5 selections, this will give [0, 1, 2, 3, 4]
    var createNumericArray = function (selections) {
        var numericArray = [];
        for (var i = 0; i < selections.length; i++) {
            numericArray.push(i);
        }
        return numericArray;
    };

    var createSelectionIndexCombinations = function (numMarkets, numericArray) {
        var combinationArrays = {};

        for (var i = 0; i <= numMarkets; i++) {
            combinationArrays[i] = new Array();
        }

        for (var i = 2; i <= numMarkets; i++) {
            combinations(numericArray, i,
                function output(arr) {
                    //problems with pushing array, so converting them to string and storing
                    var s = '';
                    for (var j = 0; j < arr.length; j++) {
                        s = s + '|' + arr[j];
                    }
                    combinationArrays[i].push(s.substr(1));
                }
            );
        }
        return combinationArrays;
    };

    var createMultipleBet = function (betSelections, multipleName) {
        var bet = new Bet([], defaultStake, multipleName);
        for (var i = 0; i < betSelections.length; i++) {
            var selection = betSelections[i];
            bet.parts.push(new BetPart(selection, i + 1));
        }
        return bet;
    };

    var createFullCoverBet = function (allSelections, multipleBets, betName) {
        var fullCoverBets = new Array();
        for (var i = 0; i < allSelections.length; i++) {
            var selection = allSelections[i];
            fullCoverBets.push(new Bet([new BetPart(selection, 1)], defaultStake, betName));
        }

        var multipleBetsKeys = _.keys(multipleBets);

        for (var idx = 0; idx < multipleBetsKeys.length; idx++) {
            var currKey = multipleBetsKeys[idx];
            var multiple = multipleBets[currKey];
            var bets = multiple.bets;
            for (var i = 0; i < bets.length; i++) {
                fullCoverBets.push(bets[i].clone());
            }
        }

        var systemBet = new SystemBet(fullCoverBets, defaultStake, betName);
        systemBet.fullCover = true;

        return systemBet;
    };

    var systemBetsAvailable = function () {
        return moreSystemBetsAvailable;
    };

    var calculateAccumulatorBets = function (singleBets) {
        var eventMap = [];
        var marketMap = [];
        var selections = [];
        moreSystemBetsAvailable = true;

        var singleBetsKeys = _.keys(singleBets);
        for (var idx = 0; idx < singleBetsKeys.length; idx++) {
            var currKey = singleBetsKeys[idx];
            var bet = singleBets[currKey];
            if (bet.getIncludeInMultiples()) {
                selections.push(bet.betPart.selection);
            }
        }

        var multipleBets = [];
        var numMarkets = uniqueMarketsCount(selections);
        if (numMarkets < 2) {
            return [];
        }

        var betSelections = [];
        var i=1;
        for (var j = 0; j < selections.length; j++) {
            var bet = selections[j];

            if (relatedContingency(betSelections)) {
                moreSystemBetsAvailable = true;
                multipleBets = [];
                break;
            }

            if (eventMap.hasOwnProperty('event-'+bet.eventId) || marketMap.hasOwnProperty('market-'+bet.marketId)) {
                moreSystemBetsAvailable = true;
                multipleBets = [];
                break;
            }

            eventMap['event-'+bet.eventId] = 'event-'+bet.eventId;
            marketMap['market-'+bet.marketId] = 'event-'+bet.marketId;
            betSelections.push(bet);

            var multipleName = multipleNames[i + ''];
            if (_.isUndefined(multipleName)) {
                multipleName = 'ACCUMULATOR' + i;
            }

            if (!multipleBets.hasOwnProperty(multipleName)) {
                multipleBets[multipleName] = new SystemBet([], defaultStake, multipleName);
            }

            multipleBets[multipleName].bets.push(createMultipleBet(betSelections, multipleName));
            i++;
        }

        var multipleBetsKeys = _.keys(multipleBets);
        var systemBets = [];

        if (multipleBetsKeys.length > 0) {
            moreSystemBetsAvailable = true;
            var currentKey = multipleBetsKeys[multipleBetsKeys.length-1];
            systemBets[currentKey] = multipleBets[currentKey]
        }
        return systemBets;
    };

    var calculateCombiBets = function (singleBets) {
        var singleBetsArray = _.values(singleBets);
        var selections = [];
        var combiBets = [];

        //for (var i=0;i<singleBetsArray.length;i++) {
        //    var bet = singleBetsArray[i];
        //    selections.push(bet.betPart.selection);
        //}
        //
        ////FIXME CHECK FOR MULTIPLE MARKET ID'S PER EVENT. ONLY 1 MARKET PER EVENT IS ALLOWED.
        //var uniqueEventsArray = uniqueEvents(selections);
        //if (uniqueEventsArray.length <2) {
        //    return [];
        //}
        //
        //var uniqueSelections = [];
        //var combiArray = [];
        //var firstEventCount = 0;
        //
        //for (var k=0;k<uniqueEventsArray.length;k++) {
        //    var selectionCount = 0;
        //    var eventId = uniqueEventsArray[k];
        //    for (var j=0;j<selections.length;j++) {
        //        var betSelection = selections[j];
        //        if (betSelection.eventId == eventId) {
        //            uniqueSelections[k+':'+selectionCount] = k+':'+selectionCount; //betSelection;
        //            selectionCount++;
        //            if (k == 0) {
        //                firstEventCount++;
        //            }
        //        }
        //    }
        //}
        //
        //var combinationArrays = createSelectionIndexCombinations(firstEventCount,  _.values(uniqueSelections));
        //0:0
        //0:1
        //1:0
        //1:1
        //2:0
        //2:1

        //0:0 - 1:0 - 2:0
        //0:0 - 1:0 - 2:1
        //0:0 - 1:1 - 2:0
        //0:0 - 1:1 - 2:1

        //0:1 - 1:0 - 2:0
        //0:1 - 1:0 - 2:1
        //0:1 - 1:1 - 2:0
        //0:1 - 1:1 - 2:1


        return combiBets;
    };

    var calculateSystemBets = function (singleBets) {

        var selections = new Array();
        var bets = [];
        var singleBetsKeys = _.keys(singleBets);
        for (var idx = 0; idx < singleBetsKeys.length; idx++) {
            var currKey = singleBetsKeys[idx];
            var bet = singleBets[currKey];
            if (bet.getIncludeInMultiples()) {
                selections.push(bet.betPart.selection);
            }
        }

        var numMarkets = uniqueMarketsCount(selections);
        if (numMarkets < 2) {
            return [];
        }

        //if there are 3 selections (markets different), it will create [0,1], [0,2], [1,2], [0,1,2]
        var numericArray = createNumericArray(selections);
        var combinationArrays = createSelectionIndexCombinations(numMarkets, numericArray);

        var checkForMarketRepitition = marketRepeated(selections);
        var checkForEventRepitition = eventRepeated(selections);
        var checkForRelatedContingency = relatedContingency(selections);
        var multipleBets = [];

        for (var i = 2; i <= numMarkets; i++) {
            for (var j = 0; j < combinationArrays[i].length; j++) {
                var selectionIndexes = combinationArrays[i][j].split('|');
                var betSelections = [];
                for (var k = 0; k < selectionIndexes.length; k++) {
                    var selection = selections[selectionIndexes[k]];
                    betSelections.push(selection);
                }

                if (checkForMarketRepitition && marketRepeated(betSelections)) {
                    continue;
                }

                if (checkForEventRepitition && eventRepeated(betSelections)) {
                    continue;
                }

                if (checkForRelatedContingency && relatedContingency(betSelections)) {
                    continue;
                }

                var multipleName = multipleNames[i + ''];
                if (multipleName == null) {
                    multipleName = 'ACCUMULATOR' + i;
                }

                if (!multipleBets.hasOwnProperty(multipleName)) {
                    multipleBets[multipleName] = new SystemBet([], defaultStake, multipleName);
                }

                multipleBets[multipleName].bets.push(createMultipleBet(betSelections, multipleName));
            }
        }

        var fullCoverSystemBets = new Array();
        if (!checkForMarketRepitition && !checkForEventRepitition && !checkForRelatedContingency) {//full covers are available only when markets are unique
            var fullCoverName = fullCoverNames[numMarkets + ''];
            if (fullCoverName != null) {
                fullCoverSystemBets[fullCoverName] = createFullCoverBet([], multipleBets, fullCoverName);
            }

            var fullCoverWithSinglesName = fullCoverWithSinglesNames[numMarkets + ''];
            if (fullCoverWithSinglesName != null) {
                fullCoverSystemBets[fullCoverWithSinglesName] = createFullCoverBet(selections, multipleBets, fullCoverWithSinglesName);
            }
        }

        var systemBets = [];
        var multipleBetsKeys = _.keys(multipleBets);

        for (var mIdx = 0; mIdx < multipleBetsKeys.length; mIdx++) {
            var currentKey = multipleBetsKeys[mIdx];
            systemBets[currentKey] = multipleBets[currentKey]
        }

        var fullCoverSystemBetsKeys = _.keys(fullCoverSystemBets);
        for (var fIdx = 0; fIdx < fullCoverSystemBetsKeys.length; fIdx++) {
            var currKey = fullCoverSystemBetsKeys[fIdx];
            systemBets[currKey] = fullCoverSystemBets[currKey];
        }

        return systemBets;

    };

    var totalStake = function (singleBets, systemBets, forecastBets) {
        var stake = 0.0;

        var singleBetsKeys = _.keys(singleBets);
        for (var idx = 0; idx < singleBetsKeys.length; idx++) {
            var currKey = singleBetsKeys[idx];
            stake = stake + singleBets[currKey].totalStake();
        }

        var systemBetsKeys = _.keys(systemBets);
        for (var idx = 0; idx < systemBetsKeys.length; idx++) {
            var currKey = systemBetsKeys[idx];
            stake = stake + systemBets[currKey].totalStake();
        }

        var forecastBetsKeys = _.keys(forecastBets);
        for (var idx = 0; idx < forecastBetsKeys.length; idx++) {
            var currKey = forecastBetsKeys[idx];
            stake = stake + forecastBets[currKey].totalStake();
        }

        return stake;
    };

    var totalLines = function (singleBets, systemBets, forecastBets) {
        var lines = 0;

        var singleBetsKeys = _.keys(singleBets);
        lines = lines + singleBetsKeys.length;

        var systemBetsKeys = _.keys(systemBets);
        for (var idx = 0; idx < systemBetsKeys.length; idx++) {
            var currKey = systemBetsKeys[idx];
            lines = lines + systemBets[currKey].countLines();
        }

        var forecastBetsKeys = _.keys(forecastBets);
        for (var idx = 0; idx < forecastBetsKeys.length; idx++) {
            var currKey = forecastBetsKeys[idx];
            lines = lines + forecastBets[currKey].countLines();
        }

        return lines;
    };

    var estimatedReturns = function (singleBets, systemBets, forecastBets) {
        var returns = 0.0;
        var bestSingles = new Array();

        var singleBetsKeys = _.keys(singleBets);
        for (var idx = 0; idx < singleBetsKeys.length; idx++) {
            var currKey = singleBetsKeys[idx];
            var bet = singleBets[currKey];
            var mktIdString = bet.marketIdsString();

            if (bestSingles[mktIdString] == null
                || bestSingles[mktIdString] < bet.estimatedReturns()) {
                bestSingles[mktIdString] = bet.estimatedReturns();
            }
        }


        var bestBetsKeys = _.keys(bestSingles);
        for (var idx = 0; idx < bestBetsKeys.length; idx++) {
            var currKey = bestBetsKeys[idx];
            var estimate = bestSingles[currKey];
            returns = returns + parseFloat(estimate);
        }

        var systemBetsKeys = _.keys(systemBets);
        for (var idx = 0; idx < systemBetsKeys.length; idx++) {
            var currKey = systemBetsKeys[idx];
            var bet = systemBets[currKey];
            returns = returns + bet.estimatedReturns();
        }

        return returns;
    };

    var segragateIntoMarketGroups = function (selections) {
        var selectionGroups = new Array();

        for (var i = 0; i < selections.length; i++) {
            var selection = selections[i];
            var marketId = 'mkt-' + selection.marketId;
            if (!selectionGroups.hasOwnProperty(marketId)) {
                selectionGroups[marketId] = new Array();
            }
            selectionGroups[marketId].push(selection);
        }

        return selectionGroups;
    };

    var reverseForecastBet = function (forecastBets, forecastHeaderKey, isReverse) {

        for (var i = 0; i < forecastBets.length; i++)
        {
            var forecastObj = forecastBets[i];
            if (forecastObj instanceof ForecastBet)
            {
                if (forecastObj.forecastHeader)
                {
                    if (forecastObj.forecastHeader.headerKey == forecastHeaderKey)
                    {
                        var betTypeName;
                        if (forecastObj.name == 'STRAIGHT_FORECAST' || forecastObj.name == 'REVERSE_FORECAST')
                        {
                            betTypeName = isReverse ? 'REVERSE_FORECAST' : 'STRAIGHT_FORECAST';
                            forecastObj.name = betTypeName;
                            forecastObj.numBets = isReverse ? 2 : 1;
                        }
                        else if (forecastObj.name == 'TRICAST' || forecastObj.name == 'REVERSE_TRICAST')
                        {
                            betTypeName = isReverse ? 'REVERSE_TRICAST' : 'TRICAST';
                            forecastObj.name = betTypeName;
                            forecastObj.numBets = isReverse ? 2 : 1;
                        }
                    }
                }
            }
        }
    };


    var calculateForecastBets = function (singleBets) {

        var forecastBets = new Array();

        var selections = new Array();

        _.each(singleBets, function(key) {
            var singleBet = key;
            if (singleBet.getIncludeInMultiples() && singleBet.isRacing) {
                if (singleBet.isForecastAvailable || singleBet.isTricastAvailable)
                {
                    selections.push(singleBet.betPart.selection);
                }
            }
        });

        var selectionGroups = segragateIntoMarketGroups(selections);

        _.each(selectionGroups, function(key) {
            var selectionGroup = key;
            if (selectionGroup.length == 1) {
                return;
            }

            //add forecast header
            var forecastHeader = new ForecastHeader(key.replace('mkt-', ''), selectionGroup, '');
            forecastBets[forecastHeader.headerKey] = (forecastHeader);

            if (selectionGroup.length == 2) {
                var strForecast = new ForecastBet(forecastHeader, 1, defaultStake, 'STRAIGHT_FORECAST');
                forecastBets[strForecast.betId()] = strForecast;
            }

            if (selectionGroup.length > 2) {
                var numBets = selectionGroup.length * (selectionGroup.length - 1);
                var combiForecast = new ForecastBet(forecastHeader, numBets, defaultStake, 'COMBINATION_FORECAST');
                forecastBets[combiForecast.betId()] = combiForecast;
            }

            if (selectionGroup.length == 3) {
                var tricast = new ForecastBet(forecastHeader, 1, defaultStake, 'TRICAST');
                forecastBets[tricast.betId()] = tricast;
            }

            if (selectionGroup.length > 3) {
                var numBets = selectionGroup.length * (selectionGroup.length - 1) * (selectionGroup.length - 2);
                var combiTricast = new ForecastBet(forecastHeader, numBets, defaultStake, 'COMBINATION_TRICAST');
                forecastBets[combiTricast.betId()] = combiTricast;
            }
        });

        return forecastBets;

    };

    var dummyForecasts = function (singleBets) {
        var selections = new Array();

        selections['sel-' + 1] = new SelectionSummary('1', 'mkt-1', '1', 'sel-1', '11/10', '2.10');
        selections['sel-' + 1].isRacing = true;
        selections['sel-' + 2] = new SelectionSummary('1', 'mkt-1', '2', 'sel-2', '5/4', '2.25');
        selections['sel-' + 2].isRacing = true;

        var singleBets = [];
        _.each(selections, function(key){
            var bet = new SingleBet(new BetPart(key, 1), 1.0);
            bet.isRacing = key.isRacing;
            singleBets['bet-' + key.selectionId] = bet;
        })

        return calculateForecastBets(singleBets);
    };

    var locateMultiple = function (probableMultiples, multipleName, uniqueMarketsCount) {
        //rename multiple type
        if (multipleName == 'MULTIPLE') {
            multipleName = 'SYSTEM_' + uniqueMarketsCount;
        }

        if (multipleName.indexOf('SYSTEM_') == 0) {
            if (multipleNamesAliases[multipleName] != null) {
                multipleName = multipleNamesAliases[multipleName];
            }
            else {
                multipleName = 'ACCUMULATOR' + multipleName.replace('SYSTEM_', '');
            }
        }

        _.each(probableMultiples, function(key) {
            if (key.name == multipleName) {
                return key;
            }
        })
    };

    var getMultipleNamesAlias = function(betType) {
        var betName = '';

        switch(betType) {
            case 'SYSTEM_2':
                betName = 'DOUBLE';
                break;
            case 'SYSTEM_3':
                betName = 'TREBLE';
                break;
            case 'SYSTEM_4':
                betName = 'FOURFOLD';
                break;
            case 'SYSTEM_5':
                betName = 'FIVEFOLD';
                break;
            case 'SYSTEM_6':
                betName = 'SIXFOLD';
                break;
            case 'SYSTEM_7':
                betName = 'SEVENFOLD';
                break;
            case 'SYSTEM_8':
                betName = 'EIGHTFOLD';
                break;
            case 'SYSTEM_9':
                betName = 'NINEFOLD';
                break;
            default:
                betName = betType;
                break;
        }

        return betName;
    };

    var getMultipleBetNamesByIndex = function (index) {
        return multipleNames[index];
    };

    var getSystemBetNamesByIndex = function(varieties, numBets) {
        var numVarieties = 0;
        var maxNumber = 0;
        var singlesExist = false;
        _.each(varieties, function(v, k) {
            numVarieties++;
            var n = parseInt(k);
            if (maxNumber < n) {
                maxNumber = n;
            }
            if (n == 1) {
                singlesExist = true;
            }
        });
        var betName;
        if (numVarieties == 1) {
            betName = multipleNames[maxNumber];
        }
        else if (singlesExist) {
            betName = fullCoverWithSinglesNames[maxNumber];
        }
        else {
            betName = fullCoverNames[maxNumber];
        }
        if (!betName) {
            betName = 'SYSTEM';
        }

        return betName + ' ' + numBets + ' bets';
    };

    /**
     * server results may not match with the json that we send.
     *
     */
    var jsonToBets = function (openBets) {
        var singleBets = [];

        _.each(openBets, function(betObj) {
            var openbet = betObj.bet;
            if (openbet.betStatus == 'REJECTED') {
                return;
            }
            if (openbet.type == 'SINGLE') {
                var betPart = openbet.parts.betPart[0];

                var selection = new SelectionSummary(betPart.market.id, betPart.market.name,
                    betPart.selection.id, betPart.selection.name,
                    null, betPart.odds.decimal, betPart.event.name);

                var singleBet = new SingleBet(new BetPart(selection, 1), openbet.stake.amount);
                singleBet.id = openbet.id;
                singleBet.betTime = openbet.betTime;

                singleBets.push(singleBet);
            }
        });

        //multiples may have selections that are not in singlebets
        var systemBets = [];

        _.each(openBets, function(betObj){
            var openbet = betObj.bet;

            if (openbet.betStatus == 'REJECTED') {
                return;
            }
            if (openbet.type != 'SINGLE') {
                var probableSingles = [];
                var selections = [];

                _.each(openbet.parts.betPart, function(part){
                    var betPart = part;

                    var selection = new SelectionSummary(betPart.market.id, betPart.market.name,
                        betPart.selection.id, betPart.selection.name,
                        '', betPart.odds.decimal, betPart.event.name);

                    selections.push(selection);
                    probableSingles.push(new SingleBet(new BetPart(selection, 1), 0));

                });

                var probableMultiples = calculateSystemBets(probableSingles);
                if (count(probableMultiples) > 0) {
                    var requiredMultiple = locateMultiple(probableMultiples, openbet.type, uniqueMarketsCount(selections));

                    if (requiredMultiple != null) {
                        requiredMultiple.stake = openbet.stake.amount;
                        requiredMultiple.betTime = openbet.betTime;
                        requiredMultiple.id = openbet.id;

                        systemBets.push(requiredMultiple);
                    }
                }
            }
        });

        return new BetsSummary(singleBets, systemBets, []);
    };

    //dont know why bets.length not working
    var count = function (bets) {
        var c = 0;

        _.each(bets, function(b){
            c++;
        })
        return c;
    };

    return {
        calculateCombiBets: calculateCombiBets,
        calculateSystemBets: calculateSystemBets,
        calculateAccumulatorBets: calculateAccumulatorBets,
        systemBetsAvailable: systemBetsAvailable,
        calculateForecastBets: calculateForecastBets,
        reverseForecastBet: reverseForecastBet,
        estimatedReturns: estimatedReturns,
        totalStake: totalStake,
        totalLines: totalLines,
        jsonToBets: jsonToBets,
        getMultipleBetNamesByIndex: getMultipleBetNamesByIndex,
        getMultipleNamesAlias : getMultipleNamesAlias,
        getSystemBetNamesByIndex: getSystemBetNamesByIndex
    };

});

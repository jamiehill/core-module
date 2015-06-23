/**
 * Created by ianrotherham on 10/12/2014.
 */
define([
        'core/model/accounts/Bet',
        'core/model/accounts/BetsList',
        'core/model/accounts/BetsFilter'
    ],
    function (Bet, BetsList, BetsFilter) {

        return Backbone.Model.extend({

            defaults: {
                totalBetsCount: 0,
                pageSize: 30,
                currentPage: 1,
                totalPages: 0,
                currentPageBetIds: ''
            },

            map: {},
            betsList: new BetsList(),
            betFilter: new BetsFilter(),
            activeTab: 'allBets',

            /**
             * @param evts
             */
            initialize: function(){
                _.bindAll(this, 'parseBets');
                this.vent = ctx.get('vent');
                this.commands = ctx.get('commands');
                this.sessionModel = ctx.get('sessionModel');
                //this.commands.execute('command:getBets');
                //this.listenTo(this.vent, 'session:loggedin', this.getBetsData);
            },

            getBetsData: function() {
                if (this.sessionModel.isLoggedIn()) {
                    this.commands.execute('command:getBets');
                }
            },

            /**
             * @param data
             */
            parseBets: function(bets) {
                //Reset the betsList to don't keep the previous in the datagrid
                this.betsList = new BetsList();

                if(_.size(bets)>0) {
                    bets = this.parseSystemBets(bets);
                    this.betsList.add(_.map(bets, function (s) {

                        if(!_.isUndefined(s.parts)){
                            for (var j=0;j< s.parts.betPart.length; j++) {
                                var part = s.parts.betPart[j];
                                if (_.includes(part.selection.name, '{homeLine}')) {
                                    if (_.has(part,'line')) {
                                        var val = part.selection.name;
                                        var homeLine = part.line;
                                        part.selection.name = val.replace('{homeLine}', homeLine);
                                    }
                                }
                                else if (_.includes(part.selection.name, '{awayLine}')) {
                                    if (_.has(part,'line')) {
                                        var val = part.selection.name;
                                        var homeLine = part.line;
                                        var awayLine = homeLine * -1;
                                        part.selection.name = val.replace('{awayLine}', awayLine);
                                    }
                                }
                                else if (_.includes(part.selection.name, '{Line}')) {
                                    if (_.has(part,'line')) {
                                        var val = part.selection.name;
                                        var line = part.line;
                                        part.selection.name = val.replace('{Line}', line);
                                    }
                                }
                            }
                        }

                        var bet = new Bet(s, {parse: true});
                        if (s.stake) {
                            bet.set('stake', s.stake.amount);
                        }
                        if (bet.get('type') == 'SINGLE') {
                            bet.set('odds', s.parts.betPart[0].odds.decimal.toFixed(2));
                            bet.set('event', s.parts.betPart[0].event.name);
                            bet.set('selection', s.parts.betPart[0].selection.name);
                            bet.set('market', s.parts.betPart[0].market.name);
                            var liab = s.parts.betPart[0].odds.decimal * s.stake.amount;
                            bet.set('position', 'Liabilities: ' + liab.toFixed(2));
                        }
                        return bet;
                    }));
                }
                this.trigger("dataComplete");
            },


            parseLotteryBets: function(bets) {
                //Reset the betsList to don't keep the previous in the datagrid
                this.betsList = new BetsList();

                if(_.size(bets)>0) {
                    this.betsList.add(_.map(bets, function (s) {
                        var bet = new Bet();
                        if (s.stake) {
                            bet.set('stake', s.stake);
                        }

                        var numbers = "";
                        if (_.size(s.bets)>0) {
                            var betsObj = s.bets[0];
                            var lines = betsObj.lines;
                            var numbersArray = betsObj.numbers;
                            numbers = numbersArray.join(',');
                            var type = betsObj.type;
                        }
                        bet.set('id', s.ticketRef);
                        var betTime = new Date(s.drawTime).getMilliseconds();
                        bet.set('betTime', betTime);
                        bet.set('type', '');
                        bet.set('event', s.drawName);
                        bet.set('selection', s.gameId);
                        bet.set('market', s.drawNumber);
                        bet.set('betStatus', s.status);
                        bet.set('winnings', s.win);
                        bet.set('position', numbers);
                        bet.set('description', type);
                        return bet;
                    }));
                }
                this.trigger("dataComplete");
            },

            /**
             *
             * @param bets
             * @returns {Array}
             */
            parseSystemBets: function(bets){
                var nodes = [];

                _.each(bets, function(bet){

                    for (var j=0;j< bet.parts.betPart.length; j++) {
                        var part = bet.parts.betPart[j];
                        if (_.includes(part.selection.name, '{homeLine}')) {
                            if (_.has(part,'line')) {
                                var val = part.selection.name;
                                var homeLine = part.line;
                                part.selection.name = val.replace('{homeLine}', homeLine);
                            }
                        }
                        else if (_.includes(part.selection.name, '{awayLine}')) {
                            if (_.has(part,'line')) {
                                var val = part.selection.name;
                                var homeLine = part.line;
                                var awayLine = homeLine * -1;
                                part.selection.name = val.replace('{awayLine}', awayLine);
                            }
                        }
                        else if (_.includes(part.selection.name, '{Line}')) {
                            if (_.has(part,'line')) {
                                var val = part.selection.name;
                                var line = part.line;
                                part.selection.name = val.replace('{Line}', line);
                            }
                        }
                    }

                    if(bet.masterBetId){
                        if(bet.type == 'MULTIPLE'){
                            bet.stake = bet.stake.amount;
                            bet.open = false;
                        }
                        //if the System bet it's already mapped add the bet inside that SystemBet
                        if(this.map[bet.masterBetId]){
                            this.map[bet.masterBetId].BetsList.push(bet);
                        }
                        else { //Add a new bet in the betlist "System type" that includes the multiples and the id=masterBetId
                            var systemBet = new Bet();
                            systemBet.set('type', 'SYSTEM');
                            systemBet.type = 'SYSTEM';
                            systemBet.set('id', bet.masterBetId);
                            this.map[bet.masterBetId] = systemBet;

                            systemBet.BetsList = new BetsList();
                            systemBet.BetsList.push(bet);
                        }
                    }
                    else {
                        nodes.push(bet); //if it's single or Multiple just add the bet in the mail list
                    }
                }, this);

                _.each(this.map, function(sn){ // add the system bets to the main bets list
                    nodes.push(sn);
                }, this);
                return nodes;
            },

            /**
             * Returns the child bets of the currently active account
             */
            getBets: function(){
                this.betFilter.betList = this.betsList;
                return this.betFilter.getFiltered().models;
            },

            /**
             * Returns the child bets of the currently active account
             */
            getLotteryBets: function(){
                this.betFilter.betList = this.betsList;
                return this.betsList.models;
            },

            /**
             *
             * @param betId
             * @returns {*}
             */
            getBetById: function(betId) {
                return this.betsList.findWhere({id: betId + ''});
            },


            /**
             * Converts the betParts from a multiple bet in bets to display in the datagrid as "Expanded"
             * @param multipleBet
             */
            addBetPartNodes: function(multipleBet){
                _.each(multipleBet.get('parts').betPart, function (part) {
                    part.id = part.partNo;
                    var bet = new Bet(part, {parse: true});
                    bet.set('odds', part.odds.decimal.toFixed(2));
                    bet.set('event', part.event.name);
                    bet.set('selection', part.selection.name);
                    bet.set('market', part.market.name);
                    multipleBet.partsExpanded.push(bet);
                }, this);
            },

            /**
             *
             * @returns {*}
             */
            getCurrencySymbol: function() {
                if (this.sessionModel.isLoggedIn()) {
                    return App.translator.translateCurrency(this.sessionModel.getCurrency());
                }
                else {
                    var localeCurrency = App.translator.translate("CURRENCY_NAME");
                    return App.translator.translateCurrency(localeCurrency)
                }
            }

        });
    });

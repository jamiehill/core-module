define(['backbone'],
    function(Backbone) {
        return Backbone.Model.extend({


            dependencies: 'vent, commands, sessionModel',

            defaults: {
                entitlements :[],
                freeBets:[],
                bonusAvailable:false
            },


            ready: function() {

            },

            checkFreeBetsPaths: function(path) {
                var freeBets = this.get("freeBets");
                for (var i=0;i< freeBets.length;i++) {
                    var freeBet = freeBets[i];

                    if (freeBet.paths.length == 0) {
                        //NO PATHS MEANS FREE BETS FOR EVERYTHING
                        freeBet.description = "ANY SELECTION";
                        return freeBet;
                    }

                    for (var j=0;freeBet.paths.length;j++) {
                        var entitlementPath = freeBet.paths[j];
                        var parentPathFound = false;
                        if (_.isUndefined(entitlementPath)) {
                            break;
                        }

                        //entitlementPath = "166661";
                        var entitlementPathArray = entitlementPath.split(":");
                        var pathArray = path.split(":");

                        if (pathArray.length > 1 && entitlementPathArray.length >0) {
                            //Yeah I know it's tricky to read. Basically checking the selected event parent path
                            //is the same as the entitlement path.
                            var secondToLastSelectedPathNode = pathArray[pathArray.length-2];
                            var lastEntitlementPathNode = entitlementPathArray[entitlementPathArray.length-1];
                            if (lastEntitlementPathNode == secondToLastSelectedPathNode) {
                                parentPathFound = true;
                            }
                            else {
                                if (pathArray.length >= entitlementPathArray.length) {
                                    //Check the last node in entitlementPaths is the same index as the clicked path.
                                    var selectedPathValueSameIndex = pathArray[entitlementPathArray.length-1];
                                    if (lastEntitlementPathNode == selectedPathValueSameIndex ) {
                                        parentPathFound = true;
                                    }
                                }
                            }
                        }

                        if (entitlementPath == path || parentPathFound) {
                            var foundPathName = freeBet.pathNames[j];
                            freeBet.description = foundPathName;
                            return freeBet;
                        }
                    }
                }
                return null;
            },

            removeAllEntitlements: function() {
                this.set('entitlements', [],true);
                this.set("freeBets",[],true);
                this.set("bonusAvailable",false,true);
            },

            setEntitlements: function(entitlements) {
                this.validateBonusEntitlement(entitlements);
                var collection = [];
                for (var i=0;i<entitlements.length;i++) {
                    var entitlement = entitlements[i];
                    if (_.has(entitlement.bonus,'freebet')) {
                        var pathDescriptions = "";
                        var freeBet = entitlement.bonus.freebet;
                        var pathsArray = freeBet.pathNames;
                        for (var j=0;j<pathsArray.length;j++) {
                            var pathName = pathsArray[j];
                            pathDescriptions+= " "+pathName;
                        }
                        entitlement.bonus.pathDescription = pathDescriptions;
                        collection.push(entitlement);
                    }
                }
                this.set('entitlements', collection);
                this.trigger('bonusEntitlementChange');
            },

            getEntitlements: function() {
                return this.get("entitlements");
            },

            validateBonusEntitlement: function(entitlements) {
                var scope = this;
                var freeBets = [];
                _.each(entitlements, function(obj){
                    if (obj.bonus.status == 'ACTIVE') {
                        if (_.has(obj.bonus, 'freebet')) {
                            var freeBet = obj.bonus.freebet;
                            freeBet.accountBonusId = obj.accountBonusId;
                            //Now only show the bonus stakes that apply for the punter currency code.
                            var userCurrency = scope.sessionModel.getCurrency();
                            var bonusStake = freeBet.bonusStakes[0];
                            for (var i=0;i<freeBet.bonusStakes.length;i++) {
                                var bonusObj = freeBet.bonusStakes[i];
                                if (bonusObj.currency == userCurrency) {
                                    bonusStake = bonusObj;
                                    break;
                                }
                            }
                            freeBet.bonusStakes = [];
                            freeBet.bonusStakes.push(bonusStake);
                            freeBets.push(freeBet);
                        }
                        scope.set("bonusAvailable", true);
                    }
                });
                this.set("freeBets",freeBets);
            },

            isBonusAvailable: function() {
                return this.get("bonusAvailable");
            }

        });
    });

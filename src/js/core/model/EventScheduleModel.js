define([
    'backbone',
    'core/factory/ContextFactory',
    'core/collection/EventsCollection'
],
function(Backbone, ContextFactory, EventsCollection) {
    return Backbone.Model.extend({
        dependencies: 'cache=eventCache, commands, keyMarketsModel',
        FrontLinks: new EventsCollection,
        defaults: {
            sportCodes:null,
            inplay: [],
            prematch: [],
            coupons: [],
            outrightsCoupon:[],
            allCompetitions: [],//Competitions not from the schedule
            competitions: [],
            competitionEvents:[],
            couponEvents:[],
            groupedEvents:[],
            quickLinks:[]
        },


        /**
         * Satisfy dependencies
         */
        initialize: function() {
            ContextFactory.satisfy(this, this.dependencies);
            _.bindAll(this, 'loadSport', 'promise', 'addFrontLink');
        },


        /**
         * Load the global sport
         * @param keyMarkets
         * @param days
         */
        loadSport: function(keyMarkets, days) {
            var sport    = App.Globals.sport,
                markets  = keyMarkets ? this.keyMarketsModel.getMarkets(sport) : '';
            // execute the command returning a promise to hook onto
            this.commands.execute('command:getSportSchedule', sport, markets, days);
            //this.commands.execute('command:getSportTree', App.Globals.sport);
            return this.promise();
        },


        /**
         * @returns {jQuery.Deferred}
         */
        promise: function() {
            var deferred = $.Deferred();
            // when the update is complete, resolve the promise so that
            // the requesting class can render using the updated data
            this.listenToOnce(this, 'updateComplete', function() {
                deferred.resolve();
            });
            return deferred;
        },


        /**
         * Subscribes to prematch and inplay events for each sport
         */
        subscribeMarkets: function() {
            var sport    = this.get('sportCodes'),
                events   = this.getPrematchAndInplay(),
                markets  = this.keyMarketsModel.getMarkets(sport),
                eventIds = _.pluck(events, 'id').join(',');
            console.log('Subscription:callee:EventScheduleModel');
            if (!_.isNull(sport)) {
                this.commands.execute('command:subscribe:markets', sport.toUpperCase(), eventIds, markets);
            }
        },



        /**
         * Grouped events
         */


        /**
         * Events grouped by day
         * @returns {Mixed|*}
         */
        getGroupedEvents: function() {
            return this.get('groupedEvents');
        },


        /**
         * @param collection
         */
        setGroupedEvents: function(collection) {
            // sort the object by date
            var sorted = _.sortBy(collection, function(val, key, object) {
                return val.epoch;
            });

            this.set('groupedEvents', sorted);
        },


        /**
         *
         */
        clearFrontLinks: function() {
            this.FrontLinks = new EventsCollection();
        },


        /**
         * @param quickLinks
         */
        addFrontLink: function(lnk) {
            if (_.isNull(this.FrontLinks))
                this.FrontLinks = new EventsCollection();

            // create/update the event
            var event = this.cache.updateEvent(lnk);

            // if quicklink isn't in the collection, add it
            var link = this.FrontLinks.get(event.id);
            if(_.isUndefined(link)) {
                this.FrontLinks.add(event);

                console.log('AddFrontLink: '+event.get('sport')+', '+event.get('name'));
            }
        },


        /**
         * Inplay events
         */


        /**
         * @returns {Mixed|*}
         */
        getInplay: function() {
            return this.get('inplay');
        },


        /**
         * @param inplay
         * @param silent
         */
        setInplay: function(inplay,silent) {
            //silent boolean to dispatch model change event.
            var collection = [];
            if ( inplay.event ) {
                for (var i = 0; i < inplay.event.length; i++) {
                    var eventData = inplay.event[i];
                    if (eventData.numMarkets > 0) {
                        _.extend(eventData, {code: this.attributes.sportCodes.toLowerCase()});
                        var event = this.cache.updateEvent(eventData);
                        collection.push(event);
                    }
                }
            }
            this.set('inplay', collection, {"silent":silent});
        },


        /**
         * @param eventData
         */
        addEventToInplay: function(eventData) {
            var event = this.cache.addEvent(eventData),
                collection = this.get('inplay');
                prematchCollection = this.get('prematch');

            var prematchIndex = _.indexOf(prematchCollection, event);
            if (prematchIndex != -1) {
                prematchCollection.splice(prematchIndex,1);
                this.set('prematch', prematchCollection);
            }

            var index = _.indexOf(collection, event);
            if ( index == -1) {
                event.setInplay(true);
                collection.push(event);
                this.set('inplay', collection);
            }
        },


        /**
         * @param id
         */
        removeEventFromInplayById: function(id) {
            var collection = this.get('inplay');
            var existingEvent = this.cache.getEvent(id);

            var index = _.indexOf(collection, existingEvent);
            if ( index != -1) {
                collection.splice(index,1);
                this.set('inplay', collection);
            }
        },


        /**
         * Prematch events
         */


        /**
         * @returns {Mixed|*}
         */
        getPrematch: function() {
            return this.get('prematch');
        },

        /**
         * @returns {Mixed|*}
         */
        getPrematchDisplayedMarkets: function(count) {
            var returnCollection = [];
            var pmtch = this.getPrematch();

            _.each(pmtch, function(event) {
                if (event.attributes.displayed == true) {
                    var markets = event.Markets.byKeyMarkets().byDisplayed();
                    if(markets.length != 0) {
                        returnCollection.push(event);
                    }
                }
            });

            return _.first(returnCollection , count);
        },


        /**
         * @param prematch
         * @param silent
         */
        setPrematch: function(prematch,silent) {
            //silent boolean to dispatch model change event.
            var collection = [];
            if ( prematch.event ) {
                for (var i = 0; i < prematch.event.length; i++) {
                    var eventData = prematch.event[i];
                    _.extend(eventData, {code: this.attributes.sportCodes.toLowerCase()});
                    var event = this.cache.updateEvent(eventData);
                    collection.push(event);
                }
            }
            this.set('prematch', collection, {"silent":silent});
        },


        /**
         * @param eventData
         */
        addEventToPrematch: function(eventData) {
            var event = this.cache.addEvent(eventData),
                collection = this.get('prematch');

            var index = _.indexOf(collection, event);
            if (index == -1) {
                collection.push(event);
                this.set('prematch', collection);
            }
            this.addEventToCompetitions(event);
        },

        addEventToCompetitions: function(event) {
            var competitionsCategory = this.getCompetitions();
            for (var i=0; i < competitionsCategory.length; i++) {
                var category = competitionsCategory[i];
                if (category.competition) {
                    for (var j = 0; j < category.competition.length; j++) {
                        var comp = category.competition[j];
                        if (comp.id == event.attributes.compId) {
                            var index = _.indexOf(comp.event, event);
                            if (index == -1) {
                                comp.event.push(event);
                            }
                            break;
                        }
                    }
                }
            }
        },

        /**
         * @param id
         */
        removeEventFromPrematchById: function(id) {
            var collection = this.get('prematch');
            var existingEvent = this.cache.getEvent(id);

            var index = _.indexOf(collection, existingEvent);
            if ( index != -1) {
                collection.splice(index,1);
                this.set('prematch', collection);
            }
        },


        /**
         * @returns {*|Array.<T>|string}
         */
        getPrematchAndInplay: function() {
            return this.get('inplay').concat(this.get('prematch'));
        },


        /**
         * Competitions
         */


        /**
         * Returns a competition by competition id
         * @param id
         * @returns {*}
         */
        getCompetition: function(id) {
            var league, leagues = this.getLeagues();
            _.each(leagues, function(l) {
                if (l.id == id) league = l;
            });
            return league;
        },


        /**
         * Returns a competition by competition id
         * @param id
         * @returns {*}
         */
        getInitalCompetition: function() {
            var leagues = this.getLeagues();
            return _.first(leagues);
        },


        getAllCompetitions: function() {
            return this.get('allCompetitions');
        },

        setAllCompetitions: function(categoryArray) {
            if (categoryArray) {
                for (var i = 0; i < categoryArray.length; i++) {
                    var category = categoryArray[i];
                    if (category.competition) {
                        for (var j = 0; j < category.competition.length; j++) {
                            var comp = category.competition[j];
                            if (comp.event) {
                                var eventCollection = [];
                                for (var k = 0; k < comp.event.length; k++) {
                                    var eventData = comp.event[k];
                                    _.extend(eventData, {code: this.get('sportCodes').toLowerCase()});
                                    eventCollection.push(this.cache.updateEvent(eventData));
                                }
                                comp.event = eventCollection;
                            }
                        }
                    }
                }
            }

            this.set('allCompetitions', categoryArray);
        },

        /**
         * @returns {Mixed|*}
         */
        getCompetitions: function() {
            return this.get('competitions');
        },


        /**
         * @param categoryArray
         * @param silent
         */
        setCompetitions: function(categoryArray) {
            if (categoryArray) {
                for (var i = 0; i < categoryArray.length; i++) {
                    var category = categoryArray[i];
                    if (category.competition) {
                        for (var j = 0; j < category.competition.length; j++) {
                            var comp = category.competition[j];
                            if (comp.event) {
                                var eventCollection = [];
                                for (var k = 0; k < comp.event.length; k++) {
                                    var eventData = comp.event[k];
                                    _.extend(eventData, {code: this.get('sportCodes').toLowerCase()});
                                    eventCollection.push(this.cache.updateEvent(eventData));
                                }
                                comp.event = eventCollection;
                            }
                        }
                    }
                }
            }

            this.set('competitions', categoryArray);
        },

        /**
         * @param compId
         * @returns {string}
         */
        getCompetitionsNameById: function(compId) {
            var name = "";
            this.get('competitions').forEach(function(country){
                country.competition.forEach(function(comp){
                    if(comp.id == compId) {
                        name = comp.name;
                    }
                });
            });
            return name;
        },

        getQuickLinkNameById: function(compId) {
            var name = "";
            this.get('quickLinks').forEach(function(link){
                if(link.competition.id == compId) {
                    name = link.competition.name;
                }
            });
            return name;
        },


        /**
         * @returns {*}
         */
        getLeagues: function() {

            var comps = this.get('competitions');
            comps = _.pluck(comps, 'competition');
            comps = _.flatten(comps);
            return _.sortBy(comps, function(comp){
                return comps.name;
            });
        },


        /**
         * @returns {Mixed|*}
         */
        getCompetitionEvents: function() {
            return this.get('competitionEvents');
        },


        /**
         * @param compId
         */
        getCompetitionEvent: function(compId) {
            var competition = this.get('competitionEvents'), events = [];
            _.each(competition, function(c) {
                if (c.get('compId') == compId) {
                    return c;
                }
            });
            return null;
        },

        getCompetitionEventByCompId: function(compId) {
            var competition = this.get('competitionEvents'),
                events = [];

            events = _.filter(competition, function (event) {
                return event.get('compId') == compId;
            });

            return events;
        },


        /**
         * @param competitions
         */
        setCompetitionEvents: function(competitions) {
            var collection = [];
            if (_.size(competitions) > 0 ) {
                for (var i = 0; i < competitions.length; i++) {
                    var eventData = competitions[i];
                    var event = this.cache.addEvent(eventData);
                    collection.push(event);
                }
                this.set('competitionEvents', collection);
            }
        },


        /**
         * Coupons
         */


        /**
         * @returns {Mixed|*}
         */
        getCoupons: function() {
            return this.get('coupons');
        },


        /**
         * @param coupon
         */
        setCoupons: function(couponArray) {
            for (var i = 0; i < couponArray.length; i++) {
                var coupon = couponArray[i];
                var outrightArray = [];
                if ( coupon.name == 'Outrights') {
                    outrightArray.push(coupon);
                    this.setOutrightsCoupon(outrightArray);
                    break;
                }
            }
            this.set('coupons', couponArray);
        },

        setOutrightsCoupon: function(couponArray) {
            this.set('outrightsCoupon', couponArray);
        },

        getOutrightsCoupon: function() {
            return this.get('outrightsCoupon');
        },

        /**
         * @returns {Mixed|*}
         */
        getCouponEvents: function() {
            return this.get('couponEvents');
        },


        /**
         * @param coupons
         */
        setCouponEvents: function(coupons) {
            var collection = [];
            if ( coupons.competitions ) {
                for (var i = 0; i < coupons.competitions.category.length; i++) {
                    var category = coupons.competitions.category[i];
                    if (category.competition) {
                        for (var j = 0; j < category.competition.length; j++) {
                            var comp = category.competition[j];
                            if (comp.event) {
                                for (var k = 0; k < comp.event.length; k++) {
                                    var eventData = comp.event[k];
                                    var event = this.cache.updateEvent(eventData);
                                    collection.push(event);
                                }
                            }
                        }
                    }
                }
            }
            var couponWrapper = {};
            couponWrapper.id = coupons.id;
            couponWrapper.name = coupons.name;
            couponWrapper.events = collection;
            this.set('couponEvents', couponWrapper);
        },


        /**
         * @param sports
         */
        setSportCodes: function(sports) {
            var lowerCaseSport = sports.toLowerCase();
            this.set('sportCodes',lowerCaseSport);
        },


        /**
         * @returns {Mixed|*}
         */
        getSportCodes: function() {
            return this.get('sportCodes');
        },


        /**
         * @param id
         * @returns {*}
         */
        findEventById: function(id){
            return _.find(this.getPrematchAndInplay(), function(e){
                return (e.id == parseInt(id));
            })
        },


        /**
         *
         */
        updateComplete: function() {
            this.trigger("updateComplete", {});
        }
    });
});



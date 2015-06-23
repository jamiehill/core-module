/**
 * Created by jamie on 2/6/15.
 */
define([
        'core/collection/MarketsCollection'
    ],
    function(MarketsCollection) {
        var Model = {sport: 'soccer', sortType: 'date', event: null, state: 'SUSPENDED'};
        return Marionette.Controller.extend({


            marketGroups: ['AHCP', 'HCMR', 'OUHG,OUH1', 'OUAG,OUA1', 'OU2H,OUH2',
                'OU2A,OUA2', 'OVUN', 'BATS', 'BAPS', 'HCH1', 'HCH2',
                'IHTI', 'IHTG', 'IHEH', 'IHGS', 'IHGT', 'IHTT', 'IHTS',
                'VO1S', 'VO1T', 'VOHA',
                'HBGS', 'HBH2W',
                'RUPS', 'RUTO', 'RU1P',
                'RLPS', 'RLTO', 'RL1P'
            ],
            collection: null,
            marketCache: null,
            model: null,


            /**
             * @param options
             */
            initialize: function() {
                _.bindAll(this, 'populateCollection');

                this.cache = ctx.get('eventCache');
                this.groupsModel = ctx.get('marketGroupFactory');
                this.currentEvents = ctx.get('currentEvents');

                this.collection = new MarketsCollection();
                this.marketCache = new MarketsCollection();
                this.model = new Backbone.Model(Model);

                this.listenTo(this.groupsModel, 'change:currentGroup', this.onGroupChange);
            },


            /**
             * @param group
             */
            onGroupChange: function() {
                var group = this.groupsModel.get('currentGroup'),
                    markets = this.marketCache.byTypes(group ? group.types : []);
                this.collection.reset(markets.groupMarkets().models);
            },


            /**
             * @param eventId
             */
            fetch: function(eventId, types) {
                var that = this;
                ctx.get('apiService')
                    .getEvent(eventId)
                    .done(function(resp){
                        that.parseEvent(resp.Event);
                    });
            },


            /**
             * @param eventId
             */
            notifyResponse: function(eventId) {
                var vent = ctx.get('vent');
                vent.trigger("getEvent:dataComplete",eventId);
            },


            /**
             * @param evt
             */
            parseEvent: function(evt) {
                var event = this.cache.updateEvent(evt);
                this.marketCache.reset(event.Markets.models);

                this.notifyResponse(event.id);
                if (!!event.get('inplay')) {
                    var eventDomain = ctx.get('eventModel');
                    eventDomain.updateIncidentScoreFromEvent(event);
                }

                this.model.set({event: event});
                this.model.set({inplay: event.getInplay()});

                var that = this;
                var respond = function() {
                    that.populateCollection(event);
                };

                // if the markets groups haven't completed loading
                // yet, attach the 'addEvents' call to the promise
                var loading = !!this.groupsModel.deferred;
                if (loading) {
                    this.groupsModel.deferred.done(respond);
                    return;
                }

                respond();
            },


            /**
             * Updates the collection with current markets
             * @param eventId
             */
            update: function(eventId, callback) {
                var event = this.cache.getEvent(eventId);
                this.marketCache.reset(event.Markets.models);

                var that = this;
                var respond = function() {
                    that.populateCollection(event);
                    if (callback) callback();
                };

                // if the markets groups haven't completed loading
                // yet, attach the 'addEvents' call to the promise
                var loading = !!this.groupsModel.deferred;
                if (loading) {
                    this.groupsModel.deferred.done(respond);
                    return;
                }

                respond();
            },


            /**
             * Populates the collection with relevant markets
             * @param event
             */
            populateCollection: function(event) {
                var markets, group = this.groupsModel.getGroup(event),
                    types = _.isUndefined(group) ? [] : group.types;

                // get markets by current group types
                markets = this.marketCache.byTypes(types);

                // and add all grouped markets to the collection
                this.currentEvents.reset([event]);
                this.collection.reset(markets.groupMarkets().models);
            }
        });
    });



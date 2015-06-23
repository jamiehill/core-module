/**
 * Created by jamie on 2/7/15.
 */
define([
    'trading/model/Promotion',
    'core/util/HrefUtil',
    'core/model/bets/BetSelection'
],

function(Promotion, HrefUtil, BetSelection) {
    return Backbone.Model.extend({


        promotions: {},
        deferred: null,


        /**
         *
         */
        initialize: function() {
            this.vent = ctx.get('vent');
            this.commands = ctx.get('commands');
            this.cache = ctx.get('eventCache');
            this.oddsFactory = ctx.get('oddsFactory');
        },


        /**
         * Fetch promotions for specified page and sport
         */
        fetch: function(collection, pageId, max) {
            var sport = HrefUtil.isHome() ? '' : App.Globals.sport,
                that = this;
            this.loadPromotions(sport)
                .done(function() {
                    that.populateCollection(collection, sport, pageId);
                });
        },

        /**
         * Loads the promotions for the given sport
         * @param sport
         * @param max
         * @returns {*}
         */
        loadPromotions: function(sport) {
            this.deferred = $.Deferred();
            var that = this;

            this.promotions = new Backbone.Collection();
            this.promotions.comparator = 'priority'; // order by priority

            this.commands.execute('command:getPromotions', sport)
                .done(function(resp) {
                    _.each(resp.PromoEvents.promo, function(promotionFromApi) {
                        var promo = that.createPromotionFromApiResponseObject(promotionFromApi);
                        that.promotions.add(promo);
                    }, this);

                    that.deferred.resolve();
                    that.deferred = null;
                })
                .fail(function(er) {
                    console.log('Promotions: Failed! '+JSON.stringify(er));
                });
            return this.deferred;
        },


        /**
         * Populate the users collection with required number of promotions
         * @param sport
         * @param max
         */
        populateCollection: function(collection, sport, pageId, max) {
            var promos = this.promotions.models;

            // Filter By Sport

            if (!_.isEmpty(sport)) {
                promos = _.filter(promos, function(p) {
                    return p.get('sport').toLowerCase() === sport.toLowerCase();
                });
            }

            // Filter by pageId

            promos = _.filter(promos, function(p) {
                var pageTypes = p.get('pageTypes'),
                    pages     = pageTypes.split(','),
                    contains  = _.contains(pages, pageId.toString());
                return contains;
            });

            // Sort

            _.sortBy(promos, function(p) {
                return p.get('priority');
            });

            // Take First n

            var required = _.first(promos, max);

            collection.reset(promos);
        },

        createPromotionFromApiResponseObject: function (promotionFromApi) {
            var promo = new Promotion(promotionFromApi, {parse: true});

            // Replace existing selections with the more domain specific BetSelection objects

            var realSelections = [];

            var that = this;

            _.each(promo.attributes.selections, function (s) {
                var oddsObj = that.oddsFactory.getRootIndexFromDecimal(s.odds.dec); // For American Odds

                var betSelection = new BetSelection(
                    promo.attributes.eventId,
                    promo.attributes.event.name,
                    promo.attributes.marketId,
                    promo.attributes.market.name,
                    promo.attributes.market.type,
                    s.id,
                    s.name,
                    s.odds.frac,
                    s.odds.dec,
                    oddsObj.american,
                    0,
                    promotionFromApi.event.sport,
                    s.pos ? s.pos.col : 0
                );


                realSelections.push(betSelection);
            });

            promo.attributes.selections = _.sortBy(realSelections, function(sel) {
                return sel.displayOrder;
            });

            // add each new promotional event to event cache

            promo.attributes.event = this.cache.updateEvent(promotionFromApi.event);

            return promo;
        }
    });
});

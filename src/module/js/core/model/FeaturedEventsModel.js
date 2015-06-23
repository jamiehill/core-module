/**
 * Created by jamie on 3/6/15.
 */
define([
    './Event',
    '../collection/EventsCollection'
],
function(Event, EventsCollection) {
    return Backbone.Model.extend({
        featured: null,


        /**
         *
         */
        initialize: function() {
			this.eventCache = ctx.get('eventCache');
			this.keyMarketsModel = ctx.get('keyMarketsModel');
			this.popularBetsModel = ctx.get('popularBetsModel');
            this.featured = new EventsCollection();
            this.listenTo(this.popularBetsModel, 'change:popularBets', this.parseBets);
        },


        /**
         * @param bets
         */
        parseBets: function() {
            var bets = this.popularBetsModel.get('popularBets'),
                event, that = this, i=0;

            _.each(bets, function(bet) {
                var market = bet.popularMarket,
                    keyMarket = this.keyMarketsModel.getDefaultMarket(bet.sport);

                // if the popularMarket is the default keyMarket,
                // there's no need to load the correct market, so
                // just add the event as a featuredEvent
                if (market.get('type') == keyMarket && market.Selections.length > 1) {
                    this.addFeaturedEvent(bet.event);
                    i++;
                    that.tryAllLoaded(bets.length, i);
                }

                // if we don't have the keyMarket, we
                // going to have to load the sucker in
                else {

                    // first check if the event, with
                    // correct market exists in the cache
                    event = eventCache.getEvent(bet.event.id);
                    if (event) {
                        var market = event.findMarketByType(keyMarket, true);
                        if (_.isArray(market)) market = market[0];
                        if (market && market.Selections.length > 1) {
                            this.addFeaturedEvent(event);
                             i++;
                             that.tryAllLoaded(bets.length, i);
                            return;
                        }
                    }

                    // correct market doesn't exist in
                    // event cache so load it in
                    ctx.get('apiService')
                        .getEvent(bet.event.id, keyMarket)
                        .done(function(resp){
                            var event = that.cache.updateEvent(resp.Event);
                            that.addFeaturedEvent(event);
                            i++;
                            that.tryAllLoaded(bets.length, i);
                        });
                }
            }, this);
        },

        tryAllLoaded: function(betsLength, i) {
			if(betsLength == i) {
	             this.updateComplete();
	        }
        },


        /**
         * @param event
         */
        addFeaturedEvent: function(event) {
            console.log('FeaturedEvent: '+event.get('name'));
            this.featured.add(event);
        },

        /**
         *
         */
        updateComplete: function() {
            this.trigger("updateComplete", {});
        }
    });
});

/**
 * Created by jamie on 2/6/15.
 */
define([
    'core/util/DateTimeUtil'
],
function(date) {
    var Collection = Backbone.Collection.extend({
        comparator: 'epoch'
    });
    return Marionette.Controller.extend({


        deferred: null,
        lists: {},


        /**
         * @param options
         */
        initialize: function() {
            this.collection = new Collection();
        },


        /**
         * @param eventId
         */
        fetch: function(callback) {
            var sport = App.Globals.sport.toUpperCase(),
                that = this;

            // daily list for current sport not yet loaded...
            if (!_.has(this.lists, sport)) {

                // if they're in the process of being loading, hijack the current
                // deferred object to populate the collection once resolved
                if (this.deferred) {
                    this.deferred.done(function(){
                        var days = that.populateCollection(sport);
                        if (callback) callback(days)
                    });

                }

                // otherwise initialise the load ourselves
                else {
                    this.loadDailyList(sport)
                        .done(function() {
                            var days = that.populateCollection(sport);
                            if (callback) callback(days)
                        });


                }
            }

            else this.populateCollection(sport);
        },


        /**
         * @param sport
         */
        populateCollection: function(sport) {
            var days = this.lists[sport.toLowerCase()].models;
            this.collection.reset(days);
            return days;
        },


        /**
         * Loads the promotions for the given sport
         * @param sport
         * @param max
         * @returns {*}
         */
        loadDailyList: function(sport, max) {
            sport = sport || (HrefUtil.isHome() ? '' : App.Globals.sport);
            this.deferred = $.Deferred();

            var that = this;
            ctx.get('apiService')
                .getEventStartingHours(sport)
                .done(function(resp){

                    that.parseHours(resp, sport);
                    that.populateCollection(sport);

                    // resolve and destroy
                    that.deferred.resolve();
                    that.deferred = null;

                });

            return this.deferred;
        },


        /**
         * @param resp
         * @returns {*}
         */
        parseHours: function(resp, sport){
            var sprt = sport.toLowerCase();
            var col = this.lists[sprt] = new Collection();
            _.each(resp.hours, function(hour) {
                // get the event's day
                var eventTime = moment().add(hour,'hours');
                var day = date.groupingDayName(eventTime.toDate());

                // add new day if doesn't already exist
                if (!col.get(day)) {
                    var epoch = eventTime.startOf('day').valueOf();
                    col.add({id: day, epoch: epoch});
                }
            });
        }
    });
});



/**
 * Created by Jamie on 18/09/2014.
 */
define(function (require) {
    var MomentUtil = require('core/utils/MomentUtil');
    return Backbone.Model.extend({


        defaults: {
            event: null,
            element: null,
            clock: null,
            startTime: ''
        },


        /**
         * @param data
         * @returns {*}
         */
        parse: function(data) {
            if (data.event) data.clock = data.event.getInplayClock();
            data.startTime = MomentUtil.fromDisplay(data.clock);
            return data;
        },


        /**
         * @returns {boolean}
         */
        isSyncd: function() {
            var event = this.get('event'),
                dataSync = event.get('eventDataSync');
            return dataSync != null;
        },


        /**
         * @returns {*}
         */
        isTicking: function() {
            var event = this.get('event'),
                dataSync = event.get('eventDataSync');

            var clock = dataSync.attributes.clock;
            return !!clock.attributes.isTicking;
        },


        /**
         * @returns {string}
         */
        getSyncClock: function() {
            var event = this.get('event'),
                dataSync = event.get('eventDataSync');

            var clock = dataSync.attributes.clock;
            return clock.toDisplay();
        },


        /**
         * Returns the event start time, calculated from the genericInplayAttribs.clock
         * attribute before any 'eventDataSync's are received, then - more accurately -
         * according to the eventDataSync epoch and clock attribs for accuracy
         */
        getStartTime: function() {
            var event    = this.get('event'),
                dataSync = event.get('eventDataSync'),
                clock    = dataSync.attributes.clock;

            // if the clock isn't ticking just return the time
            if (!clock.attributes.isTicking)
                return clock.toDisplay();

            // subtract hrs/mins/secs from epoch to give
            // us the implicit start time of the event
            var start = moment(dataSync.attributes.epoch);
            start.subtract(clock.attributes.hrs,  'hours');
            start.subtract(clock.attributes.mins, 'minutes');
            start.subtract(clock.attributes.secs, 'seconds');
            return start;
        }
    });
});

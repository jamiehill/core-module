define(function (require) {
    var dateUtil = require('core/util/DateTimeUtil');

    return {

        /**
         * @param days
         * @param event
         * @param options
         * @returns {*}
         */
        group: function(days, event, options) {
            _.defaults(options, {eventStart:undefined, eventEnd:undefined, display:"h:mm a"});

            // get event time (moment) and natural language day
            var time = moment(event.get('eventTime'));
            var day = dateUtil.groupingDayName(time.toDate());

            // format the display time
            event.set({displayTime: time.format(options.display)});

            // if eventStart is set and event is before, continue
            if (!_.isUndefined(options.eventStart)) {
                if (time.isBefore(options.eventStart)) return days;
            }

            // if eventEnd is set and event is after, continue
            if (!_.isUndefined(this.options.eventEnd)) {
                if (time.isAfter(this.options.eventEnd)) return days;
            }

            if (!_.has(days, day))
                days[day] = {marketsCount: 0, events: []};

            days[day].name = day;
            days[day].epoch = time.startOf('day').valueOf();
            days[day].marketsCount += event.attributes.numMarkets;
            days[day].events.push(event);

            return days;
        },


        /**
         * @param days
         * @returns {*}
         */
        ids: function(days) {
            return _.reduce(days, function(memo, day){
                return memo.concat(_.pluck(day.events, 'id'));
            }, [], this);
        }

    };
});

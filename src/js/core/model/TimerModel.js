define(['core/model/timer/Timer'],
    function(Timer) {
        return Backbone.Collection.extend({


            dependencies: 'cache=eventCache, vent',
            timers: [],
            setIntervalAdded:false,

            /**
             *
             */
            ready: function() {
                _.bindAll(this, 'activateTimers', 'onTickTock');
                this.listenTo(this.vent, 'router:before:routeChange', function(){
                    this.stopTicker();
                    this.reset([]);
                }, this);

            },


            /**
             * Activates a timer for each inplay element.  Also used as
             * routeChange handler, so resets all timers on route change
             */
            activateTimers: function(elements) {
                if (!_.isArray(elements)) elements = [elements];

                // add all timer instances to the model
                var timers = _.map(elements, function(e){
                    return new Timer(e, {parse: true});
                }, this).concat(this.models);

                // start/stop tick tock
                !!timers.length ? this.startTicker() : this.stopTicker();

                // resets the collection
                this.add(timers);
            },


            /**
             * Start the global timer ticker
             */
            startTicker: function() {
                if (!this.setIntervalAdded) {
                    this.tickInterval = setInterval(this.onTickTock, 1000);
                    this.setIntervalAdded = true;
                }
            },


            /**
             * Stop the global timer ticker
             */
            stopTicker: function() {
                clearInterval(this.tickInterval);
                delete this.tickInterval;
                this.setIntervalAdded = false;
            },


            /**
             *
             */
            onTickTock: function() {
                var units = countdown.MINUTES | countdown.SECONDS;
                var element;

                _.each(this.models, function(timer){
                    element = timer.get('element');
                    if (!element) return;

                    // if not sync'd use the event clock
                    if (!timer.isSyncd()) {
                        var event = timer.get('event'),
                            time  = event.getInplayClock();
                        element.text(time);
                    }

                    else {

                        // if not ticking, just display the - sync'd - time
                        if (!timer.isTicking()) {
                            element.text(timer.getSyncClock());
                        }

                        else {
                            // otherwise if is ticking, we need to countdown from
                            // the start time to now to show the ellapsed time
                            var start = timer.getStartTime(),
                                cd    = countdown(moment(), start, units, NaN, 0),
                                mins  = this.doubleZero(cd.minutes),
                                secs  = this.doubleZero(cd.seconds);

                            // set the calculated time on the timer to ensure
                            // it's kept uto date, should it be queried again
                            //timer.attributes.clock = mins+":"+secs;
                            var eventClock = mins+":"+secs;

                            if (!_.isUndefined(mins)) {
                                var event = timer.get('event');
                                var eventClock = mins+":"+secs;
                                event.setInplayClock(eventClock);
                            }

                            element.text(mins+":"+secs);
                            //console.log(element.selector+' : '+eventClock);
                        }

                    }

                }, this);
            },


            /**
             * Ensure zero is represented by two digits
             * @param num
             * @returns {string}
             */
            doubleZero: function(num) {
                return num < 10 ? '0'+num : num;
            }
        });
    });

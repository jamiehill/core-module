define(['backbone', './Event'],
    function(Backbone, Event) {
        return Backbone.Collection.extend({


            dependencies: 'vent, commands',
            model:Event,


            /**
             *
             */
            ready: function() {
                _.bindAll(this, 'onSportChange');
                this.listenTo(this.vent, 'globals:sportChange', this.onSportChange);
                this.reset();
            },


            /**
             * Parse all outrights into objects for the current sport
             * @param templates
             * @param sport
             */
            parse: function(outrights) {
                this.reset();
                var sport = outrights.competition[0];
                if (_.isUndefined(sport)) return;

                _.each(sport.event, function(e){
                    this.addEvent(e);
                }, this);
            },


            /**
             * @param sport
             */
            onSportChange: function(sport) {
                sport = sport || App.Globals.sport;
                this.commands.execute('command:getRegionalOutrights', sport);
            },

            /**
             * Adds an event instance to the cache
             * @param event
             */
            addEvent: function(evt) {
                if (_.isUndefined(evt)) return null;
                if (this.hasntEvent(evt.id)) {
                    this.add(new Event(evt, {parse: true}));
                }
                return this.getEvent(evt.id);
            },

            /**
             * Retrieve an Event from teh collection
             * @param id
             */
            getEvent: function(id){
                return this.get(id);
            },


            /**
             * Query if an event is not already cached
             * @param id
             */
            hasntEvent: function(id){
                var event = this.getEvent(id);
                return _.isUndefined(event) || _.isNull(event);
            }
        });
    });

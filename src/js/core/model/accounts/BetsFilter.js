/**
 * Created by ianrotherham on 10/12/2014.
 */
define(['backbone'],
    function (Backbone) {
        return Backbone.Model.extend({


            betList: null,
            defaults: {
                startTime: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                endTime: new Date(moment(new Date()).endOf('day').valueOf()),
                type: null,
                status: null,
                open: null,
                winnings: null
            },


            /**
             * @returns {{bets: *}}
             */
            getFiltered: function () {
                var collection = this.betList;
                if (this.has('startTime'))
                    collection = collection.byStart(this.get('startTime'));
                if (this.has('endTime'))
                    collection = collection.byEnd(this.get('endTime'));
                if (this.has('type'))
                    collection = collection.byType(this.get('type'));
                if (this.has('status'))
                    collection = collection.byStatus(this.get('status'));
                if (this.has('open'))
                    collection = collection.byOpen(this.get('open'));
                if (this.has('winnings'))
                    collection = collection.byWinnings(this.get('winnings'));
                return collection;
            },


            /**
             * @param type
             * @param val
             */
            setFilter: function(type, val, silent) {
                this.attributes.type = null;
                this.attributes.status = null;
                this.attributes.open = null;
                this.attributes.winnings = null;
                if(_.isBoolean(silent) && silent == true)
                    this.set(type, val, {silent: true});
                else
                    this.set(type, val);
            },


            /**
             * Reset the filter to the default state
             */
            reset: function() {
                this.set(this.defaults);
            }
        });
    });
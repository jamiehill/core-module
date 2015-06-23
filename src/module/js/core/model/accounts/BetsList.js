/**
 * Created by ianrotherham on 10/12/2014.
 */
define([
        'backbone',
        'core/model/accounts/Bet'
    ],
    function (Backbone, Bet) {
        var BetList = Backbone.Collection.extend({
            model: Bet,
            sortType: 'id',


            /**
             * @param evt
             * @returns {*}
             */
            comparator: function(bet) {
                return bet.get(this.sortType);
            },


            /**
             * @param type
             */
            changeSort: function(type) {
                this.sortType = type;
                this.sort();
            },


            /**
             * @returns {BetsList}
             */
            byType: function(value) {
                if(value =='ALL') return this;

                var filtered = this.filter(function(bet) {
                    return bet.get('type') == value;
                });
                return new BetList(filtered);
            },

            /**
             * @returns {BetsList}
             */
            byStart: function(value) {
                var filtered = this.filter(function(bet) {
                    return bet.get('betTime') >= value;
                });
                return new BetList(filtered);
            },

            /**
             * @returns {BetsList}
             */
            byEnd: function(value) {
                var filtered = this.filter(function(bet) {
                    return bet.get('betTime') <= value;
                });
                return new BetList(filtered);
            },

            /**
             * @returns {BetsList}
             */
            byStatus: function(value) {
                if(value =='ALL') return this;

                var filtered = this.filter(function(bet) {
                    return bet.get('betStatus') == value;
                });
                return new BetList(filtered);
            },

            /**
             * @returns {BetsList}
             */
            byOpen: function(value){
                var filtered = this.filter(function(bet) {
                    return bet.get('open') == value;
                });
                return new BetList(filtered);
            },

            /**
             * @returns {BetsList}
             */
            byWinnings: function(value){
                var filtered = this.filter(function(bet) {
                    return bet.get('winnings') > value;
                });
                return new BetList(filtered);
            }
        });

        return BetList;
    });

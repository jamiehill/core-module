/**
 * Created by ianrotherham on 10/12/2014.
 */
define(['backbone',
        'core/model/accounts/BetPart',
        'core/model/accounts/BetParts'
    ],

    function (Backbone, BetPart) {
        return Backbone.Model.extend({

            partsExpanded: [],

            defaults: {
                betNo: '',
                betTime: '',
                type: '',
                winType: '',
                id: '',
                betStatus: '',
                channelId: '',
                winnings: '',
                position: '',
                description:'',
                stake: '',
                masterBetId: '',
                open: '',
                cashoutEnabled: false,
                cashoutValue: 0.00
            },

            /**
             * @param data
             */
            parse: function(data) {
                // ensure id is a string
                if (_.has(data, 'id'))
                    data.id = data.id.toString();
                // parse weights
                if(data.type =='MULTIPLE' && (!data.masterBetId)){
                    this.BetParts = this.parseBetParts(data.parts.betPart, data.id);
                }
                data.open = false;
                return data;
            },

            parseBetParts: function(data) {
                var betPart = _.map(data, function(w) {
                    return new BetPart(w, {parse: true});
                }, this);

                return new BetPart(betPart);
            }

        });
    });

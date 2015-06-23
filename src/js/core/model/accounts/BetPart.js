/**
 * Created by ianrotherham on 10/12/2014.
 */
define([
        'backbone'
    ],
    function (Backbone) {
        return Backbone.Model.extend({
            defaults: {
                odds: '',
                sport: 10,
                competitionParent   : 20,
                competition: '',
                event: '0.5',
                market: '',
                line: '',
                selection: '',
                resultType: '',
                settlementExchangeRate: '',
                partNo : '',
                selectionId : ''
            }
        });
    });
/**
 * Created by ianrotherham on 10/12/2014.
 */
define([
        'backbone',
        'core/model/accounts/BetPart'
    ],
    function (Backbone, BetPart) {
        var BetParts = Backbone.Collection.extend({
            model: BetPart
        });

        return BetParts;
    });


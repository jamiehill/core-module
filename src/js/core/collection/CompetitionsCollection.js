/**
 * Created by Jamie on 17/09/2014.
 */
define([
    'core/model/Competition'
],
function (Competition) {
    var Competitions = Backbone.Collection.extend({
        model: Competition,

        /**
         * Sort by name
         * @param market
         * @returns {*}
         */
        comparator: function(comp) {
            return comp.get('name');
        }
    });

    return Competitions;
});


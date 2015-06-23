/**
 * Created by jamie on 06/03/15.
 */
define(function () {
    var abbreviations = {
        'H' : '1',
        'A' : '2',
        'D' : 'x',
        'PLAYERA' : '1',
        'PLAYERB' : '2'
    };

    return {


        /**
         * Utility method to abbreviate market and selection 'type' names
         * @param t
         * @returns {*}
         */
        abbr: function(t){
            var type = t.toUpperCase();
            if (_.has(abbreviations, type)) {
                return abbreviations[type];
            }
            return t;
        }
    };
});

/**
 * Created by Jamie on 18/09/2014.
 */
define(function () {
    return {

        /**
         * @param str
         * @param val
         * @returns {boolean}
         */
        fromDisplay: function(display){
            var parts = display.split(':'),
                now = moment();

            if (_.size(parts) == 0)
                return now;

            else if (_.size(parts) == 1)
                now.subtract(parts[0], 'seconds');

            else if (_.size(parts) == 2) {
                now.subtract(parts[0], 'minutes');
                now.subtract(parts[1], 'seconds');
            }

            else if (_.size(parts) == 3) {
                now.subtract(parts[0], 'hours');
                now.subtract(parts[1], 'minutes');
                now.subtract(parts[2], 'seconds');
            }

            return now;
        }

    };
});
/**
 * Created by jamie on 10/01/15.
 */
define(function () {
    return {

        /**
         * @param str
         * @param val
         * @returns {boolean}
         */
        sortOn: function(a, b, prop){
            var propA = a.get(prop),
                propB = b.get(prop);

            if (parseInt(propA) != NaN && parseInt(propB) != NaN)
            {
                propA = parseInt(propA);
                propB = parseInt(propB);
            }

            if (propA > propB) return 1;
            if (propA < propB) return -1;
            return 0;
        },


        /**
         * @param as
         * @param bs
         * @returns {number}
         */
        naturalSort: function(as, bs){
            var a, b, a1, b1, i= 0, n, L,
                rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
            if(as=== bs) return 0;
            a= as.toLowerCase().match(rx);
            b= bs.toLowerCase().match(rx);
            L= a.length;
            while(i<L){
                if(!b[i]) return 1;
                a1= a[i],
                    b1= b[i++];
                if(a1!== b1){
                    n= a1-b1;
                    if(!isNaN(n)) return n;
                    return a1>b1? 1:-1;
                }
            }
            return b[i]? -1:0;
        }

    };
});

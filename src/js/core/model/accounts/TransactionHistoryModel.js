/**
 * Created by ianrotherham on 17/12/2014.
 */
define(['backbone'],
    function (Backbone) {
        return Backbone.Model.extend({

            //DEPOSIT,
            //WITHDRAWL,
            //WITHDRAWAL_PENDING,
            //WITHDRAWAL_CANCELLED,
            //WITHDRAWAL_SUBMITTED,
            //WITHDRAWAL_FAILURE,
            //WITHDRAWAL_COMPLETED,
            //STAKE,
            //REFUND,
            //ROLLED_UP_BALANCE,
            //SETTLEMENT,
            //UNSETTLEMENT,
            //RESETTLEMENT


            defaults: {
                amendment: false,
                balanceIncrease:false,
                previousPayout:0,
                stake:0,

                resultType:"",
                additionalInfo : "",
                amendment: false,
                balanceIncrease:false,
                previousPayout:0,
                stake:0,
                amount:0,
                balance:0,
                betId:"",
                currency:'GBP',
                description:"",
                fundsType:"",
                productId:0,
                transactionId:"",
                transactionTime:0,
                type:"STAKE",
                walletType:"", //1=SPORTSBOOK, 2=LOTTERY
                extPlayId:"",
                extRoundId:"",
                gameId:0,
                rgsId:0

            },



            initialize: function( options ) {
                //this.populate(options);
            }

            /*populate: function(data) {
                var scope = this;
                _.each(data, function(val, key){
                    if (_.has(scope.defaults, key)) {
                        if (key == 'walletId') {
                            if (parseInt(val) == 1) {
                                val = 'SPORTSBOOK';
                            }
                            else if (parseInt(val) == 2) {
                                val = 'LOTTERY';
                            }
                        }
                        scope.set(key, val);
                    }
                });
            }*/

        });
    });
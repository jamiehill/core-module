/**
 * Created by ianrotherham on 20/01/2015.
 */
define([
        'backbone'
    ],
    function (Backbone) {
        return Backbone.Model.extend({

            defaults: {
                accountStatus:'ACTIVE',
                address:'',
                amountMultiplier:0,
                balance:0,
                betLimit:0,
                betLimitCurrency:'-',
                colourCategory:'-',
                country:'',
                countryCode:'',
                creationDate:0,
                currencyCode:'',
                dateOfBirth:0,
                email:'',
                phone:'',
                excludeFromRiskAlert:false,
                firstName:'',
                gender:'',
                id:0,
                inplayDelayCategory:'',
                lastLoginTime:0,
                lastName:'',
                liveBetlimit:0,
                minimumStake:0,
                name:'',
                priceAdjustment:'-',
                ref:0
            },

            populateDefaults: function(data) {
                var scope = this;
                _.each(data, function(val, key){
                    if (_.has(scope.defaults, key)) {
                        scope.set(key, val);
                    }
                });
            }





        });
    });
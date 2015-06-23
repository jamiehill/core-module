define(['backbone','trading/core/ctx'],
    function(Backbone, ctx) {
        return Backbone.Model.extend({

            defaults: {
                precision : 2,
                separator: ','
            },

            requireCurrencySymbolAtTheEnd: [
                "원"
            ],

            /**
             *
             */
            initialize: function(){
                _.bindAll(this, 'format');
                this.sessionModel = ctx.get("sessionModel");
            },

            /**
             *
             * @returns {*}
             */
            getCurrencySymbol: function() {
                if (this.sessionModel.isLoggedIn()) {
                    return App.translator.translateCurrency(this.sessionModel.getCurrency());
                }
                else {
                    var localeCurrency = App.translator.translate("CURRENCY_NAME");
                    return App.translator.translateCurrency(localeCurrency)
                }
            },

            /**
             *
             * @returns {*}
             */
            getCurrencyName: function() {
                if (this.sessionModel.isLoggedIn()) {
                    return this.sessionModel.getCurrency();
                }
                else {
                    return App.translator.translate("CURRENCY_NAME");
                }
            },

            /**
             *
             * @param number
             * @param addCurrency
             * @returns {string}
             */
            format: function(number, addCurrency){

                if (isNaN(number)) return '0';
                var currency = addCurrency ? this.getCurrencySymbol() : "";
                var appendCurrency = _.contains(this.requireCurrencySymbolAtTheEnd, currency);

                if(appendCurrency)
                    this.set('precision', 0);

                var isNegative =  Number(number) < 0;

                var formatted = Math.abs(Number(number));

                if(this.getCurrencyName() == 'KRW'){
                    formatted = Math.floor(number).toFixed(this.get('precision')).replace(/./g, function(c, i, a) {
                        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                    });
                }
                else{
                    formatted = formatted.toFixed(this.get('precision')).replace(/./g, function(c, i, a) {
                        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                    });
                }
                if(appendCurrency)
                    return isNegative ? ("-"+formatted + currency) : (formatted + currency) ;

                return isNegative ? ("-" + currency + formatted) : (currency + formatted);
            },

            /**
             *
             * @param str
             * @returns {*|string}
             */
            unformat: function(str) {
                return str.replace( /,/g, "");
            }

        });
    });



define(function () {

        return Backbone.Model.extend({

            defaults: {
                selectedLocale:   'en-gb',
                selectedOddsType: 'DECIMAL',
                autoAcceptLowerBetSlipPriceChanges: false
            },

            initialize: function(){
                _.bindAll(this, 'parse', 'onLoadError', 'onSaveSuccess', 'onSaveError', 'onLogin');

                this.vent = ctx.get('vent');
                this.commands = ctx.get('commands');
                this.sessionModel = ctx.get('sessionModel');
                this.on('change', this.save);

                this.vent.bind('session:loggedin', this.onLogin);
            },

            onLogin: function() {
                this.fetch();
            },

            fetch: function() {
                this.commands.execute('command:getAccountPrefs')
                    .done( this.parse )
                    .fail( this.onLoadError );

            },

            parse: function(response){
                var data;

                if (_.has(response, 'data')) {
                    data = response.data;

                    if(!data.autoAcceptLowerBetSlipPriceChanges){
                        data.autoAcceptLowerBetSlipPriceChanges = "";
                        data.autoAcceptLowerBetSlipPriceChanges.default = "";
                    }

                    this.set({
                        'selectedLocale': data.locale.default,
                        'selectedOddsType': data.oddsType.default,
                        'autoAcceptLowerBetSlipPriceChanges': data.autoAcceptLowerBetSlipPriceChanges.default
                    }, {silent: true});

                    this.vent.trigger('preferences:load');
                } else {
                    this.vent.trigger('preferences:loadError');
                }
            },

            save: function(){
                var json = this.constructPrefObj();

                if (this.sessionModel.isLoggedIn()) {
                    this.commands.execute('command:setAccountPrefs', json)
                    .done( this.onSaveSuccess )
                    .fail( this.onSaveError );
                }
            },

            // Prepare model to be persisted
            constructPrefObj: function(){
                var obj = {
                    oddsType:     {default: this.get('selectedOddsType')},
                    locale:       {default: this.get('selectedLocale')},
                    autoAcceptLowerBetSlipPriceChanges : {default: this.get('autoAcceptLowerBetSlipPriceChanges')}
                };

                var data = JSON.stringify({data: obj});
                return data;
            },

            onLoadError: function(){
                this.vent.trigger('preferences:loadError');
            },

            onSaveSuccess: function(){
                this.vent.trigger('preferences:save');
            },

            onSaveError: function(){
                this.vent.trigger('preferences.saveError');
            }
    });
});


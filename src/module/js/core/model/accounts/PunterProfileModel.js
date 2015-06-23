/**
 * Created by paul Howe on 21/01/2015.
 */
define([
        'backbone',
        'core/model/accounts/Punter'
    ],
    function (Backbone, Punter) {
        return Backbone.Model.extend({

            dependencies: 'vent, commands',
            defaults: {
                punter: null
            },


            /**
             * @param evts
             */
            ready: function () {
                //_.bindAll(this, 'onSessionStarted');
                //this.vent.on('session:loggedin', this.onSessionStarted);
            },

            initialize: function (options) {
                this.punter = new Punter();
            },


            parsePunterProfile: function (punterProfile) {
                this.punter = new Punter(punterProfile);
                this.trigger("dataComplete");
            }


        });
    });

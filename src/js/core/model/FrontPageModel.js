/**
 * Created by Jamie on 10/09/2014.
 */
define([
	'core/collection/EventsCollection',
	'core/model/KeyMarketsModel'
],
function(EventsCollection) {
    return Backbone.Model.extend({


        schedules: [],
        TopCoupons: new EventsCollection(),
        defaults: {
            sports: []
        },


        /**
         *
         */
        initialize: function() {
            _.bindAll(this, 'onLocaleChange', 'onSportChange', 'parseQuickLinks', 'parseFrontLinks');
            this.listenTo(App.vent, 'globals:localeChange', this.onLocaleChange);
            this.listenTo(App.vent, 'globals:sportChange', this.onSportChange);
            this.onLocaleChange(App.Globals.locale);
            this.onSportChange(App.Globals.sport);
        },


        /**
         * When the locale changes, we need to re-load the front page
         * schedule in order to update with the required localizations
         * @param locale
         */
        onLocaleChange: function(locale) {
            switch(App.Config.client) {
                case 'pokerstars':
                case 'baba':
                    this.onPokerstarsLocaleChange(locale);
                    break;
                case 'k8':
                    this.onBetEastLocaleChange(locale);
                    break;
                default:
                    this.onVanillaLocaleChange(locale);
                    break;
            }
        },


        /**
         * @param locale
         */
        onVanillaLocaleChange: function(locale) {
            var that = this;
			// TODO
            //this.commands.execute('command:getRegionalSports')
            //    .done(function(resp) {
            //        that.set({sports: resp.SportTypes.sports});
            //    });
            //
            //this.commands.execute('command:getFrontPageSchedule');
        },


        /**
         *
         */
        onPokerstarsLocaleChange: function() {
            //var sports = this.get('sports');
            //if (!!sports.length) {
            //    Backbone.history.loadUrl(Backbone.history.fragment);
            //}
            //
            //else {
            //var that = this;
			// TODO
            //this.commands.execute('command:getRegionalSports')
            //    .done(function(resp) {
            //        that.set({sports: resp.SportTypes.sports});
            //        that.set({loaded: true});
            //    });
            //}
            //
            //this.commands.execute('command:getFrontPageSchedule', '', true, false);
        },


        /**
         * When the sport changes, we need to re-load the sport schedule
         * @param sport
         */
        onSportChange: function(sport) {
            var params = [sport];

            if (App.Config.client == "baba" || App.Config.client == "mybet") {
                ///params = [sport, '', '', 'false'];
                this.commands.apply('command:getSportSchedule', params);
                this.commands.execute('command:getSportTree', App.Globals.sport);
                return;
            }

            if (App.Config.client != 'pokerstars')
                this.commands.apply('command:getSportSchedule', params);
        },


        /**
         * @param frontPageSchedule
         */
        parseSchedule: function(frontPageSchedule) {
            _.each(frontPageSchedule.sports, function(sport) {
                var model = this.getSchedule(sport.code);
                model.clearFrontLinks();
                model.setInplay(sport.inplay, true);
                model.setPrematch(sport.prematch, true);
                model.setCompetitions(sport.competitions.category);
                model.setCoupons(sport.coupons.coupon);
            }, this);

            this.parseQuickLinks(frontPageSchedule.quickLinks);
            this.parseFrontLinks(frontPageSchedule.frontLinks);
            this.updateComplete();
        },

        /**
         * @param quickLinks
         */
        parseQuickLinks: function(quickLinks) {
            // reset top coupons each time we parse quicklinks
            this.TopCoupons = new EventsCollection();

            // add canned 'Todays Football/Tennis' quicklinks
            this.addCannedQuickLink('SOCCER', 998);
            this.addCannedQuickLink('TENNIS', 999);

            var model;
            _.each(quickLinks, function(ql) {

                if (_.has(ql, 'event')) {
                    model = this.TopCoupons.get(ql.event.id);
                    if (_.isUndefined(model)) {

                        ql.sport = ql.event.sport;
                        ql.name = ql.event.name;
                        ql.id = ql.event.id;
                        ql.isEvent = true;

                        ql.type = 'event';
                        this.TopCoupons.add(ql);
                    }
                }

                if (_.has(ql, 'competition')) {

                    model = this.TopCoupons.get(ql.competition.id);
                    if (_.isUndefined(model)) {

                        ql.id = ql.competition.id;
                        ql.name = ql.competition.name;
                        ql.isEvent = false;
                        ql.type = 'competition';

                        this.TopCoupons.add(ql);
                    }
                }

            }, this);
        },


        /**
         * Adds a canned quicklink to TopCoupons
         * @param sport
         * @param id
         */
        addCannedQuickLink: function(code, id) {
            if (!!this.TopCoupons.get(id)) return;

            var name = App.translator.translate(code);
            var title = App.translator.translateAndReplaceToken("TODAYS_SPORT" , name);
            code = code.toUpperCase();

            this.TopCoupons.add({name: title, sport: code, code: code, type: 'canned', id: id});
        },


        /**
         * @param frontLinks
         */
        parseFrontLinks: function(frontLinks) {
            _.each(frontLinks, function(link) {
                var schedule = this.getSchedule(link.sport);
                schedule.addFrontLink(link.event);
            }, this);
        },


        /**
         * @param sport
         */
        getSchedule: function(sport) {
            // find existing schedule for sport
            var schedule = _.find(this.schedules, function(schedule){
                var scheduleCodes = schedule.getSportCodes();
                var lowerSportCode = sport.toLowerCase();
                return scheduleCodes == lowerSportCode;
            });

            // if one doesn't exist, create it and add
            if (_.isUndefined(schedule)) {
                schedule = ctx.get('frontScheduleModel');
                schedule.setSportCodes(sport.toLowerCase());
                ctx.get('KeyMarketsModel').onSportChange(sport);
                this.schedules.push(schedule);
            }

            return schedule;
        },


        /**
         * Return the available, Matrix driven sports list
         */
        getSports: function() {
            return _.map(this.schedules, function(schdl) {
                return schdl.get('sportCodes');
            });
        },


        /**
         *
         */
        updateComplete: function() {
            this.trigger("updateComplete", {});
        }
    });
});

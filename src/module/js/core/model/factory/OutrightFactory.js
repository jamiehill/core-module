/**
 * Created by jamie on 2/6/15.
 */
define([
    'marionette',
    'core/util/HrefUtil',
    'core/collection/CompetitionsCollection',
    'core/model/Competition',
	'core/model/EventCache'
],
function(Marionette, HrefUtil, CompetitionsCollection, Competition, eventCache) {
    var Collection = Backbone.Collection.extend({
        comparator: 'eventTime'
    });
    return Marionette.Controller.extend({


        deferred: null,
        outrights: {},


        /**
         * @param options
         */
        initialize: function() {
            this.collection = new Collection();
            this.model = new Backbone.Model();
            this.cache = eventCache;
        },


        /**
         * @param eventId
         */
        fetch: function(callback) {
            var sport = App.Globals.sport.toLowerCase(),
                that = this;

            // daily list for current sport not yet loaded...
            if (!_.has(this.outrights, sport)) {

                // if they're in the process of being loading, hijack the current
                // deferred object to populate the collection once resolved
                if (this.deferred) {
                    this.deferred.done(function(){
                        var outrights = that.populateCollection(sport);
                        if (callback) callback(outrights);
                    });
                    return;
                }

                // otherwise initialise the load ourselves
                else {
                    this.loadOutrights(sport)
                        .done(function() {
                            var outrights = that.populateCollection(sport);
                            if (callback) callback(outrights);
                        });
                    return;
                }
            }

            var outrights = this.populateCollection(sport);
            if (callback) callback(outrights);
        },


        /**
         * Loads the promotions for the given sport
         * @param sport
         * @param max
         * @returns {*}
         */
        loadOutrights: function(sport, max) {
            this.deferred = $.Deferred();
            var that = this;

			// TODO

			//App.Service
			//	.getRegionalOutrights(App.Globals.sport.toUpperCase())
			//	.done(function(resp){

            //ctx.get('apiService')
            //    .getRegionalOutrights(App.Globals.sport.toUpperCase())
            //    .done(function(resp){
            //        if (_.has(resp, 'Category')) {
            //            that.parseOutrights(resp.Category.competition, sport);
            //        }
            //
            //        that.deferred.resolve();
            //        that.deferred = null;
            //    });

            return this.deferred;
        },


        /**
         * Return the outrights for the current sport
         * @returns {Backbone.Collection.models|*}
         */
        getOutrights: function(sport) {
            sport = (sport || App.Globals.sport).toLowerCase();
            return this.outrights[sport].models;
        },


        /**
         * Get the country for a specific league
         * @param leagueId
         * @returns {*}
         */
        getCountryForLeague: function(leagueId) {
            var league  = this.getLeague(leagueId),
                country = league.get('parent');
            return country;
        },


        /**
         * Returns the league by it's id
         * @param leagueId
         * @returns {*}
         */
        getLeague: function(leagueId) {
            if (_.isEmpty(leagueId)) return this.getDefaultLeague();
            var league, countries = this.getOutrights();
            _.any(countries, function(cntry) {
                _.any(cntry.Children.models, function(lge) {
                    if (lge.id == leagueId) {
                        league = lge;
                        return true;
                    }
                })
            });
            return league;
        },


        /**
         * Returns the default (first) country in the list
         * @returns {*}
         */
        getDefaultCountry: function() {
            var countries = this.getOutrights();
            return _.first(countries);
        },


        /**
         * @param sport
         * @returns {*}
         */
        getDefaultLeague: function() {
            var country = this.getDefaultCountry();
            if (!country) return null;
            return country.Children.at(0);
        },


        /**
         * @param sport
         */
        populateCollection: function(sport) {
            var compId = HrefUtil.getComponent(2);

            var league = this.getLeague(compId);
            if (!league) {
                this.model.set({event: null});
                this.collection.reset([]);
                return [];
            }

            var outrights = league.Children.models,
                event = _.first(outrights);

            this.collection.reset(event.Markets.models);
            this.model.set({event: event});

            return outrights;
        },


        /**
         * @param resp
         * @param sport
         */
        parseOutrights: function(comps, sport){
            sport = sport.toLowerCase();

            var countries = _.reduce(comps, function(memo, comp) {
                var compId = comp.categoryId,
                    compName = comp.categoryName;

                // get the country from countries or creat a new one
                var country = memo[compId];
                if (country == undefined)
                    country = memo[compId] = this.store({id: compId, name: compName, level: 'country'});

                // create the league and add to country
                var league = this.store({id: comp.id, name: comp.name, level: 'league', parent: country});
                var events = _.map(comp.event, function(e) {
                    _.extend(e, {parent: league});
                    return this.cache.updateEvent(e);
                }, this);

                country.Children.add(league);
                league.Children.add(events);

                return memo;
            }, {}, this);


            var cunts = _.values(countries);
            this.outrights[sport] = new CompetitionsCollection(cunts);
        },


        /**
         * @param data
         * @param obj
         * @returns {Competition}
         */
        store: function(data, obj) {
            var comp = new Competition(data);
            comp.Children = new CompetitionsCollection();
            comp.Children.comparator = undefined;
            return comp;
        }
    });
});



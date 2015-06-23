/**
 * Created by Jamie on 27/10/2014.
 */
define([
    'backbone',
    'core/collection/CompetitionsCollection',
    'core/model/Competition'
],
function(Backbone, CompetitionsCollection, Competition) {
    return Backbone.Model.extend({
        dependencies: 'cache=eventCache, vent',


        Sports: {},
        Countries: {},
        Competitions: {},
        Leagues: {},
        allLeagues: {},


        /**
         *
         */
        initialize: function() {
            _.bindAll(this, 'getCompetition', 'getCountry', 'getCountries', 'getLeague', 'getSport');
        },


        /**
         * @param countries
         */
        parseCompetitions: function(countries, s) {
            var country, league, event, that = this;
            var sport = this.getSport(s);

            // iterate through all countries
            _.each(countries, function(countryData){
                _.extend(countryData, {level: 'country'});

                // get - or add - country node
                if (!_.has(that.Competitions, countryData.id))
                    that.Competitions[countryData.id] = new Competition(_.omit(countryData, 'competition'));

                if (!_.has(sport, 'Countries'))
                    sport.Countries = {};

                if (!_.has(sport.Countries, countryData.id))
                    sport.Countries[countryData.id] = that.Competitions[countryData.id];

                country = that.Competitions[countryData.id];
                country.allLeagues = countryData.competition;

                // iterates through all leagues in the country,
                // assigning the country as the parent to the league
                _.each(countryData.competition, function(leagueData){
                    _.extend(leagueData, {level: 'league', parent: country});

                    league = that.Competitions[leagueData.id];
                    if (league == null) {
                        league = new Competition(_.omit(leagueData, 'event'));
                        that.Competitions[leagueData.id] = league;
                        country.Children[leagueData.id] = league;
                    }

                });
            });

            this.trigger('updateComplete');
        },


        /**
         * Top level competition retrieval, for both countries and leagues
         * @param id
         * @returns {*}
         */
        getCompetition: function(id) {
            return this.Competitions[id];
        },


        /**
         * @param id
         */
        getCountry: function(id) {
            return this.getCompetition(id);
        },


        /**
         * @param country
         */
        getCountries: function(spt) {
            spt = (spt || App.Globals.sport).toLowerCase();
            var sport = this.Sports[spt],
                countries = sport ? _.values(sport.Countries) : {};
            return _.sortBy(countries, function(c) {
                return c.get('name');
            })
        },


        /**
         * @param id
         * @returns {*}
         */
        getLeague: function(id) {
            return this.getCompetition(id);
        },


        /**
         * @param country
         */
        getLeagues: function(countryId) {
            if (countryId)
                return this.Countries[countryId].Children;
            // reduce all countries' children into an array
            return _.reduce(this.Countries, function(memo, country){
                return memo.concat(_.pluck(country, 'Children'));
            }, []);
        },


        /**
         * @param countryId
         * @returns {*}
         */
        getCountryById: function(countryId) {
            var sportCode = App.Globals.sport.toLowerCase();
            var sport = this.Sports[sportCode],
                countries = sport ? _.values(sport.Countries) : {};

            var country = _.filter(countries, function (country) {
                return country.id == countryId;
            });

            return country;
        },


        /**
         * @param countryId
         * @returns {*}
         */
        getCountryByIndex: function(index) {
            var countries = this.getCountries();
            return !!countries.length ? countries[0].id : '';
        },


        /**
         * @param sport
         * @returns {*}
         */
        getSport: function(sport) {
            sport = (sport || App.Globals.sport).toLowerCase();

            if (_.isUndefined(this.Sports))
                this.Sports = {};

            if (!_.has(this.Sports, sport))
                this.Sports[sport] = {};

            return this.Sports[sport];
        }
    });
});

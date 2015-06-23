/**
 * Created by jamie on 2/7/15.
 */
define([
    'core/util/HrefUtil'
],
function(HrefUtil) {
    var All = {name: 'All Markets' , displayOrder: -999, types: []};
    return Backbone.Model.extend({


        groups: {},
        deferred: null,
        defaults: {
            groups: [],
            currentGroup: All
        },


        /**
         *
         */
        initialize: function() {
            All.name = App.translator.translate("ALL_MARKETS");

            this.service = ctx.get('apiService');
            this.vent = ctx.get('vent');
            this.listenTo(this.vent, 'globals:sportChange', this.loadGroups);
            this.listenTo(this.vent, 'globals:localeChange', this.onLocaleChange);

            if (App.Globals.sport == HrefUtil.getComponent(0)) {
                this.loadGroups();
            }
        },


        /**
         * @param name
         * @param sport
         */
        setGroup: function(name, sport) {
            var groups = this.groups[sport.toLowerCase()],
                group  = !name ? _.first(group) : groups[name];
            this.set({currentGroup: group});
        },


        /**
         * Loads the market groups if not previously loaded
         * @param sport
         * @returns {*}
         */
        loadGroups: function(sport) {
            sport = (sport || App.Globals.sport).toLowerCase();
            var that = this;

            if (!_.has(this.groups, sport) && !this.deferred) {
                that.deferred = $.Deferred();
                ctx.get('apiService')
                    .getSportDisplayTemplate(sport.toUpperCase())
                    .done(function(resp) {
                        that.parseGroups(resp.SportDisplayTemplate.markettemplate, sport);
                        // resolve and destroy
                        that.deferred.resolve();
                        that.deferred = null;
                    })
                    .fail(function(er) {
                        var error = er;
                    })
            }
                return that.deferred;
        },


        /**
         * Parse all market types into objects for each market group
         * @param templates
         * @param sport
         */
        parseGroups: function(templates, sport) {
            sport = sport.toLowerCase();
            var group;

            if (!_.has(this.groups, sport))
                this.groups[sport] = {};

            // add and 'All' group first
            this.groups[sport][All.name] = All;

            _.each(templates, function(template) {
                _.each(template.groups, function(g) {
                    // if the group doesn't exist create it
                    if (!_.has(this.groups[sport], g.code)) {
                            this.groups[sport][g.code] = {name: g.code, displayOrder: g.displayOrder, types: [], count: 0, subtype: template.subtype};
                    }
                    // retrieve the group
                    group = this.groups[sport][g.code];

                    if (!_.contains(group.types, template.type))
                        group.types.push(template.type);

                    // add all types to the 'All' group
                    this.groups[sport][All.name].types.push(template.type);

                }, this);
            }, this);

            // sort on displayOrder
            _.sortBy(this.groups[sport], function(group) {
                return group.displayOrder;
            });
        },


        /**
         * Filter groups without matching markets
         * @param event
         */
        getGroups: function(event) {
            if (!event) return [];

            // if is the same event, don't do all that
            // expensive parsing again, just return the groups
            var currentEvent = this.get('currentEvent');
            if (currentEvent && currentEvent.id == event.id) {
                return this.get('groups');
            }

            var code  = event.get('code').toLowerCase(),
                sport = _.clone(this.groups[code]),
                allMarkets = [];

            var types  = event.Markets.byDisplayed().pluck('type');
            var groups = _.reduce(sport, function(memo, g) {
                var newGroup = _.defaults({}, g);
                newGroup.types = _.reduce(newGroup.types, function(m, t) {
                    _.each(types, function(tt) {
                        if (tt == t) m.push(t);
                    });
                    return m;
                }, [], this);

                if (!!newGroup.types.length) {
                    allMarkets = allMarkets.concat(newGroup.types);
                    memo.push(newGroup);
                }

                return memo;
            }, [], this);

            this.setTotalMarkets(groups);
            this.set({currentEvent: event.id});
            this.set({currentGroup: _.first(groups)});
            this.set({groups: groups});

            return groups;
        },


        /**
         * @param groups
         * @returns {*}
         */
        setTotalMarkets: function(groups) {
            if (!groups.length) return;
            groups[0].types = _.reduce(groups, function(memo, g) {
                if (g.name != All.name) {
                    memo = memo.concat(g.types);
                }
                return memo;
            }, [], this);
        },


        /**
         * @param event
         * @returns {*}
         */
        getGroup: function(event) {
            var groups = this.getGroups(event);
            return _.first(groups);
        },

        onLocaleChange: function(event) {
            this.groups = {};
            var transMarketNameAll = App.translator.translate("ALL_MARKETS");
            All = {name: transMarketNameAll , displayOrder: -999, types: []};
            this.deferred = null;
            this.loadGroups();
        },
        /**
         * @param sport
         */
        onSportChange: function(sport) {
            sport = (sport || App.Globals.sport).toUpperCase();
            this.loadGroups(sport);
        }
    });
});

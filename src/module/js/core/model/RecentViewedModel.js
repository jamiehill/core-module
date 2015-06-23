/**
 * Created by ianrotherham on 22/11/2014.
 */

define(function() {
        return Backbone.Model.extend({

            dependencies: 'cache=eventCache, vent, frontPageModel',

            defaults: {
                recentlyViewedCompetitions :[]
            },


            /**
             *
             */
            ready: function() {
                _.bindAll(this, 'onRecentlyViewedChange');
                this.compFactory = ctx.get('competitionFactory');
                this.listenTo(this.vent, "recentlyViewed:change", this.onRecentlyViewedChange);
            },

            onRecentlyViewedChange: function(recentViewedObj) {

                var schedule = this.frontPageModel.getSchedule(recentViewedObj.sport);
                var recentViewedName = '';


                if (recentViewedObj.target == 'COMPETITION') {
                    var comp = this.compFactory.getCompetition(recentViewedObj.id);
                    if (!_.isUndefined(comp) && !_.isNull(comp)) {
	                    if (!_.isUndefined(comp.attributes)) {
                        	recentViewedName = comp.attributes.name;
                        }
                    }
                    else {
                        recentViewedName = "";
                    }
                }
                else if (recentViewedObj.target == 'EVENT') {
                    var event = this.cache.getEvent(recentViewedObj.id);
                    if (event) {
                        var compId = event.attributes.compId;
                        recentViewedName = event.attributes.compName;
                        recentViewedObj.id = compId;
                    }
                }

                var recentObj = {};
                recentObj.sport = recentViewedObj.sport;
                recentObj.name = recentViewedName;
                recentObj.type = recentViewedObj.target;
                recentObj.id = recentViewedObj.id;

                if ( recentViewedName != "") {
                    this.addToRecentlyViewed(recentObj);
                }
            },

            addToRecentlyViewed: function(recentObj) {
                var recents = this.getRecentlyViewed();
                var addToList = true;

                for (i=0; i<recents.length; i++) {
                    var recent = recents[i];
                    if ( recent.id == recentObj.id ) {
                        addToList = false;
                        break;
                    }
                }

                if (addToList) {
                    recents.unshift(recentObj);
                    this.updateComplete();
                }

            },

            updateComplete: function() {
                this.trigger("updateComplete");
            },

            getRecentlyViewed: function() {
                return this.get('recentlyViewedCompetitions');
            }


        });
    });

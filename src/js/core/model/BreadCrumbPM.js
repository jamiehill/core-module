/**
 * Created by ianrotherham on 08/01/2015.
 */
define(function (require) {
    var Marionette = require('marionette');
    var StringUtil = require('core/util/StringUtil');

    return Marionette.Controller.extend({

        dependencies: 'vent, commands, routeController, competitionModel, eventCache',

        breadCrumb:'',

        ready: function(options) {
            this.listenTo(this.vent, 'router:routeChange', this.onRouteChange);
        },

        onRouteChange: function () {
            var navigatedRoute = arguments[0].toString().split("/");
            navigatedRoute.shift();

            if ( this.isValidRoute(navigatedRoute) || arguments[0] == App.Globals.sport) {
                switch (navigatedRoute[0]) {
                    case 'competition':
                        var compId = navigatedRoute[1];
                        var crumbs = this.getCountryForCompetition(compId);
                        this.setBreadCrumb(crumbs);
                        break;
                    case 'event':
                        var eventId = navigatedRoute[1];
                        var crumbs = this.getEventById(eventId);
                        this.setBreadCrumb(crumbs);
                        break;
                    case 'country':
                        var countryId = navigatedRoute[1];
                        var crumbs = this.getCountryById(countryId);
                        this.setBreadCrumb(crumbs);
                        break;
                    default:
                        var sport =[];
                        this.setBreadCrumb(sport);
                        break;
                }
            }
            else {
                this.setHomeBreadCrumb(sport);
            }
        },

        getBreadCrumb: function() {

	        var capsSport = StringUtil.properCase(App.Globals.sport);
            return this.breadCrumb;
        },

        setHomeBreadCrumb: function() {
            var breadCrumbHtml = "<li><a href='#'>"+App.translator.translate("HOME")+"</li>";
            this.breadCrumb = breadCrumbHtml;
            $('#breadcrumbs').html(this.breadCrumb);
        },


        setBreadCrumb: function(breadcrumbs) {
            this.breadCrumb = "";
            var sport = App.Globals.sport;
            var capsSport = StringUtil.upperCase(sport);
            var breadCrumbHtml = '<li><i class="icon-'+sport+'"></i><a href="#' + sport+'">' + App.translator.translate(capsSport);

            for (var i=0; i<breadcrumbs.length; i++) {
                var crumbObj = breadcrumbs[i];
                breadCrumbHtml += '<a href="#' + sport + '/'+crumbObj.href+'/'+crumbObj.id+'">' +  App.translator.translate(StringUtil.upperCase(crumbObj.name));
            }

            this.breadCrumb = breadCrumbHtml +='</li>';


             if ($(window).width() < 649) { // change breadcrumbs for mobile
				this.breadCrumb = '<li class="back"><a href="javascript:window.history.back()"><i class="icon-chevron-left"></i></a></li> \
							   <li><a href="#">'+App.translator.translate("HOME")+'</a> <a href="#'+capsSport+'">'+capsSport+'</a></li>';
			}




            $('#breadcrumbs').html(this.breadCrumb);


            if ($('#main-inplay').length > 0) {
                $('ul.market-groups').addClass('drop');
            } else {
                $('ul.market-groups').removeClass('drop');
            }
        },

        getEventById: function(id) {
            var event = this.eventCache.getEvent(id);
            var breadCrumb = [];

            if (_.isUndefined(event)) {
                return breadCrumb;
            }

            var compId = event.get("compId");
            var countryArray = this.getCountryForCompetition(compId);

            for (var i=0;i<countryArray.length;i++) {
                var obj = countryArray[i];
                breadCrumb.push(obj);
            }

            var obj = {};
            obj.href = "event";
            obj.name = event.get("name");
            obj.id = event.id;
            breadCrumb.push(obj);
            return breadCrumb;
        },

        getCountryById: function(id) {
            var countryArray = this.competitionModel.getCountryById(id);
            var breadCrumb = [];

            if (_.isUndefined(countryArray)) {
                return breadCrumb;
            }

            for (var i=0;i<countryArray.length;i++) {
                var country = countryArray[i];
                var obj = {};
                obj.href = "country";
                obj.name = country.get("name");
                obj.id = id;
                breadCrumb.push(obj);
            }

            return breadCrumb;
        },

        getCountryForCompetition: function(compId) {
            var competition = this.competitionModel.getCountry(compId);
            var breadCrumb = [];

            if (_.isUndefined(competition)) {
                return breadCrumb;
            }

            var country = competition.get("parent");
            var countryName = country.get("name");
            var countryId = country.id;

            var obj = {};
            obj.href = "country";
            obj.name = countryName;
            obj.id = countryId;
            breadCrumb.push(obj);

            var obj2 = {};
            obj2.href = "competition";
            obj2.name = competition.get("name");
            obj2.id = compId;
            breadCrumb.push(obj2);

            return breadCrumb;
        },

        isValidRoute: function(navigatedRoute) {
            if (navigatedRoute.length > 0) {
                var appRoutes = this.routeController.appRoutes;
                var myKeys = _.keys(appRoutes);
                var base = "/"+navigatedRoute[0]+"/";
                var regex = new RegExp(base, 'i');

                for (var i=0; i < myKeys.length ; i++) {
                    var n = myKeys[i].search(regex);
                    if (n > -1) {
                        return true;
                    }
                }
            }
            return false;
        }


    });
});

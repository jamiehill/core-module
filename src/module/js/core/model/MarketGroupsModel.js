define(function() {
            return Backbone.Model.extend({

                defaults: {
                    sportCodes:null,
                    marketGroups:[],
                    displayTemplates:[]
                },


                /**
                 *
                 */
                initialize: function() {
                    this.model = ctx.get('displayTemplateModel');
                    this.listenTo(this.model, 'change:templates', this.onMarketGroups);
                },


                /**
                 * @param code
                 */
                setSportCodes: function(code) {
                    this.set('sportCodes', code);
                },


                /**
                 * @returns {Mixed|*}
                 */
                getMarketGroup: function() {
                    return this.get('marketGroups');
                },


                /**
                 * @returns {Mixed|*}
                 */
                getDisplayTemplates: function() {
                    return this.get('displayTemplates');
                },


                /**
                 * @param templateGroups
                 */
                onMarketGroups: function() {
                    var templates = this.model.get('templates');
                    this.set('displayTemplates', templates);

                    var collection = [];
                    var groupsArray = [];

                    for (var i = 0; i < templates.length; i++)  {
                        var groupObj = templates[i];
                        for (var j = 0; j < groupObj.groups.length; j++) {
                            var groupName = groupObj.groups[j].code;
                            groupsArray[groupName] = groupName;
                        }
                    }

                    var allObject = {};
                    allObject.name = App.translator.translate("ALL_MARKETS");
                    allObject.type = 'ALL';
                    allObject.count = 0;
                    allObject.marketTypes = [];
                    collection.push(allObject);

                    for (var group in groupsArray) {
                        var myObject = {};
                        myObject.name = group;
                        myObject.type = group;
                        myObject.count = 0;
                        myObject.marketTypes = [];
                        collection.push(myObject);
                    }

                    if(collection.length > 0){
                    	//Hide date menu if other filters available
	                    // $("#date-nav").hide();
                    }

                    this.set('marketGroups', collection);
                }
            });
        });

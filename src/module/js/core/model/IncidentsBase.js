define(['backbone'
    ],
    function (Backbone) {
        return Backbone.Model.extend({

            initialize: function(eventId) {
                this.set('eventId',eventId);
            },

            setPropertyChanged: function(valueChanged) {
                this.set("propertyChanged", valueChanged, {"silent":true});
            },

            getPropertyChanged: function() {
                return this.get('propertyChanged');
            },

            populate: function(data){
                var scope = this;
                _.each(data, function(val, key){
                    if (_.has(scope.defaults, key))
                        if (key == 'type') {
                            scope.parseIncidentType(val,data);
                        }
                        scope.setDefaults(key,val);
                });

                this.populateInplayAttributes(data);
            },

            setDefaults: function(key, val) {
                this.set(key, val);
                this.set('propertyChanged',true, {"silent":true});
            },

            populateInplayAttributes: function(data) {
                var scope = this;
                if (_.has(data, 'attribute')) {
                    var map = _.clone(scope.get("inplayAttributes"));
                    var mapChanged = false;
                    var goalScored = false;
                    _.each(data.attribute, function(obj){
                        if (_.has(map, obj.name)) {
                            if (map[obj.name] != obj.value) {
                                map[obj.name] = obj.value;
                                if (obj.name == 'GOAL_SCORE') {
                                    goalScored = true;
                                }
                                mapChanged = true;
                            }
                        }
                    });
                    if (mapChanged) {
                        this.set("propertyChanged",true, {"silent":true});
                        this.set("inplayAttributes", map);
                        if (goalScored) {
                            scope.trigger("onGoalScoreChange",scope);
                        }
                    }
                }

                if (_.has(data, 'participants')) {
                    var playersObj = data.participants;
                    if (_.size(playersObj.participant) > 0) {
                        var player1 = playersObj.participant[0];
                        var player2 = playersObj.participant[1];
                        scope.setParticipants(player1.name,player2.name);
                    }
                }
            },

            getParticpantA: function () {
                var player = this.get('inplayAttributes').PARTICIPANT_A;
                return player;
            },

            getParticpantB: function () {
                var player = this.get('inplayAttributes').PARTICIPANT_B;
                return player;
            },


            setParticipants: function(participantA, participantB) {
                var inplayAttribs = _.clone(this.get("inplayAttributes"));
                inplayAttribs["PARTICIPANT_A"] = participantA;
                inplayAttribs["PARTICIPANT_B"] = participantB;
                this.set("inplayAttributes", inplayAttribs, {"silent":true});
            }

        });
    });
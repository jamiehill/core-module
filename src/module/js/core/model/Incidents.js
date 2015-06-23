define(['backbone',
        'core/model/IncidentsBase'
],
function (Backbone, IncidentsBase) {
    return IncidentsBase.extend({

        defaults: {
            id: 0,
            eventId : 0,
            sport:'',
            type:'',
            side:'',
            period:'',
            matchTimeInSecs:'',
            Corner:'',

            propertyChanged:false, //different to the backbone internal changed.,

            typeAttributes: {
                id:0,
                PeriodStart:'',
                ShotBlocked:'',
                Goal:'',
                Kickoff:'',
                ShotOffTarget:'',
                ShotOnTarget:'',
                GoalKick:'',
                Danger:'',
                DangerousFreeKick:'',
                Foul:'',
                OffSide:'',
                FreeKick:'',
                Safe:'',
                Attack:'',
                ThrowIn:'',
                Restart:'',

                Corner:'',
                YellowCard:'',
                Penalty:'',
                PenaltyMissed:'',
                RedCard:''
            },

            inplayAttributes: {
                PARTICIPANT_A:'',
                PARTICIPANT_B:'',
                SCORER:'',
                GOAL_TYPE:'',
                GOAL_SCORE:'0-0',
                PENALTY_SCORE:'',
                REDCARD_SCORE:'',
                YELLOWCARD_SCORE:'',
                CORNER_SCORE:'',
                OFFSIDE_SCORE:'',

                //OPTIONAL ATTRIBUTES.
                //eg If a RedCard could be issues true. If not given a false.
                PLAYER:null,
                POSSIBLE:null,
                SUB:null,
                REPLACED:null,
                LINEUP:null,//Squad line-up
                SUBSTITUTE:null, //Boys on the bench,
                PERTAINING_TO:null, //For incident type "Commentary" will have an Attribute "TEXT"
                                    //only process if it has optional attrib PERTAINING_TO.
                PHOTO_POSITIONS:null,
                REMAINING_TIME:null,
                MATCH_TIME:null
            }
        },

        resetDefaults: function() {
            this.set('sport','', {"silent":true});
            this.set('type','', {"silent":true});
            this.set('side','', {"silent":true});
            this.set('period','', {"silent":true});
            this.set('propertyChanged',false, {"silent":true});
            this.set('matchTimeInSecs','', {"silent":true});
        },


        parseIncidentType: function(type, options) {

        },

        getOffsideScore: function(formatArray) {
            var offsideScore = this.get('inplayAttributes').OFFSIDE_SCORE;
            if (offsideScore == '') {
                offsideScore = '0-0';
            }

            if (offsideScore.indexOf(':') > -1) {
                var defaultFormat = offsideScore.replace(':','-');
                offsideScore = defaultFormat;
            }
            if (formatArray == true) {
                return offsideScore.split("-");
            }

            return offsideScore;
        },

        getCornerScore: function(formatArray) {
            var cornerScore = this.get('inplayAttributes').CORNER_SCORE;
            if (cornerScore == '') {
                cornerScore = '0-0';
            }

            if (cornerScore.indexOf(':') > -1) {
                var defaultFormat = cornerScore.replace(':','-');
                cornerScore = defaultFormat;
            }
            if (formatArray == true) {
                return cornerScore.split("-");
            }

            return cornerScore;
        },

        getPenaltyScore: function(formatArray) {
            var penaltyScore = this.get('inplayAttributes').PENALTY_SCORE;
            if (penaltyScore == '') {
                penaltyScore = '0-0';
            }

            if (penaltyScore.indexOf(':') > -1) {
                var defaultFormat = penaltyScore.replace(':','-');
                penaltyScore = defaultFormat;
            }
            if (formatArray == true) {
                return penaltyScore.split("-");
            }

            return penaltyScore;
        },

        getRedCardScore: function(formatArray) {
            var redCardScore = this.get('inplayAttributes').REDCARD_SCORE;
            if (redCardScore == '') {
                redCardScore = '0-0';
            }

            if (redCardScore.indexOf(':') > -1) {
                var defaultFormat = redCardScore.replace(':','-');
                redCardScore = defaultFormat;
            }

            if (formatArray == true) {
                return redCardScore.split("-");
            }

            return redCardScore;
        },

        getYellowCardScore: function(formatArray) {
            var yellowCardScore = this.get('inplayAttributes').YELLOWCARD_SCORE;
            if (yellowCardScore == '') {
                yellowCardScore = '0-0';
            }

            if (yellowCardScore.indexOf(':') > -1) {
                var defaultFormat = yellowCardScore.replace(':','-');
                yellowCardScore = defaultFormat;
            }
            if (formatArray == true) {
                return yellowCardScore.split("-");
            }

            return yellowCardScore;
        },

        getGoalScore: function () {
            var goalScore = this.get('inplayAttributes').GOAL_SCORE;
            if (goalScore == '') {
                goalScore = '0-0';
            }

            if (goalScore.indexOf(':') > -1) {
                var defaultGoalFormat = goalScore.replace(':','-');
                goalScore = defaultGoalFormat;
            }

            return goalScore;
        },

        setGoalScore: function(score) {
            var inplayAttribs = _.clone(this.get("inplayAttributes"));
            inplayAttribs["GOAL_SCORE"] = score;
            this.set("inplayAttributes", inplayAttribs, {"silent":true});
        },

        getShotsOnTargetScore: function() {
	      	 return [0, 0];

        },

        getShotsOffTargetScore: function() {
	         return [0, 0];
        },


    });
});

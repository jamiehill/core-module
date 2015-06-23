/**
 * Created by ianrotherham on 02/02/2015.
 */
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
                playerInService:'PLAYER_A',

                inplayAttributes: {
                    PARTICIPANT_A:'',
                    PARTICIPANT_B:'',

                    BEST_OF:3,// or 5
                    SET_SCORE:'0:0', //Current SET
                    SET_SCORE_1:'0:0',
                    SET_SCORE_2:'0:0',
                    SET_SCORE_3:'0:0',
                    SET_SCORE_4:'0:0',
                    SET_SCORE_5:'0:0',

                    GAME_SCORE:'0:0',
                    POINT_SCORE:'0:0',
                    SET_NUMBER:0,
                    GAME_NUMBER:'0:0'
                },

                typeAttributes: {
                    id:0,
                    Service:'',
                    ServiceFault:'',
                    PeriodStart:'',
                    Score:'',
                    ScoreType:'',
                    CoinTossWinner:'',
                    Finished:''

                },

                propertyChanged:false //different to the backbone internal changed.
            },

            resetDefaults: function() {
                this.set('sport','', {"silent":true});
                this.set('type','', {"silent":true});
                this.set('side','', {"silent":true});
                this.set('period','', {"silent":true});
                this.set('propertyChanged',false, {"silent":true});
                this.set('matchTimeInSecs','', {"silent":true});
            },

            populateInplayAttributes: function(data) {
                var scope = this;
                if (_.has(data, 'attribute')) {
                    var map = _.clone(scope.get("inplayAttributes"));
                    var mapChanged = false;
                    _.each(data.attribute, function(obj){
                        if (_.has(map, obj.name)) {
                            if (map[obj.name] != obj.value) {
                                map[obj.name] = obj.value;


                                if (obj.name == 'GAME_SCORE') {
                                    var period = scope.get('period');
                                    switch( period  ) {
                                        case '1SET':
                                            map['SET_SCORE_1'] = obj.value;
                                            break;
                                        case '2SET':
                                            map['SET_SCORE_2'] = obj.value;
                                            break;
                                        case '3SET':
                                            map['SET_SCORE_3'] = obj.value;
                                            break;
                                        case '4SET':
                                            map['SET_SCORE_4'] = obj.value;
                                            break;
                                        case '5SET':
                                            map['SET_SCORE_5'] = obj.value;
                                            break;
                                    }
                                }
                                if (obj.name == 'POINT_SCORE') {
                                    var pointArray = obj.value.split(':');
                                    scope.setPlayerPointScore( pointArray[0], pointArray[1] );
                                }

                                if (obj.name == 'SET_SCORE') {
                                    //var setArray = obj.value.split(':');
                                }

                                mapChanged = true;
                            }
                        }
                    });

                    if (_.has(data, 'participants')) {
                        var playersObj = data.participants;
                        if (_.size(playersObj.participant) > 0) {
                            var player1 = playersObj.participant[0];
                            var player2 = playersObj.participant[1];
                            scope.setParticipants(player1.name,player2.name);
                        }
                    }

                    if (mapChanged) {
                        this.set("propertyChanged",true, {"silent":true});
                        this.set("inplayAttributes", map);
                    }
                }
            },


            parseIncidentType: function(type, options) {
                var typeAttributes = this.get("typeAttributes");

                if (_.has(typeAttributes, type)) {

                    if (type == 'Score') {
                        if (_.has(options, 'attribute')) {
                            for (var i=0;i<options.attribute.length;i++) {
                                var attrib = options.attribute[i];

                                    switch( attrib.name  ) {
                                        case 'ScoreType':
                                            break;
                                        case 'FINAL_POINT_IN_GAME':
                                            //attrib.value TRUE OR FALSE
                                            break;
                                        case 'SET_SCORE':
                                            //
                                            break;
                                        case 'GAME_SCORE':
                                            //
                                            break;
                                        case 'POINT_SCORE':
                                            break;
                                        case 'SET_NUMBER':
                                            //
                                            break;
                                        case 'GAME_NUMBER':
                                            //
                                            break;
                                }
                            }
                        }
                    }

                    if (type == 'Service') {
                        this.set('playerInService',options.side);
                        this.resetPlayerPointScoresIfComplete();
                    }
                    //console.log('found data '+type+' '+options.id+' '+options.matchTimeInSecs+' '+options.side);
                }
            },


            resetPlayerPointScoresIfComplete: function() {
                var pointScoreArray = this.getPointScore(true);

                if ( pointScoreArray[0] == '50' || pointScoreArray[1] == '50' || pointScoreArray[0] == 'A' || pointScoreArray[1] == 'A' ) {
                    //Game or Set has been won. Reset the Point scores.
                    this.setPlayerPointScore('0','0');
                }
            },

            setPlayerPointScore: function( playerAScore, playerBScore ) {
                var map = _.clone(this.get("inplayAttributes"));
                var player1PointScore = playerAScore;
                var player2PointScore = playerBScore;

                if ( playerAScore == '50' || playerBScore == '50' ) {
                    if ( playerAScore == '40' || playerBScore == '40' ) {
                        //Advantage Player.
                        player1PointScore = playerBScore == '40' ? 'A' : playerAScore;
                        player2PointScore = playerAScore == '40' ? 'A' : playerBScore;
                    }
                }
                map['POINT_SCORE'] = player1PointScore+':'+player2PointScore;
                this.set("inplayAttributes", map, {"silent":true});
            },


            //FIXME change the name of this to implement interface for all models.
            getGoalScore: function () {
                var pointScore = this.get('inplayAttributes').POINT_SCORE;
                var gameScore = this.get('inplayAttributes').GAME_SCORE;
                var setScore = this.get('inplayAttributes').SET_SCORE;

                if (setScore == '') {
                    setScore = '0:0';
                }

                if (gameScore == '') {
                    gameScore = '0:0';
                }

                if (pointScore == '') {
                    pointScore = '0:0';
                }

                return setScore+' '+gameScore+' '+pointScore;
            },

            //FIXME this needs to be changed to the above too. Used in EventModel.
            setGoalScore: function(score) {
                var inplayAttribs = _.clone(this.get("inplayAttributes"));
                inplayAttribs["POINT_SCORE"] = score;
                this.set("inplayAttributes", inplayAttribs, {"silent":true});
            },

            getSetScore: function(formatArray, setNumber) {
                var setScore = '';
                switch(setNumber) {
                    case 0:
                        setScore = this.get('inplayAttributes').SET_SCORE;
                        break;
                    case 1:
                        setScore = this.get('inplayAttributes').SET_SCORE_1;
                        break;
                    case 2:
                        setScore = this.get('inplayAttributes').SET_SCORE_2;
                        break;
                    case 3:
                        setScore = this.get('inplayAttributes').SET_SCORE_3;
                        break;
                    case 4:
                        setScore = this.get('inplayAttributes').SET_SCORE_4;
                        break;
                    case 5:
                        setScore = this.get('inplayAttributes').SET_SCORE_5;
                        break;
                }

                if (setScore == '') {
                    setScore = '0:0';
                }

                if (setScore.indexOf('-') > -1) {
                    var defaultFormat = setScore.replace('-',':');
                    setScore = defaultFormat;
                }

                if (formatArray == true) {
                    return setScore.split(":");
                }

                return setScore;
            },

            getGameScore: function(formatArray) {
                var gameScore = this.get('inplayAttributes').GAME_SCORE;
                if (gameScore == '') {
                    gameScore = '0:0';
                }

                if (gameScore.indexOf('-') > -1) {
                    var defaultFormat = gameScore.replace('-',':');
                    gameScore = defaultFormat;
                }

                if (formatArray == true) {
                    return gameScore.split(":");
                }

                return gameScore;
            },

            getPointScore: function(formatArray) {
                var pointScore = this.get('inplayAttributes').POINT_SCORE;
                if (pointScore == '') {
                    pointScore = '0:0';
                }

                if (pointScore.indexOf('-') > -1) {
                    var defaultFormat = pointScore.replace('-',':');
                    pointScore = defaultFormat;
                }

                var scoreArray = pointScore.split(":");
                var playerAScore = scoreArray[0];
                var playerBScore = scoreArray[1];
                var player1PointScore = playerAScore;
                var player2PointScore = playerBScore;

                if ( playerAScore == '50' || playerBScore == '50' ) {
                    if ( playerAScore == '40' || playerBScore == '40' ) {
                        //Advantage Player.
                        player1PointScore = playerBScore == '40' ? 'A' : playerAScore;
                        player2PointScore = playerAScore == '40' ? 'A' : playerBScore;
                        pointScore = player1PointScore+':'+player2PointScore;
                    }
                }

                if (formatArray == true) {
                    return pointScore.split(":");
                }

                return pointScore;
            }



        });
    });

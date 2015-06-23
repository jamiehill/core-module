define([
        'core/service/SocketService', 'core/service/LongpollService'
    ],
    function(SocketService, LongpollService) {
    return Marionette.Controller.extend({

    	service: null,
        defaults: {
            sessionToken: function() {
                return this.session.getSessionToken();
            },
            application: function() {
                return this.appid;
            }
        },

        /**
         * initiates service based on websocket availability.
         * registers for open and message events from the socket service and then connects.
         */
        initialize: function() {
            this.vent = ctx.get('vent');
            this.session = ctx.get('sessionModel');
            this.appid = ctx.get('appid');

            // if neither socket version are available, or if
            // longpoll has been explicitly request, use longpoll
            var supported = 'MozWebSocket' in window || 'WebSocket' in window,
                requested = _.includes(document.URL, 'stream=lp'),
                useLongpoll = !supported || requested;


            //if (App.Config.client == 'k8') {
            //    useLongpoll = true;
            //}

            this.service  = useLongpoll ? new LongpollService() : new SocketService();
        	this.listenTo(this.service, 'streaming:open', this.requestPublicLogin);
        	this.listenTo(this.service, 'streaming:message', this.publishStreamingMessage);
        	this.service.start();
        },


        keepAlive: function() {
            this.service.keepAlive();
        },

        /**
         * builds the public login object and submits to the service.
         * the service then modifies the request if required (eg: longpoll adding betsync token)
         */
        requestPublicLogin: function() {
            this.vent.trigger('app:log', 'Streaming :: PublicLogin');
            var PublicLoginRequest = {};
            PublicLoginRequest.application = this.appid;
            PublicLoginRequest.locale = 'en-gb';
            PublicLoginRequest.channel = 'INTERNET';
            PublicLoginRequest.apiVersion = 2;

            var obj = {};
            obj.PublicLoginRequest = PublicLoginRequest;

        	this.service.requestPublicLogin(obj);
        },

        /**
         * builds the user login object and submits to the service.
         * the service then modifies the request if required (eg: longpoll adding betsync token)
         */
        loginUser: function() {
            var UpgradePublicLoginRequest = {};
            UpgradePublicLoginRequest.userName = this.session.getName();
            UpgradePublicLoginRequest.accountId = this.session.getAccountId();
            UpgradePublicLoginRequest.apiSessionToken = this.session.getSessionToken();

            var obj = {};
            obj.UpgradePublicLoginRequest = UpgradePublicLoginRequest;

        	this.service.loginUser(obj);
        },

        /**
         * forwards subscription request to the service.
         * the service then modifies the request if required (eg: longpoll adding betsync token)
         */
        subscribe: function(data) {
        	this.service.subscribe(data);
        },


        publishStreamingMessage: function(data) {

            //console.log('Websocket :: Received - '+JSON.stringify(data));
            //data = {"CalculateCashoutResponse":{"cashoutResult":[{"cashoutValue":0.77,"betNo":0,"betId":"150815480000105","status":"OK"}]}};

            if (document.URL.indexOf('debug=true') != -1) {
                console.log('Websocket :: Received - '+JSON.stringify(data));
            }

            if (data.PushMsg) {
                if (data.PushMsg.eventTradingState) {
                    //console.log('INCOMING DATA '+JSON.stringify(data.PushMsg.eventTradingState));
                    this.trigger("streaming:eventTradingState", data.PushMsg.eventTradingState);
                } else if (data.PushMsg.incidents) {
                    this.trigger("streaming:incidents", data.PushMsg.incidents);
                }
                else if (data.PushMsg.event) {
                   this.trigger("streaming:event", data.PushMsg.event);
                }
            }
            else if (data.EventDataSync) {
                this.trigger("streaming:eventDataSync", data.EventDataSync);
            }
            else if (data.SubscribeResponse) {
                this.trigger("streaming:subscribeResponse", data.SubscribeResponse);
            }
            else if (data.BasicResponse) {
                //this.trigger("streaming:subscribeResponse", data.BasicResponse.responseDetails);
            }
            else if (data.ScheduleAmendment) {
                this.trigger("streaming:scheduleAmendment", data.ScheduleAmendment);
            }
            else if (data.AccountBalanceUpdate) {
                this.trigger("streaming:accountBalanceUpdate", data.AccountBalanceUpdate);
            }
            else if (data.BetUpdate) {
                //OverrAsk push update.
                console.log('Websocket :: Received BET UPDATE:- '+JSON.stringify(data));
                this.trigger("streaming:betUpdate", data.BetUpdate);
            }
            else if (data.CalculateCashoutResponse) {
                var cashoutResult = data.CalculateCashoutResponse.cashoutResult;
                if (_.size(cashoutResult) > 0) {
                    this.trigger("streaming:calculateCashout", cashoutResult);
                }
            }
        }

    });
});



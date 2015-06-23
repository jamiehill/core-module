import SocketService from 'SocketService'
import {LOGGED_IN, LOGGED_OUT} from '../model/SessionModel';

export default EVENT_TRADING_STATE = "streaming:eventTradingState";
export default INCIDENTS = "streaming:incidents";
export default EVENT = "streaming:event";
export default DATA_SYNC = "streaming:eventDataSync";
export default SUBSCRIBE_RESPONSE = "streaming:subscribeResponse";
export default SCHEDULE_AMENDMENT = "streaming:scheduleAmendment";
export default ACCOUNT_BALANCE_UPDATE = "streaming:accountBalanceUpdate";
export default BET_UPDATE = "streaming:betUpdate";
export default CALCULATE_CASHOUT = "streaming:calculateCashout";

export default SocketService.extend({
	initialize() {
		SocketService.prototype.initialize.apply(this, arguments);
		this.session = ctx.get('sessionModel');
		this.listenTo(this.session, LOGGED_IN, this.onLoggedIn);
		this.listenTo(this.session, LOGGED_OUT, this.onLoggedOut);
		this.start();
	},


	onOpen() {


	},

	onLoggedOut() {

	},

	/**
	 * @param obj
	 */
	publicLogin() {
		console.log('Streaming :: PublicLogin');
		this.send({
			PublicLoginRequest = {
				application: App.Config.appid,
				locale: App.Config.defaultChannel,
				channel: App.Config.channel,
				apiVersion: App.Config.apiVersion,
				reqId: PUBLIC_LOGIN_REQ_ID
			}
		});
	},

	/**
	 * @param obj
	 */
	upgradeLogin() {
		this.send({
			UpgradePublicLoginRequest = {
				userName: this.session.getName(),
				accountId: this.session.getAccountId(),
				apiSessionToken: this.session.getSessionToken(),
				reqId: USER_LOGIN_REQ_ID
			}
		});
	},

	/**
	 * @param data
	 */
	parseMessage(data) {
		// log the message if debug flag set to true
		if (document.URL.indexOf('debug=true') != -1) {
			console.log('Websocket :: Received - '+JSON.stringify(data));
		}

		switch(true) {
			case data.PushMsg:
				if (data.PushMsg.eventTradingState) {
					this.trigger(EVENT_TRADING_STATE, data.PushMsg.eventTradingState);
				}
				if (data.PushMsg.incidents) {
					this.trigger(INCIDENTS, data.PushMsg.incidents);
				}
				if (data.PushMsg.event) {
					this.trigger(EVENT, data.PushMsg.event);
				}
				break;
			case data.EventDataSync:
				this.trigger(DATA_SYNC, data.EventDataSync);
				break;
			case data.SubscribeResponse:
				this.trigger(SUBSCRIBE_RESPONSE, data.SubscribeResponse);
				break;
			case data.BasicResponse:
				break;
			case data.ScheduleAmendment:
				this.trigger(SCHEDULE_AMENDMENT, data.ScheduleAmendment);
				break;
			case data.AccountBalanceUpdate:
				this.trigger(ACCOUNT_BALANCE_UPDATE, data.AccountBalanceUpdate);
				break;
			case data.BetUpdate:
				this.trigger(BET_UPDATE, data.BetUpdate);
				break;
			case data.CalculateCashoutResponse:
				var cashoutResult = data.CalculateCashoutResponse.cashoutResult;
				if (_.size(cashoutResult) > 0) {
					this.trigger(CALCULATE_CASHOUT, cashoutResult);
				}
				break;
		}
	}
});

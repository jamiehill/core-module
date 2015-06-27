import SocketService, {PUBLIC_LOGIN_SUCCESS} from './SocketService'

export const EVENT_TRADING_STATE = "streaming:eventTradingState";
export const INCIDENTS = "streaming:incidents";
export const EVENT = "streaming:event";
export const DATA_SYNC = "streaming:eventDataSync";
export const SUBSCRIBE_RESPONSE = "streaming:subscribeResponse";
export const SCHEDULE_AMENDMENT = "streaming:scheduleAmendment";
export const ACCOUNT_BALANCE_UPDATE = "streaming:accountBalanceUpdate";
export const BET_UPDATE = "streaming:betUpdate";
export const CALCULATE_CASHOUT = "streaming:calculateCashout";

export default SocketService.extend({

	/**
	 * Upgrade the public login,
	 */
	upgrade() {
		this.send(this.UpgradePublicLogin());
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

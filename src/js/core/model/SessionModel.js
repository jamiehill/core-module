import Store from './Store';
import Radio from 'backbone.radio';

// model constants
export const LOGGED_IN = 'session:loggedin';
export const LOGGED_OUT = 'session:loggedout';
export const NOT_LOGGED_IN_ERROR = 'session:errorNotLoggedIn';

export default Backbone.Model.extend({

	Store: null,
	defaults: {
		name: '-',
		accountId: '-',
		username: '',
		password: '-',
		sessionToken: '-',
		lastLoginTime: 0,
		maxLoginIdleTimeInMinutes: 60,
		enabledProducts: 'SPBOK,LOTTO',
		accountBalance: {
			amount: '0',
			currency: 'GBP',
			activeFundsType: 'CASH',
			wallets: []
		}
	},

	/**
	 *
	 */
	initialize: function() {
		var that = this;

		// create channel for session and a request/response
		// to return arbitrary model properties
		App.session = Radio.channel('session');
		App.session.reply('session:details', function(props) {
			return _.reduce(props, function(obj, prop) {
				obj[prop] = this.get(prop);
			}, {}, that);
		});

		// if this is the embedded src, use localStorage
		var store = 'sessionStorage';

		// In some environment (like Android webviews) localStorage is not available
		// In that case, use cookies
		if (store === 'localStorage' && !localStorage){
			store = 'cookie';
		}

		console.log('Persistence :: '+store);
		this.Store = new Store({persistence: store, name: 'session'});
		this.recoverSession();
	},

	/**
	 * @param key
	 * @param val
	 * @param options
	 */
	set: function(key, val, options) {
		Backbone.Model.prototype.set.apply(this, arguments);
		if(val) {
			// update storage with new data from this model
			if (this.Store && !val.silent) {
				this.Store.set(this);
			}
		}
	},

	/**
	 * @returns {*}
	 */
	toJSON: function() {
		var data = _.clone(this.attributes);
		delete data.accountBalance.accountId;
		return data;
	},


	/**
	 * @returns {boolean}
	 */
	isLoggedIn: function() {
		return this.Store.check();
	},

	isNotLoggedIn: function() {
		return !this.isLoggedIn();
	},


	/**
	 * @param lgn
	 * @param persist
	 */
	storeSession: function(lgn, silent){
		this.set(lgn, {silent: !!silent});
		App.vent.trigger(LOGGED_IN, lgn);
	},


	/**
	 * @param cookieSession
	 */
	storeSessionFromCookie: function(cookieSession){
		this.set(JSON.parse(cookieSession));
	},


	/**
	 * @returns {*}
	 */
	getSession: function() {
		return this.Store.get();
	},


	/**
	 *
	 */
	clearSession: function(){
		this.Store.clear();
		App.vent.trigger(LOGGED_OUT);
	},


	/**
	 * Recovers any session data from the sessionStorage
	 * to automatically log the user back in
	 */
	recoverSession: function(){
		var localSession = this.Store.get();
		if (localSession == null) {
			console.log('RecoveredSession :: NonePresent');
			this.clearSession();
		}

		else {

			console.log('RecoveredSession :: '+JSON.stringify(localSession));
			this.storeSession(JSON.parse(localSession), true);
		}
	},


	// property methods


	/**
	 * @returns {*}
	 */
	getCurrency: function(){
		return this.get('accountBalance').currency;
	},


	/**
	 * @returns {*}
	 */
	getCurrencySymbol: function() {
		if (this.isLoggedIn()) {
			return App.Translator.translateCurrency(this.getCurrency());
		}
		else {
			var localeCurrency = App.Translator.translate("CURRENCY_NAME");
			return App.Translator.translateCurrency(localeCurrency)
		}
	},


	/**
	 * @param balance
	 */
	resetAccountBalance: function(balance){
		this.set('accountBalance', balance);
	},


	/**
	 * @returns {*}
	 */
	getBalance: function(fundType){
		if (!fundType) {
			return parseFloat(this.get('accountBalance').amount).toFixed(2);
		}

		var bal = 0;
		_.each(this.get('accountBalance').wallets, function(wallet){
			if (wallet.fundType == fundType) {
				bal += parseFloat(wallet.balance);
			}
		}, this);

		return bal.toFixed(2);
	},


	/**
	 * @param bln
	 */
	setBalance: function(balance){
		if (!this.isLoggedIn()) return;
		this.set('accountBalance', balance);
	},


	/**
	 * @returns {*}
	 */
	getUsername: function(){
		return this.get('username');
	},

	/**
	 * @returns {*}
	 */
	getName: function(){
		return this.get('name');
	},

	/**
	 * @returns {*}
	 */
	getSessionToken: function(){
		return this.get('sessionToken');
	},


	/**
	 * @returns {*}
	 */
	getAccountId: function(){
		return this.get('accountId');
	},


	/**
	 * @returns {string|.defaults.accountBalance.activeFundsType}
	 */
	getActiveFundsType: function() {
		return this.get('accountBalance').activeFundsType;
	},


	/**
	 * @returns {number}
	 */
	getMaxIdleTime: function() {
		return this.get('maxLoginIdleTimeInMinutes') * 60 * 1000;
	},


	/**
	 * @returns {*}
	 */
	getLastLoginTime: function() {
		return this.get('lastLoginTime');
	}

});

import Store from './Store';
import {modelProps} from '../utils/AppUtil';
import {execute} from '../utils/AppUtil';
import service from '../service/ApiService';
import login from 'core/command/Login';

// model constants
export const LOGGED_IN = 'session:loggedin';
export const LOGGED_OUT = 'session:loggedout';
export const NOT_LOGGED_IN_ERROR = 'session:errorNotLoggedIn';

var Model = Backbone.Model.extend({

	Store: null,
	defaultStore: 'cookie',
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
		_.bindAll(this, 'isLoggedIn');

		// adds method execution in this scope
		App.session.execute = execute(this);

		// configure request/responses for decoupled interaction
		App.session.reply('token', this.get('sessionToken'));
		App.session.reply('loggedIn', this.isLoggedIn);
		App.session.reply('session:details', function(props) {
			return modelProps(that, props);
		});

		// degrade the storage type depending on what
		// the user's browser has availle to use
		var store = this.defaultStore;
		if (store == 'sessionStorage' && !sessionStorage) {
			store = 'localStorage';
		}
		if (store === 'localStorage' && !localStorage){
			store = 'cookie';
		}

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
		App.session.trigger(LOGGED_IN, lgn);
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
		App.session.trigger(LOGGED_OUT);
	},


	/**
	 * Recovers any session data from the sessionStorage
	 * to automatically log the user back in
	 */
	recoverSession: function(){
		var localSession = this.Store.get();
		if (localSession == null) {
			this.clearSession();
		}

		else {

			if (_.isString(localSession)) {
				localSession = JSON.parse(localSession);
			}
			this.storeSession(localSession, true);
			this.validateSession();
		}
	},


	/**
	 * Validates the current session token
	 * @returns {Promise}
	 */
	validateSession: function() {
		var that = this;
		service.getBalance().fail(function(){
			console.log('InvalidSession :: Retrying AutoLogin...');
			var session = JSON.stringify(that.Store.get());
			that.Store.clear();
			login(session.username, session.password);
		})
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

let inst = new Model();
export default inst;

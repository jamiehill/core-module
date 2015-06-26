import ServiceBase from './ServiceBase';

var Service = ServiceBase.extend({

	url()  {
		return App.Urls.endpoint;
	},
	surl() {
		return App.Urls.sendpoint;
	},
	defaults: {
		sessionToken: function(){
			return App.session.execute('get', 'sessionToken');
		},
		application: function(){
			return App.Config.application;
		},
		locale: function() {
			return App.Globals.locale;
		},
		channelId: function() {
			return App.Globals.channel;
		}
	},


	targets: {
		login: {
			method: 'post',
			secure: true,
			args: [
				'username',
				'password',
				{application: {attr: 'application'}}
			]
		},

		externalLogin: {
			method: 'post',
			args: [
				'externalToken',
				'signature',
				'webId',
				'lsrc',
				'site',
				{application: {attr: 'application'}}
			]
		},

		logout: {
			method: 'post',
			secure: true,
			//headers: { attr: 'authorization' },
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		forgotPassword: {
			method: 'post',
			secure: true,
			args: [
				'username',
				{application: {attr: 'application'}}
			]
		},

		checkSecurityAnswer: {
			method: 'post',
			secure: true,
			args: [
				'username',
				'securityAnswer',
				{application: {attr: 'application'}}
			]
		},

		keepAlive: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getBalance: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		updateActiveWallet: {
			method: 'post',
			secure: true,
			args: [
				'walletType',
				'fundsType',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getPriceAdjustmentDetails: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getRootLadder: {
			args: []
		},


		getFrontPageSchedule: {
			args: [
				{sport: ''},
				// returns top coupons - true or false
				{quicklinks: ''},
				// returns front page highlights - true or false
				{frontlinks: ''},
				// comma delimited list of marketTypes.  empty returns all.
				{marketTypes: ''},
				// prematch events to return.  -1=all, 0=none, n=amount
				{maxPrematch: '-1'},
				// inplay events to return.  -1=all, 0=none, n=amount
				{maxInplay: '-1'},
				{channelId: {attr: 'channelId'}},
				{maxfrontlinks: ''},
				// max number of events per sport
				{locale: {attr: 'locale'}}
			]
		},

		getSportSchedule: {
			args: [
				'sport',
				// comma delimited list of marketTypes.  empty returns all.
				{marketTypes: ''},
				// list of days to return.  0 - today, 1 - tomorrow etc.
				{days: ''},
				// returns competition structure but without events (true)
				{embedComps: 'true'},
				// prematch events to return.  -1=all, 0=none, n=amount
				{maxPrematch: '-1'},
				// inplay events to return.  -1=all, 0=none, n=amount
				{maxInplay: '-1'},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},


		getRegionalSports: {
			args: [
				{locale: {attr: 'locale'}}
			]
		},


		getCompetitionEvents: {
			args: [
				'competitionId',
				{marketTypes: ''},
				{includeOutrights: 'false'},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getCouponEvents: {
			args: [
				'couponId',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getKeyMarketsForSports: {
			args: [
				'sports'
			]
		},

		getSportDisplayTemplate: {
			args: [
				'sport',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getEvent: {
			args: [
				'eventId',
				{marketTypes: ''},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getPageLayout: {
			method: 'getjson',
			args: [
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		savePageLayout: {
			method: 'post',
			secure: true,
			args: [
				'pageLayout',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		placeBets: {
			secure: false,
			method: 'post',
			args: [
				'bets',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getOpenBets: {
			method: 'post',
			secure: false,
			args: [
				'excludeChildBets',
				{sessionToken: {attr: 'sessionToken'}},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		betHistory: {
			method: 'post',
			secure: false,
			args: [
				'firstResult',
				'maxResults',
				'placedTime',
				'placedUntilTime',
				'status',
				'betIds',
				{sessionToken: {attr: 'sessionToken'}},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		betHistoryCount: {
			method: 'post',
			secure: false,
			args: [
				'placedTime',
				'placedUntilTime',
				'status',
				'returnIds',
				'firstResult',
				'maxResults',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}},
				{sessionToken: {attr: 'sessionToken'}},
				{eventId: ''},
				{marketId: ''},
				{instrumentId: ''}
			]
		},

		getClosedBets: {
			method: 'post',
			secure: true,
			args: [
				'from',
				'to',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}},
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		watchAndBetUrl: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'watchAndBetEventId'
			]
		},

		watchAndBetToken: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'watchAndBetEventId'
			]
		},

		getCompetitionOutrights: {
			args: [
				'competitionId',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getPopularBets: {
			args: [
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		listCountries: {
			args: []
		},

		listCurrencies: {
			args: []
		},

		register: {
			secure: true,
			method: 'post',
			args: [
				'registrationJson'
			]
		},

		getQuickLinks: {
			args: [
				{locale: {attr: 'locale'}}
			]
		},

		getFeaturedHighlights: {
			args: [
				{locale: {attr: 'locale'}},
				{channel: 6}
			]
		},

		saveHighlights: {
			args: [
				'highlights'
			]
		},

		initFundsDeposit: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'amount',
				'gateway'
			]
		},

		paymentOptions: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'gateway'
			]
		},

		routingBankCodes: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'gateway'
			]
		},

		fundsWithdrawal: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'amount',
				'paymentOption',
				'gateway'
			]
		},

		fundsWithdrawalViaAccount: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}},
				'amount',
				'account',
				'fundType',
				'gateway'
			]
		},

		getRegionalOutrights: {
			args: [
				'sport',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},


		getAvailableMarketsForSports: {
			args: [
				'sports',
				{locale: {attr: 'locale'}}
			]
		},

		searchBets: {
			method: 'post',
			secure: true,
			args: [
				'accountId',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getChildBets: {
			method: 'post',
			secure: true,
			args: [
				{accountId: ''},
				{betId: ''},
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getSportsbookChildBets: {
			method: 'post',
			secure: true,
			args: [
				{betId: ''},
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		changeAccountPassword: {
			method: 'post',
			secure: true,
			args: [
				'accountId',
				'password',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		changePasswordByUsername: {
			method: 'post',
			secure: true,
			args: [
				'username',
				'oldPassword',
				'newPassword'
			]
		},

		changePasswordByToken: {
			method: 'post',
			secure: true,
			args: [
				'userId',
				'newPassword',
				'token'
			]
		},

		checkUsername: {
			secure: true,
			args: [
				'username',
				'email'
			]
		},

		getAccountTransactionCount: {
			method: 'post',
			secure: true,
			args: [
				'accountId',
				'from',
				'to',
				'fundType',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getAccountTransactionHistory: {
			method: 'post',
			secure: true,
			args: [
				'accountId',
				'from',
				'to',
				'fundType',
				{'firstResult': '0'},
				{'maxResults': '9999'},
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getBettingPrefs: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		saveBettingPrefs: {
			method: 'post',
			secure: true,
			args: [
				'json',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getBonusEntitlements: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},


		getMyDetails: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		updateMyDetails: {
			method: 'post',
			secure: true,
			args: [
				'firstname',
				'lastname',
				'phone',
				'email',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getSelfLimits: {
			method: 'post',
			secure: true,
			args: [
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		updateSelfLimits: {
			method: 'post',
			secure: true,
			args: [
				'limits',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		calculateCashout: {
			method: 'post',
			secure: false,
			args: [
				'bets',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		cashoutBet: {
			method: 'post',
			secure: true,
			args: [
				'accountId',
				'betId',
				'selectionId',
				'cashOutStake',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getSelectionEvents: {
			args: [
				'selectionIds',
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getMaxAllowedBetStake: {
			secure: true,
			method: 'post',
			args: [
				'bets',
				{sessionToken: {attr: 'sessionToken'}}
			]
		},

		getPromotions: {
			args: [
				'sport',
				{max: 3},
				{channel: 6},
				{locale: {attr: 'locale'}}
			]
		},

		getEventStartingHours: {
			args: ['sport']
		},

		getEvents: {
			args: [
				'sport',
				'fromEpoch',
				'toEpoch',
				{marketTypes: ''},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getEventsById: {
			args: [
				'eventIds',
				{marketTypes: ''},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getSportTree: {
			args: [
				'sport',
				{includeOutrights: 'false'},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getSportData: {
			args: [
				{sport: ''},
				{markets: 'true'},
				{keyMarkets: 'true'},
				{groups: 'true'},
				{channelId: {attr: 'channelId'}},
				{locale: {attr: 'locale'}}
			]
		},

		getResultHistoryEvents: {
			args: [
				'sport',
				'date'
			]
		},

		getResultHistoryForEvent: {
			args: [
				'eventId'
			]
		}
	}


});


let inst = new Service();
export default inst;

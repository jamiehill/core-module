import AdditionalConfig from '../../app/i18n/AdditionalConfig';
import en from '../../app/i18n/en_messages.json!';
import currencySymbols from '../../app/i18n/currencySymbols.json!';


export default Marionette.Controller.extend({

	currentLocale: 'en-ie',
	localeCookieName: 'ATS_SB_LANG',
	currentLocaleTranslations: null,
	en_translations: null,
	currencySymbols_translations: null,

	onLocaleChange: function(value) {
		this.changeCurrentLocale(value);
	},

	build: function() {
		this.en_translations = en;
		this.currentLocaleTranslations = this.en_translations;
		this.currencySymbols_translations = currencySymbols;
		this.changeCurrentLocale(App.Globals.locale);
		this.trigger("onTranslatorReady");
	},

	initialize: function(options) {
		_.bindAll(this, 'onLocaleChange');
		App.vent.on('globals:localeChange', this.onLocaleChange);
	},


	underscoreSettings: {
		interpolate: /<\?([\s\S]+?)\?>/g,
		//just overriding them to avoid evaluate and escape during i18n
		evaluate: /<$([\s\S]+?)$>/g,
		escape: /<$-([\s\S]+?)$>/g
	},

	//setLocaleCookie: function(locale) {
	//    var existingCookieLocale = $.cookie(this.localeCookieName);
	//    if (existingCookieLocale != locale) {
	//        $.cookie(this.localeCookieName, locale);
	//    }
	//},

	setMessages: function(newLocale) {
		var l = newLocale.split('-')[0];
		if (_.has(this, l + '_translations')) {
			this.currentLocaleTranslations = this[l + '_translations'];
		}
		else {
			this.currentLocaleTranslations = this.en_translations;
		}
	},

	changeCurrentLocale: function(newLocale) {
		var localePart = newLocale.split('-')[0];
		var currentLocalePart = this.currentLocale.split('-')[0];

		if (currentLocalePart != localePart) {
			this.currentLocale = newLocale;
			//this.setLocaleCookie(newLocale);
			this.setMessages(newLocale);

			// set the locale for dates
			if (newLocale == 'ko') moment.locale('ko');
			else moment.locale('en-gb');

			App.vent.trigger('translator:locale:change',newLocale);
		}
	},

	translateCurrency: function(text) {
		var t = this.currencySymbols_translations[text];
		if (!t) {
			t = "£";
		}
		return t;
	},

	translate: function(text) {
		var t = this.currentLocaleTranslations[text];
		if (!t) {
			t = this.en_translations[text];
		}
		if (!t) {
			t = text;
		}
		return t;
	},

	// Replacement is an object with two properties: "from" and "to"
	// TO-DO: This function could take regexps as search strings and could also
	// accept an array of replacements to perform
	translateAndReplace: function(text, replacement) {
		var t = this.translate(text);

		if (replacement && (typeof replacement.from === 'string' || replacement.from instanceof RegExp) &&
			(typeof replacement.to === 'string')){

			t = t.replace(replacement.from, replacement.to);
		}

		return t;
	},

	translateAndReplaceToken: function(text, tokenAValue, tokenBValue) {
		var translated = this.translate(text);

		if (_.includes(translated, '{AA}')) {
			var replacedText = translated.replace('{AA}', tokenAValue);
			translated = replacedText;
		}

		if (_.includes(translated, '{BB}')) {
			var replacedText = translated.replace('{BB}', tokenBValue);
			translated = replacedText;
		}

		return translated;
	},

	translateAndReplaceDomain: function(text) {
		var site = App.Globals.site + '';
		var domains = additionalConfig.domains;
		var domainExtension = domains[site];
		var replacement = {from: '[DOMAIN]', to: domainExtension};

		// Special case in which the domain substitution is expressed
		// with a string starting with asterisk and at symbol
		if (domainExtension.indexOf('*@') === 0){
			replacement.from = new RegExp('((.+)@)(.+)\\[DOMAIN\\]');
			replacement.to = '$1' + replacement.to.substring(2);
		}

		return this.translateAndReplace(text, replacement);
	},

	replaceURL: function(text, token, href){
		var translated = this.translate(text);
		var href = "#";
		var hrefString = '<a href="'+href+'">';
		var text = translated.replace('['+token+']', hrefString + this.translate(token) + '</a>');
		return text;
	},

	replaceDeposit: function(text){
		text = text.replace('[DEPOSIT]', '<a class="deposit-button" href="#">' + this.translate("DEPOSIT") + '</a>');
		text = text.replace('[DEPOSITURL]', '<a class="btn-deposit" href="#">' + this.translate("DEPOSIT") + '</a>');
		return text;
	},

	// Specific logic for Pokerstars rejection messages i18n
	translateRejection: function(text){
		var translated = this.translateAndReplaceDomain(text);
		translated = this.replaceDeposit(translated);
		return translated;
	},

	html: function(text) {
		if (_.isUndefined(text)) return '';
		return _.template(text, this.currentLocaleTranslations, this.underscoreSettings);
	}
})

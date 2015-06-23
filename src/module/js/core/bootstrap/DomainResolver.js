import * as regEx from '../utils/RegEx';
import DeferredBase from '../defer/Deferred';

export default class DomainResolver extends DeferredBase {
	constructor(name) {
		super('DomainResolver');
	}

	initialize() {

		this.urls = App.Urls = {};
		this.config = App.Config;
		this.map = {};

		// get main application domain and path
		var url  = window.location.host.replace(regEx.leadingTrailingSlashes, '');
		this.urls.root = window.location.pathname.replace(regEx.leadingTrailingSlashes, '');

		// application endpoints
		this.normalize('url', url, 'http', this.config.defaultDomain);
		this.normalize('endpoint', url, 'http', this.config.defaultDomain, this.config.endpoint, true);
		this.normalize('wsendpoint', url, 'ws', this.config.defaultDomain, this.config.wsendpoint, true);
		this.normalize('lpendpoint', url, 'http', this.config.defaultDomain, this.config.lpendpoint, true);
		this.normalize('traderEndpoint', url, 'http', this.config.defaultDomain, this.config.traderEndpoint, true);
		this.normalize('traderWSendpoint', url, 'ws', this.config.defaultDomain, this.config.traderWSendpoint, true);

		var endpoint = App.Config.useSecure ? 'sendpoint' : 'endpoint';
		console.log('Bootstrap: Endpoint - '+App.Urls[endpoint]);

		this.success();
	}

	/**
	 * @param name
	 * @param url
	 * @param protocol
	 * @param def
	 * @param append
	 */
	normalize(name, url, protocol, def, append, forceSecure) {
		// normalize url to not have trailing slashes
		url = url.replace(regEx.leadingTrailingSlashes, '');

		// normalize protocol to not have trailing slashes
		protocol = protocol.replace(regEx.leadingTrailingSlashes, '');

		if (!def) {
			console.error("The configured endpoint: '"+name+"', has no default domain supplied. \nIf the you intended the application to be configured with such an endpoint,\nplease add it to configuration.json.\n\n");
			return;
		}

		// default 'def' to defaultDomain, removing the protocol
		def = def || this.config.defaultDomain;
		def = def.replace(regEx.urlPrototcol, '');

		// if running on localhost (or local ip) use
		// default domain if one has been provided
		if (~url.indexOf('localhost') || regEx.ipAddress.test(url) || url.indexOf('sports.uat.pyrsoftware') != -1) {
			if (!_.isEmpty(def)) url = def.replace(regEx.leadingTrailingSlashes, '');
		}

		// remove the protocol, so that we can ensure
		// the correct one is prefixed to the url
		url.replace(regEx.urlPrototcol, '');

		// now prefix the correct protocol
		url = protocol + '://' + url;

		// if an 'append' has been provided, append it.  Any provided 'append'
		// must include leading slash if required, as port could break syntax
		if (!_.isEmpty(append)) {
			url = url + '/' + append.replace(regEx.leadingTrailingSlashes, '');
		}

		// if 'useSecure' is true and so is 'forceSecure',
		// swap the endpoint for the secure version
		var useSecure = _.has(this.config, 'useSecure') && this.config.useSecure == 'true';
		if (useSecure && forceSecure === true) {
			this.urls[name] = url.replace(protocol+'://', protocol+'s://');
			this.urls['s'+name] = url.replace(protocol+'://', protocol+'s://');
		}

		else {
			// 1) add the endpoint to appropriate config
			// 2) add a secure version to the config
			this.urls[name] = url + '/';
			this.urls['s'+name] = url.replace(protocol+'://', protocol+'s://') + '/';
		}

		this.map[name] = this.urls[name];
		this.map['s'+name] = this.urls['s'+name];
	}

}

/**
 * @param str
 * @param val
 * @returns {boolean}
 */
export var isDev = function(str, val){
	var url = $(location).attr('href');
	return url.indexOf('localhost') != -1;
};


/**
 * @returns {boolean}
 */
export var isHome = function (type) {
	if (!Backbone.history.started) {
		return window.location.hash == '';
	}
	var fragment = Backbone.history.getFragment();
	return fragment == "";
};


/**
 * @returns {boolean}
 */
export var isPage = function (type) {
	var fragment = Backbone.history.getFragment();
	return fragment.indexOf('/'+type+'/') != -1;
};


/**
 * @returns {boolean}
 */
export var isEventPage = function () {
	var fragment = Backbone.history.getFragment(),
		components = fragment.split('/');
	return fragment.indexOf('/event/') != -1;
};


/**
 * @returns {boolean}
 */
export var isSportPage = function () {
	var fragment = Backbone.history.getFragment(),
		components = fragment.split('/');
	return _.size(components) == 1 && fragment != 'live' && !_.isEmpty(fragment);
};


/**
 * Removes a query string from a location
 * @param location
 */
export var removeQuery = function(location){
	return location.split('?')[0];
};


/**
 * Utility for get a query string
 *
 * @param queryString
 */
export var getLocation = function(query) {
	if (query) return window.location;
	return window.location.replace(this.getQuery(), '');
};


/**
 * Utility for get a query string
 *
 * @param queryString
 */
export var getQuery = function() {
	var href  = window.location.href,
		parts = href.split('?');
	return parts.length ? parts[1] : '';
};


/**
 * Returns the uri component at the specified index
 *
 * For example, if we have a route as such, '#soccer/competition/1781823',
 * :: to get 'sport', we would call getComponent(0) or just getComponent()
 * :: to get 'competition', we would call getComponent(1)
 * :: to get '1781823', we would call getComponent(2)
 * @param index
 */
export var getComponent = function(index, def) {
	// use empty string as the default
	// unless one has been passed in
	def = _.isUndefined(def) ? '' : def;

	// if backbone history hasn't started yet, return the default
	if (!Backbone.history.root) return def;

	var fragment = Backbone.history.getFragment();
	var fragments = fragment.split('/');

	return index >= fragments.length ? def : fragments[index];
};


/**
 * Same as above but doesn't use backbone.history
 * @param index
 * @param def
 * @returns {string}
 */
export var getComponent2 = function(index, def) {
	// use empty string as the default
	// unless one has been passed in
	def = _.isUndefined(def) ? '' : def;

	var hash = window.location.hash.toString();
	var fragment = hash.replace(/^#(\/*)/, '');
	var fragments = fragment.split('/');

	return index >= fragments.length ? def : fragments[index];
};


/**
 * Utility to strip a query string from a url
 * @param url
 */
export var stripQuery = function(url) {
	var href  = url || window.location.href,
		parts = href.split('?');
	return parts.length ? parts[0] : href;
};


/**
 * Utility for processing a query string into json
 * object literal, ie. ?a=1&b=2 to {a:1, b:2}
 *
 * @param queryString
 */
export var getQueryParams = function() {
	var query = getQuery();
	if (!query) return false;

	return _
		.chain(query.split('&'))
		.map(function(params) {
			var p = params.split('=');
			return [p[0], decodeURIComponent(p[1])];
		})
		.object()
		.value();
};


/**
 * Returns a query parameter by name
 * @param name
 */
export var getParam = function(name) {
	var params = getQueryParams();
	return params[name];
}

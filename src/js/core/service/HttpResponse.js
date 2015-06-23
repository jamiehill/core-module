/**
 * @param str
 * @param val
 * @returns {boolean}
 */
export var isNotLoggedIn = function(resp){
	if (_.has(resp, 'Response')) {
		var response = resp.Response;
		if (_.has(response.status, 'Error')) {
			var error = response.body.Error;
			return error.code == 'NOT_LOGGED_IN';
		}
	}
	if (_.has(resp, 'Error')) {
		var error = resp.Error;
		return error.code == 'NOT_LOGGED_IN';
	}
	return false;
}


/**
 * @param resp
 * @returns {*}
 */
export var hasError = function(resp) {
	if (_.has(resp, 'Response')) {
		var response = resp.Response;
		return response.status == 'ERROR';
	}
	return _.has(resp, 'Error');
}

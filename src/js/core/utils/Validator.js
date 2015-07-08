import * as regex from './RegEx';

/**
 * Is a valid string of a given length
 * @param str
 * @param len
 * @returns {boolean}
 */
export var validString = function(str, len = 3){
	var notEmpty = !_.isEmpty(str),
		greaterThan = str.length >= len,
		isValid = notEmpty && greaterThan;
	return isValid;
};

/**
 * Is a valid email
 * @param str
 * @returns {boolean}
 */
export var validEmail = function(str) {
	if (_.isEmpty(str)) return false;
	return str.match(regex.email) != null;
}

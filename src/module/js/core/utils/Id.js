/**
 * @param selector
 * @returns {string}
 */
export var extract = function(selector){
	var index = selector.lastIndexOf('-'),
		id    = (index != -1) ? selector.substr(index + 1) : '';
	return id;
};

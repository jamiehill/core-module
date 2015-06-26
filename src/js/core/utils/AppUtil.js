/**
 * Returns the requested propert values as a name:value paired object from the specified model
 * example:
 *
 * 	var props = props(this.model, ['name', 'age']);
 * 	props == {name: 'Jamie', age: '25'};
 *
 * @param model
 * @param props
 * @returns {*}
 */
export var modelProps = function(model, props){
	return _.reduce(props, function(obj, prop) {
		obj[prop] = model.get(prop);
		return obj;
	}, {});
};

/**
 * Wraps method execution on a given scope
 * @param scope
 * @returns {*}
 */
export var execute = function(scope) {
	return _.wrap(this, function(sc) {
		var args = Array.prototype.slice.call(arguments),
			method = args[1]; args.splice(0, 2);
		return scope[method].apply(scope, args);
	});
};


/**
 * Abbreviates Selection names
 * @param t
 * @returns {*}
 */
export var abbr = function(t){
	var type = t.toUpperCase(),
		abbreviations = {
		'H' : '1',
		'A' : '2',
		'D' : 'x',
		'PLAYERA' : '1',
		'PLAYERB' : '2'
	};
	if (_.has(abbreviations, type)) {
		return abbreviations[type];
	}
	return t;
};

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

/**
 * Created by jamie on 24/06/2015.
 */
export var load = function(modules){
	return Promise.all(_.map(modules, function(module) {
		return System.import(module);
	}))
};

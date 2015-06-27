/**
 * Created by jamie on 24/06/2015.
 */
module.exports = function(o) {
	if(o.__ts__){return;}
	var slice = Array.prototype.slice;
	['log', 'debug', 'info', 'warn', 'error'].forEach(function(f){
		var _= o[f];
		o[f] = function(){
			var args = slice.call(arguments),
				date = new Date();
			args.unshift(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+' -');
			return _.apply(o, args);
		};
	});
	o.__ts__ = true;
};

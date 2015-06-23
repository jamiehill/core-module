//why this is needed - https://github.com/jashkenas/backbone/issues/3291
//why this is written in AMD format - https://github.com/jspm/jspm-cli/issues/689
define(['backbone','jquery', 'underscore'],function(Backbone, $, _){
	Backbone.$ = $;
	window.$ = $;
	window.Backbone = Backbone;
	window._ = _;
	return;
})

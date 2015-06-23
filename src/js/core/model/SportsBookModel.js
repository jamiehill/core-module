
export default Backbone.Model.extend({

	defaults: {
		"sports": []
	},


	fetchSports() {
		var useSecure = App.Config.useSecure || false,
			endpoint  = App.Urls[useSecure ? 'sendpoint' : 'endpoint'];
		this.url = endpoint+'/getRegionalSports';
	}
});

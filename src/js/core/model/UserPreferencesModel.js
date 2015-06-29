import Collection from 'core/collection/CompetitionsCollection';

var Model = Backbone.Model.extend({

	Competitions: new Collection(),
	defaults: {
	},


	/**
	 *
	 */
	initialize() {
		_.bindAll(this, 'toggleCompetition', 'hasCompetition');
	},


	/**
	 * Toggles a competition from displaying in the user's selected competitions
	 */
	toggleCompetition(comp) {
		if (this.hasCompetition(comp.id)) {
			this.Competitions.remove(comp);
		}
		else {
			this.Competitions.add(comp);
		}

		if (!!this.Competitions.length) {
			App.navigate(App.Globals.sport+'/competitions');
		}
	},


	/**
	 * Is a competition added?
	 */
	hasCompetition(compId) {
		return !!this.Competitions.get(compId);
	}




});

let inst = new Model();
export default inst;

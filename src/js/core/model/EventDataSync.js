import Backbone from 'backbone';
import Clock from './Clock';

export default Backbone.Model.extend({

	defaults: {
		clock: null,
		period: '',
		id: '',
		numMarkets: '',
		epoch: ''
	},

	/**
	 * @param data
	 */
	parse: function(data) {
		var clock;
		if (_.has(data, 'clock')){
			// create a new Clock if not already initialised
			if (!this.has('clock')) {
				clock = new Clock();
				clock.set({injuryTime: new Clock()});
				this.set({clock:clock});
			}

			// get the clock
			clock = this.get('clock');

			// if the time is the same, we want to disregard this
			// update, and let the timer carry on ticking away
			if (clock.notChanged(data.clock)) {
				return;
			}

			// update clock with the new data
			clock.parse(data.clock);
			delete data.clock;
		}
		this.set(data);
	}
});

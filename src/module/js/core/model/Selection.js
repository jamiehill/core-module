import Backbone from 'backbone';

export default Backbone.Model.extend({

	defaults: {
		eventId:0,
		marketId:0,
		line:null,
		id : 0,
		state:'ACTIVE',
		suspended : false,
		displayed: true,
		name : "",
		type : "D",
		multipleKeys: 0,//34374,67110,

		pos: {
			row : 1,
			col : 1
		},

		//Flattened structure instead of the odds object below returned from the schedule.
		decimalOdds:  "0",
		fractionalOdds: "",
		americanOdds:'',
		rootIdx: 0,
		homeLineWithoutPlus:null,
		homeLine:null,
		awayLine:null,
		activeBet: false
	},

	/**
	 * @param data
	 */
	parse: function(data){
		data.id = String(data.id);

		if (data.state == 'S') data.state = 'SUSPENDED';
		if (data.state == 'A' || data.state == 'O') data.state = 'ACTIVE';
		if (data.state == 'V') data.state = 'VOID';
		if (data.suspended && !!data.suspended) {
			data.state = 'SUSPENDED';
			delete data.suspended;
		}

		if (data.type =='H') data.header = '1';
		if (data.type =='A') data.header = '2';
		if (data.type =='D') data.header = 'x';

		var name = data.name.toLowerCase();
		if (~name.indexOf('under')) {
			data.header = _.trim(data.name.replace(/Under/i, 'U'));
		}
		if (~name.indexOf('over')) {
			data.header = _.trim(data.name.replace(/Over/i, 'O'));
		}

		if (~data.name.indexOf('{homeLine}')) {
			data.name = _.trim(data.name.replace('{homeLine}', ''));
			data.homeLine = true;
		}
		else if (~data.name.indexOf('{Line}')) {
			data.name = _.trim(data.name.replace('{Line}', ''));
			data.homeLineWithoutPlus = true;
		}
		else if (~data.name.indexOf('{awayLine}')) {
			data.name = _.trim(data.name.replace('{awayLine}', ''));
			data.awayLine = true;
		}

		if (_.has(data, 'attributes')) {
			// add all attributes into main data
			_.each(data.attributes.attrib, function(obj) {
				if (obj.key == 'clock' || obj.key == 'period' || obj.key == 'score') {
					data.offeredInplay = true;
					data.inplay = true;
				}
				data[obj.key] = obj.val;
			});
			delete data.attributes;
		}
		return data;
	},

	/**
	 * @returns {*}
	 */
	getSelectionName: function() {
		var lineValue = "";
		if (!_.isNull(this.getLineValue())) {
			lineValue = " "+this.getLineValue();
		}
		return _.titleize(this.get("name")+lineValue);
	},

	/**
	 * @returns {*}
	 */
	getLineValue: function() {
		if (!_.isNull(this.get("homeLine"))) {
			var homeLine = this.get('line');
			if (homeLine >0) {
				if (!_.includes(homeLine, '+')) {
					homeLine = '+'+homeLine;
				}
			}
			return homeLine;
		}
		else if (!_.isNull(this.get("homeLineWithoutPlus"))) {
			var homeLine = this.get('line');
			return homeLine;
		}
		else if (!_.isNull(this.get("awayLine"))) {
			var homeLine = this.get('line');
			var awayLine = homeLine * -1;
			if (awayLine >0) {
				if (!_.includes(awayLine, '+')) {
					awayLine = '+'+awayLine;
				}
			}
			return awayLine;
		}
		else {
			return null;
		}
	},

	/**
	 * @returns {Mixed|*}
	 */
	getOdds: function(format) {
		format = format || App.Globals.priceFormat;
		var oddsType = 'fractionalOdds';
		switch(format) {
			case 'DECIMAL' : oddsType = 'decimalOdds'; break;
			case 'AMERICAN' : oddsType = 'americanOdds'; break;
		}
		return this.get(oddsType);
	}
})

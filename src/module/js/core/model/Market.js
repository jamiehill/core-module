import Selection from './Selection';
import SelectionsCollection from '../collection/SelectionsCollection';

export default Backbone.Model.extend({

	Selections: null,
	defaults: {
		eventId:0,
		id : 0,
		name : "",
		type : "MRES",
		subtype : '',
		displayOrder : -500,
		columnCount : 0,
		suspended : false,
		state : 'OPEN',
		displayed : true,
		mostBalanced : false,
		line : null
	},

	/**
	 */
	initialize: function() {
		_.bindAll(this, 'oddsFactory');
	},

	/**
	 * Methodized for stubbing purposes
	 */
	oddsFactory: function() {
		return ctx.get("oddsFactory");
	},

	/**
	 * @param data
	 * @returns {*}
	 */
	parse: function(data) {
		data.id = String(data.id);

		// parse selections
		if (_.has(data, 'selection')) {
			data.line = data.line || data.subtype;
			this.parseSelections(data.selection, data.id, data.eventId, data.line);
			delete data.selection;
		}

		if (data.state == 'S') data.state = 'SUSPENDED';
		if (data.state == 'A' || data.state == 'O') data.state = 'ACTIVE';
		if (data.state == 'V') data.state = 'VOID';
		if (data.state == 'C') data.state = 'CLOSED';
		if (data.suspended && !!data.suspended) {
			data.state = 'SUSPENDED';
			delete data.suspended;
		}

		return data;
	},


	/**
	 * @param selections
	 * @param marketId
	 * @param eventId
	 */
	parseSelections: function(selections, marketId, eventId, line){
		if (_.isNull(this.Selections))
			this.Selections = new SelectionsCollection();

		_.each(selections, function(s) {
			// ensure parent ids are set
			_.defaults(s, {marketId: marketId, eventId: eventId, parent: this, line:line});

			// if market doesn't already exist, create with the new market data
			if (this.findSelection(s.id) == null) {
				if (_.has(s, 'odds')) {
					s.rootIdx = s.odds.rootIdx;
					if (s.rootIdx == -1)
						s.americanOdds = '-';
					else {
						var oddsObj = this.oddsFactory().getOddsByIndex(s.rootIdx);
						s.decimalOdds = oddsObj.decimal;
						s.fractionalOdds = oddsObj.fractional;
						s.americanOdds = oddsObj.american;
					}
				}

				this.Selections.add(new Selection(s, {parse: true}));
				return;
			}

			// otherwise update the existing market
			var selection = this.findSelection(s.id);
			this.listenToOnce(selection,"change:rootIdx", this.onSelectionPriceChange);
			this.listenToOnce(selection,"change:line", this.onSelectionLineChange);

			this.listenToOnce(selection,"change:displayed", this.onSelectionDisplayedChange);
			this.listenToOnce(selection,"change:state", this.onSelectionStateChange);
			selection.populate(s);
		}, this);
	},


	updateSelectionsWithLine: function(line) {
		var that = this;
		if (_.has(this.Selections,'models')) {
			_.each(this.Selections.models, function(s) {
				that.listenToOnce(s,"change:line", that.onSelectionLineChange);
				s.set('line',line);
			});
		}
	},

	/**
	 * @param id
	 * @returns {*}
	 */
	findSelection: function(id){
		return this.Selections.get(id);
	},

	onSelectionStateChange: function(event) {
		var vent = ctx.get("vent");
		vent.trigger('selection:stateChange', event);
	},

	onSelectionDisplayedChange: function(event) {
		var vent = ctx.get("vent");
		vent.trigger('selection:displayedChange', event);
	},

	/**
	 * @param event
	 */
	onSelectionPriceChange: function(event) {
		var vent = ctx.get("vent");
		var oddsObj = this.oddsFactory().getOddsByIndex(event.attributes.rootIdx);
		if (oddsObj) {
			event.set('decimalOdds',oddsObj.decimal);
			event.set('fractionalOdds',oddsObj.fractional);
			event.set('americanOdds',oddsObj.american);
		}

		vent.trigger('selection:priceChange', event);
	},

	/**
	 * @param event
	 */
	onSelectionLineChange: function(s) {
		var line = s.attributes.line;
		var lineHasChanged = s._previousAttributes.line != line;

		if (!_.isNull(line) && lineHasChanged) {
			var vent = ctx.get("vent");
			vent.trigger('selection:lineChange', s);
		}
	}

});

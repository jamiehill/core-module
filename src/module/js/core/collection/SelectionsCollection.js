import Selection from '../model/Selection';

var Selections = Backbone.Collection.extend({
	model: Selection,
	sortType: 'eventTime',

	/**
	 * Sort by displayOrder
	 * @param market
	 * @returns {*}
	 */
	comparator: function(a, b) {
		switch(this.sortType) {
			case 'row':
				return this.sortByRow(a, b);
			case 'priceHigh':
				return this.sortByPriceHigh(a, b);
			case 'priceLow':
				return this.sortByPriceLow(a, b);
			case 'byType':
				return this.sortByPriceHighType(a,b);
		}
		// pos is the default
		return this.sortByPos(a, b);
	},


	/**
	 * @param type
	 */
	changeSort: function(type) {
		this.sortType = type;
		this.sort();
	},



	/**
	 * @returns {Selections}
	 */
	byDisplayed: function() {
		var filtered = this.filter(function(selection) {
			return (selection.get("displayed") === true || selection.get("displayed") === 'true' || selection.get("displayed") === 1 );
		});

		var selections = new Selections(filtered);
		selections.changeSort(this.sortType);
		return selections;
	},

	/**
	 * Returns the selections  by price
	 * @returns {Selections}
	 */
	byPriceHigh: function() {
		var selections = new Selections(this.models);
		selections.changeSort('byType');
		return selections;
	},


	/**
	 * @returns {*}
	 */
	byNoneRunner: function() {
		var filtered = this.filter(function(selection) {
			var name = selection.get("name");
			return !_.includes(name, 'N/R');
		});

		var selections = new Selections(filtered);
		selections.changeSort(this.sortType);
		return selections;
	},

	/**
	 * Returns the selections for a specific column, ordered by row
	 * @param col
	 * @returns {Selections}
	 */
	byColumn: function(col) {
		var filtered = this.filter(function(selection) {
			return selection.attributes.pos.col == col;
		});

		var selections = new Selections(filtered);
		selections.changeSort('row');
		return selections;
	},


	/**
	 * @param odd
	 * @returns {*}
	 */
	byOddEven: function(odd) {
		var filtered = this.filter(function(selection, index) {
			return (index % 2) == odd;
		});

		var selections = new Selections(filtered);
		selections.changeSort('priceHigh');
		return selections;
	},

	/**
	 * @returns {Selections}
	 */
	sortByName: function() {
		var selections = new Selections(this.models);
		_.sortBy(selections.models, function(s) {
			return s.attributes.name;
		});
		return selections;
	},

	/**
	 * Sorts the selections by price and puts the NONE type selections at the bottom
	 * @returns {Selections}
	 */
	sortByPriceHighType: function(a, b) {

		var aPrice = parseInt(a.attributes.rootIdx),
			bPrice = parseInt(b.attributes.rootIdx);

		var aCol = a.attributes.type,
			bCol = b.attributes.type;

		if (((aPrice < bPrice)&& aCol != 'NONE') || (bCol == 'NONE')) return -1;
		if (((aPrice > bPrice)&& bCol != 'NONE') || (aCol == 'NONE')) return 1;

		return 0;
	},


	/**
	 * Sorts the selections by column position
	 * @returns {Array|*}
	 */
	sortByPos: function(a, b) {
		// first, ensure the pos object exists
		//_.defaults(a.attributes, {pos: {row: 1, col: 1}});
		//_.defaults(b.attributes, {pos: {row: 1, col: 1}});
		// get the column values
		var aCol = a.attributes.pos.col,
			bCol = b.attributes.pos.col;
		// and sort accordingly
		if (aCol < bCol) return -1;
		if (aCol > bCol) return 1;
		return 0;
	},


	/**
	 * Sorts the selections by row position
	 * @returns {Array|*}
	 */
	sortByRow: function(a, b) {
		var aRow = a.attributes.pos.row,
			bRow = b.attributes.pos.row;
		// and sort accordingly
		if (aRow < bRow) return -1;
		if (aRow > bRow) return 1;
		return 0;
	},


	/**
	 * @param a
	 * @param b
	 * @returns {number}
	 */
	sortByPriceHigh: function(a, b) {
		var aPrice = parseInt(a.attributes.rootIdx),
			bPrice = parseInt(b.attributes.rootIdx);
		if (aPrice < bPrice) return -1;
		if (aPrice > bPrice) return 1;
		return 0;
	},


	/**
	 * @param a
	 * @param b
	 * @returns {number}
	 */
	sortByPriceLow: function(a, b) {
		return -this.sortByPriceHigh(a, b);
	}
});

export default Selections;

import Decorator from './ReactDecorator';

export default Marionette.View.extend(Decorator).extend({
	// returns the react component for this view,
	// with necessary data applied to its constructor
	react() {
		var Component = this.options.component,
			Data = this.options.data;
		return Component(Data);
	},

	//onShow() {
	//	// Get rid of that pesky wrapping-div.
	//	// Assumes 1 child element present in template.
	//	this.$el = this.$el.children();
	//	// Unwrap the element to prevent infinitely
	//	// nesting elements during re-render.
	//	this.$el.unwrap();
	//	this.setElement(this.$el);
	//}
});

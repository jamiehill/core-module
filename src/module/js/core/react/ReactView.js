import Decorator from './ReactDecorator';

export default Marionette.View.extend(Decorator).extend({
	// returns the react component for this view,
	// with necessary data applied to its constructor
	react() {
		var Component = this.options.component,
			Data = this.options.data;
		return Component(Data);
	}
});

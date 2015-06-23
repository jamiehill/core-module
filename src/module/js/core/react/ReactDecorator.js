import React from 'react';

export default {
	onShow: function() {
		if (this._reactMountEl) {
			React.unmountComponentAtNode(this._reactMountEl);
		}

		this._reactMountEl = this.$el[0];
		var component = this.react();
		React.render(component, this._reactMountEl);
	},

	onDestroy: function() {
		if (this._reactMountEl) {
			React.unmountComponentAtNode(this._reactMountEl);
		}
	}
};

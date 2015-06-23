export default {
	/**
	 * equivalent to marionette onShow in the react world,
	 * listen to backbone model change events to update the
	 * components when one occurs, if a model has been set
	 */
	componentDidMount() {
		if (_.has(this.props, 'model')) {
			this.model = this.props.model;
			this.model.on('change', this._forceUpdate, this);
		}
		if (_.has(this.props, 'collection')) {
			this.collection = this.props.collection;
			this.collection.on('', this._forceUpdate, this);
		}
	},

	/**
	 * Removes any listeners if previously added
	 */
	componentWillUnmount() {
		if (_.has(this.props, 'model')) {
			this.model = this.props.model;
			this.model.off('change', this._forceUpdate);
		}
		if (_.has(this.props, 'collection')) {
			this.collection = this.props.collection;
			this.collection.off('', this._forceUpdate);
		}
	},

	/**
	 * Forces update of the component on model change
	 */
	_forceUpdate() {
		if (this.isMounted()) this.forceUpdate();
	}
};

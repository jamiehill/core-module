import React from 'react';
//import './React.BackboneMixin';
import BackboneMixin from './BackboneMixin';

//export default React.createBackboneClass({
//	render() {} // must override in subclasses
//});

//var Component = React.createClass({
//	mixins: [BackboneMixin],
//	render() {}
//})
//
//export default class BackboneComponent extends Component {
//	constructor(props) {
//		super(props);
//		this.uuid = _.uniqueId();
//	}
//}

export default React.createClass({
	mixins: [BackboneMixin],
	uuid: _.uniqueId(),
	render() {}
})

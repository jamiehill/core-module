import DeferredBase from '../defer/Deferred';
import oddsFactory from '../../model/factory/OddsFactory';

export default class RootLadder extends DeferredBase {
	constructor() {
		super('RootLadder');
	}

	initialize() {
		oddsFactory.fetch().done(this.success);
	}

}

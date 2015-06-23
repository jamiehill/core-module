import DeferredBase from '../defer/Deferred';

export default class RootLadder extends DeferredBase {
	constructor(name) {
		super('RootLadder');
	}

	initialize() {
		ctx.get('oddsFactory')
			.fetch().done(this.success);
	}

}

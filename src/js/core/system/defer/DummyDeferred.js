import Deferred from './Deferred';

export default class DummyDeferred extends Deferred {
	constructor() {
		super('DummyDeferred');
		this.resolution = 'resolve';
		this.delay = 1000;
	}

	init() {
		var that = this;
		var promise = new Promise(function(resolve, reject) {
			if (that.resolution == 'resolve') var func = resolve;
			if (that.resolution == 'reject')  var func = reject;
			_.delay(func, that.delay);
		});
		this.initialize();
		return promise;
	}

}

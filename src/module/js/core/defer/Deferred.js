export default class Deferred {
	constructor(name = 'Deferred') {
		_.bindAll(this, 'initialize', 'success', 'failure');
		this.name = name;
	}


	/**
	 * Starts the async operation
	 * @returns {Promise}
	 */
	init() {
		var that = this;
		var promise = new Promise(function(resolve, reject) {
			that.resolve = resolve;
			that.reject = reject;
		});
		this.initialize();
		return promise;
	}


	/**
	 * Override in subclasses
	 */
	initialize() {

	}


	/**
	 *
	 */
	success() {
		console.log('Bootstrap: '+this.name+' - Success');
		this.resolve();
	}

	/**
	 *
	 */
	failure(e) {
		console.log('Bootstrap: '+this.name+' - Failure : '+e);
		this.reject(e);
	}
}

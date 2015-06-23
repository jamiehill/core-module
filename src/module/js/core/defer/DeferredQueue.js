import Deferred from './Deferred';


export default class DeferredQueue extends Deferred {
	constructor(queue) {
		super();
		_.bindAll(this, 'next');
		this.queue = queue;
	}


	/**
	 * Starts the queue
 	 */
	initialize() {
		this.next();
	}


	/**
	 * Exeecute next deferred object in the queue
	 */
	next() {
		var that = this;
		// if there's steps left in the sequence, action them
		if (!!this.queue.length) {
			var obj = this.queue.shift();
			if (_.isString(obj)) {
				System.import(obj).then(function(Obj) {
					obj = new Obj.default(that.options);
					obj.init().then(that.next).catch(that.failure);
				}).catch(that.failure);
			}

			else {
				obj = new obj(this.options);
				obj.init().then(that.next).catch(that.failure);
			}

			return;
		}
		// otherwise finish up
		this.success();
	}

}

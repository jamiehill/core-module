import DeferredBase from '../defer/Deferred';
import {getRegionalSports} from '../../service/ApiService';

export default class GetRegionalSports extends DeferredBase {
	constructor() {
		super('GetRegionalSports');
	}

	initialize() {
		var model = ctx.get('sportsBookModel'), that = this;
		getRegionalSports().then(function(resp) {
			model.set({sports: resp.SportTypes.sports});
			that.success();
		});
	}

}

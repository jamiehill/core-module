import DeferredBase from '../defer/Deferred';
import service from '../../service/ApiService';
import model from '../../model/SportsBookModel';

export default class GetRegionalSports extends DeferredBase {
	constructor() {
		super('GetRegionalSports');
	}

	initialize() {
		var that = this;
		service.getRegionalSports().then(function(resp) {
			model.set({sports: resp.SportTypes.sports});
			that.success();
		});
	}

}

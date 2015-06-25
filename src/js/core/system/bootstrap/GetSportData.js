import DeferredBase from '../defer/Deferred';
import service from '../../service/ApiService';
import model from '../../model/SportDataModel';

export default class GetRegionalSports extends DeferredBase {
	constructor() {
		super('GetSportData');
	}

	initialize() {
		var that = this;
		service.getSportData('SOCCER').then(function(resp) {
			model.set({sports: resp});
			that.success();
		});
	}

}

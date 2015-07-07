import controller from '../controller/subscriptions/SubscriptionController';

export var execute = function(trigger, args) {
	var type = trigger.split(':')[1],
		method = getType(type);
	controller[method].apply(controller, [0].concat(args));
}

export var getType = function(type) {
	var method = 'subscribeToEventView';
	switch(type){
		case 'eventView':
			method = 'subscribeToEventView';
			break;
		case 'eventDetails':
			method = 'subscribeToEventDetails';
			break;
		case 'events':
			method = 'subscribeToEventsAndSchedule';
			break;
		case 'markets':
			method = 'subscribeToMarketsAndSchedule';
			break;
		case 'eventSummaryAndSchedule':
			method = 'subscribeToEventSummaryAndSchedule';
			break;
		case 'cashout':
			method = 'subscribeToCashout';
			break;
	}
	return method;
}

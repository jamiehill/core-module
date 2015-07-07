import controller from '../controller/subscriptions/SubscriptionController';
import {getType} from './Subscription';

export var execute = function(trigger, args) {
	var type = trigger.split(':')[1],
		method = getType(type);
	controller[method].apply(controller, [2].concat(args));
}

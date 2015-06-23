import DeferredBase from '../defer/Deferred';


export default class TranslatorConfig extends DeferredBase {
	constructor(name) {
		super('FrameworkConfig');
	}


	initialize() {

		// override marionette renderer to enable handlebars
		//Marionette.Renderer.render = function (template, data) {
		//	return template(data);
		//};


		this.success();
	}

}

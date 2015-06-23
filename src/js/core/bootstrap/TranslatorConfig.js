import DeferredBase from '../defer/Deferred';
import Translator from '../translation/Translator';

export default class TranslatorConfig extends DeferredBase {
	constructor(name) {
		super('TranslatorConfig');
	}

	initialize() {
		App.Translator = new Translator();
		//App.translator.on("onTranslatorReady", this.promise.resolve);
		App.Translator.build();
		this.success();
	}

}

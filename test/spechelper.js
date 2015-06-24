import '../src/js/plugins';

import chai from 'chai';
import sinon from 'sinon';
import sinonchai from 'sinon-chai';

window.chai = chai;
window.sinon = sinon;
window.chai.use(sinonchai);

window.assert = window.chai.assert;
window.expect = window.chai.expect;
window.should = window.chai.should();

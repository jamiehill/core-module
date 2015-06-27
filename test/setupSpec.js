window.__karma__.loaded = function() {
};

import chai from 'chai';
import sinon from 'sinon';
import sinonchai from 'sinon-chai';

window.chai = chai;
window.sinon = sinon;
window.chai.use(sinonchai);

window.assert = window.chai.assert;
window.expect = window.chai.expect;
window.should = window.chai.should();

import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

window._ = _;
window.$ = $;

import Marionette from 'backbone.marionette';
window.Marionette = Marionette;

import di from 'di-lite';
import _s from 'underscore.string';
import cookie from 'jquery-cookie';

_.mixin(_s.exports());
_.includes = _.include;

beforeEach(function() {
	this.sandbox = window.sinon.sandbox.create();
	window.stub = this.sandbox.stub.bind(this.sandbox);
	window.spy  = this.sandbox.spy.bind(this.sandbox);
});

afterEach(function() {
	delete window.stub;
	delete window.spy;
	this.sandbox.restore();
});

window.__karma__.start();

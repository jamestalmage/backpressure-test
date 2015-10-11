'use strict';
var assert = require('assert');
var timeout = require('../lib/timeout.js');

describe('timeout', () => {
	it('returns a promise', done => {
		timeout().then(done);
	});

	it('resolves with a value', done => {
		timeout('hello').then(val => {
			assert.strictEqual(val, 'hello');
			done();
		});
	});

	it('resolves after a given timeout', done => {
		var timer = 0;
		setTimeout(() => timer = 10, 10);
		setTimeout(() => timer = 20, 20);
		timeout('goodbye', 15).then(val => {
			assert.strictEqual(val, 'goodbye');
			assert.strictEqual(timer, 10);
			done();
		}).catch(done);
	});
});

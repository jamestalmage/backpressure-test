'use strict';
var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
describe('content-stream', function () {
	var contentStream;

	beforeEach(() => contentStream = proxyquire('../lib/content-stream.js', {
		'readable-stream': {
			Readable: sinon.spy(options => {
				options.pushed = [];
				options.push = chunk => options.pushed.push(chunk && chunk.toString());
				return options;
			})
		}
	}));

	it('number arg', () => {
		var cs = contentStream(7);
		cs.read(3);
		cs.read(10);
		assert.deepEqual(['abc', 'defg', null], cs.pushed);
	});

	it('string arg', () => {
		var cs = contentStream('Hello World!');
		cs.read(3);
		cs.read(4);
		cs.read(2);
		cs.read(10);
		assert.deepEqual(['Hel', 'lo W', 'or', 'ld!', null], cs.pushed);
	});

	it('Buffer arg', () => {
		var cs = contentStream(new Buffer('Hello World!'));
		cs.read(3);
		cs.read(4);
		cs.read(2);
		cs.read(10);
		assert.deepEqual(['Hel', 'lo W', 'or', 'ld!', null], cs.pushed);
	});
});

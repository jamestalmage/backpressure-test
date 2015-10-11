'use strict';
var assert = require('assert');
var _contentStream = require('../lib/content-stream.js');

describe('content-stream', function () {
	var pushed;

	beforeEach(() => pushed = []);

	function contentStream(opts) {
		var s = _contentStream(opts);
		s.push = chunk => pushed.push(chunk && chunk.toString());
		s.read = s._read;
		return s;
	}

	it('number arg', () => {
		var cs = contentStream(7);
		cs.read(3);
		cs.read(10);
		assert.deepEqual(['abc', 'defg', null], pushed);
	});

	it('string arg', () => {
		var cs = contentStream('Hello World!');
		cs.read(3);
		cs.read(4);
		cs.read(2);
		cs.read(10);
		assert.deepEqual(['Hel', 'lo W', 'or', 'ld!', null], pushed);
	});

	it('Buffer arg', () => {
		var cs = contentStream(new Buffer('Hello World!'));
		cs.read(3);
		cs.read(4);
		cs.read(2);
		cs.read(10);
		assert.deepEqual(['Hel', 'lo W', 'or', 'ld!', null], pushed);
	});
});

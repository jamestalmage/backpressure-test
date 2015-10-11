'use strict';
require('co-mocha');
var bpt = require('../lib/');
var validatingWritable = bpt.validatingWritable;
var validatingDuplex = bpt.validatingDuplex;
var timeout = bpt.timeout;
var contentStream = bpt.contentStream;
var assert = require('assert');

describe('basic-usage', () => {
	it('validatingWritable - highWaterMark: 3', function *() {
		var writable = validatingWritable();
		contentStream({content: 'Hello world!', highWaterMark: 3}).pipe(writable);
		yield timeout();
		writable.chunk('Hel').chunk('lo ').chunk('wor').chunk('ld!').waiting();
	});

	it('validatingWritable - highWaterMark: 4', function *() {
		var writable = validatingWritable();
		contentStream({content: 'Hello world!', highWaterMark: 4}).pipe(writable);
		yield timeout();
		writable.chunk('Hell').chunk('o wo').chunk('rld!').finished();
	});

	it('validatingDuplex - no outlet - highWaterMark: 3', function *() {
		var content = contentStream({content: 'Hello world!', highWaterMark: 5});
		var duplex = validatingDuplex({highWaterMark: 3});
		content.pipe(duplex);
		yield timeout();
		duplex.chunk('Hello');

		// pipe is full - we will wait forever
		yield duplex.waiting();
		yield duplex.waiting();
		yield duplex.waiting();

		assert.deepEqual(content.chunks, ['Hello', ' worl']);
	});
});

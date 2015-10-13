'use strict';
require('co-mocha');
var inspectWritable = require('../lib/inspect-writable.js');
var contentStream = require('../lib/content-stream');
var Writable = require('readable-stream').Writable;
var timeout = require('../lib/timeout');
var assert = require('assert');

describe('inspect-writable', function () {
	it('has tests', function *() {
		var cs = contentStream({highWaterMark: 5, content: 20});

		var first = true;
		var cb;
		var writable = inspectWritable(new Writable({
			highWaterMark: 5,
			write: (chunk, enc, _cb) => {
				if (first) {
					first = false;
					cb = _cb;
					return;
				}
				_cb();
			}
		}));

		cs.pipe(writable);

		yield timeout();
		cb();
		writable.validateChunks('abcde', 'fghij');
		writable.assertWaiting();
		yield timeout();
		writable.validateChunk('klmno');
		writable.validateChunk('pqrst');
		assert(writable.waiting());
		assert.deepEqual(writable.getChunkStrings(), [
			'abcde', 'fghij', 'klmno', 'pqrst'
		]);

		assert.throws(() => writable.validateChunk('blahblah'), /no data available/);
	});
});

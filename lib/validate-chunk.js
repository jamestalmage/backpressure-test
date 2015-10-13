'use strict';
module.exports = validateChunk;
var assert = require('assert');
var bufferEqual = require('buffer-equal');
function validateChunk(expected, compareTo, i) {
	if (Buffer.isBuffer(compareTo) && typeof expected === 'string') {
		expected = new Buffer(expected);
	}
	if (Buffer.isBuffer(compareTo)) {
		assert(Buffer.isBuffer(expected), 'stream contains buffers, but tried to validate a: ' + (typeof expected));
		if (!bufferEqual(compareTo, expected)) {
			assert.fail(compareTo.toString(), expected.toString(), 'invalid chunk at ' + i);
		}
	} else {
		assert(!Buffer.isBuffer(expected), 'stream contains non-buffers, but tried to validate a buffer');
		assert.deepEqual(compareTo, expected, 'invalid objectMode chunk at: ' + i);
	}
	return true;
}

'use strict';
module.exports = inspectReadable;
var assert = require('assert');
var isReadable = require('is-stream').readable;

function inspectReadable(input) {
	assert(isReadable(input), 'input must be a readable stream');

	var chunks = [];
	var requests = [];
	var push = input.push;
	var read = input._read;

	input.push = (chunk, enc) => { // eslint-disable-line no-unused-vars
		chunks.push(copyBuffer(chunk));
		return push.apply(input, arguments);
	};

	input._read = n => {
		requests.push(n);
		return read.apply(input, arguments);
	};

	Object.defineProperties(input, {
		chunks: {
			get: function () {
				return chunks.map(function (buffer) {
					return buffer && buffer.toString();
				});
			}
		},
		chunkBuffers: {
			get: function () {
				return chunks.map(copyBuffer);
			}
		},
		requests: {
			get: function () {
				return requests.slice();
			}
		}
	});

	return input;
}

function copyBuffer(buffer) {
	return Buffer.isBuffer(buffer) ? new Buffer(buffer) : buffer;
}

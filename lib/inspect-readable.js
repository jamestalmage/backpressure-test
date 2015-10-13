'use strict';
module.exports = inspectReadable;
var assert = require('assert');
var isReadable = require('is-stream').readable;
var makeChunkList = require('./chunk-list');

function inspectReadable(input) {
	assert(isReadable(input), 'input must be a readable stream');

	var chunkList = makeChunkList();
	var requestsArray = [];
	var push = input.push;
	var read = input._read;

	input.push = function (chunk, enc) { // eslint-disable-line no-unused-vars
		chunkList.pushChunk(chunk);
		return push.apply(input, arguments);
	};

	input._read = function (n) {
		requestsArray.push(n);
		return read.apply(input, arguments);
	};

	function getRequests() {
		return requestsArray.slice();
	}

	function chunks() {
		if (arguments.length === 0) {
			return chunkList.getChunkStrings();
		}
		return chunkList.validateChunks.apply(null, arguments);
	}

	Object.defineProperties(input, {
		chunks: {
			value: chunks
		},
		chunkBuffers: {
			get: chunkList.getChunks
		},
		requests: {
			get: getRequests
		}
	});

	return input;
}

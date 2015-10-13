'use strict';
module.exports = inspectReadable;
var assert = require('assert');
var isReadable = require('is-stream').readable;
var copyBuffer = require('./copy-buffer');
var cValidate = require('./validate-chunk');

function inspectReadable(input) {
	assert(isReadable(input), 'input must be a readable stream');

	var chunksArray = [];
	var requestsArray = [];
	var validatedChunks = 0;
	var push = input.push;
	var read = input._read;

	input.push = function (chunk, enc) { // eslint-disable-line no-unused-vars
		chunksArray.push(copyBuffer(chunk));
		return push.apply(input, arguments);
	};

	input._read = function (n) {
		requestsArray.push(n);
		return read.apply(input, arguments);
	};

	function getChunks() {
		return chunksArray.map(function (buffer) {
			return buffer && buffer.toString();
		});
	}

	function getChunkBuffers() {
		return chunksArray.map(copyBuffer);
	}

	function getRequests() {
		return requestsArray.slice();
	}

	function validateChunk(chunk, i) {
		assert(i < chunksArray.length, 'index out of bounds');
		cValidate(chunk, chunksArray[i], i);
		return true;
	}

	function validateChunks(arr) {
		if (!Array.isArray(arr)) {
			arr = Array.prototype.slice.call(arguments);
		}
		arr.forEach(function (chunk, index) {
			validateChunk(chunk, validatedChunks + index);
		});
		validatedChunks += arr.length;
		return true;
	}

	function chunks() {
		if (arguments.length === 0) {
			return getChunks();
		}
		return validateChunks.apply(null, arguments);
	}

	Object.defineProperties(input, {
		chunks: {
			value: chunks
		},
		chunkBuffers: {
			get: getChunkBuffers
		},
		requests: {
			get: getRequests
		}
	});

	return input;
}

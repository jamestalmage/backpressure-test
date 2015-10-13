'use strict';
module.exports = chunkList;
var copyBuffer = require('./copy-buffer');
var validateChunk = require('./validate-chunk');
var assert = require('assert');

function chunkList() {
	var chunks = [];
	var validationPoint = 0;
	var list = {
		pushChunk: function (chunk) {
			chunks.push(copyBuffer(chunk));
		},
		getChunks: function () {
			return chunks.map(copyBuffer);
		},
		getChunkStrings: function () {
			return chunks.map(function (val) {
				return val.toString();
			});
		},
		validateChunk: function (expected) {
			if (validationPoint >= chunks.length) {
				assert.fail('no data available');
			}
			validateChunk(expected, chunks[validationPoint], validationPoint);
			validationPoint++;
			return list;
		},
		validateChunks: function (chunks) {
			if (arguments.length > 1 || !Array.isArray(chunks)) {
				return list.validateChunks(Array.prototype.slice.call(arguments));
			}
			chunks.forEach(list.validateChunk, this);
		},
		waiting: function () {
			return validationPoint >= chunks.length;
		},
		assertWaiting: function () {
			assert(list.waiting(), 'expected to be waiting');
		}
	};
	return list;
}

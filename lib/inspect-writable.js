'use strict';
module.exports = inspectWritable;
var assert = require('assert');
var isWritable = require('is-stream').writable;
var chunkList = require('./chunk-list');

function inspectWritable(input) {
	assert(isWritable(input), 'input must be a writable stream');

	var write = input._write;

	var list = chunkList();

	input._write = function (chunk, enc, callback) { // eslint-disable-line no-unused-vars
		list.pushChunk(chunk);
		write.apply(input, arguments);
	};

	input.validateChunk = list.validateChunk;
	input.validateChunks = list.validateChunks;
	input.waiting = list.waiting;
	input.assertWaiting = list.assertWaiting;
	input.getChunks = list.getChunks;
	input.getChunkStrings = list.getChunkStrings;

	Object.defineProperty(input, 'writes', {get: list.getChunks});

	return input;
}

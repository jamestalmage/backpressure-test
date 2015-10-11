'use strict';
var assert = require('assert');
var timeout = require('./timeout');
var completionAssertions = require('./completion-assertions');
var contentStream = require('./content-stream');
var util = require('util');
var format = util.format;
var stream = require('readable-stream');
var Writable = stream.Writable;
var Duplex = stream.Duplex;

module.exports = {
	contentStream: contentStream,
	validatingWritable: validating.bind(null, Writable),
	validatingDuplex: validating.bind(null, Duplex),
	timeout: timeout
};

function validating(constructor, options) {
	options = options || {};
	var NO_DATA = new Buffer(0);
	var currentChunk = NO_DATA;
	var currentCallback = null;

	function validateChunk(str) {
		if (currentChunk === NO_DATA) {
			assert.fail('undefined', JSON.stringify(str), format('expected %j but it has not been read yet', str));
		}
		assert.strictEqual(currentChunk.toString(), str.toString());
		var cb = currentCallback;
		currentChunk = NO_DATA;
		currentCallback = null;
		cb();
		return extend({});
	}

	function waiting() {
		if (currentChunk !== NO_DATA) {
			assert.fail(
				currentChunk.toString(),
				'undefined',
				format('expected to be waiting for data, but %j is available', currentChunk.toString())
			);
		}
		return extend(timeout());
	}

	if (constructor === Writable) {
		options.write = function (chunk, enc, callback) {
			currentChunk = new Buffer(chunk);
			currentCallback = callback;
		};
	}

	if (constructor === Duplex) {
		options.write = function (chunk, enc, callback) {
			currentChunk = new Buffer(chunk);
			currentCallback = function () {
				if (this.push(chunk)) {
					return callback();
				}
				this.on('drain', callback);
			}.bind(this);
		};
		options.read = noop;
	}

	var stream = new constructor(options);
	var completions = completionAssertions(stream);

	function extend(val) {
		val.waiting = waiting;
		val.chunk = validateChunk;
		return completions(val);
	}

	return extend(stream);
}

function noop() {}

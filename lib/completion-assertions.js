'use strict';
module.exports = completionAssertions;
var assert = require('assert');
var format = require('util').format;
var isStream = require('is-stream');
var timeout = require('./timeout');

function completionAssertions(stream) {
	var readable = isStream.readable(stream);
	var writable = isStream.writable(stream);
	assert(readable || writable, 'not a readable or writable stream');
	var duplex = readable && writable;
	var typeName = 'duplex';
	if (!duplex) {
		typeName = writable ? 'writable' : 'readable';
	}
	var isFinished = false;
	var isEnded = false;

	function finished() {
		assert(writable, 'don\'t call finished() on readable streams; use ended()');
		assert(isFinished, 'expected stream to have finished (it has ' + (isEnded ? 'ended but not finished' : 'not') + ').');
		return extend(timeout());
	}

	function ended() {
		assert(readable, 'don\'t call ended() on writable streams; use finished()');
		assert(isEnded, 'expected stream to have ended (it has ' + (isFinished ? 'finished but not ended' : 'not') + ').');
		return extend(timeout());
	}

	function done() {
		assert(duplex, format('don\'t call done() on %s streams; use %sed()', typeName, writable ? 'finish' : 'end'));
		assert(isDone(), 'expected stream to be done (finished:false || ended:false).');
		return extend(timeout());
	}

	function complete() {
		assert(duplex, format('don\'t call complete() on %s streams; use %sed()', typeName, writable ? 'finish' : 'end'));
		assert(isComplete(), format('expected stream to be complete (finished:%j && ended:%j).', isFinished, isEnded));
		return extend(timeout());
	}

	function isDone() {
		return isEnded || isFinished;
	}

	function isComplete() {
		return isEnded && isFinished;
	}

	if (writable) {
		stream.on('finish', function () {
			isFinished = true;
		});
	}

	if (readable) {
		stream.on('end', function () {
			isEnded = true;
		});
	}

	function extend(val) {
		val.finished = finished;
		val.ended = ended;
		val.done = done;
		val.complete = complete;
		return val;
	}

	Object.defineProperties(extend, {
		isFinished: {
			get: function () {
				return isFinished;
			}
		},
		isEnded: {
			get: function () {
				return isEnded;
			}
		},
		isComplete: {
			get: isComplete
		},
		isDone: {
			get: isDone
		}
	});

	extend(stream);

	return extend;
}

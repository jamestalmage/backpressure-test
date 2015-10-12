'use strict';
var assert = require('assert');
var completions = require('../lib/completion-assertions.js');
var stream = require('readable-stream');
var sinon = require('sinon');

describe('stream-completion-assertions', () => {
	var spy;

	beforeEach(() => spy = sinon.spy());

	it('adds end listener to readable stream', () => {
		completions(spyReadable(spy));
		assert(spy.calledWith('end'), 'called with end');
		assert(!spy.calledWith('finish'), 'not called with finish');
	});

	it('adds finish listener to writable stream', () => {
		completions(spyWritable(spy));
		assert(spy.calledWith('finish'), 'called with finish');
		assert(!spy.calledWith('end'), 'not called with end');
	});

	it('adds finish and end listeners to duplex stream', () => {
		completions(spyDuplex(spy));
		assert(spy.calledWith('end'), 'called with end');
		assert(spy.calledWith('finish'), 'called with finish');
	});

	it('end throws before end, not after', () => {
		var readable = spyReadable(spy);
		completions(readable);
		assert.throws(() => readable.ended(), /ended \(it has not\)/);
		end(spy);
		readable.ended();
	});

	it('finish throws before finish, not after', () => {
		var writable = spyWritable(spy);
		completions(writable);
		assert.throws(() => writable.finished(), /finished \(it has not\)/);
		finish(spy);
		writable.finished();
	});

	it('done/completed throws before, not after', () => {
		var duplex = spyDuplex(spy);
		completions(duplex);
		assert.throws(() => duplex.done(), /done \(finished:false \|\| ended:false\)/);
		assert.throws(() => duplex.complete(), /complete \(finished:false && ended:false\)/);
		end(spy);
		assert.throws(() => duplex.finished(), /ended but not finished/);
		assert.throws(() => duplex.complete(), /complete \(finished:false && ended:true\)/);
		duplex.done();
		finish(spy);
		duplex.complete();
	});

	it('ended throws "finished but not ended"', () => {
		var duplex = spyDuplex(spy);
		completions(duplex);
		finish(spy);
		assert.throws(() => duplex.ended(), /finished but not ended/);
		end(spy);
		duplex.complete();
	});

	it('helpful error messages if using wrong method for stream type', () => {
		var readable = spyReadable(sinon.spy());
		completions(readable);
		var writable = spyWritable(sinon.spy());
		completions(writable);

		assert.throws(() => readable.done(), /readable.*use ended/);
		assert.throws(() => writable.done(), /writable.*use finished/);
		assert.throws(() => readable.complete(), /readable.*use ended/);
		assert.throws(() => writable.complete(), /writable.*use finished/);
		assert.throws(() => readable.finished(), /readable.*use ended/);
		assert.throws(() => writable.ended(), /writable.*use finished/);
	});

	it('completions properties', () => {
		var duplex = spyDuplex(spy);
		var c = completions(duplex);
		assert(!c.isEnded, 'not ended');
		assert(!c.isFinished, 'not finished');
		assert(!c.isComplete, 'not complete');
		assert(!c.isDone, 'not done');

		end(spy);
		assert(c.isEnded, 'ended');
		assert(!c.isFinished, 'not finished');
		assert(!c.isComplete, 'not complete');
		assert(c.isDone, 'done');

		finish(spy);
		assert(c.isEnded, 'ended');
		assert(c.isFinished, 'finished');
		assert(c.isComplete, 'complete');
		assert(c.isDone, 'done');
	});

	function end(spy) {
		callEach(spy.withArgs('end'));
	}

	function finish(spy) {
		callEach(spy.withArgs('finish'));
	}

	function callEach(spyCall) {
		for (var i = 0; i < spyCall.callCount; i++) {
			spyCall.getCall(i).args[1]();
		}
	}

	function spyReadable(spy) {
		return spyOn(new stream.Readable({read: noop}), spy);
	}

	function spyWritable(spy) {
		return spyOn(new stream.Writable({write: noop}), spy);
	}

	function spyDuplex(spy) {
		return spyOn(new stream.Duplex({read: noop, write: noop}), spy);
	}

	function spyOn(stream, spy) {
		stream.on = spy;
		return stream;
	}

	function noop() {}
});

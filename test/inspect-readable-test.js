'use strict';
var assert = require('assert');
var inspectReadable = require('../lib/inspect-readable.js');
var Readable = require('readable-stream').Readable;
var sinon = require('sinon');

describe('inspect-readable', () => {
	var spy;
	var readable;
	beforeEach(() => readable = inspectReadable(new Readable({
		read: spy = sinon.spy(),
		highWaterMark: 5
	})));

	it('calls to `_read` are logged on `.requests`', () => {
		readable.read(2);
		assert.spyCalledWith(spy, 5);
		assert.deepEqual(readable.requests, [5]);
	});

	it('pushed values are logged to chunks', () => {
		readable.push(new Buffer('hello'));
		readable.push(new Buffer('goodbye'));
		assert.deepEqual(readable.chunks(), ['hello', 'goodbye']);
	});

	it('calling chunks(..)', () => {
		readable.push(new Buffer('hello'));
		readable.push(new Buffer('goodbye'));
		readable.chunks(['hello', 'goodbye']);
	});

	it('chunks(..) progresses the validation point with each call', () => {
		readable.push(new Buffer('hello'));
		readable.chunks([new Buffer('hello')]);
		readable.push(new Buffer('goodbye'));
		readable.chunks([new Buffer('goodbye')]);
	});

	it('chunks(..) throws if expectations are not met', () => {
		readable.push(new Buffer('hello'));
		assert.throws(() => readable.chunks(['goodbye']));
	});

	it('chunks(..) can validate in object mode', () => {
		readable = inspectReadable(new Readable({
			read: spy,
			objectMode: true,
			highWaterMark: 5
		}));
		readable.push({foo: 'bar'});
		readable.push({baz: 'quz'});
		readable.chunks({foo: 'bar'}, {baz: 'quz'});
	});

	it('chunkBuffers returns Buffers', () => {
		readable.push(new Buffer('hello'));
		var buffs = readable.chunkBuffers;
		assert.strictEqual(buffs.length, 1, 'buffs.length');
		assert(Buffer.isBuffer(buffs[0]), 'is Buffer');
		assert.strictEqual(buffs[0].toString(), 'hello');
	});
});

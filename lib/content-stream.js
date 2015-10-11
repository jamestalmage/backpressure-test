module.exports = contentStream;
var Readable = require('readable-stream').Readable;
var a = new Buffer('a')[0];

function contentStream(opts) {
	var pos = 0;
	var chunks = [];
	var requests = [];
	var content;
	var length;

	if (Buffer.isBuffer(opts) || typeof opts !== 'object') {
		opts = {
			content: opts
		};
	}
	content = opts.content;

	if (typeof content === 'string') {
		content = new Buffer(content);
	}
	if (typeof content === 'number') {
		length = content;
		content = new Buffer(length);
		for (var i = 0; i < length; i++) {
			content[i] = a + (i % 26);
		}
	}
	if (!Buffer.isBuffer(content)) {
		throw new Error('content must be a string, buffer, or number');
	}

	opts.content = content;
	length = content.length;

	opts.read = function (n) {
		var tempPos = pos;
		pos = Math.min(pos + n, length);
		var chunk = content.slice(tempPos, pos);
		chunks.push(new Buffer(chunk));
		requests.push(n);
		this.push(chunk);
		if (pos === length) {
			this.push(null);
		}
	};

	var readable = new Readable(opts);

	Object.defineProperties(readable, {
		chunks: {
			get: function () {
				return chunks.map(function (buffer) {
					return buffer.toString();
				});
			}
		},
		chunkBuffers: {
			get: function () {
				return chunks.map(function (buffer) {
					return new Buffer(buffer);
				});
			}
		},
		requests: {
			get: function () {
				return requests.slice();
			}
		}
	});

	return readable;
}

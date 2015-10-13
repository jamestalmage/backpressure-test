'use strict';
module.exports = copyBuffer;

function copyBuffer(buffer, decodeStrings) {
	if (Buffer.isBuffer(buffer) || (decodeStrings !== false && typeof buffer === 'string')) {
		return new Buffer(buffer);
	}
	return buffer;
}

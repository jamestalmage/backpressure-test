module.exports = timeout;

function timeout(result, delay) {
	return new Promise(function (resolve) {
		setTimeout(resolve.bind(null, result), delay);
	});
}

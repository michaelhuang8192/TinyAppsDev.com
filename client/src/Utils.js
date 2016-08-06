

module.exports.parentLink = function() {
	return location.pathname.match(/\/[^\/]+\/[^\/]+/)[0] + location.search + location.hash;
}


module.exports.editLink = function() {
	return location.pathname + '/edit' + location.search + location.hash;
}
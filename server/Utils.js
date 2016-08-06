var querystring = require('querystring');

exports.fetchJSON = function(req) {
	return new Promise(function(resolve, reject) {

		resolve(JSON.parse(req.body.js));

	});
};

exports.getNewID = function(table, type) {
	return new Promise(function(resolve, reject) {
		table.findOneAndUpdate(
			{ _id: type },
			{ $inc: { val: 1 } }
		).then(function(r) {
			resolve(r.value.val);
		}).catch(function(err) {
			reject(err);
		});
	});
};

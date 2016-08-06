var querystring = require('querystring');

exports.fetchJSON = function(req) {
	return new Promise(function(resolve, reject) {
		var body = [];
		req.setEncoding('utf8');
		req.on('data', function (data) {
			body.push(data);
		});
		req.on('end', function() {
			try{
				var qs = querystring.parse(body.join(''));
				var js = JSON.parse(qs.js);

				resolve(js);
			} catch(err) {
				reject(err);
			}
		});
		req.on('error', function(err) {
			reject(err);
		});
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

let gUrl = require('urllib');
let gExpress = require('express');
let gBodyParser = require('body-parser');

let gRouter = gExpress.Router();
gRouter.post('/update', gBodyParser.json(), update);
module.exports = gRouter;


let gUpdateServiceStarted = false;

function update(req, res, next) {
	let _id = req.body._id;
	let code = req.body.code;
	let ip = req.headers['x-real-ip'];

	startUpdateService(req.app);

	req.app.locals.db.collection("Domain").updateOne(
		{_id: _id, code: code, ip: {$ne: ip}},
		{$set: {ip: ip}, $inc: {changed: 1}}
	).then((result) => {
		res.json({});
	}).catch((err) => {
		next(err);
	});
}

function startUpdateService(app) {
	if(gUpdateServiceStarted) return;
	console.log("start domain update service")
	gUpdateServiceStarted = true;
	setInterval(runUpdate.bind(app), 60000);
}

function runUpdate() {
	let app = this;
	let domain = app.locals.db.collection("Domain");

	domain.find({changed: {$ne: 0}}).toArray()
	.then((docs) => {
		for(var doc of docs) {
			((doc) => {
				return updateRecord(app.locals.config, doc._id, doc.name, doc.ip)
				.then((result) => {
					console.log(result.data);
					if((result.data || {}).data)
						domain.updateOne(
							{_id: doc._id, changed: doc.changed},
							{$set: {changed: 0}}
						);
				}).catch((err) => {
					console.log(err);
				});
			})(doc);
		}

	}).catch((err) => {
		console.log(err);
	});
}

function loadCookie(arr) {
	var cookies = {};
	for(var cs of arr) {
		var ck = cs.split(';', 2)[0].trim().split('=');
		cookies[ck[0]] = ck[1]
	}
	return cookies;
}

function updateRecord(config, _id, name, ip) {
	return gUrl.request('https://sso.godaddy.com/v1/?path=&app=mya&realm=idp&pc=urlargs', {
		method: 'POST',
		data: {
			name: config.GoDaddy_UserName,
			password: config.GoDaddy_UserPassword
		},
		dataType: "text"
	}).then((result) => {
		return loadCookie(result.headers['set-cookie'])['auth_idp'];

	}).then((auth_idp) => {
		var headers = {
			Cookie: 'auth_idp=' + auth_idp
		};

		return gUrl.request('https://dcc.godaddy.com/manage/', {
			headers: headers,
			dataType: "text"
		}).then((result) => {
			return [auth_idp, loadCookie(result.headers['set-cookie'])['XSRF-TOKEN']];
		});

	}).then((arr) => {
		var headers = {
			"X-XSRF-TOKEN": arr[1],
			'Content-Type': 'application/json',
			Cookie: 'auth_idp=' + arr[0]
		};
		return gUrl.request('https://dcc.godaddy.com/api/v3/domains/tinyappsdev.com/records?recordId=' + _id, {
				method: 'PUT',
				headers: headers,
				dataType: 'json',
				content: JSON.stringify({
					"type": "a",
					"name": name,
					"data": ip,
					"ttl": 3600,
					"status": "setup",
					"attributeUid": _id,
					"$edit": true,
					"errors": {}
				})
			});
	});

}

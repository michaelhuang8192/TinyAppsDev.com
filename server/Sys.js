var mExpress = require('express');
var mFs = require('fs');

var gRouter = mExpress.Router();


gRouter.get('/getSysVersion', function(req, res, next) {

	mFs.readFile('/proc/version', {encoding: 'utf8'}, function(err, data) {
		res.json({err: err, data: data});
	});

});

gRouter.get('/tellJoke', function(req, res, next) {
	var collection = req.app.locals.db.collection('Jokes');
	var cursor;

	new Promise(function(resolve, reject) {
		collection.count(function(err, count) {
			if(err)
				reject(err);
			else
				resolve(count);
		});

	}).then(function(count) {
		if(!count) return [];

		cursor = collection.find({}).skip(Math.floor(Math.random() * count)).limit(1);
		return cursor.toArray();

	}).then(function(doc) {
		res.json({data: doc.length > 0 ? doc[0].content : null});

	}).catch(function(err) {
		next(err);

	}).then(function() {
		cursor && cursor.close();

	});

});


gRouter.get('/getIP', function(req, res, next) {
	res.json({data: req.headers['x-real-ip']});
});

module.exports = gRouter;

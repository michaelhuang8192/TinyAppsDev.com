var express = require('express');
var fs = require('fs');

var router = express.Router();

router.get('/getPage', function(req, res, next) {


	//console.log(req.app);

	var pageIndex = parseInt(req.query.pageIndex);
	var pageSize = parseInt(req.query.pageSize) || 50;

	var cursor = req.app.locals.db.collection('Samples').find({})
		.sort({_id: -1})
		.skip(pageIndex * pageSize)
		.limit(pageSize)
		.project({title: 1, link: 1});

	var ret = {total: 0, pages: {}};
	cursor.count().then(function(count) {
		ret.total = count;
		return cursor.toArray();

	}).then(function(docs) {
		ret.pages[pageIndex] = docs;
		res.json(ret);
		
	}).catch(function(err) {
		next(err);

	}).then(function() {
		cursor.close();

	});

});

router.get('/getItem', function(req, res, next) {
	var id = req.query.id;
	if(id == 'NEW') {
		res.json({_id: 0, link: "NEW", title: "new"});
		return;
	}

	var cursor = req.app.locals.db.collection('Samples').find({link: id})
		.limit(1);

	cursor.toArray().then(function(doc) {
		res.json(doc.length > 0 ? doc[0] : {title: `link[${id}] doesn't exist`});

	}).catch(function(err) {
		next(err);

	}).then(function() {
		cursor.close();

	});

});


var g_AF_demoJson = undefined;
router.get('/getAFDemo', (req, res, next) => {
	var p = new Promise((resolve, reject) => {
		if(g_AF_demoJson === undefined) {
			fs.readFile("./sample/af.json", (err, data) => {
				if(err) throw err;
				if(g_AF_demoJson === undefined)
					g_AF_demoJson = JSON.parse(data);
				resolve(g_AF_demoJson);
			});

		} else
			resolve(g_AF_demoJson);

	}).then((data) => {
		var pageIndex = parseInt(req.query.pageIndex) || 0;
		var pageSize = parseInt(req.query.pageSize) || 50;
		var keys = Object.keys(data);

		var ret = {total: keys.length, pages: {}};

		var docs = [];
		var start = pageIndex * pageSize;
		var end = Math.min(start + pageSize, ret.total);
		for(; start < end; start++) {
			docs.push(data[keys[start]]);
		}

		ret.pages[pageIndex] = docs;
		res.json(ret);

	}).catch((err) => {
		next(err);
	});

});


var g_WP_demoJson = undefined;
router.get('/getWpPage', (req, res, next) => {
	var p = new Promise((resolve, reject) => {
		if(g_WP_demoJson === undefined) {
			fs.readFile("./sample/wallpapers.json", (err, data) => {
				if(err) throw err;
				
				if(g_WP_demoJson === undefined) {
					var data = JSON.parse(data);
					var keys = Object.keys(data);
					var wp = {cates: {}, list: []};
					var last_count = 0;
					for(var i = 0; i < keys.length; i++) {
						var cateData = data[keys[i]];
						wp.list.push.apply(wp.list, cateData);
						wp.cates[keys[i]] = {index: last_count, count: cateData.length};
						last_count += cateData.length;
					}
					g_WP_demoJson = wp;
				}

				resolve(g_WP_demoJson);
			});

		} else
			resolve(g_WP_demoJson);

	}).then((data) => {
		var pageIndex = parseInt(req.query.pageIndex) || 0;
		var pageSize = parseInt(req.query.pageSize) || 50;

		var ret = {total: data.list.length, pages: {}};

		var start = pageIndex * pageSize;
		var end = Math.min(start + pageSize, ret.total);

		ret.pages[pageIndex] = data.list.slice(start, end);
		res.json(ret);

	}).catch((err) => {
		next(err);
	});

});


module.exports = router;


var express = require('express');

var router = express.Router();

router.get('/getPage', function(req, res, next) {


	//console.log(req.app);

	var pageIndex = parseInt(req.query.pageIndex);
	var pageSize = parseInt(req.query.pageSize) || 50;

	var cursor = req.app.locals.db.collection('Projects').find({})
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

router.get('/getItem', function(req, res) {
	var id = req.query.id;
	if(id == 'NEW') {
		res.json({_id: 0, link: "NEW", title: "new"});
		return;
	}

	var cursor = req.app.locals.db.collection('Projects').find({link: id})
		.limit(1);

	cursor.toArray().then(function(doc) {
		res.json(doc.length > 0 ? doc[0] : {title: `link[${id}] doesn't exist`});

	}).catch(function(err) {
		next(err);

	}).then(function() {
		cursor.close();

	});

});


module.exports = router;


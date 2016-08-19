var express = require('express');

var router = express.Router();


function getPage(req, res, next, from, projection) {
	var pageIndex = parseInt(req.query.pageIndex) || 0;
	var pageSize = parseInt(req.query.pageSize) || 50;

	var cursor = req.app.locals.db.collection(from).find({})
		.sort({_id: -1})
		.skip(pageIndex * pageSize)
		.limit(pageSize);

	if(projection != null) cursor.project(projection);

	var ret = {total: 0, pages: {}};
	return cursor.count().then(function(count) {
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
}

function getItem(req, res, next, from, filter, projection) {
	var cursor;
	return new Promise(function(resolve, reject) {
		if(typeof filter == 'function')
			filter = filter();

		if(filter == null) {
			reject("No key " + byCol);
			return;
		}

		cursor = req.app.locals.db.collection(from).find(filter).limit(1);
		if(projection != null) cursor.project(projection);

		resolve(cursor.toArray());

	}).then(function(doc) {
		res.json(doc.length > 0 ? doc[0] : null);

	}).catch(function(err) {
		next(err);

	}).then(function() {
		cursor && cursor.close();

	});

}

router.get('/getCmsPage', function(req, res, next) {
	getPage(req, res, next, 'CMS', {title: 1, link: 1});
});

router.get('/getCmsItem', function(req, res, next) {
	getItem(req, res, next, 'CMS', function() {
		if(req.query.hasOwnProperty('link'))
			return {link: req.query.link};
		else
			return null;
	}, {link: 1, html: 1});
});

router.get('/getCmsItemById', function(req, res, next) {
	getItem(req, res, next, 'CMS', function() {
		if(req.query.hasOwnProperty('_id'))
			return {_id: parseInt(req.query._id)};
		else
			return null;
	});
});


module.exports = router;

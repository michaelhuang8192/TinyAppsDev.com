var express = require('express');

var router = express.Router();

router.get('/', function(req, res, next) {
	var term = req.query.term || "";
	var pageIndex = parseInt(req.query.pageIndex) || 0;
	var pageSize = parseInt(req.query.pageSize) || 50;

	var cursor = req.app.locals.db.collection('Search').find({
		$text: {$search: term}
	}).project({
		score: {$meta: "textScore"}
	}).sort({
		score: {$meta: "textScore"},
		_id: -1
	})
	.skip(pageIndex * pageSize)
	.limit(pageSize);

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

module.exports = router;
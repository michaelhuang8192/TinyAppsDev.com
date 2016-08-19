var mExpress = require('express');
var mFs = require('fs');

var gRouter = mExpress.Router();


gRouter.get('/getSysVersion', function(req, res, next) {

	mFs.readFile('/proc/version', function(err, data) {
		res.json({err: err, data: data});
	});

});



module.exports = gRouter;

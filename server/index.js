var config = require('./config');

var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');


var routers = {
	Projects: require('./Projects'),
	TechnicalDocs: require('./TechnicalDocs'),
	Samples: require('./Samples'),
	Search: require('./Search'),
	Admin: require('./Admin')
};

var app = express();
app.disable('etag');

function startListening() {
	app.listen(config.server_path, function () {
		console.log('server started');
	});
}

MongoClient.connect(config.db_url, function(err, db) {
	assert.equal(null, err)

	app.disable("x-powered-by");
	app.locals.db = db;
	app.locals.numReqs = 0;

	if(typeof config.server_path == "string") {
		fs.unlink(config.server_path, function() {
			startListening();
		});
	} else {
		startListening();
	}
	
});


//request counter
app.use(function(req, res, next) {

	app.locals.numReqs++;
	res.on('close', function() {
		app.locals.numReqs--;
	}).on('finish', function() {
		app.locals.numReqs--;
	});

	next();
});

app.use('/api/Projects', routers.Projects);
app.use('/api/TechnicalDocs', routers.TechnicalDocs);
app.use('/api/Samples', routers.Samples);
app.use('/api/Search', routers.Search);
app.use('/api/Admin', routers.Admin);


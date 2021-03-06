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
	Docs: require('./Docs'),
	Admin: require('./Admin'),
	Sys: require('./Sys'),
	Domain: require('./Domain')
};

var app = express();
//app.disable('etag');

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
	app.locals.config = config;

	if(typeof config.server_path == "string") {
		fs.unlink(config.server_path, function() {
			startListening();
		});
	} else {
		startListening();
	}
	
});

function end(chunk, encoding, callback) {
	if(!this.headersSent)
		this.setHeader('ms', new Date().getTime() - this.startTs);
	this.__proto__.end.call(this, chunk, encoding, callback);
}

//request counter
app.use(function(req, res, next) {

	res.startTs = new Date().getTime();
	if(!res.hasOwnProperty('end')) {
		res.end = end;
	}

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
app.use('/api/Docs', routers.Docs);
app.use('/api/Admin', routers.Admin);
app.use('/api/Sys', routers.Sys);
app.use('/api/Domain', routers.Domain);
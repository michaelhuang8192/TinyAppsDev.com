var express = require('express');
var router = express.Router();
var utils = require('./Utils');
var htmlToText = require('html-to-text');
var mCookieParser = require('cookie-parser');
var mConfig = require('./config');
var mCrypto = require('crypto');
var mBodyParser = require('body-parser');

var tableNames = {
Project: 'Projects',
TechnicalDoc: 'TechnicalDocs',
Sample: 'Samples',
};


var gBlackList = new Map();

function gen_auth(remoteIp, tsIdx) {
	var hash = mCrypto.createHash('sha256');
	hash.update(mConfig.admin_pass_hash + mConfig.secret_code_v2 + remoteIp + tsIdx);
	return hash.digest('base64');
}

var ADMIN_AUTH = 'admin_auth';
var MAX_FAILED_LOGIN = 5;
var BANNED_TS_COUNT = 1;
function login(auth, passwd, remoteIp, res) {
	if(!auth && !passwd) return false;

	var curTsIdx = Math.floor((new Date().getTime()) / 1800000);

	var ipData = gBlackList.get(remoteIp);
	if(ipData !== undefined && ipData.bannedTsIdx !== undefined && ipData.bannedTsIdx <= curTsIdx)
		return false;

	var status = 0;
	var curAuth = gen_auth(remoteIp, curTsIdx);

	if(passwd) {
		status = passwd === mConfig.admin_pass ? 2 : -1;

	} else if(auth) {
		if(curAuth == auth)
			status = 1;
		else
			status = gen_auth(remoteIp, curTsIdx - 1) == auth ? 2 : -1;
	}

	if(status == 2)
		res.cookie(ADMIN_AUTH, curAuth);
	
	if(status < 0) {
		res.clearCookie(ADMIN_AUTH);

		if(ipData === undefined) {
			ipData = {failed: 1};
			gBlackList.set(remoteIp, ipData);
		} else {
			if(ipData.bannedTsIdx !== undefined) {
				delete ipData.bannedTsIdx;
				ipData.failed = 1;
			} else {
				ipData.failed++;
				if(ipData.failed > MAX_FAILED_LOGIN)
					ipData.bannedTsIdx = curTsIdx + BANNED_TS_COUNT;
			}
		}
	}

	return status > 0;
}


function POST_login(req, res, next) {
	var isLogin = login(null, req.body.passwd, req.ip, res);

	res.json({isLogin: isLogin});
}

function ALL_loginCheck(req, res, next) {
	if(login(req.cookies[ADMIN_AUTH], null, req.ip, res)) {
		next();
	} else {
		res.json({err: 'not authorized'});
	}

}

function GET_isLogin(req, res, next) {
	res.json({isLogin: true});
}

function POST_new(req, res, next) {
	var type = req.params.type;
	var db = req.app.locals.db;
	var doc;
	var tableName;

	utils.fetchJSON(req)
	.then(function(_doc) {
		doc = _doc;

		var link = (doc.link || "").trim().toLowerCase();
		if(!link || link == 'new') {
			throw "invalid link!";
		}

		tableName = tableNames[type];
		if(tableName == undefined) {
			throw `No such table ${type}`;
		}

		return utils.getNewID(db.collection('ID'), 1);

	}).then(function(id) {
		doc._id = id;
		return db.collection(tableName).insertOne(doc);

	}).then(function(r) {
		var search_doc = {
			_id: doc._id,
			type: type,
			link: doc.link,
			title: doc.title,
			keywords: doc.keywords,
			content: doc.html ? htmlToText.fromString(doc.html) : null
		};
		return db.collection('Search').insertOne(search_doc);

	}).then(function(r) {
		res.json({id: r.insertedId});

	}).catch(function(err) {
		next(err);

	});

}

function POST_update(req, res, next) {
	var type = req.params.type;
	var db = req.app.locals.db;
	var doc;
	var filter;
	var tableName;
	var result;

	utils.fetchJSON(req)
	.then(function(_doc) {
		doc = _doc;

		if(doc.link !== undefined) {
			var link = (doc.link || "").trim().toLowerCase();
			if(!link || link == 'new') {
				throw "invalid link!";
			}
		}

		tableName = tableNames[type];
		if(tableName == undefined) {
			throw `No such table ${type}`;
		}

		filter = {_id : doc._id};
		delete doc._id;

		return db.collection(tableName).updateOne(filter, {$set: doc});

	}).then(function(r) {
		result = r;
		if(r.modifiedCount > 0) {
			var search_doc = {};
			if(doc.hasOwnProperty("title"))
				search_doc.title = doc.title;
			if(doc.hasOwnProperty("link"))
				search_doc.link = doc.link;
			if(doc.hasOwnProperty("keywords"))
				search_doc.keywords = doc.keywords;
			if(doc.hasOwnProperty("html"))
				search_doc.content = htmlToText.fromString(doc.html);
			
			return db.collection('Search').updateOne(filter, {$set: search_doc});
		} else {
			return r;
		}

	}).then(function(r) {
		res.json({ok: result.matchedCount > 0 && r.matchedCount > 0});

	}).catch(function(err) {
		next(err);

	});

}

function POST_delete(req, res, next) {
	var type = req.params.type;
	var db = req.app.locals.db;
	var doc;
	var filter;
	var tableName;
	var result;

	utils.fetchJSON(req)
	.then(function(_doc) {
		doc = _doc;

		tableName = tableNames[type];
		if(tableName == undefined) {
			throw `No such table ${type}`;
		}

		filter = {_id : doc._id};

		return db.collection(tableName).deleteOne(filter);

	}).then(function(r) {
		result = r;
		if(r.deletedCount > 0)
			return db.collection('Search').deleteOne(filter);
		else
			return r;
	}).then(function(r) {
		res.json({ok: result.deletedCount > 0 && r.deletedCount > 0});

	}).catch(function(err) {
		next(err);

	});

}



//routing

router.use(mCookieParser());
router.use(mBodyParser.json());
router.use(mBodyParser.urlencoded({extended: true}));

router.post('/login', POST_login);
router.use(ALL_loginCheck);
router.get('/isLogin', GET_isLogin);

router.post('/new/:type', POST_new);
router.post('/update/:type', POST_update);
router.post('/delete/:type', POST_delete);

module.exports = router;

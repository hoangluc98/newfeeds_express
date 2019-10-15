var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost'});
const Logger = require('../models/logger.model');
var Like = require('../models/like.model');
var url = require('url');

var statisticalController = {};
var addLog = function(req, status, message, content){
	req.data.status = status;
	req.data.message = message;
	req.data.content = content ? content : {};
	Logger.create(req.data);
}

statisticalController.numberUser = async function(req, res) {
	redisClient.keys('*', function (err, keys) {
		if (err){
			addLog(req, "500", "Statistical failed");
			return console.log(err);
		}
		addLog(req, "200", "Statistical number users", "numberUser " + keys.length);
		res.json(keys.length);
	});
};

statisticalController.numberLike = async function(req, res) {
	var parse = url.parse(req.url, true);

	try{
		var count = await Like.countDocuments();
		var artId = parse.query.articleId;
		if(artId){
			count = await Like.countDocuments({articleId:artId});
		}
		addLog(req, "200", "Statistical number likes", "numberLike " + count);
		res.json(count);
	} catch(err){
		addLog(req, "500", err);
		res.status(500).json({error: err});
	}
};

statisticalController.numberComment = async function(req, res) {
	var parse = url.parse(req.url, true);

	try{
		var count = await Comment.countDocuments();
		if(parse.query.articleId){
			var artId = parse.query.articleId;
			count = await Comment.countDocuments({articleId:artId});
		}
		addLog(req, "200", "Statistical number comments", "numberComment " + count);
		res.json(count);
	} catch(err){
		addLog(req, "500", err);
		res.status(500).json({error: err});
	}
};

module.exports = statisticalController;
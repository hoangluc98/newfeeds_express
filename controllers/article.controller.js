const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const articleController = {};
var addLog = function(req, status, message, data){
	req.data.status = status;
	req.data.message = message;
	req.data.data = data ? data : {};
	Logger.create(req.data);
}

articleController.list = async function(req, res) {
	var parse = url.parse(req.url, true);
	var page = parseInt(parse.query.page) || 1;

	try{
		var articles = await Article.find().limit(10).skip(10*(page-1));
		var total = await Article.countDocuments();
		addLog(req, "200", "List articles", articles);

		res.status(200).json({
			list: articles,
			total
		});
	} catch(err){
		addLog(req, "500", "List failed");
		res.status(500).json({error: err});
	};
};

articleController.item = function(req, res) {
	Article.find({_id: req.params.id})
		.exec()
		.then(doc => {
			addLog(req, "200", "Item article", doc);
			res.status(200).json(doc);
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({error: err});
		});
};

articleController.create = function(req, res) {
	if(!req.body.content)
		return res.status(500).json("Created article failed");

	req.body.userId = req.user._id;
	req.body.created_At_ = Date.now();
	
	const article = new Article(req.body)
	article
		.save()
		.then(result => {
			addLog(req, "200", "Created article", result);
			res.status(201).json({
				message: "Handing POST request to /articles",
				createdUser: result
			});
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});;
};

articleController.update = async function(req, res) {
	let articleId = req.body.articleId;
	try{
		await Article.findByIdAndUpdate({_id: articleId}, req.body);
	} catch(err){
		res.status(500).json({error: err});
	};
	req.body.userId = req.user._id;

	Article.find({_id: articleId})
		.exec()
		.then(result => {
			addLog(req, "200", "Updated article", result);
			res.status(201).json({
				message: "Handing POST request to /articles",
				createdUser: result
			});
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});
};

articleController.delete = async function(req, res) {
	const articleId = req.params.id;
	try{
		await Comment.remove({articleId: articleId});
		await Like.remove({articleId: articleId});
	} catch(err){
		res.status(500).json({error: err});
	}

	Article.findByIdAndRemove({_id: articleId})
		.exec()
		.then(result => {
			addLog(req, "200", "Delete article", result);
			res.status(200).json("Delete successful");
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});
};

module.exports = articleController;
const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const articleController = {};

articleController.list = async function(req, res) {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	let userId = parse.query.userId;
	try{
		let articles = await Article.find().limit(10).skip(10*(page-1));
		let total = await Article.countDocuments();
		if(userId){
			articles = await Article.find({userId: userId}).limit(10).skip(10*(page-1));
			total = await Article.countDocuments({userId: userId});
		}

		let data = {
			list: articles,
			total
		}
		req.data = data;

		res.status(200).json(data);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

articleController.item = function(req, res) {
	Article.find({_id: req.params.id})
		.exec()
		.then(doc => {
			req.data = doc;
			res.status(200).json(doc);
		})
		.catch(err => {
			req.error = err;
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
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /articles",
				createdUser: result
			});
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});;
};

articleController.update = async function(req, res) {
	const articleId = req.body.articleId;
	try{
		await Article.findByIdAndUpdate({_id: articleId}, req.body);
	} catch(err){
		res.status(500).json({error: err});
	};
	req.body.userId = req.user._id;

	Article.find({_id: articleId})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /articles",
				createdUser: result
			});
		})
		.catch(err => {
			req.error = err;
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
			req.data = result;
			res.status(204).json("Delete successful");
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

module.exports = articleController;
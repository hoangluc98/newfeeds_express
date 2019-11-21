const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const articleController = {};
const select = '-_id -userId';

articleController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	let userId = req.body.userId;
	try{
		let articles = await Article.find({}, select).limit(10).skip(10*(page-1));
		let total = await Article.countDocuments();
		if(userId){
			articles = await Article.find({userId: userId}, select).limit(10).skip(10*(page-1));
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

articleController.item = (req, res) => {
	Article.find({_id: req.body.id}, select)
		.exec()
		.then(doc => {
			req.data = doc[0];
			res.status(200).json(doc[0]);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({error: err});
		});
};

articleController.create = async (req, res) => {
	if(!req.body.content)
		return res.status(500).json("Created article failed");

	req.body.userId = req.user._id;
	req.body.created_At_ = Date.now();
	try{
		const result = await Article.create(req.body);
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

articleController.update = async (req, res) => {
	const articleId = req.body.articleId;
	try{
		await Article.findOneAndUpdate({_id: articleId}, req.body);
		req.body.userId = req.user._id;

		let result = Article.find({_id: articleId});
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

articleController.delete = async (req, res) => {
	const articleId = req.body.id;
	try{
		await Comment.remove({articleId: articleId});
		await Like.remove({articleId: articleId});

		let result = Article.findOneAndRemove({_id: articleId});
		req.data = result;
		res.status(204).json("Delete successful");
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

module.exports = articleController;
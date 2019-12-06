const Article = require('./article.model');
const Comment = require('../comment/comment.model');
// const Like = require('../like.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const articleController = {};
const select = '-_id -userId';

articleController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	let userId = req.body.userId;
	try {
		let articles = await Article.find({}, select).limit(10).skip(10*(page-1));
		let total = await Article.countDocuments();
		if(userId) {
			articles = await Article.find({userId: userId}, select).limit(10).skip(10*(page-1));
			total = await Article.countDocuments({userId: userId});
		}

		let data = {
			list: articles,
			total
		}
		req.data = data;

		return res.status(200).json(data);
	} catch(err) {
		req.error = err;
		return res.status(500).json({error: err});
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
		return res.status(500).json('Created article failed');

	req.body.userId = req.user._id;
	req.body.created_At_ = Date.now();
	try {
		const result = await Article.create(req.body);
		req.data = result;
		return res.status(201).json(result);

	} catch(err){
		req.error = err;
		return res.status(500).json({error: err});
	};
};

articleController.update = async (req, res) => {
	if((req.user.type === 'user') && (req.body.userId.toString() !== req.user._id.toString()))
		return res.status(500).json('No article updates.');

	const articleId = req.body.articleId;
	delete req.body.userId;
	try {
		let update = await Article.findOneAndUpdate({_id: articleId, userId: userId}, req.body);
		if(update == null)
			return res.status(500).json('There was a problem updating the article.');
		let result = await Article.find({_id: articleId, userId: userId});
		req.data = result[0];
		return res.status(201).json(result[0]);
	} catch(err) {
		req.error = err;
		return res.status(500).json({error: err});
	};
};

articleController.delete = async (req, res) => {
	if((req.user.type === 'user') && (req.body.userId.toString() !== req.user._id.toString()))
		return res.status(500).json('No article delete.');
	const articleId = req.body.articleId;

	try {
		let result = await Article.findOneAndRemove({_id: articleId, userId: req.user._id});
		if(result == null)
			return res.status(500).json('There was a problem deleting the article.');

		await Comment.deleteMany({articleId: articleId});
		// await Like.deleteMany({articleId: articleId});

		req.data = result;
		return res.status(204).json('Delete successful');
	} catch(err) {
		req.error = err;
		return res.status(500).json({error: err});
	}
};

module.exports = articleController;
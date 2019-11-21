const Comment = require('../models/comment.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const commentController = {};
const select = '-_id -userId -articleId';

commentController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	const articleId = req.body.articleId;

	try{
		let comments = await Comment.find({}, select).limit(10).skip(10*(page-1));
		let total = await Comment.countDocuments();

		if(articleId){
			comments = await Comment.find({articleId: articleId}, select).limit(10).skip(10*(page-1));
			total = await Comment.countDocuments({articleId: articleId});
		}

		let data = {
			list: comments,
			total
		}
		req.data = data;

		res.status(200).json(data);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

commentController.item = (req, res) => {
	Comment.find({_id: req.body.id}, select)
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

commentController.create = async (req, res) => {
	req.body.userId = req.user._id;

	if(!req.body.content)
		return res.status(500).json("Created comment failed");

	req.body.created_At_ = Date.now();

	try{
		const result = await Comment.create(req.body);
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

commentController.update = async (req, res) => {
	let commentId = req.body.commentId;

	try{
		await Comment.findOneAndUpdate({_id: commentId}, req.body);
		req.body.userId = req.user._id;

		let result = Comment.find({_id: commentId});
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

commentController.delete = async (req, res) => {
	Comment.findOneAndRemove({_id: req.body.id})
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

module.exports = commentController;
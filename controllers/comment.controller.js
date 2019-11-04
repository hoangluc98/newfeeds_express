const Comment = require('../models/comment.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const commentController = {};

commentController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	const articleId = parse.query.articleId;

	try{
		let comments = await Comment.find().limit(10).skip(10*(page-1));
		let total = await Comment.countDocuments();

		if(articleId){
			comments = await Comment.find({articleId: articleId}).limit(10).skip(10*(page-1));
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
	Comment.find({_id: req.params.id})
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
	const comment = new Comment(req.body);
	comment
		.save()
		.then(result => {
			req.data = result;
			res.status(201).json(result);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});;
};

commentController.update = async (req, res) => {
	let commentId = req.body.commentId;

	try{
		await Comment.findOneAndUpdate({_id: commentId}, req.body)
	} catch(err){
		res.status(500).json({error: err});
	};

	req.body.userId = req.user._id;
		
	Comment.find({_id: commentId})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json(result);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

commentController.delete = async (req, res) => {
	Comment.findOneAndRemove({_id: req.params.id})
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
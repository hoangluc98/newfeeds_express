const Comment = require('../models/comment.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const commentController = {};

commentController.list = async function(req, res) {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	const articleId = parse.query.articleId;

	try{
		const comments = await Comment.find().limit(10).skip(10*(page-1));
		const total = await Comment.countDocuments();

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

commentController.item = function(req, res) {
	Comment.find({_id: req.params.id})
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

commentController.create = async function(req, res) {
	req.body.userId = req.user._id;

	if(!req.body.content)
		return res.status(500).json("Created comment failed");

	req.body.created_At_ = Date.now();
	const comment = new Comment(req.body);
	comment
		.save()
		.then(result => {
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /comments",
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

commentController.update = async function(req, res) {
	let commentId = req.body.commentId;

	try{
		await Comment.findByIdAndUpdate({_id: commentId}, req.body)
	} catch(err){
		res.status(500).json({error: err});
	};

	req.body.userId = req.user._id;
		
	Comment.find({_id: commentId})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /comments",
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

commentController.delete = async function(req, res) {
	Comment.findByIdAndRemove({_id: req.params.id})
		.exec()
		.then(result => {
			req.data = result;
			res.status(200).json("Delete successful");
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

module.exports = commentController;
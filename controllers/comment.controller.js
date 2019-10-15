const Comment = require('../models/comment.model');
const Logger = require('../models/logger.model');
const jwt = require('jsonwebtoken');
const url = require('url');
require('dotenv').config();

const commentController = {};
var addLog = function(req, status, message, data){
	req.data.status = status;
	req.data.message = message;
	req.data.data = data ? data : {};
	Logger.create(req.data);
}

commentController.list = async function(req, res) {
	var parse = url.parse(req.url, true);
	var page = parseInt(parse.query.page) || 1;
	var articleId = parse.query.articleId;

	try{
		var comments = await Comment.find().limit(10).skip(10*(page-1));
		var total = await Comment.countDocuments();

		if(articleId){
			comments = await Comment.find({articleId: articleId}).limit(10).skip(10*(page-1));
			total = await Comment.countDocuments({articleId: articleId});
		}

		addLog(req, "200", "List comments", comments);
		res.status(200).json({
			list: comments,
			total
		});
	} catch(err){
		addLog(req, "500", "List failed");
		res.status(500).json({error: err});
	}
};

commentController.item = function(req, res) {
	Comment.find({_id: req.params.id})
		.exec()
		.then(doc => {
			addLog(req, "200", "Item comment", doc);
			res.status(200).json(doc);
		})
		.catch(err => {
			addLog(req, "500", err);
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
			addLog(req, "200", "Created comment", result);
			res.status(201).json({
				message: "Handing POST request to /comments",
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
			addLog(req, "200", "Updated comment", result);
			res.status(201).json({
				message: "Handing POST request to /comments",
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

commentController.delete = async function(req, res) {
	Comment.findByIdAndRemove({_id: req.params.id})
		.exec()
		.then(result => {
			addLog(req, "200", "Delete comment", result);
			res.status(200).json("Delete successful");
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});
};

module.exports = commentController;
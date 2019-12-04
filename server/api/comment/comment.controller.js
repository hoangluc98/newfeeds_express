const Comment = require('./comment.model');
const Article = require('../article/article.model');
const jwt = require('jsonwebtoken');
const url = require('url');

const commentController = {};
const select = '-_id -userId -articleId';

commentController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;
	const articleId = req.body.articleId;

	try {
		let comments = await Comment.find({}, select).limit(10).skip(10*(page-1));
		let total = await Comment.countDocuments();

		if(articleId) {
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
		return res.status(500).json('Created comment failed');

	req.body.created_At_ = Date.now();

	try {
		const result = await Comment.create(req.body);
		req.data = result;
		res.status(201).json(result);

	} catch(err) {
		req.error = err;
		res.status(500).json({error: err});
	};
};

commentController.update = async (req, res) => {
	if(req.body.userId !== req.user._id)
		return res.status(500).json('There was a problem updating the comment.');

	try {
		delete req.body.userId;
		let commentId = req.body.commentId;
		let update = await Comment.findOneAndUpdate({_id: commentId, userId: req.user._id}, req.body);
		if(update == null)
			return res.status(500).json('There was a problem updating the comment.');

		let result = Comment.find({_id: commentId, userId: req.user._id});
		req.data = result[0];
		res.status(201).json(result[0]);

	} catch(err) {
		req.error = err;
		res.status(500).json({error: err});
	};
};

commentController.delete = async (req, res) => {
	const { id, articleId } = req.body;
	let result = await Article.findOne({_id: articleId, userId: req.user._id});
	console.log(result);
	if(result) {
		Comment.findOneAndRemove({_id: id, articleId: articleId})
			.exec()
			.then(result => {
				req.data = result;
				res.status(204).json('Delete successful');
			})
			.catch(err => {
				req.error = err;
				res.status(500).json('Delete not success');
			});
	}

	console.log('123');
	Comment.findOneAndRemove({_id: id, userId: req.user._id})
		.exec()
		.then(result => {
			req.data = result;
			res.status(204).json('Delete successful');
		})
		.catch(err => {
			req.error = err;
			res.status(500).json('Delete not success');
		});
};

module.exports = commentController;
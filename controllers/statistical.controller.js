const Logger = require('../models/logger.model');
const Like = require('../models/like.model');
const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});

const statisticalController = {};

let statisticalOfArticle = async (req, res) => {
	let parse = url.parse(req.url, true);
	let count = await db.countDocuments();
	const artId = parse.query.articleId;
	if(artId){
		count = await db.aggregate([
			{ "$match": { "articleId": artId } },
		 	{
		 		$group: {
			 		_id: "$articleId",
			 		total: { $sum: 1 }
			 	}
		 	}
		]);

		count = count[0].total;
		req.data = {count};
	}

	return count;
}

let statisticalOfUser = async (req, res) => {
	let userId = req.body.userId;
	let parse = url.parse(req.url, true);
	let date = parse.query.date;
	let count;

	if(date){
		let dateS = new Date(date);
		let d = new Date(date);
		d = d.setDate(d.getDate() + 1);
		let dateF = new Date();
		dateF.setTime(d);
		count = await db.aggregate([
			{ "$match": 
				{ 
					userId: userId,
					created_At_ : { '$gte' : dateS, '$lt' : dateF }
				}
			},
		 	{
		 		$group: {
			 		_id: "$userId",
			 		total: { $sum: 1 }
			 	}
		 	}
		]);
	} else{
		count = await db.aggregate([
			{ "$match": 
				{ 
					userId: userId
				}
			},
		 	{
		 		$group: {
			 		_id: "$userId",
			 		total: { $sum: 1 }
			 	}
		 	}
		]);
	}

	count = count[0].total;

	req.data = {count};

	return count;
}

statisticalController.numberUserOnline = async (req, res) => {
	redisClient.scard('userOnline', (err, num) => {
		if (err){
			req.error = err;
			return res.json(err);
		}
		req.data = {num};
		res.json(num);
	});
};

statisticalController.numberUserAccess = async (req, res) => {
	try{
		let userId = req.body.userId;
		let parse = url.parse(req.url, true);
		let date = parse.query.date;

		if(date){
			let dateS = new Date(date);
			let d = new Date(date);
			d = d.setDate(d.getDate() + 1);
			let dateF = new Date();
			dateF.setTime(d);

			let number = await Logger.aggregate([
				{ "$match": 
					{ 
						created_At_ : { '$gte' : dateS, '$lt' : dateF }
						// ,
						// '$request.url' : '/auth/login',
						// '$response.status' : '200'
					}
				},
			 	{
			 		$group: {
				 		_id: "$request.createdBy",
				 		unique: { $addToSet: "$request.createdBy" }
				 	}
			 	}
			]);

			let num = number.length
			req.data = {num};

			res.json(num);
		} else{
			let timeCurrent = new Date();
			timeCurrent.setTime(new Date().setHours(0,0,0,0));

			let number = await Logger.aggregate([
				{ "$match": 
					{ 
						created_At_ : { '$gte' : timeCurrent }
					}
				},
			 	{
			 		$group: {
				 		_id: "$createdBy",
				 		unique: { $addToSet: "$createdBy" }
				 	}
			 	}
			]);

			let num = number.length
			req.data = {num};

			res.json(num);
		}
	} catch(err){
		req.error = err;
		return res.json(err);
	}
};

statisticalController.numberLikeOfArticle = async (req, res) => {
	try{
		let number = await statisticalOfArticle(req, Like);
		res.json(number);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

statisticalController.numberCommentofArticle = async (req, res) => {
	try{
		let number = await statisticalOfArticle(req, Comment);
		res.json(number);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

statisticalController.numberLikeOfUser = async (req, res) => {
	try{
		let number = await statisticalOfUser(req, Like);
		res.json(number);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

statisticalController.numberCommentOfUser = async (req, res) => {
	try{
		let number = await statisticalOfUser(req, Comment);
		res.json(number);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

statisticalController.numberArticleOfUser = async (req, res) => {
	try{
		let number = await statisticalOfUser(req, Article);
		res.json(number);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	}
};

module.exports = statisticalController;
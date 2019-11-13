const Logger = require('../models/logger.model');
const Like = require('../models/like.model');
const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const Statistical = require('../models/statistical.model');
const User = require('../models/user.model');
const statisticalHelper = require("../helpers/statistical.helper");
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const CronJob = require('cron').CronJob;

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
	let parse = url.parse(req.url, true);
	let time = parse.query.time;
	if(!time){
		redisClient.keys('*', (err, keys) => {
			if (err){
				req.error = err;
				return res.json(err);
			}
			let num = keys.length - 1;
			req.data = num;
			res.json(num);
		});
	} else{
		try{
			let timeS = new Date(time);
			let d = new Date(time);
			d = d.setHours(d.getHours() + 1);
			let timeF = new Date();
			timeF.setTime(d);
			let count = await Statistical.aggregate([
				{ "$match": 
					{ 
						created_At_ : { '$gte' : timeS, '$lt' : timeF }
					}
				},
			 	{
			 		$group: {
				 		_id: "$numUserOnline"
				 	}
			 	}
			]);

			count = parseInt(count[0]._id);
			res.json(count);
		} catch(err){
			req.error = err;
			res.status(500).json({error: err});
		};
	}
};

statisticalController.numberUserAccess = async (req, res) => {
	let parse = url.parse(req.url, true);
	let time = parse.query.time;
	if(!time){
		redisClient.scard('userAccess', (err, num) => {
			if (err){
				req.error = err;
				return res.json(err);
			}
			req.data = num;
			res.json(num);
		});
	} else{
		try{
			let timeS = new Date(time);
			let d = new Date(time);
			d = d.setHours(d.getHours() + 1);
			let timeF = new Date();
			timeF.setTime(d);
			let count = await Statistical.aggregate([
				{ "$match": 
					{ 
						created_At_ : { '$gte' : timeS, '$lt' : timeF }
					}
				},
			 	{
			 		$group: {
				 		_id: "$numUserAccess"
				 	}
			 	}
			]);

			count = parseInt(count[0]._id);
			res.json(count);
		} catch(err){
			req.error = err;
			res.status(500).json({error: err});
		};
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
const Logger = require('../models/logger.model');
const Like = require('../models/like.model');
const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const StatisHour = require('../models/statisHour.model');
const StatisDay = require('../models/statisDay.model');
const User = require('../models/user.model');
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const CronJob = require('cron').CronJob;

const statisticalController = {};

let statisticalOfArticle = async (req, db) => {
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
	console.log(count);

	return count;
}

let statisticalOfUser = async (req, db) => {
	let user_Id = req.body.userId;
	let parse = url.parse(req.url, true);
	let date = parse.query.date;
	let count;

	if(date){
		let dateS = new Date(date);
		let dateF = new Date(date);
		dateF.setDate(dateS.getDate() + 1);

		console.log(dateS);
		console.log(dateF);

		count = await db.aggregate([
			{ "$match": 
				{ 
					userId: user_Id,
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

let statisNumberUser = async (day, hour, type) => {
	if(!hour){
		let staDay = await StatisDay.find({ day: day, type: type });
		let count = staDay[0].number;
		let list = staDay[0].list;
		let data
		if(type == 'user_Access'){
			data = {
				day,
				count,
				list: list	
			}
		} else{
			data = {
				day,
				list: list	
			}
		}
		return data;
	} else if(hour){
		let count = await StatisHour.aggregate([
			{ $match: 
				{
					day: day,
					hour: hour,
					type: "user_Online"
				} 
			},
            { $group: { _id: "user_Online", total: { $sum: "$number" } } }
		]);
		count = parseInt(count[0].total);
		return count;
	}
}

statisticalController.numberUserOnline = async (req, res) => {
	let parse = url.parse(req.url, true);
	let day = parse.query.day;
	let hour = parse.query.hour;

	if(!day){
		req.error = err;
		return res.status(500).json("Time wrong");
	}

	try{
		let count = await statisNumberUser(day, hour, "user_Online");
		return res.json(count);
	} catch(err){
		req.error = err;
		return res.status(500).json("Time wrong");
	};
};

statisticalController.numberUserAccess = async (req, res) => {
	let parse = url.parse(req.url, true);
	let day = parse.query.day;
	let hour = parse.query.hour;

	if(!day){
		req.error = err;
		return res.status(500).json("Time wrong");
	}

	try{
		let count = await statisNumberUser(day, hour, "user_Access");
		return res.json(count);
	} catch(err){
		req.error = err;
		return res.status(500).json("Time wrong");
	};
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
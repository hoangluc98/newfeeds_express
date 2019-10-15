const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
require('dotenv').config();

module.exports.requireAuth = async function(req, res, next){
	const bearerHeader = req.headers['authorization'];
	let data = {};

	if(typeof bearerHeader !== 'undefined'){
		const bearer = bearerHeader.split(' ');

		const bearerToken = bearer[1];

		req.token = bearerToken;

		if(req.token){
			let decoded;
			try{
				decoded = jwt.verify(req.token, process.env.TOKEN_SECRETKEY);
			} catch(err){
				console.log(err);
				res.status(500).json({error: err});
			};
			const value = decoded._id;

			const user  = await User.findOne({ _id:value });
			if(user.token.toString() !== req.token.toString()){
				return res.status(500).json("Auth failed");
			}
			req.user = user;

			redisClient.set(value, value);
			redisClient.expire(value, 60*60);

			redisClient.keys('*');

			url = req.originalUrl.split('/');
			data.action = url[2];
			data.createdBy = value;
			data.category = url[1];
			data.method = req.method;
			req.data = data;
		}

		next();
	} else{
		return res.status(401).json({
			message: 'Auth failed'
		});
	}
};
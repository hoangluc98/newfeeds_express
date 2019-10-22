const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Logger = require('../models/logger.model');
const url = require('url');
// const redis = require('redis');
// const redisClient = redis.createClient({host : 'localhost'});
require('dotenv').config();

module.exports.requireAuth = async function(req, res, next){
	try{
		const bearerHeader = req.headers['authorization'];
		let data = {};

		if(req.url == '/login'){
			res.on('finish', function () {
				data.ip = req.ip;
				data.url = req.originalUrl;
				data.method = req.method;
				data.createdBy = req.userId;
	       		data.status = res.statusCode;
	       		data.data = req.data;
	       		data.error = req.error;
	       		Logger.create(data);
	    	});
			next();
		} else if(typeof bearerHeader !== 'undefined'){
			const bearer = bearerHeader.split(' ');

			const bearerToken = bearer[1];

			req.token = bearerToken;

			if(req.token){
				let decoded;
				
				decoded = jwt.verify(req.token, process.env.TOKEN_SECRETKEY);
				
				const value = decoded._id;
				const user  = await User.findOne({ _id:value });
				if(user.token.toString() !== req.token.toString()){
					return res.status(500).json("Auth failed");
				}
				req.user = user;

				// redisClient.set(value, value);
				// redisClient.expire(value, 60*60);

				res.on('finish', function () {
					data.ip = req.ip;
					data.url = req.url;
					data.method = req.method;
					data.createdBy = value;
		       		data.status = res.statusCode;
		       		data.data = req.data;
		       		data.error = req.error;
		       		Logger.create(data);
		    	});
			}

			next();
		} else{
			return res.status(401).json({
				message: 'Auth failed'
			});
		}
	} catch(err){
		console.log(err);
		res.status(500).json({error: err});
	};
};
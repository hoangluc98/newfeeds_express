const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Logger = require('../models/logger.model');
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
require('dotenv').config();

module.exports.requireAuth = async function(req, res, next){
	try{
		const bearerHeader = req.headers['authorization'];
		// let data = {};
		let request = {};
		let response = {};

		if(req.url == '/login'){
			res.on('finish', function () {
				request.ip = req.ip;
				request.url = req.originalUrl;
				request.method = req.method;
				request.createdBy = req.userId;
	       		response.status = res.statusCode;
	       		response.data = req.data;
	       		response.error = req.error;
	       		Logger.create({
	       			request,
	       			response
	       		});
	    	});
			next();
		} else if(typeof bearerHeader !== 'undefined'){
			let decoded;
			
			decoded = jwt.verify(bearerHeader, process.env.TOKEN_SECRETKEY);
			
			const value = decoded._id;
			const user  = await User.findOne({ _id:value });
			if(user.token.toString() !== bearerHeader.toString()){
				return res.status(500).json("Auth failed");
			}
			req.user = user;

			redisClient.set(value, value);
			redisClient.expire(value, 5*60);

			res.on('finish',  ()=> {
				request.ip = req.ip;
				request.url = req.originalUrl;
				request.method = req.method;
				request.createdBy = value.toString();
	       		response.status = res.statusCode;
	       		response.data = req.data;
	       		response.error = req.error;
	       		Logger.create({
	       			request,
	       			response
	       		});
	    	});

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
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const logHelper = require("../helpers/log.helper");
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const jwtHelper = require("../helpers/jwt.helper");
require('dotenv').config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret";

module.exports.requireAuth = async (req, res, next) => {
	const bearerHeader = req.headers['authorization'];

	if(typeof bearerHeader !== 'undefined'){
		try{
			const decoded = await jwtHelper.verifyToken(bearerHeader, accessTokenSecret);

			// Check token expire
			await jwtHelper.checkExpire(decoded);

			const userId = decoded.data._id;
			const user  = await User.findOne({ _id:userId });

			// Check token in db with token in header
			if(user.accessToken.toString() !== bearerHeader.toString()){
				return res.status(401).json({
			        message: 'Unauthorized.',
			    });
			}
			req.user = user;
			req.userId = userId;

			// Write log
			logHelper.log(req, res);

			next();

		} catch(err){
			return res.status(401).json({
		        message: 'Unauthorized.',
		    });
		};
	} else{
		return res.status(401).json({
			message: 'No token provided.'
		});
	}
};

module.exports.authenticate = async (req, res, next) => {
	const permission = parseInt(req.user.permission.level);
	let urlReq = req.originalUrl.split('/');
	const id = urlReq[3];
	urlReq = '/' + urlReq[1] + '/' + urlReq[2];

	const urlS = urlReq.split('/')[2];

	try{
		if(permission == 0){
			await userInsert(permission, urlReq, req);
			next();
		}
		else if(permission == 1){
			await userUpdateAndDelete(permission, urlReq, req);

			await userInsert(urlReq, req);
			next();
		}
		else if(permission == 2){			
			await userUpdateAndDelete(permission, urlReq, req);

			await userInsert(permission, urlReq, req);
			next();
		}
		else if(permission == 3){
			if(urlS == 'list' || urlS == 'item')
				next();
			else
				return res.status(500).json("not permitted");
		}
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
}

let userInsert = (permission, urlReq, req) => {
	if(urlReq == '/users/insert'){
		let level = req.body.permission.level;
		if(level <= permission)
			return res.status(500).json("not permitted");
	}
}

let userUpdateAndDelete = async (permission, urlReq, req) => {
	if(urlReq == '/users/update' || urlReq == '/users/delete'){
		if(permission == 2 && urlReq == '/users/delete')
			return res.status(500).json("not permitted");
		let userId = req.body.userId || id;
		let user = await User.findOne({_id: userId});
		if(parseInt(user.permission.level) <= 1 || parseInt(req.body.permission.level) < 1)
			return res.status(500).json("not permitted");
	}
}
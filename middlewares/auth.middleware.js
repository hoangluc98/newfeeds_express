const User = require('../models/user.model');
const GroupUser = require('../models/groupUser.model');
const jwt = require('jsonwebtoken');
const logHelper = require("../helpers/log.helper");
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const jwtHelper = require("../helpers/jwt.helper");
const os = require('os');
require('dotenv').config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret";

module.exports.requireAuth = async (req, res, next) => {
	const bearerHeader = req.headers['authorization'];

	if(typeof bearerHeader !== 'undefined'){
		try{
			const decoded = await jwtHelper.verifyToken(bearerHeader, accessTokenSecret);
			await jwtHelper.checkExpire(decoded);

			const userId = decoded.data._id;
			const device = decoded.data.device;
			const computerName = os.hostname();

			const user  = await User.findOne({ _id:userId });

			if((user.accessToken.toString() !== bearerHeader.toString()) || (device !== computerName)){
				return res.status(401).json({
			        message: 'Unauthorized.',
			    });
			}
			req.user = user;
			req.userId = userId;

			redisClient.set(userId, userId);
			redisClient.expire(userId, 5*60);

			logHelper.log(req, res);

			return next();

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
	const group = req.user.group;
	const type = req.user.type;
	const urlReq = req.originalUrl.split('/')[1];
	const pathname = (url.parse(req.url)).pathname.split('/')[1];

	try{
		/*if(type == 'superAdmin'){
			next();
		} else if(type == 'admin'){
			if(urlReq == 'users'){
				if(pathname == 'list' || pathname == 'item')
					return next();

				const userId = req.body.userId || req.params.id;
				const user  = await User.findOne({ _id:userId });
				if(user.type == 'superAdmin')
					return res.status(500).json("Not permited");
				return next();
			}
		} */
		if(type == 'admin')
			return next();
		if(type == 'user'){
			if(!group)
				return res.status(500).json('Group is not exist');

			for(i = 0; i < group.length; i++){
				let groupUser = await GroupUser.find({_id: group[i]});
				let status = groupUser[0].status;

				groupUser = groupUser[0]["permission"][urlReq];

				if(groupUser && groupUser.includes(pathname) && (status == 'enable')){
					return next();
				} 
				else if(i == (group.length - 1)){
					return res.status(500).json("Not permited");
				}
			}
		}

	} catch(err){
		req.error = err;
		return res.status(500).json({error: err});
	};
}
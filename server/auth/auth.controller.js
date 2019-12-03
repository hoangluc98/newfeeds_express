const User = require('../api/user/user.model');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const jwtHelper = require("../helpers/jwt.helper");
const logHelper = require("../helpers/log.helper");
const statisticalHelper = require("../helpers/statistical.helper");
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const os = require('os');
require('dotenv').config();

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret";

const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret";


const authController = {};

authController.postLogin = async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const hashedPassword = md5(password);

	const user = await User.findOne({email: email});

	if((!user) || (user.password.toLowerCase() !== hashedPassword.toLowerCase())){
		return res.status(403).send({
			message: "Acount wrong!"
		});
	}
	
	if(await jwtHelper.checkLogin(user, res)){
		return res.status(403).send({
            message: "Account was accessed!"
        });
	}

	userId = user._id.toString();
	req.userId = userId;
	redisClient.sadd("userAccess", userId);
	redisClient.set(userId, userId);
	redisClient.expire(userId, 5*60);

	const computerName = os.hostname();
	let userData = {
		_id: userId,
		email: email,
		device: computerName
	}

	const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife); 
    const refreshToken = await jwtHelper.generateToken(userData, refreshTokenSecret, refreshTokenLife);

    user.tokenExpire = 'false';
	user.accessToken = accessToken;
	user.refreshToken = refreshToken;
    await user.save();

	req.data = {
		email,
		hashedPassword
	};

	logHelper.log(req, res);

	res.status(200).json({
		accessToken,
		refreshToken
	});
};


authController.refreshToken = async (req, res) => {
	const refreshTokenFromClient = req.body.refreshToken;

	if (refreshTokenFromClient) {
	    try {
			const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, refreshTokenSecret);
			const userData = decoded.data;
			const user = await User.findOne({_id: userData._id});
			if(user.tokenExpire == 'true'){
				const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife);
			
				user.tokenExpire = 'false';
				user.accessToken = accessToken;
				await user.save();

				req.userId = userData._id;
				logHelper.log(req, res);

				return res.status(200).json({accessToken});
			}
			return res.status(500).json('Token not expire');

	    } catch (error) {
			return res.status(403).json({
				message: 'Invalid refresh token.'
			});
	    }
	} else {
		return res.status(403).send({
		 	message: 'No token provided.',
		});
	}
}


authController.logout = async (req, res) => {
	try{
		const user = req.user;
		const userId = req.userId;

		redisClient.del(userId);
		redisClient.srem('userAccess', userId);
		
		user.tokenExpire = ' ';
		user.accessToken = ' ';
		user.refreshToken = ' ';
		await user.save();
		
		return res.status(200).json({
			message: 'Logout success'
		});
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

module.exports = authController;
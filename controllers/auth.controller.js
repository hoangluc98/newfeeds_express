const User = require('../models/user.model');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const Logger = require('../models/logger.model');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
require('dotenv').config();

const authController = {};

authController.postLogin = async function(req, res){
	const email = req.body.email;
	const password = req.body.password;
	const hashedPassword = md5(password);

	const user = await User.findOne({email: email});

	if((!user) || (user.password.toLowerCase() !== hashedPassword.toLowerCase())){
		return res.status(403).send({
			message: "Acount wrong!"
		});
	}
	if(user.token.length > 1){
		let decoded = jwt.decode(user.token);

		const now = Date.now().valueOf() / 1000;
	  		if (typeof decoded.exp !== 'undefined' && decoded.exp > now) {
	    		return res.status(403).send({
					message: "Account was accessed!"
				});
	  		}
	  		if (typeof decoded.nbf !== 'undefined' && decoded.nbf < now) {
	    		return res.status(403).send({
					message: "Account was accessed!"
				});
	  		}
	  	if(user.token == decoded){
	  		return res.status(403).send({
				message: "Account was accessed!"
			});
	  	}
	}

	userId = user._id.toString();
	req.userId = userId;
	redisClient.set(userId, userId);
	redisClient.expire(userId, 5*60);

	const timeExpire = '1d';
	let token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_SECRETKEY, { expiresIn: timeExpire});
	user.token = token;
    await user.save();

	req.data = {
		email,
		hashedPassword,
		timeExpire
	};

	res.status(200).json({
		message: "Auth successful",
		token: token,

	});
};

authController.logout = async function(req, res){
	const bearerHeader = req.headers['authorization'];
	if(typeof bearerHeader !== 'undefined'){
		try{
			let decoded;
			decoded = jwt.verify(bearerHeader, process.env.TOKEN_SECRETKEY);

			const user  = await User.findOne({ _id:decoded._id });

			req.userId = user._id.toString();
			userId = user._id.toString();
			redisClient.set(userId, userId);
			redisClient.expire(userId, 0);
			user.token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_SECRETKEY, { expiresIn: '-1d'});
			// user.token = " ";
			await user.save();

			return res.status(200).json({
				message: 'Logout success'
			});
		} catch(err){
			req.error = err;
			res.status(500).json({error: err});
		};
	} else{
		return res.status(401).json({
			message: 'Logout failed'
		});
	}
};

module.exports = authController;
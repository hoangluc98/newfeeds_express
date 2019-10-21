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
	let data = {};

	const user = await User.findOne({email: email});
	if(!user){
		return res.status(403).send({
			message: "User not exist"
		});
	}
	if(user.password !== hashedPassword){
		return res.status(403).send({
			message: "Wrong password"
		});
	}

	const value = user.id;

	redisClient.set(value, value);
	redisClient.expire(value, 120);

	const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_SECRETKEY, { expiresIn: '1h'});
	user.token = token;
    await user.save();

    url = req.originalUrl.split('/');
	data.action = url[2];
	data.category = url[1];
	data.method = req.method;
	data.createdBy = value;
	data.data = {
		email: email,
		password: hashedPassword
	};
	data.status = "200";
	data.message = "Auth successful";
	Logger.create(data);

	return res.status(200).json({
		message: "Auth successful",
		token: token
	});
};

authController.logout = async function(req, res){
	const bearerHeader = req.headers['authorization'];
	let data = {};
	if(typeof bearerHeader !== 'undefined'){
		const bearer = bearerHeader.split(' ');
		const bearerToken = bearer[1];

		if(bearerToken){
			let decoded;
			try{
				decoded = jwt.verify(bearerToken, process.env.TOKEN_SECRETKEY);
			} catch(err){
				console.log(err);
				res.status(500).json({error: err});
			};
			console.log(decoded);

			const user  = await User.findOne({ _id:decoded._id });
			console.log(user);
			user.token = ' ';
			await user.save();

			url = req.originalUrl.split('/');
			data.action = url[2];
			data.category = url[1];
			data.method = req.method;
			data.createdBy = user._id;
			data.data = {};
			data.status = "200";
			data.message = "Logout successful";
			Logger.create(data);
			return res.status(200).json({
				message: 'Logout success'
			});
		}
	} else{
		return res.status(401).json({
			message: 'Logout failed'
		});
	}
};

module.exports = authController;
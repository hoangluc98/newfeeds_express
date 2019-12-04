const User = require('../api/user/user.model');
const md5 = require('md5');
const jwtHelper = require('../helpers/jwt.helper');
const logHelper = require('../helpers/log.helper');
const token = require('../config/token');
const os = require('os');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});

// Access Token
const accessTokenLife = token.ACCESS_TOKEN_LIFE || '1h';
const accessTokenSecret = token.ACCESS_TOKEN_SECRET || 'access-token-secret';

// Refresh Token
const refreshTokenLife = token.REFRESH_TOKEN_LIFE || '3650d';
const refreshTokenSecret = token.REFRESH_TOKEN_SECRET || 'refresh-token-secret';

const authController = {};

authController.postLogin = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findByCredentials(email, password);
    if (!user) {
        return res.status(401).send({error: 'Login failed! Check authentication credentials'})
    }

	userId = user._id.toString();
	// redisClient.sadd('userAccess', userId);
	// redisClient.set(userId, userId);
	// redisClient.expire(userId, 5*60);

	const computerName = os.hostname();
	let userData = {
		_id: userId,
		email: email,
		device: computerName
	}

	const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife); 
    const refreshToken = await jwtHelper.generateToken(userData, refreshTokenSecret, refreshTokenLife);
    user.tokens = user.tokens.concat({
    	tokenExpire: false,
    	accessToken,
    	refreshToken
    });
    await user.save();

	// req.data = {
	// 	email,
	// 	hashedPassword
	// };

	// logHelper.log(req, res);

	res.status(200).json(user.tokens);
};


authController.refreshToken = async (req, res) => {
	const refreshTokenFromClient = req.body.refreshToken;

    try {
		const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, refreshTokenSecret);
		const userData = decoded.data;
		const user = await User.findOne({_id: userData._id}, {'tokens.refreshToken': refreshTokenFromClient});
		
		if(user.tokens.tokenExpire === false)
			return res.status(500).json('Token not expire');

		const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife);
	
		user.tokens.tokenExpire = false;
		user.tokens.accessToken = accessToken;
		await user.save();

		logHelper.log(req, res);

		return res.status(200).json({accessToken});

    } catch (error) {
		return res.status(403).json({
			message: 'Invalid refresh token.'
		});
    }
}


authController.logout = async (req, res) => {
	try {
		const user = req.user;
		const userId = user._id;

		user.tokens = user.tokens.filter((token) => {
            return token.accessToken != req.tokenHeader
        })
        
		// redisClient.del(userId);
		// redisClient.srem('userAccess', userId);
		
		await user.save();
		
		return res.status(200).json({
			message: 'Logout success'
		});
	} catch(err) {
		req.error = err;
		res.status(500).json({error: err});
	};
};

module.exports = authController;
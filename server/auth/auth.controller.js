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

	let userId = user._id.toString();
	let type = user.type;
	redisClient.sadd('userAccess', userId);

	const computerName = os.hostname();
	let userData = {
		_id: userId,
		email: email,
		type: type
	}

	const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife); 
    const refreshToken = await jwtHelper.generateToken(userData, refreshTokenSecret, refreshTokenLife);

    let tokenData = {
    	accessToken,
    	refreshToken
    };

    user.tokens = user.tokens.concat(tokenData);
    await user.save();

	// req.data = {
	// 	email
	// };

	// logHelper.log(req, res);

	res.status(200).json({
		accessToken,
    	refreshToken
	});
};


authController.refreshToken = async (req, res) => {
	const refreshTokenFromClient = req.body.refreshToken;

    try {
		const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, refreshTokenSecret);
		const userData = decoded.data;
		const user = await User.findOne({ _id: userData._id, 'tokens.refreshToken': refreshTokenFromClient }, 'tokens');
		let acsToken;
		user.tokens = user.tokens.filter((token) => {
			if(token.refreshToken != refreshTokenFromClient)
				return true;
            acsToken = token.accessToken;
            return false;
        });

		if(!jwtHelper.checkExpire(acsToken))
			return res.status(500).json('Token not expire');

		const accessToken = await jwtHelper.generateToken(userData, accessTokenSecret, accessTokenLife);
		let tokenData = {
	    	accessToken: accessToken,
	    	refreshToken: refreshTokenFromClient
	    };
	    user.tokens = user.tokens.concat(tokenData);
	    await user.save();
		// // logHelper.log(req, res);

		return res.status(200).json(user);

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
        });
        await user.save();
        
		redisClient.srem('userAccess', userId);
		
		return res.status(200).json({
			message: 'Logout success'
		});
	} catch(err) {
		req.error = err;
		res.status(500).json({error: err});
	};
};

module.exports = authController;
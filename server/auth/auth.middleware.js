const User = require('../api/user/user.model');
const GroupUser = require('../api/groupUser/groupUser.model');
const logHelper = require("../helpers/log.helper");
const url = require('url');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const jwtHelper = require("../helpers/jwt.helper");
const token = require('../config/token');
const os = require('os');

const accessTokenSecret = token.ACCESS_TOKEN_SECRET || "access-token-secret";

module.exports.requireAuth = async (req, res, next) => {
	const tokenHeader = req.headers['authorization'];

	try{
		const decoded = await jwtHelper.verifyToken(tokenHeader, accessTokenSecret);

		const userId = decoded.data._id;
		if(jwtHelper.checkExpire(tokenHeader)) 
			return res.status(500).json('Token expired');

		// const device = decoded.data.device;
		// const computerName = os.hostname();

		const user = await User.findOne({ _id: userId, 'tokens.accessToken': tokenHeader });
		if (!user)
            throw new Error();

		req.user = user;
		req.tokenHeader = tokenHeader;
		logHelper.log(req, res);

		return next();

	} catch(err) {
		return res.status(401).json({
	        message: 'Not authorized to access this resource',
	    });
	}
};

module.exports.authenticate = async (req, res, next) => {
	const group = req.user.group;
	const type = req.user.type;
	const status = req.user.status;
	const urlReq = req.originalUrl.split('/')[1];
	const pathname = (url.parse(req.url)).pathname.split('/')[1];

	try {
		if(status == 'disable')
			return res.status(500).json("Not permited");
		if(type == 'admin')
			return next();
		if(type == 'user') {
			if(!group)
				return res.status(500).json('Group is not exist');

			for(i = 0; i < group.length; i++) {
				let groupUser = await GroupUser.find({_id: group[i]});
				let status = groupUser[0].status;

				groupUser = groupUser[0]["permission"][urlReq];

				if(groupUser && groupUser.includes(pathname) && (status == 'enable')) {
					return next();
				} 
				else if(i == (group.length - 1)) {
					return res.status(500).json("Not permited");
				}
			}
		}

	} catch(err) {
		req.error = err;
		return res.status(500).json({error: err});
	};
}
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const CronJob = require('cron').CronJob;
const Statistical = require('../models/statistical.model');

let statisticalUser = {};
let numUserAccess = 0;
let numUserOnline = 0;

statisticalUser.job = new CronJob({
		cronTime: '0 0 * * * *', 
		onTick: async function() {
			redisClient.scard('userAccess', (err, num) => {
				if (err){
					req.error = err;
					return res.json(err);
				}
				numUserAccess = num;
			});

			redisClient.keys('*', (err, keys) => {
				if (err){
					req.error = err;
					return res.json(err);
				}
				numUserOnline = keys.length - 1;
			});

			await Statistical.create({numUserAccess: numUserAccess, numUserOnline: numUserOnline});
		},
		start: false,
		timeZone: 'Asia/Ho_Chi_Minh'
	});
statisticalUser.job.start();

module.exports = statisticalUser;
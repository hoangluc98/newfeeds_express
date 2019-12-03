const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});
const CronJob = require('cron').CronJob;
const StatisHour = require('../api/statistical/statisHour.model');
const StatisDay = require('../api/statistical/statisDay.model');

let statisticalUser = {};

statisticalUser.jobHour = new CronJob({
		cronTime: '0 0 * * * *', 
		onTick: async function() {
			let date = new Date();
			let day = date.getFullYear() + '-' + check(date.getMonth() + 1) + '-' + check(date.getDate());
			let hour = check(date.getHours());
			redisClient.scard('userAccess', (err, num) => {
				if (err){
					req.error = err;
					return res.json(err);
				}
				let number = parseInt(num);

				StatisHour.create({
					type: "user_Access",
					number: number,
					day,
					hour
				});
			});
			redisClient.del('userAccess');

			redisClient.keys('*', (err, keys) => {
				if (err){
					req.error = err;
					return res.json(err);
				}

				let number = keys.length;
				StatisHour.create({
					type: "user_Online",
					number,
					day,
					hour
				});
			});
		},
		start: false,
		timeZone: 'Asia/Ho_Chi_Minh'
	});
statisticalUser.jobHour.start();

statisticalUser.jobDay = new CronJob({
		cronTime: '0 30 23 * * *', 
		onTick: async function() {
			let date = new Date();
			let day = date.getFullYear() + '-' + check(date.getMonth() + 1) + '-' + check(date.getDate());

			statisDayFunc(day, "user_Access");

			statisDayFunc(day, "user_Online");
		},
		start: false,
		timeZone: 'Asia/Ho_Chi_Minh'
	});
statisticalUser.jobDay.start();

let statisDayFunc = async (day, type) => {
	let number = await StatisHour.aggregate([
		{ $match: 
			{ 
				day: day,
				type: type
			} 
		},
        { $group: { _id: type, total: { $sum: "$number" } } }
	]);
	number = number[0].total;
	let list = await StatisHour.find({ day: day, type: type }, 'hour number -_id');
	if(type == 'user_Access'){
		StatisDay.create({
			type,
			number,
			list,
			day
		})
	} else{
		StatisDay.create({
			type,
			list,
			day
		})
	}
}

let check = (time) => {
	if(time < 10)
		return ('0' + time);
	return time;
}

module.exports = statisticalUser;
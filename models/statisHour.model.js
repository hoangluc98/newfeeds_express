const mongoose = require('mongoose');

let statisHourSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true
	},
	number: {
		type: Number,
		required: true
	},
	day: {
        type: String,
		required: true
    },
	hour: {
        type: String,
		required: true
    }
});

let StatisHour = mongoose.model('StatisHour', statisHourSchema, 'statisHours');

module.exports = StatisHour;
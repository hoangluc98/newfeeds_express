const mongoose = require('mongoose');

let statisDaySchema = new mongoose.Schema({
	type: {
		type: String,
		required: true
	},
	number: {
		type: Number
	},
	list: {
		type: Array,
		required: true
	},
	day: {
        type: String,
		required: true
    }
});

let StatisDay = mongoose.model('StatisDay', statisDaySchema, 'statisDays');

module.exports = StatisDay;
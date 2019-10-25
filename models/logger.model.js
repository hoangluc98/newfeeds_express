const mongoose = require('mongoose');

let loggerSchema = new mongoose.Schema({
	request: {
		type: Object,
		require: true
	},
	response: {
		type: Object,
		require: true
	},
    created_At_: {
        type: Date,
        expires: '1d',
        default: Date.now
    }
});

let Logger = mongoose.model('Logger', loggerSchema, 'loggers');

module.exports = Logger;
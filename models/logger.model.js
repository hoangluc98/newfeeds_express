const mongoose = require('mongoose');

let loggerSchema = new mongoose.Schema({
	ip: {
		type: String
	},
	url: {
		type: String
	},
	method: {
		type: String
	},
	status: {
		type: String
	},
	data: {
		type: Object
	},
	error: {
		type: String
	},
	createdBy: {
		type: String
	},
    created_At_: {
        type: Date,
        expires: '1d',
        default: Date.now
    }
});

let Logger = mongoose.model('Logger', loggerSchema, 'loggers');

module.exports = Logger;
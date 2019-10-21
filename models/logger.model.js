const mongoose = require('mongoose');

let loggerSchema = new mongoose.Schema({
	action: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	method: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true
	},
	data: {
		type: Object,
		required: true
	},
	createdBy: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
    created_At_: {
        type: Date,
        expires: '1h',
        default: Date.now
    }
});

let Logger = mongoose.model('Logger', loggerSchema, 'loggers');

module.exports = Logger;
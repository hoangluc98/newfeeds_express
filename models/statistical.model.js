const mongoose = require('mongoose');

let statisticalSchema = new mongoose.Schema({
	created_At_: {
        type: Date,
        default: Date.now
    },
	numUserAccess: {
		type: String,
		required: true
	},
	numUserOnline: {
		type: String,
		required: true
	}
});

let Statistical = mongoose.model('Statistical', statisticalSchema, 'statisticals');

module.exports = Statistical;
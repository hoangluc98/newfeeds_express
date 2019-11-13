const mongoose = require('mongoose');

let groupUserSchema = new mongoose.Schema({
	status: {
		type: String,
		required: true
	},
	permission: {
		type: Object,
		required: true
	},	
	created_At_: {
		type: Date,
		required: true
	},
    updated_At_: {
        type: Date,
        default: Date.now
    }
});

let GroupUser = mongoose.model('GroupUser', groupUserSchema, 'groupUsers');

module.exports = GroupUser;
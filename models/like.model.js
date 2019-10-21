const mongoose = require('mongoose');

let likeSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	articleId: {
		type: String,
		required: true
	},
	created_At_: {
        type: Date,
        default: Date.now
    }
});

let Like = mongoose.model('Like', likeSchema, 'likes');

module.exports = Like;
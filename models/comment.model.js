var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true
	},
	image: String,
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
		required: true
	},
    updated_At_: {
        type: Date,
        default: Date.now
    }
});

commentSchema.index({articleId: 1});

var Comment = mongoose.model('Comment', commentSchema, 'comments');

module.exports = Comment;
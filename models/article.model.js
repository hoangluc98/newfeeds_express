const mongoose = require('mongoose');

let articleSchema = new mongoose.Schema({
	status: String,
	content: {
		type: String,
		required: true
	},
	image: String,
	userId: {
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

let Article = mongoose.model('Article', articleSchema, 'articles');

module.exports = Article;
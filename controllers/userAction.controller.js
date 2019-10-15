var Like = require('../models/like.model');
const jwt = require('jsonwebtoken');

module.exports.like = async function(req, res) {
	var errors = [];
	if(!req.body.articleId) errors.push("articleId is required");

	if(errors.length > 0){
		res.json(errors);
		return;
	}

	req.body.userId = req.user._id;

	var like = await Like.create(req.body);
	res.json(like);
};
const User = require('../models/user.model');
const url = require('url');
const md5 = require('md5');

const userController = {};

userController.list = async function(req, res) {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;

	try{
		const users = await User.find().limit(10).skip(10*(page-1));
		const total = await User.countDocuments();

		let data = {
			list: users,
			total
		};
		req.data = data;

		res.status(200).json(data);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

userController.item = function(req, res) {
	User.find({_id: req.params.id})
		.exec()
		.then(doc => {
			req.data = doc;
			res.status(200).json(doc);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({error: err});
		});
};

userController.create = async function(req, res) {
	if(!req.body.name || !req.body.email || !req.body.password)
		return res.status(500).json("Created user failed");

	req.body.password = md5(req.body.password);
	req.body.created_At_ = Date.now();

	let user;
	try{
		user = new User(req.body);
	} catch(err){
		res.status(500).json({error: err});
	};
    
	user.save()
		.then(result => {
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /users",
				createdUser: result
			});
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

userController.update = async function(req, res) {
	const userId = req.body.userId;

	if(req.body.password)
		req.body.password = md5(req.body.password);

	try{
		await User.findByIdAndUpdate({_id: userId}, req.body);
	} catch(err){
		res.status(500).json({error: err});
	};

	User.find({_id: userId})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json({
				message: "Handing POST request to /users",
				createdUser: result
			});
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

userController.delete = function(req, res) {
	User.findByIdAndRemove({_id: req.params.id})
		.exec()
		.then(result => {
			req.data = result;
			res.status(200).json("Delete successful");
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

module.exports = userController;
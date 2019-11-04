const User = require('../models/user.model');
const Permission = require('../permission/permission');
const url = require('url');
const md5 = require('md5');

const userController = {};

userController.list = async (req, res) => {
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

userController.item = (req, res) => {
	User.find({_id: req.params.id})
		.exec()
		.then(doc => {
			req.data = doc[0];
			res.status(200).json(doc[0]);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({error: err});
		});
};

userController.create = async (req, res) => {
	if(!req.body.name || !req.body.email || !req.body.password)
		return res.status(500).json("Created user failed");

	const permission = parseInt(req.body.permission);
	if(permission){
		if(permission <= 3 && permission >= 0)
			req.body.permission = Permission[permission];
		else
			return res.status(500).json("Permission wrong");
	}

	req.body.password = req.body.password.toLowerCase();
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
			res.status(201).json(result);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

userController.update = async (req, res) => {
	const userId = req.body.userId;
	const permission = parseInt(req.body.permission);
	if(permission){
		if(permission <= 3 && permission >= 0)
			req.body.permission = Permission[permission];
		else
			return res.status(500).json("Permission wrong");
	}

	if(req.body.password)
		req.body.password = req.body.password.toLowerCase();

	try{
		await User.findOneAndUpdate({_id: userId}, req.body);
	} catch(err){
		res.status(500).json({error: err});
	};

	User.find({_id: userId})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json(result[0]);
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

userController.delete = (req, res) => {
	User.findOneAndDelete({_id: req.params.id})
		.exec()
		.then(result => {
			req.data = result;
			console.log("delete");
			res.status(204).json("Delete successful");
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

module.exports = userController;
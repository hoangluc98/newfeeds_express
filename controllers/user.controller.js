const User = require('../models/user.model');
const url = require('url');
const md5 = require('md5');
const Logger = require('../models/logger.model');

const userController = {};

let addLog = function(req, status, message, data){
	req.data.status = status;
	req.data.message = message;
	req.data.data = data ? data : {};
	Logger.create(req.data);
}

userController.list = async function(req, res) {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;

	try{
		const users = await User.find().limit(10).skip(10*(page-1));
		const total = await User.countDocuments();
		addLog(req, "200", "List users", users);

		res.status(200).json({
			list: users,
			total
		});
	} catch(err){
		addLog(req, "500", "List failed");
		res.status(500).json({error: err});
	};
};

userController.item = function(req, res) {
	User.find({_id: req.params.id})
		.exec()
		.then(doc => {
			addLog(req, "200", "Item user", doc);
			res.status(200).json(doc);
		})
		.catch(err => {
			addLog(req, "500", err);
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
		const token = await user.newAuthToken();
	} catch(err){
		res.status(500).json({error: err});
	};
    
	user.save()
		.then(result => {
			addLog(req, "200", "Created user", result);
			res.status(201).json({
				message: "Handing POST request to /users",
				createdUser: result
			});
		})
		.catch(err => {
			addLog(req, "500", err);
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
			addLog(req, "200", "Updated user", result);
			res.status(201).json({
				message: "Handing POST request to /users",
				createdUser: result
			});
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});
};

userController.delete = function(req, res) {
	User.findByIdAndRemove({_id: req.params.id})
		.exec()
		.then(result => {
			addLog(req, "200", "Delete user", result);
			res.status(200).json("Delete successful");
		})
		.catch(err => {
			addLog(req, "500", err);
			res.status(500).json({
				error: err
			});
		});
};

module.exports = userController;
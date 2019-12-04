const User = require('./user.model');
const GroupUser = require('../groupUser/groupUser.model');
const url = require('url');

const userController = {};
const select = '-_id email name type status created_At_ updated_At_';

userController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;

	try{
		const users = await User.find({}, select).limit(10).skip(10*(page-1));
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
	User.find({_id: req.body.id}, select)
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
	const password = req.body.password;
	const group = req.body.group;
	if(!req.body.name || !req.body.email || !password || !group || !req.body.status)
		return res.status(500).json('Created user failed');

	for(i = 0; i < group.length; i++){
		let groupUser = await GroupUser.find({_id: group[i]});
		if(!groupUser)
			return res.status(500).json('Group is not exist');
	}

	req.body.password = password.toLowerCase();
	req.body.created_At_ = Date.now();

	try{
		let result = await User.create(req.body);
		req.data = result;
		res.status(201).json(result);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

userController.update = async (req, res) => {
	const userId = req.body.userId;

	if(userId !== req.user._id)
		return res.status(500).json('There was a problem updating the user.');
	if(req.body.password)
		req.body.password = req.body.password.toLowerCase();

	try{
		await User.findByIdAndUpdate({_id: userId}, req.body);

		let result = await User.find({_id: userId});
		req.data = result;
		res.status(201).json(result[0]);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

userController.delete = (req, res) => {
	User.findByIdAndDelete({_id: req.body.id})
		.exec()
		.then(result => {
			req.data = result;
			res.status(201).json('Delete successful');
		})
		.catch(err => {
			req.error = err;
			res.status(500).json({
				error: err
			});
		});
};

module.exports = userController;
const GroupUser = require('./groupUser.model');
const User = require('../user/user.model');
const url = require('url');
const md5 = require('md5');

const groupUserController = {};

groupUserController.list = async (req, res) => {
	const parse = url.parse(req.url, true);
	const page = parseInt(parse.query.page) || 1;

	try{
		const groupUsers = await GroupUser.find().limit(10).skip(10*(page-1));
		const total = await GroupUser.countDocuments();

		let data = {
			list: groupUsers,
			total
		};
		req.data = data;

		res.status(200).json(data);
	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

groupUserController.item = (req, res) => {
	GroupUser.find({_id: req.body.id})
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

groupUserController.create = async (req, res) => {
	const status = req.body.status;
	const permission = req.body.permission;
	if(!permission || !status)
		return res.status(500).json("Created groupUser failed");

	req.body.created_At_ = Date.now();

	try{
		let result = await GroupUser.create(req.body);
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		req.error = err;
		res.status(500).json({error: err});
	};
};

groupUserController.update = async (req, res) => {
	let url = req.url.split('/')[2];
	const groupId = req.body.groupId;
	const permission = req.body.permission;

	if(!groupId && !permission)
		return res.status(500).json("GroupId and Permission are required");

	try{
		let groupFind = await GroupUser.find({_id: groupId});

		await GroupUser.findByIdAndUpdate({_id: groupId}, req.body);
		let result = await GroupUser.find({_id: groupId});
		req.data = result;
		res.status(201).json(result);

	} catch(err){
		res.status(500).json({error: err});
	};
};

groupUserController.delete = (req, res) => {
	GroupUser.findByIdAndDelete({_id: req.body.id})
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

module.exports = groupUserController;
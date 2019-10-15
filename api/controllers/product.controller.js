var Product = require('../../models/product.model');

module.exports.index = async function(req, res) {
	var product = await Product.find();
	res.json(product);
};

module.exports.indexSingle = async function(req, res) {
	var products = await Product.find({_id: req.params.id});
	res.json(products);
};

module.exports.create = async function(req, res) {
	var product = await Product.create(req.body);
	res.json(product);
};

module.exports.updatePUT = async function(req, res) {
	// var product = await Product.findByIdAndUpdate({_id: req.params.id}, 
	// 	{
	// 		name: req.body.name,
	// 		image: req.body.image,
	// 		description: req.body.description
	// 	});

	await Product.findByIdAndUpdate({_id: req.params.id}, 
		{
			name: req.body.name,
			image: req.body.image,
			description: req.body.description
		});
	var product = await Product.find({_id: req.params.id});
	res.json(product);
};

module.exports.updatePATCH = async function(req, res) {
	// var product = await Product.findByIdAndUpdate({_id: req.params.id}, req.body);
	await Product.findByIdAndUpdate({_id: req.params.id}, req.body);
	var product = await Product.find({_id: req.params.id});
	res.json(product);
};

module.exports.delete = async function(req, res) {
	var product = await Product.findByIdAndRemove({_id: req.params.id});
	res.json(product);
};

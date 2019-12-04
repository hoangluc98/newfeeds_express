const Logger = require('./logger.model');

let log = (req, res) => {
	let request = {};
	let response = {};

	res.on('finish',  () => {
		request.ip = req.ip;
		request.url = req.originalUrl;
		request.method = req.method;
		request.createdBy = req.user._id.toString();
   		response.status = res.statusCode;
   		response.data = req.data;
   		response.error = req.error;
   		Logger.create({
   			request,
   			response
   		});
	});
}

module.exports = {
    log: log
};
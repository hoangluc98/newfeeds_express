const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

module.exports = function(app) {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
}
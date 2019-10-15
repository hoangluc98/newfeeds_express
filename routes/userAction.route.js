var express = require('express');

var controller = require('../controllers/userAction.controller');

var router = express.Router();

router.post('/like', controller.like);

module.exports = router;

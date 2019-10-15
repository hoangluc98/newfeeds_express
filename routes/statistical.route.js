var express = require('express');

var controller = require('../controllers/statistical.controller');

var router = express.Router();

router.get('/count-user-onl', controller.numberUser);
router.get('/count-like', controller.numberLike);
router.get('/count-comment', controller.numberComment);

module.exports = router;

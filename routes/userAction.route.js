const express = require('express');

const controller = require('../controllers/userAction.controller');

const router = express.Router();

router.post('/like', controller.like);

module.exports = router;

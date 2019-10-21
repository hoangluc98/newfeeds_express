const express = require("express");
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', controller.postLogin);
router.get('/logout', controller.logout);

module.exports = router;
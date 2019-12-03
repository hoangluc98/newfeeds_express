const express = require("express");
const controller = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

const router = express.Router();

router.post('/login', controller.postLogin);
router.post('/refresh-token', controller.refreshToken);
router.get('/logout', authMiddleware.requireAuth, controller.logout);

module.exports = router;
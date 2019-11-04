const express = require("express");
const controller = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', controller.postLogin);
router.post('/refresh-token', controller.refreshToken);
router.get('/logout', authMiddleware.requireAuth, controller.logout);

module.exports = router;
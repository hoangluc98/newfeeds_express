const express = require("express");

const router = express.Router();

const userRoute = require('./user/user.route');
const groupUserRoute = require('./groupUser/groupUser.route');
const authRoute = require('../auth/auth.route');
const articleRoute = require('./article/article.route');
const commentRoute = require('./comment/comment.route');
const statisticalRoute = require('./statistical/statistical.route');

const authMiddleware = require('../auth/auth.middleware');

router.use('/auth', authRoute);
router.use('/users', authMiddleware.requireAuth, authMiddleware.authenticate, userRoute);
router.use('/groupUsers', authMiddleware.requireAuth, authMiddleware.authenticate, groupUserRoute);
router.use('/articles', authMiddleware.requireAuth, authMiddleware.authenticate, articleRoute);
router.use('/comments', authMiddleware.requireAuth, authMiddleware.authenticate, commentRoute);
router.use('/statisticals', authMiddleware.requireAuth, authMiddleware.authenticate, statisticalRoute);

module.exports = router;
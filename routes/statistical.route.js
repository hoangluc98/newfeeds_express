const express = require('express');

const controller = require('../controllers/statistical.controller');

const router = express.Router();

router.get('/user-access', controller.numberUserAccess);
router.get('/like-of-article', controller.numberLikeOfArticle);
router.get('/comment-of-article', controller.numberCommentofArticle);
router.post('/like-of-user', controller.numberLikeOfUser);
router.post('/comment-of-user', controller.numberCommentOfUser);
router.post('/article-of-user', controller.numberArticleOfUser);

module.exports = router;

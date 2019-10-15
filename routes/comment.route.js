var express = require('express');

var controller = require('../controllers/comment.controller');

var router = express.Router();

router.get('/list', controller.list);
router.get('/item/:id', controller.item);
router.post('/insert', controller.create);
router.post('/update', controller.update);
router.get('/delete/:id', controller.delete);

module.exports = router;

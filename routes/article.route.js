const express = require('express');

const controller = require('../controllers/article.controller');

const router = express.Router();

router.get('/list', controller.list);
router.get('/item/:id', controller.item);
router.post('/insert', controller.create);
router.post('/update', controller.update);
router.get('/delete/:id', controller.delete);

module.exports = router;

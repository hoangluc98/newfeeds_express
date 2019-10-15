var express = require('express');

var controller = require('../controllers/product.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.indexSingle);
router.post('/', controller.create);
router.put('/:id', controller.updatePUT);
router.patch('/:id', controller.updatePATCH);
router.delete('/:id', controller.delete);

module.exports = router;

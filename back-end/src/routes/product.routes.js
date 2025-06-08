const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const router = express.Router();
const { addProduct, getProducts, updateProduct, deleteProduct, sellProduct } = require('../controllers/product.controller');

router.post('/', addProduct);
router.get('/', getProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.post('/:id/sell', authenticate, sellProduct);

module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const authenticate = require('../middleware/auth.middleware');
const { addProduct, getProducts, updateProduct, deleteProduct, sellProduct } = require('../controllers/product.controller');

router.post('/', upload.single('image'), addProduct);
router.get('/', getProducts);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

router.post('/:id/sell', authenticate, sellProduct);

module.exports = router;
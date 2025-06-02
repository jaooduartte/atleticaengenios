const express = require('express');
const router = express.Router();
const { addProduct, getProducts } = require('../controllers/product.controller');

router.post('/', addProduct);
router.get('/', getProducts);

module.exports = router;
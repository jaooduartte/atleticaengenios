const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');

router.post('/transaction', financialController.createTransaction);
router.get('/transactions', financialController.listTransactions);
router.put('/transaction/:id', financialController.updateTransaction);
router.delete('/transaction/:id', financialController.deleteTransaction);

module.exports = router;
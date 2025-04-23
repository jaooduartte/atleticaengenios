const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/transaction', authenticate, financialController.createTransaction);
router.get('/transactions', authenticate, financialController.listTransactions);
router.put('/transaction/:id', authenticate, financialController.updateTransaction);
router.delete('/transaction/:id', authenticate, financialController.deleteTransaction);

module.exports = router;
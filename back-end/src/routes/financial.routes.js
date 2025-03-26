const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');

// Rota para criar transação
router.post('/transaction', financialController.createTransaction);

// Rota para listar transações
router.get('/transactions', financialController.listTransactions);

module.exports = router;
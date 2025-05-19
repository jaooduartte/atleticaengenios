const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.post('/inativar-inativos', adminController.inativarInativos);

module.exports = router;
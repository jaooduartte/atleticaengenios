const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

router.post('/register', authController.registerUser);

module.exports = router;
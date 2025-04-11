const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
router.post('/register', authController.register);

const authenticate = require('../middleware/auth.middleware');
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

module.exports = router;
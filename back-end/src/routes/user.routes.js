const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/', authenticate, userController.getAllUsers);
router.put('/:id', authenticate, userController.updateUser);

module.exports = router;
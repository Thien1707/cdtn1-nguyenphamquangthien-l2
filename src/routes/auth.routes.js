const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.post('/login', authController.login);
router.get('/me', authenticate, authController.currentUser);
router.post('/users', authenticate, allowRoles('MANAGER'), authController.createUser);

module.exports = router;
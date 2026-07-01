const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Login Page
router.get('/login', authController.login);

// Process Login
router.post('/login', authController.processLogin);

// Logout
router.get('/logout', authController.logout);

// Profile (requires auth)
router.get('/profile', authMiddleware, authController.profile);
router.post('/profile', authMiddleware, authController.updateProfile);

// Change Password (requires auth)
router.get('/change-password', authMiddleware, authController.changePassword);
router.post('/change-password', authMiddleware, authController.processChangePassword);

module.exports = router;

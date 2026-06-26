const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Page
router.get('/login', authController.login);

// Process Login
router.post('/login', authController.processLogin);

// Logout
router.get('/logout', authController.logout);

module.exports = router;

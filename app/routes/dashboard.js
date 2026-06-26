const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin Dashboard (requires auth + admin role)
router.get('/admin', authMiddleware, adminMiddleware, dashboardController.admin);

// User Dashboard (requires auth)
router.get('/user', authMiddleware, dashboardController.user);

module.exports = router;

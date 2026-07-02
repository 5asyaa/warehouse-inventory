const express = require('express');
const router = express.Router();
const warehouseAnalysisController = require('../controllers/warehouseAnalysisController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Warehouse Analysis Route (Admin only)
router.get('/analysis', authMiddleware, adminMiddleware, warehouseAnalysisController.analysis);

module.exports = router;

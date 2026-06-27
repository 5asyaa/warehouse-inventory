const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Index - List all barang
router.get('/', barangController.index);

// Create - Show create form
router.get('/create', barangController.create);

// Store - Save new barang
router.post('/', barangController.store);

// Detail - Show barang detail
router.get('/:id', barangController.detail);

// Edit - Show edit form
router.get('/:id/edit', barangController.edit);

// Update - Update barang
router.post('/:id/update', barangController.update);

// Activate - Reactivate barang
router.post('/:id/activate', barangController.activate);

// Delete - Soft delete barang
router.post('/:id/delete', barangController.destroy);

module.exports = router;

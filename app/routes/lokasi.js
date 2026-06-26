const express = require('express');
const router = express.Router();
const lokasiController = require('../controllers/lokasiController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Index - List all lokasi
router.get('/', lokasiController.index);

// Create - Show create form
router.get('/create', lokasiController.create);

// Store - Save new lokasi
router.post('/', lokasiController.store);

// Edit - Show edit form
router.get('/:id/edit', lokasiController.edit);

// Update - Update lokasi
router.post('/:id/update', lokasiController.update);

// Delete - Delete lokasi
router.post('/:id/delete', lokasiController.destroy);

module.exports = router;

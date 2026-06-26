const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Index - List all kategori
router.get('/', kategoriController.index);

// Create - Show create form
router.get('/create', kategoriController.create);

// Store - Save new kategori
router.post('/', kategoriController.store);

// Edit - Show edit form
router.get('/:id/edit', kategoriController.edit);

// Update - Update kategori
router.post('/:id/update', kategoriController.update);

// Delete - Delete kategori
router.post('/:id/delete', kategoriController.destroy);

module.exports = router;

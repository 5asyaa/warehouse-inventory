const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Index - List all users
router.get('/', userController.index);

// Create - Show create form
router.get('/create', userController.create);

// Store - Save new user
router.post('/', userController.store);

// Edit - Show edit form
router.get('/:id/edit', userController.edit);

// Update - Update user
router.post('/:id/update', userController.update);

// Deactivate - Soft delete user
router.post('/:id/deactivate', userController.deactivate);

// Activate - Reactivate user
router.post('/:id/activate', userController.activate);

// Delete - Hard delete user
router.post('/:id/delete', userController.destroy);

module.exports = router;

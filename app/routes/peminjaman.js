const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');
const authMiddleware = require('../middleware/auth');
const userMiddleware = require('../middleware/user');
const adminMiddleware = require('../middleware/admin');

// Apply auth middleware to all routes
router.use(authMiddleware);

// User Routes (User only)
router.get('/', userMiddleware, peminjamanController.index);
router.get('/create', userMiddleware, peminjamanController.create);
router.post('/', userMiddleware, peminjamanController.store);

// Admin Routes (Admin only)
router.get('/manage', adminMiddleware, peminjamanController.approval);
router.get('/manage/riwayat', adminMiddleware, peminjamanController.riwayat);
router.get('/manage/:id', adminMiddleware, peminjamanController.detail);
router.post('/manage/:id/approve', adminMiddleware, peminjamanController.approve);
router.post('/manage/:id/reject', adminMiddleware, peminjamanController.reject);
router.post('/manage/:id/return', adminMiddleware, peminjamanController.return);

router.get('/:id', peminjamanController.detail);

module.exports = router;

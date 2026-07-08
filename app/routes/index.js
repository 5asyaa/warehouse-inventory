const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Import other routes
router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/kategori', require('./kategori'));
router.use('/lokasi', require('./lokasi'));
router.use('/barang', require('./barang'));
router.use('/user', require('./user'));
router.use('/peminjaman', require('./peminjaman'));
router.use('/warehouse', require('./warehouse'));

// Import API routes (using JWT authentication)
router.use('/api/auth', require('./apiAuth'));

module.exports = router;

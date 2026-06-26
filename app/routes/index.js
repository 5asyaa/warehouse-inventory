const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('welcome', {
        title: 'Warehouse - Inventory Management System'
    });
});

// Import other routes
router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/kategori', require('./kategori'));

// Other routes (to be implemented)
// router.use('/barang', require('./barang'));
// router.use('/lokasi', require('./lokasi'));
// router.use('/user', require('./user'));
// router.use('/peminjaman', require('./peminjaman'));

module.exports = router;

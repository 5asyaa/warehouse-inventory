const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyJWT = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/login
 * @desc    Proses login API menggunakan JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Cari user berdasarkan username
        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Cek status keaktifan user
        if (user.status !== 'Aktif') {
            return res.status(401).json({
                success: false,
                message: 'Akun Anda tidak aktif. Hubungi administrator.'
            });
        }

        // Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Generate JWT Token (Masa berlaku 24 jam)
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            message: 'Login berhasil',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('API Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Mendapatkan detail profil user yang sedang login (Terproteksi JWT)
 * @access  Private (JWT)
 */
router.get('/me', verifyJWT, async (req, res) => {
    try {
        // req.user diset oleh middleware verifyJWT
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('API Get Me Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

module.exports = router;

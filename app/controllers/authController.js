const bcrypt = require('bcrypt');
const User = require('../models/User');

const authController = {
    // Login Page
    login: (req, res) => {
        if (req.session.userId) {
            // User already logged in, redirect based on role
            if (req.session.role === 'Admin') {
                return res.redirect('/dashboard/admin');
            } else {
                return res.redirect('/dashboard/user');
            }
        }
        res.render('auth/login', {
            title: 'Login - Warehouse',
            layout: 'layouts/auth'
        });
    },

    // Process Login
    processLogin: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.render('auth/login', {
                    title: 'Login - Warehouse',
                    error: 'Username dan password harus diisi',
                    layout: 'layouts/auth'
                });
            }

            // Find user by username
            const user = await User.findByUsername(username);

            if (!user) {
                return res.render('auth/login', {
                    title: 'Login - Warehouse',
                    error: 'Username atau password salah',
                    layout: 'layouts/auth'
                });
            }

            // Check if user is active
            if (user.status !== 'Aktif') {
                return res.render('auth/login', {
                    title: 'Login - Warehouse',
                    error: 'Akun Anda tidak aktif. Hubungi administrator.',
                    layout: 'layouts/auth'
                });
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.render('auth/login', {
                    title: 'Login - Warehouse',
                    error: 'Username atau password salah',
                    layout: 'layouts/auth'
                });
            }

            // Set session
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.namaLengkap = user.nama_lengkap;
            req.session.role = user.role;

            // Redirect based on role
            if (user.role === 'Admin') {
                res.redirect('/dashboard/admin');
            } else {
                res.redirect('/dashboard/user');
            }

        } catch (error) {
            console.error('Login error:', error);
            res.render('auth/login', {
                title: 'Login - Warehouse',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                layout: 'layouts/auth'
            });
        }
    },

    // Logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    }
};

module.exports = authController;

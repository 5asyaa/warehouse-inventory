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
            res.redirect('/auth/login');
        });
    },

    // Profile Page
    profile: async (req, res) => {
        try {
            const userId = req.session.userId;
            const user = await User.getById(userId);
            
            const layout = req.session.role === 'Admin' ? 'layouts/admin' : 'layouts/user';
            
            res.render('auth/profile', {
                title: 'Profile - Warehouse',
                user: req.session,
                activeMenu: 'profile',
                layout: layout,
                profile: user
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            res.redirect('/dashboard/' + req.session.role.toLowerCase());
        }
    },

    // Update Profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.session.userId;
            const { nama_lengkap, email } = req.body;

            // Validation
            if (!nama_lengkap || nama_lengkap.trim().length === 0) {
                return res.json({ success: false, message: 'Nama lengkap wajib diisi' });
            }

            if (nama_lengkap.length > 100) {
                return res.json({ success: false, message: 'Nama lengkap maksimal 100 karakter' });
            }

            if (!email || email.trim().length === 0) {
                return res.json({ success: false, message: 'Email wajib diisi' });
            }

            // Check email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.json({ success: false, message: 'Format email tidak valid' });
            }

            // Check duplicate email
            const emailCount = await User.checkDuplicateEmail(email, userId);
            if (emailCount > 0) {
                return res.json({ success: false, message: 'Email sudah digunakan oleh user lain' });
            }

            // Update profile
            await User.updateProfile(userId, {
                nama_lengkap: nama_lengkap.trim(),
                email: email.trim()
            });

            // Update session
            req.session.namaLengkap = nama_lengkap.trim();

            res.json({ success: true, message: 'Profile berhasil diperbarui' });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.json({ success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' });
        }
    },

    // Change Password Page
    changePassword: async (req, res) => {
        try {
            const layout = req.session.role === 'Admin' ? 'layouts/admin' : 'layouts/user';
            
            res.render('auth/change-password', {
                title: 'Ganti Password - Warehouse',
                user: req.session,
                activeMenu: 'profile',
                layout: layout
            });
        } catch (error) {
            console.error('Error loading change password page:', error);
            res.redirect('/dashboard/' + req.session.role.toLowerCase());
        }
    },

    // Process Change Password
    processChangePassword: async (req, res) => {
        try {
            const userId = req.session.userId;
            const { current_password, new_password, confirm_password } = req.body;

            // Validation
            if (!current_password || !new_password || !confirm_password) {
                return res.json({ success: false, message: 'Semua field wajib diisi' });
            }

            if (new_password.length < 8) {
                return res.json({ success: false, message: 'Password baru minimal 8 karakter' });
            }

            if (new_password !== confirm_password) {
                return res.json({ success: false, message: 'Konfirmasi password tidak sama' });
            }

            if (current_password === new_password) {
                return res.json({ success: false, message: 'Password baru tidak boleh sama dengan password lama' });
            }

            // Get current user
            const user = await User.findById(userId);

            // Verify current password
            const isPasswordValid = await bcrypt.compare(current_password, user.password);
            if (!isPasswordValid) {
                return res.json({ success: false, message: 'Password lama tidak benar' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(new_password, 10);

            // Update password
            await User.updatePassword(userId, hashedPassword);

            res.json({ success: true, message: 'Password berhasil diubah' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.json({ success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' });
        }
    }
};

module.exports = authController;

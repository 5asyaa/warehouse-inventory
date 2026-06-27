const User = require('../models/User');
const bcrypt = require('bcrypt');

const userController = {
    // Index - List all users
    index: async (req, res) => {
        try {
            const users = await User.getAll();
            
            // Check peminjaman relations for each user
            const usersWithRelations = await Promise.all(
                users.map(async (usr) => {
                    const hasRelations = await User.checkPeminjamanRelations(usr.id);
                    return {
                        ...usr,
                        hasPeminjamanRelations: hasRelations > 0
                    };
                })
            );
            
            res.render('user/index', {
                title: 'Daftar User - Warehouse',
                user: req.session,
                activeMenu: 'user',
                layout: 'layouts/admin',
                users: usersWithRelations
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.render('user/index', {
                title: 'Daftar User - Warehouse',
                user: req.session,
                activeMenu: 'user',
                layout: 'layouts/admin',
                users: [],
                error: 'Gagal memuat data user'
            });
        }
    },

    // Create - Show create form
    create: (req, res) => {
        res.render('user/create', {
            title: 'Tambah User - Warehouse',
            user: req.session,
            activeMenu: 'user',
            layout: 'layouts/admin'
        });
    },

    // Store - Save new user
    store: async (req, res) => {
        try {
            const { username, password, nama_lengkap, email, role, status } = req.body;

            // Validation
            if (!username || username.trim() === '') {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username wajib diisi',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (username.length < 3) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username minimal 3 karakter',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (username.length > 50) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username maksimal 50 karakter',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (!nama_lengkap || nama_lengkap.trim() === '') {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Nama lengkap wajib diisi',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (nama_lengkap.length > 100) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Nama lengkap maksimal 100 karakter',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (!email || email.trim() === '') {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Email wajib diisi',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Format email tidak valid',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (!password || password.trim() === '') {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Password wajib diisi',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (password.length < 6) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Password minimal 6 karakter',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (!role) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Role wajib dipilih',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            if (!status) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Status wajib dipilih',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            // Check duplicate username
            const duplicateUsername = await User.checkDuplicateUsername(username);
            if (duplicateUsername > 0) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username sudah digunakan',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            // Check duplicate email
            const duplicateEmail = await User.checkDuplicateEmail(email);
            if (duplicateEmail > 0) {
                return res.render('user/create', {
                    title: 'Tambah User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Email sudah digunakan',
                    username,
                    nama_lengkap,
                    email,
                    role,
                    status
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            await User.create({
                username: username.trim(),
                password: hashedPassword,
                nama_lengkap: nama_lengkap.trim(),
                email: email.trim(),
                role,
                status
            });

            res.redirect('/user');
        } catch (error) {
            console.error('Error creating user:', error);
            res.render('user/create', {
                title: 'Tambah User - Warehouse',
                user: req.session,
                activeMenu: 'user',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                username: req.body.username,
                nama_lengkap: req.body.nama_lengkap,
                email: req.body.email,
                role: req.body.role,
                status: req.body.status
            });
        }
    },

    // Edit - Show edit form
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.getById(id);

            if (!user) {
                return res.redirect('/user');
            }

            res.render('user/edit', {
                title: 'Edit User - Warehouse',
                user: req.session,
                activeMenu: 'user',
                layout: 'layouts/admin',
                user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.redirect('/user');
        }
    },

    // Update - Update user
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, password, nama_lengkap, email, role, status } = req.body;

            // Validation
            if (!username || username.trim() === '') {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username wajib diisi',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (username.length < 3) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username minimal 3 karakter',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (username.length > 50) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username maksimal 50 karakter',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (!nama_lengkap || nama_lengkap.trim() === '') {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Nama lengkap wajib diisi',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (nama_lengkap.length > 100) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Nama lengkap maksimal 100 karakter',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (!email || email.trim() === '') {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Email wajib diisi',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Format email tidak valid',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            // Password validation (optional on edit)
            if (password && password.length < 6) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Password minimal 6 karakter',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (!role) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Role wajib dipilih',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            if (!status) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Status wajib dipilih',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            // Check duplicate username (exclude current id)
            const duplicateUsername = await User.checkDuplicateUsername(username, id);
            if (duplicateUsername > 0) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Username sudah digunakan',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            // Check duplicate email (exclude current id)
            const duplicateEmail = await User.checkDuplicateEmail(email, id);
            if (duplicateEmail > 0) {
                const user = await User.getById(id);
                return res.render('user/edit', {
                    title: 'Edit User - Warehouse',
                    user: req.session,
                    activeMenu: 'user',
                    layout: 'layouts/admin',
                    error: 'Email sudah digunakan',
                    user: { ...user, username, nama_lengkap, email, role, status }
                });
            }

            // Prepare update data
            const updateData = {
                username: username.trim(),
                nama_lengkap: nama_lengkap.trim(),
                email: email.trim(),
                role,
                status
            };

            // Hash password only if provided
            if (password && password.trim() !== '') {
                updateData.password = await bcrypt.hash(password, 10);
            }

            // Update user
            await User.update(id, updateData);

            res.redirect('/user');
        } catch (error) {
            console.error('Error updating user:', error);
            const user = await User.getById(req.params.id);
            res.render('user/edit', {
                title: 'Edit User - Warehouse',
                user: req.session,
                activeMenu: 'user',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                user: { ...user, ...req.body }
            });
        }
    },

    // Delete - Hard delete user with relation check
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            const currentUserId = req.session.userId;

            // Prevent admin from deleting their own account
            if (parseInt(id) === currentUserId) {
                return res.json({
                    success: false,
                    message: 'Tidak dapat menghapus atau menonaktifkan akun yang sedang digunakan.'
                });
            }

            // Check if user has peminjaman relations
            const hasRelations = await User.checkPeminjamanRelations(id);
            if (hasRelations > 0) {
                return res.json({
                    success: false,
                    message: 'User memiliki riwayat transaksi sehingga tidak dapat dihapus permanen. Silakan gunakan fitur Nonaktifkan.'
                });
            }

            // Hard delete user
            await User.hardDelete(id);

            res.json({
                success: true,
                message: 'User berhasil dihapus permanen.'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    },

    // Deactivate - Soft delete user (change status to Nonaktif)
    deactivate: async (req, res) => {
        try {
            const { id } = req.params;
            const currentUserId = req.session.userId;

            // Prevent admin from deactivating their own account
            if (parseInt(id) === currentUserId) {
                return res.json({
                    success: false,
                    message: 'Tidak dapat menghapus atau menonaktifkan akun yang sedang digunakan.'
                });
            }

            // Get the user being deactivated
            const user = await User.getById(id);
            if (!user) {
                return res.json({
                    success: false,
                    message: 'User tidak ditemukan.'
                });
            }

            // Check if user is an admin
            if (user.role === 'Admin') {
                // Count active admins
                const activeAdmins = await User.getActiveAdminCount();
                if (activeAdmins <= 1) {
                    return res.json({
                        success: false,
                        message: 'Tidak dapat menonaktifkan Admin terakhir. Minimal harus ada satu Admin aktif.'
                    });
                }
            }

            // Soft delete by changing status to Nonaktif
            await User.deactivate(id);

            res.json({
                success: true,
                message: 'User berhasil dinonaktifkan.'
            });
        } catch (error) {
            console.error('Error deactivating user:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    },

    // Activate - Reactivate user (change status to Aktif)
    activate: async (req, res) => {
        try {
            const { id } = req.params;
            const currentUserId = req.session.userId;

            // Prevent admin from activating their own account (not needed but consistent)
            if (parseInt(id) === currentUserId) {
                return res.json({
                    success: false,
                    message: 'Tidak dapat mengubah status akun yang sedang digunakan.'
                });
            }

            // Activate by changing status to Aktif
            await User.activate(id);

            res.json({
                success: true,
                message: 'User berhasil diaktifkan kembali.'
            });
        } catch (error) {
            console.error('Error activating user:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    }
};

module.exports = userController;

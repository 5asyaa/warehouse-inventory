const Lokasi = require('../models/Lokasi');

const lokasiController = {
    // Index - List all lokasi
    index: async (req, res) => {
        try {
            const lokasi = await Lokasi.getAll();
            res.render('lokasi/index', {
                title: 'Daftar Lokasi - Warehouse',
                user: req.session,
                activeMenu: 'lokasi',
                layout: 'layouts/admin',
                lokasi
            });
        } catch (error) {
            console.error('Error fetching lokasi:', error);
            res.render('lokasi/index', {
                title: 'Daftar Lokasi - Warehouse',
                user: req.session,
                activeMenu: 'lokasi',
                layout: 'layouts/admin',
                lokasi: [],
                error: 'Gagal memuat data lokasi'
            });
        }
    },

    // Create - Show create form
    create: (req, res) => {
        res.render('lokasi/create', {
            title: 'Tambah Lokasi - Warehouse',
            user: req.session,
            activeMenu: 'lokasi',
            layout: 'layouts/admin'
        });
    },

    // Store - Save new lokasi
    store: async (req, res) => {
        try {
            const { nama_lokasi, deskripsi } = req.body;

            // Validation
            if (!nama_lokasi || nama_lokasi.trim() === '') {
                return res.render('lokasi/create', {
                    title: 'Tambah Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi wajib diisi',
                    nama_lokasi,
                    deskripsi
                });
            }

            if (nama_lokasi.length > 100) {
                return res.render('lokasi/create', {
                    title: 'Tambah Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi maksimal 100 karakter',
                    nama_lokasi,
                    deskripsi
                });
            }

            if (deskripsi && deskripsi.length > 255) {
                return res.render('lokasi/create', {
                    title: 'Tambah Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Deskripsi maksimal 255 karakter',
                    nama_lokasi,
                    deskripsi
                });
            }

            // Check duplicate
            const duplicate = await Lokasi.checkDuplicate(nama_lokasi);
            if (duplicate > 0) {
                return res.render('lokasi/create', {
                    title: 'Tambah Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi sudah ada',
                    nama_lokasi,
                    deskripsi
                });
            }

            // Create lokasi
            await Lokasi.create({
                nama_lokasi: nama_lokasi.trim(),
                deskripsi: deskripsi ? deskripsi.trim() : null
            });

            res.redirect('/lokasi');
        } catch (error) {
            console.error('Error creating lokasi:', error);
            res.render('lokasi/create', {
                title: 'Tambah Lokasi - Warehouse',
                user: req.session,
                activeMenu: 'lokasi',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                nama_lokasi: req.body.nama_lokasi,
                deskripsi: req.body.deskripsi
            });
        }
    },

    // Edit - Show edit form
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const lokasi = await Lokasi.getById(id);

            if (!lokasi) {
                return res.redirect('/lokasi');
            }

            res.render('lokasi/edit', {
                title: 'Edit Lokasi - Warehouse',
                user: req.session,
                activeMenu: 'lokasi',
                layout: 'layouts/admin',
                lokasi
            });
        } catch (error) {
            console.error('Error fetching lokasi:', error);
            res.redirect('/lokasi');
        }
    },

    // Update - Update lokasi
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama_lokasi, deskripsi } = req.body;

            // Validation
            if (!nama_lokasi || nama_lokasi.trim() === '') {
                const lokasi = await Lokasi.getById(id);
                return res.render('lokasi/edit', {
                    title: 'Edit Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi wajib diisi',
                    lokasi: { ...lokasi, nama_lokasi, deskripsi }
                });
            }

            if (nama_lokasi.length > 100) {
                const lokasi = await Lokasi.getById(id);
                return res.render('lokasi/edit', {
                    title: 'Edit Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi maksimal 100 karakter',
                    lokasi: { ...lokasi, nama_lokasi, deskripsi }
                });
            }

            if (deskripsi && deskripsi.length > 255) {
                const lokasi = await Lokasi.getById(id);
                return res.render('lokasi/edit', {
                    title: 'Edit Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Deskripsi maksimal 255 karakter',
                    lokasi: { ...lokasi, nama_lokasi, deskripsi }
                });
            }

            // Check duplicate (exclude current id)
            const duplicate = await Lokasi.checkDuplicate(nama_lokasi, id);
            if (duplicate > 0) {
                const lokasi = await Lokasi.getById(id);
                return res.render('lokasi/edit', {
                    title: 'Edit Lokasi - Warehouse',
                    user: req.session,
                    activeMenu: 'lokasi',
                    layout: 'layouts/admin',
                    error: 'Nama lokasi sudah ada',
                    lokasi: { ...lokasi, nama_lokasi, deskripsi }
                });
            }

            // Update lokasi
            await Lokasi.update(id, {
                nama_lokasi: nama_lokasi.trim(),
                deskripsi: deskripsi ? deskripsi.trim() : null
            });

            res.redirect('/lokasi');
        } catch (error) {
            console.error('Error updating lokasi:', error);
            const lokasi = await Lokasi.getById(req.params.id);
            res.render('lokasi/edit', {
                title: 'Edit Lokasi - Warehouse',
                user: req.session,
                activeMenu: 'lokasi',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                lokasi: { ...lokasi, nama_lokasi: req.body.nama_lokasi, deskripsi: req.body.deskripsi }
            });
        }
    },

    // Delete - Delete lokasi
    destroy: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if lokasi is used by barang
            const usage = await Lokasi.checkUsage(id);
            if (usage > 0) {
                return res.json({
                    success: false,
                    message: 'Lokasi masih digunakan oleh barang. Tidak dapat dihapus.'
                });
            }

            // Delete lokasi
            await Lokasi.delete(id);

            res.json({
                success: true,
                message: 'Lokasi berhasil dihapus.'
            });
        } catch (error) {
            console.error('Error deleting lokasi:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    }
};

module.exports = lokasiController;

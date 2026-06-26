const Kategori = require('../models/Kategori');

const kategoriController = {
    // Index - List all kategori
    index: async (req, res) => {
        try {
            const kategori = await Kategori.getAll();
            res.render('kategori/index', {
                title: 'Daftar Kategori - Warehouse',
                user: req.session,
                activeMenu: 'kategori',
                layout: 'layouts/admin',
                kategori
            });
        } catch (error) {
            console.error('Error fetching kategori:', error);
            res.render('kategori/index', {
                title: 'Daftar Kategori - Warehouse',
                user: req.session,
                activeMenu: 'kategori',
                layout: 'layouts/admin',
                kategori: [],
                error: 'Gagal memuat data kategori'
            });
        }
    },

    // Create - Show create form
    create: (req, res) => {
        res.render('kategori/create', {
            title: 'Tambah Kategori - Warehouse',
            user: req.session,
            activeMenu: 'kategori',
            layout: 'layouts/admin'
        });
    },

    // Store - Save new kategori
    store: async (req, res) => {
        try {
            const { nama_kategori, deskripsi } = req.body;

            // Validation
            if (!nama_kategori || nama_kategori.trim() === '') {
                return res.render('kategori/create', {
                    title: 'Tambah Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori wajib diisi',
                    nama_kategori,
                    deskripsi
                });
            }

            if (nama_kategori.length > 100) {
                return res.render('kategori/create', {
                    title: 'Tambah Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori maksimal 100 karakter',
                    nama_kategori,
                    deskripsi
                });
            }

            if (deskripsi && deskripsi.length > 255) {
                return res.render('kategori/create', {
                    title: 'Tambah Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Deskripsi maksimal 255 karakter',
                    nama_kategori,
                    deskripsi
                });
            }

            // Check duplicate
            const duplicate = await Kategori.checkDuplicate(nama_kategori);
            if (duplicate > 0) {
                return res.render('kategori/create', {
                    title: 'Tambah Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori sudah ada',
                    nama_kategori,
                    deskripsi
                });
            }

            // Create kategori
            await Kategori.create({
                nama_kategori: nama_kategori.trim(),
                deskripsi: deskripsi ? deskripsi.trim() : null
            });

            res.redirect('/kategori');
        } catch (error) {
            console.error('Error creating kategori:', error);
            res.render('kategori/create', {
                title: 'Tambah Kategori - Warehouse',
                user: req.session,
                activeMenu: 'kategori',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                nama_kategori: req.body.nama_kategori,
                deskripsi: req.body.deskripsi
            });
        }
    },

    // Edit - Show edit form
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const kategori = await Kategori.getById(id);

            if (!kategori) {
                return res.redirect('/kategori');
            }

            res.render('kategori/edit', {
                title: 'Edit Kategori - Warehouse',
                user: req.session,
                activeMenu: 'kategori',
                layout: 'layouts/admin',
                kategori
            });
        } catch (error) {
            console.error('Error fetching kategori:', error);
            res.redirect('/kategori');
        }
    },

    // Update - Update kategori
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama_kategori, deskripsi } = req.body;

            // Validation
            if (!nama_kategori || nama_kategori.trim() === '') {
                const kategori = await Kategori.getById(id);
                return res.render('kategori/edit', {
                    title: 'Edit Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori wajib diisi',
                    kategori: { ...kategori, nama_kategori, deskripsi }
                });
            }

            if (nama_kategori.length > 100) {
                const kategori = await Kategori.getById(id);
                return res.render('kategori/edit', {
                    title: 'Edit Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori maksimal 100 karakter',
                    kategori: { ...kategori, nama_kategori, deskripsi }
                });
            }

            if (deskripsi && deskripsi.length > 255) {
                const kategori = await Kategori.getById(id);
                return res.render('kategori/edit', {
                    title: 'Edit Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Deskripsi maksimal 255 karakter',
                    kategori: { ...kategori, nama_kategori, deskripsi }
                });
            }

            // Check duplicate (exclude current id)
            const duplicate = await Kategori.checkDuplicate(nama_kategori, id);
            if (duplicate > 0) {
                const kategori = await Kategori.getById(id);
                return res.render('kategori/edit', {
                    title: 'Edit Kategori - Warehouse',
                    user: req.session,
                    activeMenu: 'kategori',
                    layout: 'layouts/admin',
                    error: 'Nama kategori sudah ada',
                    kategori: { ...kategori, nama_kategori, deskripsi }
                });
            }

            // Update kategori
            await Kategori.update(id, {
                nama_kategori: nama_kategori.trim(),
                deskripsi: deskripsi ? deskripsi.trim() : null
            });

            res.redirect('/kategori');
        } catch (error) {
            console.error('Error updating kategori:', error);
            const kategori = await Kategori.getById(req.params.id);
            res.render('kategori/edit', {
                title: 'Edit Kategori - Warehouse',
                user: req.session,
                activeMenu: 'kategori',
                layout: 'layouts/admin',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                kategori: { ...kategori, nama_kategori: req.body.nama_kategori, deskripsi: req.body.deskripsi }
            });
        }
    },

    // Delete - Delete kategori
    destroy: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if kategori is used by barang
            const usage = await Kategori.checkUsage(id);
            if (usage > 0) {
                return res.json({
                    success: false,
                    message: 'Kategori masih digunakan oleh barang. Tidak dapat dihapus.'
                });
            }

            // Delete kategori
            await Kategori.delete(id);

            res.json({
                success: true,
                message: 'Kategori berhasil dihapus.'
            });
        } catch (error) {
            console.error('Error deleting kategori:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    }
};

module.exports = kategoriController;

const Barang = require('../models/Barang');
const multer = require('multer');
const path = require('path');

// Configure multer for barang image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads/barang'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'barang-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya file JPG, JPEG, atau PNG yang diperbolehkan'));
        }
    }
}).single('foto');

const barangController = {
    // Index - List all barang
    index: async (req, res) => {
        try {
            const barang = await Barang.getAll();
            res.render('barang/index', {
                title: 'Daftar Barang - Warehouse',
                user: req.session,
                activeMenu: 'barang',
                layout: 'layouts/admin',
                barang
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            res.render('barang/index', {
                title: 'Daftar Barang - Warehouse',
                user: req.session,
                activeMenu: 'barang',
                layout: 'layouts/admin',
                barang: [],
                error: 'Gagal memuat data barang'
            });
        }
    },

    // Detail - Show barang detail
    detail: async (req, res) => {
        try {
            const { id } = req.params;
            const barang = await Barang.getById(id);

            if (!barang) {
                return res.redirect('/barang');
            }

            res.render('barang/detail', {
                title: 'Detail Barang - Warehouse',
                user: req.session,
                activeMenu: 'barang',
                layout: 'layouts/admin',
                barang
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            res.redirect('/barang');
        }
    },

    // Create - Show create form
    create: async (req, res) => {
        try {
            const kategoriList = await Barang.getKategoriList();
            const lokasiList = await Barang.getLokasiList();
            const kodeBarang = await Barang.generateKodeBarang();

            res.render('barang/create', {
                title: 'Tambah Barang - Warehouse',
                user: req.session,
                activeMenu: 'barang',
                layout: 'layouts/admin',
                kategoriList,
                lokasiList,
                kodeBarang
            });
        } catch (error) {
            console.error('Error loading create form:', error);
            res.redirect('/barang');
        }
    },

    // Store - Save new barang
    store: (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err);
                const kategoriList = await Barang.getKategoriList();
                const lokasiList = await Barang.getLokasiList();
                const kodeBarang = await Barang.generateKodeBarang();
                return res.render('barang/create', {
                    title: 'Tambah Barang - Warehouse',
                    user: req.session,
                    activeMenu: 'barang',
                    layout: 'layouts/admin',
                    error: err.message || 'Gagal upload foto',
                    kategoriList,
                    lokasiList,
                    kodeBarang,
                    nama_barang: req.body.nama_barang,
                    deskripsi: req.body.deskripsi,
                    stok: req.body.stok,
                    stok_minimum: req.body.stok_minimum
                });
            }

            try {
                const { nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, status } = req.body;
                const foto = req.file ? '/uploads/barang/' + req.file.filename : '/uploads/barang/default.png';

                // Validation
                if (!nama_barang || nama_barang.trim() === '') {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Nama barang wajib diisi',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (!kategori_id) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Kategori wajib dipilih',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (!lokasi_id) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Lokasi wajib dipilih',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (stok < 0) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Stok tidak boleh negatif',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (stok_minimum < 0) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Stok minimum tidak boleh negatif',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (!kondisi) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Kondisi wajib dipilih',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                if (!status) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    const kodeBarang = await Barang.generateKodeBarang();
                    return res.render('barang/create', {
                        title: 'Tambah Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Status wajib dipilih',
                        kategoriList,
                        lokasiList,
                        kodeBarang,
                        nama_barang,
                        deskripsi,
                        stok,
                        stok_minimum
                    });
                }

                // Generate kode barang
                const kodeBarang = await Barang.generateKodeBarang();

                // Create barang
                await Barang.create({
                    kode_barang: kodeBarang,
                    nama_barang: nama_barang.trim(),
                    deskripsi: deskripsi ? deskripsi.trim() : null,
                    kategori_id,
                    lokasi_id,
                    stok: parseInt(stok),
                    stok_minimum: parseInt(stok_minimum),
                    kondisi,
                    foto,
                    status
                });

                res.redirect('/barang');
            } catch (error) {
                console.error('Error creating barang:', error);
                const kategoriList = await Barang.getKategoriList();
                const lokasiList = await Barang.getLokasiList();
                const kodeBarang = await Barang.generateKodeBarang();
                res.render('barang/create', {
                    title: 'Tambah Barang - Warehouse',
                    user: req.session,
                    activeMenu: 'barang',
                    layout: 'layouts/admin',
                    error: 'Terjadi kesalahan. Silakan coba lagi.',
                    kategoriList,
                    lokasiList,
                    kodeBarang,
                    nama_barang: req.body.nama_barang,
                    deskripsi: req.body.deskripsi,
                    stok: req.body.stok,
                    stok_minimum: req.body.stok_minimum
                });
            }
        });
    },

    // Edit - Show edit form
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const barang = await Barang.getById(id);
            const kategoriList = await Barang.getKategoriList();
            const lokasiList = await Barang.getLokasiList();

            if (!barang) {
                return res.redirect('/barang');
            }

            res.render('barang/edit', {
                title: 'Edit Barang - Warehouse',
                user: req.session,
                activeMenu: 'barang',
                layout: 'layouts/admin',
                barang,
                kategoriList,
                lokasiList
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            res.redirect('/barang');
        }
    },

    // Update - Update barang
    update: (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err);
                const barang = await Barang.getById(req.params.id);
                const kategoriList = await Barang.getKategoriList();
                const lokasiList = await Barang.getLokasiList();
                return res.render('barang/edit', {
                    title: 'Edit Barang - Warehouse',
                    user: req.session,
                    activeMenu: 'barang',
                    layout: 'layouts/admin',
                    error: err.message || 'Gagal upload foto',
                    barang: { ...barang, ...req.body },
                    kategoriList,
                    lokasiList
                });
            }

            try {
                const { id } = req.params;
                const { nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, status } = req.body;
                
                // Get existing barang to preserve old photo if no new photo uploaded
                const existingBarang = await Barang.getById(id);
                const foto = req.file ? '/uploads/barang/' + req.file.filename : existingBarang.foto;

                // Validation
                if (!nama_barang || nama_barang.trim() === '') {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Nama barang wajib diisi',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (!kategori_id) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Kategori wajib dipilih',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (!lokasi_id) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Lokasi wajib dipilih',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (stok < 0) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Stok tidak boleh negatif',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (stok_minimum < 0) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Stok minimum tidak boleh negatif',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (!kondisi) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Kondisi wajib dipilih',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                if (!status) {
                    const kategoriList = await Barang.getKategoriList();
                    const lokasiList = await Barang.getLokasiList();
                    return res.render('barang/edit', {
                        title: 'Edit Barang - Warehouse',
                        user: req.session,
                        activeMenu: 'barang',
                        layout: 'layouts/admin',
                        error: 'Status wajib dipilih',
                        barang: { ...existingBarang, nama_barang, deskripsi, stok, stok_minimum },
                        kategoriList,
                        lokasiList
                    });
                }

                // Update barang
                await Barang.update(id, {
                    nama_barang: nama_barang.trim(),
                    deskripsi: deskripsi ? deskripsi.trim() : null,
                    kategori_id,
                    lokasi_id,
                    stok: parseInt(stok),
                    stok_minimum: parseInt(stok_minimum),
                    kondisi,
                    foto,
                    status
                });

                res.redirect('/barang');
            } catch (error) {
                console.error('Error updating barang:', error);
                const barang = await Barang.getById(req.params.id);
                const kategoriList = await Barang.getKategoriList();
                const lokasiList = await Barang.getLokasiList();
                res.render('barang/edit', {
                    title: 'Edit Barang - Warehouse',
                    user: req.session,
                    activeMenu: 'barang',
                    layout: 'layouts/admin',
                    error: 'Terjadi kesalahan. Silakan coba lagi.',
                    barang: { ...barang, ...req.body },
                    kategoriList,
                    lokasiList
                });
            }
        });
    },

    // Delete - Soft delete barang
    destroy: async (req, res) => {
        try {
            const { id } = req.params;

            // Soft delete by changing status to Nonaktif
            await Barang.softDelete(id);

            res.json({
                success: true,
                message: 'Barang berhasil dinonaktifkan.'
            });
        } catch (error) {
            console.error('Error deleting barang:', error);
            res.json({
                success: false,
                message: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
    }
};

module.exports = barangController;

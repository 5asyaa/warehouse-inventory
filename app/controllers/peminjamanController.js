const Peminjaman = require('../models/Peminjaman');
const Barang = require('../models/Barang');

const peminjamanController = {
    // Index - List user's borrowing history
    index: async (req, res) => {
        try {
            const userId = req.session.userId;
            const peminjamanList = await Peminjaman.getByUserId(userId);
            
            res.render('peminjaman/index', {
                title: 'Riwayat Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/user',
                peminjaman: peminjamanList
            });
        } catch (error) {
            console.error('Error fetching peminjaman:', error);
            res.render('peminjaman/index', {
                title: 'Riwayat Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/user',
                peminjaman: [],
                error: 'Gagal memuat data peminjaman'
            });
        }
    },

    // Create - Show borrowing form
    create: async (req, res) => {
        try {
            const availableBarang = await Peminjaman.getAvailableBarang();
            
            res.render('peminjaman/create', {
                title: 'Ajukan Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/user',
                barangList: availableBarang,
                barang_id: '',
                jumlah: '',
                tanggal_pinjam: '',
                tanggal_kembali: '',
                alasan: ''
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            res.render('peminjaman/create', {
                title: 'Ajukan Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/user',
                barangList: [],
                error: 'Gagal memuat data barang',
                barang_id: '',
                jumlah: '',
                tanggal_pinjam: '',
                tanggal_kembali: '',
                alasan: ''
            });
        }
    },

    // Store - Save borrowing request
    store: async (req, res) => {
        try {
            const { barang_id, jumlah, tanggal_pinjam, tanggal_kembali, alasan } = req.body;
            const userId = req.session.userId;

            // Validation
            if (!barang_id) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Barang wajib dipilih',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            if (!jumlah || parseInt(jumlah) < 1) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Jumlah minimal 1',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            if (!tanggal_pinjam) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Tanggal pinjam wajib diisi',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            if (!tanggal_kembali) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Tanggal kembali wajib diisi',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            // Validate tanggal kembali >= tanggal pinjam
            const pinjamDate = new Date(tanggal_pinjam);
            const kembaliDate = new Date(tanggal_kembali);
            if (kembaliDate < pinjamDate) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Tanggal kembali tidak boleh lebih kecil dari tanggal pinjam',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            if (!alasan || alasan.trim().length < 10) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Keperluan wajib diisi minimal 10 karakter',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            // Get barang details
            const barang = await Barang.getById(barang_id);
            if (!barang) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Barang tidak ditemukan',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            // Check if barang is active
            if (barang.status !== 'Aktif') {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: 'Barang tidak tersedia',
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            // Check if jumlah exceeds stok
            if (parseInt(jumlah) > barang.stok) {
                const barangList = await Peminjaman.getAvailableBarang();
                return res.render('peminjaman/create', {
                    title: 'Ajukan Peminjaman - Warehouse',
                    user: req.session,
                    activeMenu: 'peminjaman',
                    layout: 'layouts/user',
                    error: `Jumlah melebihi stok tersedia (${barang.stok})`,
                    barangList,
                    barang_id: barang_id || '',
                    jumlah: jumlah || '',
                    tanggal_pinjam: tanggal_pinjam || '',
                    tanggal_kembali: tanggal_kembali || '',
                    alasan: alasan || ''
                });
            }

            // Generate kode peminjaman
            const kodePeminjaman = await Peminjaman.generateKodePeminjaman();

            // Get today's date for tanggal_pengajuan
            const today = new Date().toISOString().split('T')[0];

            // Create peminjaman
            await Peminjaman.create({
                kode_peminjaman: kodePeminjaman,
                user_id: userId,
                barang_id: parseInt(barang_id),
                jumlah: parseInt(jumlah),
                tanggal_pengajuan: today,
                tanggal_pinjam: tanggal_pinjam,
                tanggal_jatuh_tempo: tanggal_kembali,
                alasan: alasan.trim()
            });

            res.redirect('/peminjaman');
        } catch (error) {
            console.error('Error creating peminjaman:', error);
            const barangList = await Peminjaman.getAvailableBarang();
            res.render('peminjaman/create', {
                title: 'Ajukan Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/user',
                error: 'Terjadi kesalahan. Silakan coba lagi.',
                barangList,
                barang_id: req.body.barang_id || '',
                jumlah: req.body.jumlah || '',
                tanggal_pinjam: req.body.tanggal_pinjam || '',
                tanggal_kembali: req.body.tanggal_kembali || '',
                alasan: req.body.alasan || ''
            });
        }
    },

    // Detail - Show borrowing details
    detail: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const userRole = req.session.role;
            
            const peminjaman = await Peminjaman.getById(id);
            
            if (!peminjaman) {
                return res.redirect('/peminjaman');
            }

            // User can only view their own peminjaman
            if (userRole === 'User' && peminjaman.user_id !== userId) {
                return res.redirect('/peminjaman');
            }

            // Admin can view any peminjaman
            const layout = userRole === 'Admin' ? 'layouts/admin' : 'layouts/user';
            
            res.render('peminjaman/detail', {
                title: 'Detail Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: layout,
                peminjaman
            });
        } catch (error) {
            console.error('Error fetching peminjaman detail:', error);
            res.redirect('/peminjaman');
        }
    },

    // Approval - Admin approval list
    approval: async (req, res) => {
        try {
            const peminjamanList = await Peminjaman.getAll();
            
            res.render('peminjaman/approval', {
                title: 'Kelola Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/admin',
                peminjaman: peminjamanList
            });
        } catch (error) {
            console.error('Error fetching peminjaman list:', error);
            res.render('peminjaman/approval', {
                title: 'Kelola Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/admin',
                peminjaman: [],
                error: 'Gagal memuat data peminjaman'
            });
        }
    },

    // Approve - Admin approve
    approve: async (req, res) => {
        try {
            const { id } = req.params;
            const adminId = req.session.userId;
            
            await Peminjaman.approve(id, adminId);
            
            res.json({ success: true, message: 'Peminjaman berhasil disetujui' });
        } catch (error) {
            console.error('Error approving peminjaman:', error);
            res.json({ success: false, message: error.message || 'Gagal menyetujui peminjaman' });
        }
    },

    // Reject - Admin reject
    reject: async (req, res) => {
        try {
            const { id } = req.params;
            const { alasan_penolakan } = req.body;
            
            if (!alasan_penolakan || alasan_penolakan.trim().length < 5) {
                return res.json({ success: false, message: 'Alasan penolakan wajib diisi minimal 5 karakter' });
            }
            
            await Peminjaman.reject(id, alasan_penolakan.trim());
            
            res.json({ success: true, message: 'Peminjaman berhasil ditolak' });
        } catch (error) {
            console.error('Error rejecting peminjaman:', error);
            res.json({ success: false, message: error.message || 'Gagal menolak peminjaman' });
        }
    },

    // Return - Admin return
    return: async (req, res) => {
        try {
            const { id } = req.params;
            
            await Peminjaman.return(id);
            
            res.json({ success: true, message: 'Barang berhasil dikembalikan' });
        } catch (error) {
            console.error('Error returning peminjaman:', error);
            res.json({ success: false, message: error.message || 'Gagal mengembalikan barang' });
        }
    },

    // Riwayat - Admin history (same as approval for now)
    riwayat: async (req, res) => {
        try {
            const peminjamanList = await Peminjaman.getAll();
            
            res.render('peminjaman/approval', {
                title: 'Riwayat Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/admin',
                peminjaman: peminjamanList
            });
        } catch (error) {
            console.error('Error fetching peminjaman history:', error);
            res.render('peminjaman/approval', {
                title: 'Riwayat Peminjaman - Warehouse',
                user: req.session,
                activeMenu: 'peminjaman',
                layout: 'layouts/admin',
                peminjaman: [],
                error: 'Gagal memuat data peminjaman'
            });
        }
    }
};

module.exports = peminjamanController;

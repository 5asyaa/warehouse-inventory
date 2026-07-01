const Peminjaman = require('../models/Peminjaman');
const Barang = require('../models/Barang');
const pool = require('../config/database');

const dashboardService = {
    // Get Admin Dashboard Statistics
    async getAdminStats() {
        try {
            const peminjamanStats = await Peminjaman.getStats();
            const overdue = await Peminjaman.getOverdue();
            
            // Barang statistics
            const [barangTotal] = await pool.query('SELECT COUNT(*) as total FROM barang');
            const [barangAktif] = await pool.query('SELECT COUNT(*) as total FROM barang WHERE status = ?', ['Aktif']);
            const [barangNonaktif] = await pool.query('SELECT COUNT(*) as total FROM barang WHERE status = ?', ['Nonaktif']);
            
            // User statistics
            const [userTotal] = await pool.query('SELECT COUNT(*) as total FROM users');
            const [userAktif] = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = ?', ['Aktif']);
            
            // Kategori and Lokasi
            const [kategoriTotal] = await pool.query('SELECT COUNT(*) as total FROM kategori');
            const [lokasiTotal] = await pool.query('SELECT COUNT(*) as total FROM lokasi');
            
            return {
                totalBarang: barangTotal[0].total,
                barangAktif: barangAktif[0].total,
                barangNonaktif: barangNonaktif[0].total,
                totalUser: userTotal[0].total,
                userAktif: userAktif[0].total,
                totalKategori: kategoriTotal[0].total,
                totalLokasi: lokasiTotal[0].total,
                totalPeminjaman: peminjamanStats.total,
                pendingApproval: peminjamanStats.pending,
                barangDipinjam: peminjamanStats.active,
                overdue: overdue
            };
        } catch (error) {
            console.error('Error getting admin stats:', error);
            return {
                totalBarang: 0,
                barangAktif: 0,
                barangNonaktif: 0,
                totalUser: 0,
                userAktif: 0,
                totalKategori: 0,
                totalLokasi: 0,
                totalPeminjaman: 0,
                pendingApproval: 0,
                barangDipinjam: 0,
                overdue: 0
            };
        }
    },

    // Get User Dashboard Statistics
    async getUserStats(userId) {
        try {
            const userPeminjaman = await Peminjaman.getByUserId(userId);
            const active = userPeminjaman.filter(p => p.status === 'Disetujui' || p.status === 'Dipinjam').length;
            const history = userPeminjaman.length;
            const [barangResult] = await pool.query('SELECT COUNT(*) as total FROM barang WHERE status = ? AND stok > 0', ['Aktif']);
            
            return {
                peminjamanAktif: active,
                riwayatPeminjaman: history,
                barangTersedia: barangResult[0].total
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                peminjamanAktif: 0,
                riwayatPeminjaman: 0,
                barangTersedia: 0
            };
        }
    },

    // Get Chart Data for Admin Dashboard
    async getChartData() {
        try {
            // Peminjaman per bulan (last 6 months)
            const [monthlyData] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM peminjaman
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `);

            // Status Peminjaman
            const [statusData] = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM peminjaman
                GROUP BY status
            `);

            // Barang berdasarkan Kategori
            const [kategoriData] = await pool.query(`
                SELECT 
                    k.nama_kategori,
                    COUNT(b.id) as count
                FROM kategori k
                LEFT JOIN barang b ON k.id = b.kategori_id
                GROUP BY k.id, k.nama_kategori
                ORDER BY k.nama_kategori ASC
            `);

            return {
                monthly: monthlyData,
                status: statusData,
                kategori: kategoriData
            };
        } catch (error) {
            console.error('Error getting chart data:', error);
            return {
                monthly: [],
                status: [],
                kategori: []
            };
        }
    }
};

module.exports = dashboardService;

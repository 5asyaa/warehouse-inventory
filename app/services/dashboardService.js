const Peminjaman = require('../models/Peminjaman');
const Barang = require('../models/Barang');

const dashboardService = {
    // Get Admin Dashboard Statistics
    async getAdminStats() {
        try {
            const peminjamanStats = await Peminjaman.getStats();
            const overdue = await Peminjaman.getOverdue();
            const [barangResult] = await require('../config/database').query('SELECT COUNT(*) as total FROM barang WHERE status = ?', ['Aktif']);
            
            return {
                totalBarang: barangResult[0].total,
                totalPeminjaman: peminjamanStats.total,
                pendingApproval: peminjamanStats.pending,
                barangDipinjam: peminjamanStats.active,
                overdue: overdue
            };
        } catch (error) {
            console.error('Error getting admin stats:', error);
            return {
                totalBarang: 0,
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
            const [barangResult] = await require('../config/database').query('SELECT COUNT(*) as total FROM barang WHERE status = ? AND stok > 0', ['Aktif']);
            
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
    }
};

module.exports = dashboardService;

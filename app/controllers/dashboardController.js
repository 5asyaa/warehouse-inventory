// Dashboard Controller
const dashboardService = require('../services/dashboardService');
const Peminjaman = require('../models/Peminjaman');

const dashboardController = {
    // Admin Dashboard
    admin: async (req, res) => {
        try {
            const stats = await dashboardService.getAdminStats();
            const chartData = await dashboardService.getChartData();
            
            res.render('dashboard/admin', {
                title: 'Dashboard Admin - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/admin',
                stats,
                chartData
            });
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            res.render('dashboard/admin', {
                title: 'Dashboard Admin - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/admin',
                stats: {
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
                },
                chartData: {
                    monthly: [],
                    status: [],
                    kategori: []
                }
            });
        }
    },

    // User Dashboard
    user: async (req, res) => {
        try {
            const userId = req.session.userId;
            const stats = await dashboardService.getUserStats(userId);
            const recentPeminjaman = await Peminjaman.getByUserId(userId);
            
            res.render('dashboard/user', {
                title: 'Dashboard User - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/user',
                stats,
                recentPeminjaman
            });
        } catch (error) {
            console.error('Error loading user dashboard:', error);
            res.render('dashboard/user', {
                title: 'Dashboard User - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/user',
                stats: {
                    peminjamanAktif: 0,
                    riwayatPeminjaman: 0,
                    barangTersedia: 0
                },
                recentPeminjaman: []
            });
        }
    }
};

module.exports = dashboardController;

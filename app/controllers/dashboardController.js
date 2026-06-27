// Dashboard Controller
const dashboardService = require('../services/dashboardService');

const dashboardController = {
    // Admin Dashboard
    admin: async (req, res) => {
        try {
            const stats = await dashboardService.getAdminStats();
            
            res.render('dashboard/admin', {
                title: 'Dashboard Admin - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/admin',
                stats
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
                    totalPeminjaman: 0,
                    pendingApproval: 0,
                    barangDipinjam: 0,
                    overdue: 0
                }
            });
        }
    },

    // User Dashboard
    user: async (req, res) => {
        try {
            const userId = req.session.userId;
            const stats = await dashboardService.getUserStats(userId);
            
            res.render('dashboard/user', {
                title: 'Dashboard User - Warehouse',
                user: req.session,
                activeMenu: 'dashboard',
                layout: 'layouts/user',
                stats
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
                }
            });
        }
    }
};

module.exports = dashboardController;

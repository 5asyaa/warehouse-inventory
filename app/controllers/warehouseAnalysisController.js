const warehouseAnalysisService = require('../services/warehouseAnalysisService');

const warehouseAnalysisController = {
    // Warehouse Analysis Page
    analysis: async (req, res) => {
        try {
            const analysis = await warehouseAnalysisService.getWarehouseAnalysis();
            
            res.render('warehouse/analysis', {
                title: 'Analisis Gudang - Warehouse',
                user: req.session,
                activeMenu: 'analysis',
                layout: 'layouts/admin',
                analysis
            });
        } catch (error) {
            console.error('Error loading warehouse analysis:', error);
            res.render('warehouse/analysis', {
                title: 'Analisis Gudang - Warehouse',
                user: req.session,
                activeMenu: 'analysis',
                layout: 'layouts/admin',
                analysis: {
                    kpi: {
                        totalBarang: 0,
                        barangAktif: 0,
                        barangDipinjam: 0,
                        barangTersedia: 0,
                        barangTerlambat: 0,
                        pendingApproval: 0
                    },
                    healthScore: {
                        score: 0,
                        status: 'KRITIS',
                        badge: 'danger'
                    },
                    monthly: [],
                    status: [],
                    kategori: [],
                    topBarang: [],
                    unusedBarang: [],
                    lowStock: [],
                    recentActivity: [],
                    topUser: null,
                    longestBorrowed: [],
                    overdueItems: [],
                    insights: ['Gagal memuat data analisis.']
                }
            });
        }
    }
};

module.exports = warehouseAnalysisController;

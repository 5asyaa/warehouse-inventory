const pool = require('../config/database');

const warehouseAnalysisService = {
    // Get all warehouse analysis data
    async getWarehouseAnalysis() {
        try {
            // Analisis 1: Ringkasan Kondisi Gudang (KPI)
            const [totalBarang] = await pool.query('SELECT COUNT(*) as total FROM barang');
            const [barangAktif] = await pool.query('SELECT COUNT(*) as total FROM barang WHERE status = ?', ['Aktif']);
            const [barangDipinjam] = await pool.query('SELECT COUNT(*) as total FROM peminjaman WHERE status = ?', ['Dipinjam']);
            const [barangTersedia] = await pool.query('SELECT COUNT(*) as total FROM barang WHERE status = ? AND stok > 0', ['Aktif']);
            const [barangTerlambat] = await pool.query('SELECT COUNT(*) as total FROM peminjaman WHERE status = ? AND tanggal_jatuh_tempo < CURDATE()', ['Dipinjam']);
            const [pendingApproval] = await pool.query('SELECT COUNT(*) as total FROM peminjaman WHERE status = ?', ['Menunggu']);

            // Analisis 2: Status Kesehatan Gudang
            const score = Math.max(0, Math.min(100, 100 - (barangTerlambat[0].total * 10) - (pendingApproval[0].total * 5)));
            let healthStatus = '';
            let healthBadge = '';
            if (score >= 80) {
                healthStatus = 'BAIK';
                healthBadge = 'success';
            } else if (score >= 60) {
                healthStatus = 'PERLU PERHATIAN';
                healthBadge = 'warning';
            } else {
                healthStatus = 'KRITIS';
                healthBadge = 'danger';
            }

            // Analisis 3: Peminjaman per bulan (Line Chart)
            const [monthlyData] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM peminjaman
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `);

            // Analisis 4: Status peminjaman (Pie Chart)
            const [statusData] = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM peminjaman
                GROUP BY status
            `);

            // Analisis 5: Jumlah barang per kategori (Bar Chart)
            const [kategoriData] = await pool.query(`
                SELECT 
                    k.nama_kategori,
                    COUNT(b.id) as count
                FROM kategori k
                LEFT JOIN barang b ON k.id = b.kategori_id
                GROUP BY k.id, k.nama_kategori
                ORDER BY k.nama_kategori ASC
            `);

            // Analisis 6: Top Barang Paling Sering Dipinjam
            const [topBarang] = await pool.query(`
                SELECT 
                    b.nama_barang,
                    COUNT(p.id) as total_dipinjam
                FROM barang b
                INNER JOIN peminjaman p ON b.id = p.barang_id
                GROUP BY b.id, b.nama_barang
                ORDER BY total_dipinjam DESC
                LIMIT 10
            `);

            // Analisis 7: Barang Tidak Pernah Dipinjam
            const [unusedBarang] = await pool.query(`
                SELECT 
                    b.nama_barang,
                    b.stok
                FROM barang b
                LEFT JOIN peminjaman p ON b.id = p.barang_id
                WHERE p.id IS NULL
                LIMIT 10
            `);

            // Analisis 8: Barang Hampir Habis
            const [lowStock] = await pool.query(`
                SELECT 
                    b.nama_barang,
                    b.stok,
                    b.stok_minimum
                FROM barang b
                WHERE b.stok <= b.stok_minimum
                AND b.status = 'Aktif'
                ORDER BY b.stok ASC
            `);

            // Analisis 9: Riwayat Aktivitas Terbaru
            const [recentActivity] = await pool.query(`
                SELECT 
                    p.created_at,
                    u.nama_lengkap as user_name,
                    p.status,
                    b.nama_barang,
                    DATE_FORMAT(p.created_at, '%H.%i') as time
                FROM peminjaman p
                INNER JOIN users u ON p.user_id = u.id
                INNER JOIN barang b ON p.barang_id = b.id
                ORDER BY p.created_at DESC
                LIMIT 10
            `);

            // Analisis 10: Statistik User (User Teraktif)
            const [topUser] = await pool.query(`
                SELECT 
                    u.nama_lengkap,
                    COUNT(p.id) as total_peminjaman
                FROM users u
                INNER JOIN peminjaman p ON u.id = p.user_id
                GROUP BY u.id, u.nama_lengkap
                ORDER BY total_peminjaman DESC
                LIMIT 1
            `);

            // Analisis 11: Barang Terlama Dipinjam
            const [longestBorrowed] = await pool.query(`
                SELECT 
                    b.nama_barang,
                    u.nama_lengkap as peminjam,
                    p.tanggal_pinjam,
                    DATEDIFF(CURDATE(), p.tanggal_pinjam) as hari_dipinjam
                FROM peminjaman p
                INNER JOIN barang b ON p.barang_id = b.id
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.status = 'Dipinjam'
                ORDER BY hari_dipinjam DESC
                LIMIT 5
            `);

            // Analisis 12: Deteksi Keterlambatan
            const [overdueItems] = await pool.query(`
                SELECT 
                    b.nama_barang,
                    u.nama_lengkap as peminjam,
                    DATEDIFF(CURDATE(), p.tanggal_jatuh_tempo) as hari_terlambat
                FROM peminjaman p
                INNER JOIN barang b ON p.barang_id = b.id
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.status = 'Dipinjam'
                AND CURDATE() > p.tanggal_jatuh_tempo
                ORDER BY hari_terlambat DESC
            `);

            // Analisis 13: Insight Otomatis
            const insights = [];
            
            // Insight kategori paling sering dipinjam
            const [topKategori] = await pool.query(`
                SELECT 
                    k.nama_kategori,
                    COUNT(p.id) as count
                FROM kategori k
                INNER JOIN barang b ON k.id = b.kategori_id
                INNER JOIN peminjaman p ON b.id = p.barang_id
                GROUP BY k.id, k.nama_kategori
                ORDER BY count DESC
                LIMIT 1
            `);
            if (topKategori.length > 0) {
                insights.push(`Barang ${topKategori[0].nama_kategori} merupakan kategori paling sering dipinjam.`);
            }

            // Insight barang perlu restock
            if (lowStock.length > 0) {
                insights.push(`${lowStock.length} barang perlu segera direstock.`);
            }

            // Insight keterlambatan
            if (overdueItems.length > 0) {
                insights.push(`${overdueItems.length} barang mengalami keterlambatan pengembalian.`);
            } else {
                insights.push('Tidak ada keterlambatan pengembalian.');
            }

            // Insight pending approval
            if (pendingApproval[0].total > 0) {
                insights.push(`Pending approval sebanyak ${pendingApproval[0].total} transaksi.`);
            }

            // Insight status gudang
            insights.push(`Gudang dalam kondisi ${healthStatus}.`);

            return {
                // Analisis 1: KPI
                kpi: {
                    totalBarang: totalBarang[0].total,
                    barangAktif: barangAktif[0].total,
                    barangDipinjam: barangDipinjam[0].total,
                    barangTersedia: barangTersedia[0].total,
                    barangTerlambat: barangTerlambat[0].total,
                    pendingApproval: pendingApproval[0].total
                },
                // Analisis 2: Health Score
                healthScore: {
                    score: score,
                    status: healthStatus,
                    badge: healthBadge
                },
                // Analisis 3: Monthly Data
                monthly: monthlyData,
                // Analisis 4: Status Data
                status: statusData,
                // Analisis 5: Kategori Data
                kategori: kategoriData,
                // Analisis 6: Top Barang
                topBarang: topBarang,
                // Analisis 7: Unused Barang
                unusedBarang: unusedBarang,
                // Analisis 8: Low Stock
                lowStock: lowStock,
                // Analisis 9: Recent Activity
                recentActivity: recentActivity,
                // Analisis 10: Top User
                topUser: topUser.length > 0 ? topUser[0] : null,
                // Analisis 11: Longest Borrowed
                longestBorrowed: longestBorrowed,
                // Analisis 12: Overdue Items
                overdueItems: overdueItems,
                // Analisis 13: Insights
                insights: insights
            };
        } catch (error) {
            console.error('Error getting warehouse analysis:', error);
            throw error;
        }
    }
};

module.exports = warehouseAnalysisService;

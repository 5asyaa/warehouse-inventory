const pool = require('../config/database');

class Peminjaman {
    static async generateKodePeminjaman() {
        const [rows] = await pool.query('SELECT MAX(id) as max_id FROM peminjaman');
        const maxId = rows[0].max_id || 0;
        const nextId = maxId + 1;
        const kodePeminjaman = 'PMJ' + String(nextId).padStart(5, '0');
        return kodePeminjaman;
    }

    static async getAvailableBarang() {
        const [rows] = await pool.query(`
            SELECT b.id, b.kode_barang, b.nama_barang, b.stok, k.nama_kategori
            FROM barang b
            LEFT JOIN kategori k ON b.kategori_id = k.id
            WHERE b.status = 'Aktif' AND b.stok > 0
            ORDER BY b.nama_barang ASC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT p.*, b.nama_barang, b.kode_barang, k.nama_kategori, u.nama_lengkap as nama_user
            FROM peminjaman p
            LEFT JOIN barang b ON p.barang_id = b.id
            LEFT JOIN kategori k ON b.kategori_id = k.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async getByUserId(userId) {
        const [rows] = await pool.query(`
            SELECT p.*, b.nama_barang, b.kode_barang, k.nama_kategori
            FROM peminjaman p
            LEFT JOIN barang b ON p.barang_id = b.id
            LEFT JOIN kategori k ON b.kategori_id = k.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);
        return rows;
    }

    static async create(data) {
        const { kode_peminjaman, user_id, barang_id, jumlah, tanggal_pengajuan, tanggal_pinjam, tanggal_jatuh_tempo, alasan } = data;
        const [result] = await pool.query(
            `INSERT INTO peminjaman (kode_peminjaman, user_id, barang_id, jumlah, tanggal_pengajuan, tanggal_pinjam, tanggal_jatuh_tempo, alasan, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')`,
            [kode_peminjaman, user_id, barang_id, jumlah, tanggal_pengajuan, tanggal_pinjam, tanggal_jatuh_tempo, alasan]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.query(`
            SELECT p.*, b.nama_barang, b.kode_barang, k.nama_kategori, u.nama_lengkap as nama_user
            FROM peminjaman p
            LEFT JOIN barang b ON p.barang_id = b.id
            LEFT JOIN kategori k ON b.kategori_id = k.id
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    static async approve(id, adminId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get peminjaman details
            const [peminjaman] = await connection.query(
                'SELECT * FROM peminjaman WHERE id = ?',
                [id]
            );

            if (!peminjaman[0]) {
                throw new Error('Peminjaman not found');
            }

            // Check current status
            if (peminjaman[0].status !== 'Menunggu') {
                throw new Error('Peminjaman already processed');
            }

            // Update peminjaman status
            await connection.query(
                'UPDATE peminjaman SET status = ?, approved_by = ? WHERE id = ?',
                ['Disetujui', adminId, id]
            );

            // Reduce barang stock
            await connection.query(
                'UPDATE barang SET stok = stok - ? WHERE id = ?',
                [peminjaman[0].jumlah, peminjaman[0].barang_id]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async reject(id, alasanPenolakan) {
        const [result] = await pool.query(
            'UPDATE peminjaman SET status = ?, alasan_penolakan = ? WHERE id = ?',
            ['Ditolak', alasanPenolakan, id]
        );
        return result.affectedRows > 0;
    }

    static async return(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get peminjaman details
            const [peminjaman] = await connection.query(
                'SELECT * FROM peminjaman WHERE id = ?',
                [id]
            );

            if (!peminjaman[0]) {
                throw new Error('Peminjaman not found');
            }

            // Check current status
            if (peminjaman[0].status !== 'Disetujui' && peminjaman[0].status !== 'Dipinjam') {
                throw new Error('Peminjaman cannot be returned');
            }

            // Get today's date
            const today = new Date().toISOString().split('T')[0];

            // Update peminjaman status and return date
            await connection.query(
                'UPDATE peminjaman SET status = ?, tanggal_kembali = ? WHERE id = ?',
                ['Dikembalikan', today, id]
            );

            // Restore barang stock
            await connection.query(
                'UPDATE barang SET stok = stok + ? WHERE id = ?',
                [peminjaman[0].jumlah, peminjaman[0].barang_id]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getStats() {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Menunggu' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Disetujui' OR status = 'Dipinjam' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Dikembalikan' THEN 1 ELSE 0 END) as returned,
                SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) as rejected
            FROM peminjaman
        `);
        return rows[0];
    }

    static async getOverdue() {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as count
            FROM peminjaman
            WHERE status IN ('Disetujui', 'Dipinjam')
            AND tanggal_jatuh_tempo < CURDATE()
        `);
        return rows[0].count;
    }
}

module.exports = Peminjaman;

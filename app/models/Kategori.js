const pool = require('../config/database');

class Kategori {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM kategori WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nama_kategori, deskripsi } = data;
        const [result] = await pool.query(
            'INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)',
            [nama_kategori, deskripsi]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nama_kategori, deskripsi } = data;
        const [result] = await pool.query(
            'UPDATE kategori SET nama_kategori = ?, deskripsi = ? WHERE id = ?',
            [nama_kategori, deskripsi, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM kategori WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async checkUsage(id) {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM barang WHERE kategori_id = ?', [id]);
        return rows[0].count;
    }

    static async checkDuplicate(nama_kategori, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM kategori WHERE nama_kategori = ?';
        const params = [nama_kategori];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count;
    }
}

module.exports = Kategori;

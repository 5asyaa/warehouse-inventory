const pool = require('../config/database');

class Lokasi {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM lokasi ORDER BY nama_lokasi ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM lokasi WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nama_lokasi, deskripsi } = data;
        const [result] = await pool.query(
            'INSERT INTO lokasi (nama_lokasi, deskripsi) VALUES (?, ?)',
            [nama_lokasi, deskripsi]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nama_lokasi, deskripsi } = data;
        const [result] = await pool.query(
            'UPDATE lokasi SET nama_lokasi = ?, deskripsi = ? WHERE id = ?',
            [nama_lokasi, deskripsi, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM lokasi WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async checkUsage(id) {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM barang WHERE lokasi_id = ?', [id]);
        return rows[0].count;
    }

    static async checkDuplicate(nama_lokasi, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM lokasi WHERE nama_lokasi = ?';
        const params = [nama_lokasi];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count;
    }
}

module.exports = Lokasi;

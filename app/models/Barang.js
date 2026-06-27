const pool = require('../config/database');

class Barang {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT b.*, k.nama_kategori, l.nama_lokasi 
            FROM barang b 
            LEFT JOIN kategori k ON b.kategori_id = k.id 
            LEFT JOIN lokasi l ON b.lokasi_id = l.id 
            ORDER BY b.id DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT b.*, k.nama_kategori, l.nama_lokasi 
            FROM barang b 
            LEFT JOIN kategori k ON b.kategori_id = k.id 
            LEFT JOIN lokasi l ON b.lokasi_id = l.id 
            WHERE b.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { kode_barang, nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, foto, status } = data;
        const [result] = await pool.query(
            `INSERT INTO barang (kode_barang, nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, foto, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [kode_barang, nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, foto, status]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, foto, status } = data;
        const [result] = await pool.query(
            `UPDATE barang SET nama_barang = ?, deskripsi = ?, kategori_id = ?, lokasi_id = ?, 
             stok = ?, stok_minimum = ?, kondisi = ?, foto = ?, status = ? WHERE id = ?`,
            [nama_barang, deskripsi, kategori_id, lokasi_id, stok, stok_minimum, kondisi, foto, status, id]
        );
        return result.affectedRows;
    }

    static async softDelete(id) {
        const [result] = await pool.query('UPDATE barang SET status = ? WHERE id = ?', ['Nonaktif', id]);
        return result.affectedRows;
    }

    static async activate(id) {
        const [result] = await pool.query('UPDATE barang SET status = ? WHERE id = ?', ['Aktif', id]);
        return result.affectedRows;
    }

    static async generateKodeBarang() {
        const [rows] = await pool.query('SELECT MAX(id) as max_id FROM barang');
        const maxId = rows[0].max_id || 0;
        const nextId = maxId + 1;
        const kodeBarang = 'BRG' + String(nextId).padStart(4, '0');
        return kodeBarang;
    }

    static async getKategoriList() {
        const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
        return rows;
    }

    static async getLokasiList() {
        const [rows] = await pool.query('SELECT * FROM lokasi ORDER BY nama_lokasi ASC');
        return rows;
    }
}

module.exports = Barang;

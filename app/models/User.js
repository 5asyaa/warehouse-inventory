const pool = require('../config/database');

class User {
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, password, nama_lengkap, email, role, status, created_at FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        const [rows] = await pool.query('SELECT id, username, nama_lengkap, email, role, status, created_at FROM users ORDER BY id DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT id, username, nama_lengkap, email, role, status, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { username, password, nama_lengkap, email, role, status } = data;
        const [result] = await pool.query(
            'INSERT INTO users (username, password, nama_lengkap, email, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, nama_lengkap, email, role, status]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { username, password, nama_lengkap, email, role, status } = data;
        let query, params;
        
        if (password) {
            query = 'UPDATE users SET username = ?, password = ?, nama_lengkap = ?, email = ?, role = ?, status = ? WHERE id = ?';
            params = [username, password, nama_lengkap, email, role, status, id];
        } else {
            query = 'UPDATE users SET username = ?, nama_lengkap = ?, email = ?, role = ?, status = ? WHERE id = ?';
            params = [username, nama_lengkap, email, role, status, id];
        }
        
        const [result] = await pool.query(query, params);
        return result.affectedRows;
    }

    static async softDelete(id) {
        const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', ['Nonaktif', id]);
        return result.affectedRows;
    }

    static async activate(id) {
        const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', ['Aktif', id]);
        return result.affectedRows;
    }

    static async deactivate(id) {
        const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', ['Nonaktif', id]);
        return result.affectedRows;
    }

    static async checkDuplicateUsername(username, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
        const params = [username];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count;
    }

    static async checkDuplicateEmail(email, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        const params = [email];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count;
    }

    static async checkPeminjamanRelations(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM peminjaman WHERE user_id = ? OR approved_by = ?',
            [userId, userId]
        );
        return rows[0].count;
    }

    static async hardDelete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getActiveAdminCount() {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role = ? AND status = ?',
            ['Admin', 'Aktif']
        );
        return rows[0].count;
    }

    static async updateProfile(id, data) {
        const { nama_lengkap, email } = data;
        const [result] = await pool.query(
            'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
            [nama_lengkap, email, id]
        );
        return result.affectedRows;
    }

    static async updatePassword(id, password) {
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [password, id]
        );
        return result.affectedRows;
    }
}

module.exports = User;

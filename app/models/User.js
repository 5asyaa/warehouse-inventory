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
                'SELECT id, username, nama_lengkap, email, role, status FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;

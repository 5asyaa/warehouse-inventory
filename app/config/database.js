const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.MYSQL_URL || process.env.DATABASE_URL);
} else {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;

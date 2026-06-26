const session = require('express-session');
require('dotenv').config();

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'warehouse-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
};

module.exports = sessionConfig;

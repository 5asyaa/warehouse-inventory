const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi token JWT dari header Authorization.
 * Format header: Authorization: Bearer <token>
 */
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak disediakan.'
        });
    }

    // Split "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Format token tidak valid (harus Bearer <token>).'
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user terdekripsi ke request
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau telah kedaluwarsa.'
        });
    }
};

module.exports = verifyJWT;

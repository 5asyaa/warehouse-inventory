const jwt = require('jsonwebtoken');

// Auth Middleware
const authMiddleware = (req, res, next) => {
    // 1. Check Bearer token first
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            // Populate req.session properties for compatibility with other middlewares / controllers
            if (!req.session) {
                req.session = {};
            }
            req.session.userId = decoded.id;
            req.session.role = decoded.role;
            req.session.username = decoded.username;
            return next();
        } catch (error) {
            console.error('JWT Verification Error in authMiddleware:', error.message);
            const wantsJson = (req.xhr || 
                               (req.headers.accept && req.headers.accept.includes('json')) ||
                               req.path.startsWith('/api/') ||
                               (req.headers['content-type'] && req.headers['content-type'].includes('json')));
            if (wantsJson) {
                return res.status(403).json({
                    success: false,
                    message: 'Token tidak valid atau telah kedaluwarsa.'
                });
            }
            return res.redirect('/auth/login');
        }
    }

    // 2. Check Session
    if (req.session && req.session.userId) {
        return next();
    }

    // 3. Fallback
    const wantsJson = (req.xhr || 
                       (req.headers.accept && req.headers.accept.includes('json')) ||
                       req.path.startsWith('/api/') ||
                       (req.headers['content-type'] && req.headers['content-type'].includes('json')));
    if (wantsJson) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Silakan login terlebih dahulu.'
        });
    }
    res.redirect('/auth/login');
};

module.exports = authMiddleware;

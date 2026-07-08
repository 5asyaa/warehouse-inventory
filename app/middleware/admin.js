// Admin Middleware
const adminMiddleware = (req, res, next) => {
    console.log('===== ADMIN MIDDLEWARE =====');
    console.log(req.session);

    if (req.session && req.session.userId && req.session.role === 'Admin') {
        return next();
    }

    console.log('Admin middleware gagal!');
    
    const wantsJson = (req.xhr || 
                       (req.headers.accept && req.headers.accept.includes('json')) ||
                       req.headers['authorization'] ||
                       req.path.startsWith('/api/') ||
                       (req.headers['content-type'] && req.headers['content-type'].includes('json')));
    if (wantsJson) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda bukan Admin.'
        });
    }
    
    res.redirect('/auth/login');
};

module.exports = adminMiddleware;
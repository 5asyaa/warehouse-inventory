// User Middleware
const userMiddleware = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'User') {
        return next();
    }
    
    const wantsJson = (
        req.xhr || 
        req.headers['authorization'] ||
        (req.headers.accept && req.headers.accept.includes('json')) ||
        (req.headers['content-type'] && req.headers['content-type'].includes('json')) ||
        req.path.startsWith('/api/') ||
        ['PUT', 'DELETE', 'PATCH'].includes(req.method)
    );
    if (wantsJson) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda bukan User.'
        });
    }
    
    res.redirect('/auth/login');
};

module.exports = userMiddleware;

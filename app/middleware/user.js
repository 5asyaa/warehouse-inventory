// User Middleware
const userMiddleware = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'User') {
        return next();
    }
    
    const wantsJson = (req.xhr || 
                       (req.headers.accept && req.headers.accept.includes('json')) ||
                       req.headers['authorization'] ||
                       req.path.startsWith('/api/') ||
                       (req.headers['content-type'] && req.headers['content-type'].includes('json')));
    if (wantsJson) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda bukan User.'
        });
    }
    
    res.redirect('/auth/login');
};

module.exports = userMiddleware;

// Admin Middleware
const adminMiddleware = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'Admin') {
        return next();
    }
    res.redirect('/login');
};

module.exports = adminMiddleware;

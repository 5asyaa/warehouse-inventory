// Auth Middleware
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
};

module.exports = authMiddleware;

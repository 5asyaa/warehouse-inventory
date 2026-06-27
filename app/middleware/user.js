// User Middleware
const userMiddleware = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'User') {
        return next();
    }
    res.redirect('/login');
};

module.exports = userMiddleware;

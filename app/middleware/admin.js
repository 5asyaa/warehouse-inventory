// Admin Middleware
const adminMiddleware = (req, res, next) => {
    console.log('===== ADMIN MIDDLEWARE =====');
    console.log(req.session);

    if (req.session && req.session.userId && req.session.role === 'Admin') {
        return next();
    }

    console.log('Admin middleware gagal!');
    res.redirect('/login');
};

module.exports = adminMiddleware;
// Dashboard Controller
const dashboardController = {
    // Admin Dashboard
    admin: (req, res) => {
        res.render('dashboard/admin', {
            title: 'Dashboard Admin - Warehouse',
            user: req.session,
            activeMenu: 'dashboard',
            layout: 'layouts/admin'
        });
    },

    // User Dashboard
    user: (req, res) => {
        res.render('dashboard/user', {
            title: 'Dashboard User - Warehouse',
            user: req.session,
            activeMenu: 'dashboard',
            layout: 'layouts/user'
        });
    }
};

module.exports = dashboardController;

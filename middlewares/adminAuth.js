const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

// Middleware to check if admin is authenticated
async function isAdminAuthenticated(req, res, next) {
    try {
        const token = req.cookies?.adminToken || req.session?.adminToken;

        if (!token) {
            return res.redirect('/admin/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            res.clearCookie('adminToken');
            return res.redirect('/admin/login');
        }

        req.admin = admin;
        res.locals.admin = admin;
        next();
    } catch (error) {
        res.clearCookie('adminToken');
        return res.redirect('/admin/login');
    }
}

// Middleware to check if already logged in
async function isAdminLoggedIn(req, res, next) {
    try {
        const token = req.cookies?.adminToken || req.session?.adminToken;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
            const admin = await Admin.findById(decoded.id);

            if (admin) {
                return res.redirect('/admin/dashboard');
            }
        }
        next();
    } catch (error) {
        next();
    }
}

// Generate admin JWT token
function generateAdminToken(adminId) {
    return jwt.sign(
        { id: adminId },
        process.env.JWT_SECRET || 'admin-secret-key',
        { expiresIn: '24h' }
    );
}

module.exports = {
    isAdminAuthenticated,
    isAdminLoggedIn,
    generateAdminToken
};

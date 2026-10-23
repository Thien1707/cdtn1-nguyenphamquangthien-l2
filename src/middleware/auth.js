const jwt = require('jsonwebtoken');
const { tokenSecret } = require('../config/security');

function authenticate(req, res, next) {
    const [scheme, token] = (req.get('authorization') || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ status: 'fail', message: 'Cần đăng nhập để tiếp tục.' });
    }
    try {
        req.user = jwt.verify(token, tokenSecret, { issuer: 'mekong-mobile-api' });
        next();
    } catch {
        res.status(401).json({ status: 'fail', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
}

function allowRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền thực hiện thao tác này.' });
        }
        next();
    };
}

module.exports = { authenticate, allowRoles };
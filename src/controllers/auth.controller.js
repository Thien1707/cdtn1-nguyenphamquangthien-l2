const authService = require('../services/auth.service');

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.username, req.body.password);
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ status: 'fail', message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = await authService.createUser(req.body);
        res.status(201).json({ status: 'success', data: user });
    } catch (error) {
        res.status(error.code === '23505' ? 409 : (error.statusCode || 500)).json({
            status: 'fail',
            message: error.code === '23505' ? 'Tên đăng nhập đã tồn tại.' : error.message
        });
    }
};

exports.currentUser = (req, res) => {
    res.json({ status: 'success', data: req.user });
};
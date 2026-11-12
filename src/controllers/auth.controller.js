const authService = require('../services/auth.service');
const sendError = require('./error-response');

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.username, req.body.password);
        res.json({ status: 'success', data: result });
    } catch (error) {
        sendError(res, error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = await authService.createUser(req.body);
        res.status(201).json({ status: 'success', data: user });
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, error, 409, 'Tên đăng nhập đã tồn tại.');
        }
        sendError(res, error);
    }
};

exports.currentUser = (req, res) => {
    res.json({ status: 'success', data: req.user });
};
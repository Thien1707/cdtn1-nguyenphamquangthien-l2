const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ticketRepository = require('../repositories/ticket.repository');
const { tokenSecret } = require('../config/security');

class AuthService {
    async login(username, password) {
        if (typeof username !== 'string' || typeof password !== 'string') {
            const error = new Error('Tên đăng nhập và mật khẩu là bắt buộc');
            error.statusCode = 400;
            throw error;
        }
        const user = await ticketRepository.findUserByUsername(username.trim());
        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            const error = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            error.statusCode = 401;
            throw error;
        }
        const claims = {
            sub: String(user.user_id),
            username: user.username,
            role: user.role,
            technician_id: user.technician_id || null
        };
        return {
            token: jwt.sign(claims, tokenSecret, { expiresIn: '8h', issuer: 'mekong-mobile-api' }),
            user: claims
        };
    }

    async createUser(data) {
        const roles = ['FRONTDESK', 'MANAGER', 'TECHNICIAN'];
        if (typeof data.username !== 'string' || data.username.trim().length < 3) {
            const error = new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
            error.statusCode = 400;
            throw error;
        }
        if (typeof data.password !== 'string' || data.password.length < 10) {
            const error = new Error('Mật khẩu phải có ít nhất 10 ký tự');
            error.statusCode = 400;
            throw error;
        }
        if (!roles.includes(data.role)) {
            const error = new Error('Vai trò không hợp lệ');
            error.statusCode = 400;
            throw error;
        }
        if (data.role === 'TECHNICIAN' && !data.technician_id) {
            const error = new Error('Tài khoản kỹ thuật viên cần technician_id');
            error.statusCode = 400;
            throw error;
        }
        const password_hash = await bcrypt.hash(data.password, 12);
        return ticketRepository.createUser({
            username: data.username.trim(),
            password_hash,
            role: data.role,
            technician_id: data.role === 'TECHNICIAN' ? Number(data.technician_id) : null
        });
    }
}

module.exports = new AuthService();
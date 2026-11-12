function sendError(res, error, statusOverride, messageOverride) {
    const statusCode = statusOverride || error.statusCode || 500;
    const message = statusCode >= 500
        ? 'Đã xảy ra lỗi nội bộ.'
        : (messageOverride || error.message);
    const body = { status: 'fail', message };

    if (statusCode < 500) {
        if (error.phone) {
            body.phone = error.phone;
        }
        if (error.action) {
            body.next_action = error.action;
        }
    }

    return res.status(statusCode).json(body);
}

module.exports = sendError;

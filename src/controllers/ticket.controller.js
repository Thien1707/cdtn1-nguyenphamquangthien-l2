const ticketService = require('../services/ticket.service');

exports.getTickets = async (req, res) => {
    try {
        const data = await ticketService.getAllTickets();
        res.json({ status: 'success', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const newTicket = await ticketService.createTicket(req.body);
        res.status(201).json({ status: 'success', data: newTicket });
    } catch (error) {
        handleError(res, error);
    }
};

function handleError(res, error) {
    res.status(error.statusCode || 500).json({
        status: 'fail',
        message: error.message,
        ...(error.phone ? { phone: error.phone } : {}),
        ...(error.action ? { next_action: error.action } : {})
    });
}

exports.searchCustomer = async (req, res) => {
    try {
        const data = await ticketService.searchCustomer(req.query.phone);
        res.json({ status: 'success', data });
    } catch (error) {
        if (error.statusCode === 404 && error.phone) {
            error.action = 'CREATE_CUSTOMER';
        }
        handleError(res, error);
    }
};

exports.listCustomers = async (req, res) => {
    try {
        const data = await ticketService.listCustomers();
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getCustomer = async (req, res) => {
    try {
        const data = await ticketService.getCustomerById(req.params.customerId);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const data = await ticketService.updateCustomer(req.params.customerId, req.body);
        res.json({ status: 'success', data });
    } catch (error) {
        if (error.code === '23505') {
            error.statusCode = 409;
            error.message = 'DU_LIEU_KHONG_HOP_LE: Số điện thoại đã được đăng ký';
        }
        handleError(res, error);
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const data = await ticketService.deleteCustomer(req.params.customerId);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const data = await ticketService.createCustomer(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (error) {
        if (error.code === '23505') {
            error.statusCode = 409;
            error.message = 'Số điện thoại đã được đăng ký';
        }
        handleError(res, error);
    }
};

exports.getDevice = async (req, res) => {
    try {
        const data = await ticketService.getDeviceById(req.params.deviceId);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.listDevicesByCustomer = async (req, res) => {
    try {
        const data = await ticketService.listDevicesByCustomer(req.params.customerId);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createDevice = async (req, res) => {
    try {
        const data = await ticketService.createDevice(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (error) {
        if (error.code === '23505') {
            error.statusCode = 409;
            error.message = 'DU_LIEU_KHONG_HOP_LE: Số serial đã tồn tại';
        }
        handleError(res, error);
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const data = await ticketService.updateDevice(req.params.deviceId, req.body);
        res.json({ status: 'success', data });
    } catch (error) {
        if (error.code === '23505') {
            error.statusCode = 409;
            error.message = 'DU_LIEU_KHONG_HOP_LE: Số serial đã tồn tại';
        }
        handleError(res, error);
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const data = await ticketService.deleteDevice(req.params.deviceId);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.suggestCategory = (req, res) => {
    try {
        const data = ticketService.suggestCategory(req.body.issue_desc);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.assignTechnician = async (req, res) => {
    try {
        const data = await ticketService.assignTechnician(req.params.ticketId, req.body.technician_id);
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getEligibleTechnicians = async (req, res) => {
    try {
        const data = await ticketService.getEligibleTechnicians();
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getTicketsForTechnician = async (req, res) => {
    try {
        const technicianId = req.user.technician_id;
        if (String(req.params.technicianId) !== String(technicianId)) {
            return res.status(403).json({ status: 'fail', message: 'Bạn chỉ được xem phiếu của mình.' });
        }
        const data = await ticketService.getTicketsForTechnician(technicianId);
        const maskedData = data.map((ticket) => ({
            ...ticket,
            customer_phone: ticket.customer_phone?.replace(/^(\d{3})\d{4}(\d{3})$/, '$1****$2')
        }));
        res.json({ status: 'success', data: maskedData });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { ticket, log } = await ticketService.updateTicketStatus(
            req.params.ticketId,
            req.body.status,
            {
                reason: req.body.reason,
                changedBy: req.user.sub,
                technicianId: req.user.role === 'TECHNICIAN' ? req.user.technician_id : null
            }
        );
        res.json({ status: 'success', data: ticket, log });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getTicketStatusLogs = async (req, res) => {
    try {
        const data = await ticketService.getTicketStatusLogs(req.params.ticketId, {
            technicianId: req.user.role === 'TECHNICIAN' ? req.user.technician_id : null
        });
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getOverdueTicketsReport = async (req, res) => {
    try {
        const data = await ticketService.getOverdueTicketsByTechnician();
        res.json({ status: 'success', data });
    } catch (error) {
        handleError(res, error);
    }
};
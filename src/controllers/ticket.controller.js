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
        const newTicket = await
ticketService.createTicket(req.body);
        res.status(201).json({ status: 'success', data: newTicket
        });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
};
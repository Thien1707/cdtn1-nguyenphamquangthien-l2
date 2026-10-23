const express = require('express');
const router = express.Router();
const ticketController =
require('../controllers/ticket.controller');
const { authenticate, allowRoles } = require('../middleware/auth');

router.use(authenticate);
router.get('/tickets', allowRoles('FRONTDESK', 'MANAGER'), ticketController.getTickets);
router.post('/tickets', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createTicket);
router.get('/customers/search', allowRoles('FRONTDESK', 'MANAGER'), ticketController.searchCustomer);
router.post('/customers', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createCustomer);
router.post('/devices', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createDevice);
router.post('/tickets/suggest-category', allowRoles('FRONTDESK', 'MANAGER'), ticketController.suggestCategory);
router.post('/tickets/:ticketId/assign', allowRoles('MANAGER'), ticketController.assignTechnician);
router.get('/technicians/eligible', allowRoles('MANAGER'), ticketController.getEligibleTechnicians);
router.get('/technicians/:technicianId/tickets', allowRoles('TECHNICIAN'), ticketController.getTicketsForTechnician);
router.patch('/tickets/:ticketId/status', allowRoles('TECHNICIAN'), ticketController.updateTicketStatus);
router.get('/tickets/:ticketId/status-logs', allowRoles('MANAGER', 'TECHNICIAN'), ticketController.getTicketStatusLogs);
router.get('/reports/overdue-tickets', allowRoles('MANAGER'), ticketController.getOverdueTicketsReport);

module.exports = router;
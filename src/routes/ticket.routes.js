const express = require('express');
const router = express.Router();
const ticketController =
require('../controllers/ticket.controller');
const { authenticate, allowRoles } = require('../middleware/auth');

router.use(authenticate);
router.get('/tickets', allowRoles('FRONTDESK', 'MANAGER'), ticketController.getTickets);
router.post('/tickets', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createTicket);
router.get('/customers/search', allowRoles('FRONTDESK', 'MANAGER'), ticketController.searchCustomer);
router.get('/customers', allowRoles('FRONTDESK', 'MANAGER'), ticketController.listCustomers);
router.get('/customers/:customerId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.getCustomer);
router.post('/customers', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createCustomer);
router.patch('/customers/:customerId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.updateCustomer);
router.delete('/customers/:customerId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.deleteCustomer);
router.get('/customers/:customerId/devices', allowRoles('FRONTDESK', 'MANAGER'), ticketController.listDevicesByCustomer);
router.get('/devices/:deviceId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.getDevice);
router.post('/devices', allowRoles('FRONTDESK', 'MANAGER'), ticketController.createDevice);
router.patch('/devices/:deviceId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.updateDevice);
router.delete('/devices/:deviceId', allowRoles('FRONTDESK', 'MANAGER'), ticketController.deleteDevice);
router.post('/tickets/suggest-category', allowRoles('FRONTDESK', 'MANAGER'), ticketController.suggestCategory);
router.post('/tickets/:ticketId/assign', allowRoles('MANAGER'), ticketController.assignTechnician);
router.get('/technicians/eligible', allowRoles('MANAGER'), ticketController.getEligibleTechnicians);
router.get('/technicians/:technicianId/tickets', allowRoles('TECHNICIAN'), ticketController.getTicketsForTechnician);
router.patch('/tickets/:ticketId/status', allowRoles('TECHNICIAN'), ticketController.updateTicketStatus);
router.get('/tickets/:ticketId/status-logs', allowRoles('MANAGER', 'TECHNICIAN'), ticketController.getTicketStatusLogs);
router.get('/reports/overdue-tickets', allowRoles('MANAGER'), ticketController.getOverdueTicketsReport);

module.exports = router;
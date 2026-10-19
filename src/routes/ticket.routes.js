const express = require('express');
const router = express.Router();
const ticketController =
require('../controllers/ticket.controller');

router.get('/tickets', ticketController.getTickets);
router.post('/tickets', ticketController.createTicket);

module.exports = router;
const express = require('express');
const { getTickets, createTicket, cancelTicket, markAsUsed, downloadTicketPDF } = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ensure correct import

const router = express.Router();

router.get('/', authMiddleware, getTickets);
router.post('/', authMiddleware, createTicket);
router.delete('/:id', authMiddleware, cancelTicket);
router.put('/:id/used', authMiddleware, markAsUsed);
router.get('/:id/pdf', authMiddleware, downloadTicketPDF);

module.exports = router;

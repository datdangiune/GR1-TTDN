const Ticket = require('../models/Ticket');
const PDFDocument = require('pdfkit');

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createTicket = async (req, res) => {
  const { from, to, date, time } = req.body;
  try {
    const ticket = new Ticket({ userId: req.user.id, from, to, date, time });
    await ticket.save();

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.userId.toString() !== req.user.id)
      return res.status(404).json({ message: 'Ticket not found' });

    await ticket.remove();
    res.json({ message: 'Ticket canceled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markAsUsed = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.userId.toString() !== req.user.id)
      return res.status(404).json({ message: 'Ticket not found' });

    ticket.used = true;
    await ticket.save();
    res.json({ message: 'Ticket marked as used', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const downloadTicketPDF = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email');
    if (!ticket || ticket.userId._id.toString() !== req.user.id)
      return res.status(404).json({ message: 'Ticket not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${ticket._id}.pdf`);

    doc.text(`Ticket Details`, { align: 'center' });
    doc.text(`From: ${ticket.from}`);
    doc.text(`To: ${ticket.to}`);
    doc.text(`Date: ${ticket.date}`);
    doc.text(`Time: ${ticket.time}`);
    doc.text(`Status: ${ticket.status}`);
    doc.text(`Used: ${ticket.used ? 'Yes' : 'No'}`);
    doc.text(`Tags: ${ticket.tags.join(', ')}`);
    doc.text(`User: ${ticket.userId.name} (${ticket.userId.email})`);
    doc.end();

    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTickets, createTicket, cancelTicket, markAsUsed, downloadTicketPDF };

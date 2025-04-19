const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'pending' },
  used: { type: Boolean, default: false }, // Indicates if the ticket has been used
  tags: [{ type: String }], // Tags for categorizing tickets
});

module.exports = mongoose.model('Ticket', ticketSchema);

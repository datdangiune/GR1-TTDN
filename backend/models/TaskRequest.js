const mongoose = require('mongoose');

const taskRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputText: { type: String, required: true },
  status: { type: String, default: 'pending' },
  result: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // Task priority
  type: { type: String, enum: ['ticket', 'email', 'hotel', 'document'], required: true }, // Task type
  details: { type: mongoose.Schema.Types.Mixed }, // Parsed details from user input
});

module.exports = mongoose.model('TaskRequest', taskRequestSchema);

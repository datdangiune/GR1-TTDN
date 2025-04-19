const mongoose = require('mongoose');

const agentActionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  plan: { type: mongoose.Schema.Types.Mixed, required: true }, // Store the executed plan
  result: { type: mongoose.Schema.Types.Mixed }, // Store the result of the execution
  status: { type: String, enum: ['success', 'fail'], required: true }, // Execution status
});

module.exports = mongoose.model('AgentActionLog', agentActionLogSchema);

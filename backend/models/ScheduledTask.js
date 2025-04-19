const mongoose = require('mongoose');

const scheduledTaskSchema = new mongoose.Schema({
  plan: { type: mongoose.Schema.Types.Mixed, required: true }, // Store the plan object
  intervalMinutes: { type: Number, required: true }, // Interval in minutes
  nextRun: { type: Date, required: true }, // Next scheduled run time
});

module.exports = mongoose.model('ScheduledTask', scheduledTaskSchema);

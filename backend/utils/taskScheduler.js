const schedule = require('node-schedule');
const { executePlan } = require('./planExecutor');
const ScheduledTask = require('../models/ScheduledTask'); // Assume a model for storing scheduled tasks

const scheduleAgentTask = async (plan, intervalMinutes) => {
  if (!plan || !intervalMinutes) {
    throw new Error("Invalid plan or interval");
  }

  // Save the plan and interval to the database
  const scheduledTask = new ScheduledTask({
    plan,
    intervalMinutes,
    nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
  });
  await scheduledTask.save();

  // Schedule the task using node-schedule
  schedule.scheduleJob(`*/${intervalMinutes} * * * *`, async () => {
    console.log(`Executing scheduled task for plan: ${JSON.stringify(plan)}`);
    const results = await executePlan(plan);

    // Simulate sending results back to the user
    console.log(`Results for plan: ${JSON.stringify(results)}`);
  });

  console.log(`Task scheduled to run every ${intervalMinutes} minutes`);
};

module.exports = { scheduleAgentTask };

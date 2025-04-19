const express = require('express');
const { planFromUserRequest } = require('../utils/requestParser'); // Updated import
const { authMiddleware, agentPermissionMiddleware } = require('../middleware/authMiddleware');
const { executePlan } = require('../utils/planExecutor');
const { logAgentAction } = require('../utils/actionLogger');
const { scheduleAgentTask } = require('../utils/taskScheduler');
const { refinePlan } = require('../utils/planRefiner');
const { gptSuggestPlan } = require('../utils/gptPlanGenerator');
const AgentActionLog = require('../models/AgentActionLog');
const ScheduledTask = require('../models/ScheduledTask');

const router = express.Router();

router.post('/plan', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  try {
    const plan = await planFromUserRequest(userInput); // Updated function call
    res.json({ message: 'Plan generated successfully', plan });
  } catch (error) {
    console.error(`Error generating plan: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate plan', error: error.message });
  }
});

router.post('/execute', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ message: 'Plan is required' });
  }

  try {
    const results = await executePlan(plan);
    await logAgentAction(req.user.id, plan, results);
    res.json({ message: 'Plan executed successfully', results });
  } catch (error) {
    console.error(`Error executing plan: ${error.message}`);
    res.status(500).json({ message: 'Failed to execute plan', error: error.message });
  }
});

router.post('/schedule', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  const { plan, interval } = req.body;

  if (!plan || !interval) {
    return res.status(400).json({ message: 'Plan and interval are required' });
  }

  try {
    await scheduleAgentTask(plan, interval);
    res.json({ message: 'Task scheduled successfully' });
  } catch (error) {
    console.error(`Error scheduling task: ${error.message}`);
    res.status(500).json({ message: 'Failed to schedule task', error: error.message });
  }
});

router.post('/refine', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ message: 'Plan is required' });
  }

  try {
    const refinementResult = refinePlan(plan);
    res.json(refinementResult);
  } catch (error) {
    console.error(`Error refining plan: ${error.message}`);
    res.status(500).json({ message: 'Failed to refine plan', error: error.message });
  }
});

router.post('/suggest', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  try {
    const plan = await gptSuggestPlan(userInput);
    res.json({ message: 'Plan generated successfully', plan });
  } catch (error) {
    console.error(`Error suggesting plan: ${error.message}`);
    res.status(500).json({ message: 'Failed to suggest plan', error: error.message });
  }
});

// Get agent execution logs
router.get('/logs', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  try {
    const logs = await AgentActionLog.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
    res.json({ message: 'Agent logs retrieved successfully', logs });
  } catch (error) {
    console.error(`Error fetching agent logs: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch agent logs', error: error.message });
  }
});

// Get active scheduled agents
router.get('/active', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  try {
    const activeTasks = await ScheduledTask.find({}).sort({ nextRun: 1 });
    res.json({ message: 'Active scheduled agents retrieved successfully', activeTasks });
  } catch (error) {
    console.error(`Error fetching active agents: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch active agents', error: error.message });
  }
});

// Get recent agent errors
router.get('/errors', authMiddleware, agentPermissionMiddleware, async (req, res) => {
  try {
    const errorLogs = await AgentActionLog.find({ userId: req.user.id, status: 'fail' })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json({ message: 'Recent agent errors retrieved successfully', errorLogs });
  } catch (error) {
    console.error(`Error fetching agent errors: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch agent errors', error: error.message });
  }
});

module.exports = router;

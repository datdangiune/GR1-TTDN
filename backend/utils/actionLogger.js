const AgentActionLog = require('../models/AgentActionLog');

const logAgentAction = async (userId, plan, result) => {
  try {
    const status = result && result.length > 0 ? 'success' : 'fail';

    const log = new AgentActionLog({
      userId,
      plan,
      result,
      status,
    });

    await log.save();
    console.log(`Agent action logged successfully for userId: ${userId}`);
  } catch (error) {
    console.error(`Failed to log agent action: ${error.message}`);
  }
};

module.exports = { logAgentAction };

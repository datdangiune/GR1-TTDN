const simulatePlan = (plan) => {
  if (!plan || !plan.steps || !Array.isArray(plan.steps)) {
    console.error("Invalid plan format");
    return;
  }

  console.log("Simulating plan execution...");
  console.log(`Task Type: ${plan.taskType}`);
  console.log(`Goal: ${plan.goal}`);
  console.log(`Extracted Parameters: ${JSON.stringify(plan.extractedParams)}`);

  plan.steps.forEach((step, index) => {
    console.log(`Step ${index + 1}:`);
    console.log(`  Action: ${step.action}`);
    if (step.target) {
      console.log(`  Target: ${step.target}`);
    }
    if (step.fields) {
      console.log(`  Fields: ${JSON.stringify(step.fields)}`);
    }
    if (step.fields && step.fields.from) {
      console.log(`    From: ${step.fields.from}`);
    }
    if (step.fields && step.fields.to) {
      console.log(`    To: ${step.fields.to}`);
    }
    if (step.fields && step.fields.date) {
      console.log(`    Date: ${step.fields.date}`);
    }
  });

  console.log("Simulation complete.");
};

module.exports = { simulatePlan };

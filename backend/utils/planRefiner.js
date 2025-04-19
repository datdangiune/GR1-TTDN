const refinePlan = (plan) => {
  if (!plan || !plan.extractedParams) {
    throw new Error("Invalid plan format");
  }

  const missingFields = [];
  const { from, to, date } = plan.extractedParams;

  // Check for missing fields
  if (!from) missingFields.push("from");
  if (!to) missingFields.push("to");
  if (!date) missingFields.push("date");

  if (missingFields.length > 0) {
    return {
      status: "incomplete",
      message: `Missing information: ${missingFields.join(", ")}. Please provide these details.`,
      missingFields,
    };
  }

  // If all fields are present, return the refined plan
  return {
    status: "complete",
    message: "Plan is complete and ready to execute.",
    refinedPlan: plan,
  };
};

module.exports = { refinePlan };

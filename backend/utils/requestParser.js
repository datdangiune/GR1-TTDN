const { detectLanguage, translateToEnglish } = require('./languageUtils');
const { analyzeUserInput } = require('./customLLM'); // Use custom LLM

// Fallback regex extraction
function extractWithRegex(input) {
  const result = { from: null, to: null, date: null };

  // Regular expressions to extract data
  const fromMatch = input.match(/(?:from|từ)\s+([^\s\d]+(?:\s[^\s\d]+)*)/i);
  const toMatch = input.match(/(?:to|đến)\s+([^\s\d]+(?:\s[^\s\d]+)*)/i);
  const dateMatch = input.match(/(?:on|ngày)\s+([\d]{1,2}[\/\-][\d]{1,2}(?:[\/\-]\d{2,4})?)/i);

  if (fromMatch) result.from = fromMatch[1].trim();
  if (toMatch) result.to = toMatch[1].trim();
  if (dateMatch) result.date = dateMatch[1].trim();

  return result;
}

// Build execution steps for agent
function buildSteps(plan) {
  const steps = [];

  if (plan.missingParams.length > 0) {
    steps.push({
      action: "request_missing_info",
      fields: plan.missingParams,
    });
  } else {
    steps.push(
      { action: "open_website", target: plan.suggestedWebsites[0] },
      {
        action: "fill_form",
        fields: {
          from: plan.extractedParams.from,
          to: plan.extractedParams.to,
          date: plan.extractedParams.date,
        },
      },
      { action: "submit_form" },
      {
        action: "extract_result",
        fields: ["route", "price", "time", "availability"],
      }
    );
  }

  return steps;
}

const planFromUserRequest = async (userInput) => {
  const plan = {
    taskType: "ticket_booking",
    rawInput: userInput,
    goal: "",
    extractedParams: {
      from: null,
      to: null,
      date: null,
    },
    missingParams: [],
    steps: [],
    suggestedWebsites: ["vexere.com", "baolau.com"],
  };

  try {
    // Detect language of user input
    const detectedLang = await detectLanguage(userInput);
    let translatedInput = userInput;

    // Translate if input is not in English
    if (detectedLang !== 'en') {
      translatedInput = await translateToEnglish(userInput, detectedLang);
    }

    console.log("Translated input:", translatedInput); // Log translated input

    // Use custom LLM to analyze the input
    const llmPlan = await analyzeUserInput(translatedInput);
    
    console.log("LLM response:", llmPlan); // Log LLM response

    if (!llmPlan || !llmPlan.extractedParams) {
      throw new Error("LLM returned no extracted parameters.");
    }

    const extracted = llmPlan.extractedParams || {};

    // Assign extracted values from LLM (if available)
    if (typeof extracted.from === "string") plan.extractedParams.from = extracted.from.trim();
    if (typeof extracted.to === "string") plan.extractedParams.to = extracted.to.trim();
    if (typeof extracted.date === "string") plan.extractedParams.date = extracted.date.trim();

    // Fallback to regex extraction if any parameters are missing
    const fallback = extractWithRegex(translatedInput);
    ["from", "to", "date"].forEach((key) => {
      if (!plan.extractedParams[key] && fallback[key]) {
        plan.extractedParams[key] = fallback[key];
      }
    });

    // Determine missing parameters
    ["from", "to", "date"].forEach((key) => {
      if (!plan.extractedParams[key]) {
        plan.missingParams.push(key);
      }
    });

    // Set final goal (summary of the ticket booking)
    plan.goal = `Book a ticket from ${plan.extractedParams.from || '...'} to ${plan.extractedParams.to || '...'} on ${plan.extractedParams.date || '...'}`;

    // Build the steps for the agent to execute
    plan.steps = buildSteps(plan);

    return plan;
  } catch (error) {
    console.error("Failed to analyze user input:", error.message);
    throw new Error("Failed to process request");
  }
};

module.exports = { planFromUserRequest };

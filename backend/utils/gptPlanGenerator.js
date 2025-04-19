const axios = require('axios');

const gptSuggestPlan = async (userInput) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY; // Ensure the API key is set in the environment variables
    const apiUrl = "https://api.openai.com/v1/completions";

    const response = await axios.post(
      apiUrl,
      {
        model: "text-davinci-003", // Replace with your preferred model
        prompt: `Generate a detailed plan for the following user input: "${userInput}". The plan should include:
        - taskType
        - rawInput
        - goal
        - extractedParams (e.g., from, to, date)
        - steps (e.g., open_website, fill_form, submit_form, extract_result)
        - suggestedWebsites`,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const plan = JSON.parse(response.data.choices[0].text.trim());
    return plan;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Invalid or missing OpenAI API key.");
    } else {
      console.error(`Error generating plan: ${error.message}`);
    }
    throw new Error("Failed to generate plan using GPT");
  }
};

module.exports = { gptSuggestPlan };

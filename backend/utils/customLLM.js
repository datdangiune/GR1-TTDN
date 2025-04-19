const axios = require('axios');

const analyzeUserInput = async (input) => {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Extract the following information from the user input in JSON format:
{
  "from": "Hanoi",
  "to": "Ho Chi Minh City",
  "date": "June 30"
}
If any information is missing, set the value to null.
User Input: "${input}"
Please return only the JSON object and nothing else.`
            }
          ]
        }
      ]
    };

    console.log("Sending payload to Gemini:", payload);

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    // Log full raw Gemini response for debugging
    console.log("Gemini raw response:", JSON.stringify(res.data, null, 2));

    const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!output) {
      throw new Error("Gemini returned no valid parts.");
    }

    // Clean ```json ... ``` if exists
    const cleaned = output.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonErr) {
      console.error("Failed to parse Gemini response as JSON:", jsonErr.message);
      console.error("Gemini response content:", cleaned);
      throw new Error("Failed to parse Gemini response.");
    }

    return {
      extractedParams: {
        from: parsed.from || null,
        to: parsed.to || null,
        date: parsed.date || null,
      },
    };
  } catch (err) {
    console.error("Gemini error:", err.message);

    if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      console.error("Connection to Gemini API timed out.");
    }

    throw new Error("Failed to extract info from Gemini: " + err.message);
  }
};

module.exports = { analyzeUserInput };

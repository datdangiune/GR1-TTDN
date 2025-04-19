const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const detectLanguage = async (text) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_API_KEY}`,
      { q: text }
    );
    return response.data.data.detections[0][0].language;
  } catch (error) {
    console.error(`Error detecting language: ${error.message}`);
    return null;
  }
};

const translateToEnglish = async (text, sourceLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: text,
        source: sourceLang,
        target: 'en',
      }
    );
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error(`Error translating text: ${error.message}`);
    return null;
  }
};

module.exports = { detectLanguage, translateToEnglish };

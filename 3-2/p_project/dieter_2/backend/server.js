require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// --- Security & Middleware ---
// Enable CORS for your frontend (restrict this in production!)
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your Vite dev server
// Increase payload limit to handle base64 images
app.use(express.json({ limit: '10mb' }));

// --- API Key Setup ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Please check your .env file.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-preview-09-2025' 
});

// --- API Endpoint ---
app.post('/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing imageBase64 or mimeType' });
    }

    // We can't pass a schema, so we must be very clear in the prompt.
    const prompt = "Analyze this food item and return ONLY a valid JSON object with foodName, calories, and a nutrients object (protein, fat, carbohydrates).";
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Log the raw response from Gemini to your terminal
    console.log('--- Raw text from Gemini ---');
    console.log(text);
    console.log('--- End raw text ---');

    let jsonData;
    let jsonText;
    let cleanedJsonText; // Define it here to be accessible in catch block

    try {
      // First, try to find a JSON markdown block
      const markdownMatch = text.match(/```json([\s\S]*)```/);
      
      if (markdownMatch && markdownMatch[1]) {
        // Found a markdown block, extract the JSON text
        console.log('Found markdown JSON block, parsing...');
        jsonText = markdownMatch[1];
      } else {
        // No markdown block, try to find a raw JSON object
        console.log('No markdown block found, looking for raw JSON object...');
        const rawJsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (rawJsonMatch && rawJsonMatch[0]) {
          console.log('Found raw JSON object, parsing...');
          jsonText = rawJsonMatch[0];
        } else {
          // No JSON found at all
          console.log('No JSON of any kind found in response.');
          throw new Error('Gemini API returned non-JSON response.');
        }
      }
      
      // --- START: Applied Fix ---
      // Log the text *before* parsing
      console.log('--- Attempting to parse the following text as JSON: ---');
      console.log(jsonText);
      console.log('--- End of text to parse ---');

      // Clean the JSON text to remove invalid characters.
      // This new regex strips *everything* that isn't a standard
      // printable ASCII character, a tab, a newline, or a carriage return.
      // This will correctly remove the \u00A0 (non-breaking space) characters.
      cleanedJsonText = jsonText.replace(/[^\x20-\x7E\t\r\n]/g, '');
      
      console.log('--- Attempting to parse CLEANED text: ---');
      console.log(cleanedJsonText);
      console.log('--- End of cleaned text ---');

      // Now, parse the *cleaned* text
      jsonData = JSON.parse(cleanedJsonText);
      // --- END: Applied Fix ---

    } catch (parseError) {
      console.error('Failed to parse JSON from response:', parseError);
      
      // --- START: Applied Fix (Error Logging) ---
      // Add this log to see the bad text if it fails
      console.error('The text that FAILED to parse was:', jsonText);
      // We check if cleanedJsonText is defined, as the error could happen before it's set.
      if (typeof cleanedJsonText !== 'undefined') {
        console.error('The CLEANED text that FAILED was:', cleanedJsonText);
      }
      // --- END: Applied Fix (Error Logging) ---

      // Send a more specific error to the frontend
      return res.status(500).json({ error: 'Gemini API returned malformed JSON.', details: text });
    }

    res.status(200).json(jsonData);

  } catch (error) {
    console.error('Error in /analyze-image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

app.listen(port, () => {
  console.log(`Dieter backend listening on http://localhost:${port}`);
});
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

    const systemPrompt = `You are an expert nutritionist... [etc. copy from React file]`;
    
    // Note: The Node.js SDK payload structure is different from the fetch API.
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    
    // We can't pass a schema, so we must be very clear in the prompt.
    // Or, better, use the REST API (fetch) just like in the React file.
    // For simplicity, let's use the Node.js SDK:
    const prompt = "Analyze this food item and return ONLY a valid JSON object with foodName, calories, and a nutrients object (protein, fat, carbohydrates).";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // The text *should* be JSON. Parse it.
    const jsonData = JSON.parse(text);

    res.status(200).json(jsonData);

  } catch (error) {
    console.error('Error in /analyze-image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

app.listen(port, () => {
  console.log(`Dieter backend listening on http://localhost:${port}`);
});

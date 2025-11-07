import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import 'dotenv/config';

// --- INITIALIZATION ---

// 1. Initialize Firebase Admin SDK
//    Make sure 'firebaseServiceAccountKey.json' is in your /backend folder
import serviceAccount from './firebaseServiceAccountKey.json' assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Initialize Express App
const app = express();
const port = process.env.PORT || 3001;

// 4. Configure Multer for file (image) uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing JSON request bodies

// --- CONSTANTS ---
const DAILY_RDA = {
  calories: 2000,
  proteinGrams: 50,
  fatGrams: 70,
  carbohydrateGrams: 260,
};

const NUTRITION_SCHEMA = {
  type: "OBJECT",
  properties: {
    foodName: { type: "STRING", description: "The common name for the food (e.g., 'Banana', 'Scrambled Eggs with Toast')." },
    servingSizeGrams: { type: "NUMBER", description: "The estimated weight of the food in grams." },
    nutrients: {
      type: "OBJECT",
      properties: {
        calories: { type: "NUMBER" },
        proteinGrams: { type: "NUMBER" },
        fatGrams: { type: "NUMBER" },
        carbohydrateGrams: { type: "NUMBER" }
      },
      required: ["calories", "proteinGrams", "fatGrams", "carbohydrateGrams"]
    }
  },
  required: ["foodName", "servingSizeGrams", "nutrients"]
};

// --- API ENDPOINTS ---

/**
 * [POST] /api/upload
 * Analyzes an uploaded image, gets nutritional data, and saves it to Firestore.
 */
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file || !req.body.userId) {
    return res.status(400).json({ error: 'Missing image or user ID.' });
  }

  const { userId } = req.body;
  
  try {
    // 1. Analyze Image with Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: NUTRITION_SCHEMA,
      }
    });

    const imagePart = {
      inlineData: {
        mimeType: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      },
    };

    const prompt = "Analyze the food in this image. Estimate its weight in grams and provide its nutritional information (calories, protein, fat, carbohydrates).";
    
    const result = await model.generateContent([prompt, imagePart]);
    const foodData = JSON.parse(result.response.text());

    if (!foodData || !foodData.nutrients) {
      throw new Error("AI could not parse nutritional data.");
    }

    // 2. Save to Firestore
    const foodLogEntry = {
      ...foodData,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Use server time
    };

    const docRef = await db.collection('users').doc(userId).collection('foodLogs').add(foodLogEntry);

    res.status(201).json({ 
      message: 'Food logged successfully', 
      id: docRef.id,
      data: foodLogEntry 
    });

  } catch (error) {
    console.error('Error in /api/upload:', error);
    res.status(500).json({ error: 'Failed to analyze or save image.' });
  }
});

/**
 * [GET] /api/recommendation
 * Gets a diet recommendation based on today's logged food.
 */
app.get('/api/recommendation', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID.' });
  }

  try {
    // 1. Get today's date at 00:00
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 2. Fetch today's food logs for the user
    const snapshot = await db.collection('users').doc(userId).collection('foodLogs')
      .where('timestamp', '>=', todayStart)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ recommendation: "Log some food first, and I'll give you a recommendation!" });
    }

    // 3. Calculate totals
    const totals = { calories: 0, proteinGrams: 0, fatGrams: 0, carbohydrateGrams: 0 };
    let foodList = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totals.calories += data.nutrients.calories || 0;
      totals.proteinGrams += data.nutrients.proteinGrams || 0;
      totals.fatGrams += data.nutrients.fatGrams || 0;
      totals.carbohydrateGrams += data.nutrients.carbohydrateGrams || 0;
      foodList.push(data.foodName);
    });

    // 4. Generate AI Prompt
    const prompt = `
      You are a helpful diet and nutrition assistant.
      My daily goals are: ${DAILY_RDA.calories} calories, ${DAILY_RDA.proteinGrams}g protein, ${DAILY_RDA.fatGrams}g fat, and ${DAILY_RDA.carbohydrateGrams}g carbs.
      
      So far today, I have eaten: ${foodList.join(', ')}.
      
      My total intake today is: ${totals.calories.toFixed(0)} calories, ${totals.proteinGrams.toFixed(1)}g protein, ${totals.fatGrams.toFixed(1)}g fat, and ${totals.carbohydrateGrams.toFixed(1)}g carbs.
      
      Please provide a simple, healthy, and actionable meal plan (e.g., for lunch, dinner, and snacks) for the rest of my day to help me meet my goals. Be encouraging and format your response with markdown.
    `;

    // 5. Call Gemini Text Model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const recommendation = result.response.text();

    res.status(200).json({ recommendation });

  } catch (error) {
    console.error('Error in /api/recommendation:', error);
    res.status(500).json({ error: 'Failed to get recommendation.' });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
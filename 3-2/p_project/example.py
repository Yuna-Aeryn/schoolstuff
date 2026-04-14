import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  where,
  setLogLevel
} from 'firebase/firestore';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertCircle, 
  User, 
  BrainCircuit, 
  PieChart, 
  BookOpenText,
  CheckCircle
} from 'lucide-react';

// --- Firebase Configuration ---
// This config is provided by the environment
let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
} catch (e) {
  console.error("Failed to parse Firebase config:", e);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Enable Firestore logging for debugging
setLogLevel('debug');

// --- Constants ---
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Standard 2000-calorie diet RDA for demonstration
const DAILY_RDA = {
  calories: 2000,
  proteinGrams: 50,
  fatGrams: 70,
  carbohydrateGrams: 260,
};

// --- API Helper for Gemini ---
const GEMINI_API_KEY = ""; // Leave as-is; Canvas will provide it
const GEMINI_MODEL_VISION = "gemini-2.5-flash-preview-09-2025";
const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";

// JSON Schema for structured response from image analysis
const NUTRITION_SCHEMA = {
  type: "OBJECT",
  properties: {
    foodName: { type: "STRING" },
    servingSizeGrams: { type: "NUMBER" },
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

// Function to call Gemini API with exponential backoff
async function callGeminiApi(url, payload, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Throttled, retry with backoff
        await new Promise(res => setTimeout(res, delay));
        return callGeminiApi(url, payload, retries - 1, delay * 2);
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      // Network or other error, retry with backoff
      await new Promise(res => setTimeout(res, delay));
      return callGeminiApi(url, payload, retries - 1, delay * 2);
    }
    console.error("API call failed after retries:", error);
    throw error;
  }
}

// --- Main App Component ---
export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [foodLog, setFoodLog] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailyRecommendation, setDailyRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  // Effect for Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // No user, try to sign in
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (authError) {
          console.error("Authentication Error:", authError);
          setError("Failed to authenticate. Please refresh.");
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Effect for fetching data from Firestore
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    // Get today's start timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const foodLogCollection = collection(db, `artifacts/${APP_ID}/users/${userId}/foodLog`);
    
    // Query for food items logged today
    const q = query(
      foodLogCollection, 
      where("timestamp", ">=", todayStart)
      // Note: We cannot use orderBy('timestamp') without a composite index.
      // We will sort client-side.
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(log => log.timestamp); // Ensure timestamp exists
      
      // Sort by timestamp client-side
      logs.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
      
      setFoodLog(logs);
    }, (err) => {
      console.error("Firestore Snapshot Error:", err);
      setError("Could not load food log. Check console for details.");
    });

    return () => unsubscribe();
  }, [isAuthReady, userId]);

  // --- Core Functions ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // 1. Analyze Image with Gemini Vision
  const analyzeImage = async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }
    if (!userId) {
      setError("User not authenticated. Please wait.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDailyRecommendation(null); // Clear old recommendation

    try {
      // Convert image to base64 (without data:image/... prefix)
      const base64ImageData = imagePreview.split(',')[1];

      const systemPrompt = "You are a nutritional expert. Your task is to identify the food in the user's image and provide its nutritional information for a standard 100g serving. Respond ONLY with the JSON format requested.";
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Analyze this image and provide nutritional data for a 100g serving." },
              {
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64ImageData
                }
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: NUTRITION_SCHEMA,
        }
      };
      
      const apiUrl = `https://generativelinlanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_VISION}:generateContent?key=${GEMINI_API_KEY}`;
      const result = await callGeminiApi(apiUrl, payload);
      
      const part = result.candidates?.[0]?.content?.parts?.[0];
      if (!part || !part.text) {
        throw new Error("Invalid response structure from AI.");
      }
      
      const foodData = JSON.parse(part.text);
      await saveFoodToFirestore(foodData);
      
      // Clear image after successful upload
      setImageFile(null);
      setImagePreview(null);

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(`Analysis Failed: ${err.message}. Please try a clearer image.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Save Analysis to Firestore
  const saveFoodToFirestore = async (foodData) => {
    if (!userId) return;
    
    const foodLogCollection = collection(db, `artifacts/${APP_ID}/users/${userId}/foodLog`);
    try {
      await addDoc(foodLogCollection, {
        ...foodData,
        timestamp: serverTimestamp() // Use server time
      });
    } catch (err) {
      console.error("Firestore Save Error:", err);
      setError("Failed to save food log. Please try again.");
    }
  };

  // 3. Get Daily Recommendation
  const getDailyRecommendation = async () => {
    if (foodLog.length === 0) {
      setError("Please log at least one food item today to get a recommendation.");
      return;
    }

    setLoadingRecommendation(true);
    setError(null);

    try {
      const { totals } = calculateDailyTotals();
      const foodList = foodLog.map(item => `${item.foodName} (${item.nutrients.calories} kcal)`).join(', ');

      const systemPrompt = "You are a helpful diet and nutrition assistant. Based on the user's daily goals and what they've already eaten, provide a simple, healthy, and actionable meal plan (e.g., for lunch and dinner) to help them meet their goals without exceeding them. Be encouraging, clear, and format your response with markdown.";
      
      const userPrompt = `
        My daily goals are: ${DAILY_RDA.calories} calories, ${DAILY_RDA.proteinGrams}g protein, ${DAILY_RDA.fatGrams}g fat, and ${DAILY_RDA.carbohydrateGrams}g carbs.
        
        So far today, I have eaten: ${foodList}.
        
        My total intake today is: ${totals.calories.toFixed(0)} calories, ${totals.proteinGrams.toFixed(1)}g protein, ${totals.fatGrams.toFixed(1)}g fat, and ${totals.carbohydrateGrams.toFixed(1)}g carbs.
        
        Please suggest what I should eat for the rest of the day to best meet my goals.
      `;

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_TEXT}:generateContent?key=${GEMINI_API_KEY}`;
      const result = await callGeminiApi(apiUrl, payload);
      
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response from AI assistant.");
      }
      
      setDailyRecommendation(text);

    } catch (err) {
      console.error("Recommendation Error:", err);
      setError(`Failed to get recommendation: ${err.message}`);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // --- Calculations ---
  const calculateDailyTotals = useCallback(() => {
    const totals = {
      calories: 0,
      proteinGrams: 0,
      fatGrams: 0,
      carbohydrateGrams: 0,
    };

    foodLog.forEach(item => {
      totals.calories += item.nutrients.calories || 0;
      totals.proteinGrams += item.nutrients.proteinGrams || 0;
      totals.fatGrams += item.nutrients.fatGrams || 0;
      totals.carbohydrateGrams += item.nutrients.carbohydrateGrams || 0;
    });

    const percentages = {
      calories: (totals.calories / DAILY_RDA.calories) * 100,
      proteinGrams: (totals.proteinGrams / DAILY_RDA.proteinGrams) * 100,
      fatGrams: (totals.fatGrams / DAILY_RDA.fatGrams) * 100,
      carbohydrateGrams: (totals.carbohydrateGrams / DAILY_RDA.carbohydrateGrams) * 100,
    };

    return { totals, percentages };
  }, [foodLog]);

  const { totals, percentages } = useMemo(calculateDailyTotals, [calculateDailyTotals]);

  // --- Render ---
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="ml-4 text-lg font-semibold">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">AI Nutrition Tracker</h1>
          <p className="text-lg text-gray-600">Upload a photo of your food to log your meals and get smart diet recommendations.</p>
          {userId && (
            <div className="flex items-center p-2 mt-4 text-xs text-gray-500 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 mr-2" />
              <span className="font-mono break-all">User ID: {userId}</span>
            </div>
          )}
        </header>

        {error && (
          <div className="flex items-center p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* --- 1. Uploader --- */}
        <section className="p-6 mb-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <Camera className="w-6 h-6 mr-3 text-blue-600" />
            Step 1: Log Your Food
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Input */}
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Food preview" className="object-cover w-full h-full rounded-lg" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="mt-2 text-sm font-medium text-gray-600">Click to upload a photo</span>
                  <span className="mt-1 text-xs text-gray-500">PNG, JPG, or WEBP</span>
                </>
              )}
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
              />
            </label>
            
            {/* Upload Button */}
            <div className="flex flex-col justify-center">
              {imageFile && (
                <div className="flex items-center p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium truncate">{imageFile.name}</span>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Our AI will analyze your photo, identify the food, and log its nutritional information (for a standard 100g serving).
              </p>
              <button
                onClick={analyzeImage}
                disabled={!imageFile || isLoading}
                className="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5 mr-3" />
                )}
                {isLoading ? "Analyzing..." : "Analyze & Log Food"}
              </button>
            </div>
          </div>
        </section>

        {/* --- 2. Dashboard --- */}
        <section className="p-6 mb-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
            <PieChart className="w-6 h-6 mr-3 text-green-600" />
            Step 2: Your Daily Dashboard
          </h2>
          
          <p className="text-sm text-gray-600 mb-6 -mt-4">
            Totals update automatically based on your logs for today. RDA is based on a 2000-calorie diet.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Calories" value={totals.calories.toFixed(0)} percentage={percentages.calories} unit="kcal" rda={DAILY_RDA.calories} />
            <StatCard title="Protein" value={totals.proteinGrams.toFixed(1)} percentage={percentages.proteinGrams} unit="g" rda={DAILY_RDA.proteinGrams} />
            <StatCard title="Fat" value={totals.fatGrams.toFixed(1)} percentage={percentages.fatGrams} unit="g" rda={DAILY_RDA.fatGrams} />
            <StatCard title="Carbs" value={totals.carbohydrateGrams.toFixed(1)} percentage={percentages.carbohydrateGrams} unit="g" rda={DAILY_RDA.carbohydrateGrams} />
          </div>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">Today's Log</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {foodLog.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No food logged yet today.</p>
            ) : (
              foodLog.map(item => <FoodLogItem key={item.id} item={item} />)
            )}
          </div>
        </section>

        {/* --- 3. Recommendation --- */}
        <section className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <BookOpenText className="w-6 h-6 mr-3 text-purple-600" />
            Step 3: Get Your Daily Plan
          </h2>
          
          <button
            onClick={getDailyRecommendation}
            disabled={loadingRecommendation || foodLog.length === 0}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loadingRecommendation ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <BrainCircuit className="w-5 h-5 mr-3" />
            )}
            {loadingRecommendation ? "Generating Plan..." : "Recommend Rest of Day's Diet"}
          </button>
          
          {dailyRecommendation && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Your AI-Generated Diet Plan:</h4>
              <div 
                className="prose prose-sm prose-blue max-w-none" 
                dangerouslySetInnerHTML={{ __html: formatRecommendation(dailyRecommendation) }} 
              />
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}

// --- Sub-Components ---

// Card for displaying a single nutrient stat
function StatCard({ title, value, percentage, unit, rda }) {
  const clampedPercentage = Math.min(percentage, 100);
  const strokeColor = percentage > 100 ? 'stroke-red-500' : 'stroke-blue-600';
  const textColor = percentage > 100 ? 'text-red-600' : 'text-gray-900';
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="stroke-gray-200"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
          />
          <path
            className={`transition-all duration-500 ${strokeColor}`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            strokeDasharray={`${clampedPercentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className={`text-xl font-bold ${textColor}`}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <h4 className="text-sm font-semibold text-gray-600 mb-1">{title}</h4>
      <p className={`text-lg font-bold ${textColor}`}>{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
      <p className="text-xs text-gray-400">of {rda} {unit}</p>
    </div>
  );
}

// Card for a single food log item
function FoodLogItem({ item }) {
  const { foodName, nutrients, servingSizeGrams, timestamp } = item;
  
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{foodName}</h4>
          <p className="text-sm text-gray-500">{servingSizeGrams}g serving</p>
        </div>
        <span className="text-xs text-gray-400">
          {timestamp ? new Date(timestamp.toMillis()).toLocaleTimeString() : '...'}
        </span>
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
        <span className="text-blue-600 font-medium">{nutrients.calories.toFixed(0)} kcal</span>
        <span className="text-gray-600">P: {nutrients.proteinGrams.toFixed(1)}g</span>
        <span className="text-gray-600">F: {nutrients.fatGrams.toFixed(1)}g</span>
        <span className="text-gray-600">C: {nutrients.carbohydrateGrams.toFixed(1)}g</span>
      </div>
    </div>
  );
}

// Simple markdown-to-HTML formatter for the recommendation
// NOTE: This is a basic parser for security.
function formatRecommendation(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italics
    .replace(/^(#+)\s*(.*)/gm, (match, hashes, content) => { // Headings
      const level = hashes.length;
      return `<h${level + 2} class="font-semibold mt-4 mb-2">${content}</h${level + 2}>`;
    })
    .replace(/^- (.*)/gm, '<li class="ml-4 list-disc">$1</li>') // List items
    .replace(/(\r\n|\r|\n){2,}/g, '<br><br>'); // Paragraphs
}
import React, { useState, useEffect, useMemo, useRef } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  setLogLevel,
} from 'firebase/firestore';

// --- Global Firebase & App Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCOggkRb4hF3gUT3Gf6aJXes3zm6_Yspzg",
  authDomain: "dieter-512e1.firebaseapp.com",
  projectId: "dieter-512e1",
  storageBucket: "dieter-512e1.firebasestorage.app",
  messagingSenderId: "494620949863",
  appId: "1:494620949863:web:70d3aca17dc51708c583c2"
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'dieter-app';
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined'
    ? __initial_auth_token
    : null;

// --- Firebase Initialization ---
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setLogLevel('debug');
} catch (e) {
  console.error('Firebase initialization error:', e);
}

// --- Recommended Daily Allowances (RDAs) ---
const RDA = {
  calories: 2000,
  protein: 50, // grams
  fat: 78, // grams
  carbohydrates: 275, // grams
};

// --- Helper Components ---

/**
 * A simple loading spinner component.
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    {/* STYLING: Changed border color */}
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  </div>
);

/**
 * A modal component for displaying errors or messages.
 */
const Modal = ({ title, message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
    {/* STYLING: Increased rounded corners and shadow */}
    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-4">
        <button
          type="button"
          // STYLING: Changed button color
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

/**
 * Component for uploading an image.
 */
const ImageUploader = ({ onImageUpload, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  return (
    // STYLING: Updated card appearance
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
      {/* STYLING: Updated header color */}
      <h2 className="text-xl font-semibold text-green-900 mb-4">
        Add Food Item
      </h2>
      <label
        htmlFor="file-upload"
        // STYLING: Updated drag-over colors
        className={`flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors duration-200 ${
          dragOver ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            {/* STYLING: Updated text color */}
            <span className="relative font-medium text-green-700 hover:text-green-600">
              Upload a photo
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </label>
      {isLoading && (
        <div className="mt-4">
          <LoadingSpinner />
          <p className="text-center text-sm text-gray-500 mt-2">
            Analyzing your food...
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Displays the daily nutritional summary and RDA percentages.
 */
const DailySummary = ({ totals }) => {
  const summaryItems = [
    {
      name: 'Calories',
      value: totals.calories,
      rda: RDA.calories,
      unit: 'kcal',
    },
    {
      name: 'Protein',
      value: totals.protein,
      rda: RDA.protein,
      unit: 'g',
    },
    { name: 'Fat', value: totals.fat, rda: RDA.fat, unit: 'g' },
    {
      name: 'Carbs',
      value: totals.carbohydrates,
      rda: RDA.carbohydrates,
      unit: 'g',
    },
  ];

  return (
    // STYLING: Updated card appearance
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
      {/* STYLING: Updated header color */}
      <h2 className="text-xl font-semibold text-green-900 mb-4">
        Today's Summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryItems.map((item) => {
          const percentage = item.rda > 0 ? (item.value / item.rda) * 100 : 0;
          const barWidth = Math.min(percentage, 100);

          return (
            <div key={item.name} className="text-center">
              <div className="relative h-24 w-24 mx-auto">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                  />
                  <path
                    // STYLING: Updated progress ring color
                    className="text-green-500"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                    strokeDasharray={`${barWidth}, 100`}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-700">
                  {Math.round(percentage)}%
                </div>
              </div>
              <p className="font-semibold text-gray-700 mt-2">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.value.toFixed(0)} / {item.rda} {item.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Displays the list of food items eaten today.
 */
const FoodList = ({ foodEntries }) => (
  // STYLING: Updated card appearance
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
    {/* STYLING: Updated header color */}
    <h2 className="text-xl font-semibold text-green-900 mb-4">Today's Log</h2>
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {foodEntries.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No food logged for today.
        </p>
      ) : (
        foodEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-semibold text-gray-800">{entry.foodName}</p>
              <p className="text-sm text-gray-500">
                {/* Add checks for entry.calories and entry.nutrients to avoid crashes if data is malformed */}
                {entry.calories ? entry.calories.toFixed(0) : 0} kcal &bull;{' '}
                {entry.nutrients?.protein ? entry.nutrients.protein.toFixed(0) : 0}g P &bull;{' '}
                {entry.nutrients?.fat ? entry.nutrients.fat.toFixed(0) : 0}g F &bull;{' '}
                {entry.nutrients?.carbohydrates ? entry.nutrients.carbohydrates.toFixed(0) : 0}g C
              </p>
            </div>
            {/* Add a check for entry.timestamp */}
            {entry.timestamp && (
              <span className="text-sm text-gray-400">
                {entry.timestamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);


/**
 * Displays AI-powered recommendations.
 */
// --- NEW: Removed `onGetRecommendation` prop ---
const Recommendation = ({ recommendation, isLoading }) => (
  // STYLING: Updated card appearance
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
    {/* STYLING: Updated header color */}
    <h2 className="text-xl font-semibold text-green-900 mb-4">
      AI Diet Coach
    </h2>
    <div className="min-h-[60px] flex items-center">
      {isLoading ? (
        <div className="w-full">
          <LoadingSpinner />
          <p className="text-sm text-gray-500 text-center mt-2">Generating a new tip...</p>
        </div>
      ) : recommendation ? (
        <p className="text-gray-700 italic">"{recommendation}"</p>
      ) : (
        <p className="text-gray-500">
          Add a food item to get your first tip of the day.
        </p>
      )}
    </div>
    {/* --- NEW: Removed the button --- */}
  </div>
);

/**
 * Main App Component
 */
export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW: Ref to hold the debounce timer for recommendations ---
  const recommendationTimerRef = useRef(null);

  // --- 1. Authentication Effect ---
  // On mount, check auth state.
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth is not initialized.');
      setError('Firebase failed to initialize. Please check console.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        // No user, sign in.
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
          // onAuthStateChanged will run again.
        } catch (authError) {
          console.error('Error signing in:', authError);
          setError(`Failed to authenticate: ${authError.message}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Firestore Data-Fetching Effect ---
  // Subscribes to food entries for *today* once auth is ready.
  useEffect(() => {
    // Wait for auth to be ready and db to be initialized.
    if (!isAuthReady || !userId || !db) {
      return;
    }

    // Calculate the start of the current day.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);

    // Create the query.
    const entriesCollection = collection(
      db,
      `artifacts/${appId}/users/${userId}/foodEntries`
    );
    const q = query(
      entriesCollection,
      where('timestamp', '>=', startOfTodayTimestamp)
    );

    // Subscribe to the query.
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const entries = [];
        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() });
        });
        // Sort by date on the client
        entries.sort((a, b) => {
          // Add a check in case timestamp is missing
          if (a.timestamp && b.timestamp) {
            return b.timestamp.toDate() - a.timestamp.toDate();
          }
          return 0;
        });
        setFoodEntries(entries);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isAuthReady, userId]); // Re-run if auth state changes.

  // --- 3. Compute Daily Totals ---
  // Uses useMemo to recalculate only when foodEntries changes.
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    };
    foodEntries.forEach((entry) => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.nutrients?.protein || 0;
      totals.fat += entry.nutrients?.fat || 0;
      totals.carbohydrates += entry.nutrients?.carbohydrates || 0;
    });
    return totals;
  }, [foodEntries]);

  // --- Helper: Convert file to base64 ---
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve(reader.result.split(',')[1]); // Get only the base64 part
      reader.onerror = (error) => reject(error);
    });
  };

  // --- 4. Gemini API Call: Image Analysis ---
  // This function is correct: it calls your backend.
  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsLoadingImage(true);
    setError(null);

    try {
      const base64ImageData = await fileToBase64(file);

      // Call your own backend at http://localhost:3001
      const response = await fetch('http://localhost:3001/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ImageData,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        // Get the error message from your backend's JSON response
        const errData = await response.json();
        throw new Error(`Backend error: ${errData.error || response.statusText}`);
      }

      // Your backend already returns clean JSON, so just parse it
      const foodData = await response.json();

      // Save to Firestore
      if (db && userId) {
        const entriesCollection = collection(
          db,
          `artifacts/${appId}/users/${userId}/foodEntries`
        );
        await addDoc(entriesCollection, {
          ...foodData,
          // This timestamp is CRITICAL for the "Today's Log" query
          timestamp: Timestamp.now(), 
        });
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(`Error analyzing image: ${err.message}`);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // --- 5. Gemini API Call: Get Recommendation ---
  // This function is the *same* as before, but it will now be
  // called automatically by the new useEffect hook below.
  const handleGetRecommendation = async () => {
    // Note: We set isLoadingRec in the *new* useEffect hook,
    // not here, to provide instant feedback.
    
    // Prevent multiple concurrent requests
    if (isLoadingRec) return; 
    
    setIsLoadingRec(true);
    setError(null);

    try {
      const foodListString = foodEntries
        .map((f) => `${f.foodName} (${f.calories} kcal)`)
        .join(', ');
      
      const userQuery =
        foodEntries.length > 0
          ? `Today I have already eaten: ${foodListString}. My daily target is ~${RDA.calories} kcal, ${RDA.protein}g protein, ${RDA.fat}g fat, and ${RDA.carbohydrates}g carbs. Based on my current totals (${dailyTotals.calories} kcal, ${dailyTotals.protein}g P, ${dailyTotals.fat}g F, ${dailyTotals.carbohydrates}g C), what should I focus on eating for the rest of the day to have a balanced diet?`
          : `I haven't eaten anything yet today. What's a good, balanced meal to start my day? My daily targets are ~${RDA.calories} kcal, ${RDA.protein}g protein, ${RDA.fat}g fat, and ${RDA.carbohydrates}g carbs.`;

      const systemPrompt =
        "You are a friendly and encouraging diet coach. Provide a *brief* (2-3 sentences), actionable recommendation for the user. Focus on food groups or specific meal ideas. Do not just repeat the numbers.";

      // IMPORTANT: This still requires a frontend-restricted API key
      // for local testing.
      const apiKey = ''; // Add your *frontend-restricted* API key here
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{ parts: [{ text: userQuery }] }],
      };

      // This fetch call correctly goes to the Google API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`Google API error: ${err.error?.message || response.statusText}`);
      }
      
      const result = await response.json();

      if (
        result.candidates &&
        result.candidates[0].content &&
        result.candidates[0].content.parts[0].text
      ) {
        setRecommendation(result.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response structure from Gemini API.');
      }
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError(`Error getting recommendation: ${err.message}`);
    } finally {
      setIsLoadingRec(false);
    }
  };
  
  // --- NEW: 6. Automatic Recommendation Effect ---
  // This effect runs when `dailyTotals` changes, automatically
  // triggering a new recommendation after a 3-second delay.
  useEffect(() => {
    // Don't run until auth is ready and user is loaded
    if (!isAuthReady || !userId) {
      return;
    }

    // Clear any existing timer
    if (recommendationTimerRef.current) {
      clearTimeout(recommendationTimerRef.current);
    }
    
    // Set loading state *before* the timer
    // to give instant feedback
    setIsLoadingRec(true);

    // Set a new timer
    recommendationTimerRef.current = setTimeout(() => {
      handleGetRecommendation();
    }, 3000); // 3-second debounce

    // Cleanup: clear the timer if the component unmounts
    return () => {
      if (recommendationTimerRef.current) {
        clearTimeout(recommendationTimerRef.current);
      }
    };
  }, [dailyTotals, isAuthReady, userId]); // Re-run when totals change


  // --- Render App ---
  if (!isAuthReady) {
    return (
      // STYLING: Updated auth screen background
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-cyan-50">
        <LoadingSpinner />
        <p className="ml-2 text-gray-600">Authenticating...</p>
      </div>
    );
  }

  return (
    // STYLING: Updated main background
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 p-4 sm:p-8 font-inter">
      {error && (
        <Modal
          title="An Error Occurred"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <header className="max-w-7xl mx-auto mb-6">
        {/* STYLING: Updated header color */}
        <h1 className="text-3xl font-bold text-green-900">
          Dieter AI Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome! Your user ID is: <code className="text-xs bg-gray-200 p-1 rounded">{userId}</code>
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-6">
          <DailySummary totals={dailyTotals} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageUploader
              onImageUpload={handleImageUpload}
              isLoading={isLoadingImage}
            />
            <FoodList foodEntries={foodEntries} />
          </div>
          <div className="lg:col-span-1">
            {/* --- NEW: Removed `onGetRecommendation` prop --- */}
            <Recommendation
              recommendation={recommendation}
              isLoading={isLoadingRec}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
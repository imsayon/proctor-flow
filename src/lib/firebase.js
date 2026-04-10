// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REPLACE_WITH_REAL_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'proctor-flow.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'proctor-flow',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'proctor-flow.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '739258676841',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:739258676841:web:8a18ae3fbc1ac7c6a394f8',
};

// Detect demo mode (no real API key configured)
export const IS_DEMO_MODE = false;

let app, auth, db, storage;
let functions;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
} catch (e) {
  console.warn('[ProctorFlow] Firebase init failed — running in demo mode.', e.message);
}

export { auth, db, storage, functions };
export default app;

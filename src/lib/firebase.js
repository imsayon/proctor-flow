// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-Key-Replace-Me",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "proctor-flow.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "proctor-flow",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "proctor-flow.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "739258676841",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:739258676841:web:8a18ae3fbc1ac7c6a394f8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
export const FIREBASE_CONFIGURED = Boolean(apiKey && apiKey !== "REPLACE_WITH_REAL_API_KEY");

const firebaseConfig = {
  apiKey: apiKey || "UNCONFIGURED",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "proctor-flow.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "proctor-flow",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "proctor-flow.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "739258676841",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:739258676841:web:8a18ae3fbc1ac7c6a394f8",
};
export const IS_DEMO_MODE = !FIREBASE_CONFIGURED;

let app = null, auth = null, db = null, storage = null, functions = null;
if (FIREBASE_CONFIGURED) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
}

export { auth, db, storage, functions };
export default app;

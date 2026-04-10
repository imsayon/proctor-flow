import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnTr0vjX3rD9fYafjYOCRcLeju6Nftg4o",
  authDomain: "proctor-flow.firebaseapp.com",
  projectId: "proctor-flow",
  storageBucket: "proctor-flow.firebasestorage.app",
  messagingSenderId: "739258676841",
  appId: "1:739258676841:web:8a18ae3fbc1ac7c6a394f8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, "test"));
    console.log("Firestore success! Docs count:", snap.size);
  } catch (e) {
    console.log("Firestore error:", e.code, e.message);
  }
}
run();

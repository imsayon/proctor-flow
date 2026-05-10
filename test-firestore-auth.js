import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnTr0vjX3rD9fYafjYOCRcLeju6Nftg4o",
  authDomain: "proctor-flow.firebaseapp.com",
  projectId: "proctor-flow",
  storageBucket: "proctor-flow.firebasestorage.app",
  messagingSenderId: "739258676841",
  appId: "1:739258676841:web:8a18ae3fbc1ac7c6a394f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const email = "testscript" + Date.now() + "@test.com";
    const password = "password123";
    console.log("Creating user:", email);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", cred.user.uid);
    
    console.log("Attempting to write a leave...");
    const leaveId = "test_leave_" + Date.now();
    await setDoc(doc(db, "institutions", "dsce", "leaves", leaveId), {
      facultyId: "f1",
      from: "2025-11-15",
      to: "2025-11-17",
      reason: "Test Script Leave",
      status: "pending"
    });
    console.log("✅ Wrote leave successfully");

    console.log("Attempting to read leaves...");
    const snap = await getDocs(collection(db, "institutions", "dsce", "leaves"));
    console.log("Read success. Total leaves:", snap.size);

  } catch(e) {
    console.error("❌ ERROR:", e.code, e.message);
  }
}
run();

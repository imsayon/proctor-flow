import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
    const email = "admin" + Date.now() + "@test.com";
    const password = "password123";
    console.log("Creating user:", email);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", cred.user.uid);
    
    // First, make this user an admin
    console.log("Assigning admin role to user...");
    await setDoc(doc(db, "institutions", "dsce", "users", cred.user.uid), {
      role: "admin"
    });
    console.log("Admin role assigned");

    console.log("Attempting to write a faculty...");
    const facultyId = "faculty_" + Date.now();
    await setDoc(doc(db, "institutions", "dsce", "faculty", facultyId), {
      name: "New Faculty",
      email: "fac@test.com"
    });
    console.log("✅ Wrote faculty successfully");
    
    // Test if a faculty member can update their own profile
    console.log("Attempting to read faculty...");
    const snap = await getDocs(collection(db, "institutions", "dsce", "faculty"));
    console.log("Read success. Total faculty:", snap.size);

  } catch(e) {
    console.error("❌ ERROR:", e.code, e.message);
  }
}
run();

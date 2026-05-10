import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function check() {
  try {
    const snap = await getDocs(collection(db, "institutions", "dsce", "leaves"));
    console.log("Leaves for dsce count:", snap.size);
    snap.forEach(d => console.log(d.id, d.data()));
    
    // Check faculty as well
    const facSnap = await getDocs(collection(db, "institutions", "dsce", "faculty"));
    console.log("\nFaculty for dsce count:", facSnap.size);
    facSnap.forEach(d => console.log(d.id, d.data().name, d.data().email));

  } catch(e) {
    console.error(e);
  }
}
check();

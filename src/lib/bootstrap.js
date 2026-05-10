// src/lib/bootstrap.js
// Runs once per institution. Creates the /institutions/{id} doc and the
// first admin's /users/{uid} sub-doc so Firestore security rules can function.
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const INSTITUTION_ID = 'dsce';

export async function bootstrapInstitution(uid, name, email) {
  const instRef = doc(db, 'institutions', INSTITUTION_ID);
  const instSnap = await getDoc(instRef);

  // Create institution doc if it doesn't exist yet
  if (!instSnap.exists()) {
    await setDoc(instRef, {
      name:      'DSCE - Dayananda Sagar College of Engineering',
      country:   'IN',
      active:    true,
      hasAdmin:  true,
      adminUid:  uid,
      createdAt: serverTimestamp(),
    });
  } else if (!instSnap.data()?.hasAdmin) {
    await setDoc(instRef, {
      hasAdmin: true,
      adminUid: uid,
    }, { merge: true });
  }

  // Create the admin user sub-doc (satisfies isAdmin() rule)
  const userRef = doc(db, 'institutions', INSTITUTION_ID, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      name,
      email,
      role:      'admin',
      status:    'active',
      createdAt: serverTimestamp(),
    });
  }
}

export async function bootstrapFacultyUser(uid, name, email, employeeId) {
  const userRef = doc(db, 'institutions', INSTITUTION_ID, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid, name, email,
      role: 'faculty', status: 'active',
      employeeId,
      createdAt: serverTimestamp(),
    });
  }
}

export async function bootstrapStudentUser(uid, name, email, usn, rollNo, branch) {
  const userRef = doc(db, 'institutions', INSTITUTION_ID, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid, name, email, usn, rollNo, branch,
      role: 'student', status: 'active',
      createdAt: serverTimestamp(),
    });
  }
}

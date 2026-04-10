// src/lib/firestore.js
// Institution-scoped Firestore service layer
// All operational collections live under /institutions/{institutionId}/

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, onSnapshot, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db, IS_DEMO_MODE } from './firebase';

// ─── Institution-scoped refs ─────────────────────────────────────────
export const institutionRef = (institutionId) => doc(db, 'institutions', institutionId);
export const col = (institutionId, colName) => collection(db, 'institutions', institutionId, colName);
export const examCol = (institutionId, eventId, colName) =>
  collection(db, 'institutions', institutionId, 'exam_events', eventId, colName);

// ─── Institutions directory (India-first) ────────────────────────────
export const institutionsCol = () => collection(db, 'institutions');

// ─── User / claims ───────────────────────────────────────────────────
export async function getUserClaims(uid, institutionId) {
  if (IS_DEMO_MODE) return null;
  try {
    if (!institutionId) return null;
    const snap = await getDoc(doc(db, 'institutions', institutionId, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

export async function upsertUser(uid, data, institutionId) {
  if (IS_DEMO_MODE) return;
  if (!institutionId) throw new Error('institutionId is required');
  return setDoc(doc(db, 'institutions', institutionId, 'users', uid), data, { merge: true });
}

// ─── Generic CRUD ────────────────────────────────────────────────────
export async function getAll(institutionId, colName) {
  const snap = await getDocs(col(institutionId, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function set(institutionId, colName, id, data) {
  return setDoc(doc(db, 'institutions', institutionId, colName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function add(institutionId, colName, data) {
  return addDoc(col(institutionId, colName), { ...data, createdAt: serverTimestamp() });
}

export async function remove(institutionId, colName, id) {
  return deleteDoc(doc(db, 'institutions', institutionId, colName, id));
}

// ─── Real-time listeners ─────────────────────────────────────────────
export function listenCol(institutionId, colName, callback) {
  if (IS_DEMO_MODE) return () => {};
  return onSnapshot(col(institutionId, colName), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function listenExamCol(institutionId, eventId, colName, callback) {
  if (IS_DEMO_MODE) return () => {};
  return onSnapshot(examCol(institutionId, eventId, colName), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function listenDoc(ref, callback) {
  if (IS_DEMO_MODE) return () => {};
  return onSnapshot(ref, snap => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() }) : null);
  });
}

export function studentViewDoc(institutionId, uid) {
  return doc(db, 'institutions', institutionId, 'student_views', uid);
}

// ─── Exam Events ─────────────────────────────────────────────────────
export async function createExamEvent(institutionId, data) {
  return addDoc(col(institutionId, 'exam_events'), {
    ...data, status: 'draft', createdAt: serverTimestamp(),
  });
}

export async function transitionExamEvent(institutionId, eventId, newStatus) {
  return updateDoc(doc(db, 'institutions', institutionId, 'exam_events', eventId), {
    status: newStatus, [`${newStatus}At`]: serverTimestamp(),
  });
}

// ─── Batch write (RAG commit) ─────────────────────────────────────────
export async function batchWrite(institutionId, colName, records) {
  const batch = writeBatch(db);
  records.forEach(rec => {
    const ref = rec.id
      ? doc(db, 'institutions', institutionId, colName, rec.id)
      : doc(col(institutionId, colName));
    batch.set(ref, { ...rec, updatedAt: serverTimestamp() }, { merge: true });
  });
  return batch.commit();
}

// ─── Seed helpers ─────────────────────────────────────────────────────
export async function seedIfEmpty(institutionId, colName, records) {
  if (IS_DEMO_MODE) return false;
  try {
    const snap = await getDocs(col(institutionId, colName));
    if (!snap.empty) return false;
    const batch = writeBatch(db);
    records.forEach(r => {
      const ref = r.id
        ? doc(db, 'institutions', institutionId, colName, r.id)
        : doc(col(institutionId, colName));
      batch.set(ref, { ...r, seeded: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.warn('[Seed] Failed:', e.message);
    return false;
  }
}

// src/lib/firestore.js
// Department-scoped Firestore service layer
// All collections live under /departments/{deptId}/

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, onSnapshot, writeBatch, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, IS_DEMO_MODE } from './firebase';

// ─── Dept-scoped refs ────────────────────────────────────────────────
export const deptRef = (deptId) => doc(db, 'departments', deptId);
export const col = (deptId, colName) => collection(db, 'departments', deptId, colName);
export const examCol = (deptId, eventId, colName) =>
  collection(db, 'departments', deptId, 'exam_events', eventId, colName);

// ─── User / claims ───────────────────────────────────────────────────
export async function getUserClaims(uid, deptId = 'ise') {
  if (IS_DEMO_MODE) return null;
  try {
    const snap = await getDoc(doc(db, 'departments', deptId, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

export async function upsertUser(uid, data, deptId = 'ise') {
  if (IS_DEMO_MODE) return;
  return setDoc(doc(db, 'departments', deptId, 'users', uid), data, { merge: true });
}

// ─── Generic CRUD ────────────────────────────────────────────────────
export async function getAll(deptId, colName) {
  const snap = await getDocs(col(deptId, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function set(deptId, colName, id, data) {
  return setDoc(doc(db, 'departments', deptId, colName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function add(deptId, colName, data) {
  return addDoc(col(deptId, colName), { ...data, createdAt: serverTimestamp() });
}

export async function remove(deptId, colName, id) {
  return deleteDoc(doc(db, 'departments', deptId, colName, id));
}

// ─── Real-time listeners ─────────────────────────────────────────────
export function listenCol(deptId, colName, callback) {
  if (IS_DEMO_MODE) return () => {};
  return onSnapshot(col(deptId, colName), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function listenExamCol(deptId, eventId, colName, callback) {
  if (IS_DEMO_MODE) return () => {};
  return onSnapshot(examCol(deptId, eventId, colName), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─── Exam Events ─────────────────────────────────────────────────────
export async function createExamEvent(deptId, data) {
  return addDoc(col(deptId, 'exam_events'), {
    ...data, status: 'draft', createdAt: serverTimestamp(),
  });
}

export async function transitionExamEvent(deptId, eventId, newStatus) {
  return updateDoc(doc(db, 'departments', deptId, 'exam_events', eventId), {
    status: newStatus, [`${newStatus}At`]: serverTimestamp(),
  });
}

// ─── Batch write (RAG commit) ─────────────────────────────────────────
export async function batchWrite(deptId, colName, records) {
  const batch = writeBatch(db);
  records.forEach(rec => {
    const ref = rec.id
      ? doc(db, 'departments', deptId, colName, rec.id)
      : doc(col(deptId, colName));
    batch.set(ref, { ...rec, updatedAt: serverTimestamp() }, { merge: true });
  });
  return batch.commit();
}

// ─── Seed helpers ─────────────────────────────────────────────────────
export async function seedIfEmpty(deptId, colName, records) {
  if (IS_DEMO_MODE) return false;
  try {
    const snap = await getDocs(col(deptId, colName));
    if (!snap.empty) return false;
    const batch = writeBatch(db);
    records.forEach(r => {
      const ref = r.id
        ? doc(db, 'departments', deptId, colName, r.id)
        : doc(col(deptId, colName));
      batch.set(ref, { ...r, seeded: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.warn('[Seed] Failed:', e.message);
    return false;
  }
}

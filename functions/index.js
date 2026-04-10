const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

admin.initializeApp();

const db = admin.firestore();

function assertEmailDomainAllowed(email, domains) {
  const domain = String(email || '').split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return (domains || []).some(d => String(d).toLowerCase() === domain);
}

async function institutionHasAdmin(institutionId) {
  const snap = await db
    .collection('institutions')
    .doc(institutionId)
    .collection('users')
    .where('role', '==', 'admin')
    .limit(1)
    .get();
  return !snap.empty;
}

function requireAuth(context) {
  if (!context.auth) throw new HttpsError('unauthenticated', 'Authentication required');
  return context.auth;
}

function requireAdminClaims(context, institutionId) {
  const auth = requireAuth(context);
  const { role, institutionId: tokenInstitutionId } = auth.token || {};
  if (role !== 'admin') throw new HttpsError('permission-denied', 'Admin role required');
  if (!tokenInstitutionId || tokenInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', 'Institution mismatch');
  }
  return auth;
}

exports.bootstrapAdmin = onCall({ cors: true }, async (request) => {
  const { institutionId, email, password, name } = request.data || {};
  if (!institutionId || !email || !password || !name) {
    throw new HttpsError('invalid-argument', 'institutionId, email, password, name are required');
  }
  if (String(password).length < 8) throw new HttpsError('invalid-argument', 'Password must be at least 8 characters');

  const instRef = db.collection('institutions').doc(institutionId);
  const instSnap = await instRef.get();
  if (!instSnap.exists) throw new HttpsError('not-found', 'Institution not found');
  const inst = instSnap.data() || {};
  if (inst.active === false) throw new HttpsError('failed-precondition', 'Institution is disabled');
  if (!assertEmailDomainAllowed(email, inst.domains)) {
    throw new HttpsError('failed-precondition', 'Email domain is not allowed for this institution');
  }

  if (await institutionHasAdmin(institutionId)) {
    throw new HttpsError('already-exists', 'Admin already exists for this institution');
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
  } catch (e) {
    throw new HttpsError('failed-precondition', e.message || 'Failed to create admin user');
  }

  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role: 'admin',
    institutionId,
  });

  const userDoc = {
    role: 'admin',
    email,
    name,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await instRef.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
  await instRef.set({ hasAdmin: true, adminUid: userRecord.uid }, { merge: true });

  return { uid: userRecord.uid, institutionId, role: 'admin' };
});

exports.adminCreateUser = onCall({ cors: true }, async (request) => {
  const { institutionId, role, email, password, profile } = request.data || {};
  if (!institutionId || !role || !email || !password) {
    throw new HttpsError('invalid-argument', 'institutionId, role, email, password are required');
  }
  if (!['faculty', 'student'].includes(role)) {
    throw new HttpsError('invalid-argument', 'role must be faculty or student');
  }
  if (String(password).length < 8) throw new HttpsError('invalid-argument', 'Password must be at least 8 characters');

  requireAdminClaims(request, institutionId);

  const instRef = db.collection('institutions').doc(institutionId);
  const instSnap = await instRef.get();
  if (!instSnap.exists) throw new HttpsError('not-found', 'Institution not found');
  const inst = instSnap.data() || {};
  if (inst.active === false) throw new HttpsError('failed-precondition', 'Institution is disabled');
  if (!assertEmailDomainAllowed(email, inst.domains)) {
    throw new HttpsError('failed-precondition', 'Email domain is not allowed for this institution');
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: profile?.name || undefined,
    });
  } catch (e) {
    throw new HttpsError('failed-precondition', e.message || 'Failed to create user');
  }

  await admin.auth().setCustomUserClaims(userRecord.uid, { role, institutionId });

  const baseUserDoc = {
    role,
    email,
    name: profile?.name || email,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await instRef.collection('users').doc(userRecord.uid).set(baseUserDoc, { merge: true });

  if (role === 'faculty') {
    await instRef.collection('faculty').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name: profile?.name || email,
      employeeId: profile?.employeeId || null,
      desg: profile?.desg || null,
      available: true,
      duties: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } else {
    await instRef.collection('students').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name: profile?.name || email,
      usn: profile?.usn || null,
      rollNo: profile?.usn || null,
      branch: profile?.branch || null,
      semester: profile?.semester || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  return { uid: userRecord.uid, institutionId, role };
});

exports.adminResetPassword = onCall({ cors: true }, async (request) => {
  const { institutionId, uid, newPassword } = request.data || {};
  if (!institutionId || !uid || !newPassword) {
    throw new HttpsError('invalid-argument', 'institutionId, uid, newPassword are required');
  }
  if (String(newPassword).length < 8) throw new HttpsError('invalid-argument', 'Password must be at least 8 characters');

  requireAdminClaims(request, institutionId);

  // Ensure target user belongs to this institution (prevent cross-tenant reset).
  const userSnap = await db
    .collection('institutions')
    .doc(institutionId)
    .collection('users')
    .doc(uid)
    .get();
  if (!userSnap.exists) throw new HttpsError('not-found', 'User not found in this institution');

  await admin.auth().updateUser(uid, { password: newPassword });
  return { ok: true };
});


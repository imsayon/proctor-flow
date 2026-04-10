// src/context/AuthContext.jsx
// Spark-only production auth: Firebase Auth + institution-scoped user docs (no Cloud Functions / custom claims)
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserClaims, upsertInstitution, upsertJoinRequest, upsertUser } from '../lib/firestore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const LAST_INSTITUTION_KEY = 'pf_last_institution_id';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('pf_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen to real Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setAuthError(null);
      if (!fbUser) {
        setUser(null);
        sessionStorage.removeItem('pf_user');
        setLoading(false);
        return;
      }

      try {
        const institutionId = sessionStorage.getItem(LAST_INSTITUTION_KEY);
        if (!institutionId) {
          await signOut(auth);
          setUser(null);
          sessionStorage.removeItem('pf_user');
          setAuthError('Select your institution and sign in again.');
          setLoading(false);
          return;
        }

        const claimsDoc = await getUserClaims(fbUser.uid, institutionId);
        if (!claimsDoc || claimsDoc.status !== 'active' || !claimsDoc.role) {
          await signOut(auth);
          setUser(null);
          sessionStorage.removeItem('pf_user');
          setAuthError('Your account is not approved by the institution admin yet.');
          setLoading(false);
          return;
        }

        const merged = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: claimsDoc?.name || fbUser.displayName || fbUser.email,
          role: claimsDoc.role,
          institutionId,
          employeeId: claimsDoc?.employeeId,
          usn: claimsDoc?.usn,
          rollNo: claimsDoc?.usn,
          branch: claimsDoc?.branch,
          mustChangePassword: Boolean(claimsDoc?.mustChangePassword),
        };

        setUser(merged);
        sessionStorage.setItem('pf_user', JSON.stringify(merged));
      } catch (e) {
        console.error('[Auth] Failed to load session', e);
        setAuthError('Failed to load your session. Please sign in again.');
        await signOut(auth);
        setUser(null);
        sessionStorage.removeItem('pf_user');
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password, expectedInstitutionId) => {
    setAuthError(null);
    if (!expectedInstitutionId) throw new Error('Please select your institution');
    sessionStorage.setItem(LAST_INSTITUTION_KEY, expectedInstitutionId);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const signUp = useCallback(async (email, password, expectedInstitutionId) => {
    setAuthError(null);
    if (!expectedInstitutionId) throw new Error('Please select your institution');
    sessionStorage.setItem(LAST_INSTITUTION_KEY, expectedInstitutionId);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const requestAccess = useCallback(async ({ institutionId, desiredRole, name }) => {
    if (!auth.currentUser) throw new Error('Sign in first');
    if (!institutionId) throw new Error('institutionId required');
    const uid = auth.currentUser.uid;
    await upsertJoinRequest(institutionId, uid, {
      uid,
      email: auth.currentUser.email,
      name: name || auth.currentUser.displayName || auth.currentUser.email,
      desiredRole,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const bootstrapAdmin = useCallback(async ({ institutionId, name }) => {
    if (!auth.currentUser) throw new Error('Sign in first');
    if (!institutionId) throw new Error('institutionId required');
    const uid = auth.currentUser.uid;
    await upsertUser(uid, {
      role: 'admin',
      status: 'active',
      email: auth.currentUser.email,
      name: name || auth.currentUser.displayName || auth.currentUser.email,
      createdAt: new Date().toISOString(),
    }, institutionId);
    await upsertInstitution(institutionId, { hasAdmin: true, adminUid: uid });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    sessionStorage.removeItem('pf_user');
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    await fbUpdatePassword(auth.currentUser, newPassword);
    await upsertUser(auth.currentUser.uid, { mustChangePassword: false }, user.institutionId);
    setUser(prev => ({ ...prev, mustChangePassword: false }));
  }, [user]);

  const value = {
    user, loading, authError, login, signUp, requestAccess, bootstrapAdmin, logout, changePassword,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty',
    institutionId: user?.institutionId || 'ise',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

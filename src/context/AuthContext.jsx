// src/context/AuthContext.jsx
// Production auth: Firebase Auth + custom claims + institution-scoped user docs
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserClaims, upsertUser } from '../lib/firestore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

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
        const token = await getIdTokenResult(fbUser, true);
        const institutionId = token?.claims?.institutionId;
        const role = token?.claims?.role;

        if (!institutionId || !role) {
          await signOut(auth);
          setUser(null);
          sessionStorage.removeItem('pf_user');
          setAuthError('Your account is not provisioned by an institution admin.');
          setLoading(false);
          return;
        }

        const claimsDoc = await getUserClaims(fbUser.uid, institutionId);
        const merged = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: claimsDoc?.name || fbUser.displayName || fbUser.email,
          role: claimsDoc?.role || role,
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdTokenResult(cred.user, true);
    const institutionId = token?.claims?.institutionId;
    if (!institutionId) {
      await signOut(auth);
      throw new Error('Not registered by admin. Contact your institution admin.');
    }
    if (expectedInstitutionId && institutionId !== expectedInstitutionId) {
      await signOut(auth);
      throw new Error('This account belongs to a different institution.');
    }
    // onAuthStateChanged finalizes session hydration
    return cred.user;
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
    user, loading, authError, login, logout, changePassword,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty',
    institutionId: user?.institutionId || 'ise',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

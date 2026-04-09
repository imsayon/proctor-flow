// src/context/AuthContext.jsx
// Hybrid auth: real Firebase Auth when configured, demo accounts as fallback
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword as fbUpdatePassword } from 'firebase/auth';
import { auth, IS_DEMO_MODE } from '../lib/firebase';
import { getUserClaims, upsertUser } from '../lib/firestore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Demo accounts (fallback when Firebase Auth isn't configured)
const DEMO_ACCOUNTS = {
  'admin@proctorflow.edu': { password: 'admin123', role: 'admin', name: 'Dr. K. Ramesh (HOD)', dept: 'ISE', deptId: 'ise', employeeId: 'HOD001' },
  'student@proctorflow.edu': { password: 'student123', role: 'student', name: 'Aarav Sharma', rollNo: '1DS22IS001', branch: 'ISE', deptId: 'ise', usn: '1DS22IS001' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('pf_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(!IS_DEMO_MODE);

  // Listen to real Firebase Auth state
  useEffect(() => {
    if (IS_DEMO_MODE) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch Firestore-based claims
        const claims = await getUserClaims(fbUser.uid, 'ise');
        const merged = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: claims?.name || fbUser.displayName || fbUser.email,
          role: claims?.role || 'student',
          deptId: claims?.deptId || 'ise',
          employeeId: claims?.employeeId,
          usn: claims?.usn,
          rollNo: claims?.usn,
          branch: claims?.branch || 'ISE',
          mustChangePassword: claims?.mustChangePassword || false,
        };
        setUser(merged);
        sessionStorage.setItem('pf_user', JSON.stringify(merged));
      } else {
        setUser(null);
        sessionStorage.removeItem('pf_user');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    if (IS_DEMO_MODE) {
      const acct = DEMO_ACCOUNTS[email];
      if (!acct || acct.password !== password) throw new Error('Invalid credentials');
      const u = { uid: email, email, ...acct };
      setUser(u);
      sessionStorage.setItem('pf_user', JSON.stringify(u));
      return u;
    }
    // Real Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the rest
    return cred.user;
  }, []);

  const logout = useCallback(async () => {
    if (!IS_DEMO_MODE) await signOut(auth);
    setUser(null);
    sessionStorage.removeItem('pf_user');
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    if (IS_DEMO_MODE) {
      setUser(prev => ({ ...prev, mustChangePassword: false }));
      sessionStorage.setItem('pf_user', JSON.stringify({ ...user, mustChangePassword: false }));
      return;
    }
    await fbUpdatePassword(auth.currentUser, newPassword);
    await upsertUser(auth.currentUser.uid, { mustChangePassword: false }, user.deptId);
    setUser(prev => ({ ...prev, mustChangePassword: false }));
  }, [user]);

  const value = {
    user, loading, login, logout, changePassword,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty',
    deptId: user?.deptId || 'ise',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

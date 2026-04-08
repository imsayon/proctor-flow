// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Demo accounts — In production this would use Firebase Auth custom claims
const DEMO_ACCOUNTS = {
  'admin@proctorflow.edu': { password: 'admin123', role: 'admin', name: 'Dr. K. Ramesh (HOD)', dept: 'ISE' },
  'faculty@proctorflow.edu': { password: 'faculty123', role: 'faculty', name: 'Prof. Ramesh Kumar', dept: 'ISE' },
  'student@proctorflow.edu': { password: 'student123', role: 'student', name: 'Aarav Sharma', rollNo: '1DS22IS001', branch: 'ISE' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('pf_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account) throw new Error('No account found with that email.');
    if (account.password !== password) throw new Error('Incorrect password.');
    const userObj = { email, role: account.role, name: account.name, dept: account.dept, rollNo: account.rollNo, branch: account.branch };
    setUser(userObj);
    sessionStorage.setItem('pf_user', JSON.stringify(userObj));
    return userObj;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('pf_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin', isFaculty: user?.role === 'faculty', isStudent: user?.role === 'student' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

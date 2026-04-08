import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Mocking auth flow here for now since no firebase config was explicitly injected 
  // into the HTML. If connected, we'd use Firebase Auth tokens to read custom claims (e.g., admin).
  
  useEffect(() => {
    // For demonstration, simulating an Admin user immediately
    setUser({ email: 'admin@proctorflow.dsce.edu', uid: 'admin123' });
    setRole('admin');
  }, []);

  const login = async (email, password) => {
    // Mock login
    setUser({ email, uid: 'mockuser' });
    setRole(email.includes('admin') ? 'admin' : 'faculty');
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const value = { user, role, login, logout, isAdmin: role === 'admin' };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

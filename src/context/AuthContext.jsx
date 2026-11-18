import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile,
  updatePassword, EmailAuthProvider, reauthenticateWithCredential, reload,
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, FIREBASE_CONFIGURED } from "../lib/firebase";

const AuthContext = createContext(null);
const INSTITUTION_ID = import.meta.env.VITE_INSTITUTION_ID || "dsce";

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [pendingAccount, setPendingAccount] = useState(false);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !auth || !db) {
      setAuthError("Firebase is not configured. Set VITE_FIREBASE_API_KEY and the Firebase web app settings.");
      setLoading(false);
      return;
    }
    let unsubscribeUser = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, current => {
      unsubscribeUser();
      setLoading(true);
      setAuthError(null);
      setAuthUser(current);
      if (!current) {
        setUser(null);
        setPendingAccount(false);
        setLoading(false);
        return;
      }
      const ref = doc(db, "institutions", INSTITUTION_ID, "users", current.uid);
      unsubscribeUser = onSnapshot(ref, snap => {
        const profile = snap.exists() ? snap.data() : null;
        if (profile && profile.status === "active" && ["admin", "faculty", "student"].includes(profile.role)) {
          setUser({
            ...profile, uid: current.uid,
            email: current.email,
            name: profile.name || current.displayName || current.email?.split("@")[0],
            institutionId: INSTITUTION_ID,
          });
          setPendingAccount(false);
        } else {
          setUser(null);
          setPendingAccount(true);
        }
        setLoading(false);
      }, error => {
        setUser(null);
        setPendingAccount(false);
        setAuthError("Unable to verify your institution membership: " + error.message);
        setLoading(false);
      });
    }, error => {
      setUser(null);
      setAuthError(error.message);
      setLoading(false);
    });
    return () => { unsubscribeUser(); unsubscribeAuth(); };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!FIREBASE_CONFIGURED || !auth) throw new Error("Firebase Authentication is not configured for this deployment.");
    setAuthError(null);
    return signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    if (!FIREBASE_CONFIGURED || !auth) throw new Error("Firebase Authentication is not configured.");
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name?.trim()) await updateProfile(credential.user, { displayName: name.trim() });
    await sendEmailVerification(credential.user);
    return credential;
  }, []);

  const requestAccess = useCallback(async (requestedRole = "student") => {
    if (!["student", "faculty"].includes(requestedRole)) throw new Error("Select Student or Faculty.");
    const current = auth?.currentUser;
    if (!current) throw new Error("Sign in before requesting access.");
    await reload(current);
    if (!current.emailVerified) throw new Error("Verify your email from your inbox, then sign in again before requesting access.");
    const ref = doc(db, "institutions", INSTITUTION_ID, "join_requests", current.uid);
    await setDoc(ref, {
      uid: current.uid,
      email: current.email,
      name: current.displayName || current.email.split("@")[0],
      requestedRole,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  }, []);

  // First admin must be provisioned using a trusted Firebase Admin SDK / console.
  // A public browser must never be allowed to self-assign the administrator role.
  const bootstrapAdmin = useCallback(async () => {
    throw new Error("Administrator provisioning requires a trusted server-side operation.");
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  const resetPassword = useCallback(async email => {
    if (!auth) throw new Error("Authentication unavailable.");
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const updateAccountProfile = useCallback(async ({ name, designation }) => {
    const current = auth?.currentUser;
    if (!current || !user) throw new Error("You must be signed in with an active account.");
    const updated = {};
    if (name?.trim()) {
      await updateProfile(current, { displayName: name.trim() });
      updated.name = name.trim();
    }
    if (designation) updated.designation = designation;
    if (Object.keys(updated).length) {
      await setDoc(doc(db, "institutions", INSTITUTION_ID, "users", current.uid), updated, { merge:true });
    }
  }, [user]);

  const changePassword = useCallback(async (newPassword, oldPassword) => {
    const current = auth?.currentUser;
    if (!current || !current.email) throw new Error("No signed-in user.");
    if (newPassword.length < 10) throw new Error("Use a password of at least 10 characters.");
    if (oldPassword) {
      await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, oldPassword));
    }
    await updatePassword(current, newPassword);
  }, []);

  const value = {
    user, authUser, loading, authError, pendingAccount,
    configured: FIREBASE_CONFIGURED,
    login, signUp, requestAccess, bootstrapAdmin, logout,
    resetPassword, updateAccountProfile, changePassword,
    isAdmin: user?.role === "admin",
    isStudent: user?.role === "student",
    isFaculty: user?.role === "faculty",
    institutionId: user ? INSTITUTION_ID : null,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

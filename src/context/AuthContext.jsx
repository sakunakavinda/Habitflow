import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/firebaseConfig';

const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  isConfigured: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  // Helper to ensure user document exists in users collection
  const syncUserProfile = async (firebaseUser, customName = null) => {
    if (!db || !firebaseUser) return null;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      const name = customName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

      if (!userSnap.exists()) {
        const initialData = {
          name,
          joinedAt: serverTimestamp()
        };
        await setDoc(userDocRef, initialData);

        // Also initialize default starter habits if this is a brand new user
        const habitsColRef = collection(db, 'users', firebaseUser.uid, 'habits');
        const habitsSnap = await getDocs(habitsColRef);
        if (habitsSnap.empty) {
          const defaultHabits = [
            { name: 'Smoke-Free', frequency: 'daily', color: '#10b981', icon: 'cigarette-off' },
            { name: 'Workout', frequency: 'daily', color: '#f59e0b', icon: 'dumbbell' }
          ];
          for (const habit of defaultHabits) {
            await addDoc(habitsColRef, {
              ...habit,
              createdAt: serverTimestamp()
            });
          }
        }
        return initialData;
      }
      return userSnap.data();
    } catch (err) {
      console.error('Error syncing user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await syncUserProfile(currentUser);
        setUserData(profile);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const signInWithEmail = async (email, password) => {
    if (!auth) throw new Error('Firebase Authentication is not configured yet.');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncUserProfile(cred.user);
    setUserData(profile);
    return cred.user;
  };

  const signUpWithEmail = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase Authentication is not configured yet.');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (e) {
        console.warn('Could not update profile name', e);
      }
    }
    const profile = await syncUserProfile(cred.user, displayName);
    setUserData(profile);
    return cred.user;
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase Authentication is not configured yet.');
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfile(cred.user);
    setUserData(profile);
    return cred.user;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

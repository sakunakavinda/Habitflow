import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithPopup
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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
  logout: async () => {},
  markAddToHomeSeen: async () => {},
  setJourneyStartDate: async () => {},
  markOnboardingComplete: async () => {},
  changePassword: async () => {},
  sendPasswordReset: async () => {},
  resetAccountData: async () => {},
  deleteAccount: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const pendingDisplayNameRef = useRef(null);
  const isConfigured = isFirebaseConfigured();

  // Helper to ensure user document exists in users collection
  const syncUserProfile = async (firebaseUser, customName = null) => {
    if (!db || !firebaseUser) return null;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      const trimmedCustom = customName && typeof customName === 'string' ? customName.trim() : null;
      const effectiveName =
        trimmedCustom ||
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'User';

      if (!userSnap.exists()) {
        const initialData = {
          name: effectiveName,
          joinedAt: serverTimestamp(),
          hasSeenAddToHome: false,
          hasSeenOnboarding: false,
          startDate: null
        };
        await setDoc(userDocRef, initialData);

        // Also initialize default starter habits if this is a brand new user
        const habitsColRef = collection(db, 'users', firebaseUser.uid, 'habits');
        const habitsSnap = await getDocs(habitsColRef);
        if (habitsSnap.empty) {
          const defaultHabits = [
            { name: 'Worked Out', frequency: 'daily', color: '#f59e0b', icon: 'dumbbell' }
          ];
          for (const habit of defaultHabits) {
            await addDoc(habitsColRef, {
              ...habit,
              createdAt: serverTimestamp()
            });
          }
        }
        return { ...initialData, isNewRegistration: true };
      }

      const data = userSnap.data();
      const emailPrefix = firebaseUser.email?.split('@')[0];
      const shouldUpdateName =
        (trimmedCustom && data.name !== trimmedCustom) ||
        (firebaseUser.displayName && data.name === emailPrefix && firebaseUser.displayName !== emailPrefix);

      if (shouldUpdateName) {
        const newName = trimmedCustom || firebaseUser.displayName;
        await updateDoc(userDocRef, { name: newName });
        data.name = newName;
      }

      const localCachedStart = localStorage.getItem(`habitwave_start_date_${firebaseUser.uid}`);
      if (!data.startDate && localCachedStart) {
        data.startDate = localCachedStart;
      }
      return data;
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
        const pendingName = pendingDisplayNameRef.current;
        const profile = await syncUserProfile(currentUser, pendingName);
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
    const trimmedName = displayName?.trim() || '';
    pendingDisplayNameRef.current = trimmedName || null;

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (trimmedName) {
      try {
        await updateProfile(cred.user, { displayName: trimmedName });
      } catch (e) {
        console.warn('Could not update profile name', e);
      }
    }
    const profile = await syncUserProfile(cred.user, trimmedName);
    setUserData(profile);
    setUser(cred.user);
    pendingDisplayNameRef.current = null;
    return cred.user;
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase Authentication is not configured yet.');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
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

  const markAddToHomeSeen = async () => {
    if (!user) return;
    try {
      localStorage.setItem(`habitwave_seen_pwa_guide_${user.uid}`, 'true');
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { hasSeenAddToHome: true });
      }
      setUserData(prev => prev ? { ...prev, hasSeenAddToHome: true, isNewRegistration: false } : prev);
    } catch (err) {
      console.error('Error updating hasSeenAddToHome:', err);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;
    try {
      localStorage.setItem(`habitwave_onboarding_done_${user.uid}`, 'true');
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { hasSeenOnboarding: true });
      }
      setUserData(prev => prev ? { ...prev, hasSeenOnboarding: true } : prev);
    } catch (err) {
      console.error('Error marking onboarding complete:', err);
      // Still update local state so UI doesn't loop
      setUserData(prev => prev ? { ...prev, hasSeenOnboarding: true } : prev);
    }
  };

  const setJourneyStartDate = async (startDateStr) => {
    if (!user) {
      localStorage.setItem('habitwave_guest_start_date', startDateStr);
      setUserData(prev => ({ ...(prev || {}), startDate: startDateStr }));
      return;
    }
    try {
      localStorage.setItem(`habitwave_start_date_${user.uid}`, startDateStr);
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { startDate: startDateStr });
      }
      setUserData(prev => prev ? { ...prev, startDate: startDateStr } : { startDate: startDateStr });
    } catch (err) {
      console.error('Error setting journey start date:', err);
      setUserData(prev => prev ? { ...prev, startDate: startDateStr } : { startDate: startDateStr });
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!auth || !auth.currentUser) throw new Error('No user is currently signed in.');
    const currentUser = auth.currentUser;
    const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');
    if (!isPasswordUser) {
      throw new Error('This account uses Google Sign-In. Password cannot be changed here.');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const sendPasswordReset = async () => {
    if (!auth || !auth.currentUser?.email) throw new Error('No user email found.');
    await sendPasswordResetEmail(auth, auth.currentUser.email);
  };

  const resetAccountData = async () => {
    if (!user || !db) throw new Error('Cannot reset account: user not authenticated.');
    const uid = user.uid;

    // 1. Delete all habit logs and habits in Firestore
    const habitsColRef = collection(db, 'users', uid, 'habits');
    const habitsSnap = await getDocs(habitsColRef);

    for (const habitDoc of habitsSnap.docs) {
      const logsColRef = collection(db, 'users', uid, 'habits', habitDoc.id, 'logs');
      const logsSnap = await getDocs(logsColRef);
      for (const logDoc of logsSnap.docs) {
        await deleteDoc(doc(db, 'users', uid, 'habits', habitDoc.id, 'logs', logDoc.id));
      }
      await deleteDoc(doc(db, 'users', uid, 'habits', habitDoc.id));
    }

    // 2. Reset user document fields
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      startDate: null,
      hasSeenOnboarding: false,
      hasSeenAddToHome: false
    });

    // 3. Clear user local caches
    const keysToRemove = [
      `habitwave_start_date_${uid}`,
      `habitwave_seeded_habits_${uid}`,
      `habitwave_onboarding_done_${uid}`,
      `habitwave_seen_pwa_guide_${uid}`,
      `habitwave_logs_${uid}`,
      `habitwave_custom_habits_${uid}`
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 4. Re-seed default starter habit ("Worked Out")
    await addDoc(habitsColRef, {
      name: 'Worked Out',
      frequency: 'daily',
      color: '#f59e0b',
      icon: 'dumbbell',
      createdAt: serverTimestamp()
    });

    // 5. Update local state
    setUserData(prev => ({
      ...(prev || {}),
      startDate: null,
      hasSeenOnboarding: false,
      hasSeenAddToHome: false
    }));
  };

  const deleteAccount = async (passwordForReauth = null) => {
    if (!auth || !auth.currentUser) throw new Error('No user is currently signed in.');
    const currentUser = auth.currentUser;
    const uid = currentUser.uid;

    // 1. Re-authenticate
    const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');
    if (isPasswordUser) {
      if (!passwordForReauth) {
        throw new Error('Please enter your current password to confirm account deletion.');
      }
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForReauth);
      await reauthenticateWithCredential(currentUser, credential);
    } else if (googleProvider) {
      await reauthenticateWithPopup(currentUser, googleProvider);
    }

    // 2. Delete all Firestore data for user
    if (db) {
      try {
        const habitsColRef = collection(db, 'users', uid, 'habits');
        const habitsSnap = await getDocs(habitsColRef);
        for (const habitDoc of habitsSnap.docs) {
          const logsColRef = collection(db, 'users', uid, 'habits', habitDoc.id, 'logs');
          const logsSnap = await getDocs(logsColRef);
          for (const logDoc of logsSnap.docs) {
            await deleteDoc(doc(db, 'users', uid, 'habits', habitDoc.id, 'logs', logDoc.id));
          }
          await deleteDoc(doc(db, 'users', uid, 'habits', habitDoc.id));
        }
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Error deleting user Firestore data:', err);
      }
    }

    // 3. Clear all user local storage
    Object.keys(localStorage).forEach(k => {
      if (k.includes(uid)) {
        localStorage.removeItem(k);
      }
    });

    // 4. Delete user account from Firebase Auth
    await deleteUser(currentUser);
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
        logout,
        markAddToHomeSeen,
        setJourneyStartDate,
        markOnboardingComplete,
        changePassword,
        sendPasswordReset,
        resetAccountData,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

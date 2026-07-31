// IMPROVEMENT: Memoized AuthContext with useCallback/useMemo, toast notifications, and profile management
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const splitName = (name = '') => {
  const normalized = String(name || '').trim();
  if (!normalized) return { firstName: '', lastName: '' };
  const parts = normalized.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const mapAuthError = useCallback((error) => {
    const code = error?.code || '';
    if (code === 'auth/unauthorized-domain') {
      return 'Sign-in is not available from this domain. Please add this domain to Firebase Auth settings.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked. Please enable popups and try again.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed before completing.';
    }
    return error?.message || 'Authentication failed. Please try again.';
  }, []);

  const buildUserState = useCallback((firebaseUser, extraData = {}) => {
    const sourceDisplayName = extraData.displayName || firebaseUser.displayName || '';
    const derived = splitName(sourceDisplayName);
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || extraData.email || '',
      displayName: sourceDisplayName,
      firstName: extraData.firstName || derived.firstName,
      lastName: extraData.lastName || derived.lastName,
      photoURL: firebaseUser.photoURL || extraData.photoURL || '',
      isAdmin: extraData.isAdmin || false,
      ...extraData
    };
  }, []);

  const upsertUserProfile = useCallback(async (firebaseUser, profileData = {}) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const existingDoc = await getDoc(userRef);
    const derived = splitName(profileData.displayName || firebaseUser.displayName || '');

    const payload = {
      email: firebaseUser.email || profileData.email || '',
      displayName: firebaseUser.displayName || profileData.displayName || '',
      firstName: profileData.firstName || derived.firstName || '',
      lastName: profileData.lastName || derived.lastName || '',
      photoURL: firebaseUser.photoURL || '',
      updatedAt: new Date().toISOString(),
      ...profileData
    };

    if (!existingDoc.exists()) {
      payload.createdAt = new Date().toISOString();
      payload.isAdmin = false;
    }

    await setDoc(userRef, payload, { merge: true });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const mergedUser = buildUserState(firebaseUser, userData);
            setUser(mergedUser);
          } else {
            await upsertUserProfile(firebaseUser);
            setUser(buildUserState(firebaseUser));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(buildUserState(firebaseUser));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [buildUserState, upsertUserProfile]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await upsertUserProfile(result.user);
      if (addToast) addToast(`Welcome back, ${result.user.displayName || 'User'}!`, 'success');
      return { success: true };
    } catch (error) {
      if (error?.code === 'auth/popup-blocked') {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError) {
          const msg = mapAuthError(redirectError);
          if (addToast) addToast(msg, 'error');
          return { success: false, error: msg };
        }
      }
      const msg = mapAuthError(error);
      if (addToast) addToast(msg, 'error');
      return { success: false, error: msg };
    }
  }, [addToast, mapAuthError, upsertUserProfile]);

  const updateProfile = useCallback(async (updatedData) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No user is logged in.' };
      }
      if (updatedData.displayName) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: updatedData.displayName });
      }
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...updatedData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setUser((prev) => ({ ...prev, ...updatedData }));
      if (addToast) addToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch {
      if (addToast) addToast('Unable to update profile right now.', 'error');
      return { success: false, error: 'Unable to update profile right now.' };
    }
  }, [addToast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      if (addToast) addToast('Signed out successfully.', 'info');
      return { success: true };
    } catch {
      if (addToast) addToast('Logout failed. Please try again.', 'error');
      return { success: false, error: 'Logout failed. Please try again.' };
    }
  }, [addToast]);

  const value = useMemo(() => ({
    user,
    loading,
    loginWithGoogle,
    logout,
    updateProfile
  }), [user, loading, loginWithGoogle, logout, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

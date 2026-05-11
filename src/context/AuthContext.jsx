import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const splitName = (name = '') => {
    const normalized = String(name || '').trim();
    if (!normalized) {
        return { firstName: '', lastName: '' };
    }
    const parts = normalized.split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
};

export const AuthProvider = ({ children }) => {
    const mapAuthError = useCallback((error) => {
        const code = error?.code || '';

        if (code === 'auth/unauthorized-domain') {
            return 'Sign-in is not available from this site. Please try again from the approved app domain.';
        }
        if (code === 'auth/popup-blocked') {
            return 'Sign-in popup was blocked. Allow popups and try again.';
        }
        if (code === 'auth/popup-closed-by-user') {
            return 'Sign-in was closed before completion.';
        }
        return 'Authentication failed. Please try again.';
    }, []);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const mergedUser = buildUserState(firebaseUser, userData);

                        // One-time backfill for legacy docs missing normalized fields
                        const needsBackfill = !userData.firstName || !userData.lastName || !userData.displayName || !userData.email;
                        if (needsBackfill) {
                            await setDoc(userRef, {
                                firstName: mergedUser.firstName || '',
                                lastName: mergedUser.lastName || '',
                                displayName: mergedUser.displayName || '',
                                email: mergedUser.email || '',
                                updatedAt: new Date().toISOString()
                            }, { merge: true });
                        }

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

    /** Sign in with Google (popup → redirect fallback) */
    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            await upsertUserProfile(result.user);
            return { success: true };
        } catch (error) {
            if (error?.code === 'auth/popup-blocked') {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithRedirect(auth, provider);
                    return { success: true };
                } catch (redirectError) {
                    return { success: false, error: mapAuthError(redirectError) };
                }
            }
            return { success: false, error: mapAuthError(error) };
        }
    };

    /** Update the current user's profile in both Firebase Auth and Firestore */
    const updateProfile = async (updatedData) => {
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
            return { success: true };
        } catch {
            return { success: false, error: 'Unable to update profile right now.' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            return { success: true };
        } catch {
            return { success: false, error: 'Logout failed. Please try again.' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithGoogle,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

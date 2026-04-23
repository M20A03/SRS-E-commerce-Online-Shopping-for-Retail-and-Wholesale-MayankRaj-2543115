import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
        const mapAuthError = (error) => {
            const code = error?.code || '';
            const origin = typeof window !== 'undefined' ? window.location.origin : '';

            if (code === 'auth/unauthorized-domain') {
                return `Google login blocked for this domain (${origin}). Add this exact domain under Firebase Authentication -> Settings -> Authorized domains, then retry.`;
            }

            if (code === 'auth/popup-blocked') {
                return 'Popup was blocked by browser. Allow popups for this site and try again.';
            }

            if (code === 'auth/popup-closed-by-user') {
                return 'Google sign-in popup was closed before completion.';
            }

            return error?.message || 'Authentication failed.';
        };

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

        const buildUserState = (firebaseUser, extraData = {}) => {
            const sourceDisplayName = extraData.displayName || firebaseUser.displayName || '';
            const derived = splitName(sourceDisplayName);

            return {
                id: firebaseUser.uid,
                email: firebaseUser.email || extraData.email || '',
                displayName: sourceDisplayName,
                firstName: extraData.firstName || derived.firstName,
                lastName: extraData.lastName || derived.lastName,
                phoneNumber: firebaseUser.phoneNumber || extraData.phoneNumber || '',
                ...extraData
            };
        };

    const upsertUserProfile = async (firebaseUser, profileData = {}) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const existingDoc = await getDoc(userRef);
            const derived = splitName(profileData.displayName || firebaseUser.displayName || '');

        const payload = {
            email: firebaseUser.email || profileData.email || '',
            displayName: firebaseUser.displayName || profileData.displayName || '',
                firstName: profileData.firstName || derived.firstName || '',
                lastName: profileData.lastName || derived.lastName || '',
            phoneNumber: firebaseUser.phoneNumber || profileData.phoneNumber || '',
            updatedAt: new Date().toISOString(),
            ...profileData
        };

        if (!existingDoc.exists()) {
            payload.createdAt = new Date().toISOString();
            payload.isAdmin = false;
        }

        await setDoc(userRef, payload, { merge: true });
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const mergedUser = buildUserState(firebaseUser, userData);

                        // One-time migration for legacy user docs missing normalized profile fields.
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
                        // Important for redirect-based Google sign-in: ensure profile doc exists.
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
    }, []);

    const register = async (email, password, displayName) => {
        try {
            // Create user in Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const derived = splitName(displayName || '');

            // Update profile with display name
            if (displayName) {
                await firebaseUpdateProfile(result.user, { displayName });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email,
                displayName: displayName || '',
                firstName: derived.firstName,
                lastName: derived.lastName,
                isAdmin: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

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

    const sendPhoneOtp = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
        try {
            if (typeof window === 'undefined') {
                return { success: false, error: 'Phone OTP is only available in browser context.' };
            }

            if (!phoneNumber || !phoneNumber.trim()) {
                return { success: false, error: 'Please enter a valid phone number in +91XXXXXXXXXX format.' };
            }

            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
                size: 'invisible'
            });

            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber.trim(), window.recaptchaVerifier);
            return { success: true, confirmationResult };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyPhoneOtp = async (confirmationResult, otp, profileData = {}) => {
        try {
            if (!confirmationResult) {
                return { success: false, error: 'OTP session expired. Please request a new OTP.' };
            }

            if (!otp || otp.trim().length < 6) {
                return { success: false, error: 'Please enter the 6-digit OTP.' };
            }

            const result = await confirmationResult.confirm(otp.trim());
            await upsertUserProfile(result.user, profileData);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            if (!auth.currentUser) {
                return { success: false, error: 'No user logged in' };
            }

            // Update auth profile if displayName is being updated
            if (updatedData.displayName) {
                await firebaseUpdateProfile(auth.currentUser, {
                    displayName: updatedData.displayName
                });
            }

            // Update Firestore document
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                ...updatedData,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Update local state
            setUser(prev => ({
                ...prev,
                ...updatedData
            }));

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            loginWithGoogle,
            sendPhoneOtp,
            verifyPhoneOtp,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

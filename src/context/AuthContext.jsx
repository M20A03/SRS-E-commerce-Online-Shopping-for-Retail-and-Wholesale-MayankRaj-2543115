import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile,
    sendEmailVerification,
    sendSignInLinkToEmail
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

            await sendEmailVerification(result.user);

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

    // Email OTP utilities (no-reply email)
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
    const EMAIL_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

    const sendEmailOtp = async (email) => {
        try {
            if (!email) {
                return { success: false, error: 'Email is required' };
            }
            const otp = generateOtp();
            const expiry = Date.now() + EMAIL_OTP_TTL_MS;
            // Store OTP in localStorage (simple demo; in production use Firestore + Cloud Function)
            const store = JSON.parse(localStorage.getItem('email_otps') || '{}');
            store[email] = { otp, expiry };
            localStorage.setItem('email_otps', JSON.stringify(store));
            // Send email via Firebase's sendSignInLinkToEmail as a no-reply OTP email
            // Using a custom action code settings which points to a dummy URL (will not be clicked)
            const actionCodeSettings = {
                url: window.location.origin,
                handleCodeInApp: true
            };
            await auth.sendSignInLinkToEmail(email, actionCodeSettings);
            // Note: In a real app, you'd send the OTP via a Cloud Function email service.
            console.log('📧 Email OTP sent (simulated) to', email, 'code', otp);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyEmailOtp = async (email, otp) => {
        try {
            if (!email || !otp) {
                return { success: false, error: 'Email and OTP are required' };
            }
            const store = JSON.parse(localStorage.getItem('email_otps') || '{}');
            const record = store[email];
            if (!record) {
                return { success: false, error: 'No OTP request found for this email' };
            }
            if (Date.now() > record.expiry) {
                delete store[email];
                localStorage.setItem('email_otps', JSON.stringify(store));
                return { success: false, error: 'OTP expired' };
            }
            if (record.otp !== otp) {
                return { success: false, error: 'Invalid OTP' };
            }
            // OTP is valid – sign in anonymously and upsert profile
            const result = await signInWithEmailAndPassword(auth, email, otp); // using OTP as password placeholder
            await upsertUserProfile(result.user);
            // Cleanup
            delete store[email];
            localStorage.setItem('email_otps', JSON.stringify(store));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Export only needed functions (remove phone OTP)


    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (!auth.currentUser.emailVerified) {
                await signOut(auth);
                return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
            }
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
            sendEmailOtp,
            verifyEmailOtp,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

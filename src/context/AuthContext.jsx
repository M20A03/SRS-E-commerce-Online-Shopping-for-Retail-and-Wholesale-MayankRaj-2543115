import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            ...userDoc.data()
                        });
                    } else {
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName
                    });
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

            // Update profile with display name
            if (displayName) {
                await firebaseUpdateProfile(result.user, { displayName });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email,
                displayName: displayName || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

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
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

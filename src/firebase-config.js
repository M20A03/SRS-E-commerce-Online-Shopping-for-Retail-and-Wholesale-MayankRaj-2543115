import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCSqLi9Iu3CeYOfNH7yPCX32LTyXUR-MBQ",
  authDomain: "react4-eb851.firebaseapp.com",
  projectId: "react4-eb851",
  storageBucket: "react4-eb851.firebasestorage.app",
  messagingSenderId: "438069281435",
  appId: "1:438069281435:web:cfd2d4e5ae3c1706d0fc3e",
  measurementId: "G-G6VQK5EBKX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
export const appCheck = recaptchaSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    })
  : null;

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

export default app;

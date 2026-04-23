import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCSqLi9Iu3CeYOfNH7yPCX32LTyXUR-MBQ',
  authDomain: 'react4-eb851.firebaseapp.com',
  projectId: 'react4-eb851',
  storageBucket: 'react4-eb851.firebasestorage.app',
  messagingSenderId: '438069281435',
  appId: '1:438069281435:web:cfd2d4e5ae3c1706d0fc3e',
  measurementId: 'G-G6VQK5EBKX'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAaNj4Pxy_Cmd-80O-_SaCPPzn9JrTkQZg',
  authDomain: 'obrastrack.firebaseapp.com',
  projectId: 'obrastrack',
  storageBucket: 'obrastrack.firebasestorage.app',
  messagingSenderId: '8640583693',
  appId: '1:8640583693:web:e8f4ac39c3d3345ac29d44',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

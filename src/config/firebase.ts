import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAaNj4Pxy_Cmd-80O-_SaCPPzn9JrTkQZg',
  authDomain: 'obrastrack.firebaseapp.com',
  projectId: 'obrastrack',
  storageBucket: 'obrastrack.firebasestorage.app',
  messagingSenderId: '8640583693',
  appId: '1:8640583693:web:e8f4ac39c3d3345ac29d44',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

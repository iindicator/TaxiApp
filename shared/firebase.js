// shared/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  //  Replace with your Firebase project's API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase project's auth domain
  projectId: "YOUR_PROJECT_ID",   // Replace with your Firebase project's ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase project's storage bucket (if used)
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase project's messaging sender ID
  appId: "YOUR_APP_ID"        // Replace with your Firebase project's application ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

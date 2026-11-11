// lib/firebaseAdmin.js
import admin from 'firebase-admin';

// ✅ Check if we're on server side
const isServer = typeof window === 'undefined';

if (isServer && !admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('Firebase Admin credentials not found');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// ✅ Export with null check for client side
export const auth = (typeof window === 'undefined' && admin.apps.length) ? admin.auth() : null;
export const db = (typeof window === 'undefined' && admin.apps.length) ? admin.firestore() : null;
export default admin;
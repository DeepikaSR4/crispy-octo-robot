import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use experimentalForceLongPolling to avoid WebSocket issues in Next.js
// server-side API routes (prevents 'unavailable' connection errors)
let db: ReturnType<typeof getFirestore>;
try {
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
    // initializeFirestore throws if already initialized – fall back to getFirestore
    db = getFirestore(app);
}

export { db };

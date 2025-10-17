
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}'
);

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app as firebaseApp };

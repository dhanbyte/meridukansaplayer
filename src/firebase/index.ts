
import { getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';

function initializeFirebase() {
  const apps = getApps();
  // firebaseApp is already initialized in config.ts, so we can just return it.
  // The check for existing apps is a good practice but redundant here as config.ts handles it.
  const app = apps.length > 0 ? apps[0] : firebaseApp;
  return { firebaseApp: app };
}

export { initializeFirebase };
export * from './provider';

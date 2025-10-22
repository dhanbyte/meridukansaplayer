'use client';
import { getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';

function initializeFirebase() {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : firebaseApp;
  return { firebaseApp: app };
}

export { initializeFirebase };
export * from './provider';
export * from './use-collection';
export * from './use-doc';
export * from './use-user';

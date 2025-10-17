
'use client';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp } = useMemo(() => initializeFirebase(), []);
  const auth = useMemo(() => getAuth(firebaseApp), [firebaseApp]);
  const firestore = useMemo(() => getFirestore(firebaseApp), [firebaseApp]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

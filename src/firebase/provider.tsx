
'use client';
import {
  useContext,
  createContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => {
  return useFirebase().firebaseApp;
};

export const useFirestore = () => {
  return useFirebase().firestore;
};

export const useAuth = () => {
  return useFirebase().auth;
};

export interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp,
        auth,
        firestore,
        loading: false,
        setLoading: () => {},
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

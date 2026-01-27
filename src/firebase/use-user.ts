"use client";
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth, useFirestore } from './provider';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'partner' | 'customer';
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authUser: User | null) => {
        if (authUser) {
          const userDocRef = doc(firestore, 'users', authUser.uid);
          
          const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                ...docSnap.data(),
              } as UserProfile);
            } else {
               setUser({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
              });
            }
             setLoading(false);
          }, (err) => {
              console.error("Error fetching user document:", err);
              setError(err);
              setLoading(false);
          });
          
          return () => unsubscribeSnapshot();
          
        } else {
          setUser(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Auth state change error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading, error };
};

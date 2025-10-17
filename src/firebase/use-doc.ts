"use client";
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from './provider';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';

// A utility hook to memoize the document reference object.
const useMemoDocRef = (path: string | null) => {
  const firestore = useFirestore();
  return useMemo(() => {
    if (!firestore || !path) return null;
    return doc(firestore, path);
  }, [firestore, path]);
};


export const useDoc = <T extends DocumentData>(
  path: string | null,
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const docRef = useMemoDocRef(path);


  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return
    };

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
};

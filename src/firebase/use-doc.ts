"use client";
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
      setData(null);
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
        const permissionError = new FirestorePermissionError({
          path: path || 'unknown path',
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, path]);

  return { data, loading, error };
};

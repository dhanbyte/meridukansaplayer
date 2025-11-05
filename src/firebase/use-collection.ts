"use client";
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
  collectionGroup,
  where,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// A utility hook to memoize the query object.
// This is important to prevent re-renders from causing infinite loops.
const useMemoQuery = (queryString: string | null, ...queryConstraints: any[]) => {
  const firestore = useFirestore();
  return useMemo(() => {
    if (!firestore || !queryString) return null;
    
    const validConstraints = queryConstraints.filter(Boolean); // Filter out any undefined/null constraints

    let q: Query<DocumentData>;
    if (validConstraints.some(c => c && c._type === 'collectionGroup')) {
        const collectionId = validConstraints.find(c => c && c._type === 'collectionGroup')._collectionId;
        const constraints = validConstraints.filter(c => c && c._type !== 'collectionGroup');
        q = query(collectionGroup(firestore, collectionId), ...constraints);
    } else {
        q = query(collection(firestore, queryString), ...validConstraints);
    }
    return q;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, queryString, ...queryConstraints.map(c => c ? c.toString() : '')]); // Simple dependency check
};

export const useCollection = <T extends DocumentData>(
  path: string | null,
  ...queryConstraints: any[]
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const q = useMemoQuery(path, ...queryConstraints);

  useEffect(() => {
    if (!q) {
        setLoading(false);
        setData([]);
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(documents);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: path || 'unknown path',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q, path]);

  return { data, loading, error };
};

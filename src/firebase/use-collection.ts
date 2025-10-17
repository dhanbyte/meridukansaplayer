"use client";
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from './provider';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
  collectionGroup,
  where,
} from 'firebase/firestore';

// A utility hook to memoize the query object.
// This is important to prevent re-renders from causing infinite loops.
const useMemoQuery = (queryString: string | null, ...queryConstraints: any[]) => {
  const firestore = useFirestore();
  return useMemo(() => {
    if (!firestore || !queryString) return null;
    let q: Query<DocumentData>;
    if (queryConstraints.some(c => c.type === 'collectionGroup')) {
        const collectionId = queryConstraints.find(c => c.type === 'collectionGroup').collectionId;
        const constraints = queryConstraints.filter(c => c.type !== 'collectionGroup');
        q = query(collectionGroup(firestore, collectionId), ...constraints);
    } else {
        q = query(collection(firestore, queryString), ...queryConstraints);
    }
    return q;
  }, [firestore, queryString, ...queryConstraints.map(c => c.toString())]); // Simple dependency check
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
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
};

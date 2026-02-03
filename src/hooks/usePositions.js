import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export function usePositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'positions'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPositions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addPosition = async (name, headline = '') => {
    await addDoc(collection(db, 'positions'), { name, headline: headline || '', skillIds: [] });
  };

  const updatePosition = async (id, updates) => {
    await updateDoc(doc(db, 'positions', id), updates);
  };

  const deletePosition = async (id) => {
    await deleteDoc(doc(db, 'positions', id));
  };

  return { positions, loading, addPosition, updatePosition, deletePosition };
}
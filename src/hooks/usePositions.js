import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export function usePositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'positions'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by displayOrder (ascending), defaulting to 0 for missing values
      data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setPositions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addPosition = async (name, headline = '', displayOrder = 0) => {
    await addDoc(collection(db, 'positions'), { name, headline: headline || '', skillIds: [], exampleWorkIds: [], displayOrder });
  };

  const updatePosition = async (id, updates) => {
    await updateDoc(doc(db, 'positions', id), updates);
  };

  const deletePosition = async (id) => {
    await deleteDoc(doc(db, 'positions', id));
  };

  return { positions, loading, addPosition, updatePosition, deletePosition };
}
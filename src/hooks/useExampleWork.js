import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

export function useExampleWork() {
  const [exampleWork, setExampleWork] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'exampleWork'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by displayOrder (ascending), defaulting to 0 for missing values
      data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setExampleWork(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addExampleWork = async (workData) => {
    await addDoc(collection(db, 'exampleWork'), { ...workData, roleIds: [], displayOrder: workData.displayOrder ?? 0 });
  };

  const updateExampleWork = async (id, updates) => {
    await updateDoc(doc(db, 'exampleWork', id), updates);
  };

  const deleteExampleWork = async (id) => {
    await deleteDoc(doc(db, 'exampleWork', id));
  };

  const assignWorkToPosition = async (positionId, workId) => {
    await updateDoc(doc(db, 'positions', positionId), {
      exampleWorkIds: arrayUnion(workId)
    });
  };

  const removeWorkFromPosition = async (positionId, workId) => {
    await updateDoc(doc(db, 'positions', positionId), {
      exampleWorkIds: arrayRemove(workId)
    });
  };

  return {
    exampleWork,
    loading,
    addExampleWork,
    updateExampleWork,
    deleteExampleWork,
    assignWorkToPosition,
    removeWorkFromPosition
  };
}

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

export function useSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'skills'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSkills(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addSkill = async (skillData) => {
    await addDoc(collection(db, 'skills'), { ...skillData, media: [] });
  };

  const updateSkill = async (id, updates) => {
    await updateDoc(doc(db, 'skills', id), updates);
  };

  const deleteSkill = async (id) => {
    await deleteDoc(doc(db, 'skills', id));
  };

  const addMediaToSkill = async (skillId, mediaItem) => {
    await updateDoc(doc(db, 'skills', skillId), {
      media: arrayUnion(mediaItem)
    });
  };

  const assignSkillToPosition = async (positionId, skillId) => {
    await updateDoc(doc(db, 'positions', positionId), {
      skillIds: arrayUnion(skillId)
    });
  };

  const removeSkillFromPosition = async (positionId, skillId) => {
    await updateDoc(doc(db, 'positions', positionId), {
      skillIds: arrayRemove(skillId)
    });
  };

  return {
    skills,
    loading,
    addSkill,
    updateSkill,
    deleteSkill,
    addMediaToSkill,
    assignSkillToPosition,
    removeSkillFromPosition
  };
}
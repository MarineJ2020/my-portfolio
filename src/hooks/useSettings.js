import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useSettings() {
  const [settings, setSettings] = useState({
    name: 'Your Name',
    profilePic: '',
    bgColor: '#0f172a',
    footerText: '© 2024 Portfolio'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });
    return unsub;
  }, []);

  const updateSettings = async (newSettings) => {
    await setDoc(doc(db, 'settings', 'global'), newSettings, { merge: true });
  };

  return { settings, updateSettings };
}
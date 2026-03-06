import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useSettings() {
  const [settings, setSettings] = useState({
    name: 'Your Name',
    profilePic: '',
    profileSize: 140,
    fontSizeHead: 2.2,
    fontSizeBody: 1,
    tagline: '',
    roleCardSize: 160,
    skillCardSize: 220,
    // separate background colors for day/night
    lightBg: '#f8fafc',
    darkBg: '#0f172a',
    // animations
    animEnabled: true,
    lightAnimColor: '#e2e8f0',
    darkAnimColor: '#f8fafc',
    // footer links (array of { text, url })
    footerLinks: [],
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
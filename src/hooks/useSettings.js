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
    // Location + contact
    mapQuery: 'New York, NY',
    contactEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
    // optional background graphic overlay
    siteGraphicUrl: '',
    siteGraphicOpacity: 0.15,
    // separate background colors for day/night
    lightBg: '#f8fafc',
    darkBg: '#0f172a',
    // animations / background particles
    animEnabled: true,
    lightAnimColor: '#e2e8f0',
    darkAnimColor: '#f8fafc',
    // background tuning (used by parallax dots)
    bgDensity: 50,      // 0–100 (maps to spacing)
    bgDotSize: 1.5,     // px
    bgOpacity: 0.55,    // 0–1
    bgSpeed: 45,        // base seconds for near layer
    // advanced particle options (for future engines / presets)
    bgShapeType: 'circle',   // circle | triangle | polygon | star | char | image
    bgShapeChar: '●',
    bgMoveEnabled: true,
    bgMoveSpeed: 1.0,        // abstract 0.4–6.0
    bgMoveDirection: 'none', // none | top | bottom | left | right
    bgMoveRandom: true,
    bgMoveStraight: false,
    bgMoveOutMode: 'out',    // out | bounce
    bgLinksEnabled: false,
    bgLinksDistance: 120,
    bgLinksOpacity: 0.3,
    bgLinksWidth: 1,
    bgLinksColorMode: 'match', // match | random
    bgHoverMode: 'none',     // none | grab | bubble
    bgClickMode: 'none',     // none | push | remove | repulse | bubble
    bgTrailEnabled: false,
    bgTrailLength: 8,
    bgTrailOpacity: 0.25,
    bgZLayers: 24,
    // footer links (array of { text, url })
    footerLinks: [],
    // layout configuration (order / visibility / animation)
    layout: [
      { id: 'hero', label: 'Hero', enabled: true, animation: 'fade' },
      { id: 'roles', label: 'Roles', enabled: true, animation: 'slide' },
      { id: 'skills', label: 'Skills', enabled: true, animation: 'zoom' },
      { id: 'work', label: 'Example Work', enabled: true, animation: 'fade' },
      { id: 'map', label: 'Where am I staying', enabled: true, animation: 'slide' },
      { id: 'contact', label: 'Contact', enabled: true, animation: 'fade' },
      { id: 'footer', label: 'Footer', enabled: true, animation: 'fade' },
    ],
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
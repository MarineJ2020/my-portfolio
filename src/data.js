// src/data.js
export const loadData = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export let positions = loadData('positions', []);
export let skills = loadData('skills', []);

// Example seed data (remove after testing)
if (positions.length === 0) {
  positions = [
    { id: '1', name: 'Frontend Developer', skillIds: ['s1', 's2'] },
    { id: '2', name: 'Backend Developer', skillIds: ['s3'] },
  ];
  saveData('positions', positions);
}

if (skills.length === 0) {
  skills = [
    { id: 's1', name: 'React', media: [{ type: 'image', url: 'https://example.com/react-logo.png' }], description: 'Build UIs with components.' },
    { id: 's2', name: 'Vite', media: [{ type: 'video', url: 'https://example.com/vite-demo.mp4' }], description: 'Fast dev server.' },
    { id: 's3', name: 'Node.js', media: [], description: 'Server-side JS.' },
  ];
  saveData('skills', skills);
}
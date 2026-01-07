// src/AdminPanel.jsx
import { useState } from 'react';
import { positions, skills, saveData } from './data';

function AdminPanel() {
  const [posList, setPosList] = useState(positions);
  const [skillList, setSkillList] = useState(skills);
  const [newPosName, setNewPosName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [editingPosId, setEditingPosId] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [assignPosId, setAssignPosId] = useState('');
  const [assignSkillId, setAssignSkillId] = useState('');

  const saveAndUpdate = (newPos, newSkills) => {
    saveData('positions', newPos);
    saveData('skills', newSkills);
    setPosList(newPos);
    setSkillList(newSkills);
  };

  // Positions CRUD
  const addPosition = () => {
    if (!newPosName) return;
    const newId = Date.now().toString();
    const newPos = [...posList, { id: newId, name: newPosName, skillIds: [] }];
    saveAndUpdate(newPos, skillList);
    setNewPosName('');
  };

  const deletePosition = (id) => {
    const newPos = posList.filter(p => p.id !== id);
    saveAndUpdate(newPos, skillList);
  };

  const startEditPos = (pos) => {
    setEditingPosId(pos.id);
    setNewPosName(pos.name);
  };

  const updatePosition = () => {
    const newPos = posList.map(p => p.id === editingPosId ? { ...p, name: newPosName } : p);
    saveAndUpdate(newPos, skillList);
    setEditingPosId(null);
    setNewPosName('');
  };

  // Skills CRUD (similar, plus media)
  const addSkill = () => {
    if (!newSkillName) return;
    const newId = 's' + Date.now();
    const newSkills = [...skillList, { id: newId, name: newSkillName, media: [], description: newSkillDesc }];
    saveAndUpdate(posList, newSkills);
    setNewSkillName(''); setNewSkillDesc('');
  };

  const deleteSkill = (id) => {
    const newSkills = skillList.filter(s => s.id !== id);
    const newPos = posList.map(p => ({ ...p, skillIds: p.skillIds.filter(sid => sid !== id) }));
    saveAndUpdate(newPos, newSkills);
  };

  const startEditSkill = (skill) => {
    setEditingSkillId(skill.id);
    setNewSkillName(skill.name);
    setNewSkillDesc(skill.description);
  };

  const updateSkill = () => {
    const newSkills = skillList.map(s => s.id === editingSkillId ? { ...s, name: newSkillName, description: newSkillDesc } : s);
    saveAndUpdate(posList, newSkills);
    setEditingSkillId(null);
    setNewSkillName(''); setNewSkillDesc('');
  };

  const addMediaToSkill = (skillId) => {
    if (!newMediaUrl) return;
    const newSkills = skillList.map(s => {
      if (s.id === skillId) {
        return { ...s, media: [...s.media, { type: newMediaType, url: newMediaUrl }] };
      }
      return s;
    });
    saveAndUpdate(posList, newSkills);
    setNewMediaUrl('');
  };

  // Assign skill to position
  const assignSkill = () => {
    if (!assignPosId || !assignSkillId) return;
    const newPos = posList.map(p => {
      if (p.id === assignPosId && !p.skillIds.includes(assignSkillId)) {
        return { ...p, skillIds: [...p.skillIds, assignSkillId] };
      }
      return p;
    });
    saveAndUpdate(newPos, skillList);
  };

  const removeSkillFromPos = (posId, skillId) => {
    const newPos = posList.map(p => {
      if (p.id === posId) {
        return { ...p, skillIds: p.skillIds.filter(sid => sid !== skillId) };
      }
      return p;
    });
    saveAndUpdate(newPos, skillList);
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      {/* Manage Positions */}
      <section>
        <h3>Positions</h3>
        <input value={newPosName} onChange={e => setNewPosName(e.target.value)} placeholder="New Position Name" />
        <button onClick={editingPosId ? updatePosition : addPosition}>{editingPosId ? 'Update' : 'Add'}</button>
        <ul>
          {posList.map(pos => (
            <li key={pos.id}>
              {pos.name}
              <button onClick={() => startEditPos(pos)}>Edit</button>
              <button onClick={() => deletePosition(pos.id)}>Delete</button>
              {/* Show assigned skills */}
              <ul>
                {pos.skillIds.map(sid => {
                  const skill = skillList.find(s => s.id === sid);
                  return skill ? (
                    <li key={sid}>{skill.name} <button onClick={() => removeSkillFromPos(pos.id, sid)}>Remove</button></li>
                  ) : null;
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Manage Skills */}
      <section>
        <h3>Skills</h3>
        <input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="New Skill Name" />
        <textarea value={newSkillDesc} onChange={e => setNewSkillDesc(e.target.value)} placeholder="Description" />
        <button onClick={editingSkillId ? updateSkill : addSkill}>{editingSkillId ? 'Update' : 'Add'}</button>
        <ul>
          {skillList.map(skill => (
            <li key={skill.id}>
              {skill.name} - {skill.description}
              <button onClick={() => startEditSkill(skill)}>Edit</button>
              <button onClick={() => deleteSkill(skill.id)}>Delete</button>
              {/* Add Media */}
              <div>
                <select value={newMediaType} onChange={e => setNewMediaType(e.target.value)}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} placeholder="Media URL" />
                <button onClick={() => addMediaToSkill(skill.id)}>Add Media</button>
              </div>
              {/* Show media */}
              <ul>
                {skill.media.map((m, idx) => <li key={idx}>{m.type}: {m.url}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Assign Skills to Positions */}
      <section>
        <h3>Assign Skill to Position</h3>
        <select value={assignPosId} onChange={e => setAssignPosId(e.target.value)}>
          <option value="">Select Position</option>
          {posList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={assignSkillId} onChange={e => setAssignSkillId(e.target.value)}>
          <option value="">Select Skill</option>
          {skillList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={assignSkill}>Assign</button>
      </section>
    </div>
  );
}

export default AdminPanel;
/* eslint-disable react/react-in-jsx-scope */
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AdminPanel() {
  const { user } = useContext(AuthContext);
  const { positions, addPosition, updatePosition, deletePosition } = usePositions();
  const {
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    addMediaToSkill,
    assignSkillToPosition,
    removeSkillFromPosition,
  } = useSkills();

  // Position form state
  const [newPosName, setNewPosName] = useState('');
  const [editingPosId, setEditingPosId] = useState(null);

  // Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);

  // Media upload state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [targetSkillId, setTargetSkillId] = useState('');

  // Assignment state
  const [assignPosId, setAssignPosId] = useState('');
  const [assignSkillId, setAssignSkillId] = useState('');

  const handleAddOrUpdatePosition = async () => {
    if (!newPosName.trim()) return;
    if (editingPosId) {
      await updatePosition(editingPosId, { name: newPosName });
      setEditingPosId(null);
    } else {
      await addPosition(newPosName);
    }
    setNewPosName('');
  };

  const handleEditPosition = (pos) => {
    setNewPosName(pos.name);
    setEditingPosId(pos.id);
  };

  const handleAddOrUpdateSkill = async () => {
    if (!newSkillName.trim()) return;
    const skillData = { name: newSkillName, description: newSkillDesc };
    if (editingSkillId) {
      await updateSkill(editingSkillId, skillData);
      setEditingSkillId(null);
    } else {
      await addSkill(skillData);
    }
    setNewSkillName('');
    setNewSkillDesc('');
  };

  const handleEditSkill = (skill) => {
    setNewSkillName(skill.name);
    setNewSkillDesc(skill.description || '');
    setEditingSkillId(skill.id);
  };

  const handleUploadMedia = async () => {
    if (!mediaFile || !targetSkillId) return;

    const storageRef = ref(storage, `media/${Date.now()}_${mediaFile.name}`);
    await uploadBytes(storageRef, mediaFile);
    const url = await getDownloadURL(storageRef);

    await addMediaToSkill(targetSkillId, { type: mediaType, url });
    setMediaFile(null);
    setTargetSkillId('');
  };

  const handleAssignSkill = async () => {
    if (assignPosId && assignSkillId) {
      await assignSkillToPosition(assignPosId, assignSkillId);
      setAssignPosId('');
      setAssignSkillId('');
    }
  };

  if (!user) return <p>Access denied. Please log in.</p>;

  return (
    <div className="admin-panel" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Admin Panel</h2>

      {/* Positions Section */}
      <section style={{ marginBottom: '40px' }}>
        <h3>Manage Positions</h3>
        <div>
          <input
            value={newPosName}
            onChange={(e) => setNewPosName(e.target.value)}
            placeholder="Position name"
          />
          <button onClick={handleAddOrUpdatePosition}>
            {editingPosId ? 'Update' : 'Add'} Position
          </button>
        </div>
        <ul>
          {positions.map((pos) => (
            <li key={pos.id}>
              {pos.name}
              <button onClick={() => handleEditPosition(pos)}>Edit</button>
              <button onClick={() => deletePosition(pos.id)}>Delete</button>
              <ul>
                {pos.skillIds?.map((sid) => {
                  const sk = skills.find((s) => s.id === sid);
                  return sk ? (
                    <li key={sid}>
                      {sk.name}{' '}
                      <button onClick={() => removeSkillFromPosition(pos.id, sid)}>
                        Remove
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Skills Section */}
      <section style={{ marginBottom: '40px' }}>
        <h3>Manage Skills</h3>
        <div>
          <input
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name"
          />
          <textarea
            value={newSkillDesc}
            onChange={(e) => setNewSkillDesc(e.target.value)}
            placeholder="Description"
          />
          <button onClick={handleAddOrUpdateSkill}>
            {editingSkillId ? 'Update' : 'Add'} Skill
          </button>
        </div>
        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              <strong>{skill.name}</strong> - {skill.description || 'No description'}
              <button onClick={() => handleEditSkill(skill)}>Edit</button>
              <button onClick={() => deleteSkill(skill.id)}>Delete</button>

              {/* Media Upload for this skill */}
              <div style={{ marginTop: '10px' }}>
                <select onChange={(e) => setMediaType(e.target.value)} value={mediaType}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFile(e.target.files[0])}
                />
                <button
                  onClick={() => {
                    setTargetSkillId(skill.id);
                    handleUploadMedia();
                  }}
                  disabled={!mediaFile}
                >
                  Upload to this skill
                </button>
              </div>

              {/* Existing media */}
              <ul>
                {skill.media?.map((m, idx) => (
                  <li key={idx}>
                    {m.type}: {m.url}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Assign Skills to Positions */}
      <section>
        <h3>Assign Skill to Position</h3>
        <select value={assignPosId} onChange={(e) => setAssignPosId(e.target.value)}>
          <option value="">Select Position</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={assignSkillId} onChange={(e) => setAssignSkillId(e.target.value)}>
          <option value="">Select Skill</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={handleAssignSkill} disabled={!assignPosId || !assignSkillId}>
          Assign
        </button>
      </section>
    </div>
  );
}

export default AdminPanel;
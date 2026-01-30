
/* eslint-disable react/react-in-jsx-scope */
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { useSettings } from './hooks/useSettings'; // You will need to create this hook


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
  
  // --- New Settings Hook ---
  const { settings, updateSettings } = useSettings();

  // --- State Management ---
  const [newPosName, setNewPosName] = useState('');
  const [editingPosId, setEditingPosId] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [targetSkillId, setTargetSkillId] = useState('');
  const [assignPosId, setAssignPosId] = useState('');
  const [assignSkillId, setAssignSkillId] = useState('');

  // --- New Local State for Site Settings ---
  const [siteName, setSiteName] = useState('');
  const [siteBgColor, setSiteBgColor] = useState('#0f172a');
  const [siteFooter, setSiteFooter] = useState('');

  // Sync local state when settings load from Firebase
  useEffect(() => {
    if (settings) {
      setSiteName(settings.name || '');
      setSiteBgColor(settings.bgColor || '#0f172a');
      setSiteFooter(settings.footerText || '');
    }
  }, [settings]);

  // --- Handlers ---
  const handleSaveGlobalSettings = async () => {
    await updateSettings({
      name: siteName,
      bgColor: siteBgColor,
      footerText: siteFooter
    });
    alert("Site configuration saved!");
  };

const handleProfilePicUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'portfolio_uploads'); // The preset you created

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/j-portfolio/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    
    // data.secure_url is the permanent link
    await updateSettings({ profilePic: data.secure_url });
    alert("Profile picture updated via Cloudinary!");
  } catch (err) {
    console.error("Upload failed", err);
  }
};

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

  const formData = new FormData();
  formData.append('file', mediaFile);
  formData.append('upload_preset', 'portfolio_uploads');

  try {
    // Cloudinary handles both images and videos at this endpoint
    const resourceType = mediaType === 'video' ? 'video' : 'image';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/j-portfolio/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    
    await addMediaToSkill(targetSkillId, { type: mediaType, url: data.secure_url });
    setMediaFile(null);
    setTargetSkillId('');
    alert("Media uploaded successfully!");
  } catch (err) {
    console.error("Cloudinary error:", err);
  }
};

  const handleAssignSkill = async () => {
    if (assignPosId && assignSkillId) {
      await assignSkillToPosition(assignPosId, assignSkillId);
      setAssignPosId('');
      setAssignSkillId('');
    }
  };

  if (!user) return <div className="container" style={{paddingTop: '100px', textAlign:'center'}}>Access denied. Please log in.</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <span style={{ color: 'var(--text-muted)' }}>Logged in as {user.email}</span>
      </div>

      {/* --- NEW: Site Configuration Section --- */}
      <section className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Global Site Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Portfolio Name</label>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Your Name" />
            
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Background Color</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="color" value={siteBgColor} onChange={(e) => setSiteBgColor(e.target.value)} style={{ width: '50px', height: '40px', padding: '0' }} />
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{siteBgColor}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Footer Text</label>
            <input value={siteFooter} onChange={(e) => setSiteFooter(e.target.value)} placeholder="© 2024 Your Portfolio" />
            
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ fontSize: '0.8rem' }} />
          </div>

        </div>
        <button className="btn btn-primary" onClick={handleSaveGlobalSettings} style={{ marginTop: '1.5rem' }}>
          Update Site Info
        </button>
      </section>

      <div className="admin-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Col: Positions & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Positions Manager */}
          <section className="card">
            <h3>Manage Positions</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                value={newPosName}
                onChange={(e) => setNewPosName(e.target.value)}
                placeholder="Ex: Frontend Developer"
              />
              <button className="btn btn-primary" onClick={handleAddOrUpdatePosition} style={{ whiteSpace: 'nowrap', height: '46px' }}>
                {editingPosId ? 'Update' : 'Add'}
              </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
              {positions.map((pos) => (
                <li key={pos.id} style={{ background: 'rgba(255,255,255,0.05)', marginBottom: '10px', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{pos.name}</strong>
                    <div>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px' }} onClick={() => handleEditPosition(pos)}>Edit</button>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', color: '#ef4444' }} onClick={() => deletePosition(pos.id)}>Delete</button>
                    </div>
                  </div>
                  
                  {pos.skillIds && pos.skillIds.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                      <small style={{ color: 'var(--text-muted)' }}>Assigned Skills:</small>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {pos.skillIds.map((sid) => {
                          const sk = skills.find((s) => s.id === sid);
                          return sk ? (
                            <span key={sid} style={{ fontSize: '0.8rem', background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {sk.name}
                              <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => removeSkillFromPosition(pos.id, sid)}>&times;</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Assignment Tool */}
          <section className="card">
            <h3>Link Skill to Position</h3>
            <select value={assignPosId} onChange={(e) => setAssignPosId(e.target.value)}>
              <option value="">1. Select Position</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={assignSkillId} onChange={(e) => setAssignSkillId(e.target.value)}>
              <option value="">2. Select Skill</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleAssignSkill} disabled={!assignPosId || !assignSkillId} style={{ width: '100%' }}>
              Assign Skill
            </button>
          </section>
        </div>

        {/* Right Col: Skills Manager */}
        <section className="card">
          <h3>Manage Skills Library</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
            <input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill Name (e.g. React)"
            />
            <textarea
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="Short description..."
              rows={3}
            />
            <button className="btn btn-primary" onClick={handleAddOrUpdateSkill}>
              {editingSkillId ? 'Update Skill Details' : 'Add New Skill'}
            </button>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>{skill.name}</h4>
                  <div>
                    <button className="btn btn-ghost" style={{ padding: '5px' }} onClick={() => handleEditSkill(skill)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '5px', color: '#ef4444' }} onClick={() => deleteSkill(skill.id)}>Del</button>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>{skill.description}</p>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Add Media:</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select style={{ width: '80px' }} onChange={(e) => setMediaType(e.target.value)} value={mediaType}>
                      <option value="image">Img</option>
                      <option value="video">Vid</option>
                    </select>
                    <input type="file" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files[0])} />
                  </div>
                  <button 
                    className="btn btn-ghost"
                    style={{ width: '100%', marginTop: '5px', border: '1px dashed var(--glass-border)' }}
                    onClick={() => { setTargetSkillId(skill.id); handleUploadMedia(); }}
                    disabled={!mediaFile}
                  >
                    Upload to {skill.name}
                  </button>
                </div>

                {skill.media && skill.media.length > 0 && (
                   <div style={{ display: 'flex', gap: '5px', marginTop: '10px', overflowX: 'auto' }}>
                     {skill.media.map((m, idx) => (
                       <a key={idx} href={m.url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                         {m.type === 'image' 
                           ? <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           : <div style={{ width: '100%', height: '100%', background: '#000', color: 'white', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>VID</div>
                         }
                       </a>
                     ))}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default AdminPanel;
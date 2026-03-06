
/* eslint-disable react/react-in-jsx-scope */
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { useExampleWork } from './hooks/useExampleWork';
import { useSettings } from './hooks/useSettings';
import { getYouTubeEmbedUrl } from './utils/youtube';

function AdminPanel() {
  const { user } = useContext(AuthContext);
  const { positions, addPosition, updatePosition, deletePosition } = usePositions();
  const {
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    addMediaToSkill,
    removeMediaFromSkill,
    assignSkillToPosition,
    removeSkillFromPosition,
  } = useSkills();
  
  const {
    exampleWork,
    addExampleWork,
    updateExampleWork,
    deleteExampleWork,
    assignWorkToPosition,
  } = useExampleWork();
  
  // --- New Settings Hook ---
  const { settings, updateSettings } = useSettings();

  // --- State Management ---
  const [newPosName, setNewPosName] = useState('');
  const [newPosHeadline, setNewPosHeadline] = useState('');
  const [newPosOrder, setNewPosOrder] = useState(0);
  const [editingPosId, setEditingPosId] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillOrder, setNewSkillOrder] = useState(0);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [targetSkillId, setTargetSkillId] = useState('');
  const [assignPosId, setAssignPosId] = useState('');
  const [assignSkillId, setAssignSkillId] = useState('');
  const [youtubeUrlBySkillId, setYoutubeUrlBySkillId] = useState({});
  
  // --- Example Work State ---
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');
  const [newWorkThumbnail, setNewWorkThumbnail] = useState('');
  const [newWorkUrl, setNewWorkUrl] = useState('');
  const [newWorkOrder, setNewWorkOrder] = useState(0);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [assignWorkPosId, setAssignWorkPosId] = useState('');
  const [assignWorkId, setAssignWorkId] = useState('');
  
  // --- Drag and Drop State ---
  const [draggedPos, setDraggedPos] = useState(null);
  const [draggedSkill, setDraggedSkill] = useState(null);

  // --- New Local State for Site Settings ---
  const [siteName, setSiteName] = useState('');
  const [siteLightBg, setSiteLightBg] = useState('#f8fafc');
  const [siteDarkBg, setSiteDarkBg] = useState('#0f172a');
  const [footerLinksLocal, setFooterLinksLocal] = useState([]);
  const [showFooterModal, setShowFooterModal] = useState(false);

  // Sync local state when settings load from Firebase
  useEffect(() => {
    if (settings) {
      setSiteName(settings.name || '');
      setSiteLightBg(settings.lightBg || '#f8fafc');
      setSiteDarkBg(settings.darkBg || '#0f172a');
      setFooterLinksLocal(settings.footerLinks || []);
    }
  }, [settings]);

  // --- Handlers ---
  const handleSaveGlobalSettings = async () => {
    await updateSettings({
      name: siteName,
      lightBg: siteLightBg,
      darkBg: siteDarkBg,
      footerLinks: footerLinksLocal
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
      await updatePosition(editingPosId, { name: newPosName, headline: newPosHeadline || '', displayOrder: newPosOrder });
      setEditingPosId(null);
    } else {
      await addPosition(newPosName, newPosHeadline, newPosOrder);
    }
    setNewPosName('');
    setNewPosHeadline('');
    setNewPosOrder(0);
  };

  const handleEditPosition = (pos) => {
    setNewPosName(pos.name);
    setNewPosHeadline(pos.headline || '');
    setNewPosOrder(pos.displayOrder ?? 0);
    setEditingPosId(pos.id);
  };

  const handleAddOrUpdateSkill = async () => {
    if (!newSkillName.trim()) return;
    const skillData = { name: newSkillName, description: newSkillDesc, displayOrder: newSkillOrder };
    if (editingSkillId) {
      await updateSkill(editingSkillId, skillData);
      setEditingSkillId(null);
    } else {
      await addSkill(skillData);
    }
    setNewSkillName('');
    setNewSkillDesc('');
    setNewSkillOrder(0);
  };

  const handleEditSkill = (skill) => {
    setNewSkillName(skill.name);
    setNewSkillDesc(skill.description || '');
    setNewSkillOrder(skill.displayOrder ?? 0);
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

  const handleAddYouTube = async (skillId) => {
    const url = (youtubeUrlBySkillId[skillId] || '').trim();
    if (!getYouTubeEmbedUrl(url)) {
      alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }
    await addMediaToSkill(skillId, { type: 'video', url });
    setYoutubeUrlBySkillId((prev) => ({ ...prev, [skillId]: '' }));
    alert('YouTube video added!');
  };

  // --- Drag and Drop Handlers ---
  const handleDragStartPos = (e, pos) => {
    setDraggedPos(pos);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverPos = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropPos = async (e, targetPos) => {
    e.preventDefault();
    if (!draggedPos || draggedPos.id === targetPos.id) {
      setDraggedPos(null);
      return;
    }
    
    const draggedOrder = draggedPos.displayOrder ?? 0;
    const targetOrder = targetPos.displayOrder ?? 0;
    
    await updatePosition(draggedPos.id, { displayOrder: targetOrder });
    await updatePosition(targetPos.id, { displayOrder: draggedOrder });
    
    setDraggedPos(null);
  };

  const handleDragStartSkill = (e, skill) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverSkill = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropSkill = async (e, targetSkill) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill.id === targetSkill.id) {
      setDraggedSkill(null);
      return;
    }
    
    const draggedOrder = draggedSkill.displayOrder ?? 0;
    const targetOrder = targetSkill.displayOrder ?? 0;
    
    await updateSkill(draggedSkill.id, { displayOrder: targetOrder });
    await updateSkill(targetSkill.id, { displayOrder: draggedOrder });
    
    setDraggedSkill(null);
  };

  // --- Example Work Handlers ---
  const handleUploadWorkThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'portfolio_uploads');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/j-portfolio/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      setNewWorkThumbnail(data.secure_url);
      alert("Thumbnail uploaded!");
    } catch (err) {
      console.error("Cloudinary error:", err);
    }
  };

  const handleAddOrUpdateWork = async () => {
    if (!newWorkTitle.trim()) return;
    const workData = { 
      title: newWorkTitle, 
      description: newWorkDesc, 
      thumbnail: newWorkThumbnail,
      url: newWorkUrl,
      displayOrder: newWorkOrder 
    };
    if (editingWorkId) {
      await updateExampleWork(editingWorkId, workData);
      setEditingWorkId(null);
    } else {
      await addExampleWork(workData);
    }
    setNewWorkTitle('');
    setNewWorkDesc('');
    setNewWorkThumbnail('');
    setNewWorkUrl('');
    setNewWorkOrder(0);
  };

  const handleEditWork = (work) => {
    setNewWorkTitle(work.title);
    setNewWorkDesc(work.description || '');
    setNewWorkThumbnail(work.thumbnail || '');
    setNewWorkUrl(work.url || '');
    setNewWorkOrder(work.displayOrder ?? 0);
    setEditingWorkId(work.id);
  };

  const handleAssignWork = async () => {
    if (assignWorkPosId && assignWorkId) {
      await assignWorkToPosition(assignWorkPosId, assignWorkId);
      setAssignWorkPosId('');
      setAssignWorkId('');
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
            
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Background Color (Day)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={siteLightBg} onChange={(e) => setSiteLightBg(e.target.value)} style={{ width: '50px', height: '40px', padding: '0' }} />
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{siteLightBg}</span>
            </div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Background Color (Night)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={siteDarkBg} onChange={(e) => setSiteDarkBg(e.target.value)} style={{ width: '50px', height: '40px', padding: '0' }} />
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{siteDarkBg}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Footer Links</label>
            <div>
              <button className="btn btn-ghost" onClick={() => setShowFooterModal(true)} style={{ width: '100%' }}>
                Edit Footer Links ({footerLinksLocal.length})
              </button>
            </div>
            
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ fontSize: '0.8rem' }} />
          </div>

        </div>
        <button className="btn btn-primary" onClick={handleSaveGlobalSettings} style={{ marginTop: '1.5rem' }}>
          Update Site Info
        </button>
      </section>

      {/* Footer Links Modal */}
      {showFooterModal && (
        <div className="modal-overlay" onClick={() => setShowFooterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>Footer Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
              {footerLinksLocal.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={f.text} placeholder="Label" onChange={(e) => setFooterLinksLocal(prev => prev.map((p,i) => i===idx?{...p,text:e.target.value}:p))} style={{ flex: 1 }} />
                  <input value={f.url} placeholder="https://..." onChange={(e) => setFooterLinksLocal(prev => prev.map((p,i) => i===idx?{...p,url:e.target.value}:p))} style={{ flex: 2 }} />
                  <button className="btn btn-ghost" onClick={() => setFooterLinksLocal(prev => prev.filter((_,i) => i!==idx))}>Remove</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="Label" id="newFooterText" style={{ flex: 1 }} />
                <input placeholder="https://..." id="newFooterUrl" style={{ flex: 2 }} />
                <button className="btn btn-primary" onClick={() => {
                  const txt = document.getElementById('newFooterText').value.trim();
                  const url = document.getElementById('newFooterUrl').value.trim();
                  if (!txt) return alert('Label required');
                  setFooterLinksLocal(prev => [...prev, { text: txt, url }]);
                  document.getElementById('newFooterText').value = '';
                  document.getElementById('newFooterUrl').value = '';
                }}>Add</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowFooterModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={() => { setShowFooterModal(false); handleSaveGlobalSettings(); }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Col: Positions & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Positions Manager */}
          <section className="card">
            <h3>Manage Positions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
              <input
                value={newPosName}
                onChange={(e) => setNewPosName(e.target.value)}
                placeholder="Position name (e.g. Frontend Developer)"
              />
              <input
                value={newPosHeadline}
                onChange={(e) => setNewPosHeadline(e.target.value)}
                placeholder="Headline under your name (e.g. I build accessible, pixel-perfect web experiences...)"
                style={{ fontSize: '0.9rem' }}
              />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Display Order</label>
                  <input
                    type="number"
                    value={newPosOrder}
                    onChange={(e) => setNewPosOrder(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: '100%' }}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleAddOrUpdatePosition} style={{ whiteSpace: 'nowrap' }}>
                  {editingPosId ? 'Update' : 'Add'}
                </button>
                {editingPosId && (
                  <button className="btn btn-ghost" onClick={() => { setEditingPosId(null); setNewPosName(''); setNewPosHeadline(''); setNewPosOrder(0); }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
              {positions.map((pos) => (
                <li 
                  key={pos.id} 
                  draggable
                  onDragStart={(e) => handleDragStartPos(e, pos)}
                  onDragOver={handleDragOverPos}
                  onDrop={(e) => handleDropPos(e, pos)}
                  style={{ 
                    background: draggedPos?.id === pos.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)', 
                    marginBottom: '10px', 
                    padding: '10px', 
                    borderRadius: '8px',
                    cursor: 'move',
                    opacity: draggedPos?.id === pos.id ? 0.6 : 1,
                    border: draggedPos?.id === pos.id ? '2px solid var(--primary)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>☰ {pos.name}</strong>
                    <div>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px' }} onClick={() => handleEditPosition(pos)}>Edit</button>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', color: '#ef4444' }} onClick={() => deletePosition(pos.id)}>Delete</button>
                    </div>
                  </div>
                  {pos.headline && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '6px 0 0 0', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pos.headline}>{pos.headline}</p>
                  )}
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Display Order</label>
                <input
                  type="number"
                  value={newSkillOrder}
                  onChange={(e) => setNewSkillOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddOrUpdateSkill}>
                {editingSkillId ? 'Update Skill Details' : 'Add New Skill'}
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {skills.map((skill) => (
              <div 
                key={skill.id} 
                draggable
                onDragStart={(e) => handleDragStartSkill(e, skill)}
                onDragOver={handleDragOverSkill}
                onDrop={(e) => handleDropSkill(e, skill)}
                style={{ 
                  border: draggedSkill?.id === skill.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px',
                  cursor: 'move',
                  opacity: draggedSkill?.id === skill.id ? 0.6 : 1,
                  background: draggedSkill?.id === skill.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>☰ {skill.name}</h4>
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
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.8rem', flex: '0 0 100%' }}>Or YouTube URL:</label>
                    <input
                      type="url"
                      value={youtubeUrlBySkillId[skill.id] || ''}
                      onChange={(e) => setYoutubeUrlBySkillId((prev) => ({ ...prev, [skill.id]: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      style={{ flex: '1', minWidth: '160px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}
                      onClick={() => handleAddYouTube(skill.id)}
                      disabled={!youtubeUrlBySkillId[skill.id]?.trim()}
                    >
                      Add YouTube
                    </button>
                  </div>
                </div>

                {skill.media && skill.media.length > 0 && (
                   <div style={{ display: 'flex', gap: '5px', marginTop: '10px', overflowX: 'auto', flexWrap: 'wrap' }}>
                     {skill.media.map((m, idx) => (
                       <div key={idx} className="media-thumb-wrap" style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                         <a href={m.url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                           {m.type === 'image'
                             ? <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             : <div style={{ width: '100%', height: '100%', background: '#000', color: 'white', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>VID</div>
                           }
                         </a>
                         <button
                           type="button"
                           className="media-thumb-delete"
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeMediaFromSkill(skill.id, m); }}
                           title="Remove media"
                           aria-label="Remove media"
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Example Work Manager */}
        <section className="card" style={{ marginTop: '2rem' }}>
          <h3>Manage Example Work</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
            <input
              value={newWorkTitle}
              onChange={(e) => setNewWorkTitle(e.target.value)}
              placeholder="Project Title (e.g. E-commerce Redesign)"
            />
            <textarea
              value={newWorkDesc}
              onChange={(e) => setNewWorkDesc(e.target.value)}
              placeholder="Project description..."
              rows={3}
            />
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Thumbnail</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleUploadWorkThumbnail} style={{ flex: 1 }} />
                {newWorkThumbnail && <img src={newWorkThumbnail} alt="thumb" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
              </div>
            </div>
            <input
              type="url"
              value={newWorkUrl}
              onChange={(e) => setNewWorkUrl(e.target.value)}
              placeholder="Project URL (optional)"
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Display Order</label>
                <input
                  type="number"
                  value={newWorkOrder}
                  onChange={(e) => setNewWorkOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddOrUpdateWork}>
                {editingWorkId ? 'Update Work' : 'Add Example Work'}
              </button>
              {editingWorkId && (
                <button className="btn btn-ghost" onClick={() => { setEditingWorkId(null); setNewWorkTitle(''); setNewWorkDesc(''); setNewWorkThumbnail(''); setNewWorkUrl(''); setNewWorkOrder(0); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {exampleWork.map((work) => (
              <div key={work.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                  {work.thumbnail && <img src={work.thumbnail} alt={work.title} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 3px 0', color: 'var(--primary)' }}>{work.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0' }}>{work.description}</p>
                  </div>
                  <div>
                    <button className="btn btn-ghost" style={{ padding: '5px' }} onClick={() => handleEditWork(work)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '5px', color: '#ef4444' }} onClick={() => deleteExampleWork(work.id)}>Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignment Tool: Work to Position */}
        <section className="card" style={{ marginTop: '2rem' }}>
          <h3>Link Example Work to Role</h3>
          <select value={assignWorkPosId} onChange={(e) => setAssignWorkPosId(e.target.value)}>
            <option value="">1. Select Role</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={assignWorkId} onChange={(e) => setAssignWorkId(e.target.value)}>
            <option value="">2. Select Example Work</option>
            {exampleWork.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleAssignWork} disabled={!assignWorkPosId || !assignWorkId} style={{ width: '100%' }}>
            Assign Example Work
          </button>
        </section>

      </div>
    </div>
  );
}

export default AdminPanel;
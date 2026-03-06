
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

  // Background / particle controls
  const [siteAnimEnabled, setSiteAnimEnabled] = useState(true);
  const [siteLightAnimColor, setSiteLightAnimColor] = useState('#e2e8f0');
  const [siteDarkAnimColor, setSiteDarkAnimColor] = useState('#f8fafc');
  const [siteBgDensity, setSiteBgDensity] = useState(50);   // 0–100
  const [siteBgDotSize, setSiteBgDotSize] = useState(1.5);  // px
  const [siteBgOpacity, setSiteBgOpacity] = useState(0.55); // 0–1
  const [siteBgSpeed, setSiteBgSpeed] = useState(45);       // seconds (base)
  const [siteBgShapeType, setSiteBgShapeType] = useState('circle');
  const [siteBgShapeChar, setSiteBgShapeChar] = useState('●');
  const [siteBgMoveEnabled, setSiteBgMoveEnabled] = useState(true);
  const [siteBgMoveSpeed, setSiteBgMoveSpeed] = useState(1.0);
  const [siteBgMoveDirection, setSiteBgMoveDirection] = useState('none');
  const [siteBgMoveRandom, setSiteBgMoveRandom] = useState(true);
  const [siteBgMoveStraight, setSiteBgMoveStraight] = useState(false);
  const [siteBgMoveOutMode, setSiteBgMoveOutMode] = useState('out');
  const [siteBgLinksEnabled, setSiteBgLinksEnabled] = useState(false);
  const [siteBgLinksDistance, setSiteBgLinksDistance] = useState(120);
  const [siteBgLinksOpacity, setSiteBgLinksOpacity] = useState(0.3);
  const [siteBgLinksWidth, setSiteBgLinksWidth] = useState(1);
  const [siteBgLinksColorMode, setSiteBgLinksColorMode] = useState('match');
  const [siteBgHoverMode, setSiteBgHoverMode] = useState('none');
  const [siteBgClickMode, setSiteBgClickMode] = useState('none');
  const [siteBgTrailEnabled, setSiteBgTrailEnabled] = useState(false);
  const [siteBgTrailLength, setSiteBgTrailLength] = useState(8);
  const [siteBgTrailOpacity, setSiteBgTrailOpacity] = useState(0.25);
  const [siteBgZLayers, setSiteBgZLayers] = useState(24);
  const [showBgDrawer, setShowBgDrawer] = useState(false);

  // Sync local state when settings load from Firebase
  useEffect(() => {
    if (settings) {
      const toHex = (val, fallback) => {
        if (typeof val !== 'string') return fallback;
        const trimmed = val.trim();
        return /^#([0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : fallback;
      };

      setSiteName(settings.name || '');
      setSiteLightBg(settings.lightBg || '#f8fafc');
      setSiteDarkBg(settings.darkBg || '#0f172a');
      setFooterLinksLocal(settings.footerLinks || []);

      setSiteAnimEnabled(settings.animEnabled ?? true);
      setSiteLightAnimColor(toHex(settings.lightAnimColor, '#e2e8f0'));
      setSiteDarkAnimColor(toHex(settings.darkAnimColor, '#f8fafc'));
      setSiteBgDensity(
        typeof settings.bgDensity === 'number' ? settings.bgDensity : 50
      );
      setSiteBgDotSize(
        typeof settings.bgDotSize === 'number' ? settings.bgDotSize : 1.5
      );
      setSiteBgOpacity(
        typeof settings.bgOpacity === 'number' ? settings.bgOpacity : 0.55
      );
      setSiteBgSpeed(
        typeof settings.bgSpeed === 'number' ? settings.bgSpeed : 45
      );
      setSiteBgShapeType(settings.bgShapeType || 'circle');
      setSiteBgShapeChar(settings.bgShapeChar || '●');
      setSiteBgMoveEnabled(settings.bgMoveEnabled ?? true);
      setSiteBgMoveSpeed(
        typeof settings.bgMoveSpeed === 'number' ? settings.bgMoveSpeed : 1.0
      );
      setSiteBgMoveDirection(settings.bgMoveDirection || 'none');
      setSiteBgMoveRandom(settings.bgMoveRandom ?? true);
      setSiteBgMoveStraight(settings.bgMoveStraight ?? false);
      setSiteBgMoveOutMode(settings.bgMoveOutMode || 'out');
      setSiteBgLinksEnabled(settings.bgLinksEnabled ?? false);
      setSiteBgLinksDistance(
        typeof settings.bgLinksDistance === 'number' ? settings.bgLinksDistance : 120
      );
      setSiteBgLinksOpacity(
        typeof settings.bgLinksOpacity === 'number' ? settings.bgLinksOpacity : 0.3
      );
      setSiteBgLinksWidth(
        typeof settings.bgLinksWidth === 'number' ? settings.bgLinksWidth : 1
      );
      setSiteBgLinksColorMode(settings.bgLinksColorMode || 'match');
      setSiteBgHoverMode(settings.bgHoverMode || 'none');
      setSiteBgClickMode(settings.bgClickMode || 'none');
      setSiteBgTrailEnabled(settings.bgTrailEnabled ?? false);
      setSiteBgTrailLength(
        typeof settings.bgTrailLength === 'number' ? settings.bgTrailLength : 8
      );
      setSiteBgTrailOpacity(
        typeof settings.bgTrailOpacity === 'number' ? settings.bgTrailOpacity : 0.25
      );
      setSiteBgZLayers(
        typeof settings.bgZLayers === 'number' ? settings.bgZLayers : 24
      );
    }
  }, [settings]);

  // --- Handlers ---
  const handleSaveGlobalSettings = async () => {
    await updateSettings({
      name: siteName,
      lightBg: siteLightBg,
      darkBg: siteDarkBg,
      footerLinks: footerLinksLocal,
      animEnabled: siteAnimEnabled,
      lightAnimColor: siteLightAnimColor,
      darkAnimColor: siteDarkAnimColor,
      bgDensity: siteBgDensity,
      bgDotSize: siteBgDotSize,
      bgOpacity: siteBgOpacity,
      bgSpeed: siteBgSpeed,
      bgShapeType: siteBgShapeType,
      bgShapeChar: siteBgShapeChar,
      bgMoveEnabled: siteBgMoveEnabled,
      bgMoveSpeed: siteBgMoveSpeed,
      bgMoveDirection: siteBgMoveDirection,
      bgMoveRandom: siteBgMoveRandom,
      bgMoveStraight: siteBgMoveStraight,
      bgMoveOutMode: siteBgMoveOutMode,
      bgLinksEnabled: siteBgLinksEnabled,
      bgLinksDistance: siteBgLinksDistance,
      bgLinksOpacity: siteBgLinksOpacity,
      bgLinksWidth: siteBgLinksWidth,
      bgLinksColorMode: siteBgLinksColorMode,
      bgHoverMode: siteBgHoverMode,
      bgClickMode: siteBgClickMode,
      bgTrailEnabled: siteBgTrailEnabled,
      bgTrailLength: siteBgTrailLength,
      bgTrailOpacity: siteBgTrailOpacity,
      bgZLayers: siteBgZLayers,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          
          {/* Basic site + base background */}
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

          {/* Footer + profile */}
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

          {/* Background particle controls (collapsed into drawer) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Background Particles</label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Density, color, movement, links &amp; trails
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={siteAnimEnabled}
                    onChange={(e) => setSiteAnimEnabled(e.target.checked)}
                  />
                  Enabled
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setShowBgDrawer(prev => !prev)}
                >
                  {showBgDrawer ? 'Hide' : 'Open'} controls
                </button>
              </div>
            </div>

            {showBgDrawer && (
              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.75rem 0.75rem 0.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  background: 'rgba(15,23,42,0.5)'
                }}
              >
                <label style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Particle Density</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={siteBgDensity}
                  onChange={(e) => setSiteBgDensity(parseInt(e.target.value, 10) || 10)}
                />
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Lower = chill sparse, higher = dense techy matrix ({siteBgDensity})
                </small>

                <label style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Particle Size (px)</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={siteBgDotSize}
                  onChange={(e) => setSiteBgDotSize(parseFloat(e.target.value) || 1)}
                />

                <label style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Particle Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={siteBgOpacity}
                  onChange={(e) => setSiteBgOpacity(parseFloat(e.target.value) || 0.1)}
                />

                <label style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Base Speed</label>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={siteBgSpeed}
                  onChange={(e) => setSiteBgSpeed(parseInt(e.target.value, 10) || 45)}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Light Theme Particle Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={siteLightAnimColor}
                        onChange={(e) => setSiteLightAnimColor(e.target.value)}
                        style={{ width: '40px', height: '32px', padding: 0 }}
                      />
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{siteLightAnimColor}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Dark Theme Particle Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={siteDarkAnimColor}
                        onChange={(e) => setSiteDarkAnimColor(e.target.value)}
                        style={{ width: '40px', height: '32px', padding: 0 }}
                      />
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{siteDarkAnimColor}</span>
                    </div>
                  </div>
                </div>

                {/* Shape */}
                <hr style={{ borderColor: 'rgba(148,163,184,0.35)', margin: '0.75rem 0' }} />
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Particle Shape</label>
            <select
              value={siteBgShapeType}
              onChange={(e) => setSiteBgShapeType(e.target.value)}
              style={{ marginBottom: '0.25rem' }}
            >
              <option value="circle">Circle (classic, chill)</option>
              <option value="triangle">Triangle (techy)</option>
              <option value="polygon">Polygon</option>
              <option value="star">Star (sci‑fi)</option>
              <option value="char">Character / glyph</option>
              <option value="image">Custom image / SVG</option>
            </select>
            {siteBgShapeType === 'char' && (
              <input
                type="text"
                maxLength={2}
                value={siteBgShapeChar}
                onChange={(e) => setSiteBgShapeChar(e.target.value || '●')}
                placeholder="e.g. ● or █"
                style={{ fontSize: '0.8rem' }}
              />
            )}

                {/* Movement */}
                <hr style={{ borderColor: 'rgba(148,163,184,0.35)', margin: '0.75rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Movement</label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={siteBgMoveEnabled}
                  onChange={(e) => setSiteBgMoveEnabled(e.target.checked)}
                />
                Enabled
              </label>
            </div>
            <label style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Movement Speed</label>
            <input
              type="range"
              min="0.4"
              max="6"
              step="0.2"
              value={siteBgMoveSpeed}
              onChange={(e) => setSiteBgMoveSpeed(parseFloat(e.target.value) || 0.4)}
            />
            <label style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Direction</label>
            <select
              value={siteBgMoveDirection}
              onChange={(e) => setSiteBgMoveDirection(e.target.value)}
            >
              <option value="none">None (float)</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={siteBgMoveRandom}
                  onChange={(e) => setSiteBgMoveRandom(e.target.checked)}
                />
                Random paths
              </label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={siteBgMoveStraight}
                  onChange={(e) => setSiteBgMoveStraight(e.target.checked)}
                />
                Straight
              </label>
            </div>
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Edge Behavior</label>
            <select
              value={siteBgMoveOutMode}
              onChange={(e) => setSiteBgMoveOutMode(e.target.value)}
            >
              <option value="out">Out (respawn)</option>
              <option value="bounce">Bounce</option>
            </select>

                {/* Connections / web */}
                <hr style={{ borderColor: 'rgba(148,163,184,0.35)', margin: '0.75rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Connections / Web</label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={siteBgLinksEnabled}
                  onChange={(e) => setSiteBgLinksEnabled(e.target.checked)}
                />
                Enabled
              </label>
            </div>
            <label style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Link Distance</label>
            <input
              type="range"
              min="60"
              max="200"
              value={siteBgLinksDistance}
              onChange={(e) => setSiteBgLinksDistance(parseInt(e.target.value, 10) || 80)}
            />
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Link Opacity</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={siteBgLinksOpacity}
              onChange={(e) => setSiteBgLinksOpacity(parseFloat(e.target.value) || 0.2)}
            />
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Link Width</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={siteBgLinksWidth}
              onChange={(e) => setSiteBgLinksWidth(parseFloat(e.target.value) || 0.5)}
            />
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Link Color</label>
            <select
              value={siteBgLinksColorMode}
              onChange={(e) => setSiteBgLinksColorMode(e.target.value)}
            >
              <option value="match">Match particles</option>
              <option value="random">Random</option>
            </select>

                {/* Interactivity */}
                <hr style={{ borderColor: 'rgba(148,163,184,0.35)', margin: '0.75rem 0' }} />
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Interactivity</label>
            <label style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>On hover</label>
            <select
              value={siteBgHoverMode}
              onChange={(e) => setSiteBgHoverMode(e.target.value)}
            >
              <option value="none">None</option>
              <option value="grab">Grab (lines to cursor)</option>
              <option value="bubble">Bubble (grow near cursor)</option>
            </select>
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>On click</label>
            <select
              value={siteBgClickMode}
              onChange={(e) => setSiteBgClickMode(e.target.value)}
            >
              <option value="none">None</option>
              <option value="push">Push (add)</option>
              <option value="remove">Remove</option>
              <option value="repulse">Repulse</option>
              <option value="bubble">Bubble</option>
            </select>

                {/* Trail / depth */}
                <hr style={{ borderColor: 'rgba(148,163,184,0.35)', margin: '0.75rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Trails / Glow</label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={siteBgTrailEnabled}
                  onChange={(e) => setSiteBgTrailEnabled(e.target.checked)}
                />
                Enable
              </label>
            </div>
            <label style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Trail Length</label>
            <input
              type="range"
              min="5"
              max="20"
              value={siteBgTrailLength}
              onChange={(e) => setSiteBgTrailLength(parseInt(e.target.value, 10) || 5)}
            />
            <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Trail Opacity</label>
            <input
              type="range"
              min="0.05"
              max="0.6"
              step="0.05"
              value={siteBgTrailOpacity}
              onChange={(e) => setSiteBgTrailOpacity(parseFloat(e.target.value) || 0.1)}
            />
                <label style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Depth Layers (z‑layers)</label>
                <input
                  type="range"
                  min="3"
                  max="64"
                  value={siteBgZLayers}
                  onChange={(e) => setSiteBgZLayers(parseInt(e.target.value, 10) || 24)}
                />
              </div>
            )}
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
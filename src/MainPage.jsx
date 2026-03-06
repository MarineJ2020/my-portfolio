/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { useExampleWork } from './hooks/useExampleWork';
import { useSettings } from './hooks/useSettings';

function MainPage() {
  const { positions } = usePositions();
  const { skills } = useSkills();
  const { exampleWork } = useExampleWork();
  const { settings } = useSettings();

  const [activePositionId, setActivePositionId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);

  // Theme state
  const [theme, setTheme] = useState('dark');
  const [manualOverride, setManualOverride] = useState(false);

  // Initial position selection
  useEffect(() => {
    if (!activePositionId && positions.length > 0) {
      setActivePositionId(positions[0].id);
    }
  }, [positions, activePositionId]);

  // Auto theme (time-based)
  useEffect(() => {
    if (manualOverride) return;
    const hour = new Date().getHours();
    const isDay = hour > 6 && hour < 18;
    setTheme(isDay ? 'light' : 'dark');
  }, [manualOverride]);

  // Apply body styles: use --page-bg for smooth transition; light theme gets auto-contrast
  useEffect(() => {
    document.body.className = `${theme}-theme`;
    const bg = theme === 'light' ? settings.lightBg : settings.darkBg;
    document.documentElement.style.setProperty('--page-bg', bg);

    const target = document.body;
    if (theme === 'light' && bg) {
      const lum = getLuminance(bg);
      const isLight = lum > 0.4;
      if (isLight) {
        target.style.setProperty('--text-main', '#1e293b');
        target.style.setProperty('--text-muted', '#475569');
        target.style.setProperty('--bg-card', '#ffffff');
        target.style.setProperty('--glass', 'rgba(255,255,255,0.85)');
        target.style.setProperty('--glass-border', 'rgba(0,0,0,0.1)');
      } else {
        target.style.setProperty('--text-main', '#f8fafc');
        target.style.setProperty('--text-muted', '#94a3b8');
        target.style.setProperty('--bg-card', '#1e293b');
        target.style.setProperty('--glass', 'rgba(30,41,59,0.7)');
        target.style.setProperty('--glass-border', 'rgba(255,255,255,0.1)');
      }
    } else {
      target.style.removeProperty('--text-main');
      target.style.removeProperty('--text-muted');
      target.style.removeProperty('--bg-card');
      target.style.removeProperty('--glass');
      target.style.removeProperty('--glass-border');
    }
  }, [theme, settings]);

  function getLuminance(hex) {
    const n = hex.replace(/^#/, '');
    const r = parseInt(n.slice(0, 2), 16) / 255;
    const g = parseInt(n.slice(2, 4), 16) / 255;
    const b = parseInt(n.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const toggleTheme = () => {
    setManualOverride(true);
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const activePosition = positions.find(p => p.id === activePositionId);
  const activeSkills = activePosition
    ? skills.filter(s => activePosition.skillIds?.includes(s.id))
    : [];
  const activeExampleWork = activePosition
    ? exampleWork.filter(w => activePosition.exampleWorkIds?.includes(w.id))
    : [];

  return (
    <div className="main-page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* Background Animation */}
      {settings.animEnabled && (
        <div className={`bg-anim anim-${theme}`}>
          {theme === 'light'
            ? [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="cloud"
                  style={{
                    background: settings.lightAnimColor,
                    top: `${i * 15}%`,
                    left: `-${Math.random() * 20}%`,
                    animationDuration: `${20 + i * 5}s`,
                  }}
                />
              ))
            : [...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    background: settings.darkAnimColor,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
        </div>
      )}

      {/* Content Layer */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 100,
          }}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>

        {/* Header */}
        <header className="container" style={{ textAlign: 'center', padding: '6rem 1rem 4rem' }}>
          {settings.profilePic && (
            <img
              src={settings.profilePic.replace('/upload/', '/upload/c_fill,g_face,q_auto,f_auto/')}
              alt="Profile"
              style={{
                width: `${settings.profileSize}px`,
                height: `${settings.profileSize}px`,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            />
          )}
          <h1 style={{ fontSize: `${settings.fontSizeHead}rem` }}>{settings.name}</h1>
          <p
            style={{
              fontSize: `${settings.fontSizeBody}rem`,
              opacity: 0.8,
              maxWidth: '700px',
              margin: '1rem auto',
              whiteSpace: 'pre-line',
            }}
          >
            {settings.tagline}
          </p>
        </header>

        {/* Roles Label */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Roles that I&apos;m specialized in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Click a role to see relevant skills and projects</p>
        </div>

        {/* Position Tabs */}
        <div className="tabs" style={{ justifyContent: 'center' }}>
          {positions.map(pos => (
            <button
              key={pos.id}
              onClick={() => setActivePositionId(pos.id)}
              className={`tab-btn ${activePositionId === pos.id ? 'active' : ''}`}
              style={{ minWidth: `${settings.roleCardSize}px` }}
            >
              {pos.name}
            </button>
          ))}
        </div>

        {/* Skills Label */}
        {activeSkills.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Skills for this role</h2>
          </div>
        )}

        {/* Skills Grid */}
        <div
          className="skills-grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${settings.skillCardSize}px, 1fr))`,
          }}
        >
          {activeSkills.map(skill => (
            <div
              key={skill.id}
              className="skill-card"
              onClick={() => setSelectedSkill(skill)}
            >
              <h3>{skill.name}</h3>
              {skill.description && (
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  {skill.description.substring(0, 50)}…
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Skill Modal */}
        {selectedSkill && (
          <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>{selectedSkill.name}</h2>
              <p>{selectedSkill.description}</p>

              <div className="media-grid">
                {selectedSkill.media?.map((m, i) => (
                  <div key={i}>
                    {m.type === 'image' ? (
                      <img src={m.url} alt="" />
                    ) : (
                      <video src={m.url} controls muted />
                    )}
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 20 }}
                onClick={() => setSelectedSkill(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Example Work Label & Grid */}
        {activeExampleWork.length > 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '3rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Example Work</h2>
            </div>
            <div
              className="example-work-grid"
              style={{
                display: 'grid',
                /* keep cards slightly smaller and consistent */
                gridTemplateColumns: `repeat(auto-fit, minmax(160px, 220px))`,
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '3rem',
              }}
            >
              {activeExampleWork.map(work => (
                <div
                  key={work.id}
                  className="example-work-card"
                  onClick={() => setSelectedWork(work)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                    transition: 'transform 0.2s',
                    maxWidth: '220px',
                    margin: '0 auto'
                  }}
                >
                  {work.thumbnail && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(0,0,0,0.04)' }}>
                      <img
                        src={work.thumbnail}
                        alt={work.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div className="example-work-card-caption" style={{ padding: '10px' }}>
                    <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600' }}>{work.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Example Work Modal */}
        {selectedWork && (
          <div className="modal-overlay" onClick={() => setSelectedWork(null)} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              {selectedWork.thumbnail && (
                <img src={selectedWork.thumbnail} alt={selectedWork.title} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
              )}
              
              <div style={{ padding: '2rem' }}>
                <h2>{selectedWork.title}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{selectedWork.description}</p>

                {selectedWork.url && (
                  <a href={selectedWork.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem', marginBottom: '1rem' }}>
                    Check it out →
                  </a>
                )}

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 20, display: 'block', width: '100%' }}
                  onClick={() => setSelectedWork(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            marginTop: '5rem',
            padding: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            {settings.footerLinks?.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
                style={{ margin: '0 8px', color: 'var(--text-muted)' }}
              >
                {link.text || link.label}
              </a>
            ))}
          </div>
          <small style={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} {settings.name}
          </small>
        </footer>
      </div>
    </div>
  );
}

export default MainPage;

/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { useSettings } from './hooks/useSettings'; // Import the settings hook

function MainPage() {
  const { positions } = usePositions();
  const { skills } = useSkills();
  const { settings } = useSettings(); // Get live settings from Firestore

  const [activePositionId, setActivePositionId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Sync active position and apply background color
  useEffect(() => {
    if (!activePositionId && positions.length > 0) {
      setActivePositionId(positions[0].id);
    }
    
    // Apply the background color from dashboard to the body
    if (settings?.bgColor) {
      document.body.style.backgroundColor = settings.bgColor;
    }
  }, [positions, activePositionId, settings?.bgColor]);

  const activePosition = positions.find(p => p.id === activePositionId);
  const activeSkills = activePosition
    ? skills.filter(s => activePosition.skillIds?.includes(s.id))
    : [];

  // Fallback values if settings haven't loaded yet
  const displayName = settings?.name || 'Your Name';
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} Portfolio`;

  return (
    <div className="main-page">
      {/* Hero Section */}
      <section className="container" style={{ textAlign: 'center', padding: '6rem 1rem 4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          {settings?.profilePic ? (
            <img 
  // This adds "c_fill,g_face,w_300,q_auto,f_auto" to the URL
  // It automatically finds the face, crops to 300px, and optimizes format!
  src={settings.profilePic.replace('/upload/', '/upload/c_fill,g_face,w_300,q_auto,f_auto/')} 
  alt={displayName} 
  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} 
/>
          ) : (
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              background: 'linear-gradient(45deg, var(--primary), #ec4899)', 
              margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: 'bold'
            }}>
              {displayName.charAt(0)}
            </div>
          )}
        </div>
        <h1>{displayName}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
          I build accessible, pixel-perfect, and performant web experiences. 
          Explore my technical expertise by role below.
        </p>
      </section>

      {/* Navigation / Filtering */}
      <section className="container">
        <div className="tabs">
          {positions.map(pos => (
            <button
              key={pos.id}
              onClick={() => setActivePositionId(pos.id)}
              className={`tab-btn ${activePositionId === pos.id ? 'active' : ''}`}
            >
              {pos.name}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="skills-grid">
          {activeSkills.length > 0 ? (
            activeSkills.map(skill => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="skill-card"
              >
                <h3>{skill.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {skill.description ? skill.description.substring(0, 60) + '...' : 'View details'}
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                    Click to view media
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No skills listed for this position yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedSkill && (
        <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>{selectedSkill.name}</h2>
              <button 
                onClick={() => setSelectedSkill(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              {selectedSkill.description || 'No description provided.'}
            </p>

            {selectedSkill.media && selectedSkill.media.length > 0 && (
              <>
                <h4 style={{ marginTop: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Gallery</h4>
                <div className="media-grid">
                  {selectedSkill.media.map((m, idx) => (
                    <div key={idx}>
                      {m.type === 'image' ? (
                        <img src={m.url} alt={`${selectedSkill.name} demo ${idx}`} loading="lazy" />
                      ) : (
                        <video src={m.url} controls muted />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedSkill(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer style={{ 
        marginTop: '6rem', 
        padding: '3rem 1rem', 
        textAlign: 'center', 
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--text-muted)'
      }}>
        <p>{footerText}</p>
      </footer>
    </div>
  );
}

export default MainPage;
/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';

function MainPage() {
  const { positions } = usePositions();
  const { skills } = useSkills();

  const [activePositionId, setActivePositionId] = useState(positions[0]?.id || '');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const activePosition = positions.find(p => p.id === activePositionId);
  const activeSkills = activePosition
    ? skills.filter(s => activePosition.skillIds?.includes(s.id))
    : [];

  return (
    <div className="main-page" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img src="/your-photo.jpg" alt="Your Name" style={{ width: '150px', borderRadius: '50%' }} />
        <h1>Your Name</h1>
      </header>

      {/* Position Tabs */}
      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {positions.map(pos => (
          <button
            key={pos.id}
            onClick={() => setActivePositionId(pos.id)}
            style={{
              padding: '10px 20px',
              background: activePositionId === pos.id ? '#007bff' : '#f0f0f0',
              color: activePositionId === pos.id ? 'white' : 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {pos.name}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {activeSkills.map(skill => (
          <div
            key={skill.id}
            onClick={() => setSelectedSkill(skill)}
            style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <h3>{skill.name}</h3>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedSkill && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedSkill(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>{selectedSkill.name}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              margin: '20px 0'
            }}>
              {selectedSkill.media?.map((m, idx) => (
                <div key={idx}>
                  {m.type === 'image' ? (
                    <img src={m.url} alt="media" style={{ width: '100%', borderRadius: '8px' }} />
                  ) : (
                    <video src={m.url} controls style={{ width: '100%', borderRadius: '8px' }} />
                  )}
                </div>
              ))}
            </div>
            <p>{selectedSkill.description || 'No description'}</p>
            <button onClick={() => setSelectedSkill(null)} style={{ padding: '10px 20px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
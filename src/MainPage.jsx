// src/MainPage.jsx
import { useState } from 'react';
import { positions, skills } from './data'; // Import data

function MainPage() {
  const [activePosition, setActivePosition] = useState(positions[0]?.id || null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const activePos = positions.find(p => p.id === activePosition);
  const activeSkills = activePos ? skills.filter(s => activePos.skillIds.includes(s.id)) : [];

  const handleTabClick = (posId) => setActivePosition(posId);

  const openPopup = (skill) => setSelectedSkill(skill);
  const closePopup = () => setSelectedSkill(null);

  return (
    <div className="main-page">
      {/* Header: Photo and Name */}
      <header>
        <img src="https://your-photo-url.com" alt="Your Name" className="profile-photo" />
        <h1>Your Name</h1>
      </header>

      {/* Position Tabs */}
      <div className="tabs">
        {positions.map(pos => (
          <button
            key={pos.id}
            className={activePosition === pos.id ? 'active' : ''}
            onClick={() => handleTabClick(pos.id)}
          >
            {pos.name}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="skills-grid">
        {activeSkills.map(skill => (
          <div key={skill.id} className="skill-card" onClick={() => openPopup(skill)}>
            {skill.name}
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedSkill && (
        <div className="modal-overlay" onClick={closePopup}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedSkill.name}</h2>
            <div className="media-grid">
              {selectedSkill.media.map((m, idx) => (
                <div key={idx}>
                  {m.type === 'image' ? (
                    <img src={m.url} alt="Media" />
                  ) : (
                    <video src={m.url} controls />
                  )}
                </div>
              ))}
            </div>
            <p>{selectedSkill.description}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
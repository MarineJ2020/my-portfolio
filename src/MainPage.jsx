/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { usePositions } from './hooks/usePositions';
import { useSkills } from './hooks/useSkills';
import { useExampleWork } from './hooks/useExampleWork';
import { useSettings } from './hooks/useSettings';
import ParticleBackground from './ParticleBackground';
import EmailIcon from './assets/Email.svg';
import CallIcon from './assets/Call.svg';
import WhatsappIcon from './assets/Whatsapp.svg';

function MainPage() {
  const { positions } = usePositions();
  const { skills } = useSkills();
  const { exampleWork } = useExampleWork();
  const { settings } = useSettings();

  const [activePositionId, setActivePositionId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);

  const [contactName, setContactName] = useState('');
  const [contactEmailInput, setContactEmailInput] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const heroPhotoRef = useRef(null);

  // Scroll-reveal animations on main content sections
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -20% 0px' }
    );

    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [positions, skills, exampleWork, activePositionId]);


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

  // Lock background scrolling when modal is open
  useEffect(() => {
    const isModalOpen = selectedSkill || selectedWork;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedSkill, selectedWork]);

  // Apply body styles: use --page-bg for smooth transition; light theme gets auto-contrast
  useEffect(() => {
    document.body.className = `${theme}-theme`;
    const bg = theme === 'light' ? (settings.lightBg || '#f8fafc') : (settings.darkBg || '#0f172a');
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmailInput.trim() || !contactMessage.trim()) {
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        name: contactName.trim(),
        email: contactEmailInput.trim(),
        message: contactMessage.trim(),
        createdAt: serverTimestamp(),
        // Optional: store intended recipient if set
        recipient: settings.contactEmail || null,
      });
      setContactSent(true);
      setContactName('');
      setContactEmailInput('');
      setContactMessage('');
      setTimeout(() => setContactSent(false), 4500);
    } catch (err) {
      console.error('Contact submission failed', err);
      alert('Unable to send message right now. Please try again later.');
    }
  };

  const activePosition = positions.find(p => p.id === activePositionId);
  const activeSkills = activePosition
    ? skills.filter(s => activePosition.skillIds?.includes(s.id))
    : [];
  const activeExampleWork = activePosition
    ? exampleWork.filter(w => activePosition.exampleWorkIds?.includes(w.id))
    : [];

  const renderAnimatedText = (text) => {
    if (!text) return null;
    return (
      <span className="letter-animate" aria-hidden="true">
        {Array.from(text).map((char, idx) => (
          <span
            key={`${char}-${idx}`}
            style={{ '--letter-delay': `${idx * 0.035}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    );
  };

  const getMapEmbedUrl = (query) => {
    if (!query) return '';
    const clean = encodeURIComponent(query.trim());
    return `https://www.google.com/maps?q=${clean}&output=embed`;
  };

  const defaultLayout = [
    { id: 'hero', label: 'Hero', enabled: true, animation: 'fade' },
    { id: 'roles', label: 'Roles', enabled: true, animation: 'slide' },
    { id: 'skills', label: 'Skills', enabled: true, animation: 'zoom' },
    { id: 'work', label: 'Example Work', enabled: true, animation: 'fade' },
    { id: 'map', label: 'Where am I staying', enabled: true, animation: 'slide' },
    { id: 'contact', label: 'Contact', enabled: true, animation: 'fade' },
    { id: 'footer', label: 'Footer', enabled: true, animation: 'fade' },
  ];

  const mergeLayout = (current) => {
    const seen = new Map((current || []).map((item) => [item.id, item]));
    const merged = defaultLayout.map((def) => ({ ...def, ...seen.get(def.id) }));
    // Include any extra sections that user added, appended at the end
    (current || []).forEach((item) => {
      if (!merged.find((m) => m.id === item.id)) merged.push(item);
    });
    return merged;
  };

  const layoutConfig = mergeLayout(Array.isArray(settings.layout) ? settings.layout : defaultLayout);

  const renderSection = (section) => {
    const key = section.id;
    const className = `reveal anim-${section.animation || 'fade'}`;

    switch (section.id) {
      case 'hero':
        return (
          <div key={key}>
            <header className="container hero" style={{ padding: '6rem 1rem 4rem' }}>
              <div className="hero-inner">
                <div className="hero-text">
                  <h1 style={{ fontSize: `${settings.fontSizeHead}rem`, margin: 0 }}>{settings.name}</h1>
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
                </div>

                {settings.profilePic && (
                  <div className="hero-photo" ref={heroPhotoRef}>
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
                  </div>
                )}
              </div>

              <div className="scroll-prompt" aria-hidden="true">
                <span>Scroll down to learn more</span>
                <span className="scroll-arrow">↓</span>
              </div>
            </header>
          </div>
        );

      case 'roles':
        return (
          <div key={key} className={className} style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} aria-label="Roles that I'm specialized in">{renderAnimatedText("Roles that I'm specialized in")}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Click a role to see relevant skills and projects</p>
          </div>
        );

      case 'skills':
        return (
          <div key={key} className={className}>
            <div style={{ justifyContent: 'center' }}>
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
            </div>

            <div className="skills-grid" style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${settings.skillCardSize}px, 1fr))`,
            }}>
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
          </div>
        );

      case 'work':
        return (
          <div key={key} className={className}>
            {activeExampleWork.length > 0 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '3rem' }}>
                  <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem' }} aria-label="Example Work">{renderAnimatedText('Example Work')}</h2>
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
          </div>
        );

      case 'map':
        return (
          <section key={key} className={className} style={{ padding: '3rem 1rem' }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} aria-label="Where am I staying">{renderAnimatedText('Where am I staying')}</h2>
              <div
                style={{
                  margin: '1.5rem auto 0',
                  maxWidth: '900px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              >
                {settings.mapQuery ? (
                  <iframe
                    title="Location map"
                    src={getMapEmbedUrl(settings.mapQuery)}
                    loading="lazy"
                    style={{ width: '100%', height: '420px', border: 0 }}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                    Set a location in the admin panel to show the map here.
                  </div>
                )}
              </div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                This map is generated from the address or area set in the admin panel.
              </p>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section key={key} className={className} style={{ padding: '3rem 1rem' }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} aria-label="Contact">{renderAnimatedText('Contact')}</h2>
              <br />
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
                Reach out via email, phone, or WhatsApp – or use the form below.
              </p>

              <div
                className="contact-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                {settings.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="contact-card">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <strong>Email</strong>
                      <span>{settings.contactEmail}</span>
                    </div>
                    <img src={EmailIcon} className="contact-icon" alt="Email" />
                  </a>
                )}
                {settings.contactPhone && (
                  <a href={`tel:${settings.contactPhone}`} className="contact-card">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <strong>Phone</strong>
                      <span>{settings.contactPhone}</span>
                    </div>
                    <img src={CallIcon} className="contact-icon" alt="Phone" />
                  </a>
                )}
                {settings.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${settings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-card"
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <strong>WhatsApp</strong>
                      <span>{settings.contactWhatsApp}</span>
                    </div>
                    <img src={WhatsappIcon} className="contact-icon" alt="WhatsApp" />
                  </a>
                )}
              </div>

              <div className="contact-form-wrapper" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <form onSubmit={handleContactSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your Name"
                    required
                  />
                  <input
                    value={contactEmailInput}
                    onChange={(e) => setContactEmailInput(e.target.value)}
                    placeholder="Your Email"
                    type="email"
                    required
                  />
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Your Message"
                    rows={5}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '1rem' }}
                    disabled={!contactName.trim() || !contactEmailInput.trim() || !contactMessage.trim()}
                  >
                    Send message
                  </button>
                  {contactSent && (
                    <p style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      Thanks! Your message was submitted.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer
            key={key}
            className="main-footer"
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="main-page" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Animation (canvas particles) */}
      {settings.animEnabled && (
        <ParticleBackground
          theme={theme}
          settings={settings}
          selectedSkill={selectedSkill}
        />
      )}

      {/* Optional background graphic overlay */}
      {settings.siteGraphicUrl && (
        <div
          className="site-graphic"
          style={{
            backgroundImage: `url(${settings.siteGraphicUrl})`,
            opacity: typeof settings.siteGraphicOpacity === 'number' ? settings.siteGraphicOpacity : 0.15,
          }}
        />
      )}

      {/* Content Layer */}
      <main style={{ position: 'relative', flex: 1 }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            position: 'fixed',
            top: 18,
            right: 18,
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '999px',
            padding: '12px',
            fontSize: '1.35rem',
            cursor: 'pointer',
            zIndex: 1001,
            color: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>

        {layoutConfig.filter((s) => s.enabled).map((section) => renderSection(section))}

        {/* Skill Modal */}
        {selectedSkill && (
          <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="skill-orbit">
                {[...Array(8)].map((_, index) => (
                  <span key={index} className={`orbit-dot orbit-dot-${index}`} />
                ))}
              </div>
              <div style={{ maxHeight: 'calc(90vh - 5rem)', overflowY: 'auto' }}>
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
          </div>
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

      </main>
    </div>
  );
}

export default MainPage;

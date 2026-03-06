/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useRef } from 'react';

export default function ParticleBackground({ theme, settings, selectedSkill }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const particles = [];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      // Re-scatter particles across the new viewport
      particles.forEach((p) => {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
      });
    };

    window.addEventListener('resize', handleResize);

    const density = typeof settings.bgDensity === 'number' ? settings.bgDensity : 50;
    const opacity = typeof settings.bgOpacity === 'number' ? settings.bgOpacity : 0.55;
    const sizeBase = typeof settings.bgDotSize === 'number' ? settings.bgDotSize : 2;
    const moveEnabled = settings.bgMoveEnabled ?? true;
    const moveSpeed = typeof settings.bgMoveSpeed === 'number' ? Math.min(Math.max(settings.bgMoveSpeed, 0.4), 6) : 1;
    const moveDirection = settings.bgMoveDirection || 'none';
    const moveRandom = settings.bgMoveRandom ?? true;
    const moveStraight = settings.bgMoveStraight ?? false;
    const outMode = settings.bgMoveOutMode || 'out';
    const linksEnabled = settings.bgLinksEnabled ?? false;
    const linksDistance = typeof settings.bgLinksDistance === 'number' ? settings.bgLinksDistance : 120;
    const linksOpacity = typeof settings.bgLinksOpacity === 'number' ? settings.bgLinksOpacity : 0.3;
    const linksWidth = typeof settings.bgLinksWidth === 'number' ? settings.bgLinksWidth : 1;
    const linksColorMode = settings.bgLinksColorMode || 'match';
    const trailEnabled = settings.bgTrailEnabled ?? false;
    const trailLength = typeof settings.bgTrailLength === 'number' ? settings.bgTrailLength : 8;
    const trailOpacity = typeof settings.bgTrailOpacity === 'number' ? settings.bgTrailOpacity : 0.25;
    const zLayers = typeof settings.bgZLayers === 'number' ? settings.bgZLayers : 24;
    const hoverMode = settings.bgHoverMode || 'none';
    const clickMode = settings.bgClickMode || 'none';

    const particleColor = theme === 'light' ? (settings.lightAnimColor || '#e2e8f0') : (settings.darkAnimColor || '#f8fafc');
    const pageBg = theme === 'light' ? (settings.lightBg || '#f8fafc') : (settings.darkBg || '#0f172a');

    const hexToRgb = (hex) => {
      const n = hex.replace('#', '');
      if (n.length !== 6) return { r: 0, g: 0, b: 0 };
      const r = parseInt(n.slice(0, 2), 16) || 0;
      const g = parseInt(n.slice(2, 4), 16) || 0;
      const b = parseInt(n.slice(4, 6), 16) || 0;
      return { r, g, b };
    };
    const bgRgb = hexToRgb(pageBg);

    const count = Math.round((density / 100) * 220);

    const rand = (min, max) => min + Math.random() * (max - min);

    const baseDir = (() => {
      switch (moveDirection) {
        case 'top': return { x: 0, y: -1 };
        case 'bottom': return { x: 0, y: 1 };
        case 'left': return { x: -1, y: 0 };
        case 'right': return { x: 1, y: 0 };
        default: return { x: 0.4, y: 1 };
      }
    })();

    for (let i = 0; i < count; i++) {
      const z = rand(0.4, 1.4);
      const speedMul = moveEnabled ? (moveRandom ? rand(0.5, 1.5) : 1) : 0;
      const spd = moveSpeed * speedMul / z;
      let vx;
      let vy;
      if (moveStraight) {
        vx = baseDir.x * spd;
        vy = baseDir.y * spd;
      } else {
        const angle = Math.atan2(baseDir.y, baseDir.x) + (moveRandom ? rand(-0.8, 0.8) : 0);
        vx = Math.cos(angle) * spd;
        vy = Math.sin(angle) * spd;
      }
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size: rand(sizeBase * 0.4, sizeBase * 1.4),
        z,
      });
    }

    let lastTime = performance.now();

    // Interactivity state
    const pointer = {
      x: 0,
      y: 0,
      active: false,
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;

      if (clickMode === 'push') {
        for (let i = 0; i < 10; i++) {
          const z = rand(0.4, 1.4);
          const speedMul = moveEnabled ? (moveRandom ? rand(0.5, 1.5) : 1) : 0;
          const spd = moveSpeed * speedMul / z;
          const angle = Math.random() * Math.PI * 2;
          const vx = Math.cos(angle) * spd;
          const vy = Math.sin(angle) * spd;
          particles.push({
            x: cx,
            y: cy,
            vx,
            vy,
            size: rand(sizeBase * 0.4, sizeBase * 1.4),
            z,
          });
        }
      } else if (clickMode === 'remove') {
        particles.splice(0, Math.min(20, particles.length));
      } else if (clickMode === 'repulse') {
        particles.forEach((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * moveSpeed * 1.5;
            p.vy += (dy / dist) * force * moveSpeed * 1.5;
          }
        });
      } else if (clickMode === 'bubble') {
        particles.forEach((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 160) {
            p.size *= 1.6;
          }
        });
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);

    const step = (time) => {
      const dt = (time - lastTime) / 16.67;
      lastTime = time;

      if (!trailEnabled) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${trailOpacity})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();

      // compute scroll/parallax once
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const parallaxFactor = 0.1;

      // Draw connections first (thin lines)
      if (linksEnabled) {
        ctx.lineWidth = linksWidth;
        ctx.globalAlpha = linksOpacity;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const aRenderY = a.y - (scrollY * parallaxFactor) / a.z;
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const bRenderY = b.y - (scrollY * parallaxFactor) / b.z;
            const dx = a.x - b.x;
            const dy = aRenderY - bRenderY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= linksDistance) {
              if (linksColorMode === 'random') {
                ctx.strokeStyle = Math.random() > 0.5 ? '#22d3ee' : '#a855f7';
              } else {
                ctx.strokeStyle = particleColor;
              }
              ctx.beginPath();
              ctx.moveTo(a.x, aRenderY);
              ctx.lineTo(b.x, bRenderY);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw particles

      for (const p of particles) {
        if (moveEnabled) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (outMode === 'bounce') {
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        } else {
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }

        const alpha = opacity * (0.6 + 0.4 * (1 / p.z));
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = alpha;

        const renderY = p.y - (scrollY * parallaxFactor) / p.z; // invert parallax: particles move opposite scroll

        // Hover interactivity
        let radius = p.size;
        if (pointer.active && hoverMode !== 'none') {
          const dx = p.x - pointer.x;
          const dy = renderY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (hoverMode === 'bubble' && dist < 150) {
            radius = p.size * 1.8;
          } else if (hoverMode === 'grab' && dist < 140) {
            // Extra grab line to cursor
            ctx.save();
            ctx.globalAlpha = linksOpacity;
            ctx.strokeStyle = particleColor;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, renderY);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, renderY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [theme, settings, selectedSkill]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-bg ${selectedSkill ? 'particle-bg--active' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}


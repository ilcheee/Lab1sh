import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const COUNT = 65;
    const particles = Array.from({ length: COUNT }, () => {
      const r = Math.random() * 0.5 + 1.5;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r,
        currentRadius: r,
      };
    });

    const mouse = { x: -9999, y: -9999 };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        const proximity = Math.max(0, 1 - md / 80);

        const targetRadius = p.r + proximity * (4 - p.r);
        p.currentRadius = p.currentRadius + (targetRadius - p.currentRadius) * 0.15;

        const alpha = 0.6 + proximity * 0.4;
        const blur = proximity * 8;

        ctx.shadowBlur = blur;
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, background: 'transparent', pointerEvents: 'none' }}
    />
  );
}

function StatCard({ value, label }) {
  return (
    <div style={{
      padding: '32px 24px', textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function About() {
  const [stats, setStats] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    API.get('/dashboard/public-stats').then(r => setStats(r.data)).catch(() => {});
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      setParallax({ x: -nx * 8, y: -ny * 8 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        style={{ background: '#000', ...GRID_BG, padding: '120px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <ParticleCanvas />
        <div style={{
          maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1,
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          transform: heroVisible
            ? `translate(${parallax.x}px, ${parallax.y}px)`
            : `translate(${parallax.x}px, calc(${parallax.y}px + 20px))`,
        }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 500,
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '1px', marginBottom: 24,
            padding: '4px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25,
          }}>About</span>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, color: '#fff', letterSpacing: '-3px', lineHeight: 1.0, marginBottom: 24 }}>
            A place for ideas<br />to breathe.
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, lineHeight: 1.75, maxWidth: 460, margin: '0 auto' }}>
            Built for writers and readers who care about quality over quantity. No algorithms, no noise.
          </p>
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '48px',
          }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              letterSpacing: '0.8px', marginBottom: 20,
            }}>Our Mission</span>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 20 }}>
              Writing that matters, to people who care.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              We built this platform because we believe great ideas deserve a great home. Not a social media feed fighting for attention, but a quiet space where thought can flourish.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.8 }}>
              Whether you're sharing research, stories, tutorials, or opinions — this is your space. Write it. Own it.
            </p>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <StatCard value={stats?.posts ?? '—'} label="Published Posts" />
            <StatCard value={stats?.categories ?? '—'} label="Topics" />
            <StatCard value={stats?.users ?? '—'} label="Writers" />
            <StatCard value={stats?.comments ?? '—'} label="Comments" />
          </div>
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', marginBottom: 24 }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { title: 'Open', desc: 'Anyone can read. Registered users can write. No paywalls.' },
              { title: 'Clean', desc: 'No ads, no tracking pixels, no engagement bait.' },
              { title: 'Yours', desc: "Your words belong to you. Always." },
            ].map(({ title, desc }) => (
              <div key={title} style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '28px 24px',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{title}</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/blog" className="ubt-btn ubt-btn-primary" style={{ padding: '11px 28px', fontSize: 15 }}>
              Start Reading
            </Link>
            <Link to="/register" className="ubt-btn ubt-btn-secondary" style={{ padding: '11px 28px', fontSize: 15 }}>
              Start Writing
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

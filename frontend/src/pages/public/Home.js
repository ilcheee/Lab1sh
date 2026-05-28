import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

// ── Particle constellation canvas ──────────────────────────
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

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

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
      const spread = Math.min(scrollY / 400, 1.8);

      for (const p of particles) {
        p.x += p.vx * (1 + spread * 0.6);
        p.y += p.vy * (1 + spread * 0.6);
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
      window.removeEventListener('scroll', onScroll);
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

// ── Animated count-up number ────────────────────────────────
function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const numValue = parseInt(value, 10);
  const isNum = !isNaN(numValue);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView && isNum) {
      const ctrl = animate(0, numValue, {
        duration: 1.2,
        ease: 'easeOut',
        onUpdate: v => setDisplay(Math.round(v)),
      });
      return () => ctrl.stop();
    }
  }, [inView, isNum, numValue]);

  return <span ref={ref}>{isNum ? display : value}</span>;
}

// ── Stat card ───────────────────────────────────────────────
function StatCard({ value, label, to, borderRight }) {
  const [hovered, setHovered] = useState(false);
  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '36px 24px', textAlign: 'center',
        borderRight: borderRight ? '1px solid rgba(255,255,255,0.07)' : 'none',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
        background: hovered && to ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.15s',
        cursor: to ? 'pointer' : 'default',
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>
        <AnimatedNumber value={value} />
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

// ── Post card ───────────────────────────────────────────────
function PostCard({ post, index = 0 }) {
  const excerpt = stripHtml(post.permbajtja || '');
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: '#0d0d0d',
            border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 8, padding: '24px', height: '100%',
            display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s',
          }}
        >
          {post.kategoria && (
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>{post.kategoria}</span>
          )}
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: 10, letterSpacing: '-0.2px' }}>{post.titulli}</h3>
          {excerpt && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
              {excerpt.length > 120 ? excerpt.slice(0, 120) + '…' : excerpt}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{post.autori || 'Anonymous'}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{fmtDate(post.created_at)}</span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function Skeleton() {
  return <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, height: 220, animation: 'skpulse 1.4s ease-in-out infinite' }} />;
}

// ── Main component ───────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState('idle');
  const [writeModal, setWriteModal] = useState(null);

  const handleHeroWrite = (e) => {
    if (user?.role_id >= 7) {
      e.preventDefault();
      setWriteModal('no_permission');
    }
  };

  useEffect(() => {
    Promise.all([
      API.get('/posts?limit=6').catch(() => ({ data: [] })),
      API.get('/dashboard/public-stats').catch(() => ({ data: null })),
    ]).then(([pr, sr]) => {
      setPosts(Array.isArray(pr.data) ? pr.data : []);
      setStats(sr.data);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubState('loading');
    try { await API.post('/newsletter/subscribe', { email }); } catch {}
    setSubState('done');
  };

  return (
    <PublicLayout>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @media(max-width:640px){
          .hero-actions { flex-direction:column; align-items:stretch !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .posts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ background: '#000', ...GRID_BG, padding: '120px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ fontSize: 'clamp(52px, 9vw, 88px)', fontWeight: 800, color: '#fff', letterSpacing: '-3px', lineHeight: 1.0, marginBottom: 28 }}
          >
            Write.<br />Read.<br />Connect.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, lineHeight: 1.75, maxWidth: 460, margin: '0 auto 44px' }}
          >
            A platform for writers, thinkers, and readers.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/blog" className="ubt-btn ubt-btn-primary" style={{ padding: '11px 28px', fontSize: 15 }}>
              Start Reading
            </Link>
            {user ? (
              <Link to="/blog/new" onClick={handleHeroWrite} className="ubt-btn ubt-btn-secondary" style={{ padding: '11px 28px', fontSize: 15 }}>
                Write a Post
              </Link>
            ) : (
              <Link to="/register" className="ubt-btn ubt-btn-secondary" style={{ padding: '11px 28px', fontSize: 15 }}>
                Start Writing
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ background: '#000' }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard value={loading ? '—' : (stats?.posts ?? '0')} label="Posts" to="/blog" borderRight />
          <StatCard value={loading ? '—' : (stats?.categories ?? '0')} label="Categories" to="/blog" borderRight />
          <StatCard value={loading ? '—' : (stats?.users ?? '0')} label="Writers" borderRight />
          <StatCard value={loading ? '—' : (stats?.comments ?? '0')} label="Comments" />
        </div>
      </section>

      {/* ══ LATEST POSTS ══ */}
      <section id="posts" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>Latest Posts</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Fresh articles from the community</p>
            </div>
            <Link to="/blog" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >View all →</Link>
          </div>

          {loading ? (
            <div className="posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
              No published posts yet.
            </div>
          ) : (
            <div className="posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '56px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 420 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: 10 }}>Stay in the loop</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.7 }}>Get the latest posts delivered to your inbox. No spam, ever.</p>
            </div>
            <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
              {subState === 'done' ? (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '14px 20px', color: '#22c55e', fontSize: 14, fontWeight: 500 }}>
                  ✓ You're subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10 }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="ubt-input" style={{ flex: 1 }} />
                  <button type="submit" disabled={subState === 'loading'} className="ubt-btn ubt-btn-primary" style={{ padding: '10px 20px', opacity: subState === 'loading' ? 0.6 : 1, flexShrink: 0 }}>
                    {subState === 'loading' ? '…' : 'Subscribe'}
                  </button>
                </form>
              )}
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 10 }}>Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={writeModal === 'no_permission'}
        title="Insufficient privileges"
        message={`Your current role (${user?.role_id === 8 ? 'Guest' : 'Member'}) does not allow creating posts. Contact an administrator to request the Author role.`}
        onConfirm={() => setWriteModal(null)}
        confirmLabel="Got it"
        onCancel={() => setWriteModal(null)}
        hideCancelButton
        borderAccent="#e53e3e"
      />
    </PublicLayout>
  );
}

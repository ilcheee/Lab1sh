import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';

const ACCENT_PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a78bfa'];
const BG_PALETTE = [
  'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 60%, #16213e 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 60%, #0a1a12 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #1f1a0a 60%, #1a1200 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #1f0a18 60%, #180011 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #0a1a1f 60%, #001820 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #150a1f 60%, #100018 100%)',
];

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n ?? 0);

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
};

const HeartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

export default function TrendingPage() {
  const [[page, direction], setPage] = useState([0, 1]);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const INTERVAL = 4000;

  useEffect(() => {
    API.get('/posts/trending')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((p, i) => ({
          ...p,
          accent: ACCENT_PALETTE[i % ACCENT_PALETTE.length],
          bg: BG_PALETTE[i % BG_PALETTE.length],
        }));
        setPosts(mapped);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const paginate = (delta) => {
    if (!posts.length) return;
    setPage(([p]) => {
      const next = ((p + delta) % posts.length + posts.length) % posts.length;
      return [next, delta];
    });
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  const goTo = (idx) => {
    setPage(([p]) => [idx, idx >= p ? 1 : -1]);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (paused || !posts.length) return;
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      setProgress(pct);
      if (elapsed >= INTERVAL) { paginate(1); }
    };
    progressRef.current = setInterval(tick, 30);
    return () => clearInterval(progressRef.current);
  }, [paused, page, posts.length]);

  const safeIndex = posts.length > 0 ? Math.min(page, posts.length - 1) : 0;
  const post = posts[safeIndex];

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ minHeight: 'calc(100vh - 60px)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading trending posts…</div>
        </div>
      </PublicLayout>
    );
  }

  if (!posts.length) {
    return (
      <PublicLayout>
        <div style={{ minHeight: 'calc(100vh - 60px)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.07)', letterSpacing: '-3px' }}>Trending</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No posts yet. Check back soon.</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: 'relative', minHeight: 'calc(100vh - 60px)', overflow: 'hidden', background: '#000' }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={safeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              background: post.bg,
              display: 'flex', alignItems: 'center',
            }}
          >
            {/* Grid overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              pointerEvents: 'none',
            }} />

            {/* Accent glow */}
            <div style={{
              position: 'absolute', top: '20%', right: '15%',
              width: 400, height: 400, borderRadius: '50%',
              background: `radial-gradient(circle, ${post.accent}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px', width: '100%' }}>

              {/* Rank + badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}
              >
                <span style={{
                  fontSize: 72, fontWeight: 900, lineHeight: 1,
                  color: 'rgba(255,255,255,0.07)', letterSpacing: '-4px',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  #{safeIndex + 1}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 14px', borderRadius: 20,
                  background: post.accent + '22',
                  border: `1px solid ${post.accent}55`,
                  fontSize: 11, fontWeight: 700, color: post.accent,
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  <TrendingIcon /> TRENDING
                </span>
              </motion.div>

              {/* Category */}
              {post.kategoria && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  style={{
                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16,
                  }}
                >
                  {post.kategoria}
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22 }}
                style={{
                  fontSize: 'clamp(28px, 5vw, 52px)',
                  fontWeight: 800, color: '#fff', letterSpacing: '-1.5px',
                  lineHeight: 1.1, marginBottom: 22, maxWidth: 700,
                }}
              >
                {post.titulli}
              </motion.h1>

              {/* Excerpt */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28 }}
                style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7,
                  maxWidth: 580, marginBottom: 28,
                }}
              >
                {(() => { const t = stripHtml(post.permbajtja || ''); return t.length > 300 ? t.slice(0, 300) + '…' : t; })()}
              </motion.p>

              {/* Author + stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.34 }}
                style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: post.accent + '33', border: `1px solid ${post.accent}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, color: post.accent,
                  }}>
                    {(post.autori || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{post.autori || 'Anonymous'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{fmtDate(post.created_at)}</div>
                  </div>
                </div>

                <>
                  <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: post.like_count > 0 ? post.accent : 'rgba(255,255,255,0.2)' }}><HeartIcon /></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: post.like_count > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                      {fmtNum(post.like_count)}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>likes</span>
                  </div>
                </>
              </motion.div>

              {/* Read button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Link
                  to={`/blog/${post.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    background: '#fff', color: '#000',
                    border: 'none', borderRadius: 10,
                    fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: "'Geist', system-ui, sans-serif",
                    letterSpacing: '-0.1px', textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.87'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  Read Post →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {[{ side: 'left', delta: -1, label: '‹' }, { side: 'right', delta: 1, label: '›' }].map(({ side, delta, label }) => (
          <button
            key={side}
            onClick={() => paginate(delta)}
            style={{
              position: 'absolute', [side]: 20, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              width: 44, height: 44, borderRadius: '50%',
              fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', fontFamily: 'system-ui',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >{label}</button>
        ))}

        {/* Dots + progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 20 }}>
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === safeIndex ? 22 : 7, height: 7, borderRadius: 4,
                  background: i === safeIndex ? '#fff' : 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              style={{
                height: '100%',
                background: post?.accent || '#fff',
                width: `${progress}%`,
                transition: paused ? 'none' : 'width 0.03s linear',
              }}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

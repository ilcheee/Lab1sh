import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const COUNT = 50;
    const particles = Array.from({ length: COUNT }, () => {
      const r = Math.random() * 0.5 + 1.2;
      return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r, currentRadius: r };
    });
    const mouse = { x: -9999, y: -9999 };
    const onMouseMove = (e) => { const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; };
    window.addEventListener('mousemove', onMouseMove);
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mouseDists = particles.map(p => { const dx = p.x - mouse.x, dy = p.y - mouse.y; return Math.sqrt(dx * dx + dy * dy); });
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const md = mouseDists[particles.indexOf(p)];
        const proximity = Math.max(0, 1 - md / 80);
        p.currentRadius = p.currentRadius + (p.r + proximity * (4 - p.r) - p.currentRadius) * 0.15;
        ctx.shadowBlur = proximity * 8; ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + proximity * 0.5})`; ctx.fill(); ctx.shadowBlur = 0;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            const mg = Math.max(0, 1 - Math.min(mouseDists[i], mouseDists[j]) / 110);
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.5, 0.2 * (1 - d / 130) + mg * 0.25)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

const SearchIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function ResultCard({ post, index }) {
  const excerpt = stripHtml(post.permbajtja || '');
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, delay: index * 0.05 }}
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 10,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {post.kategoria && (
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '2px 10px', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.4px',
          }}>{post.kategoria}</span>
        )}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.4, letterSpacing: '-0.2px' }}>
          {post.titulli}
        </h3>
        {excerpt && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, marginBottom: 12 }}>
            {excerpt.length > 200 ? excerpt.slice(0, 200) + '…' : excerpt}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{post.autori || 'Anonymous'}</span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{fmtDate(post.created_at)}</span>
        </div>
      </Link>
    </motion.article>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const doSearch = useCallback((q, cat) => {
    setLoading(true); setSearched(true);
    let url = '/posts/search?';
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (cat) url += `category_id=${cat}`;
    API.get(url)
      .then(res => { setResults(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setResults([]); setLoading(false); });
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val && !categoryId) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(() => doSearch(val, categoryId), 300);
  };

  const handleCategoryChange = (val) => {
    setCategoryId(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, val), 300);
  };

  return (
    <PublicLayout>
      <div style={{ background: '#000', ...GRID_BG, minHeight: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px',
          display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>

          {/* ── Left: search + results ── */}
          <div style={{ flex: '0 0 58%', minWidth: 280 }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 20 }}
            >
              Search Posts
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="Search posts, topics, ideas…"
                  className="ubt-input"
                  style={{ paddingLeft: 42, fontSize: 16, width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                />
              </div>

              <select
                value={categoryId}
                onChange={e => handleCategoryChange(e.target.value)}
                className="ubt-input"
                style={{ width: '100%', marginBottom: 28, boxSizing: 'border-box', color: categoryId ? '#fff' : 'rgba(255,255,255,0.4)' }}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.emertimi}</option>
                ))}
              </select>
            </motion.div>

            {loading && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
                Searching…
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '40px 24px',
                  background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, color: 'rgba(255,255,255,0.3)', fontSize: 14,
                }}
              >
                <svg style={{ marginBottom: 14, opacity: 0.3 }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <div>No results found for <strong style={{ color: 'rgba(255,255,255,0.5)' }}>"{query}"</strong></div>
                <div style={{ marginTop: 6, fontSize: 13 }}>Try different keywords or browse by category</div>
              </motion.div>
            )}

            {!loading && !searched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}
              >
                Type above to search published posts
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {results.map((post, i) => (
                <ResultCard key={post.id} post={post} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Right: icon + tagline ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ flex: 1, minWidth: 200, paddingTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}
          >
            <div style={{ padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, display: 'inline-flex', marginBottom: 8 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Search Anything
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, lineHeight: 1.75, maxWidth: 280 }}>
              Discover posts, topics and ideas — anything can be found here.
            </p>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '⚡', text: 'Real-time results as you type' },
                { icon: '⊞', text: 'Filter by category' },
                { icon: '↗', text: 'Relevance-ranked results' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, width: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        select.ubt-input option { background: #1a1a1a; color: #fff; }
        @media (max-width: 700px) {
          .search-right { display: none !important; }
        }
      `}</style>
    </PublicLayout>
  );
}

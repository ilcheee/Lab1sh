import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

function PostCard({ post }) {
  const excerpt = stripHtml(post.permbajtja || '');
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#0d0d0d',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 8, padding: '24px', height: '100%',
          display: 'flex', flexDirection: 'column',
          transition: 'border-color 0.15s',
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: 10, letterSpacing: '-0.2px' }}>
          {post.titulli}
        </h3>
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
  );
}

function Skeleton() {
  return <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, height: 200, animation: 'skpulse 1.4s ease-in-out infinite' }} />;
}

export default function CategoryPosts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    API.get('/categories')
      .then(res => {
        const cats = Array.isArray(res.data) ? res.data : [];
        const found = cats.find(c => c.slug === slug);
        setAllCategories(cats.filter(c => c.slug !== slug));
        if (!found) { setError('Category not found.'); setLoading(false); return null; }
        setCategory(found);
        return API.get(`/posts?category_id=${found.id}&statusi=published`);
      })
      .then(res => {
        if (!res) return;
        setPosts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => { setError('Something went wrong.'); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ height: 140, borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 40, animation: 'skpulse 1.4s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
        </div>
      </div>
    </PublicLayout>
  );

  if (error || !category) return (
    <PublicLayout>
      <div style={{ maxWidth: 720, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'rgba(255,255,255,0.06)', letterSpacing: '-4px', marginBottom: 20 }}>404</div>
        <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 12 }}>Category not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 32 }}>{error}</p>
        <Link to="/blog" className="ubt-btn ubt-btn-primary">← Back to Home</Link>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>

      {/* ── Category header ── */}
      <div style={{ background: '#000', ...GRID_BG, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Topics</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
            <span style={{ color: '#fff', fontSize: 13 }}>{category.emertimi}</span>
          </nav>

          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 500,
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '0.5px', marginBottom: 16,
            padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25,
          }}>Topic</span>

          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 16 }}>
            {category.emertimi}
          </h1>

          {category.pershkrimi && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.7, maxWidth: 520, marginBottom: 24 }}>
              {category.pershkrimi}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{posts.length}</strong> posts
            </span>
            <Link to="/blog" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← All topics</Link>
          </div>
        </div>
      </div>

      {/* ── Posts grid ── */}
      <section style={{ padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {posts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 24px',
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: 'rgba(255,255,255,0.3)', fontSize: 15,
            }}>
              No published posts in this category yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {posts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Other topics ── */}
      {allCategories.length > 0 && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 40, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.2px' }}>Other Topics</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {allCategories.map(cat => {
                  return <TopicPill key={cat.id} cat={cat} />;
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

function TopicPill({ cat }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/blog/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-block',
          padding: '7px 16px',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 25,
          fontSize: 14,
          color: hovered ? '#fff' : 'rgba(255,255,255,0.55)',
          background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontWeight: 500,
        }}
      >{cat.emertimi}</span>
    </Link>
  );
}

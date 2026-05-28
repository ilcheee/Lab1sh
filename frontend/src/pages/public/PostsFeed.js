import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

function FeedCard({ post, index = 0 }) {
  const { user } = useAuth();
  const initials = (post.autori || 'A').slice(0, 2).toUpperCase();
  const excerpt = stripHtml(post.permbajtja || '');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && post.id) {
      API.get(`/posts/${post.id}/like-status`)
        .then(res => setLiked(res.data.liked))
        .catch(() => {});
    }
  }, [post.id, user]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return;
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    try {
      await API.post(`/posts/${post.id}/toggle-like`);
    } catch {
      setLiked(!newLikedState);
      setLikes(prev => newLikedState ? prev - 1 : prev + 1);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    const url = window.location.origin + `/blog/${post.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: '20px',
        marginBottom: 10,
      }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.7)',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{post.autori || 'Anonymous'}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{fmtDate(post.created_at)}</span>
            {post.kategoria && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 25, padding: '2px 10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px', flexShrink: 0 }}>
                {post.kategoria}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.2px', lineHeight: 1.4 }}>{post.titulli}</h2>
        {excerpt && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>
            {excerpt.length > 220 ? excerpt.slice(0, 220) + '…' : excerpt}
          </p>
        )}

        {/* Inline media */}
        {post.imazhi && (
          <div style={{ marginBottom: 14, borderRadius: 8, overflow: 'hidden', maxWidth: 500 }}>
            {post.imazhi.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={`http://localhost:8008${post.imazhi}`}
                controls
                style={{ width: '100%', maxWidth: 500, maxHeight: 320, borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', display: 'block' }}
              />
            ) : (
              <img
                src={`http://localhost:8008${post.imazhi}`}
                alt={post.titulli}
                style={{ width: '100%', maxWidth: 500, height: 'auto', maxHeight: 360, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', display: 'block' }}
              />
            )}
          </div>
        )}
      </Link>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 24, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          color: liked ? '#ff4444' : 'rgba(255,255,255,0.5)',
          fontSize: 13, fontFamily: "'Geist', sans-serif",
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => { if (!liked) e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { if (!liked) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          {liked ? (
            <motion.svg
              whileTap={{ scale: 1.4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              width="16" height="16" viewBox="0 0 24 24" fill="#ff4444" stroke="#ff4444" strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </motion.svg>
          ) : (
            <motion.svg
              whileTap={{ scale: 1.4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </motion.svg>
          )}
          {likes > 0 && <span>{likes}</span>}
        </button>

        <Link to={`/blog/${post.id}#comments`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none',
          background: 'transparent', border: 'none',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{(post.comments_count ?? 0) > 0 ? `Comment (${post.comments_count})` : 'Comment'}</span>
        </Link>

        <Link to={`/blog/${post.id}`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          Read more →
        </Link>

        <button onClick={handleShare} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: copied ? '#22c55e' : 'rgba(255,255,255,0.35)',
          fontSize: 13, fontFamily: "'Geist', sans-serif", padding: 0, marginLeft: 'auto',
          transition: 'color 0.15s',
        }}>
          {copied ? '✓ Copied' : '↗ Share'}
        </button>
      </div>
    </motion.article>
  );
}

function FeedSkeleton() {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px', marginBottom: 10, animation: 'skpulse 1.4s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, width: '25%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 10, width: '15%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 16, width: '70%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 12, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 12, width: '85%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
    </div>
  );
}

export default function PostsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/posts')
      .then(res => { setPosts(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setPosts([]); setLoading(false); });
  }, []);

  return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px 80px' }}>

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Feed</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 3 }}>Latest from the community</p>
          </div>
          <Link to="/blog/new" className="ubt-btn ubt-btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }}>+ Write</Link>
        </div>

        {loading ? (
          <>{[1, 2, 3, 4].map(i => <FeedSkeleton key={i} />)}</>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: 'rgba(255,255,255,0.3)' }}>
            No posts yet. <Link to="/blog/new" style={{ color: '#fff' }}>Be the first to write.</Link>
          </div>
        ) : (
          posts.map((p, i) => <FeedCard key={p.id} post={p} index={i} />)
        )}
      </div>
    </PublicLayout>
  );
}

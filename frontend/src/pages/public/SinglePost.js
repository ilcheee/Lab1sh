import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const PinSVG = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/>
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

const readTime = (html = '') =>
  Math.max(1, Math.ceil(html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200));

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

function CommentItem({ comment, user, onDeleteRequest, onPinToggle, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const [pinned, setPinned] = useState(!!comment.pinned);
  const initials = (comment.autori || 'A').slice(0, 2).toUpperCase();
  const isContributor = comment.role_id === 6;
  const canDelete = user && (user.id === comment.user_id || user.role_id <= 3);
  const canPin = user && user.role_id <= 3;

  const handlePin = async (e) => {
    e.preventDefault();
    const newPinned = !pinned;
    setPinned(newPinned);
    try {
      await API.put(`/comments/${comment.id}/pin`);
      if (onPinToggle) onPinToggle(comment.id, newPinned);
    } catch {
      setPinned(!newPinned);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: 14, padding: '20px 0',
        borderBottom: `1px solid ${pinned ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        position: 'relative',
        ...(isContributor && {
          background: 'rgba(135,206,235,0.12)',
          borderLeft: '3px solid #87CEEB',
          borderRadius: '0 12px 12px 0',
          paddingLeft: 16,
        }),
      }}
    >
      {pinned && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap',
          }}
        >
          <PinSVG size={9} /> Pinned
        </motion.div>
      )}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: isContributor ? 'rgba(135,206,235,0.2)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${isContributor ? 'rgba(135,206,235,0.4)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: 12, color: isContributor ? '#87CEEB' : 'rgba(255,255,255,0.7)',
        flexShrink: 0, fontFamily: "'Geist', sans-serif",
      }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{comment.autori || 'Anonymous'}</span>
          {isContributor && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#87CEEB',
              background: 'rgba(135,206,235,0.15)',
              border: '1px solid rgba(135,206,235,0.3)',
              borderRadius: 10, padding: '1px 7px',
              textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>Contributor</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>{fmtDate(comment.data || comment.created_at)}</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{comment.permbajtja}</p>
      </div>
      <div style={{ position: 'absolute', right: 0, top: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
        {canPin && hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={handlePin}
            title={pinned ? 'Unpin comment' : 'Pin comment'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: pinned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.15s',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = pinned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'; }}
          >
            <PinSVG size={13} />
          </motion.button>
        )}
        {canDelete && (
          <button
            onClick={() => onDeleteRequest(comment.id)}
            onMouseEnter={() => setTrashHovered(true)}
            onMouseLeave={() => setTrashHovered(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: trashHovered ? '#ff4444' : hovered ? 'rgba(255,68,68,0.6)' : 'transparent',
              transition: 'color 0.15s',
            }}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SkLine({ h = 14, w = '100%', mb = 12 }) {
  return (
    <div style={{ height: h, width: w, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: mb, animation: 'skpulse 1.4s ease-in-out infinite' }} />
  );
}

export default function SinglePost() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(() => {
    if (user?.id && id) {
      return localStorage.getItem(`liked_post_${id}_${user.id}`) === 'true';
    }
    return false;
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null });

  useEffect(() => {
    setLoading(true); setError(null);
    API.get(`/posts/${id}`)
      .then(res => {
        const p = res.data;
        setPost(p); setLikes(p.likes || 0);
        API.get(`/comments?post_id=${p.id}&_t=${Date.now()}`)
          .then(commRes => { setComments(Array.isArray(commRes.data) ? commRes.data : []); })
          .catch(err => { console.error('Comments fetch error:', err?.response?.data || err.message); })
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.error('Post fetch error:', err?.response?.data || err.message);
        setError('Post not found.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && id) {
      API.get(`/posts/${id}/like-status`)
        .then(res => {
          setLiked(res.data.liked);
          localStorage.setItem(`liked_post_${id}_${user.id}`, String(res.data.liked));
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true); setSubmitErr('');
    try {
      await API.post('/comments', { post_id: post.id, permbajtja: commentText });
      setCommentText('');
      setSuccessMsg('Comment posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      const res = await API.get(`/comments?post_id=${post.id}&_t=${Date.now()}`).catch(() => ({ data: [] }));
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubmitErr(err.response?.data?.message || 'Could not send comment.');
    } finally { setSubmitting(false); }
  };

  const handleLike = async () => {
    if (!user) return;
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    localStorage.setItem(`liked_post_${id}_${user.id}`, String(newLikedState));
    try {
      await API.post(`/posts/${post.id}/toggle-like`);
    } catch {
      setLiked(!newLikedState);
      setLikes(prev => newLikedState ? prev - 1 : prev + 1);
      localStorage.setItem(`liked_post_${id}_${user.id}`, String(!newLikedState));
    }
  };

  const handleDeleteComment = async () => {
    const { commentId } = deleteModal;
    setDeleteModal({ open: false, commentId: null });
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { /* silently fail */ }
  };

  const handleCommentPin = (commentId, newPinned) => {
    setComments(prev => {
      const updated = prev.map(c => c.id === commentId ? { ...c, pinned: newPinned ? 1 : 0 } : c);
      return [...updated].sort((a, b) => (b.pinned || 0) - (a.pinned || 0));
    });
  };

  const sortedComments = [...comments].sort((a, b) => (b.pinned || 0) - (a.pinned || 0));

  if (loading) return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <SkLine h={12} w="18%" mb={24} />
        <SkLine h={44} mb={10} />
        <SkLine h={44} w="75%" mb={28} />
        <SkLine h={12} w="35%" mb={56} />
        {[95,88,97,80,90,75].map((w, i) => <SkLine key={i} h={14} w={`${w}%`} mb={10} />)}
      </div>
    </PublicLayout>
  );

  if (error || !post) return (
    <PublicLayout>
      <div style={{ maxWidth: 720, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'rgba(255,255,255,0.08)', letterSpacing: '-4px', marginBottom: 20 }}>404</div>
        <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 12 }}>Post not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 32 }}>{error}</p>
        <Link to="/blog" className="ubt-btn ubt-btn-primary">← Back to Home</Link>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>

      {/* ══ POST HEADER ══ */}
      <div style={{ background: '#000', ...GRID_BG, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >Home</Link>
            {post.kategoria && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{post.kategoria}</span>
              </>
            )}
          </nav>

          {post.kategoria && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-block', fontSize: 11, fontWeight: 500,
                color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 20,
                padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25,
              }}
            >{post.kategoria}</motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 28,
            }}
          >{post.titulli}</motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 11, flexShrink: 0,
            }}>
              {(post.autori || 'U').slice(0, 2).toUpperCase()}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500 }}>{post.autori || 'Anonymous'}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{fmtDate(post.created_at)}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{readTime(post.permbajtja)} min read</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{comments.length} comments</span>
          </motion.div>
        </div>
      </div>

      {/* Featured image */}
      {post.imazhi && (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <img src={`http://localhost:8008${post.imazhi}`} alt={post.titulli}
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      {/* ══ POST BODY ══ */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 0' }}>
        <motion.div
          className="post-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          dangerouslySetInnerHTML={{ __html: post.permbajtja || '' }}
        />

        {/* ── Actions bar ── */}
        <div style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
            <AnimatePresence>
              {liked && (
                <motion.button
                  key="unlike-x"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 18 }}
                  onClick={handleLike}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px',
                    color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <a href="#comments" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: "'Geist', sans-serif",
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{comments.length > 0 ? `Comment (${comments.length})` : 'Comment'}</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Share</span>
            {[
              { l: 'Facebook', u: (href) => `https://www.facebook.com/sharer/sharer.php?u=${href}` },
              { l: 'Twitter',  u: (href, t) => `https://twitter.com/intent/tweet?url=${href}&text=${t}` },
              { l: 'LinkedIn', u: (href, t) => `https://www.linkedin.com/shareArticle?url=${href}&title=${t}` },
            ].map(s => (
              <button key={s.l}
                onClick={() => window.open(s.u(encodeURIComponent(window.location.href), encodeURIComponent(post.titulli)), '_blank', 'width=600,height=400')}
                style={{
                  padding: '6px 14px', borderRadius: 25,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500,
                  fontFamily: "'Geist', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >{s.l}</button>
            ))}
          </div>
        </div>

        {/* ══ COMMENTS ══ */}
        <div id="comments" style={{ marginTop: 64, paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            Comments
            <span style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 25,
              padding: '2px 10px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 500,
            }}>{comments.length}</span>
          </h2>

          {comments.length === 0 ? (
            <div style={{
              padding: '28px 24px',
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 14,
              marginBottom: 32,
            }}>No comments yet. Be the first.</div>
          ) : (
            <div style={{ marginBottom: 40 }}>
              {sortedComments.map((c, i) => (
                <CommentItem
                  key={c.id || i}
                  comment={c}
                  user={user}
                  index={i}
                  onDeleteRequest={(commentId) => setDeleteModal({ open: true, commentId })}
                  onPinToggle={handleCommentPin}
                />
              ))}
            </div>
          )}

          {/* Comment form */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.2px' }}>Leave a comment</h3>

            {!user ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 20 }}>Sign in to leave a comment.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link to="/login" className="ubt-btn ubt-btn-secondary">Log In</Link>
                  <Link to="/register" className="ubt-btn ubt-btn-primary">Sign Up</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleComment}>
                {successMsg && (
                  <div style={{
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                    color: '#22c55e', fontSize: 14, fontWeight: 500,
                  }}>✓ {successMsg}</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                    {(user.emri || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                    Commenting as <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{user.emri}</strong>
                  </span>
                </div>

                <textarea required rows={5} value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="ubt-input"
                  style={{ resize: 'vertical', minHeight: 110, lineHeight: 1.7, fontSize: 14 }}
                />
                {submitErr && <p style={{ color: '#ff4444', fontSize: 13, marginTop: 8 }}>{submitErr}</p>}

                <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button type="submit" disabled={submitting} className="ubt-btn ubt-btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? 'Posting…' : 'Post Comment'}
                  </button>
                  {commentText && (
                    <button type="button" onClick={() => setCommentText('')} className="ubt-btn ubt-btn-outline">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <div style={{ marginTop: 32 }}>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >← Back to all posts</Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.open}
        title="Delete comment"
        message="Are you sure you want to delete this comment?"
        onConfirm={handleDeleteComment}
        onCancel={() => setDeleteModal({ open: false, commentId: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDelete
      />
    </PublicLayout>
  );
}

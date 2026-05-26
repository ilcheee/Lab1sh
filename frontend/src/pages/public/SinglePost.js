import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

const readTime = (html = '') =>
  Math.max(1, Math.ceil(html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200));

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

function CommentItem({ comment }) {
  const initials = (comment.autori || 'A').slice(0, 2).toUpperCase();
  const isContributor = comment.author_role_id === 6;
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '20px 0',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      ...(isContributor && {
        background: 'rgba(135,206,235,0.12)',
        borderLeft: '3px solid #87CEEB',
        borderRadius: '0 8px 8px 0',
        paddingLeft: 16,
      }),
    }}>
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
    </div>
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
  const [submitDone, setSubmitDone] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true); setError(null);
    API.get(`/posts/${id}`)
      .then(res => {
        const p = res.data;
        setPost(p); setLikes(p.likes || 0);
        return API.get(`/comments?post_id=${p.id}`).catch(() => ({ data: [] }));
      })
      .then(res => { setComments(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Post not found.'); setLoading(false); });
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true); setSubmitErr('');
    try {
      await API.post('/comments', { post_id: post.id, permbajtja: commentText });
      setCommentText(''); setSubmitDone(true);
      const res = await API.get(`/comments?post_id=${post.id}`).catch(() => ({ data: [] }));
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubmitErr(err.response?.data?.message || 'Could not send comment.');
    } finally { setSubmitting(false); }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await API.post(`/posts/${post.id}/like`);
      setLikes(res.data.likes ?? likes + 1);
    } catch { setLikes(l => l + 1); }
    setLiked(true);
  };

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
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 500,
              color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
              letterSpacing: '0.5px', marginBottom: 20,
              padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25,
            }}>{post.kategoria}</span>
          )}

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: 28,
          }}>{post.titulli}</h1>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
          </div>
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
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.permbajtja || '' }} />

        {/* ── Actions bar ── */}
        <div style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}>
          <button onClick={handleLike} disabled={liked} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 25,
            border: `1px solid ${liked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
            background: liked ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: liked ? '#fff' : 'rgba(255,255,255,0.5)',
            fontSize: 14, fontWeight: 500, cursor: liked ? 'default' : 'pointer',
            fontFamily: "'Geist', sans-serif",
            transition: 'all 0.15s',
          }}>
            {liked ? '♥' : '♡'} {likes > 0 ? likes : ''} {liked ? 'Liked' : 'Like'}
          </button>

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
        <div style={{ marginTop: 64, paddingBottom: 80 }}>
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
              borderRadius: 8,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 14,
              marginBottom: 32,
            }}>No comments yet. Be the first.</div>
          ) : (
            <div style={{ marginBottom: 40 }}>
              {comments.map((c, i) => <CommentItem key={c.id || i} comment={c} />)}
            </div>
          )}

          {/* Comment form */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '28px' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.2px' }}>Leave a comment</h3>

            {!user ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 20 }}>Sign in to leave a comment.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link to="/login" className="ubt-btn ubt-btn-secondary">Log In</Link>
                  <Link to="/register" className="ubt-btn ubt-btn-primary">Sign Up</Link>
                </div>
              </div>
            ) : submitDone ? (
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 8, padding: '14px 18px',
                color: '#22c55e', fontSize: 14, fontWeight: 500,
              }}>✓ Comment posted successfully!</div>
            ) : (
              <form onSubmit={handleComment}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                    {(user.emri || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                    Commenting as <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{user.emri}</strong>
                  </span>
                </div>

                <textarea required rows={5} value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts…"
                  className="ubt-input"
                  style={{ resize: 'vertical', minHeight: 110, lineHeight: 1.7, fontSize: 14 }}
                />
                {submitErr && <p style={{ color: '#ff4444', fontSize: 13, marginTop: 8 }}>{submitErr}</p>}

                <div style={{ marginTop: 14 }}>
                  <button type="submit" disabled={submitting} className="ubt-btn ubt-btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? 'Posting…' : 'Post Comment'}
                  </button>
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
    </PublicLayout>
  );
}

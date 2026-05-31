import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

function StatCard({ value, label, color = '#fff' }) {
  return (
    <div style={{
      background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '24px 28px',
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, color, letterSpacing: '-1px', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function PendingPostCard({ post, onApprove, onReject, index }) {
  const excerpt = stripHtml(post.permbajtja || '');
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d0d0d',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 14, padding: '20px 24px',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Status badge */}
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 20, padding: '2px 10px', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>Pending Review</span>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.35, letterSpacing: '-0.2px' }}>
            {post.titulli}
          </h3>

          {excerpt && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>
              {excerpt.length > 180 ? excerpt.slice(0, 180) + '…' : excerpt}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
              }}>
                {(post.autori || 'A').slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{post.autori || 'Anonymous'}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{fmtDate(post.created_at)}</span>
            {post.kategoria && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '2px 9px' }}>
                  {post.kategoria}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
          <Link
            to={`/posts/edit/${post.id}`}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            ✎ Edit
          </Link>
          <button
            onClick={() => onReject(post.id)}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid rgba(255,68,68,0.25)',
              background: 'rgba(255,68,68,0.06)', color: '#ff6666',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Geist', system-ui, sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.25)'; }}
          >
            ✕ Reject
          </button>
          <button
            onClick={() => onApprove(post.id)}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid rgba(34,197,94,0.3)',
              background: 'rgba(34,197,94,0.08)', color: '#22c55e',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Geist', system-ui, sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'; }}
          >
            ✓ Approve
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RedaktorPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectModal, setRejectModal] = useState({ open: false, postId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.role_id > 3) { navigate('/profile'); return; }
    API.get('/posts/pending')
      .then(res => {
        setPendingPosts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (postId) => {
    try {
      await API.put(`/posts/${postId}/approve`, { approved: true });
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
      setApprovedToday(n => n + 1);
      showToast('Post approved and published.');
    } catch {
      showToast('Failed to approve post.', false);
    }
  };

  const openRejectModal = (postId) => {
    setRejectReason('');
    setRejectModal({ open: true, postId });
  };

  const handleReject = async () => {
    const { postId } = rejectModal;
    setRejectModal({ open: false, postId: null });
    try {
      await API.put(`/posts/${postId}/approve`, { approved: false, reason: rejectReason });
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Post rejected.');
    } catch {
      showToast('Failed to reject post.', false);
    }
  };

  return (
    <Layout>
      <div style={{ ...GRID_BG }}>
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              style={{
                position: 'fixed', top: 20, right: 20, zIndex: 9999,
                padding: '12px 20px', borderRadius: 10,
                background: toast.ok ? 'rgba(34,197,94,0.1)' : 'rgba(255,68,68,0.1)',
                border: `1px solid ${toast.ok ? 'rgba(34,197,94,0.3)' : 'rgba(255,68,68,0.3)'}`,
                color: toast.ok ? '#22c55e' : '#ff4444',
                fontSize: 13, fontWeight: 500,
              }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Redaktor Panel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Review and manage pending posts
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard value={loading ? '—' : pendingPosts.length} label="Pending Review" color="#f59e0b" />
          <StatCard value={approvedToday} label="Approved Today" color="#22c55e" />
          <StatCard value={pendingPosts.length > 0 ? '!' : '✓'} label="Queue Status" color={pendingPosts.length > 0 ? '#f59e0b' : '#22c55e'} />
        </div>

        {/* Pending posts */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            Pending Posts
            {!loading && pendingPosts.length > 0 && (
              <span style={{
                marginLeft: 10, fontSize: 12, fontWeight: 600,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                color: '#f59e0b', borderRadius: 20, padding: '2px 10px',
              }}>{pendingPosts.length}</span>
            )}
          </h2>
          <Link to="/comments" className="ubt-btn ubt-btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>
            Moderate Comments →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 140, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, animation: 'skpulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : pendingPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, color: 'rgba(255,255,255,0.3)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
              All caught up!
            </div>
            <div style={{ fontSize: 14 }}>No posts waiting for review.</div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence mode="popLayout">
              {pendingPosts.map((post, i) => (
                <PendingPostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onApprove={handleApprove}
                  onReject={openRejectModal}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Reject modal */}
        <Modal
          isOpen={rejectModal.open}
          title="Reject Post"
          message="Optionally provide a reason for rejection:"
          onConfirm={handleReject}
          onCancel={() => setRejectModal({ open: false, postId: null })}
          confirmLabel="Reject"
          cancelLabel="Cancel"
          isDelete
        >
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Reason (optional)…"
            rows={3}
            className="ubt-input"
            style={{ marginTop: 12, resize: 'vertical', fontSize: 13 }}
          />
        </Modal>
      </div>

      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

const fmtShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const ROLE_LABEL = { 1: 'Admin', 2: 'Editor', 3: 'Author' };

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
};

const postItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.07 } }),
};

export default function UserProfile() {
  const { id } = useParams();
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const isOwn = !id;
  const userId = id ? parseInt(id) : authUser?.id;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const [profileForm, setProfileForm] = useState({ emri: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [writeModal, setWriteModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, postId: null });

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }

    const fetches = [
      API.get(`/users/${userId}`).catch(() => ({ data: null })),
      API.get(`/posts?user_id=${userId}${isOwn ? '&admin=true' : ''}`).catch(() => ({ data: [] })),
    ];

    Promise.all(fetches).then(([ur, pr]) => {
      const u = ur.data;
      setProfileUser(u);
      setPosts(Array.isArray(pr.data) ? pr.data : []);
      if (isOwn && authUser) {
        setProfileForm({ emri: authUser.emri || '', email: authUser.email || '' });
      }
      setLoading(false);
    });
  }, [userId, isOwn, authUser, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      await API.put('/users/me', profileForm);
      setSaveMsg('Profile updated!');
      login({ ...authUser, ...profileForm }, localStorage.getItem('token'));
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    const { postId } = deleteModal;
    setDeleteModal({ open: false, postId: null });
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch { /* silently fail */ }
  };

  const displayUser = isOwn ? authUser : profileUser;
  const initials = (displayUser?.emri || 'U').slice(0, 2).toUpperCase();

  const tabStyle = (t) => ({
    padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
    color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.4)',
    fontFamily: "'Geist', sans-serif", fontSize: 14,
    fontWeight: activeTab === t ? 600 : 400,
    borderBottom: `2px solid ${activeTab === t ? '#fff' : 'transparent'}`,
    transition: 'all 0.15s',
  });

  if (!loading && !displayUser && !authUser) {
    return (
      <PublicLayout>
        <div style={{ textAlign: 'center', padding: '100px 24px', color: 'rgba(255,255,255,0.3)' }}>
          User not found.
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Profile header */}
      <div style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 22, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 10 }} />
                <div style={{ height: 14, width: '30%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
              {/* Avatar scale-in */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.7)',
                }}
              >{initials}</motion.div>

              {/* Profile info stagger */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {displayUser?.emri || 'User'}
                </h1>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 25, padding: '2px 10px',
                  }}>{ROLE_LABEL[displayUser?.role_id] || 'Author'}</span>
                  {displayUser?.created_at && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      Joined {fmtDate(displayUser.created_at)}
                    </span>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                  style={{ display: 'flex', gap: 20 }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                    <strong style={{ color: '#fff' }}>{posts.length}</strong> posts
                  </span>
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button style={tabStyle('posts')} onClick={() => setActiveTab('posts')}>Posts</button>
            {isOwn && <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>Settings</button>}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 80px' }}>
        {activeTab === 'posts' && (
          <div>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', marginBottom: 10, height: 72 }} />
              ))
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                No published posts yet.
                {isOwn && (
                  <div style={{ marginTop: 14 }}>
                    {authUser?.role_id <= 6 ? (
                      <Link to="/blog/new" className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>Write your first post</Link>
                    ) : (
                      <button onClick={() => setWriteModal(true)} className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>Write your first post</button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              posts.map((post, i) => {
                const canDelete = authUser && (post.user_id === authUser.id || authUser.role_id <= 2);
                return (
                  <motion.div
                    key={post.id}
                    custom={i}
                    variants={postItemVariants}
                    initial="hidden"
                    animate="show"
                    style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'stretch' }}
                  >
                    <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <div
                        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', transition: 'border-color 0.15s', height: '100%', boxSizing: 'border-box' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                      >
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{post.titulli}</h3>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                          {fmtShort(post.created_at)}{post.kategoria && ` · ${post.kategoria}`}
                        </div>
                      </div>
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => setDeleteModal({ open: true, postId: post.id })}
                        title="Delete post"
                        style={{
                          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 16, padding: '0 16px', cursor: 'pointer',
                          color: 'rgba(255,68,68,0.5)', transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,68,68,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'settings' && isOwn && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 22 }}>Edit Profile</h2>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={profileForm.emri}
                  onChange={e => setProfileForm(p => ({ ...p, emri: e.target.value }))}
                  required
                  className="ubt-input"
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="ubt-input"
                />
              </div>

              {saveMsg && (
                <div style={{ marginBottom: 16, fontSize: 13, color: saveMsg.includes('Error') || saveMsg.includes('error') ? '#ff4444' : '#22c55e' }}>
                  {saveMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="submit" disabled={saving} className="ubt-btn ubt-btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <Link to="/blog" className="ubt-btn ubt-btn-outline">Back to Blog</Link>
              </div>
            </form>
          </div>
        )}
      </div>
      <Modal
        isOpen={writeModal}
        title="Insufficient privileges"
        message={`Your current role (${authUser?.role_id === 8 ? 'Guest' : 'Member'}) does not allow creating posts. Contact an administrator to request the Author role.`}
        onConfirm={() => setWriteModal(false)}
        confirmLabel="Got it"
        onCancel={() => setWriteModal(false)}
        hideCancelButton
        borderAccent="#e53e3e"
      />
      <Modal
        isOpen={deleteModal.open}
        title="Delete post"
        message="Are you sure you want to delete this post? This cannot be undone."
        onConfirm={handleDeletePost}
        onCancel={() => setDeleteModal({ open: false, postId: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDelete
      />
    </PublicLayout>
  );
}

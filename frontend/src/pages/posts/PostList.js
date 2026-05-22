import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const normalizeStatus = (s) => {
  if (s === 'publikuar') return 'published';
  if (s === 'arkivuar') return 'archived';
  return s || 'draft';
};

const STATUS = {
  published: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
  draft:     { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  archived:  { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
};

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 600,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
};
const tdStyle = { padding: '12px 16px', color: '#fff', fontSize: 14 };

function StatusBadge({ status }) {
  const s = normalizeStatus(status);
  const c = STATUS[s] || STATUS.draft;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 25, padding: '3px 10px' }}>
      {s}
    </span>
  );
}

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get('/posts')
      .then(res => { setPosts(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load posts.'); setLoading(false); });
  }, []);

  const handleDelete = (id) => setModal({ open: true, id });

  const confirmDelete = async () => {
    const id = modal.id;
    setModal({ open: false, id: null });
    try {
      await API.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      setToast({ message: 'Post deleted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete post.', type: 'error' });
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Posts</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{posts.length} total</p>
        </div>
        <Link to="/posts/new" className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>+ New Post</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No posts yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Author</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr
                  key={post.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, maxWidth: 260 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.titulli}</div>
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.55)' }}>{post.autori || '—'}</td>
                  <td style={tdStyle}><StatusBadge status={post.statusi} /></td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)' }}>{post.kategoria || '—'}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{fmtDate(post.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <Link to={`/posts/edit/${post.id}`}
                        style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >Edit</Link>
                      <button onClick={() => handleDelete(post.id)}
                        style={{ color: '#f87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modal.open}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, id: null })}
        confirmLabel="Delete"
        isDelete
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </Layout>
  );
}

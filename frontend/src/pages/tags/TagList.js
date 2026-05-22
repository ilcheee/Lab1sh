import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
};
const tdStyle = { padding: '12px 16px', color: '#fff', fontSize: 14 };

export default function TagList() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get('/tags')
      .then(res => { setTags(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load tags.'); setLoading(false); });
  }, []);

  const handleDelete = (id) => setModal({ open: true, id });

  const confirmDelete = async () => {
    const id = modal.id;
    setModal({ open: false, id: null });
    try {
      await API.delete(`/tags/${id}`);
      setTags(prev => prev.filter(t => t.id !== id));
      setToast({ message: 'Tag deleted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete tag.', type: 'error' });
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Tags</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{tags.length} total</p>
        </div>
        <Link to="/tags/new" className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>+ New Tag</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : tags.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No tags yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t, i) => (
                <tr
                  key={t.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>{t.emertimi}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: 13 }}>{t.slug}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <Link to={`/tags/edit/${t.id}`}
                        style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >Edit</Link>
                      <button onClick={() => handleDelete(t.id)}
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
        title="Delete Tag"
        message="Are you sure you want to delete this tag?"
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
};
const tdStyle = { padding: '12px 16px', color: '#fff', fontSize: 14 };

const STATUS = {
  published:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)' },
  publikuar:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)' },
  draft:      { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
};

function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.draft;
  const label = status === 'publikuar' ? 'published' : status;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 25, padding: '3px 10px' }}>
      {label}
    </span>
  );
}

export default function PageList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/pages')
      .then(res => { setPages(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load pages.'); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await API.delete(`/pages/${id}`);
      setPages(pages.filter(p => p.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Pages</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{pages.length} total</p>
        </div>
        <Link to="/pages/new" className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>+ New Page</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No pages yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>{p.titulli}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: 13 }}>{p.slug}</td>
                  <td style={tdStyle}><StatusBadge status={p.statusi} /></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <Link to={`/pages/edit/${p.id}`}
                        style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >Edit</Link>
                      <button onClick={() => handleDelete(p.id)}
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
    </Layout>
  );
}

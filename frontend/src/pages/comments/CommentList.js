import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS = {
  approved:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)' },
  aprovuar:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)' },
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
  spam:      { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
};

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
};
const tdStyle = { padding: '12px 16px', color: '#fff', fontSize: 14 };

function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 25, padding: '3px 10px' }}>
      {status}
    </span>
  );
}

export default function CommentList() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/comments')
      .then(res => { setComments(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load comments.'); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${id}`);
      setComments(comments.filter(c => c.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const handleStatus = async (id, statusi) => {
    try {
      await API.put(`/comments/${id}`, { statusi });
      setComments(comments.map(c => c.id === id ? { ...c, statusi } : c));
    } catch { alert('Failed to update.'); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Comments</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{comments.length} total</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No comments yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Author</th>
                <th style={thStyle}>Content</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.7)', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.autori || '—'}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.55)', maxWidth: 320 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.permbajtja}</div>
                  </td>
                  <td style={tdStyle}><StatusBadge status={c.statusi} /></td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(c.data)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {c.statusi !== 'aprovuar' && (
                        <button onClick={() => handleStatus(c.id, 'aprovuar')}
                          style={{ color: '#4ade80', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                        >Approve</button>
                      )}
                      {c.statusi !== 'spam' && (
                        <button onClick={() => handleStatus(c.id, 'spam')}
                          style={{ color: '#fbbf24', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                        >Spam</button>
                      )}
                      <button onClick={() => handleDelete(c.id)}
                        style={{ color: '#f87171', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
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

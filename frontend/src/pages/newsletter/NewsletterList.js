import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
};
const tdStyle = { padding: '12px 16px', color: '#fff', fontSize: 14 };

export default function NewsletterList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/newsletter')
      .then(res => { setSubscribers(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load subscribers.'); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await API.delete(`/newsletter/${id}`);
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Newsletter</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{subscribers.length} subscribers</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : subscribers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No subscribers yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Subscribed</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>{s.email}</td>
                  <td style={tdStyle}>
                    {s.statusi === 'aktiv' ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 25, padding: '3px 10px' }}>Active</span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25, padding: '3px 10px' }}>{s.statusi}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{fmtDate(s.data_abonimit)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDelete(s.id)}
                      style={{ color: '#f87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >Remove</button>
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

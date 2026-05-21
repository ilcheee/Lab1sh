import { useEffect, useState } from 'react';
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

export default function SettingList() {
  const [settings, setSettings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [vlera, setVlera] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/settings')
      .then(res => { setSettings(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = (setting) => {
    setEditing(setting.id);
    setVlera(setting.vlera);
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/settings/${id}`, { vlera });
      setSettings(settings.map(s => s.id === id ? { ...s, vlera } : s));
      setEditing(null);
    } catch { alert('Failed to save.'); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Site configuration</p>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : settings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No settings configured.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Key</th>
                <th style={thStyle}>Value</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{s.celesi}</td>
                  <td style={{ ...tdStyle, maxWidth: 260 }}>
                    {editing === s.id ? (
                      <input
                        value={vlera}
                        onChange={(e) => setVlera(e.target.value)}
                        className="ubt-input"
                        style={{ fontSize: 13 }}
                      />
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{s.vlera}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', maxWidth: 240 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.pershkrimi || '—'}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {editing === s.id ? (
                        <>
                          <button onClick={() => handleSave(s.id)}
                            style={{ color: '#4ade80', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                          >Save</button>
                          <button onClick={() => setEditing(null)}
                            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif" }}
                          >Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(s)}
                          style={{ color: '#60a5fa', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >Edit</button>
                      )}
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

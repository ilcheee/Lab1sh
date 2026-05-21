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

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function MediaList() {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/media')
      .then(res => { setMedia(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load media.'); setLoading(false); });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await API.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await API.get('/media');
      setMedia(Array.isArray(res.data) ? res.data : []);
      setFile(null);
    } catch { alert('Upload failed.'); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await API.delete(`/media/${id}`);
      setMedia(media.filter(m => m.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Media</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{media.length} files</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px', marginBottom: 20 }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Upload File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, padding: '8px 0' }}
            />
          </div>
          <button type="submit" disabled={uploading || !file} className="ubt-btn ubt-btn-primary" style={{ fontSize: 13, opacity: (uploading || !file) ? 0.5 : 1 }}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : media.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No media files yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Filename</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Link</th>
                <th style={thStyle}>Uploaded</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.map((m, i) => (
                <tr
                  key={m.id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, maxWidth: 220 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.8)' }}>{m.emri_skedarit}</div>
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{m.lloji}</td>
                  <td style={tdStyle}>
                    <a href={`http://localhost:8008${m.rruga}`} target="_blank" rel="noreferrer"
                      style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >View</a>
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{fmtDate(m.data_ngarkimit)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDelete(m.id)}
                      style={{ color: '#f87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >Delete</button>
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

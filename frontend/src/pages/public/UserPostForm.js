import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';
import { useAuth } from '../../context/AuthContext';

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
  fontFamily: "'Geist', sans-serif",
};

export default function UserPostForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ titulli: '', permbajtja: '', category: '', statusi: 'draft' });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulli.trim() || !form.permbajtja.trim()) return setError('Title and content are required.');
    setSubmitting(true); setError('');

    try {
      let imazhi = null;

      if (mediaFile) {
        const fd = new FormData();
        fd.append('media', mediaFile);
        const uploadRes = await API.post('/posts/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imazhi = uploadRes.data.url;
      }

      const res = await API.post('/posts', {
        titulli: form.titulli,
        permbajtja: form.permbajtja,
        category_id: null,
        statusi: form.statusi,
        imazhi,
      });

      navigate(`/blog/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* Header */}
      <div style={{ background: '#000', ...GRID_BG, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >Blog</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
            <span style={{ color: '#fff', fontSize: 13 }}>New Post</span>
          </nav>

          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', color: '#fff', fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
            Create a New Post
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Writing as <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{user?.emri}</strong>
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '36px' }}>
          {error && (
            <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 14, marginBottom: 28 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={form.titulli} onChange={set('titulli')} placeholder="Enter your post title…" required className="ubt-input" style={{ fontSize: 15 }} />
            </div>

            {/* Category (free text) + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" value={form.category} onChange={set('category')} placeholder="e.g. Technology, Science…" className="ubt-input" />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.statusi} onChange={set('statusi')} className="ubt-input" style={{ cursor: 'pointer' }}>
                  <option value="draft">Draft</option>
                  <option value="publikuar">Published</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Content *</label>
              <textarea required rows={18} value={form.permbajtja} onChange={set('permbajtja')} placeholder="Write your post content here… (HTML allowed)" className="ubt-input" style={{ resize: 'vertical', minHeight: 320, lineHeight: 1.7, fontSize: 15 }} />
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 8 }}>HTML allowed: &lt;b&gt;, &lt;i&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt; etc.</p>
            </div>

            {/* Media upload */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Photo / Video</label>
              {!mediaPreview && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 8, padding: '22px 24px', cursor: 'pointer', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  ↑ Click to upload image or video
                  <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.2)' }}>JPG, PNG, GIF, MP4, WebM — max 50MB</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />

              {mediaPreview && (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    {mediaType === 'video' ? (
                      <video src={mediaPreview} controls style={{ maxWidth: 500, maxHeight: 320, borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', display: 'block' }} />
                    ) : (
                      <img src={mediaPreview} alt="Preview" style={{ maxWidth: 500, maxHeight: 360, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', display: 'block' }} />
                    )}
                    <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: "'Geist', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    {mediaFile?.name} · {(mediaFile?.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: 28, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Will be saved as</span>
              {(form.statusi === 'published' || form.statusi === 'publikuar') ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 25, padding: '2px 10px' }}>Published</span>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 25, padding: '2px 10px' }}>Draft</span>
              )}
            </div>

            {/* Buttons — visually distinct Draft vs Publish */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {(form.statusi === 'published' || form.statusi === 'publikuar') ? (
                <button type="submit" disabled={submitting} style={{ padding: '11px 28px', fontSize: 15, borderRadius: 25, background: '#ffffff', color: '#000000', fontWeight: 700, border: '1px solid #ffffff', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: "'Geist', sans-serif", transition: 'opacity 0.15s' }}>
                  {submitting ? 'Publishing…' : 'Publish Post'}
                </button>
              ) : (
                <button type="submit" disabled={submitting}
                  style={{ padding: '11px 28px', fontSize: 15, borderRadius: 25, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: "'Geist', sans-serif", transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  {submitting ? 'Saving…' : 'Save Draft'}
                </button>
              )}
              <Link to="/blog" className="ubt-btn ubt-btn-outline">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

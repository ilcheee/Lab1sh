import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function PageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ titulli: '', permbajtja: '', slug: '', statusi: 'draft' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      API.get(`/pages/${id}`).then(res => {
        const p = res.data;
        setForm({
          titulli: p.titulli || '',
          permbajtja: p.permbajtja || '',
          slug: p.slug || '',
          statusi: p.statusi === 'publikuar' ? 'published' : (p.statusi || 'draft'),
        });
      }).catch(() => setError('Failed to load page.'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTitle = (e) => {
    const val = e.target.value;
    setForm({
      ...form,
      titulli: val,
      slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/pages/${id}`, form);
      } else {
        await API.post('/pages', form);
      }
      navigate('/pages');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            {isEdit ? 'Edit Page' : 'New Page'}
          </h1>
        </div>
        <Link to="/pages" className="ubt-btn ubt-btn-outline" style={{ fontSize: 13 }}>← Back</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input name="titulli" value={form.titulli} onChange={handleTitle} required className="ubt-input" placeholder="Page title" />
            </div>
            <div>
              <label style={labelStyle}>Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required className="ubt-input" placeholder="page-slug" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Content *</label>
            <textarea
              name="permbajtja" value={form.permbajtja} onChange={handleChange} required rows={10}
              className="ubt-input" placeholder="Page content…" style={{ resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ marginBottom: 28, maxWidth: 200 }}>
            <label style={labelStyle}>Status</label>
            <select name="statusi" value={form.statusi} onChange={handleChange} className="ubt-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} className="ubt-btn ubt-btn-primary" style={{ fontSize: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Page')}
            </button>
            <button type="button" onClick={() => navigate('/pages')} className="ubt-btn ubt-btn-outline" style={{ fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

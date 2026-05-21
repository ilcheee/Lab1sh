import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ emertimi: '', pershkrimi: '', slug: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      API.get(`/categories/${id}`).then(res => {
        const c = res.data;
        setForm({ emertimi: c.emertimi || '', pershkrimi: c.pershkrimi || '', slug: c.slug || '' });
      }).catch(() => setError('Failed to load category.'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleName = (e) => {
    const val = e.target.value;
    setForm({
      ...form,
      emertimi: val,
      slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/categories/${id}`, form);
      } else {
        await API.post('/categories', form);
      }
      navigate('/categories');
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
            {isEdit ? 'Edit Category' : 'New Category'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{isEdit ? 'Update category details' : 'Create a new category'}</p>
        </div>
        <Link to="/categories" className="ubt-btn ubt-btn-outline" style={{ fontSize: 13 }}>← Back</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '28px', maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Name *</label>
            <input name="emertimi" value={form.emertimi} onChange={handleName} required className="ubt-input" placeholder="Category name" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="ubt-input" placeholder="category-slug" />
            <p style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Auto-generated from name. Used in URLs.</p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="pershkrimi" value={form.pershkrimi} onChange={handleChange} rows={3}
              className="ubt-input" placeholder="Optional description…" style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} className="ubt-btn ubt-btn-primary" style={{ fontSize: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Category')}
            </button>
            <button type="button" onClick={() => navigate('/categories')} className="ubt-btn ubt-btn-outline" style={{ fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

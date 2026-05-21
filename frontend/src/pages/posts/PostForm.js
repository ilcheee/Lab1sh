import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    titulli: '',
    permbajtja: '',
    category_id: '',
    statusi: 'draft',
    data_publikimit: '',
    imazhi: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    if (isEdit) {
      API.get(`/posts/${id}`).then(res => {
        const p = res.data;
        setForm({
          titulli: p.titulli || '',
          permbajtja: p.permbajtja || '',
          category_id: p.category_id || '',
          statusi: p.statusi === 'publikuar' ? 'published' : (p.statusi || 'draft'),
          data_publikimit: p.data_publikimit ? p.data_publikimit.slice(0, 10) : '',
          imazhi: p.imazhi || '',
        });
      }).catch(() => setError('Failed to load post.'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/posts/${id}`, form);
      } else {
        await API.post('/posts', form);
      }
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{isEdit ? 'Update post details' : 'Create a new post'}</p>
        </div>
        <Link to="/posts" className="ubt-btn ubt-btn-outline" style={{ fontSize: 13 }}>← Back</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input name="titulli" value={form.titulli} onChange={handleChange} required className="ubt-input" placeholder="Post title" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="ubt-input">
                <option value="">— No category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.emertimi}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Content *</label>
            <textarea
              name="permbajtja" value={form.permbajtja} onChange={handleChange} required rows={10}
              className="ubt-input" placeholder="Post content…" style={{ resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="statusi" value={form.statusi} onChange={handleChange} className="ubt-input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Publish Date</label>
              <input type="date" name="data_publikimit" value={form.data_publikimit} onChange={handleChange} className="ubt-input" />
            </div>
            <div>
              <label style={labelStyle}>Image URL</label>
              <input name="imazhi" value={form.imazhi} onChange={handleChange} className="ubt-input" placeholder="https://…" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={loading} className="ubt-btn ubt-btn-primary" style={{ fontSize: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Post')}
            </button>
            <button type="button" onClick={() => navigate('/posts')} className="ubt-btn ubt-btn-outline" style={{ fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

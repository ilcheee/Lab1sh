import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

const labelStyle = {
  display: 'block',
  color: 'rgba(255,255,255,0.35)',
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

export default function Register() {
  const [form, setForm] = useState({ emri: '', email: '', fjalekalimi: '', konfirmo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.fjalekalimi !== form.konfirmo) return setError('Passwords do not match.');
    if (form.fjalekalimi.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await API.post('/auth/register', {
        emri: form.emri,
        email: form.email,
        fjalekalimi: form.fjalekalimi,
        role_id: 3,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', ...GRID_BG, display: 'flex', flexDirection: 'column', fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: '#fff', textDecoration: 'none', letterSpacing: '-0.3px' }}>Blog</Link>
        <Link to="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >Already have an account? <span style={{ color: '#fff', fontWeight: 600 }}>Log in</span></Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>Create an account</div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Join — read, write, and connect</p>
          </div>

          {/* Card */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '32px' }}>
            {error && (
              <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '11px 14px', color: '#ff4444', fontSize: 13, marginBottom: 24 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={form.emri} onChange={set('emri')} placeholder="Your name" required className="ubt-input" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="ubt-input" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.fjalekalimi} onChange={set('fjalekalimi')} placeholder="Min. 6 characters" required className="ubt-input" />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={form.konfirmo} onChange={set('konfirmo')} placeholder="Repeat password" required className="ubt-input" />
              </div>

              <button type="submit" disabled={loading} className="ubt-btn ubt-btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: 15, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.2)', fontSize: 12, lineHeight: 1.6 }}>
              By signing up you agree to our terms of service.
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            >← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

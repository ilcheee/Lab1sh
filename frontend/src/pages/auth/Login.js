import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, fjalekalimi });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', ...GRID_BG, display: 'flex', flexDirection: 'column', fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: '#fff', textDecoration: 'none', letterSpacing: '-0.3px' }}>Blog</Link>
        <Link to="/register" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >Don't have an account? <span style={{ color: '#fff', fontWeight: 600 }}>Sign up</span></Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>Welcome back</div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Log in to your account</p>
          </div>

          {/* Card */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '32px' }}>
            {justRegistered && (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '11px 14px', color: '#22c55e', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
                ✓ Account created! You can log in now.
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '11px 14px', color: '#ff4444', fontSize: 13, marginBottom: 24 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="ubt-input" />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={fjalekalimi} onChange={e => setFjalekalimi(e.target.value)}
                  placeholder="••••••••" required className="ubt-input" />
              </div>
              <button type="submit" disabled={loading} className="ubt-btn ubt-btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: 15, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
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

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const ROLE_NAMES = { 7: 'Member', 8: 'Guest' };

function NavCTA({ user, onClose, onWriteClick }) {
  const role = user?.role_id;
  if (!role) return null;

  return (
    <>
      {role <= 2 && (
        <Link to="/admin" onClick={onClose} className="ubt-btn ubt-btn-outline" style={{ padding: '7px 18px', fontSize: 13 }}>
          Admin Panel
        </Link>
      )}
      {role >= 3 && role <= 6 && (
        <Link to="/blog/new" onClick={onClose} className="ubt-btn ubt-btn-secondary" style={{ padding: '7px 18px', fontSize: 13 }}>
          Write
        </Link>
      )}
      {role >= 7 && (
        <button
          onClick={() => { onClose?.(); onWriteClick(); }}
          className="ubt-btn ubt-btn-secondary"
          style={{ padding: '7px 18px', fontSize: 13 }}
        >
          Write
        </button>
      )}
      <Link to="/profile" onClick={onClose} className="ubt-btn ubt-btn-outline" style={{ padding: '7px 18px', fontSize: 13 }}>
        Profile
      </Link>
    </>
  );
}

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [writeModal, setWriteModal] = useState(null); // null | 'no_permission' | 'not_logged_in'
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWriteClick = () => {
    if (!user) {
      setWriteModal('not_logged_in');
    } else {
      setWriteModal('no_permission');
    }
  };

  const handleFooterWrite = () => {
    if (!user) {
      setWriteModal('not_logged_in');
    } else if (user.role_id >= 7) {
      setWriteModal('no_permission');
    } else {
      navigate('/blog/new');
    }
  };

  const navLink = (to, label) => (
    <Link key={to} to={to} style={{
      fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '4px 2px',
      color: pathname === to ? '#fff' : 'rgba(255,255,255,0.5)',
      transition: 'color 0.15s',
    }}
    onMouseEnter={e => { if (pathname !== to) e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
    onMouseLeave={e => { if (pathname !== to) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
    >{label}</Link>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Geist', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ══ NAVBAR ══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ fontWeight: 700, fontSize: 17, color: '#fff', textDecoration: 'none', marginRight: 40, letterSpacing: '-0.3px' }}>
            Blog
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
            {navLink('/', 'Home')}
            {navLink('/blog', 'Blog')}
            {navLink('/about', 'About')}
          </nav>

          {/* Auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-auth">
            {user ? (
              <>
                <NavCTA user={user} onWriteClick={handleWriteClick} />
                <button onClick={handleLogout} className="ubt-btn ubt-btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ubt-btn ubt-btn-outline" style={{ padding: '7px 18px', fontSize: 13 }}>
                  Log In
                </Link>
                <Link to="/register" className="ubt-btn ubt-btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>
                  Sign Up
                </Link>
              </>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{ display: 'none', background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 16, marginLeft: 6 }}
            >{menuOpen ? '✕' : '☰'}</button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#000' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Home</Link>
              <Link to="/blog" onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>About</Link>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                {user ? (
                  <>
                    <NavCTA user={user} onClose={() => setMenuOpen(false)} onWriteClick={handleWriteClick} />
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>Log Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="ubt-btn ubt-btn-outline" style={{ fontSize: 13 }}>Log In</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══ CONTENT ══ */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#000' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 32 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 10, letterSpacing: '-0.3px' }}>Blog</div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
                A place to read, write, and connect with ideas.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14, fontWeight: 600 }}>Platform</div>
                {[{ to: '/', l: 'Home' }, { to: '/blog', l: 'Blog' }, { to: '/register', l: 'Sign Up' }].map(({ to, l }) => (
                  <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 9, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                  >{l}</Link>
                ))}
                <button
                  onClick={handleFooterWrite}
                  style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 9, textDecoration: 'none', transition: 'color 0.15s', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Geist', system-ui, sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                >Write</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>© {new Date().getFullYear()} Blog. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={writeModal === 'no_permission'}
        title="Insufficient privileges"
        message={`Your current role (${ROLE_NAMES[user?.role_id] ?? 'Member'}) does not allow creating posts. Contact an administrator to request the Author role.`}
        onConfirm={() => setWriteModal(null)}
        confirmLabel="Got it"
        onCancel={() => setWriteModal(null)}
        hideCancelButton
        borderAccent="#e53e3e"
      />

      <Modal
        isOpen={writeModal === 'not_logged_in'}
        title="Login required"
        message="You need to log in to create posts."
        onConfirm={() => { navigate('/login'); setWriteModal(null); }}
        confirmLabel="Log In"
        onCancel={() => setWriteModal(null)}
        cancelLabel="Cancel"
        borderAccent="#e53e3e"
      />

      <style>{`
        @media (max-width: 680px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-auth > a { display: none !important; }
          .desktop-auth > .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

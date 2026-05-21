import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin',        icon: '▦',  label: 'Dashboard'   },
  { to: '/posts',        icon: '✎',  label: 'Posts'       },
  { to: '/categories',   icon: '⊞',  label: 'Categories'  },
  { to: '/tags',         icon: '⊛',  label: 'Tags'        },
  { to: '/comments',     icon: '✉',  label: 'Comments'    },
  { to: '/pages',        icon: '☰',  label: 'Pages'       },
  { to: '/media',        icon: '⊡',  label: 'Media'       },
  { to: '/admin/users',  icon: '◎',  label: 'Users'       },
  { to: '/settings',     icon: '⚙',  label: 'Settings'    },
  { to: '/newsletter',   icon: '◈',  label: 'Newsletter'  },
];

const ROLE_LABEL = { 1: 'Super Admin', 2: 'Editor', 3: 'Author' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (to) => pathname === to || (to !== '/admin' && pathname.startsWith(to));

  return (
    <div style={{
      width: 232, minHeight: '100vh', flexShrink: 0,
      background: '#0d0d0d',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geist', system-ui, sans-serif",
    }}>

      {/* ── Brand ── */}
      <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>Blog</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Admin Panel</div>
      </div>

      {/* ── User info ── */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.7)',
        }}>
          {(user?.emri || 'A').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.emri || 'Admin'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            {ROLE_LABEL[user?.role_id] || 'Author'}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 6, marginBottom: 1,
                textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                fontWeight: active ? 500 : 400,
                fontSize: 14,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#fff', opacity: 0.5 }} />}
            </Link>
          );
        })}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '10px 4px' }} />

        <Link
          to="/blog"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <span style={{ fontSize: 14, width: 18, textAlign: 'center', opacity: 0.5 }}>↗</span>
          View Blog
        </Link>
      </nav>

      {/* ── Sign out ── */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 14,
            fontFamily: "'Geist', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.2)'; e.currentTarget.style.color = '#ff4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <span style={{ fontSize: 13 }}>⏻</span> Sign out
        </button>
      </div>
    </div>
  );
}

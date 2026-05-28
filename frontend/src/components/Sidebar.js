import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ALL_NAV_ITEMS = [
  { to: '/admin',        icon: '▦',  label: 'Dashboard',  minRole: 1, maxRole: 2  },
  { to: '/posts',        icon: '✎',  label: 'Posts',      minRole: 1, maxRole: 6  },
  { to: '/categories',   icon: '⊞',  label: 'Categories', minRole: 1, maxRole: 4  },
  { to: '/tags',         icon: '⊛',  label: 'Tags',       minRole: 1, maxRole: 4  },
  { to: '/comments',     icon: '✉',  label: 'Comments',   minRole: 1, maxRole: 3  },
  { to: '/pages',        icon: '☰',  label: 'Pages',      minRole: 1, maxRole: 4  },
  { to: '/media',        icon: '⊡',  label: 'Media',      minRole: 1, maxRole: 6  },
  { to: '/admin/users',  icon: '◎',  label: 'Users',      minRole: 1, maxRole: 2  },
  { to: '/settings',     icon: '⚙',  label: 'Settings',   minRole: 1, maxRole: 2  },
  { to: '/newsletter',   icon: '◈',  label: 'Newsletter', minRole: 1, maxRole: 2  },
];

const ROLE_LABEL = {
  1: 'Super Admin', 2: 'Admin', 3: 'Redaktor', 4: 'Editor',
  5: 'Author', 6: 'Contributor', 7: 'Member', 8: 'Guest',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (to) => pathname === to || (to !== '/admin' && pathname.startsWith(to));

  const role = user?.role_id || 8;
  const navItems = ALL_NAV_ITEMS.filter(item => role >= item.minRole && role <= item.maxRole);

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
            {ROLE_LABEL[role] || 'Guest'}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ flex: 1, padding: '10px', overflowY: 'auto' }}
      >
        {navItems.map(item => {
          const active = isActive(item.to);
          return (
            <motion.div key={item.to} variants={itemVariants} style={{ position: 'relative', marginBottom: 1 }}>
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 6,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Link
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 6,
                  textDecoration: 'none', position: 'relative', zIndex: 1,
                  background: 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontWeight: active ? 500 : 400,
                  fontSize: 14,
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            </motion.div>
          );
        })}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '10px 4px' }} />

        <motion.div variants={itemVariants}>
          <Link
            to="/blog"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: 'center', opacity: 0.5 }}>↗</span>
            View Blog
          </Link>
        </motion.div>
      </motion.nav>

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

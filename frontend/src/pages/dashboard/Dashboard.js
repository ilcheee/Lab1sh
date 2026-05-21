import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const cards = [
  { label: 'Posts',      key: 'posts',      icon: '✎',  to: '/posts'        },
  { label: 'Categories', key: 'categories', icon: '⊞',  to: '/categories'   },
  { label: 'Tags',       key: 'tags',       icon: '⊛',  to: '/tags'         },
  { label: 'Comments',   key: 'comments',   icon: '✉',  to: '/comments'     },
  { label: 'Users',      key: 'users',      icon: '◎',  to: '/admin/users'  },
  { label: 'Media',      key: 'media',      icon: '⊡',  to: '/media'        },
  { label: 'Newsletter', key: 'newsletter', icon: '◈',  to: '/newsletter'   },
  { label: 'Pages',      key: 'pages',      icon: '☰',  to: '/pages'        },
];

function StatCard({ label, value, icon, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px', transition: 'border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
      >
        <div style={{ fontSize: 16, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{label}</div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, height: 100, animation: 'skpulse 1.4s ease-in-out infinite' }} />
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{ maxWidth: 880 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Platform overview</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats
            ? cards.map(c => <StatCard key={c.key} label={c.label} value={stats[c.key]} icon={c.icon} to={c.to} />)
            : cards.map(c => <SkeletonCard key={c.key} />)
          }
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/posts/new" className="ubt-btn ubt-btn-primary" style={{ fontSize: 13 }}>+ New Post</Link>
          <Link to="/blog" className="ubt-btn ubt-btn-secondary" style={{ fontSize: 13 }}>↗ View Blog</Link>
          <Link to="/admin/users" className="ubt-btn ubt-btn-outline" style={{ fontSize: 13 }}>Manage Users</Link>
        </div>
      </div>
    </Layout>
  );
}

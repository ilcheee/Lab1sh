import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

const ALL_ROLES = [
  { id: 1, label: 'Super Admin', icon: '👑' },
  { id: 2, label: 'Admin',       icon: '⚙️' },
  { id: 3, label: 'Redaktor',    icon: '📋' },
  { id: 4, label: 'Editor',      icon: '📚' },
  { id: 5, label: 'Author',      icon: '✍️' },
  { id: 6, label: 'Contributor', icon: '📝' },
  { id: 7, label: 'Member',      icon: '👤' },
  { id: 8, label: 'Guest',       icon: '👀' },
];

const ROLE_MAP = Object.fromEntries(ALL_ROLES.map(r => [r.id, r]));

const roleColor = (role_id) => {
  if (role_id === 1) return { color: '#000',                    bg: '#fff',                      border: 'rgba(255,255,255,0.3)'  };
  if (role_id === 2) return { color: 'rgba(255,255,255,0.85)',  bg: 'rgba(255,255,255,0.15)',    border: 'rgba(255,255,255,0.25)' };
  if (role_id === 3) return { color: '#ff6464',                 bg: 'rgba(255,100,100,0.15)',    border: 'rgba(255,100,100,0.3)'  };
  if (role_id === 4) return { color: '#64c864',                 bg: 'rgba(100,200,100,0.15)',    border: 'rgba(100,200,100,0.3)'  };
  if (role_id === 5) return { color: '#6496ff',                 bg: 'rgba(100,150,255,0.15)',    border: 'rgba(100,150,255,0.3)'  };
  if (role_id === 6) return { color: '#ffc864',                 bg: 'rgba(255,200,100,0.15)',    border: 'rgba(255,200,100,0.3)'  };
  if (role_id === 7) return { color: 'rgba(255,255,255,0.45)',  bg: 'rgba(255,255,255,0.06)',    border: 'rgba(255,255,255,0.1)'  };
  return                     { color: 'rgba(255,255,255,0.25)',  bg: 'rgba(255,255,255,0.03)',    border: 'rgba(255,255,255,0.06)' };
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

  // Admins (role 2) can only assign roles 3–8; super_admin (role 1) sees all
  const assignableRoles = currentUser?.role_id === 1
    ? ALL_ROLES
    : ALL_ROLES.filter(r => r.id >= 3);

  useEffect(() => {
    API.get('/users')
      .then(res => { setUsers(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load users.'); setLoading(false); });
  }, []);

  const handleUpdateRole = async (userId) => {
    try {
      await API.put(`/users/${userId}`, { role_id: parseInt(editRole) });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role_id: parseInt(editRole) } : u));
      setEditingId(null);
      setToast({ message: 'Role updated.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update role.', type: 'error' });
    }
  };

  const handleDelete = (userId) => setModal({ open: true, id: userId });

  const confirmDelete = async () => {
    const userId = modal.id;
    setModal({ open: false, id: null });
    try {
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setToast({ message: 'User deleted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete user.', type: 'error' });
    }
  };

  return (
    <Layout>
      <style>{`@keyframes skpulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{ maxWidth: 960 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Users</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{users.length} member{users.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff4444', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', animation: 'skpulse 1.4s ease-in-out infinite' }}>
                <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.6fr 160px 160px',
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <div>Name</div><div>Email</div><div>Role</div><div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {users.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No users found.</div>
            ) : users.map((u, i) => {
              const rc = roleColor(u.role_id);
              const roleInfo = ROLE_MAP[u.role_id];
              const isEditing = editingId === u.id;
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.6fr 160px 160px',
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexShrink: 0,
                    }}>{(u.emri || 'U').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{u.emri}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{fmtDate(u.created_at)}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{u.email}</div>

                  <div>
                    {isEditing ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="ubt-input"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        {assignableRoles.map(r => (
                          <option key={r.id} value={r.id}>{r.icon} {r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 25, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12 }}>{roleInfo?.icon}</span>
                        {roleInfo?.label || 'Unknown'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleUpdateRole(u.id)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#000', border: 'none', fontFamily: "'Geist', sans-serif", fontWeight: 600 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Geist', sans-serif" }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(u.id); setEditRole(String(u.role_id)); }}
                          style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Geist', sans-serif", transition: 'all 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'rgba(255,68,68,0.6)', border: '1px solid rgba(255,68,68,0.15)', fontFamily: "'Geist', sans-serif", transition: 'all 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.08)'; e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,68,68,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.15)'; }}
                        >Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.open}
        title="Delete User"
        message="Delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, id: null })}
        confirmLabel="Delete"
        isDelete
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </Layout>
  );
}

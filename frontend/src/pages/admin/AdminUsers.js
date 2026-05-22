import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const ROLES = { 1: 'Super Admin', 2: 'Editor', 3: 'Author' };

const roleColor = (role_id) => {
  if (role_id === 1) return { color: '#fff', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' };
  if (role_id === 2) return { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' };
  return { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' };
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

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
              display: 'grid', gridTemplateColumns: '1fr 1.6fr 130px 160px',
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
              const isEditing = editingId === u.id;
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.6fr 130px 160px',
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
                        <option value="1">Super Admin</option>
                        <option value="2">Editor</option>
                        <option value="3">Author</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 25, padding: '2px 8px' }}>
                        {ROLES[u.role_id] || 'Author'}
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const STATUS_STYLES = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)', label: 'Pending'  },
  aprovuar:  { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',  label: 'Approved' },
  refuzuar:  { color: '#ff4444', bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.25)',  label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 700,
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 20, padding: '3px 10px',
      textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>{s.label}</span>
  );
}

export default function ContactRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get('/contact')
      .then(res => { setRequests(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const handleStatus = async (id, statusi) => {
    try {
      await API.put(`/contact/${id}`, { statusi });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, statusi } : r));
      showToast(`Request marked as ${STATUS_STYLES[statusi]?.label || statusi}.`);
    } catch {
      showToast('Failed to update status.', false);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ open: false, id: null });
    try {
      await API.delete(`/contact/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast('Request deleted.');
    } catch {
      showToast('Failed to delete.', false);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.statusi === filter);
  const pendingCount = requests.filter(r => r.statusi === 'pending').length;

  return (
    <Layout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 9999,
              padding: '12px 20px', borderRadius: 10,
              background: toast.ok ? 'rgba(34,197,94,0.1)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${toast.ok ? 'rgba(34,197,94,0.3)' : 'rgba(255,68,68,0.3)'}`,
              color: toast.ok ? '#22c55e' : '#ff4444',
              fontSize: 13, fontWeight: 500,
            }}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
            Contact Requests
          </h1>
          {pendingCount > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 20, padding: '3px 10px',
            }}>{pendingCount} pending</span>
          )}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Review messages and role requests from users
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${requests.length})` },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'aprovuar', label: 'Approved' },
          { key: 'refuzuar', label: 'Rejected' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Geist', system-ui, sans-serif",
              border: filter === key ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === key ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 80, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, animation: 'skpulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 24px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          No requests found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{
                  background: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, overflow: 'hidden',
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    cursor: 'pointer', flexWrap: 'wrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{req.emri}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{req.email}</div>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{req.lloji}</div>
                  </div>

                  <div style={{ minWidth: 100 }}>
                    <StatusBadge status={req.statusi} />
                  </div>

                  <div style={{ minWidth: 110, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                    {fmtDate(req.created_at)}
                  </div>

                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, transform: expanded === req.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                </div>

                {/* Expanded: message + actions */}
                <AnimatePresence>
                  {expanded === req.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8, marginTop: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Message
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
                          {req.mesazhi}
                        </p>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {req.statusi !== 'aprovuar' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatus(req.id, 'aprovuar'); }}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e',
                                fontFamily: "'Geist', system-ui, sans-serif", transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; }}
                            >✓ Approve</button>
                          )}
                          {req.statusi !== 'refuzuar' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatus(req.id, 'refuzuar'); }}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                border: '1px solid rgba(255,68,68,0.25)', background: 'rgba(255,68,68,0.06)', color: '#ff6666',
                                fontFamily: "'Geist', system-ui, sans-serif", transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.12)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.06)'; }}
                            >✕ Reject</button>
                          )}
                          {req.statusi !== 'pending' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatus(req.id, 'pending'); }}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)',
                                fontFamily: "'Geist', system-ui, sans-serif", transition: 'all 0.15s',
                              }}
                            >↺ Reset to Pending</button>
                          )}
                          {user?.role_id <= 2 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: req.id }); }}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                border: '1px solid rgba(255,68,68,0.15)', background: 'transparent', color: 'rgba(255,68,68,0.6)',
                                fontFamily: "'Geist', system-ui, sans-serif", transition: 'all 0.15s', marginLeft: 'auto',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.background = 'rgba(255,68,68,0.06)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,68,68,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                            >Delete</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        title="Delete Request"
        message="Are you sure you want to permanently delete this contact request?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDelete
      />

      <style>{`@keyframes skpulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
    </Layout>
  );
}

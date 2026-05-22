import { useEffect } from 'react';

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDelete = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && onCancel) onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }
      `}</style>

      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.18s ease',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '28px 28px 24px',
            maxWidth: 420,
            width: '90%',
            animation: 'modalSlideUp 0.22s ease',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 24px', lineHeight: 1.6 }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "'Geist', sans-serif", fontWeight: 500,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={onConfirm}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: isDelete ? '#ff4444' : '#fff',
                color: isDelete ? '#fff' : '#000',
                border: 'none',
                fontFamily: "'Geist', sans-serif", fontWeight: 600,
                transition: 'opacity 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

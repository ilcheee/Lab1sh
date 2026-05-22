import { useEffect, useRef } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = type === 'success';
  const borderColor = isSuccess ? 'rgba(74,222,128,0.4)' : 'rgba(255,68,68,0.4)';
  const iconBg     = isSuccess ? 'rgba(74,222,128,0.15)' : 'rgba(255,68,68,0.15)';
  const iconColor  = isSuccess ? '#4ade80' : '#ff4444';
  const icon       = isSuccess ? '✓' : '✕';

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(110%) }
          to   { opacity: 1; transform: translateX(0)    }
        }
      `}</style>

      <div
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          background: '#111111',
          border: `1px solid ${borderColor}`,
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          minWidth: 220, maxWidth: 360,
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          animation: 'toastSlideIn 0.25s ease',
          fontFamily: "'Geist', sans-serif",
        }}
      >
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: iconBg,
          border: `1px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor, fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {icon}
        </span>

        <span style={{ fontSize: 13, color: '#fff', flex: 1, lineHeight: 1.4 }}>
          {message}
        </span>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: 18, padding: 0,
            lineHeight: 1, fontFamily: "'Geist', sans-serif", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
        >
          ×
        </button>
      </div>
    </>
  );
}

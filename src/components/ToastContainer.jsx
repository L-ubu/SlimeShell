import { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import useToasts from '../store/toasts.js';

const TYPE_CONFIG = {
  success: { icon: Check, color: '#6EE7B7', bg: 'rgba(110,231,183,0.08)', border: 'rgba(110,231,183,0.2)' },
  error: { icon: X, color: '#FB7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
  warning: { icon: AlertTriangle, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  info: { icon: Info, color: '#7DD3FC', bg: 'rgba(125,211,252,0.08)', border: 'rgba(125,211,252,0.2)' },
};

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#1A1F2E',
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        minWidth: 240,
        maxWidth: 380,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: 24, height: 24, borderRadius: 6,
          background: cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={13} strokeWidth={2.5} style={{ color: cfg.color }} />
      </div>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#D1D5DB',
        flex: 1,
        lineHeight: 1.4,
      }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, opacity: 0.4,
        }}
      >
        <X size={12} style={{ color: '#9CA3AF' }} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToasts(s => s.toasts);
  const removeToast = useToasts(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { HelpCircle, X } from 'lucide-react';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

export function ToolHelp({ title, description, steps = [], tips = [] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="How to use this tool"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          color: '#6B7280', cursor: 'pointer',
          transition: 'all 150ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#6EE7B7'; e.currentTarget.style.borderColor = 'rgba(110,231,183,0.2)'; e.currentTarget.style.background = 'rgba(110,231,183,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      >
        <HelpCircle size={14} />
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 340, zIndex: 99997,
          background: '#141820',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 200ms ease-out',
          overflow: 'hidden',
        }} ref={panelRef}>
          <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
              {title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 6,
                border: 'none', background: 'rgba(255,255,255,0.05)',
                color: '#6B7280', cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {description && (
              <p style={{ fontFamily: mono, fontSize: 12, color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                {description}
              </p>
            )}

            {steps.length > 0 && (
              <div>
                <span style={{
                  fontFamily: mono, fontSize: 10, fontWeight: 600,
                  color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  How to use
                </span>
                <ol style={{
                  margin: '10px 0 0', padding: 0, listStyle: 'none',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {steps.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: mono, fontSize: 10, fontWeight: 700,
                        color: '#141820', background: '#6EE7B7',
                        borderRadius: 4, minWidth: 18, height: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tips.length > 0 && (
              <div>
                <span style={{
                  fontFamily: mono, fontSize: 10, fontWeight: 600,
                  color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Tips
                </span>
                <ul style={{
                  margin: '10px 0 0', padding: 0, listStyle: 'none',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {tips.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#FBBF24', fontSize: 8, marginTop: 4 }}>&#9679;</span>
                      <span style={{ fontFamily: mono, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

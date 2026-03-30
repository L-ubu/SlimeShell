import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Plus, X, Flag } from 'lucide-react';
import useCtfStore from '../../store/ctfStore.js';
import useNotifications from '../../store/notifications.js';
import NotificationPanel from '../NotificationPanel.jsx';

function CTFSetupModal({ onClose }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const startCTF = useCtfStore((s) => s.startCTF);

  const handleStart = () => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    if (!name.trim() || (h === 0 && m === 0)) return;
    const endTime = Date.now() + h * 3600000 + m * 60000;
    startCTF({ name: name.trim(), endTime });
    onClose();
  };

  const inputStyle = {
    background: '#0B0F18',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#E2E8F0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: 28, width: 380,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flag size={18} style={{ color: '#FB7185' }} />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700, color: '#E2E8F0',
            }}>
              Start CTF
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 6,
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} style={{ color: '#6B7280' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
            color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            CTF Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HackTheBox Cyber Apocalypse"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
              color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Hours
            </label>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
              color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Minutes
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || (!parseInt(hours, 10) && !parseInt(minutes, 10))}
          style={{
            background: name.trim() && (parseInt(hours, 10) || parseInt(minutes, 10))
              ? 'linear-gradient(135deg, #FB7185, #E11D48)'
              : 'rgba(255,255,255,0.04)',
            border: 'none', borderRadius: 8, padding: '12px 0',
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 700,
            color: name.trim() && (parseInt(hours, 10) || parseInt(minutes, 10)) ? '#fff' : '#3B4252',
            cursor: name.trim() && (parseInt(hours, 10) || parseInt(minutes, 10)) ? 'pointer' : 'default',
            transition: 'all 150ms',
          }}
        >
          Start Timer
        </button>
      </div>
    </div>
  );
}

export default function TopBar({ pageConfig = {}, onOpenCommandPalette }) {
  const location = useLocation();
  const currentPage = pageConfig[location.pathname];
  const title = currentPage?.title ?? 'SlimeShell';

  const activeCTF = useCtfStore((s) => s.activeCTF);
  const getTimeLeft = useCtfStore((s) => s.getTimeLeft);
  const clearCTF = useCtfStore((s) => s.clearCTF);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  const notifications = useNotifications((s) => s.notifications);
  const notifPanelOpen = useNotifications((s) => s.panelOpen);
  const toggleNotifPanel = useNotifications((s) => s.togglePanel);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!activeCTF?.endTime) { setTimeLeft(null); return; }
    const tick = () => setTimeLeft(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeCTF?.endTime, getTimeLeft]);

  const handleCtfClick = useCallback(() => {
    if (activeCTF) return;
    setShowSetup(true);
  }, [activeCTF]);

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: '#141820',
          minHeight: 56,
          boxSizing: 'border-box',
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#D1D5DB',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {title}
        </h1>

        {/* Search - shrinks when space is tight */}
        <button
          onClick={onOpenCommandPalette}
          type="button"
          style={{
            flex: '1 1 180px',
            maxWidth: 300,
            minWidth: 0,
            background: '#1A1F2E',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '7px 14px',
            gap: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
            outline: 'none',
            overflow: 'hidden',
          }}
        >
          <Search
            size={14}
            strokeWidth={2}
            style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: '#4B5563',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}
          >
            Search tools, scripts, refs...
          </span>
          <kbd
            style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '2px 6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.15)',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Right group - never shrinks */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {activeCTF && timeLeft ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(251,113,133,0.06)',
                border: '1px solid rgba(251,113,133,0.15)',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
              title="Click to end CTF"
              onClick={clearCTF}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#FB7185',
                  boxShadow: 'rgba(251,113,133,0.4) 0px 0px 6px',
                  animation: 'ctfPulse 2s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, fontWeight: 600, color: '#FB7185',
                }}
              >
                CTF LIVE
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, fontWeight: 700, color: '#FDA4AF',
                }}
              >
                {timeLeft}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCtfClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer', outline: 'none',
                transition: 'all 150ms',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={13} strokeWidth={2} style={{ color: '#4B5563' }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, fontWeight: 500, color: '#4B5563',
              }}>
                Start CTF
              </span>
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={toggleNotifPanel}
              style={{
                position: 'relative',
                width: 36, height: 36, borderRadius: 8,
                background: notifPanelOpen ? 'rgba(110,231,183,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${notifPanelOpen ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', outline: 'none', padding: 0,
                transition: 'all 150ms',
              }}
            >
              <Bell
                size={16}
                strokeWidth={2}
                style={{ color: notifPanelOpen ? '#6EE7B7' : 'rgba(255,255,255,0.4)' }}
              />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#FB7185',
                  boxShadow: '0 0 6px rgba(251,113,133,0.5)',
                  border: '1.5px solid #141820',
                }} />
              )}
            </button>
            <NotificationPanel
              open={notifPanelOpen}
              onClose={() => useNotifications.getState().closePanel()}
            />
          </div>
        </div>

        <style>{`
          @keyframes ctfPulse {
            0%, 100% { opacity: 1; box-shadow: rgba(251,113,133,0.4) 0px 0px 6px; }
            50% { opacity: 0.5; box-shadow: rgba(251,113,133,0.15) 0px 0px 3px; }
          }
        `}</style>
      </header>

      {showSetup && <CTFSetupModal onClose={() => setShowSetup(false)} />}
    </>
  );
}

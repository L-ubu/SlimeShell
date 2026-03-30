import { useState, useMemo } from 'react';
import { Terminal, Wifi } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Input } from '../components/ui/Input.jsx';
import { shells, osShells, encodings, encodePayload } from '../lib/revshells.js';

const osOptions = Object.keys(osShells);
const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(110,231,183,0.08)' : '#0B0F18',
        border: active ? '1px solid rgba(110,231,183,0.15)' : '1px solid rgba(255,255,255,0.06)',
        color: active ? '#6EE7B7' : '#6B7280',
        fontFamily: mono, fontSize: 11, fontWeight: 500,
        padding: '7px 14px', borderRadius: 6,
        cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 600,
      color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </span>
  );
}

export default function RevShell() {
  const [ip, setIp] = useState('10.10.14.1');
  const [port, setPort] = useState('4444');
  const [os, setOs] = useState('Linux');
  const [shell, setShell] = useState('/bin/sh');
  const [encoding, setEncoding] = useState('None');

  const availableShells = osShells[os] || [];

  const handleOsChange = (newOs) => {
    setOs(newOs);
    const newShells = osShells[newOs];
    if (!newShells.includes(shell)) setShell(newShells[0]);
  };

  const generated = useMemo(() => {
    return shells.map(s => {
      const raw = s.template(ip, port, shell);
      return { ...s, command: encodePayload(raw, encoding) };
    });
  }, [ip, port, shell, encoding]);

  const listenerCmd = `nc -lvnp ${port}`;

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Left config panel */}
      <div style={{
        width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14,
        overflowY: 'auto', paddingRight: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(110,231,183,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Terminal size={18} strokeWidth={1.8} style={{ color: '#6EE7B7' }} />
          </div>
          <span style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>
            Reverse Shell Gen
          </span>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <Input label="LHOST" value={ip} onChange={e => setIp(e.target.value)} placeholder="10.10.14.1" />
              </div>
              <div style={{ width: 100 }}>
                <Input label="LPORT" value={port} onChange={e => setPort(e.target.value)} placeholder="4444" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionLabel>OS Target</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {osOptions.map(o => <Chip key={o} label={o} active={os === o} onClick={() => handleOsChange(o)} />)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionLabel>Shell Type</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {availableShells.map(s => <Chip key={s} label={s} active={shell === s} onClick={() => setShell(s)} />)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionLabel>Encoding</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {encodings.map(enc => <Chip key={enc} label={enc} active={encoding === enc} onClick={() => setEncoding(enc)} />)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wifi size={14} strokeWidth={1.8} style={{ color: '#6EE7B7' }} />
                <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                  Listener Command
                </span>
              </div>
              <CopyButton text={listenerCmd} />
            </div>
            <div style={{
              background: '#0B0F18', borderRadius: 8, padding: '12px 14px',
              fontFamily: mono, fontSize: 12, color: '#6EE7B7',
              border: '1px solid rgba(110,231,183,0.08)',
            }}>
              {listenerCmd}
            </div>
          </div>
        </Card>

        <pre style={{
          fontFamily: mono, fontSize: 9, color: '#1E293B', lineHeight: '11px',
          textAlign: 'center', userSelect: 'none', margin: '4px 0 0',
        }}>
{`    ╔══════════════════╗
    ║  ┌─┐┬  ┬┌┬┐┌─┐  ║
    ║  └─┐│  │││││├┤   ║
    ║  └─┘┴─┘┴┴ ┴└─┘  ║
    ║    SHELL v2      ║
    ╚══════════════════╝`}
        </pre>
      </div>

      {/* Right — shell cards */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: 12, paddingRight: 4,
      }}>
        <div style={{
          fontFamily: mono, fontSize: 10, color: '#4B5563',
          padding: '0 2px 4px', letterSpacing: '0.03em',
        }}>
          {generated.length} shells generated
        </div>
        {generated.map((s, i) => (
          <ShellCard key={`${s.name}-${s.subtype}-${i}`} shell={s} />
        ))}
      </div>
    </div>
  );
}

function ShellCard({ shell }) {
  const [hovered, setHovered] = useState(false);
  const { name, subtype, color, command } = shell;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: '#161B28',
        border: '1px solid rgba(255,255,255,0.04)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 10, padding: '16px 18px',
        transition: 'border-color 150ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: hexToRgba(color, 0.1), color,
          fontFamily: mono, fontSize: 11, fontWeight: 600,
          padding: '4px 12px', borderRadius: 5,
        }}>
          {name}{subtype ? ` · ${subtype}` : ''}
        </span>
        <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 150ms' }}>
          <CopyButton text={command} />
        </div>
      </div>
      <div style={{
        background: '#0B0F18', borderRadius: 8, padding: '12px 14px',
        fontFamily: mono, fontSize: 11, color: '#D1D5DB',
        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        lineHeight: '20px', border: '1px solid rgba(255,255,255,0.03)',
      }}>
        {command}
      </div>
    </div>
  );
}

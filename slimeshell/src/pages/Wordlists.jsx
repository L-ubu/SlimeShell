import { useState } from 'react'
import { FileText, Search, Download, HardDrive, Hash, Eye } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'

const sampleWordlists = [
  {
    id: 1,
    name: 'rockyou.txt',
    category: 'Passwords',
    size: '133.4 MB',
    lines: 14344391,
    source: 'SecLists',
    description: 'Classic password wordlist from the RockYou data breach. Most commonly used for password cracking.',
    preview: ['123456', 'password', '12345678', 'qwerty', 'abc123', '123456789', 'letmein', '1234567', 'football', 'iloveyou', 'admin', 'welcome', 'monkey', 'login', 'master'],
    lastUsed: '2 hours ago',
  },
  {
    id: 2,
    name: 'common.txt',
    category: 'Directories',
    size: '5.2 KB',
    lines: 4614,
    source: 'dirb',
    description: 'Common directory and file names for web application enumeration.',
    preview: ['admin', 'api', 'backup', 'config', 'console', 'dashboard', 'db', 'debug', 'deploy', 'dev', 'docs', 'download', 'env', 'files', 'git'],
    lastUsed: '5 hours ago',
  },
  {
    id: 3,
    name: 'subdomains-top1million-5000.txt',
    category: 'Subdomains',
    size: '48 KB',
    lines: 4997,
    source: 'SecLists',
    description: 'Top 5000 most common subdomain names for DNS enumeration.',
    preview: ['www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk', 'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'blog'],
    lastUsed: '1 day ago',
  },
  {
    id: 4,
    name: 'big.txt',
    category: 'Directories',
    size: '187 KB',
    lines: 20469,
    source: 'dirb',
    description: 'Extensive directory wordlist with 20K+ entries for thorough web enumeration.',
    preview: ['.bashrc', '.config', '.env', '.git', '.htaccess', '.htpasswd', '.ssh', 'Dockerfile', 'Makefile', 'README', 'TODO', 'Vagrantfile', 'wp-admin', 'wp-content', 'wp-includes'],
    lastUsed: '3 days ago',
  },
  {
    id: 5,
    name: 'best1050.txt',
    category: 'Passwords',
    size: '8.8 KB',
    lines: 1049,
    source: 'SecLists',
    description: 'Top 1050 most commonly used passwords.',
    preview: ['123456', 'password', '12345', '1234', '123', 'dragon', 'master', 'qwerty', 'login', 'abc123', 'admin', 'letmein', 'welcome', 'monkey', 'shadow'],
    lastUsed: '1 week ago',
  },
  {
    id: 6,
    name: 'usernames.txt',
    category: 'Usernames',
    size: '24 KB',
    lines: 8607,
    source: 'SecLists',
    description: 'Common usernames for brute-force authentication testing.',
    preview: ['admin', 'administrator', 'root', 'user', 'guest', 'test', 'info', 'mysql', 'postgres', 'oracle', 'ftp', 'www', 'nobody', 'daemon', 'sysadmin'],
    lastUsed: '2 weeks ago',
  },
]

const categoryColors = {
  Passwords: 'rose',
  Directories: 'mint',
  Subdomains: 'lavender',
  Usernames: 'gold',
}

export default function Wordlists() {
  const [selected, setSelected] = useState(sampleWordlists[0])
  const [search, setSearch] = useState('')

  const filtered = sampleWordlists.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[calc(100vh-120px)]">
      {/* Wordlist List */}
      <div className="w-full md:w-[350px] md:min-w-[350px] flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wordlists..."
            aria-label="Search wordlists"
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint transition-colors"
          />
        </div>

        <span className="font-mono text-[11px] text-text-dim">{filtered.length} wordlists</span>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((wl) => (
            <Card key={wl.id} active={selected.id === wl.id} onClick={() => setSelected(wl)}>
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-text-dim flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[12px] text-text-primary truncate">{wl.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color={categoryColors[wl.category]}>{wl.category}</Badge>
                    <span className="font-mono text-[11px] text-text-faint">{wl.size}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-[16px] text-text-primary">{selected.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={categoryColors[selected.category]}>{selected.category}</Badge>
              <span className="font-mono text-[11px] text-text-dim">Source: {selected.source}</span>
            </div>
          </div>
          <Button variant="ghost" size="small" aria-label="Download wordlist"><Download size={12} /> Download</Button>
        </div>

        <p className="font-mono text-[11px] text-text-secondary mb-4">{selected.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <HardDrive size={12} className="text-text-dim" />
              <span className="font-mono text-[11px] text-text-dim uppercase">File Size</span>
            </div>
            <span className="font-heading font-bold text-[18px] text-text-primary">{selected.size}</span>
          </div>
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Hash size={12} className="text-text-dim" />
              <span className="font-mono text-[11px] text-text-dim uppercase">Lines</span>
            </div>
            <span className="font-heading font-bold text-[18px] text-lavender">{selected.lines.toLocaleString()}</span>
          </div>
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye size={12} className="text-text-dim" />
              <span className="font-mono text-[11px] text-text-dim uppercase">Last Used</span>
            </div>
            <span className="font-mono text-[12px] text-text-primary">{selected.lastUsed}</span>
          </div>
        </div>

        <span className="font-mono text-[11px] font-semibold uppercase text-text-dim mb-2">Preview (first {selected.preview.length} entries)</span>
        <div className="flex-1 bg-slime-code rounded-md border border-white/[0.04] overflow-y-auto p-3">
          <div className="font-mono text-[11px] leading-relaxed">
            {selected.preview.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-text-faint w-6 text-right select-none">{i + 1}</span>
                <span className="text-mint">{entry}</span>
              </div>
            ))}
            <div className="text-text-faint mt-2">... {(selected.lines - selected.preview.length).toLocaleString()} more lines</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

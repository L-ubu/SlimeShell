import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ExternalLink } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import FilterChips from '../components/ui/FilterChips.jsx'

const tools = [
  { name: 'Encoding Playground', desc: 'Chain encode/decode like CyberChef', category: 'Crypto & Encoding', path: '/encoding', builtin: true },
  { name: 'Hash Generator', desc: 'MD5, SHA1, SHA256, SHA512', category: 'Crypto & Encoding', path: '/utilities', builtin: true },
  { name: 'ROT13/47', desc: 'Caesar cipher variants', category: 'Crypto & Encoding', path: '/encoding', builtin: true },
  { name: 'XOR Tool', desc: 'XOR encode/decode with key', category: 'Crypto & Encoding', path: '/encoding', builtin: true },
  { name: 'URL Encoder', desc: 'URL encode/decode strings', category: 'Crypto & Encoding', path: '/encoding', builtin: true },
  { name: 'CyberChef', desc: 'Swiss army knife for encoding', category: 'Crypto & Encoding', url: 'https://gchq.github.io/CyberChef/' },
  { name: 'dcode.fr', desc: 'Cipher solver and decoder', category: 'Crypto & Encoding', url: 'https://dcode.fr' },
  { name: 'Reverse Shell Gen', desc: 'One-click reverse shells', category: 'Network & Shell', path: '/revshell', builtin: true },
  { name: 'Netcat', desc: 'Network debugging tool', category: 'Network & Shell', external: true },
  { name: 'nmap', desc: 'Network mapper and scanner', category: 'Network & Shell', external: true },
  { name: 'Gobuster', desc: 'Directory/DNS brute-forcer', category: 'Network & Shell', external: true },
  { name: 'Wireshark', desc: 'Packet capture and analysis', category: 'Network & Shell', url: 'https://wireshark.org' },
  { name: 'JWT Debugger', desc: 'Decode, edit and verify JWTs', category: 'Web Exploitation', path: '/jwt', builtin: true },
  { name: 'HTTP Builder', desc: 'Craft custom HTTP requests', category: 'Web Exploitation', path: '/http', builtin: true },
  { name: 'Burp Suite', desc: 'Web security testing proxy', category: 'Web Exploitation', external: true },
  { name: 'sqlmap', desc: 'SQL injection automation', category: 'Web Exploitation', external: true },
  { name: 'ffuf', desc: 'Fast web fuzzer', category: 'Web Exploitation', external: true },
  { name: 'Payloads Library', desc: 'XSS/SQLi/SSTI payloads', category: 'Web Exploitation', path: '/payloads', builtin: true },
  { name: 'File Analyzer', desc: 'Magic bytes, strings, entropy', category: 'Data Analysis', path: '/file-analyzer', builtin: true },
  { name: 'Diff Tool', desc: 'Compare two texts side by side', category: 'Data Analysis', path: '/diff', builtin: true },
  { name: 'Regex Tester', desc: 'Test regex with live matching', category: 'Data Analysis', path: '/regex', builtin: true },
  { name: 'Subnet Calculator', desc: 'CIDR calculations', category: 'Utilities', path: '/utilities', builtin: true },
  { name: 'Port Reference', desc: 'Common ports lookup', category: 'Utilities', path: '/utilities', builtin: true },
  { name: 'Flag Formatter', desc: 'Wrap flags in CTF formats', category: 'Utilities', path: '/utilities', builtin: true },
  { name: 'ASCII Art Gen', desc: 'Generate ASCII banners', category: 'Utilities', path: '/utilities', builtin: true },
  { name: 'OSINT & Recon', desc: 'Shodan, WHOIS, DNS lookup', category: 'OSINT', path: '/osint', builtin: true },
  { name: 'Esoteric Langs', desc: 'Brainfuck, Ook! interpreter', category: 'Misc', path: '/esoteric', builtin: true },
  { name: 'Hashcat', desc: 'Advanced password recovery', category: 'Password & Hashes', external: true },
  { name: 'John the Ripper', desc: 'Password cracker', category: 'Password & Hashes', external: true },
  { name: 'CrackStation', desc: 'Free hash lookup', category: 'Password & Hashes', url: 'https://crackstation.net' },
]

const categoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'builtin', label: 'Built-in' },
  { id: 'Crypto & Encoding', label: 'Crypto' },
  { id: 'Network & Shell', label: 'Network' },
  { id: 'Web Exploitation', label: 'Web' },
  { id: 'Data Analysis', label: 'Analysis' },
  { id: 'Utilities', label: 'Utils' },
  { id: 'OSINT', label: 'OSINT' },
]

export default function Tools() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchFilter = filter === 'all' || (filter === 'builtin' ? t.builtin : t.category === filter)
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [search, filter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none transition-colors"
          />
        </div>
        <FilterChips options={categoryFilters} selected={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {filtered.map((tool) => {
          const Wrapper = tool.path ? Link : tool.url ? 'a' : 'div'
          const wrapperProps = tool.path
            ? { to: tool.path }
            : tool.url
              ? { href: tool.url, target: '_blank', rel: 'noopener noreferrer' }
              : {}

          return (
            <Wrapper key={tool.name} {...wrapperProps} className="no-underline">
              <Card className="h-full hover:bg-white/[0.03] transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-heading font-semibold text-[13px] text-text-secondary group-hover:text-mint transition-colors">{tool.name}</h3>
                  {tool.url && <ExternalLink size={12} className="text-text-faint" />}
                </div>
                <p className="font-mono text-[10px] text-text-dim mb-2">{tool.desc}</p>
                <div className="flex items-center gap-1.5">
                  <Badge color={tool.builtin ? 'mint' : 'muted'}>
                    {tool.builtin ? 'Built-in' : tool.external ? 'External' : 'Web'}
                  </Badge>
                </div>
              </Card>
            </Wrapper>
          )
        })}
      </div>
    </div>
  )
}

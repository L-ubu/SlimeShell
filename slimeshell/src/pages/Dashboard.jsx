import { Flag, Code, Cpu, FileText, ExternalLink, Zap } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'CTFs Completed', value: 47, icon: Flag, color: 'text-mint', trend: '+3 this month' },
  { label: 'Flags Captured', value: 312, icon: Zap, color: 'text-lavender', trend: '+12 this week' },
  { label: 'Scripts Saved', value: 89, icon: Code, color: 'text-gold', trend: '+5 new' },
  { label: 'Flipper Portals', value: 154, icon: Cpu, color: 'text-sky-accent', trend: '2 recent' },
]

const quickTools = [
  { name: 'Encoding', path: '/encoding', desc: 'Chain encode/decode' },
  { name: 'Rev Shell', path: '/revshell', desc: 'Shell generator' },
  { name: 'Hash Gen', path: '/utilities', desc: 'MD5/SHA/etc.' },
  { name: 'Subnet Calc', path: '/utilities', desc: 'CIDR calculator' },
  { name: 'JWT Debug', path: '/jwt', desc: 'Token debugger' },
  { name: 'Payloads', path: '/payloads', desc: 'XSS/SQLi/SSTI' },
  { name: 'OSINT', path: '/osint', desc: 'Shodan/WHOIS' },
  { name: 'Terminal', path: '/terminal', desc: 'Built-in PTY' },
]

const recentScripts = [
  { name: 'exploit_rce.py', lang: 'Python', time: '2 hours ago' },
  { name: 'enum_suid.sh', lang: 'Bash', time: '5 hours ago' },
  { name: 'sqli_union.py', lang: 'Python', time: '1 day ago' },
  { name: 'port_scan.js', lang: 'JavaScript', time: '2 days ago' },
  { name: 'rev_shell.php', lang: 'PHP', time: '3 days ago' },
]

const langColors = {
  Python: 'lavender',
  Bash: 'mint',
  JavaScript: 'gold',
  PHP: 'rose',
  Ruby: 'rose',
}

const quickRefs = [
  { name: 'GTFOBins', url: 'https://gtfobins.github.io' },
  { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
  { name: 'HackTricks', url: 'https://book.hacktricks.xyz' },
  { name: 'RevShells', url: 'https://revshells.com' },
  { name: 'CrackStation', url: 'https://crackstation.net' },
  { name: 'ExploitDB', url: 'https://exploit-db.com' },
]

const activeCTF = {
  name: 'HTB Cyber Apocalypse 2026',
  platform: 'HTB',
  progress: 18,
  total: 24,
  timeLeft: '2d 14h 32m',
  categories: [
    { name: 'Web', solved: 4, total: 5, color: 'mint' },
    { name: 'Crypto', solved: 3, total: 5, color: 'lavender' },
    { name: 'Pwn', solved: 3, total: 4, color: 'rose' },
    { name: 'Rev', solved: 4, total: 5, color: 'sky' },
    { name: 'Forensics', solved: 4, total: 5, color: 'gold' },
  ],
}

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">{stat.label}</span>
                  <div className={`font-heading font-bold text-[28px] ${stat.color} leading-tight mt-1`}>
                    {stat.value}
                  </div>
                  <span className="font-mono text-[9px] text-text-faint">{stat.trend}</span>
                </div>
                <Icon size={20} className="text-text-dim" strokeWidth={1.5} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        {/* Active CTF */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Active CTF</span>
                <h3 className="font-heading font-bold text-[16px] text-text-primary mt-0.5">{activeCTF.name}</h3>
              </div>
              <div className="text-right">
                <Badge color="mint" pill>{activeCTF.platform}</Badge>
                <div className="font-mono text-[10px] text-text-dim mt-1">{activeCTF.timeLeft} left</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <ProgressBar value={activeCTF.progress} max={activeCTF.total} />
              <span className="font-mono text-[11px] text-mint whitespace-nowrap">
                {activeCTF.progress}/{activeCTF.total}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {activeCTF.categories.map((cat) => (
                <div key={cat.name} className="bg-slime-code rounded-md p-2">
                  <div className="font-mono text-[9px] text-text-dim uppercase">{cat.name}</div>
                  <div className="font-heading font-bold text-[16px] text-text-primary mt-0.5">
                    {cat.solved}<span className="text-text-faint text-[12px]">/{cat.total}</span>
                  </div>
                  <ProgressBar value={cat.solved} max={cat.total} color={cat.color} className="mt-1" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Scripts */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Recent Scripts</span>
            <Link to="/scripts" className="font-mono text-[10px] text-mint hover:text-mint-dark no-underline">View All</Link>
          </div>
          <div className="space-y-1.5">
            {recentScripts.map((script) => (
              <div key={script.name} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-white/[0.02] transition-colors">
                <FileText size={14} className="text-text-dim" />
                <span className="font-mono text-[11px] text-text-secondary flex-1 truncate">{script.name}</span>
                <Badge color={langColors[script.lang]}>{script.lang}</Badge>
                <span className="font-mono text-[8px] text-text-faint">{script.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        {/* Quick Tools */}
        <div className="col-span-2">
          <Card>
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Quick Tools</span>
            <div className="grid grid-cols-4 gap-2">
              {quickTools.map((tool) => (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="bg-slime-code rounded-md p-3 hover:bg-white/[0.04] transition-colors no-underline group"
                >
                  <div className="font-heading font-semibold text-[13px] text-text-secondary group-hover:text-mint transition-colors">{tool.name}</div>
                  <div className="font-mono text-[9px] text-text-dim mt-0.5">{tool.desc}</div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick References */}
        <Card>
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Quick References</span>
          <div className="flex flex-wrap gap-1.5">
            {quickRefs.map((ref) => (
              <a
                key={ref.name}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-mint/[0.06] border border-mint/[0.1] rounded-md px-2.5 py-1.5
                  font-mono text-[10px] text-mint hover:bg-mint/[0.12] transition-colors no-underline"
              >
                {ref.name}
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

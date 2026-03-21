import {
  Flag, Code, Cpu, Zap, FileText, ExternalLink,
  Wifi, Radio, Nfc, Battery, Signal, Globe
} from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'CTFs Completed', value: 23, icon: Flag, accent: 'mint' },
  { label: 'Flags Captured', value: 312, icon: Zap, accent: 'rose' },
  { label: 'Scripts Saved', value: 89, icon: Code, accent: 'lavender' },
  { label: 'Flipper Portals', value: 154, icon: Cpu, accent: 'gold' },
]

const accentColors = {
  mint: { bg: 'rgba(110,231,183,0.08)', text: 'text-mint' },
  rose: { bg: 'rgba(251,113,133,0.08)', text: 'text-rose' },
  lavender: { bg: 'rgba(167,139,250,0.08)', text: 'text-lavender' },
  gold: { bg: 'rgba(251,191,36,0.08)', text: 'text-gold' },
  sky: { bg: 'rgba(125,211,252,0.08)', text: 'text-sky-accent' },
  pink: { bg: 'rgba(244,114,182,0.08)', text: 'text-pink-accent' },
}

const toolIcons = {
  nmap: { label: 'nmap', accent: 'mint' },
  burpsuite: { label: 'burpsuite', accent: 'rose' },
  hashcat: { label: 'hashcat', accent: 'lavender' },
  gobuster: { label: 'gobuster', accent: 'gold' },
  wireshark: { label: 'wireshark', accent: 'sky' },
  sqlmap: { label: 'sqlmap', accent: 'rose' },
  metasploit: { label: 'metasploit', accent: 'lavender' },
  john: { label: 'john', accent: 'gold' },
}

const quickTools = [
  { name: 'nmap', path: '/tools', accent: 'mint', icon: Signal },
  { name: 'burpsuite', path: '/tools', accent: 'rose', icon: Globe },
  { name: 'hashcat', path: '/utilities', accent: 'lavender', icon: Code },
  { name: 'gobuster', path: '/tools', accent: 'gold', icon: FileText },
  { name: 'wireshark', path: '/tools', accent: 'sky', icon: Wifi },
  { name: 'sqlmap', path: '/tools', accent: 'rose', icon: Zap },
  { name: 'metasploit', path: '/tools', accent: 'lavender', icon: Flag },
  { name: 'john', path: '/utilities', accent: 'gold', icon: Code },
]

const recentScripts = [
  { name: 'exploit_rce.py', lang: 'py', color: 'lavender', time: '2h ago', size: '2.4 KB' },
  { name: 'enum_suid.sh', lang: 'sh', color: 'mint', time: '5h ago', size: '1.1 KB' },
  { name: 'sqli_union.py', lang: 'py', color: 'lavender', time: '1d ago', size: '3.8 KB' },
  { name: 'port_scan.js', lang: 'js', color: 'gold', time: '2d ago', size: '1.9 KB' },
  { name: 'rev_shell.rb', lang: 'rb', color: 'rose', time: '3d ago', size: '0.6 KB' },
]

const quickRefs = [
  { name: 'GTFOBins', url: 'https://gtfobins.github.io', color: 'mint' },
  { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings', color: 'lavender' },
  { name: 'HackTricks', url: 'https://book.hacktricks.xyz', color: 'rose' },
  { name: 'RevShells', url: 'https://revshells.com', color: 'gold' },
  { name: 'CrackStation', url: 'https://crackstation.net', color: 'sky' },
  { name: 'ExploitDB', url: 'https://exploit-db.com', color: 'pink' },
]

const activeCTF = {
  name: 'HTB Cyber Apocalypse',
  progress: 7,
  total: 12,
  timeLeft: '2d 14h 32m',
  categories: [
    { name: 'Web', count: 3, color: 'mint' },
    { name: 'Crypto', count: 2, color: 'lavender' },
    { name: 'Pwn', count: 1, color: 'rose' },
    { name: 'Rev', count: 1, color: 'sky' },
  ],
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Stats Row */}
      <div className="flex gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colors = accentColors[stat.accent]
          return (
            <Card key={stat.label} className="flex-1">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0`}
                  style={{ background: colors.bg }}
                >
                  <Icon size={20} className={colors.text} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading font-bold text-[22px] text-text-primary leading-tight">{stat.value}</span>
                  <span className="font-mono text-[10px] text-text-dim">{stat.label}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Active CTF + Recent Scripts row */}
      <div className="flex gap-3.5">
        {/* Active CTF */}
        <Card className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose"></span>
              </span>
              <span className="font-heading font-bold text-[15px] text-text-primary">
                Active CTF — {activeCTF.name}
              </span>
            </div>
            <div className="bg-rose/10 rounded-full px-3 py-1">
              <span className="font-mono text-[10px] text-rose font-semibold">{activeCTF.timeLeft}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] text-text-dim uppercase">Progress</span>
            <span className="font-mono text-[11px] text-mint">{activeCTF.progress} / {activeCTF.total} flags</span>
          </div>
          <ProgressBar value={activeCTF.progress} max={activeCTF.total} className="mb-3" />

          <div className="flex gap-2">
            {activeCTF.categories.map((cat) => {
              const colors = accentColors[cat.color]
              return (
                <span
                  key={cat.name}
                  className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-1 font-mono text-[9px] font-semibold ${colors.text}`}
                  style={{ background: colors.bg }}
                >
                  {cat.name} x{cat.count}
                </span>
              )
            })}
          </div>
        </Card>

        {/* Recent Scripts */}
        <div className="w-[380px] flex-shrink-0">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Recent Scripts</span>
              <Link
                to="/scripts"
                className="font-mono text-[10px] text-mint hover:text-mint-dark no-underline"
              >
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentScripts.map((script) => {
                const colors = accentColors[script.color]
                return (
                  <div
                    key={script.name}
                    className="flex items-center gap-2.5 bg-slime-code border border-white/[0.04] rounded-lg"
                    style={{ padding: '10px 12px' }}
                  >
                    <div
                      className={`w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold ${colors.text}`}
                      style={{ background: colors.bg }}
                    >
                      {script.lang}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[12px] font-medium text-text-secondary truncate">{script.name}</div>
                      <div className="font-mono text-[9px] text-text-faint">Modified {script.time}</div>
                    </div>
                    <span className="font-mono text-[9px] text-text-dim">{script.size}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Tools + Quick References row */}
      <div className="flex gap-3.5">
        {/* Quick Tools */}
        <Card className="flex-1">
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Quick Tools</span>
          <div className="flex flex-wrap gap-2.5">
            {quickTools.map((tool) => {
              const Icon = tool.icon
              const colors = accentColors[tool.accent]
              return (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="flex flex-col items-center gap-2 bg-slime-code border border-white/[0.04] rounded-lg no-underline hover:bg-white/[0.04] transition-colors"
                  style={{ width: 90, padding: '12px 8px' }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.text}`}
                    style={{ background: colors.bg }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="font-mono text-[10px] font-medium text-text-muted">{tool.name}</span>
                </Link>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Flipper Zero + Quick References */}
      <div className="flex gap-3.5">
        {/* Flipper Zero Widget */}
        <div className="w-[340px] flex-shrink-0">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-mint"></div>
                <span className="font-heading font-semibold text-[13px] text-text-primary">Flipper Zero</span>
              </div>
              <Badge color="mint" pill>Connected</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'SubGHz', value: 47, icon: Radio, accent: 'mint' },
                { label: 'RFID', value: 23, icon: Signal, accent: 'lavender' },
                { label: 'NFC', value: 18, icon: Nfc, accent: 'gold' },
              ].map((item) => {
                const Icon = item.icon
                const colors = accentColors[item.accent]
                return (
                  <div key={item.label} className="bg-slime-code rounded-lg p-2.5 text-center">
                    <Icon size={14} className={`${colors.text} mx-auto mb-1`} />
                    <div className="font-heading font-bold text-[16px] text-text-primary">{item.value}</div>
                    <div className="font-mono text-[9px] text-text-dim">{item.label}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-mint" />
              <ProgressBar value={78} max={100} className="flex-1" />
              <span className="font-mono text-[10px] text-text-dim">78%</span>
            </div>
          </Card>
        </div>

        {/* Quick References */}
        <Card className="flex-1">
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Quick References</span>
          <div className="flex flex-wrap gap-2">
            {quickRefs.map((ref) => {
              const colors = accentColors[ref.color]
              return (
                <a
                  key={ref.name}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-[11px] ${colors.text} hover:opacity-80 transition-opacity no-underline`}
                  style={{ background: colors.bg, border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {ref.name}
                  <ExternalLink size={10} />
                </a>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

import {
  Flag, Code, Cpu, Zap, FileText, ExternalLink, ArrowRight,
  Wifi, Radio, Nfc, Battery, Signal, Globe, Shield, Lock
} from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'CTFs Completed', value: 23, icon: Flag, accent: 'mint' },
  { label: 'Flags Captured', value: 147, icon: Zap, accent: 'rose' },
  { label: 'Scripts Saved', value: 84, icon: Code, accent: 'sky' },
  { label: 'Flipper Portals', value: 154, icon: Signal, accent: 'lavender' },
]

const accentColors = {
  mint: { bg: 'rgba(110,231,183,0.08)', text: 'text-mint', hex: '#6EE7B7' },
  rose: { bg: 'rgba(251,113,133,0.08)', text: 'text-rose', hex: '#FB7185' },
  lavender: { bg: 'rgba(167,139,250,0.08)', text: 'text-lavender', hex: '#A78BFA' },
  gold: { bg: 'rgba(251,191,36,0.08)', text: 'text-gold', hex: '#FBBF24' },
  sky: { bg: 'rgba(125,211,252,0.08)', text: 'text-sky-accent', hex: '#7DD3FC' },
  pink: { bg: 'rgba(244,114,182,0.08)', text: 'text-pink-accent', hex: '#F472B6' },
}

const quickTools = [
  { name: 'nmap', path: '/tools', accent: 'mint', icon: Signal },
  { name: 'burpsuite', path: '/tools', accent: 'rose', icon: Globe },
  { name: 'hashcat', path: '/utilities', accent: 'lavender', icon: Lock },
  { name: 'gobuster', path: '/tools', accent: 'gold', icon: FileText },
  { name: 'wireshark', path: '/tools', accent: 'sky', icon: Wifi },
  { name: 'sqlmap', path: '/tools', accent: 'rose', icon: Zap },
  { name: 'metasploit', path: '/tools', accent: 'lavender', icon: Shield },
  { name: 'john', path: '/utilities', accent: 'gold', icon: Code },
]

const recentScripts = [
  { name: 'reverse_shell_gen.py', lang: 'py', color: 'lavender', time: '2h ago', size: '2.4 KB' },
  { name: 'enum_linux.sh', lang: 'sh', color: 'mint', time: '1d ago', size: '3.1 KB' },
  { name: 'xss_payload_fuzz.rb', lang: 'rb', color: 'rose', time: '1d ago', size: '1.8 KB' },
  { name: 'portal_credential_log.js', lang: 'js', color: 'gold', time: '1d ago', size: '892 B' },
  { name: 'buffer_overflow.c', lang: 'c', color: 'rose', time: '1d ago', size: '3.6 KB' },
]

const quickRefs = [
  { name: 'Reverse Shell', desc: 'cheatsheet', color: 'mint' },
  { name: 'Linux PrivEsc', desc: 'cheatsheet', color: 'lavender' },
  { name: 'Windows PrivEsc', desc: 'cheatsheet', color: 'sky' },
  { name: 'SQL Injection', desc: 'payloads', color: 'rose' },
  { name: 'XSS Payloads', desc: 'collection', color: 'gold' },
  { name: 'GTFOBins', desc: 'reference', color: 'mint' },
  { name: 'OWASP Top 10', desc: 'guide', color: 'lavender' },
  { name: 'Nmap Cheat', desc: 'commands', color: 'sky' },
  { name: 'File Transfer', desc: 'methods', color: 'gold' },
]

const activeCTF = {
  name: 'HackTheBox Cyber Apocalypse',
  progress: 7,
  total: 12,
  timeLeft: '03:42:18',
  categories: [
    { name: 'Web', count: 3, color: 'mint' },
    { name: 'Crypto', count: 2, color: 'lavender' },
    { name: 'Rev', count: 1, color: 'sky' },
    { name: 'Forensics', count: 1, color: 'gold' },
  ],
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      {/* Stats Row */}
      <div className="flex gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colors = accentColors[stat.accent]
          return (
            <Card key={stat.label} className="flex-1">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: colors.bg }}
                >
                  <Icon size={20} className={colors.text} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading font-bold text-[26px] text-text-primary leading-none">{stat.value}</span>
                  <span className="font-mono text-[10px] text-text-dim tracking-wide">{stat.label}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Active CTF */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose"></span>
            </span>
            <span className="font-heading font-bold text-[15px] text-text-primary">
              Active CTF — {activeCTF.name}
            </span>
          </div>
          <div
            className="rounded-full px-4 py-1.5 flex-shrink-0"
            style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.12)' }}
          >
            <span className="font-mono text-[10px] text-rose font-semibold">{activeCTF.timeLeft} left</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-text-dim">Progress</span>
              <span className="font-mono text-[11px] text-mint font-medium">{activeCTF.progress} / {activeCTF.total} flags</span>
            </div>
            <ProgressBar value={activeCTF.progress} max={activeCTF.total} />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {activeCTF.categories.map((cat) => {
              const colors = accentColors[cat.color]
              return (
                <span
                  key={cat.name}
                  className={`rounded-[6px] px-3 py-1.5 font-mono text-[10px] font-semibold ${colors.text}`}
                  style={{ background: colors.bg }}
                >
                  {cat.name} x{cat.count}
                </span>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Quick Tools + Recent Scripts row */}
      <div className="flex gap-4">
        {/* Quick Tools */}
        <Card className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="font-heading font-semibold text-[15px] text-text-primary">Quick Tools</span>
            <Link to="/tools" className="flex items-center gap-1 font-mono text-[10px] text-text-dim hover:text-mint no-underline transition-colors">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3.5">
            {quickTools.map((tool) => {
              const Icon = tool.icon
              const colors = accentColors[tool.accent]
              return (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="flex flex-col items-center gap-2.5 bg-slime-code border border-white/[0.04] rounded-xl no-underline hover:border-white/[0.08] transition-colors"
                  style={{ width: 92, padding: '16px 8px' }}
                >
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${colors.text}`}
                    style={{ background: colors.bg }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-[10px] font-medium text-text-muted">{tool.name}</span>
                </Link>
              )
            })}
          </div>
        </Card>

        {/* Recent Scripts */}
        <div className="w-[360px] flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading font-semibold text-[15px] text-text-primary">Recent Scripts</span>
              <Link to="/scripts" className="flex items-center gap-1 font-mono text-[10px] text-text-dim hover:text-mint no-underline transition-colors">
                View all <ArrowRight size={10} />
              </Link>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              {recentScripts.map((script) => {
                const colors = accentColors[script.color]
                return (
                  <div
                    key={script.name}
                    className="flex items-center gap-3 bg-slime-code border border-white/[0.04] rounded-xl"
                    style={{ padding: '10px 14px' }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold ${colors.text}`}
                      style={{ background: colors.bg }}
                    >
                      {script.lang}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[11px] font-medium text-text-secondary truncate">{script.name}</div>
                      <div className="font-mono text-[9px] text-text-faint mt-0.5">Modified {script.time}</div>
                    </div>
                    <span className="font-mono text-[9px] text-text-dim flex-shrink-0">{script.size}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Flipper Zero + Quick References */}
      <div className="flex gap-4">
        {/* Flipper Zero Widget */}
        <div className="w-[360px] flex-shrink-0">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-heading font-semibold text-[15px] text-text-primary">Flipper Zero</span>
                <div className="w-2 h-2 rounded-full bg-mint"></div>
              </div>
              <span className="font-mono text-[10px] text-mint font-semibold">Connected</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'SubGHz', value: 78, accent: 'mint' },
                { label: 'RFID', value: 42, accent: 'lavender' },
                { label: 'NFC', value: 34, accent: 'gold' },
              ].map((item) => (
                <div key={item.label} className="bg-slime-code rounded-xl p-4 text-center">
                  <div className="font-heading font-bold text-[22px] text-text-primary leading-none">{item.value}</div>
                  <div className="font-mono text-[9px] text-text-dim mt-1.5">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={72} max={100} className="flex-1" />
              <span className="font-mono text-[9px] text-text-dim">72% battery</span>
            </div>
          </Card>
        </div>

        {/* Quick References */}
        <Card className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-semibold text-[15px] text-text-primary">Quick References</span>
            <Link to="/references" className="flex items-center gap-1 font-mono text-[10px] text-text-dim hover:text-mint no-underline transition-colors">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {quickRefs.map((ref) => {
              const colors = accentColors[ref.color]
              return (
                <Link
                  key={ref.name}
                  to="/references"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-[11px] no-underline hover:opacity-80 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className={colors.text} style={{ fontWeight: 600 }}>{ref.name}</span>
                  <span className="text-text-faint text-[10px]">{ref.desc}</span>
                </Link>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

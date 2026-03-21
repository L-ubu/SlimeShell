import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard, Wrench, BookOpen, Code, Cpu, Flag, PenTool,
  Shield, Binary, Terminal as TerminalIcon, Globe, Compass,
  Hash, FileText, Clock, FileBarChart, User, StickyNote,
  Bookmark, Settings, Zap
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tools', label: 'Tools', icon: Wrench },
  { path: '/references', label: 'References', icon: BookOpen },
  { path: '/scripts', label: 'Scripts', icon: Code },
  { path: '/flipper', label: 'Flipper Zero', icon: Cpu, badge: '154' },
  { path: '/ctfs', label: 'CTFs', icon: Flag, badge: 'LIVE', badgeType: 'live' },
  { path: '/writeups', label: 'Writeups', icon: PenTool },
  { path: '/payloads', label: 'Payloads', icon: Shield },
  { path: '/encoding', label: 'Encoding', icon: Binary },
  { path: '/revshell', label: 'Rev Shell Gen', icon: TerminalIcon },
  { path: '/osint', label: 'OSINT & Recon', icon: Globe },
  { path: '/terminal', label: 'Terminal', icon: Zap },
  { path: '/utilities', label: 'Utilities', icon: Hash },
  { path: '/wordlists', label: 'Wordlists', icon: FileText },
  { path: '/ctftime', label: 'CTFtime', icon: Clock },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/profile', label: 'Profile & Stats', icon: User },
  { type: 'separator' },
  { path: '/notes', label: 'Notes / Wiki', icon: StickyNote },
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-slime-sidebar flex flex-col border-r border-white/[0.04]">
      <div className="px-5 pt-6 pb-6">
        <Link to="/" className="flex items-center gap-3 no-underline" aria-label="SlimeShell home">
          <div
            className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 12px rgba(110, 231, 183, 0.15)' }}
          >
            <span className="text-slime-terminal font-heading font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-[15px] text-text-primary leading-none">
              SlimeShell
            </h1>
            <span className="font-mono text-[9px] text-mint/40">v0.1.0-alpha</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-0.5" aria-label="Main navigation">
        {navItems.map((item, i) => {
          if (item.type === 'separator') {
            return <div key={i} className="h-px bg-white/[0.04] my-3 mx-2" role="separator" />
          }

          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-heading
                transition-all duration-150 no-underline group
                focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset
                ${isActive
                  ? 'bg-mint/[0.08] text-mint font-semibold'
                  : 'text-white/50 font-medium hover:bg-white/[0.03] hover:text-white/70'
                }
              `}
            >
              <Icon size={16} strokeWidth={1.8} className={isActive ? 'text-mint' : 'text-white/30 group-hover:text-white/50'} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className={`
                  text-[9px] font-mono font-semibold rounded-full px-1.5 py-0.5 leading-none
                  ${item.badgeType === 'live'
                    ? 'bg-mint/10 text-mint'
                    : 'bg-mint text-slime-terminal'
                  }
                `}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <span className="text-[11px] font-heading font-bold text-slime-terminal">L</span>
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-heading font-semibold text-text-secondary truncate">MrGreenSlime</div>
            <div className="text-[9px] font-mono text-white/20 truncate">root@slimeshell</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

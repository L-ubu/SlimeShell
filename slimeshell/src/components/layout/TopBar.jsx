import { useLocation } from 'react-router-dom'
import { Search, Command, Bell } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore.js'

export default function TopBar({ pageConfig }) {
  const location = useLocation()
  const config = pageConfig[location.pathname] || { title: 'SlimeShell', subtitle: '' }
  const openCommandPalette = useAppStore((s) => s.openCommandPalette)

  return (
    <header
      className="flex items-center justify-between border-b border-white/[0.04] bg-slime-base"
      style={{ paddingBlock: 16, paddingInline: 32 }}
    >
      <div className="flex items-center gap-5">
        <h2 className="font-heading font-bold text-[20px] text-text-secondary leading-none">
          {config.title}
        </h2>

        <button
          onClick={openCommandPalette}
          aria-label="Open command palette (Ctrl+K)"
          className="flex items-center gap-2 cursor-pointer transition-colors hover:border-white/10
            focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base"
          style={{
            background: '#1A1F2E',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: '8px 14px',
            minWidth: 240,
          }}
        >
          <Search size={13} className="text-text-faint" />
          <span className="font-mono text-[11px] text-text-faint flex-1 text-left">Search tools, scripts, refs...</span>
          <kbd
            className="font-mono text-[9px]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '2px 6px',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            Cmd K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.12)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose"></span>
          </span>
          <span className="font-mono text-[10px] text-rose font-semibold">CTF LIVE</span>
          <span className="font-mono text-[10px] text-rose/70 font-medium">03:42:18</span>
        </div>

        <button
          aria-label="Notifications"
          className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-text-dim hover:text-text-muted cursor-pointer
            focus-visible:ring-2 focus-visible:ring-mint"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}

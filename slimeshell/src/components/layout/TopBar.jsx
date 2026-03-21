import { useLocation } from 'react-router-dom'
import { Search, Command, Bell } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore.js'

export default function TopBar({ pageConfig }) {
  const location = useLocation()
  const config = pageConfig[location.pathname] || { title: 'SlimeShell', subtitle: '' }
  const openCommandPalette = useAppStore((s) => s.openCommandPalette)

  return (
    <header className="flex items-center justify-between border-b border-white/[0.04] bg-slime-base" style={{ paddingBlock: 16, paddingInline: 28 }}>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-heading font-bold text-[20px] text-text-secondary leading-tight">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="font-mono text-[11px] text-text-dim mt-0.5">{config.subtitle}</p>
          )}
        </div>

        <button
          onClick={openCommandPalette}
          aria-label="Open command palette (Ctrl+K)"
          className="flex items-center gap-2 rounded-lg px-3.5 cursor-pointer transition-colors hover:border-mint/15 hover:text-text-muted
            focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base"
          style={{
            width: 280,
            background: '#1A1F2E',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '7px 14px',
          }}
        >
          <Search size={14} className="text-text-faint" />
          <span className="font-mono text-[12px] text-text-faint">Search...</span>
          <div className="flex items-center gap-0.5 ml-auto">
            <kbd
              className="font-mono text-[10px]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '2px 6px',
                color: 'rgba(255,255,255,0.15)',
              }}
            >
              <Command size={10} className="inline -mt-0.5" />K
            </kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-rose/10 rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose"></span>
          </span>
          <span className="font-mono text-[10px] text-rose font-semibold">CTF LIVE</span>
          <span className="font-mono text-[10px] text-rose/60">2d 14h</span>
        </div>

        <button
          aria-label="Notifications"
          className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-text-dim hover:text-text-muted cursor-pointer
            focus-visible:ring-2 focus-visible:ring-mint"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}

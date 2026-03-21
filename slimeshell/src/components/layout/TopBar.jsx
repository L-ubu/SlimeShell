import { useLocation } from 'react-router-dom'
import { Search, Command } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore.js'

export default function TopBar({ pageConfig }) {
  const location = useLocation()
  const config = pageConfig[location.pathname] || { title: 'SlimeShell', subtitle: '' }
  const openCommandPalette = useAppStore((s) => s.openCommandPalette)

  return (
    <header className="flex items-center justify-between px-7 py-3.5 border-b border-white/[0.04] bg-slime-base min-h-[56px]">
      <div>
        <h2 className="font-heading font-bold text-xl text-text-secondary leading-tight">
          {config.title}
        </h2>
        {config.subtitle && (
          <p className="font-mono text-[11px] text-text-dim mt-0.5">{config.subtitle}</p>
        )}
      </div>

      <button
        onClick={openCommandPalette}
        aria-label="Open command palette (Ctrl+K)"
        className="flex items-center gap-2 bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2
          text-text-faint text-[12px] font-mono hover:border-mint/15 hover:text-text-muted
          focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base
          transition-colors cursor-pointer"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search...</span>
        <div className="flex items-center gap-0.5 ml-4">
          <kbd className="bg-slime-code rounded px-1.5 py-0.5 text-[10px] text-text-dim font-mono">
            <Command size={10} className="inline -mt-0.5" />K
          </kbd>
        </div>
      </button>
    </header>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  LayoutDashboard, Wrench, BookOpen, Code, Cpu, Flag, PenTool,
  Shield, Binary, Terminal, Globe, Hash, FileText, Clock,
  FileBarChart, User, StickyNote, Bookmark, Settings, Zap,
  Search
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore.js'

const commands = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Navigate' },
  { label: 'Tools', path: '/tools', icon: Wrench, group: 'Navigate' },
  { label: 'References', path: '/references', icon: BookOpen, group: 'Navigate' },
  { label: 'Scripts', path: '/scripts', icon: Code, group: 'Navigate' },
  { label: 'Flipper Zero', path: '/flipper', icon: Cpu, group: 'Navigate' },
  { label: 'CTFs', path: '/ctfs', icon: Flag, group: 'Navigate' },
  { label: 'Writeups', path: '/writeups', icon: PenTool, group: 'Navigate' },
  { label: 'Payloads', path: '/payloads', icon: Shield, group: 'Navigate' },
  { label: 'Encoding Playground', path: '/encoding', icon: Binary, group: 'Tools' },
  { label: 'Reverse Shell Generator', path: '/revshell', icon: Terminal, group: 'Tools' },
  { label: 'OSINT & Recon', path: '/osint', icon: Globe, group: 'Tools' },
  { label: 'Terminal', path: '/terminal', icon: Zap, group: 'Tools' },
  { label: 'Utilities', path: '/utilities', icon: Hash, group: 'Tools' },
  { label: 'Wordlists', path: '/wordlists', icon: FileText, group: 'Tools' },
  { label: 'CTFtime & Scoreboard', path: '/ctftime', icon: Clock, group: 'Navigate' },
  { label: 'Reports', path: '/reports', icon: FileBarChart, group: 'Navigate' },
  { label: 'Profile & Stats', path: '/profile', icon: User, group: 'Navigate' },
  { label: 'Notes / Wiki', path: '/notes', icon: StickyNote, group: 'Navigate' },
  { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark, group: 'Navigate' },
  { label: 'Settings', path: '/settings', icon: Settings, group: 'Navigate' },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const isOpen = useAppStore((s) => s.commandPaletteOpen)
  const close = useAppStore((s) => s.closeCommandPalette)
  const open = useAppStore((s) => s.openCommandPalette)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) close()
        else open()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, open])

  if (!isOpen) return null

  const groups = {}
  commands.forEach((cmd) => {
    if (!groups[cmd.group]) groups[cmd.group] = []
    groups[cmd.group].push(cmd)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="fixed inset-0 bg-black/60" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-[560px] mx-4 bg-slime-sidebar border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
        <Command className="font-mono" shouldFilter={true}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <Search size={16} className="text-text-dim" aria-hidden="true" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              aria-label="Search commands"
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-text-primary placeholder:text-text-faint"
            />
          </div>
          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-text-dim text-[13px]">
              No results found.
            </Command.Empty>
            {Object.entries(groups).map(([group, items]) => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-dim [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {items.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <Command.Item
                      key={cmd.path}
                      value={cmd.label}
                      onSelect={() => {
                        navigate(cmd.path)
                        close()
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] text-text-muted
                        data-[selected=true]:bg-mint/[0.06] data-[selected=true]:text-mint transition-colors"
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span className="font-heading font-semibold">{cmd.label}</span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

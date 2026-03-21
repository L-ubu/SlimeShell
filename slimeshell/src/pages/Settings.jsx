import { useState } from 'react'
import { User, Key, Palette, Terminal, Database, Save, Eye, EyeOff } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'

const themeOptions = [
  { id: 'slime-dark', name: 'Slime Dark', primary: '#6EE7B7', bg: '#141820' },
  { id: 'midnight', name: 'Midnight Blue', primary: '#7DD3FC', bg: '#0F172A' },
  { id: 'hacker', name: 'Hacker Green', primary: '#22C55E', bg: '#0A0A0A' },
  { id: 'purple', name: 'Purple Rain', primary: '#A78BFA', bg: '#1A0F2E' },
]

const terminalFonts = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Cascadia Code', 'IBM Plex Mono']
const shellOptions = ['bash', 'zsh', 'fish', 'powershell']

export default function Settings() {
  const [profile, setProfile] = useState({
    username: 'ghost_byte',
    email: 'ghost@slimeshell.io',
    displayName: 'Ghost Byte',
    bio: 'CTF player | Bug bounty hunter',
  })

  const [apiKeys, setApiKeys] = useState({
    shodan: 'sk-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    vtotal: 'vt-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    htb: '',
    ctftime: '',
  })

  const [showKeys, setShowKeys] = useState({})
  const [selectedTheme, setSelectedTheme] = useState('slime-dark')

  const [terminalSettings, setTerminalSettings] = useState({
    font: 'JetBrains Mono',
    fontSize: 12,
    defaultShell: 'bash',
    scrollback: 5000,
    cursorBlink: true,
    cursorStyle: 'block',
    bellSound: false,
    copyOnSelect: true,
  })

  const [dataSettings, setDataSettings] = useState({
    autoSave: true,
    autoBackup: true,
    backupInterval: 'daily',
    syncEnabled: false,
    analyticsEnabled: false,
    crashReports: true,
  })

  const toggleKeyVisibility = (key) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Profile Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-mint" />
          <span className="font-heading font-semibold text-[14px] text-text-primary">Profile</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
          <Input
            label="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Display Name"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          />
          <Input
            label="Bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="primary" size="small"><Save size={12} /> Save Profile</Button>
        </div>
      </Card>

      {/* API Keys Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-gold" />
          <span className="font-heading font-semibold text-[14px] text-text-primary">API Keys</span>
        </div>
        <div className="space-y-3">
          {[
            { key: 'shodan', label: 'Shodan API Key', configured: true },
            { key: 'vtotal', label: 'VirusTotal API Key', configured: true },
            { key: 'htb', label: 'HackTheBox API Key', configured: false },
            { key: 'ctftime', label: 'CTFtime API Key', configured: false },
          ].map((api) => (
            <div key={api.key}>
              <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">
                {api.label}
                {api.configured ? (
                  <Badge color="mint" className="ml-2">Configured</Badge>
                ) : (
                  <Badge color="muted" className="ml-2">Not Set</Badge>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type={showKeys[api.key] ? 'text' : 'password'}
                  value={apiKeys[api.key]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [api.key]: e.target.value })}
                  placeholder="Enter API key..."
                  aria-label={api.label}
                  className="flex-1 bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
                    font-mono text-[12px] text-text-primary placeholder:text-text-faint
                    focus:bg-slime-code focus:border-mint/15 focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-mint transition-colors"
                />
                <button
                  onClick={() => toggleKeyVisibility(api.key)}
                  aria-label={showKeys[api.key] ? `Hide ${api.label}` : `Show ${api.label}`}
                  className="px-3 bg-slime-card border border-white/[0.06] rounded-lg
                    text-text-dim hover:text-text-muted transition-colors cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint focus:outline-none"
                >
                  {showKeys[api.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="primary" size="small"><Save size={12} /> Save Keys</Button>
        </div>
      </Card>

      {/* Theme Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-lavender" />
          <span className="font-heading font-semibold text-[14px] text-text-primary">Theme</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              aria-label={`Select ${theme.name} theme`}
              className={`rounded-lg p-3 text-left transition-all cursor-pointer
                focus-visible:ring-2 focus-visible:ring-mint focus:outline-none
                ${selectedTheme === theme.id
                  ? 'ring-2 ring-mint bg-slime-code'
                  : 'bg-slime-code hover:bg-white/[0.04]'
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.bg }} />
              </div>
              <div className="font-mono text-[11px] text-text-primary">{theme.name}</div>
              {selectedTheme === theme.id && (
                <Badge color="mint" className="mt-1">Active</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Terminal Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={16} className="text-sky-accent" />
          <span className="font-heading font-semibold text-[14px] text-text-primary">Terminal</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Font</label>
            <select
              value={terminalSettings.font}
              onChange={(e) => setTerminalSettings({ ...terminalSettings, font: e.target.value })}
              aria-label="Terminal font"
              className="w-full bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
                font-mono text-[12px] text-text-primary focus:outline-none focus:border-mint/15
                focus-visible:ring-2 focus-visible:ring-mint cursor-pointer appearance-none"
            >
              {terminalFonts.map((f) => (
                <option key={f} value={f} className="bg-slime-card">{f}</option>
              ))}
            </select>
          </div>
          <Input
            label="Font Size"
            type="number"
            value={terminalSettings.fontSize}
            onChange={(e) => setTerminalSettings({ ...terminalSettings, fontSize: Number(e.target.value) })}
          />
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Default Shell</label>
            <select
              value={terminalSettings.defaultShell}
              onChange={(e) => setTerminalSettings({ ...terminalSettings, defaultShell: e.target.value })}
              aria-label="Default shell"
              className="w-full bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
                font-mono text-[12px] text-text-primary focus:outline-none focus:border-mint/15
                focus-visible:ring-2 focus-visible:ring-mint cursor-pointer appearance-none"
            >
              {shellOptions.map((s) => (
                <option key={s} value={s} className="bg-slime-card">{s}</option>
              ))}
            </select>
          </div>
          <Input
            label="Scrollback Lines"
            type="number"
            value={terminalSettings.scrollback}
            onChange={(e) => setTerminalSettings({ ...terminalSettings, scrollback: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
          <Toggle
            label="Cursor Blink"
            enabled={terminalSettings.cursorBlink}
            onChange={(v) => setTerminalSettings({ ...terminalSettings, cursorBlink: v })}
          />
          <Toggle
            label="Bell Sound"
            enabled={terminalSettings.bellSound}
            onChange={(v) => setTerminalSettings({ ...terminalSettings, bellSound: v })}
          />
          <Toggle
            label="Copy on Select"
            enabled={terminalSettings.copyOnSelect}
            onChange={(v) => setTerminalSettings({ ...terminalSettings, copyOnSelect: v })}
          />
        </div>
      </Card>

      {/* Data Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-rose" />
          <span className="font-heading font-semibold text-[14px] text-text-primary">Data & Privacy</span>
        </div>
        <div className="space-y-3">
          <Toggle
            label="Auto-save notes and scripts"
            enabled={dataSettings.autoSave}
            onChange={(v) => setDataSettings({ ...dataSettings, autoSave: v })}
          />
          <Toggle
            label="Automatic backups"
            enabled={dataSettings.autoBackup}
            onChange={(v) => setDataSettings({ ...dataSettings, autoBackup: v })}
          />
          <Toggle
            label="Cloud sync"
            enabled={dataSettings.syncEnabled}
            onChange={(v) => setDataSettings({ ...dataSettings, syncEnabled: v })}
          />
          <Toggle
            label="Usage analytics"
            enabled={dataSettings.analyticsEnabled}
            onChange={(v) => setDataSettings({ ...dataSettings, analyticsEnabled: v })}
          />
          <Toggle
            label="Crash reports"
            enabled={dataSettings.crashReports}
            onChange={(v) => setDataSettings({ ...dataSettings, crashReports: v })}
          />
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex gap-2">
          <Button variant="secondary" size="small">Export Data</Button>
          <Button variant="secondary" size="small">Import Data</Button>
          <Button variant="destructive" size="small">Clear All Data</Button>
        </div>
      </Card>
    </div>
  )
}

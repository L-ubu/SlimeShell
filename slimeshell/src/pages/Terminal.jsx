import { useState, useRef, useEffect } from 'react'
import { Plus, X, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const shellTypes = ['bash', 'zsh', 'fish', 'powershell', 'python']

const sampleHistory = [
  { type: 'input', text: '$ whoami' },
  { type: 'output', text: 'slimeshell' },
  { type: 'input', text: '$ uname -a' },
  { type: 'output', text: 'Linux slimebox 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' },
  { type: 'input', text: '$ ip addr show eth0 | grep inet' },
  { type: 'output', text: '    inet 10.10.14.5/23 brd 10.10.15.255 scope global dynamic noprefixroute eth0' },
  { type: 'input', text: '$ nmap -sC -sV 10.10.11.42 -oN scan.txt' },
  { type: 'output', text: `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.11.42
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    Apache/2.4.52
443/tcp  open  ssl     nginx/1.22.1
3306/tcp open  mysql   MySQL 5.7.40
8080/tcp open  http    Apache Tomcat 9.0.65

Service detection performed. 5 services scanned.
Nmap done: 1 IP address (1 host up) scanned in 14.32 seconds` },
  { type: 'input', text: '$ gobuster dir -u http://10.10.11.42 -w /usr/share/wordlists/dirb/common.txt' },
  { type: 'output', text: `===============================================================
Gobuster v3.6
===============================================================
/admin                (Status: 302) [Size: 0] --> /login
/api                  (Status: 200) [Size: 48]
/backup               (Status: 403) [Size: 277]
/config               (Status: 403) [Size: 277]
/uploads              (Status: 301) [Size: 317]
===============================================================` },
]

export default function Terminal() {
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Terminal 1', shell: 'bash' },
    { id: 2, name: 'Terminal 2', shell: 'zsh' },
  ])
  const [activeTab, setActiveTab] = useState(1)
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState(sampleHistory)
  const [selectedShell, setSelectedShell] = useState('bash')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showShellSelect, setShowShellSelect] = useState(false)
  const terminalRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!command.trim()) return
    const newHistory = [
      ...history,
      { type: 'input', text: `$ ${command}` },
      { type: 'output', text: `bash: ${command}: command simulated` },
    ]
    setHistory(newHistory)
    setCommand('')
  }

  const addTab = () => {
    const newId = Math.max(...tabs.map((t) => t.id)) + 1
    setTabs([...tabs, { id: newId, name: `Terminal ${newId}`, shell: selectedShell }])
    setActiveTab(newId)
  }

  const closeTab = (id) => {
    if (tabs.length === 1) return
    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeTab === id) setActiveTab(remaining[0].id)
  }

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slime-base p-4' : 'h-[calc(100vh-120px)]'}`}>
      {/* Tab Bar */}
      <div className="flex items-center gap-0 bg-slime-card rounded-t-lg border border-white/[0.06] border-b-0">
        <div className="flex items-center flex-1 overflow-x-auto" role="tablist" aria-label="Terminal tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab.id) }}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer border-b-2 transition-colors
                focus-visible:ring-2 focus-visible:ring-mint
                ${activeTab === tab.id
                  ? 'border-mint bg-slime-terminal text-mint'
                  : 'border-transparent text-text-dim hover:text-text-muted'
                }`}
            >
              <span className="font-mono text-[11px]">{tab.name}</span>
              <span className="font-mono text-[10px] text-text-faint">{tab.shell}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                  aria-label={`Close ${tab.name}`}
                  className="text-text-faint hover:text-rose transition-colors cursor-pointer ml-1
                    focus-visible:ring-2 focus-visible:ring-mint rounded"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTab}
            aria-label="New terminal tab"
            className="px-3 py-2.5 text-text-dim hover:text-mint transition-colors cursor-pointer
              focus-visible:ring-2 focus-visible:ring-mint rounded"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3">
          {/* Shell Selector */}
          <div className="relative">
            <button
              onClick={() => setShowShellSelect(!showShellSelect)}
              aria-label="Select shell type"
              aria-expanded={showShellSelect}
              className="flex items-center gap-1 px-2.5 py-1 bg-slime-code rounded-md font-mono text-[11px] text-text-muted
                hover:text-text-secondary transition-colors cursor-pointer
                focus-visible:ring-2 focus-visible:ring-mint"
            >
              {selectedShell} <ChevronDown size={10} />
            </button>
            {showShellSelect && (
              <div className="absolute top-full right-0 mt-1 bg-slime-card border border-white/[0.08] rounded-md shadow-lg z-10" role="listbox" aria-label="Shell types">
                {shellTypes.map((shell) => (
                  <button
                    key={shell}
                    role="option"
                    aria-selected={selectedShell === shell}
                    onClick={() => { setSelectedShell(shell); setShowShellSelect(false) }}
                    className="block w-full text-left px-3 py-1.5 font-mono text-[11px] text-text-muted
                      hover:bg-white/[0.04] hover:text-mint transition-colors cursor-pointer
                      focus-visible:ring-2 focus-visible:ring-mint"
                  >
                    {shell}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
            className="text-text-dim hover:text-text-muted transition-colors cursor-pointer p-1
              focus-visible:ring-2 focus-visible:ring-mint rounded"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 bg-slime-terminal border border-white/[0.06] border-t-0 rounded-b-lg overflow-y-auto p-4 cursor-text"
      >
        <div className="font-mono text-[11px] leading-relaxed">
          {/* MOTD */}
          <div className="text-text-dim mb-3">
            <div className="text-mint font-bold">SlimeShell Terminal v1.0</div>
            <div className="text-text-faint">Type 'help' for available commands</div>
            <div className="text-text-faint">Connected to slimebox @ 10.10.14.5</div>
            <div className="border-b border-white/[0.04] mt-2 mb-2" />
          </div>

          {history.map((entry, i) => (
            <div key={i} className={`${entry.type === 'input' ? 'text-mint' : 'text-text-secondary'} whitespace-pre-wrap mb-0.5`}>
              {entry.text}
            </div>
          ))}

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-mint mr-1">$</span>
            <input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              aria-label="Terminal command input"
              className="flex-1 bg-transparent text-text-primary outline-none font-mono text-[11px] caret-mint"
              autoFocus
              spellCheck={false}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

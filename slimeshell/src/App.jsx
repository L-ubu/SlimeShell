import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import CommandPalette from './components/layout/CommandPalette.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tools from './pages/Tools.jsx'
import References from './pages/References.jsx'
import Scripts from './pages/Scripts.jsx'
import FlipperZero from './pages/FlipperZero.jsx'
import CTFs from './pages/CTFs.jsx'
import Writeups from './pages/Writeups.jsx'
import Payloads from './pages/Payloads.jsx'
import Encoding from './pages/Encoding.jsx'
import RevShell from './pages/RevShell.jsx'
import Osint from './pages/Osint.jsx'
import Terminal from './pages/Terminal.jsx'
import Utilities from './pages/Utilities.jsx'
import Wordlists from './pages/Wordlists.jsx'
import CTFtime from './pages/CTFtime.jsx'
import Reports from './pages/Reports.jsx'
import Profile from './pages/Profile.jsx'
import Notes from './pages/Notes.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import Settings from './pages/Settings.jsx'
import JWT from './pages/JWT.jsx'
import FileAnalyzer from './pages/FileAnalyzer.jsx'
import NetworkMap from './pages/NetworkMap.jsx'
import VPN from './pages/VPN.jsx'
import Collab from './pages/Collab.jsx'
import HTTP from './pages/HTTP.jsx'
import Esoteric from './pages/Esoteric.jsx'
import Regex from './pages/Regex.jsx'
import Diff from './pages/Diff.jsx'

const pageConfig = {
  '/': { title: 'Dashboard', subtitle: 'Overview & Quick Access' },
  '/tools': { title: 'Tools', subtitle: 'All Tools & Utilities' },
  '/references': { title: 'References', subtitle: 'Cheatsheets & Commands' },
  '/scripts': { title: 'Scripts', subtitle: 'Script Manager' },
  '/flipper': { title: 'Flipper Zero', subtitle: 'Device Dashboard' },
  '/ctfs': { title: 'CTFs', subtitle: 'Competition Tracker' },
  '/writeups': { title: 'Writeups', subtitle: 'CTF Writeups' },
  '/payloads': { title: 'Payloads', subtitle: 'Payload Library' },
  '/encoding': { title: 'Encoding Playground', subtitle: 'Chain Encoder/Decoder' },
  '/revshell': { title: 'Reverse Shell Gen', subtitle: 'Shell Generator' },
  '/osint': { title: 'OSINT & Recon', subtitle: 'Intelligence Gathering' },
  '/terminal': { title: 'Terminal', subtitle: 'Built-in Terminal' },
  '/utilities': { title: 'Utilities', subtitle: 'Hash, Subnet, Ports & More' },
  '/wordlists': { title: 'Wordlists', subtitle: 'Wordlist Manager' },
  '/ctftime': { title: 'CTFtime', subtitle: 'Upcoming CTFs & Scoreboard' },
  '/reports': { title: 'Reports', subtitle: 'Report Generator' },
  '/profile': { title: 'Profile & Stats', subtitle: 'Your Hacking Profile' },
  '/notes': { title: 'Notes / Wiki', subtitle: 'Knowledge Base' },
  '/bookmarks': { title: 'Bookmarks', subtitle: 'Saved Links' },
  '/settings': { title: 'Settings', subtitle: 'App Configuration' },
  '/jwt': { title: 'JWT Debugger', subtitle: 'Decode & Verify Tokens' },
  '/file-analyzer': { title: 'File Analyzer', subtitle: 'Forensic Analysis' },
  '/network-map': { title: 'Network Map', subtitle: 'Infrastructure Mapper' },
  '/vpn': { title: 'VPN Manager', subtitle: 'VPN Connections' },
  '/collab': { title: 'Collab Mode', subtitle: 'Team Collaboration' },
  '/http': { title: 'HTTP Builder', subtitle: 'Request Builder' },
  '/esoteric': { title: 'Esoteric Languages', subtitle: 'Brainfuck, Ook! & More' },
  '/regex': { title: 'Regex Tester', subtitle: 'Pattern Matching' },
  '/diff': { title: 'Diff Tool', subtitle: 'Text Comparison' },
}

export default function App() {
  return (
    <div className="flex h-screen w-screen bg-slime-base">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageConfig={pageConfig} />
        <main className="flex-1 overflow-auto px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/references" element={<References />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/flipper" element={<FlipperZero />} />
            <Route path="/ctfs" element={<CTFs />} />
            <Route path="/writeups" element={<Writeups />} />
            <Route path="/payloads" element={<Payloads />} />
            <Route path="/encoding" element={<Encoding />} />
            <Route path="/revshell" element={<RevShell />} />
            <Route path="/osint" element={<Osint />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/wordlists" element={<Wordlists />} />
            <Route path="/ctftime" element={<CTFtime />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/jwt" element={<JWT />} />
            <Route path="/file-analyzer" element={<FileAnalyzer />} />
            <Route path="/network-map" element={<NetworkMap />} />
            <Route path="/vpn" element={<VPN />} />
            <Route path="/collab" element={<Collab />} />
            <Route path="/http" element={<HTTP />} />
            <Route path="/esoteric" element={<Esoteric />} />
            <Route path="/regex" element={<Regex />} />
            <Route path="/diff" element={<Diff />} />
          </Routes>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

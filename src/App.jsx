import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[220px]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tools" element={<Placeholder title="Tools" />} />
          <Route path="/references" element={<Placeholder title="References" />} />
          <Route path="/scripts" element={<Placeholder title="Scripts" />} />
          <Route path="/flipper" element={<Placeholder title="Flipper Zero" />} />
          <Route path="/ctfs" element={<Placeholder title="CTFs" />} />
          <Route path="/writeups" element={<Placeholder title="Writeups" />} />
          <Route path="/payloads" element={<Placeholder title="Payloads" />} />
          <Route path="/encoding" element={<Placeholder title="Encoding Playground" />} />
          <Route path="/revshell" element={<Placeholder title="Reverse Shell Generator" />} />
          <Route path="/osint" element={<Placeholder title="OSINT & Recon" />} />
          <Route path="/terminal" element={<Placeholder title="Terminal" />} />
          <Route path="/utilities" element={<Placeholder title="Utilities" />} />
          <Route path="/wordlists" element={<Placeholder title="Wordlist Manager" />} />
          <Route path="/ctftime" element={<Placeholder title="CTFtime & Scoreboard" />} />
          <Route path="/reports" element={<Placeholder title="Report Generator" />} />
          <Route path="/profile" element={<Placeholder title="Profile & Stats" />} />
          <Route path="/notes" element={<Placeholder title="Notes / Wiki" />} />
          <Route path="/bookmarks" element={<Placeholder title="Bookmarks" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/jwt" element={<Placeholder title="JWT Debugger" />} />
          <Route path="/file-analyzer" element={<Placeholder title="File Analyzer" />} />
          <Route path="/network-map" element={<Placeholder title="Network Map" />} />
          <Route path="/vpn" element={<Placeholder title="VPN Manager" />} />
          <Route path="/collab" element={<Placeholder title="Collab Mode" />} />
          <Route path="/http" element={<Placeholder title="HTTP Builder" />} />
          <Route path="/esoteric" element={<Placeholder title="Esoteric Languages" />} />
          <Route path="/regex" element={<Placeholder title="Regex Tester" />} />
          <Route path="/diff" element={<Placeholder title="Diff Tool" />} />
        </Routes>
      </main>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-b-[rgba(255,255,255,0.04)] px-7 py-4">
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-text-secondary">
          {title}
        </h1>
      </div>
      <div className="p-7 flex items-center justify-center min-h-[60vh]">
        <p className="text-text-dim text-sm font-[var(--font-mono)]">
          {title} — coming in Phase 2+
        </p>
      </div>
    </div>
  );
}

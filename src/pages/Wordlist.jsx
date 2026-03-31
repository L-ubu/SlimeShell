import { useCallback, useMemo, useState } from "react";
import { Download, List } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";
const accent = "#A78BFA";
const cardBg = "#1A1F2E";
const codeBg = "#0B0F18";

const SPECIALS = "!@#$%^&*";

function leetify(str) {
  const map = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" };
  return [...str]
    .map((c) => {
      const lc = c.toLowerCase();
      return map[lc] !== undefined ? map[lc] : c;
    })
    .join("");
}

function buildNumberSuffixes() {
  const out = [];
  for (let i = 0; i <= 9; i++) out.push(String(i));
  for (let i = 0; i <= 99; i++) out.push(String(i).padStart(2, "0"));
  for (let y = 2020; y <= 2026; y++) out.push(String(y));
  return out;
}

const NUMBER_SUFFIXES = buildNumberSuffixes();

function generateWordlist(baseWords, options) {
  const {
    appendNumbers,
    appendSpecials,
    leet,
    upper,
    lower,
    capitalize,
    reverse,
    combinePairs,
    maxLimit,
  } = options;

  const base = [...new Set(baseWords.map((w) => w.trim()).filter(Boolean))];
  const out = new Set(base);

  for (const w of base) {
    if (appendNumbers) {
      for (const s of NUMBER_SUFFIXES) out.add(w + s);
    }
    if (appendSpecials) {
      for (const c of SPECIALS) out.add(w + c);
    }
    if (leet) {
      out.add(leetify(w));
    }
    if (upper) {
      out.add(w.toUpperCase());
    }
    if (lower) {
      out.add(w.toLowerCase());
    }
    if (capitalize) {
      if (w.length === 0) continue;
      out.add(
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );
    }
    if (reverse) {
      out.add([...w].reverse().join(""));
    }
  }

  if (combinePairs && base.length >= 2) {
    for (let i = 0; i < base.length; i++) {
      for (let j = 0; j < base.length; j++) {
        if (i === j) continue;
        out.add(base[i] + base[j]);
      }
    }
  }

  const sorted = [...out].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  const totalBeforeLimit = sorted.length;
  const limited = sorted.slice(0, Math.max(1, maxLimit));
  return { lines: limited, totalBeforeLimit };
}

function TogglePill({ checked, onChange, label }) {
  return (
    <label
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          fontWeight: 600,
          padding: "8px 12px",
          borderRadius: 999,
          border: `1px solid ${checked ? accent : "rgba(255,255,255,0.12)"}`,
          background: checked ? `${accent}22` : "rgba(255,255,255,0.04)",
          color: checked ? accent : "#9CA3AF",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        {label}
      </span>
    </label>
  );
}

export default function Wordlist() {
  const [baseText, setBaseText] = useState("");
  const [appendNumbers, setAppendNumbers] = useState(false);
  const [appendSpecials, setAppendSpecials] = useState(false);
  const [leet, setLeet] = useState(false);
  const [upper, setUpper] = useState(false);
  const [lower, setLower] = useState(false);
  const [capitalize, setCapitalize] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [combinePairs, setCombinePairs] = useState(false);
  const [maxLimit, setMaxLimit] = useState(10000);
  const [outputLines, setOutputLines] = useState([]);
  const [totalBeforeLimit, setTotalBeforeLimit] = useState(0);
  const [copyFlash, setCopyFlash] = useState(false);

  const outputText = useMemo(() => outputLines.join("\n"), [outputLines]);

  const estimatedBytes = useMemo(() => {
    if (!outputText) return 0;
    return new Blob([outputText], { type: "text/plain" }).size;
  }, [outputText]);

  const handleGenerate = useCallback(() => {
    const baseWords = baseText.split(/\n/);
    const { lines, totalBeforeLimit: total } = generateWordlist(baseWords, {
      appendNumbers,
      appendSpecials,
      leet,
      upper,
      lower,
      capitalize,
      reverse,
      combinePairs,
      maxLimit: Number(maxLimit) || 10000,
    });
    setOutputLines(lines);
    setTotalBeforeLimit(total);
  }, [
    baseText,
    appendNumbers,
    appendSpecials,
    leet,
    upper,
    lower,
    capitalize,
    reverse,
    combinePairs,
    maxLimit,
  ]);

  const handleCopyAll = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 1500);
  }, [outputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wordlist.txt";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [outputText]);

  const truncated = totalBeforeLimit > outputLines.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${accent}28`,
            border: `1px solid ${accent}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <List size={20} color={accent} strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: "#F3F4F6",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Wordlist Generator
        </h1>
        <ToolHelp title="Wordlist Generator" description="Build custom wordlists with rules, masks, and combinators for password cracking and fuzzing." steps={["Enter base words or patterns","Apply transformation rules (capitalize, leet, append numbers)","Set length and character requirements","Copy or download the generated wordlist"]} tips={["Combine multiple rule types for comprehensive lists","Use mask mode for systematic generation","Great for targeted password attacks"]} />
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            flex: "1 1 320px",
            maxWidth: "100%",
            width: "40%",
            minWidth: 280,
            background: cardBg,
            borderColor: "rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: accent,
              textTransform: "uppercase",
            }}
          >
            Base words
          </span>
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder={"admin\npassword\nroot\ntest"}
            rows={8}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: 140,
              fontFamily: mono,
              fontSize: 12,
              lineHeight: 1.5,
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: codeBg,
              color: "#E5E7EB",
              outline: "none",
            }}
          />

          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: accent,
              textTransform: "uppercase",
            }}
          >
            Transformations
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <TogglePill
              checked={appendNumbers}
              onChange={setAppendNumbers}
              label="Append numbers (0–9, 00–99, 2020–2026)"
            />
            <TogglePill
              checked={appendSpecials}
              onChange={setAppendSpecials}
              label={`Append specials (${SPECIALS})`}
            />
            <TogglePill
              checked={leet}
              onChange={setLeet}
              label="Leet speak"
            />
            <TogglePill checked={upper} onChange={setUpper} label="UPPERCASE" />
            <TogglePill checked={lower} onChange={setLower} label="lowercase" />
            <TogglePill
              checked={capitalize}
              onChange={setCapitalize}
              label="Capitalize"
            />
            <TogglePill checked={reverse} onChange={setReverse} label="Reverse" />
            <TogglePill
              checked={combinePairs}
              onChange={setCombinePairs}
              label="Combine pairs"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: accent,
                textTransform: "uppercase",
              }}
            >
              Max output limit
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <input
                type="range"
                min={100}
                max={500000}
                step={100}
                value={Math.min(
                  500000,
                  Math.max(100, Number(maxLimit) || 10000)
                )}
                onChange={(e) => setMaxLimit(Number(e.target.value))}
                style={{
                  flex: "1 1 160px",
                  accentColor: accent,
                  minWidth: 120,
                }}
              />
              <div style={{ width: 120 }}>
                <Input
                  type="number"
                  min={1}
                  max={500000}
                  value={maxLimit}
                  onChange={(e) =>
                    setMaxLimit(
                      Math.min(
                        500000,
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    )
                  }
                  style={{
                    background: codeBg,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            style={{
              marginTop: 4,
              fontFamily: heading,
              fontSize: 14,
              fontWeight: 700,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #6EE7B7, #34D399)",
              color: "#0B0F18",
              boxShadow: "0 4px 20px rgba(52, 211, 153, 0.25)",
            }}
          >
            Generate
          </button>
        </Card>

        <Card
          style={{
            flex: "1 1 380px",
            width: "60%",
            minWidth: 280,
            background: cardBg,
            borderColor: "rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              fontFamily: mono,
              fontSize: 12,
              color: "#D1D5DB",
            }}
          >
            <div>
              <span style={{ color: "#6B7280" }}>Words: </span>
              <strong style={{ color: accent }}>{outputLines.length}</strong>
              {truncated && (
                <span style={{ color: "#6B7280", marginLeft: 6 }}>
                  (of {totalBeforeLimit} before limit)
                </span>
              )}
            </div>
            <div>
              <span style={{ color: "#6B7280" }}>Est. size: </span>
              <strong style={{ color: accent }}>
                {estimatedBytes.toLocaleString()} bytes
              </strong>
            </div>
          </div>

          <textarea
            readOnly
            value={outputText}
            placeholder="Click Generate to build your wordlist…"
            rows={18}
            style={{
              width: "100%",
              boxSizing: "border-box",
              flex: 1,
              minHeight: 320,
              fontFamily: mono,
              fontSize: 11,
              lineHeight: 1.45,
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: codeBg,
              color: "#E5E7EB",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={!outputText}
              style={{
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 18px",
                borderRadius: 10,
                border: `1px solid ${accent}66`,
                background: outputText ? `${accent}18` : "rgba(255,255,255,0.04)",
                color: outputText ? accent : "#6B7280",
                cursor: outputText ? "pointer" : "not-allowed",
              }}
            >
              {copyFlash ? "Copied!" : "Copy All"}
            </button>
            <CopyButton text={outputText} />
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputText}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: outputText
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.03)",
                color: outputText ? "#E5E7EB" : "#6B7280",
                cursor: outputText ? "pointer" : "not-allowed",
              }}
            >
              <Download size={16} />
              Download .txt
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

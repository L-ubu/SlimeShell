import { useRef, useState } from "react";
import {
  Settings as SettingsIcon,
  Check,
  Keyboard,
  Download,
  Upload,
  Trash2,
  Save,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import { useAppStore } from "../store/app.js";
import useToasts from "../store/toasts.js";

const SLIMESHELL_PREFIX = "slimeshell-";

function iterSlimeshellKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(SLIMESHELL_PREFIX)) keys.push(k);
  }
  return keys;
}

function collectSlimeshellExportData() {
  const data = {};
  for (const key of iterSlimeshellKeys()) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return data;
}

function getSlimeshellStorageSizeKb() {
  const enc = new TextEncoder();
  let bytes = 0;
  for (const key of iterSlimeshellKeys()) {
    const val = localStorage.getItem(key) || "";
    bytes += enc.encode(key).byteLength + enc.encode(val).byteLength;
  }
  return Math.round((bytes / 1024) * 100) / 100;
}

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const accentColors = [
  { hex: "#6EE7B7", label: "Mint" },
  { hex: "#A78BFA", label: "Violet" },
  { hex: "#FBBF24", label: "Amber" },
  { hex: "#7DD3FC", label: "Sky" },
  { hex: "#F472B6", label: "Pink" },
  { hex: "#FB7185", label: "Rose" },
];

const shells = [
  "/bin/sh",
  "/bin/bash",
  "/bin/zsh",
  "cmd.exe",
  "powershell.exe",
];

const shortcuts = [
  { keys: "⌘ K", desc: "Command Palette" },
  { keys: "⌘ 1-9", desc: "Quick navigate to tools" },
  { keys: "⌘ ,", desc: "Open Settings" },
  { keys: "⌘ .", desc: "Toggle sidebar collapse" },
  { keys: "⌘ /", desc: "Focus search" },
  { keys: "⌘ \\", desc: "Toggle favorites panel" },
  { keys: "Esc", desc: "Close modals / panels" },
  { keys: "⌘ Enter", desc: "Run/Execute (in tools)" },
  { keys: "⌘ Shift C", desc: "Copy output" },
  { keys: "?", desc: "Show shortcuts (from Dashboard)" },
];

const kbdStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 5,
  padding: "3px 8px",
  fontFamily: mono,
  fontSize: 11,
  color: "#9CA3AF",
  display: "inline-block",
  lineHeight: 1.5,
};

const sectionTitle = {
  fontFamily: heading,
  fontSize: 14,
  fontWeight: 700,
  color: "#E2E8F0",
  margin: 0,
  marginBottom: 14,
};

const selectStyle = {
  background: "#0B0F18",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "10px 14px",
  fontFamily: mono,
  fontSize: 12,
  color: "#E2E8F0",
  outline: "none",
  width: "100%",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

const comingSoon = {
  fontFamily: mono,
  fontSize: 9,
  color: "#3B4252",
  fontStyle: "italic",
};

const LS_SESSIONS = "slimeshell-sessions";

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSIONS) || "[]");
  } catch {
    return [];
  }
}

function SessionManager({ addToast }) {
  const [sessions, setSessions] = useState(loadSessions);
  const [name, setName] = useState("");

  const saveSession = () => {
    const label = name.trim() || `Session ${sessions.length + 1}`;
    const data = collectSlimeshellExportData();
    const session = {
      id: Date.now().toString(36),
      name: label,
      savedAt: new Date().toISOString(),
      data,
    };
    const next = [session, ...sessions].slice(0, 10);
    setSessions(next);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(next));
    setName("");
    addToast({ type: "success", message: `Session "${label}" saved` });
  };

  const loadSession = (session) => {
    if (
      !window.confirm(
        `Restore session "${session.name}"? Current state will be overwritten.`,
      )
    )
      return;
    const { data } = session;
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    }
    addToast({
      type: "success",
      message: `Session "${session.name}" restored — reloading...`,
    });
    setTimeout(() => window.location.reload(), 600);
  };

  const deleteSession = (id) => {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(next));
  };

  const btnSm = {
    background: "none",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: 10,
    transition: "all 150ms",
  };

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Session name (optional)"
          style={{
            flex: 1,
            background: "#0B0F18",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily: mono,
            fontSize: 11,
            color: "#E2E8F0",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={saveSession}
          style={{
            ...btnSm,
            color: "#6EE7B7",
            background: "rgba(110,231,183,0.12)",
            borderColor: "rgba(110,231,183,0.28)",
            padding: "8px 14px",
            fontSize: 11,
          }}
        >
          <Save size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          Save
        </button>
      </div>
      {sessions.length === 0 && (
        <span style={{ fontFamily: mono, fontSize: 10, color: "#3B4252" }}>
          No saved sessions yet
        </span>
      )}
      {sessions.map((s) => (
        <div
          key={s.id}
          className="flex items-center"
          style={{
            gap: 10,
            background: "#0B0F18",
            borderRadius: 8,
            padding: "8px 12px",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: heading,
                fontSize: 12,
                fontWeight: 600,
                color: "#E2E8F0",
              }}
            >
              {s.name}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280" }}>
              {new Date(s.savedAt).toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadSession(s)}
            style={{ ...btnSm, color: "#7DD3FC" }}
          >
            Restore
          </button>
          <button
            type="button"
            onClick={() => deleteSession(s.id)}
            style={{ ...btnSm, color: "#FB7185" }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Settings() {
  const {
    lhost,
    lport,
    username,
    shellPreference,
    setLhost,
    setLport,
    setUsername,
    setShellPreference,
    accentColor,
    setAccentColor,
    fontSize: fontSizePref,
    setFontSize,
  } = useAppStore();

  const addToast = useToasts((s) => s.addToast);
  const fileInputRef = useRef(null);
  const [storageKb, setStorageKb] = useState(() =>
    getSlimeshellStorageSizeKb(),
  );

  const refreshStorageKb = () => setStorageKb(getSlimeshellStorageSizeKb());

  const handleExportAllData = () => {
    const data = collectSlimeshellExportData();
    const payload = {
      version: "0.3.0",
      exportedAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    a.download = `slimeshell-backup-${ymd}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        const parsed = JSON.parse(text);
        if (
          parsed == null ||
          typeof parsed !== "object" ||
          !("version" in parsed) ||
          !("data" in parsed) ||
          parsed.data == null ||
          typeof parsed.data !== "object" ||
          Array.isArray(parsed.data)
        ) {
          addToast({
            type: "error",
            message: "Invalid backup file. Expected version and data fields.",
          });
          return;
        }
        if (
          !window.confirm(
            "This will overwrite your current SlimeShell data in local storage. Continue?",
          )
        ) {
          return;
        }
        const { data } = parsed;
        for (const key of Object.keys(data)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
        refreshStorageKb();
        addToast({
          type: "success",
          message: "Backup imported! Refresh to apply.",
        });
      } catch {
        addToast({
          type: "error",
          message: "Could not read backup file. Check that it is valid JSON.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    if (
      !window.confirm(
        "Remove all SlimeShell data from this device? This cannot be undone.",
      )
    ) {
      return;
    }
    const keys = iterSlimeshellKeys();
    keys.forEach((k) => localStorage.removeItem(k));
    refreshStorageKb();
    addToast({
      type: "success",
      message: "All data cleared. Refresh to apply.",
    });
  };

  const firstLetter = (username || "U")[0].toUpperCase();

  const btnBase = {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page header */}
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(156,163,175,0.08)",
            border: "1px solid rgba(156,163,175,0.12)",
            flexShrink: 0,
          }}
        >
          <SettingsIcon
            size={18}
            strokeWidth={2}
            style={{ color: "#9CA3AF" }}
          />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: "#E2E8F0",
            margin: 0,
          }}
        >
          Settings
        </h1>
        <ToolHelp title="Settings" description="Configure your SlimeShell preferences including network defaults, theme, and data management." steps={["Set your LHOST and LPORT for shell generators","Choose your preferred accent color","Adjust font size scaling","Use the data section to export or import your settings"]} tips={["LHOST and LPORT are used across all shell generators","You can reset all data from the danger zone","Sessions save and restore your complete workspace state"]} />
      </div>

      <div className="flex flex-col" style={{ gap: 18 }}>
        {/* ─── Profile ─── */}
        <Card>
          <h2 style={sectionTitle}>Profile</h2>
          <div
            className="flex items-center"
            style={{ gap: 14, marginBottom: 14 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6EE7B7, #34D399)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#080C14",
                }}
              >
                {firstLetter}
              </span>
            </div>
            <div className="flex flex-col" style={{ flex: 1, gap: 2 }}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <span
                style={{ fontFamily: mono, fontSize: 10, color: "#3B4252" }}
              >
                root@slimeshell
              </span>
            </div>
          </div>
        </Card>

        {/* ─── Network Defaults ─── */}
        <Card>
          <h2 style={sectionTitle}>Network Defaults</h2>
          <div className="flex flex-col" style={{ gap: 12 }}>
            <Input
              label="LHOST"
              value={lhost}
              onChange={(e) => setLhost(e.target.value)}
              placeholder="10.10.14.1"
            />
            <Input
              label="LPORT"
              value={lport}
              onChange={(e) => setLport(e.target.value)}
              placeholder="4444"
            />
            <div className="flex flex-col gap-1.5">
              <label
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Shell Preference
              </label>
              <select
                value={shellPreference}
                onChange={(e) => setShellPreference(e.target.value)}
                style={selectStyle}
              >
                {shells.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ─── Appearance ─── */}
        <Card>
          <h2 style={sectionTitle}>Appearance</h2>

          {/* Theme */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 8,
              }}
            >
              Theme
            </label>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#6EE7B7",
                  padding: "5px 14px",
                  background: "rgba(110,231,183,0.08)",
                  border: "1px solid rgba(110,231,183,0.2)",
                  borderRadius: 6,
                }}
              >
                Dark
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#3B4252",
                  padding: "5px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  cursor: "not-allowed",
                }}
              >
                Light <span style={comingSoon}>coming soon</span>
              </span>
            </div>
          </div>

          {/* Accent Color */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 8,
              }}
            >
              Accent Color
            </label>
            <div className="flex items-center" style={{ gap: 10 }}>
              {accentColors.map((c) => {
                const isActive = c.hex === (accentColor || "#6EE7B7");
                return (
                  <div
                    key={c.hex}
                    title={c.label}
                    onClick={() => setAccentColor(c.hex)}
                    className="flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c.hex,
                      cursor: "pointer",
                      opacity: isActive ? 1 : 0.5,
                      position: "relative",
                      border: isActive
                        ? "2px solid rgba(255,255,255,0.3)"
                        : "2px solid transparent",
                      transition: "all 150ms",
                    }}
                  >
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        style={{ color: "#080C14" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 8,
              }}
            >
              Font Size
            </label>
            <div className="flex items-center" style={{ gap: 0 }}>
              {["small", "default", "large"].map((size) => {
                const label = size[0].toUpperCase() + size.slice(1);
                const isActive = size === (fontSizePref || "default");
                return (
                  <span
                    key={size}
                    onClick={() => setFontSize(size)}
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      padding: "5px 14px",
                      color: isActive ? "var(--color-mint)" : "#9CA3AF",
                      background: isActive
                        ? "rgba(110,231,183,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: isActive
                        ? "1px solid rgba(110,231,183,0.2)"
                        : "1px solid rgba(255,255,255,0.04)",
                      borderRadius:
                        size === "small"
                          ? "6px 0 0 6px"
                          : size === "large"
                            ? "0 6px 6px 0"
                            : 0,
                      cursor: "pointer",
                      marginLeft: size !== "small" ? -1 : 0,
                      transition: "all 150ms",
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ─── Keyboard Shortcuts ─── */}
        <Card>
          <h2 style={sectionTitle}>
            <span
              className="flex items-center"
              style={{ gap: 8, display: "inline-flex" }}
            >
              <Keyboard size={14} style={{ color: "#9CA3AF" }} />
              Keyboard Shortcuts
            </span>
          </h2>
          <div className="flex flex-col" style={{ gap: 8 }}>
            {shortcuts.map((s) => (
              <div
                key={s.keys}
                className="flex items-center"
                style={{ gap: 12 }}
              >
                <span
                  style={{ ...kbdStyle, minWidth: 56, textAlign: "center" }}
                >
                  {s.keys}
                </span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  {s.desc}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Data Management ─── */}
        <Card>
          <h2 style={sectionTitle}>Data Management</h2>
          <p
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "#9CA3AF",
              margin: "0 0 14px",
              lineHeight: 1.45,
            }}
          >
            Export, import, or wipe persisted SlimeShell stores (
            <span style={{ color: "#6EE7B7" }}>{SLIMESHELL_PREFIX}</span>*
            keys).
          </p>
          <div className="flex flex-col" style={{ gap: 10 }}>
            <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
              <button
                type="button"
                onClick={handleExportAllData}
                style={{
                  ...btnBase,
                  color: "#6EE7B7",
                  background: "rgba(110,231,183,0.12)",
                  borderColor: "rgba(110,231,183,0.28)",
                }}
              >
                <Download size={16} strokeWidth={2} />
                Export All Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  ...btnBase,
                  color: "#FBBF24",
                  background: "rgba(251,191,36,0.12)",
                  borderColor: "rgba(251,191,36,0.28)",
                }}
              >
                <Upload size={16} strokeWidth={2} />
                Import Backup
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                style={{
                  ...btnBase,
                  color: "#FB7185",
                  background: "rgba(251,113,133,0.12)",
                  borderColor: "rgba(251,113,133,0.28)",
                }}
              >
                <Trash2 size={16} strokeWidth={2} />
                Reset All Data
              </button>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "#3B4252",
                paddingTop: 4,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Storage (slimeshell-*):{" "}
              <span style={{ color: "#9CA3AF" }}>{storageKb} KB</span>
            </div>
          </div>
        </Card>

        {/* ─── Sessions ─── */}
        <Card>
          <h2 style={sectionTitle}>Session Management</h2>
          <p
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "#9CA3AF",
              margin: "0 0 14px",
              lineHeight: 1.45,
            }}
          >
            Save snapshots of your current workspace state and restore them
            later.
          </p>
          <SessionManager addToast={addToast} />
        </Card>

        {/* ─── About ─── */}
        <Card>
          <h2 style={sectionTitle}>About</h2>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span
              style={{
                fontFamily: heading,
                fontSize: 14,
                fontWeight: 600,
                color: "#E2E8F0",
              }}
            >
              SlimeShell{" "}
              <span
                style={{ fontFamily: mono, fontSize: 11, color: "#9CA3AF" }}
              >
                v0.2.0-alpha
              </span>
            </span>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#9CA3AF" }}>
              Built with Tauri + React + Vite
            </span>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#6EE7B7" }}>
              by MrGreenSlime
            </span>
            <pre
              style={{
                fontFamily: mono,
                fontSize: 9,
                color: "#3B4252",
                margin: "8px 0 0",
                lineHeight: 1.3,
                userSelect: "none",
              }}
            >
              {`    ╭───╮
   ╱ ● ● ╲
  │  ───  │
  │ ~~~~~ │
   ╲     ╱
    ╰───╯
  ~ slime ~`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

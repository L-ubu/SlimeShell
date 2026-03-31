import { useMemo, useState } from "react";
import { Scan, ShieldCheck, Check, X, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const ACCENT = "#FBBF24";
const BG_INPUT = "#0B0F18";

const EXAMPLE_HEADERS = `HTTP/1.1 200 OK
Date: Wed, 25 Mar 2026 12:00:00 GMT
Content-Type: text/html; charset=utf-8
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin`;

/** @returns {Record<string, string>} lowercase header name -> value (last wins) */
function parseRawHeaders(raw) {
  const map = {};
  const lines = String(raw || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^HTTP\/\d/i.test(line)) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    map[key] = val;
  }
  return map;
}

function evalCSP(h) {
  const v = h["content-security-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Add a Content-Security-Policy with default-src and script-src tailored to your app to reduce XSS impact.",
    };
  }
  const s = v.toLowerCase();
  const overlyPermissive =
    s.includes("default-src *") ||
    (s.includes("default-src 'unsafe-inline'") &&
      s.includes("script-src 'unsafe-inline'"));
  if (overlyPermissive) {
    return {
      status: "misconfigured",
      recommendation:
        "Tighten CSP: avoid wildcard default-src and unsafe-inline where possible; use nonces or hashes for scripts.",
    };
  }
  return { status: "present" };
}

function evalHSTS(h) {
  const v = h["strict-transport-security"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Send Strict-Transport-Security with max-age>=31536000 and optionally includeSubDomains; preload after verification.",
    };
  }
  const m = /max-age\s*=\s*(\d+)/i.exec(v);
  if (!m) {
    return {
      status: "misconfigured",
      recommendation:
        "Include max-age (seconds). Prefer max-age=31536000 or higher for production.",
    };
  }
  const age = parseInt(m[1], 10);
  if (age === 0) {
    return {
      status: "misconfigured",
      recommendation:
        "max-age=0 disables HSTS. Use a positive max-age (e.g. 31536000) once HTTPS is stable.",
    };
  }
  if (age < 86400) {
    return {
      status: "misconfigured",
      recommendation:
        "Consider max-age of at least 31536000 (1 year) for meaningful HSTS protection.",
    };
  }
  return { status: "present" };
}

function evalXContentType(h) {
  const v = h["x-content-type-options"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        'Set X-Content-Type-Options: nosniff to reduce MIME sniffing attacks.',
    };
  }
  if (v.trim().toLowerCase() !== "nosniff") {
    return {
      status: "misconfigured",
      recommendation: 'Use exactly "nosniff" for X-Content-Type-Options.',
    };
  }
  return { status: "present" };
}

function evalXFrame(h) {
  const v = h["x-frame-options"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Set X-Frame-Options: DENY or SAMEORIGIN, or use CSP frame-ancestors, to mitigate clickjacking.",
    };
  }
  const u = v.trim().toUpperCase();
  if (u === "DENY" || u === "SAMEORIGIN" || u.startsWith("ALLOW-FROM")) {
    return { status: "present" };
  }
  return {
    status: "misconfigured",
    recommendation:
      "Use DENY or SAMEORIGIN (ALLOW-FROM is legacy). Prefer CSP frame-ancestors.",
  };
}

function evalXXSS(h) {
  const v = h["x-xss-protection"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Legacy browsers: X-XSS-Protection: 1; mode=block (modern mitigations rely on CSP).",
    };
  }
  const s = v.replace(/\s+/g, "").toLowerCase();
  if (s === "0" || s.startsWith("0;")) {
    return {
      status: "misconfigured",
      recommendation:
        "Use 1; mode=block or remove header and enforce strong CSP instead.",
    };
  }
  return { status: "present" };
}

function evalReferrer(h) {
  const v = h["referrer-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Set Referrer-Policy (e.g. strict-origin-when-cross-origin) to control referrer leakage.",
    };
  }
  const token = v.split(",")[0].trim().toLowerCase();
  if (token === "unsafe-url" || token === "") {
    return {
      status: "misconfigured",
      recommendation:
        "Avoid unsafe-url; prefer strict-origin-when-cross-origin, strict-origin, or no-referrer as appropriate.",
    };
  }
  return { status: "present" };
}

function evalPermissionsPolicy(h) {
  const v = h["permissions-policy"] || h["feature-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Add Permissions-Policy to disable sensitive features (camera, mic, geolocation) where not needed.",
    };
  }
  return { status: "present" };
}

function evalCacheControl(h) {
  const v = h["cache-control"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Set Cache-Control appropriate to content; for sensitive responses use no-store or private with validation.",
    };
  }
  const s = v.toLowerCase();
  const hasNoStore = s.includes("no-store");
  const hasPrivate = s.includes("private");
  const hasNoCache = s.includes("no-cache");
  const hasMaxAge0 = /max-age\s*=\s*0/.test(s);
  if (hasNoStore || hasPrivate || hasNoCache || hasMaxAge0) {
    return { status: "present" };
  }
  if (s.includes("public") && /max-age\s*=\s*(\d+)/.test(s)) {
    const m = /max-age\s*=\s*(\d+)/.exec(s);
    const age = m ? parseInt(m[1], 10) : 0;
    if (age > 86400) {
      return {
        status: "misconfigured",
        recommendation:
          "Long public caching can leak sensitive data via shared caches; prefer private or no-store for dynamic/private pages.",
      };
    }
  }
  return { status: "present" };
}

function evalPermittedCrossDomain(h) {
  const v = h["x-permitted-cross-domain-policies"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Set X-Permitted-Cross-Domain-Policies: none to restrict Flash/PDF cross-domain behavior.",
    };
  }
  const t = v.trim().toLowerCase();
  if (t === "all") {
    return {
      status: "misconfigured",
      recommendation: 'Prefer "none" or a restrictive policy instead of "all".',
    };
  }
  return { status: "present" };
}

function evalCOEP(h) {
  const v = h["cross-origin-embedder-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "For cross-origin isolation, consider Cross-Origin-Embedder-Policy: require-corp (with compatible assets).",
    };
  }
  const t = v.trim().toLowerCase();
  if (t === "unsafe-none" || t === "") {
    return {
      status: "misconfigured",
      recommendation:
        "Use require-corp or credentialless when pursuing isolation; unsafe-none opts out.",
    };
  }
  return { status: "present" };
}

function evalCOOP(h) {
  const v = h["cross-origin-opener-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Consider Cross-Origin-Opener-Policy: same-origin to isolate browsing context from cross-origin documents.",
    };
  }
  const t = v.trim().toLowerCase();
  if (t === "unsafe-none") {
    return {
      status: "misconfigured",
      recommendation:
        "unsafe-none disables opener isolation; prefer same-origin or same-origin-allow-popups if needed.",
    };
  }
  return { status: "present" };
}

function evalCORP(h) {
  const v = h["cross-origin-resource-policy"];
  if (v == null || v === "") {
    return {
      status: "missing",
      recommendation:
        "Set Cross-Origin-Resource-Policy: same-origin or same-site on sensitive resources to limit cross-origin loads.",
    };
  }
  return { status: "present" };
}

const SECURITY_CHECKS = [
  {
    headerName: "Content-Security-Policy",
    description:
      "Restricts sources for scripts, styles, frames, and other resources to reduce XSS and data injection risk.",
    evaluate: evalCSP,
  },
  {
    headerName: "Strict-Transport-Security",
    description:
      "Instructs browsers to use HTTPS only for the site for a period (HSTS).",
    evaluate: evalHSTS,
  },
  {
    headerName: "X-Content-Type-Options",
    description:
      "Prevents MIME type sniffing so browsers follow declared Content-Type.",
    evaluate: evalXContentType,
  },
  {
    headerName: "X-Frame-Options",
    description:
      "Legacy control for whether the page may be embedded in frames (clickjacking).",
    evaluate: evalXFrame,
  },
  {
    headerName: "X-XSS-Protection",
    description:
      "Legacy filter hint in older browsers; modern protection should rely on CSP.",
    evaluate: evalXXSS,
  },
  {
    headerName: "Referrer-Policy",
    description:
      "Controls how much referrer information is sent with navigations and subresources.",
    evaluate: evalReferrer,
  },
  {
    headerName: "Permissions-Policy",
    description:
      "Disables or allows browser features (camera, geolocation, etc.) per origin.",
    evaluate: evalPermissionsPolicy,
  },
  {
    headerName: "Cache-Control",
    description:
      "Directs caching behavior; important for avoiding accidental caching of private data.",
    evaluate: evalCacheControl,
  },
  {
    headerName: "X-Permitted-Cross-Domain-Policies",
    description:
      "Limits cross-domain policies for plugins and some legacy clients.",
    evaluate: evalPermittedCrossDomain,
  },
  {
    headerName: "Cross-Origin-Embedder-Policy",
    description:
      "Part of cross-origin isolation; controls embedding of cross-origin resources.",
    evaluate: evalCOEP,
  },
  {
    headerName: "Cross-Origin-Opener-Policy",
    description:
      "Isolates the window from cross-origin opener access (Spectre-related hardening).",
    evaluate: evalCOOP,
  },
  {
    headerName: "Cross-Origin-Resource-Policy",
    description:
      "Signals whether other origins may load this resource cross-origin.",
    evaluate: evalCORP,
  },
];

function letterFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

function gradeBadgeStyle(letter) {
  const base = {
    fontFamily: heading,
    fontSize: 28,
    fontWeight: 800,
    minWidth: 56,
    height: 56,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid",
  };
  switch (letter) {
    case "A":
      return {
        ...base,
        color: "#34D399",
        borderColor: "#34D399",
        background: "rgba(52,211,153,0.12)",
      };
    case "B":
      return {
        ...base,
        color: "#6EE7B7",
        borderColor: "#6EE7B7",
        background: "rgba(110,231,183,0.1)",
      };
    case "C":
      return {
        ...base,
        color: "#FBBF24",
        borderColor: "#FBBF24",
        background: "rgba(251,191,36,0.12)",
      };
    case "D":
      return {
        ...base,
        color: "#FB923C",
        borderColor: "#FB923C",
        background: "rgba(251,146,60,0.12)",
      };
    default:
      return {
        ...base,
        color: "#F87171",
        borderColor: "#F87171",
        background: "rgba(248,113,113,0.12)",
      };
  }
}

function StatusIcon({ status }) {
  if (status === "present") {
    return (
      <Check
        size={18}
        strokeWidth={2.5}
        style={{ color: "#34D399", flexShrink: 0 }}
        aria-hidden
      />
    );
  }
  if (status === "misconfigured") {
    return (
      <AlertTriangle
        size={18}
        strokeWidth={2.5}
        style={{ color: "#FBBF24", flexShrink: 0 }}
        aria-hidden
      />
    );
  }
  return (
    <X
      size={18}
      strokeWidth={2.5}
      style={{ color: "#F87171", flexShrink: 0 }}
      aria-hidden
    />
  );
}

function statusLabel(status) {
  if (status === "present") return "Present";
  if (status === "misconfigured") return "Misconfigured";
  return "Missing";
}

export default function HeaderAnalyzer() {
  const [raw, setRaw] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [parsedSnapshot, setParsedSnapshot] = useState(null);
  const [checkResults, setCheckResults] = useState([]);

  const reportText = useMemo(() => {
    if (!analyzed || !parsedSnapshot) return "";
    const lines = [
      `Header Analyzer — Score: ${parsedSnapshot.score}% (${parsedSnapshot.letter})`,
      "",
      "--- Parsed headers ---",
    ];
    for (const [k, v] of Object.entries(parsedSnapshot.headers)) {
      lines.push(`${k}: ${v}`);
    }
    lines.push("", "--- Security checks ---");
    for (const c of checkResults) {
      lines.push(`[${statusLabel(c.status)}] ${c.headerName}`);
      if (c.recommendation) lines.push(`  → ${c.recommendation}`);
    }
    return lines.join("\n");
  }, [analyzed, parsedSnapshot, checkResults]);

  function runAnalyze() {
    const headers = parseRawHeaders(raw);
    const results = SECURITY_CHECKS.map((def) => {
      const r = def.evaluate(headers);
      return {
        headerName: def.headerName,
        description: def.description,
        status: r.status,
        recommendation: r.recommendation,
      };
    });
    const points = results.filter((r) => r.status === "present").length;
    const total = SECURITY_CHECKS.length;
    const score = Math.round((points / total) * 100);
    const letter = letterFromScore(score);
    setParsedSnapshot({ headers, score, letter, points, total });
    setCheckResults(results);
    setAnalyzed(true);
  }

  const headerEntries = parsedSnapshot
    ? Object.entries(parsedSnapshot.headers)
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(251,191,36,0.15)",
            border: `1px solid ${ACCENT}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden
        >
          <ShieldCheck size={20} color={ACCENT} strokeWidth={2} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h1
            style={{
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              color: "#F9FAFB",
              margin: 0,
              lineHeight: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Scan size={22} style={{ color: ACCENT, opacity: 0.9 }} />
            Header Analyzer
            <ToolHelp title="Header Analyzer" description="Analyze HTTP response headers for security issues. Checks for CSP, HSTS, X-Frame-Options, and more." steps={["Paste raw HTTP response headers in the input","Click analyze to run the security checks","Review findings organized by severity","Check recommendations for missing headers"]} tips={["Green headers are properly configured","Missing security headers are flagged as warnings","Common headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options"]} />
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: mono,
              fontSize: 11,
              color: "#9CA3AF",
            }}
          >
            Paste raw HTTP response headers for a quick security audit
          </p>
        </div>
      </div>

      <Card
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: "rgba(11,15,24,0.5)",
        }}
      >
        <label
          htmlFor="header-raw"
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#9CA3AF",
          }}
        >
          Raw response headers
        </label>
        <textarea
          id="header-raw"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={EXAMPLE_HEADERS}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 200,
            boxSizing: "border-box",
            fontFamily: mono,
            fontSize: 12,
            lineHeight: 1.5,
            color: "#E5E7EB",
            background: BG_INPUT,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "14px 16px",
            resize: "vertical",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(251,191,36,0.35)";
            e.target.style.boxShadow = "0 0 0 1px rgba(251,191,36,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={runAnalyze}
            style={{
              fontFamily: heading,
              fontSize: 14,
              fontWeight: 700,
              color: "#0B0F18",
              padding: "12px 28px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
              boxShadow: "0 4px 14px rgba(251,191,36,0.25)",
            }}
          >
            Analyze
          </button>
          {analyzed && reportText ? <CopyButton text={reportText} /> : null}
        </div>
      </Card>

      {analyzed && parsedSnapshot ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card
            style={{
              padding: "20px 22px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                Overall security score
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={gradeBadgeStyle(parsedSnapshot.letter)}>
                  {parsedSnapshot.letter}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: heading,
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#F9FAFB",
                    }}
                  >
                    {parsedSnapshot.score}%
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      color: "#9CA3AF",
                    }}
                  >
                    {parsedSnapshot.points} / {parsedSnapshot.total} headers passed
                  </div>
                </div>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                maxWidth: 320,
                fontFamily: mono,
                fontSize: 11,
                color: "#6B7280",
                lineHeight: 1.5,
              }}
            >
              A≥90 · B≥70 · C≥50 · D≥30 · F under 30. Only present and correctly
              configured headers count toward the score.
            </p>
          </Card>

          <div>
            <h2
              style={{
                fontFamily: heading,
                fontSize: 16,
                fontWeight: 600,
                color: "#E5E7EB",
                margin: "0 0 12px 0",
              }}
            >
              Parsed headers
            </h2>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {headerEntries.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    fontFamily: mono,
                    fontSize: 12,
                    color: "#6B7280",
                  }}
                >
                  No header lines found. Paste lines like{" "}
                  <span style={{ color: ACCENT }}>Name: value</span>.
                </div>
              ) : (
                <div style={{ maxHeight: 320, overflow: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: mono,
                      fontSize: 12,
                    }}
                  >
                    <tbody>
                      {headerEntries.map(([name, value]) => (
                        <tr
                          key={name}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 16px",
                              verticalAlign: "top",
                              color: "#6EE7B7",
                              fontWeight: 600,
                              width: "38%",
                              wordBreak: "break-word",
                            }}
                          >
                            {name}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              verticalAlign: "top",
                              color: "#D1D5DB",
                              wordBreak: "break-word",
                            }}
                          >
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2
              style={{
                fontFamily: heading,
                fontSize: 16,
                fontWeight: 600,
                color: "#E5E7EB",
                margin: "0 0 12px 0",
              }}
            >
              Security checks
            </h2>
            <div
              className="header-analyzer-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
              }}
            >
              {checkResults.map((c) => (
                <Card
                  key={c.headerName}
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#F9FAFB",
                        lineHeight: 1.3,
                      }}
                    >
                      {c.headerName}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <StatusIcon status={c.status} />
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          fontWeight: 600,
                          color:
                            c.status === "present"
                              ? "#34D399"
                              : c.status === "misconfigured"
                                ? "#FBBF24"
                                : "#F87171",
                        }}
                      >
                        {statusLabel(c.status)}
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: mono,
                      fontSize: 11,
                      color: "#9CA3AF",
                      lineHeight: 1.55,
                    }}
                  >
                    {c.description}
                  </p>
                  {c.recommendation ? (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: mono,
                        fontSize: 10,
                        color: "#D1D5DB",
                        lineHeight: 1.5,
                        paddingTop: 6,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span style={{ color: ACCENT }}>Tip: </span>
                      {c.recommendation}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @media (max-width: 720px) {
          .header-analyzer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileCode2,
  Hammer,
  Unlock,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

function encodeBase64Url(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signHMAC(headerB64, payloadB64, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${headerB64}.${payloadB64}`),
  );
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(str) {
  let padded = str.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4) padded += "=";
  return atob(padded);
}

function decodeJWT(token) {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signatureBytes = decodeBase64Url(parts[2]);
    const signature = Array.from(signatureBytes, (c) =>
      c.charCodeAt(0).toString(16).padStart(2, "0"),
    ).join("");
    return { header, payload, signature };
  } catch {
    return null;
  }
}

function syntaxHighlight(json) {
  const str = JSON.stringify(json, null, 2);
  const parts = [];
  const regex = /("(?:\\.|[^"\\])*")\s*:/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex)
      parts.push({ text: str.slice(lastIndex, match.index), type: "plain" });
    parts.push({ text: match[1], type: "key" });
    parts.push({ text: ": ", type: "plain" });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < str.length)
    parts.push({ text: str.slice(lastIndex), type: "plain" });

  return parts.map((part, i) => {
    if (part.type === "key")
      return (
        <span key={i} style={{ color: "#7DD3FC" }}>
          {part.text}
        </span>
      );
    const colored = part.text.replace(
      /("(?:\\.|[^"\\])*")|(\b\d+\.?\d*\b)|(true|false|null)/g,
      (m, str, num, bool) => {
        if (str) return `\x01str${str}\x02`;
        if (num) return `\x01num${num}\x02`;
        if (bool) return `\x01bool${bool}\x02`;
        return m;
      },
    );
    return colored.split(/(\x01\w+[^\x02]*\x02)/g).map((seg, j) => {
      if (seg.startsWith("\x01str"))
        return (
          <span key={`${i}-${j}`} style={{ color: "#6EE7B7" }}>
            {seg.slice(4, -1)}
          </span>
        );
      if (seg.startsWith("\x01num"))
        return (
          <span key={`${i}-${j}`} style={{ color: "#FBBF24" }}>
            {seg.slice(4, -1)}
          </span>
        );
      if (seg.startsWith("\x01bool"))
        return (
          <span key={`${i}-${j}`} style={{ color: "#FB7185" }}>
            {seg.slice(5, -1)}
          </span>
        );
      return <span key={`${i}-${j}`}>{seg}</span>;
    });
  });
}

function formatTimestamp(ts) {
  if (!ts) return null;
  try {
    return new Date(ts * 1000).toLocaleString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return null;
  }
}

const SAMPLE_JWT = "";

const codeBlock = {
  fontFamily: mono,
  fontSize: 11,
  lineHeight: "20px",
  background: "#0B0F18",
  borderRadius: 8,
  padding: "14px 16px",
  color: "#D1D5DB",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  border: "1px solid rgba(255,255,255,0.04)",
  margin: 0,
  boxSizing: "border-box",
};

function JWTBuilder() {
  const [alg, setAlg] = useState("none");
  const [headerJson, setHeaderJson] = useState(
    '{\n  "alg": "none",\n  "typ": "JWT"\n}',
  );
  const [payloadJson, setPayloadJson] = useState(
    '{\n  "sub": "1234567890",\n  "name": "hacker",\n  "admin": true,\n  "iat": ' +
      Math.floor(Date.now() / 1000) +
      "\n}",
  );
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleAlgChange = useCallback(
    (newAlg) => {
      setAlg(newAlg);
      try {
        const h = JSON.parse(headerJson);
        h.alg = newAlg === "none" ? "none" : "HS256";
        setHeaderJson(JSON.stringify(h, null, 2));
      } catch {
        /* header is invalid JSON, user will fix */
      }
    },
    [headerJson],
  );

  const addClaim = useCallback(
    (key, value) => {
      try {
        const p = JSON.parse(payloadJson);
        p[key] = value;
        setPayloadJson(JSON.stringify(p, null, 2));
      } catch {
        /* payload is invalid JSON */
      }
    },
    [payloadJson],
  );

  const build = useCallback(async () => {
    setError("");
    setOutput("");
    try {
      JSON.parse(headerJson);
    } catch {
      setError("Invalid JSON in header");
      return;
    }
    try {
      JSON.parse(payloadJson);
    } catch {
      setError("Invalid JSON in payload");
      return;
    }

    const hB64 = encodeBase64Url(headerJson);
    const pB64 = encodeBase64Url(payloadJson);

    if (alg === "none") {
      setOutput(`${hB64}.${pB64}.`);
    } else {
      if (!secret) {
        setError("HMAC-SHA256 requires a secret key");
        return;
      }
      const sig = await signHMAC(hB64, pB64, secret);
      setOutput(`${hB64}.${pB64}.${sig}`);
    }
  }, [alg, headerJson, payloadJson, secret]);

  const labelStyle = {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: 6,
  };

  const editorStyle = {
    ...codeBlock,
    minHeight: 120,
    resize: "vertical",
    outline: "none",
    cursor: "text",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {/* Left: Editors */}
      <div
        style={{
          flex: "1 1 360px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Algorithm */}
        <Card>
          <label style={labelStyle}>Algorithm</label>
          <div style={{ display: "flex", gap: 0 }}>
            {["none", "HS256"].map((a) => {
              const active = a === alg;
              return (
                <button
                  key={a}
                  onClick={() => handleAlgChange(a)}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 18px",
                    cursor: "pointer",
                    border: `1px solid ${active ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.06)"}`,
                    background: active
                      ? "rgba(110,231,183,0.08)"
                      : "transparent",
                    color: active ? "#6EE7B7" : "#9CA3AF",
                    borderRadius: a === "none" ? "6px 0 0 6px" : "0 6px 6px 0",
                    marginLeft: a !== "none" ? -1 : 0,
                    transition: "all 0.15s",
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Header editor */}
        <Card style={{ borderLeft: "3px solid #A78BFA" }}>
          <label style={labelStyle}>Header</label>
          <textarea
            value={headerJson}
            onChange={(e) => setHeaderJson(e.target.value)}
            spellCheck={false}
            style={editorStyle}
          />
        </Card>

        {/* Payload editor */}
        <Card style={{ borderLeft: "3px solid #6EE7B7" }}>
          <label style={labelStyle}>Payload</label>
          <textarea
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            spellCheck={false}
            style={{ ...editorStyle, minHeight: 160 }}
          />
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
          >
            {[
              {
                label: "+iat",
                fn: () => addClaim("iat", Math.floor(Date.now() / 1000)),
              },
              {
                label: "+exp (1h)",
                fn: () => addClaim("exp", Math.floor(Date.now() / 1000) + 3600),
              },
              { label: "+admin", fn: () => addClaim("admin", true) },
              { label: "+sub", fn: () => addClaim("sub", "1337") },
            ].map((b) => (
              <button
                key={b.label}
                onClick={b.fn}
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 5,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#9CA3AF",
                  transition: "all 0.15s",
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Secret (only for HS256) */}
        {alg === "HS256" && (
          <Card style={{ borderLeft: "3px solid #FBBF24" }}>
            <label style={labelStyle}>HMAC Secret</label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret key..."
              spellCheck={false}
              style={{
                ...codeBlock,
                outline: "none",
                cursor: "text",
                width: "100%",
                minHeight: "auto",
              }}
            />
          </Card>
        )}
      </div>

      {/* Right: Output */}
      <div
        style={{
          flex: "1 1 360px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <button
          onClick={build}
          style={{
            fontFamily: mono,
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            border: "1px solid rgba(110,231,183,0.3)",
            background: "rgba(110,231,183,0.12)",
            color: "#6EE7B7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.15s",
            width: "100%",
          }}
        >
          <Hammer size={14} /> Build Token
        </button>

        {error && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "#FB7185",
              background: "rgba(251,113,133,0.06)",
              borderRadius: 8,
              padding: "10px 14px",
              border: "1px solid rgba(251,113,133,0.12)",
            }}
          >
            {error}
          </div>
        )}

        {output && (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
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
                Generated JWT
              </span>
              <CopyButton text={output} />
            </div>
            <pre
              style={{
                ...codeBlock,
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
              }}
            >
              {output}
            </pre>
          </Card>
        )}

        {alg === "none" && (
          <Card style={{ borderLeft: "3px solid #FBBF24" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Unlock size={14} style={{ color: "#FBBF24" }} />
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FBBF24",
                }}
              >
                alg: none Attack
              </span>
            </div>
            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "#9CA3AF",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Some servers accept tokens with{" "}
              <code style={{ color: "#FB7185" }}>{'"alg": "none"'}</code> and
              skip signature verification. Forge admin tokens by setting claims
              and leaving the signature empty. Common in CTFs and misconfigured
              APIs.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function JWT() {
  const [mode, setMode] = useState("decode");
  const [token, setToken] = useState(SAMPLE_JWT);
  const decoded = useMemo(() => decodeJWT(token), [token]);
  const isExpired = useMemo(() => {
    if (!decoded?.payload?.exp) return null;
    return Date.now() / 1000 > decoded.payload.exp;
  }, [decoded]);

  const tabStyle = (active) => ({
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 600,
    padding: "7px 18px",
    cursor: "pointer",
    border: `1px solid ${active ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.06)"}`,
    background: active ? "rgba(110,231,183,0.08)" : "transparent",
    color: active ? "#6EE7B7" : "#9CA3AF",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 0 }}>
        <button
          onClick={() => setMode("decode")}
          style={{
            ...tabStyle(mode === "decode"),
            borderRadius: "8px 0 0 8px",
          }}
        >
          <FileCode2 size={13} /> Decode
        </button>
        <button
          onClick={() => setMode("build")}
          style={{
            ...tabStyle(mode === "build"),
            borderRadius: "0 8px 8px 0",
            marginLeft: -1,
          }}
        >
          <Hammer size={13} /> Build
        </button>
      </div>

      {mode === "build" ? (
        <JWTBuilder />
      ) : (
        <>
          {isExpired !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 6,
                  background: isExpired
                    ? "rgba(251,113,133,0.1)"
                    : "rgba(110,231,183,0.1)",
                  border: `1px solid ${isExpired ? "rgba(251,113,133,0.2)" : "rgba(110,231,183,0.2)"}`,
                  color: isExpired ? "#FB7185" : "#6EE7B7",
                }}
              >
                {isExpired ? "EXPIRED" : "VALID"}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Card
              style={{
                flex: "1 1 360px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <FileCode2 size={14} style={{ color: "#6B7280" }} />
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#D1D5DB",
                      }}
                    >
                      Encoded Token
                    </span>
                  </div>
                  <CopyButton text={token} />
                </div>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste a JWT token here..."
                  spellCheck={false}
                  style={{
                    ...codeBlock,
                    minHeight: 280,
                    resize: "vertical",
                    outline: "none",
                    cursor: "text",
                    width: "100%",
                  }}
                />
                {token.trim() && !decoded && (
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: "#FB7185",
                      background: "rgba(251,113,133,0.06)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      border: "1px solid rgba(251,113,133,0.12)",
                    }}
                  >
                    Invalid JWT — must have 3 base64url-encoded parts separated
                    by dots
                  </div>
                )}
              </div>
            </Card>

            <div
              style={{
                flex: "1 1 360px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <Card style={{ borderLeft: "3px solid #A78BFA" }}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
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
                        fontWeight: 700,
                        color: "#A78BFA",
                      }}
                    >
                      Header
                    </span>
                    {decoded && (
                      <CopyButton
                        text={JSON.stringify(decoded.header, null, 2)}
                      />
                    )}
                  </div>
                  <pre style={codeBlock}>
                    {decoded ? (
                      syntaxHighlight(decoded.header)
                    ) : (
                      <span style={{ color: "#3B4252", fontStyle: "italic" }}>
                        Paste a valid JWT to decode
                      </span>
                    )}
                  </pre>
                </div>
              </Card>

              <Card style={{ borderLeft: "3px solid #6EE7B7" }}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
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
                        fontWeight: 700,
                        color: "#6EE7B7",
                      }}
                    >
                      Payload
                    </span>
                    {decoded && (
                      <CopyButton
                        text={JSON.stringify(decoded.payload, null, 2)}
                      />
                    )}
                  </div>
                  <pre style={codeBlock}>
                    {decoded ? (
                      syntaxHighlight(decoded.payload)
                    ) : (
                      <span style={{ color: "#3B4252", fontStyle: "italic" }}>
                        Paste a valid JWT to decode
                      </span>
                    )}
                  </pre>
                  {(decoded?.payload?.iat || decoded?.payload?.exp) && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        marginTop: 2,
                      }}
                    >
                      {decoded.payload.iat && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#0B0F18",
                            borderRadius: 6,
                            padding: "7px 12px",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <Clock size={12} style={{ color: "#7DD3FC" }} />
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              color: "#7DD3FC",
                            }}
                          >
                            Issued: {formatTimestamp(decoded.payload.iat)}
                          </span>
                        </div>
                      )}
                      {decoded.payload.exp && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#0B0F18",
                            borderRadius: 6,
                            padding: "7px 12px",
                            border: `1px solid ${isExpired ? "rgba(251,113,133,0.12)" : "rgba(110,231,183,0.12)"}`,
                          }}
                        >
                          {isExpired ? (
                            <ShieldAlert
                              size={12}
                              style={{ color: "#FB7185" }}
                            />
                          ) : (
                            <ShieldCheck
                              size={12}
                              style={{ color: "#6EE7B7" }}
                            />
                          )}
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              color: isExpired ? "#FB7185" : "#6EE7B7",
                            }}
                          >
                            Expires: {formatTimestamp(decoded.payload.exp)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <Card style={{ borderLeft: "3px solid #FB7185" }}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
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
                        fontWeight: 700,
                        color: "#FB7185",
                      }}
                    >
                      Signature
                    </span>
                    {decoded && <CopyButton text={decoded.signature} />}
                  </div>
                  <pre style={{ ...codeBlock, color: "#FB7185", opacity: 0.8 }}>
                    {decoded ? (
                      decoded.signature
                    ) : (
                      <span style={{ color: "#3B4252", fontStyle: "italic" }}>
                        Paste a valid JWT to decode
                      </span>
                    )}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

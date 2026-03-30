import { useState, useCallback } from "react";
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const IP_API_FIELDS =
  "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query";

const IP_V4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

function isValidIp(ip) {
  const s = String(ip).trim();
  if (!s) return false;
  if (IP_V4.test(s)) return true;
  if (
    /^[0-9a-fA-F:.]+$/i.test(s) &&
    s.includes(":") &&
    s.length <= 45
  ) {
    const colons = (s.match(/:/g) || []).length;
    if (colons >= 2 && colons <= 8) return true;
  }
  return false;
}

function countryCodeToFlag(code) {
  if (!code || typeof code !== "string" || code.length !== 2) return "";
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const cp = [...upper].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...cp);
}

function formatRegionCity(data) {
  const parts = [data.regionName, data.city].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function formatIspOrg(data) {
  const parts = [data.isp, data.org].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

const pageKeyframes = `
@keyframes ipLookupSkeletonPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
}
@keyframes ipLookupSpin {
  to { transform: rotate(360deg); }
}
`;

function SkeletonCard() {
  return (
    <Card
      style={{
        padding: "12px 14px",
        minHeight: 56,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "rgba(15, 23, 42, 0.6)",
        borderColor: "rgba(244, 114, 182, 0.12)",
      }}
    >
      <div
        style={{
          height: 10,
          width: "42%",
          borderRadius: 4,
          background: "#374151",
          animation: "ipLookupSkeletonPulse 1.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          height: 14,
          width: "78%",
          borderRadius: 4,
          background: "#4B5563",
          animation: "ipLookupSkeletonPulse 1.4s ease-in-out infinite 0.15s",
        }}
      />
    </Card>
  );
}

function InfoCell({ label, value, extra }) {
  return (
    <Card
      style={{
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        background: "rgba(11, 15, 24, 0.85)",
        borderColor: "rgba(244, 114, 182, 0.15)",
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#6B7280",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 13,
            color: "#E2E8F0",
            wordBreak: "break-word",
            lineHeight: 1.45,
          }}
        >
          {extra}
          {value}
        </span>
      </div>
    </Card>
  );
}

export default function IpLookup() {
  const [ipInput, setIpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [whoisOpen, setWhoisOpen] = useState(false);
  const [myIpLoading, setMyIpLoading] = useState(false);

  const pushHistory = useCallback((ip) => {
    const q = String(ip).trim();
    if (!q) return;
    setHistory((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)];
      return next.slice(0, 5);
    });
  }, []);

  const lookup = useCallback(
    async (ip) => {
      const target = String(ip).trim();
      setError(null);
      setResult(null);
      setWhoisOpen(false);

      if (!isValidIp(target)) {
        setResult(null);
        setError("Enter a valid IPv4 or IPv6 address.");
        return;
      }

      setLoading(true);
      try {
        const url = `http://ip-api.com/json/${encodeURIComponent(target)}?fields=${IP_API_FIELDS}`;
        const res = await fetch(url);
        if (!res.ok) {
          setError(`Request failed (${res.status}).`);
          return;
        }
        const data = await res.json();
        if (data.status !== "success") {
          setError(data.message || "Lookup failed.");
          return;
        }
        setResult(data);
        pushHistory(data.query || target);
      } catch (e) {
        setError(
          e?.message?.includes("Failed to fetch") || e?.name === "TypeError"
            ? "Network error. If you are on HTTPS, mixed-content may block HTTP ip-api.com."
            : e?.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [pushHistory]
  );

  const handleLookupClick = () => lookup(ipInput);

  const handleMyIp = async () => {
    setError(null);
    setMyIpLoading(true);
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) {
        setError("Could not resolve your public IP.");
        return;
      }
      const data = await res.json();
      const ip = data?.ip;
      if (!ip) {
        setError("Invalid response from ipify.");
        return;
      }
      setIpInput(ip);
      await lookup(ip);
    } catch (e) {
      setError(e?.message || "Failed to fetch your IP.");
    } finally {
      setMyIpLoading(false);
    }
  };

  const handleHistoryChip = (ip) => {
    setIpInput(ip);
    lookup(ip);
  };

  const rawJson = result
    ? JSON.stringify(result, null, 2)
    : "";

  const btnBase = {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: 600,
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.15s, transform 0.1s",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 900,
        margin: "0 auto",
        padding: "8px 4px 32px",
      }}
    >
      <style>{pageKeyframes}</style>

      {/* Header */}
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
            background: "rgba(244, 114, 182, 0.15)",
            border: "1px solid rgba(244, 114, 182, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MapPin size={20} color="#F472B6" strokeWidth={2.25} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: "#F9FAFB",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          IP Lookup
        </h1>
      </header>

      {/* Input row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <Input
            label="IP address"
            placeholder="e.g. 8.8.8.8"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLookupClick();
            }}
            disabled={loading || myIpLoading}
            autoComplete="off"
            spellCheck={false}
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="button"
          onClick={handleLookupClick}
          disabled={loading || myIpLoading}
          style={{
            ...btnBase,
            background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
            color: "#0B0F18",
            boxShadow: "0 4px 14px rgba(244, 114, 182, 0.35)",
            opacity: loading || myIpLoading ? 0.65 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={16} style={{ animation: "ipLookupSpin 0.8s linear infinite" }} />
          ) : null}
          Lookup
        </button>
        <button
          type="button"
          onClick={handleMyIp}
          disabled={loading || myIpLoading}
          style={{
            ...btnBase,
            background: "rgba(30, 41, 59, 0.9)",
            color: "#E2E8F0",
            border: "1px solid rgba(244, 114, 182, 0.25)",
            opacity: loading || myIpLoading ? 0.65 : 1,
          }}
        >
          {myIpLoading ? (
            <Loader2 size={16} style={{ animation: "ipLookupSpin 0.8s linear infinite" }} />
          ) : null}
          My IP
        </button>
      </div>

      {/* History chips */}
      {history.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#6B7280",
              marginRight: 4,
            }}
          >
            Recent
          </span>
          {history.map((ip) => (
            <button
              key={ip}
              type="button"
              onClick={() => handleHistoryChip(ip)}
              disabled={loading || myIpLoading}
              style={{
                fontFamily: mono,
                fontSize: 11,
                padding: "5px 11px",
                borderRadius: 999,
                border: "1px solid rgba(244, 114, 182, 0.35)",
                background:
                  ipInput.trim() === ip
                    ? "rgba(244, 114, 182, 0.2)"
                    : "rgba(15, 23, 42, 0.6)",
                color: "#F472B6",
                cursor: loading || myIpLoading ? "not-allowed" : "pointer",
                opacity: loading || myIpLoading ? 0.5 : 1,
              }}
            >
              {ip}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "rgba(127, 29, 29, 0.2)",
            borderColor: "rgba(248, 113, 113, 0.35)",
          }}
        >
          <AlertCircle size={18} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: mono, fontSize: 12, color: "#FCA5A5", lineHeight: 1.5 }}>
            {error}
          </span>
        </Card>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <InfoCell
              label="Country"
              extra={
                <span style={{ marginRight: 6 }}>{countryCodeToFlag(result.countryCode)}</span>
              }
              value={result.country || "—"}
            />
            <InfoCell label="Region / City" value={formatRegionCity(result)} />
            <InfoCell label="ISP / Org" value={formatIspOrg(result)} />
            <InfoCell label="AS Number" value={result.as || "—"} />
            <InfoCell label="Timezone" value={result.timezone || "—"} />
            <InfoCell
              label="Coordinates"
              value={
                result.lat != null && result.lon != null
                  ? `${result.lat}, ${result.lon}`
                  : "—"
              }
            />
          </div>

          <Card
            style={{
              padding: 0,
              overflow: "hidden",
              background: "#0B0F18",
              borderColor: "rgba(244, 114, 182, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setWhoisOpen((o) => !o)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#F472B6",
              }}
            >
              <span>Raw response (whois-style)</span>
              {whoisOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {whoisOpen && (
              <div
                style={{
                  borderTop: "1px solid rgba(244, 114, 182, 0.12)",
                  padding: "12px 14px 14px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                  }}
                >
                  <CopyButton text={rawJson} />
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "8px 36px 0 0",
                    fontFamily: mono,
                    fontSize: 11,
                    lineHeight: 1.55,
                    color: "#94A3B8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    maxHeight: 320,
                    overflow: "auto",
                  }}
                >
                  {Object.entries(result).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#F472B6", flexShrink: 0 }}>{k}</span>
                      <span style={{ color: "#E2E8F0" }}>{String(v)}</span>
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

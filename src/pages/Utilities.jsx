import { useState, useEffect, useMemo } from "react";
import { hashAll } from "../lib/hashing.js";
import { commonPorts, calcSubnet } from "../lib/network.js";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Input } from "../components/ui/Input.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const HASH_ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const CTF_FORMATS = [
  { prefix: "flag", wrap: (v) => `flag{${v}}` },
  { prefix: "HTB", wrap: (v) => `HTB{${v}}` },
  { prefix: "picoCTF", wrap: (v) => `picoCTF{${v}}` },
  { prefix: "CTF", wrap: (v) => `CTF{${v}}` },
  { prefix: "DUCTF", wrap: (v) => `DUCTF{${v}}` },
];

const UNWRAP_RE = /^(\w+)\{(.+)\}$/;

const SUBNET_FIELDS = [
  ["network", "Network"],
  ["broadcast", "Broadcast"],
  ["firstHost", "First Host"],
  ["lastHost", "Last Host"],
  ["totalHosts", "Total Hosts"],
  ["netmask", "Netmask"],
  ["wildcardMask", "Wildcard"],
  ["ipClass", "IP Class"],
  ["isPrivate", "Private"],
];

const tabs = [
  { value: "hash", label: "Hash Generator" },
  { value: "subnet", label: "Subnet Calculator" },
  { value: "ports", label: "Port Reference" },
  { value: "flags", label: "Flag Formatter" },
  { value: "epoch", label: "Epoch Converter" },
];

const MS_HOUR = 3600000;
const MS_DAY = 86400000;
const MS_WEEK = 604800000;

function formatRelativeTime(targetMs) {
  const diffMs = targetMs - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const divisions = [
    { name: "year", ms: 31536000000 },
    { name: "month", ms: 2628000000 },
    { name: "week", ms: MS_WEEK },
    { name: "day", ms: MS_DAY },
    { name: "hour", ms: MS_HOUR },
    { name: "minute", ms: 60000 },
    { name: "second", ms: 1000 },
  ];
  for (const { name, ms: div } of divisions) {
    if (Math.abs(diffMs) >= div || name === "second") {
      const val = Math.round(diffMs / div);
      return rtf.format(val, name);
    }
  }
  return rtf.format(0, "second");
}

function parseUnixInput(raw) {
  const trimmed = raw.trim().replace(/\s/g, "");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (Number.isNaN(n)) return null;
  if (n > 1e12) return Math.floor(n);
  return Math.floor(n * 1000);
}

function EpochConverter() {
  const [ms, setMs] = useState(() => Date.now());
  const [tsFocused, setTsFocused] = useState(false);
  const [isoFocused, setIsoFocused] = useState(false);
  const [tsInput, setTsInput] = useState(() =>
    String(Math.floor(Date.now() / 1000)),
  );
  const [isoInput, setIsoInput] = useState(() =>
    new Date().toISOString(),
  );

  useEffect(() => {
    if (!tsFocused) setTsInput(String(Math.floor(ms / 1000)));
  }, [ms, tsFocused]);

  useEffect(() => {
    if (!isoFocused) setIsoInput(new Date(ms).toISOString());
  }, [ms, isoFocused]);

  const d = new Date(ms);
  const unixSec = String(Math.floor(ms / 1000));
  const unixMs = String(ms);
  const iso8601 = d.toISOString();
  const utcStr = d.toUTCString();
  const localStr = d.toString();
  const relative = formatRelativeTime(ms);

  const outputRows = [
    { label: "Unix seconds", value: unixSec },
    { label: "Unix milliseconds", value: unixMs },
    { label: "ISO 8601", value: iso8601 },
    { label: "UTC string", value: utcStr },
    { label: "Local string", value: localStr },
    { label: "Relative time", value: relative },
  ];

  const quick = (delta) => setMs((m) => m + delta);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setMs(Date.now())}
          style={{
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid rgba(110,231,183,0.2)",
            background: "rgba(110,231,183,0.08)",
            color: "#6EE7B7",
            cursor: "pointer",
          }}
        >
          Now
        </button>
        {[
          ["+1h", MS_HOUR],
          ["+1d", MS_DAY],
          ["+1w", MS_WEEK],
          ["-1h", -MS_HOUR],
          ["-1d", -MS_DAY],
          ["-1w", -MS_WEEK],
        ].map(([label, delta]) => (
          <button
            key={label}
            type="button"
            onClick={() => quick(delta)}
            style={{
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 600,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0B0F18",
              color: "#9CA3AF",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <div
          onFocus={() => setTsFocused(true)}
          onBlur={() => setTsFocused(false)}
        >
          <Input
            label="Unix timestamp"
            placeholder="Seconds or milliseconds…"
            inputMode="decimal"
            value={tsInput}
            onChange={(e) => {
              const v = e.target.value;
              setTsInput(v);
              const parsed = parseUnixInput(v);
              if (parsed !== null) setMs(parsed);
            }}
          />
        </div>
        <div
          onFocus={() => setIsoFocused(true)}
          onBlur={() => setIsoFocused(false)}
        >
          <Input
            label="ISO date string"
            placeholder="2026-03-25T12:00:00.000Z"
            value={isoInput}
            onChange={(e) => {
              const v = e.target.value;
              setIsoInput(v);
              const t = Date.parse(v);
              if (!Number.isNaN(t)) setMs(t);
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {outputRows.map(({ label, value }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              {label}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#0B0F18",
                borderRadius: 8,
                padding: "11px 14px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#6EE7B7",
                  wordBreak: "break-all",
                  lineHeight: "20px",
                }}
              >
                {value}
              </code>
              <CopyButton text={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({});

  useEffect(() => {
    if (!input) {
      setHashes({});
      return;
    }
    let cancelled = false;
    hashAll(input).then((result) => {
      if (!cancelled) setHashes(result);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input
        label="Input text"
        placeholder="Type or paste text to hash..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {input &&
        HASH_ALGOS.map((algo) => (
          <div
            key={algo}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              {algo}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#0B0F18",
                borderRadius: 8,
                padding: "11px 14px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#6EE7B7",
                  wordBreak: "break-all",
                  lineHeight: "20px",
                }}
              >
                {hashes[algo] || "..."}
              </code>
              {hashes[algo] && <CopyButton text={hashes[algo]} />}
            </div>
          </div>
        ))}
      {!input && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#3B4252",
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          Enter text above to generate hashes
        </div>
      )}
    </div>
  );
}

function SubnetCalculator() {
  const [cidr, setCidr] = useState("");
  const result = useMemo(() => (cidr ? calcSubnet(cidr) : null), [cidr]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input
        label="CIDR Notation"
        placeholder="e.g. 192.168.1.0/24"
        value={cidr}
        onChange={(e) => setCidr(e.target.value)}
      />
      {result ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {SUBNET_FIELDS.map(([key, label]) => {
            const val =
              key === "isPrivate"
                ? result[key]
                  ? "Yes"
                  : "No"
                : String(result[key]);
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  background: "#0B0F18",
                  borderRadius: 8,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#6EE7B7",
                      flex: 1,
                    }}
                  >
                    {val}
                  </span>
                  <CopyButton text={val} />
                </div>
              </div>
            );
          })}
        </div>
      ) : cidr ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#FB7185",
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          Invalid CIDR — use format like 10.0.0.0/8
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#3B4252",
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          Enter a CIDR to calculate subnet details
        </div>
      )}
    </div>
  );
}

function PortReference() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return commonPorts;
    const q = search.toLowerCase();
    return commonPorts.filter(
      (p) =>
        String(p.port).includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.protocol.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Search ports"
            placeholder="Filter by port, service, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "#4B5563",
            whiteSpace: "nowrap",
            paddingTop: 18,
          }}
        >
          {filtered.length}/{commonPorts.length}
        </span>
      </div>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.04)",
          maxHeight: 480,
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: mono,
            fontSize: 11,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#0B0F18",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              {["Port", "Service", "Protocol", "Description"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "11px 16px",
                    color: "#6B7280",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "#0B0F18",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.port + p.protocol}
                style={{
                  background: i % 2 === 0 ? "#0F1520" : "#0B1018",
                  transition: "background 100ms",
                }}
              >
                <td
                  style={{
                    padding: "9px 16px",
                    color: "#6EE7B7",
                    fontWeight: 600,
                  }}
                >
                  {p.port}
                </td>
                <td style={{ padding: "9px 16px", color: "#D1D5DB" }}>
                  {p.service}
                </td>
                <td style={{ padding: "9px 16px", color: "#A78BFA" }}>
                  {p.protocol}
                </td>
                <td style={{ padding: "9px 16px", color: "#9CA3AF" }}>
                  {p.desc}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#3B4252",
                    fontSize: 12,
                  }}
                >
                  No ports matching "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlagFormatter() {
  const [input, setInput] = useState("");
  const unwrapped = useMemo(() => {
    const m = input.match(UNWRAP_RE);
    return m ? m[2] : null;
  }, [input]);
  const inner = unwrapped || input;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input
        label="Flag value"
        placeholder="Enter flag string or wrapped flag like flag{...}"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {unwrapped && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "rgba(167,139,250,0.06)",
            borderRadius: 8,
            padding: "12px 14px",
            border: "1px solid rgba(167,139,250,0.12)",
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "#A78BFA",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            Extracted inner value
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <code
              style={{
                flex: 1,
                fontFamily: mono,
                fontSize: 12,
                color: "#C4B5FD",
                wordBreak: "break-all",
              }}
            >
              {unwrapped}
            </code>
            <CopyButton text={unwrapped} />
          </div>
        </div>
      )}
      {inner &&
        CTF_FORMATS.map(({ prefix, wrap }) => {
          const formatted = wrap(inner);
          return (
            <div
              key={prefix}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                {prefix}
                {"{ }"}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#0B0F18",
                  borderRadius: 8,
                  padding: "11px 14px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontFamily: mono,
                    fontSize: 11,
                    color: "#6EE7B7",
                    wordBreak: "break-all",
                    lineHeight: "20px",
                  }}
                >
                  {formatted}
                </code>
                <CopyButton text={formatted} />
              </div>
            </div>
          );
        })}
      {!input && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#3B4252",
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          Enter a flag value to wrap in CTF formats
        </div>
      )}
    </div>
  );
}

export default function Utilities() {
  const [activeTab, setActiveTab] = useState("hash");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 920,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>Utilities</span>
        <ToolHelp title="Utilities" description="Network utilities: subnet calculator, port reference, hash checker, epoch converter, and TCP flags." steps={["Select the utility tab you need","For subnets: enter CIDR notation to calculate","For ports: search by number or service name","For hashing: paste text to generate checksums"]} tips={["Subnet calculator shows network, broadcast, and host range","Port reference covers 60+ common services","Epoch converter handles Unix timestamps"]} />
      </div>
      <Tabs tabs={tabs} defaultTab="hash" onChange={setActiveTab} />
      <Card style={{ padding: "22px 24px" }}>
        {activeTab === "hash" && <HashGenerator />}
        {activeTab === "subnet" && <SubnetCalculator />}
        {activeTab === "ports" && <PortReference />}
        {activeTab === "flags" && <FlagFormatter />}
        {activeTab === "epoch" && <EpochConverter />}
      </Card>
    </div>
  );
}

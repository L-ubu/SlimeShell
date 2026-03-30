import { useCallback, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  LayoutTemplate,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { Card } from "../components/ui/Card.jsx";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const BG = "#141820";
const BG_ALT = "#1A1F2E";
const CARD = "#1E2536";
const ACCENT = "#6EE7B7";
const HEADER_ICON_BG = "#34D399";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#E8ECF4";
const TEXT_DIM = "#9CA3AF";

const REPORT_TYPES = [
  "External Pentest",
  "Internal Pentest",
  "Web App",
  "Mobile App",
  "API",
  "Social Engineering",
  "Red Team",
];

const SEVERITY_OPTIONS = [
  "Critical",
  "High",
  "Medium",
  "Low",
  "Informational",
];

const METHODOLOGY_BY_TYPE = {
  "External Pentest": `## Methodology\n\n**PTES** and **OSSTMM**: reconnaissance, threat modeling, vulnerability analysis, exploitation (authorized), reporting. External surface discovery, service enumeration, NIST SP 800-115-aligned validation.`,
  "Internal Pentest": `## Methodology\n\n**PTES** / **NIST** internal assessment: assumed-breach recon, lateral movement, AD review, segmentation, privilege escalation within RoE-approved tooling.`,
  "Web App": `## Methodology\n\n**OWASP Testing Guide** and **ASVS**: auth, sessions, access control, input validation, crypto, business logic, client-side issues; automated plus manual authenticated testing.`,
  "Mobile App": `## Methodology\n\n**OWASP MASVS** / Mobile Testing Guide: storage, crypto, auth, network, platform interaction, resilience; static/dynamic on agreed builds/devices.`,
  API: `## Methodology\n\n**OWASP API Security Top 10** + **PTES**: schema/contract, authZ, injection, deserialization, rate limits, data exposure, misconfiguration; token-based flows exercised.`,
  "Social Engineering": `## Methodology\n\n**OSINT** and scoped **social engineering** per SoW: pretexts, delivery, education impact, safe failure modes; legal/ethical RoE alignment with PoC.`,
  "Red Team": `## Methodology\n\nAdversary simulation (**PTES**, **NIST** TIB): planning, controlled execution, stealth, purple handoff; **MITRE ATT&CK** mapping; scope/no-go enforcement.`,
};

function createEmptyFinding() {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random()),
    title: "",
    severity: "Medium",
    cvss: "",
    description: "",
    impact: "",
    steps: "",
    recommendation: "",
    evidence: "",
    affected: "",
  };
}

const T = (title, severity, description, impact, recommendation, cvssVector) => ({
  id: `ft-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 24)}`,
  title,
  severity,
  description,
  impact,
  recommendation,
  cvssVector,
});

const FINDING_TEMPLATES = [
  T(
    "Remote Code Execution",
    "Critical",
    "Arbitrary OS commands via unsafe deserialization, command injection, or vulnerable component.",
    "Full compromise, lateral movement, data theft, persistence; severe business/regulatory risk.",
    "Patch immediately; sandbox; strict input validation; temporary WAF/IPS compensating controls.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  ),
  T(
    "SQL Injection (data exfil)",
    "Critical",
    "Unparameterized SQL allows UNION/error-based database extraction.",
    "Data breach, auth bypass, potential full DB compromise.",
    "Parameterized queries/ORM; least-privilege DB users; code review of data layer.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L"
  ),
  T(
    "Authentication Bypass",
    "Critical",
    "Auth can be skipped via JWT flaws, missing route guards, or parameter tampering.",
    "Unauthorized access to user/admin functions and data.",
    "Centralize authN/Z; server-side session checks; remove debug routes; automated route tests.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
  ),
  T(
    "Unrestricted File Upload",
    "Critical",
    "Uploads lack validation; executables/scripts land in web-served paths.",
    "RCE via webshell or interpreted uploads.",
    "Allowlist MIME/extension; store outside web root; AV scan; no execution on upload store.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H"
  ),
  T(
    "Insecure Deserialization",
    "Critical",
    "Untrusted serialized objects enable gadget chains to RCE.",
    "RCE, integrity loss, possible DoS.",
    "Avoid object deserialization; signed schemas; JSON + validation; patch libraries.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  ),
  T(
    "SSRF to internal services",
    "Critical",
    "Server fetches attacker-chosen URLs hitting internal IPs, metadata, or restricted nets.",
    "Internal pivot, cloud metadata theft, service abuse.",
    "Egress allowlists; block dangerous schemes; validate targets; IMDSv2/metadata hardening.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H"
  ),
  T(
    "Default Admin Credentials",
    "Critical",
    "Vendor defaults still grant admin without brute force.",
    "Immediate full admin; lateral movement risk.",
    "Change defaults at provision; disable unused accounts; inventory + monitoring.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  ),
  T(
    "Privilege Escalation to root",
    "Critical",
    "Local user → root via misconfig, SUID, kernel, or weak service perms.",
    "Full host takeover from foothold.",
    "Patch; sudoers/policy hardening; remove risky SUID; EDR logging.",
    "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H"
  ),
  T(
    "Stored XSS",
    "High",
    "Persisted content renders scripts without encoding.",
    "Session theft, phishing-in-app, actions as victim.",
    "Encode output; CSP; sanitize rich text; HttpOnly cookies.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N"
  ),
  T(
    "Broken Access Control",
    "High",
    "IDOR/BOLA: users reach others' objects or privileged routes.",
    "Unauthorized reads/writes across users/tenants.",
    "Server-side authZ every call; unpredictable IDs; access integration tests.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N"
  ),
  T(
    "IDOR",
    "High",
    "Predictable IDs expose other users' resources without checks.",
    "Bulk data theft; privacy violations.",
    "Object-level authZ; avoid raw keys in URLs; anomaly logging.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"
  ),
  T(
    "XXE",
    "High",
    "XML parsers resolve external entities/DTD → file read or SSRF.",
    "Sensitive files leaked; internal probing.",
    "Disable DTD/XXE; prefer JSON; secure parser defaults.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
  ),
  T(
    "Path Traversal (file read)",
    "High",
    "User input in paths allows ../ reads outside intended dirs.",
    "Secrets, source, configs exposed.",
    "Canonicalize; allowlists; jail reads; segregate user files.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
  ),
  T(
    "Weak Encryption",
    "High",
    "Legacy ciphers (DES/RC4/MD5), ECB, or static keys protect sensitive data.",
    "Confidentiality/integrity failure; compliance gaps.",
    "AEAD (AES-GCM/ChaCha20-Poly1305); KMS/HSM; key rotation.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:L/A:N"
  ),
  T(
    "Hardcoded Credentials",
    "High",
    "Secrets in repos, bundles, or configs.",
    "Account/API takeover.",
    "Vault/secret manager; rotate; CI/secret scanning.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
  ),
  T(
    "Missing Authentication on API",
    "High",
    "Sensitive endpoints accept unauthenticated requests.",
    "Data exfiltration; abuse of business logic.",
    "Require auth on non-public routes; central token validation.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
  ),
  T(
    "Session Fixation",
    "High",
    "Session ID accepted from attacker; not rotated on login.",
    "Account takeover via shared session.",
    "Regenerate session on auth; bind session; Secure/HttpOnly/SameSite cookies.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N"
  ),
  T(
    "CORS Misconfiguration",
    "High",
    "Reflective Origin, wildcard + credentials, or broad allowlists.",
    "Steal authenticated responses cross-origin.",
    "Strict origin allowlist; no * with credentials; minimize browser-exposed JSON.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N"
  ),
  T(
    "Reflected XSS",
    "Medium",
    "Reflected input rendered without encoding in responses.",
    "Phishing chains; credential theft in-browser.",
    "Output encoding; CSP; strict input formats.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N"
  ),
  T(
    "CSRF",
    "Medium",
    "State-changing actions lack CSRF tokens / SameSite.",
    "Actions forged as logged-in user.",
    "Sync tokens; SameSite; step-up auth for sensitive ops.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N"
  ),
  T(
    "Information Disclosure",
    "Medium",
    "Errors, headers, or metadata leak paths, stacks, internals.",
    "Easier targeted exploitation.",
    "Generic client errors; strip headers; review public artifacts.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "Missing Security Headers",
    "Medium",
    "No/weak CSP, HSTS, X-CTO, etc.",
    "Amplifies XSS, downgrade, MIME issues.",
    "Baseline headers at proxy/framework; verify with scanners.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N"
  ),
  T(
    "Verbose Error Messages",
    "Medium",
    "SQL fragments, class names, or internals in errors.",
    "Aids exploitation mapping.",
    "Generic UI errors; server-only logs; prod debug off.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "Directory Listing",
    "Medium",
    "Indexes expose backups and sensitive files.",
    "Faster discovery of weak assets.",
    "Disable autoindex; lock down static roots.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "Outdated Software / Libraries",
    "Medium",
    "Known CVE versions in stack.",
    "Higher chance of public exploit use.",
    "Patch cadence; SCA; SBOM.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:L"
  ),
  T(
    "Insecure Direct Object References",
    "Medium",
    "Indirect refs leak existence or limited unauthorized reads.",
    "Partial disclosure/enumeration.",
    "Object authZ; rate limits on lookups.",
    "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "Open Redirect",
    "Medium",
    "Open redirect params enable phishing/OAuth abuse.",
    "Trust abuse; cred harvest on legit domain.",
    "Allowlist targets or opaque tokens for redirects.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N"
  ),
  T(
    "Weak Password Policy",
    "Medium",
    "Length/complexity/reset below baseline.",
    "Stuffing and guessing success.",
    "NIST-style policy; breached pwd checks; MFA for privileged roles.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N"
  ),
  T(
    "Cookie without Secure flag",
    "Medium",
    "Session cookies sent over cleartext HTTP possible.",
    "Session theft on mixed networks.",
    "Secure flag; sitewide HTTPS; HSTS.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N"
  ),
  T(
    "Missing Rate Limiting",
    "Medium",
    "Login/reset/enumeration endpoints unlimited.",
    "Brute force, stuffing, DoS.",
    "IP/user throttles; CAPTCHA on abuse; WAF.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:L"
  ),
  T(
    "Cookie without HttpOnly",
    "Low",
    "Session readable from JS.",
    "Token theft if XSS appears.",
    "HttpOnly session cookies; CSP against XSS.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N"
  ),
  T(
    "Missing X-Frame-Options",
    "Low",
    "App frameable by arbitrary sites.",
    "Clickjacking / UI redress.",
    "CSP frame-ancestors or XFO DENY/SAMEORIGIN.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N"
  ),
  T(
    "Clickjacking potential",
    "Low",
    "Inconsistent framing policy across routes/subs.",
    "Tricked actions on embedded UI.",
    "Standardize framing policy edge-to-edge.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N"
  ),
  T(
    "Software version disclosure",
    "Low",
    "Banners/comments reveal exact versions.",
    "Easier version-targeted attacks.",
    "Reduce banner detail; strip prod comments.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "Missing Content-Security-Policy",
    "Low",
    "No CSP to constrain scripts/resources.",
    "Worsens XSS/supply-chain impact.",
    "Introduce baseline CSP; tighten iteratively.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N"
  ),
  T(
    "Autocomplete on sensitive fields",
    "Low",
    "Password/token fields autocomplete on shared devices.",
    "Credential exposure on shared workstations.",
    "Appropriate autocomplete attrs; user guidance.",
    "CVSS:3.1/AV:P/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N"
  ),
  T(
    "Server banner disclosure",
    "Informational",
    "Product/version in HTTP/SMTP banners.",
    "Minor recon value.",
    "Reduce verbosity per hardening guide.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:N"
  ),
  T(
    "HTTP methods enabled",
    "Informational",
    "OPTIONS/DAV/TRACE or rare verbs exposed.",
    "Abuse if combined with other issues.",
    "Disable unneeded verbs at edge; document required set.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:N"
  ),
  T(
    "Unlinked content discovered",
    "Informational",
    "Hidden paths from wordlists not linked in UI.",
    "May expose legacy/debug if unauth.",
    "Review paths; remove cruft; consistent auth.",
    "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
  T(
    "DNS zone transfer possible",
    "Informational",
    "AXFR from untrusted clients exposes full zone.",
    "Recon / target selection.",
    "Restrict transfers to secondaries only.",
    "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N"
  ),
].map((x, i) => ({ ...x, id: `ft-${i}-${x.id}` }));

const REPORT_OUTLINE_TEMPLATES = [
  {
    id: "ext-net",
    name: "External Network Pentest",
    scopeTemplate:
      "External IPv4/IPv6, VPN entry, customer perimeter in Appendix A. Out of scope: physical, unrelated SaaS.",
    roeTemplate:
      "No DoS without approval. No ISP/law-enforcement targets. Window [dates]. Emergency [contact].",
    methodologyExtra: "OSSTMM visibility/access; PTES reporting structure.",
    defaultType: "External Pentest",
  },
  {
    id: "int-net",
    name: "Internal Network Pentest",
    scopeTemplate:
      "VLANs [list], domain hosts, corp Wi-Fi. Excluded: OT/ICS unless added.",
    roeTemplate:
      "Assume breach from [role]. Lateral movement in [subnets]. Guessing cap [N]/account. IT change windows.",
    methodologyExtra: "AD, privilege paths, segmentation (PTES).",
    defaultType: "Internal Pentest",
  },
  {
    id: "web-app",
    name: "Web Application Assessment",
    scopeTemplate:
      "URLs [app/admin]. Roles: anon, user, admin (creds supplied). APIs [Y/N + base path].",
    roeTemplate:
      "No destructive writes. Respect rate limits. Business-hours unless agreed.",
    methodologyExtra: "OWASP ASVS on critical flows; business-logic review.",
    defaultType: "Web App",
  },
  {
    id: "api-sec",
    name: "API Security Assessment",
    scopeTemplate:
      "REST/GraphQL bases; OpenAPI rev [x]; OAuth2 client + user flows in scope.",
    roeTemplate:
      "No bulk exfil beyond proof rows. Synthetic accounts only.",
    methodologyExtra: "OWASP API Top 10: schema abuse, BOLA, rate limits.",
    defaultType: "API",
  },
  {
    id: "se-eng",
    name: "Social Engineering Assessment",
    scopeTemplate:
      "Email to [N]; vishing [list]; tailgating [Y/N].",
    roeTemplate:
      "No malware. Landing infra approved. Escalation for risky replies.",
    methodologyExtra: "OSINT prep; legal/comms QA; education landing pages.",
    defaultType: "Social Engineering",
  },
  {
    id: "red-team",
    name: "Red Team Engagement",
    scopeTemplate:
      "Initial access [vectors]. Crown jewels [assets]. Out of scope [list].",
    roeTemplate:
      "Weekly purple checkpoint. No ransomware sim. Exfil = proof files + hashes.",
    methodologyExtra: "MITRE mapping; stealth rules; detection feedback.",
    defaultType: "Red Team",
  },
];

const SEVERITY_WEIGHT = {
  Critical: 10,
  High: 7,
  Medium: 4,
  Low: 2,
  Informational: 0.5,
};

const SAMPLE_FINDINGS_FOR_METRICS = [
  { title: "Sample: SQL Injection", severity: "Critical" },
  { title: "Sample: IDOR", severity: "High" },
  { title: "Sample: Missing CSP", severity: "Medium" },
  { title: "Sample: Banner disclosure", severity: "Low" },
  { title: "Sample: TRACE enabled", severity: "Informational" },
];

function inferCategory(title) {
  const t = (title || "").toLowerCase();
  if (/xss|csrf|cors|cookie|header|csp|clickjack|redirect/.test(t))
    return "Web / Client";
  if (/sql|injection|xxe|deserial|traversal|upload|rce|ssrf/.test(t))
    return "Injection / RCE";
  if (/auth|session|password|credential|jwt|oauth|idor|access/.test(t))
    return "Auth / Access";
  if (/dns|network|ssl|tls|port|banner|http method/.test(t))
    return "Network / Config";
  return "General";
}

function severityColor(sev) {
  switch (sev) {
    case "Critical":
      return "#F87171";
    case "High":
      return "#FB923C";
    case "Medium":
      return "#FBBF24";
    case "Low":
      return "#A78BFA";
    case "Informational":
      return "#94A3B8";
    default:
      return ACCENT;
  }
}

function buildMarkdown(state) {
  const {
    clientName,
    testerName,
    dateStart,
    dateEnd,
    scope,
    reportType,
    execSummary,
    findings,
    methodology,
  } = state;

  const lines = [];
  lines.push(`# Penetration Test Report`);
  lines.push("");
  lines.push(`**Client:** ${clientName || "[Client]"}`);
  lines.push(`**Tester(s):** ${testerName || "[Tester]"}`);
  lines.push(
    `**Engagement dates:** ${dateStart || "[Start]"} – ${dateEnd || "[End]"}`
  );
  lines.push(`**Report type:** ${reportType}`);
  lines.push("");
  lines.push(`## Scope`);
  lines.push(scope || "_Scope to be completed._");
  lines.push("");
  lines.push(`## Executive Summary`);
  lines.push(execSummary || "_Executive summary to be completed._");
  lines.push("");
  lines.push(methodology || "_Methodology to be completed._");
  lines.push("");
  lines.push(`## Findings Summary`);
  lines.push("");
  lines.push(`| # | Title | Severity | CVSS |`);
  lines.push(`|---|--------|----------|------|`);
  findings.forEach((f, i) => {
    lines.push(
      `| ${i + 1} | ${f.title || "(untitled)"} | ${f.severity} | ${f.cvss || "—"} |`
    );
  });
  lines.push("");

  findings.forEach((f, i) => {
    lines.push(`## Finding ${i + 1}: ${f.title || "Untitled"}`);
    lines.push("");
    lines.push(`- **Severity:** ${f.severity}`);
    lines.push(`- **CVSS:** ${f.cvss || "Not assigned"}`);
    lines.push(`- **Affected systems:** ${f.affected || "—"}`);
    lines.push("");
    lines.push(`### Description`);
    lines.push(f.description || "_None provided._");
    lines.push("");
    lines.push(`### Impact`);
    lines.push(f.impact || "_None provided._");
    lines.push("");
    lines.push(`### Steps to Reproduce`);
    lines.push(f.steps || "_None provided._");
    lines.push("");
    lines.push(`### Recommendation`);
    lines.push(f.recommendation || "_None provided._");
    lines.push("");
    lines.push(`### Evidence`);
    lines.push(f.evidence || "_None provided._");
    lines.push("");
  });

  lines.push(`---`);
  lines.push(`_Generated by SlimeShell Report Generator_`);
  return lines.join("\n");
}

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: BG_ALT,
  color: TEXT,
  fontFamily: mono,
  fontSize: 13,
};

const labelStyle = {
  display: "block",
  fontFamily: heading,
  fontSize: 12,
  fontWeight: 600,
  color: TEXT_DIM,
  marginBottom: 6,
};

export default function ReportGenerator() {
  const [tab, setTab] = useState(0);

  const [clientName, setClientName] = useState("");
  const [testerName, setTesterName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [scope, setScope] = useState("");
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [execSummary, setExecSummary] = useState("");
  const [findings, setFindings] = useState([createEmptyFinding()]);
  const [methodology, setMethodology] = useState(
    METHODOLOGY_BY_TYPE[REPORT_TYPES[0]]
  );
  const [generatedMd, setGeneratedMd] = useState("");

  const applyMethodologyForType = useCallback((type) => {
    setMethodology(METHODOLOGY_BY_TYPE[type] || "");
  }, []);

  const handleReportTypeChange = (e) => {
    const v = e.target.value;
    setReportType(v);
    applyMethodologyForType(v);
  };

  const addFinding = () => {
    setFindings((prev) => [...prev, createEmptyFinding()]);
  };

  const removeFinding = (id) => {
    setFindings((prev) =>
      prev.length <= 1 ? prev : prev.filter((f) => f.id !== id)
    );
  };

  const updateFinding = (id, patch) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const useFindingTemplate = (tpl) => {
    const base = createEmptyFinding();
    setFindings((prev) => [
      ...prev,
      {
        ...base,
        title: tpl.title,
        severity: tpl.severity,
        description: tpl.description,
        impact: tpl.impact,
        recommendation: tpl.recommendation,
        cvss: tpl.cvssVector,
        steps: "_Populate with validated reproduction steps._",
        evidence: "_Screenshots, logs, or request/response pairs._",
        affected: "_List affected hosts, URLs, or roles._",
      },
    ]);
    setTab(0);
  };

  const startFromReportTemplate = (tpl) => {
    setReportType(tpl.defaultType);
    applyMethodologyForType(tpl.defaultType);
    setScope(
      `${tpl.scopeTemplate}\n\n**Rules of engagement:**\n${tpl.roeTemplate}\n\n**Additional methodology notes:**\n${tpl.methodologyExtra}`
    );
    setExecSummary(
      `This report documents the ${tpl.name.toLowerCase()} performed during the agreed window. Executive summary to be finalized after validation of all findings.`
    );
    setTab(0);
  };

  const generateReport = () => {
    setGeneratedMd(
      buildMarkdown({
        clientName,
        testerName,
        dateStart,
        dateEnd,
        scope,
        reportType,
        execSummary,
        findings,
        methodology,
      })
    );
  };

  const downloadMd = () => {
    const body =
      generatedMd ||
      buildMarkdown({
        clientName,
        testerName,
        dateStart,
        dateEnd,
        scope,
        reportType,
        execSummary,
        findings,
        methodology,
      });
    const blob = new Blob([body], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pentest-report-${(clientName || "client")
      .replace(/\s+/g, "-")
      .toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const findingsForMetrics = useMemo(() => {
    const hasReal = findings.some(
      (f) => f.title?.trim() || f.description?.trim()
    );
    if (hasReal) return findings;
    return SAMPLE_FINDINGS_FOR_METRICS.map((s, i) => ({
      ...createEmptyFinding(),
      id: `sample-${i}`,
      title: s.title,
      severity: s.severity,
    }));
  }, [findings]);

  const severityCounts = useMemo(() => {
    const c = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
    };
    for (const f of findingsForMetrics) {
      const s = f.severity;
      if (c[s] !== undefined) c[s] += 1;
    }
    return c;
  }, [findingsForMetrics]);

  const maxBar = Math.max(1, ...Object.values(severityCounts));

  const weightedScore = useMemo(() => {
    let total = 0;
    for (const f of findingsForMetrics) {
      total += SEVERITY_WEIGHT[f.severity] ?? 0;
    }
    return Math.round(total * 10) / 10;
  }, [findingsForMetrics]);

  const categoryCounts = useMemo(() => {
    const m = {};
    for (const f of findingsForMetrics) {
      const cat = inferCategory(f.title);
      m[cat] = (m[cat] || 0) + 1;
    }
    return m;
  }, [findingsForMetrics]);

  const overallRating = useMemo(() => {
    if (severityCounts.Critical > 0)
      return { label: "Critical", color: "#F87171" };
    if (severityCounts.High >= 2 || weightedScore >= 14)
      return { label: "High", color: "#FB923C" };
    if (severityCounts.High > 0 || weightedScore >= 8)
      return { label: "Medium", color: "#FBBF24" };
    if (weightedScore >= 3) return { label: "Low", color: "#A78BFA" };
    return { label: "Low", color: "#A78BFA" };
  }, [severityCounts, weightedScore]);

  const autoExecSummary = useMemo(() => {
    const n = findingsForMetrics.length;
    return [
      `The assessment identified ${n} finding(s).`,
      `Severity mix: Critical ${severityCounts.Critical}, High ${severityCounts.High}, Medium ${severityCounts.Medium}, Low ${severityCounts.Low}, Informational ${severityCounts.Informational}.`,
      `Weighted risk score (heuristic): ${weightedScore}. Overall rating: ${overallRating.label}.`,
      `Prioritize remediation for Critical and High items affecting external exposure and authentication boundaries.`,
    ].join(" ");
  }, [
    findingsForMetrics.length,
    severityCounts,
    weightedScore,
    overallRating.label,
  ]);

  const remediationMatrix = useMemo(() => {
    return findingsForMetrics.map((f) => {
      const impact =
        f.severity === "Critical" || f.severity === "High"
          ? "High"
          : f.severity === "Medium"
            ? "Medium"
            : "Low";
      const effort =
        f.severity === "Critical" || f.severity === "High"
          ? "High"
          : f.severity === "Medium"
            ? "Medium"
            : "Low";
      return { title: f.title || "Untitled", impact, effort };
    });
  }, [findingsForMetrics]);

  const timelineWeeks = useMemo(() => {
    const crit = severityCounts.Critical;
    const high = severityCounts.High;
    const med = severityCounts.Medium;
    const low = severityCounts.Low + severityCounts.Informational;
    const est = crit * 3 + high * 2 + med * 1 + low * 0.25;
    return Math.max(1, Math.ceil(est));
  }, [severityCounts]);

  const tabs = [
    { id: 0, label: "Report Builder", icon: ClipboardList },
    { id: 1, label: "Finding Templates", icon: LayoutTemplate },
    { id: 2, label: "Report Templates", icon: FileText },
    { id: 3, label: "Metrics & Charts", icon: BarChart3 },
  ];

  const templatesBySeverity = useMemo(() => {
    const order = [
      "Critical",
      "High",
      "Medium",
      "Low",
      "Informational",
    ];
    const map = {};
    for (const s of order) map[s] = [];
    for (const t of FINDING_TEMPLATES) {
      if (map[t.severity]) map[t.severity].push(t);
    }
    return map;
  }, []);

  const markdownDraft = useMemo(
    () =>
      buildMarkdown({
        clientName,
        testerName,
        dateStart,
        dateEnd,
        scope,
        reportType,
        execSummary,
        findings,
        methodology,
      }),
    [
      clientName,
      testerName,
      dateStart,
      dateEnd,
      scope,
      reportType,
      execSummary,
      findings,
      methodology,
    ]
  );

  return (
    <div
      style={{
        minHeight: "100%",
        background: BG,
        color: TEXT,
        padding: "24px 28px 40px",
        fontFamily: mono,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: HEADER_ICON_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f172a",
          }}
        >
          <FileText size={20} strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Report Generator
        </h1>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${active ? ACCENT : BORDER}`,
                background: active ? "rgba(110,231,183,0.12)" : BG_ALT,
                color: active ? ACCENT : TEXT_DIM,
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h2
              style={{
                fontFamily: heading,
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 16px",
                color: ACCENT,
              }}
            >
              Engagement Info
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>Client name</label>
                <input
                  style={inputBase}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label style={labelStyle}>Tester name</label>
                <input
                  style={inputBase}
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label style={labelStyle}>Start date</label>
                <input
                  style={inputBase}
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>End date</label>
                <input
                  style={inputBase}
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Scope</label>
                <textarea
                  style={{ ...inputBase, minHeight: 88, resize: "vertical" }}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="IPs, URLs, accounts, exclusions..."
                />
              </div>
              <div>
                <label style={labelStyle}>Report type</label>
                <select
                  style={{ ...inputBase, cursor: "pointer" }}
                  value={reportType}
                  onChange={handleReportTypeChange}
                >
                  {REPORT_TYPES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h2
              style={{
                fontFamily: heading,
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 16px",
                color: ACCENT,
              }}
            >
              Executive Summary
            </h2>
            <textarea
              style={{ ...inputBase, minHeight: 120, resize: "vertical" }}
              value={execSummary}
              onChange={(e) => setExecSummary(e.target.value)}
              placeholder="High-level narrative for leadership..."
            />
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h2
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: ACCENT,
                }}
              >
                Findings
              </h2>
              <button
                type="button"
                onClick={addFinding}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${ACCENT}`,
                  background: "rgba(110,231,183,0.15)",
                  color: ACCENT,
                  fontFamily: heading,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                Add finding
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {findings.map((f, idx) => (
                <div
                  key={f.id}
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: 16,
                    background: BG_ALT,
                  }}
                >
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
                        fontWeight: 700,
                        fontSize: 13,
                        color: TEXT,
                      }}
                    >
                      Finding #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFinding(f.id)}
                      disabled={findings.length <= 1}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        background: "transparent",
                        color: findings.length <= 1 ? "#475569" : "#F87171",
                        cursor:
                          findings.length <= 1 ? "not-allowed" : "pointer",
                        fontFamily: heading,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Title</label>
                      <input
                        style={inputBase}
                        value={f.title}
                        onChange={(e) =>
                          updateFinding(f.id, { title: e.target.value })
                        }
                        placeholder="Short title"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Severity</label>
                      <select
                        style={{ ...inputBase, cursor: "pointer" }}
                        value={f.severity}
                        onChange={(e) =>
                          updateFinding(f.id, { severity: e.target.value })
                        }
                      >
                        {SEVERITY_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>CVSS score / vector</label>
                      <input
                        style={inputBase}
                        value={f.cvss}
                        onChange={(e) =>
                          updateFinding(f.id, { cvss: e.target.value })
                        }
                        placeholder="9.8 or CVSS:3.1/AV:..."
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Affected systems</label>
                      <input
                        style={inputBase}
                        value={f.affected}
                        onChange={(e) =>
                          updateFinding(f.id, { affected: e.target.value })
                        }
                        placeholder="Hosts, URLs, components"
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        style={{ ...inputBase, minHeight: 72, resize: "vertical" }}
                        value={f.description}
                        onChange={(e) =>
                          updateFinding(f.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Impact</label>
                      <textarea
                        style={{ ...inputBase, minHeight: 72, resize: "vertical" }}
                        value={f.impact}
                        onChange={(e) =>
                          updateFinding(f.id, { impact: e.target.value })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Steps to reproduce</label>
                      <textarea
                        style={{ ...inputBase, minHeight: 72, resize: "vertical" }}
                        value={f.steps}
                        onChange={(e) =>
                          updateFinding(f.id, { steps: e.target.value })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Recommendation</label>
                      <textarea
                        style={{ ...inputBase, minHeight: 72, resize: "vertical" }}
                        value={f.recommendation}
                        onChange={(e) =>
                          updateFinding(f.id, {
                            recommendation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Evidence / proof</label>
                      <textarea
                        style={{ ...inputBase, minHeight: 72, resize: "vertical" }}
                        value={f.evidence}
                        onChange={(e) =>
                          updateFinding(f.id, { evidence: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h2
              style={{
                fontFamily: heading,
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 12px",
                color: ACCENT,
              }}
            >
              Methodology
            </h2>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 12,
                color: TEXT_DIM,
                fontFamily: heading,
              }}
            >
              Pre-filled from report type (OWASP, PTES, OSSTMM, NIST references).
              Edit as needed.
            </p>
            <textarea
              style={{ ...inputBase, minHeight: 200, resize: "vertical" }}
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
            />
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={generateReport}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: ACCENT,
                  color: "#0f172a",
                  fontFamily: heading,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Generate Report
              </button>
              <CopyButton
                text={generatedMd || markdownDraft}
                className="!p-2 !rounded-lg"
              />
              <span
                style={{
                  fontSize: 12,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                Copy Markdown
              </span>
              <button
                type="button"
                onClick={downloadMd}
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: BG_ALT,
                  color: TEXT,
                  fontFamily: heading,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Download size={16} />
                Download .md
              </button>
            </div>
            <textarea
              readOnly
              style={{
                ...inputBase,
                minHeight: 220,
                resize: "vertical",
                opacity: 0.95,
              }}
              value={
                generatedMd ||
                "_Click Generate Report to populate Markdown, or copy current draft._"
              }
            />
          </Card>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontFamily: heading,
              fontSize: 13,
              color: TEXT_DIM,
              margin: 0,
            }}
          >
            {FINDING_TEMPLATES.length} templates — Use Template adds a new row
            in Report Builder.
          </p>
          {["Critical", "High", "Medium", "Low", "Informational"].map(
            (sev) => (
              <Card
                key={sev}
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  padding: 18,
                }}
              >
                <h3
                  style={{
                    fontFamily: heading,
                    fontSize: 15,
                    fontWeight: 700,
                    margin: "0 0 14px",
                    color: severityColor(sev),
                  }}
                >
                  {sev}{" "}
                  <span style={{ color: TEXT_DIM, fontWeight: 500 }}>
                    ({templatesBySeverity[sev]?.length || 0})
                  </span>
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {(templatesBySeverity[sev] || []).map((tpl) => (
                    <div
                      key={tpl.id}
                      style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: 14,
                        background: BG_ALT,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: "1 1 240px" }}>
                          <div
                            style={{
                              fontFamily: heading,
                              fontWeight: 700,
                              fontSize: 14,
                              marginBottom: 6,
                            }}
                          >
                            {tpl.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: TEXT_DIM,
                              lineHeight: 1.5,
                            }}
                          >
                            {tpl.description.slice(0, 220)}
                            {tpl.description.length > 220 ? "…" : ""}
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: ACCENT,
                              fontFamily: mono,
                            }}
                          >
                            {tpl.cvssVector}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => useFindingTemplate(tpl)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: `1px solid ${ACCENT}`,
                            background: "rgba(110,231,183,0.12)",
                            color: ACCENT,
                            fontFamily: heading,
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {tab === 2 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {REPORT_OUTLINE_TEMPLATES.map((tpl) => (
            <Card
              key={tpl.id}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h3
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: ACCENT,
                }}
              >
                {tpl.name}
              </h3>
              <div
                style={{
                  fontSize: 12,
                  color: TEXT_DIM,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong style={{ color: TEXT }}>Scope:</strong>{"\n"}
                {tpl.scopeTemplate}
                {"\n\n"}
                <strong style={{ color: TEXT }}>RoE:</strong>{"\n"}
                {tpl.roeTemplate}
              </div>
              <button
                type="button"
                onClick={() => startFromReportTemplate(tpl)}
                style={{
                  marginTop: "auto",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: ACCENT,
                  color: "#0f172a",
                  fontFamily: heading,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Start from Template
              </button>
            </Card>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: ACCENT,
                }}
              >
                Severity distribution
              </h2>
              <span
                style={{
                  fontSize: 12,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                {!findings.some((f) => f.title?.trim() || f.description?.trim())
                  ? "Showing sample data — add findings in Report Builder."
                  : "Live data from your findings."}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                height: 200,
                paddingTop: 8,
              }}
            >
              {[
                "Critical",
                "High",
                "Medium",
                "Low",
                "Informational",
              ].map((sev) => {
                const barH = Math.max(
                  6,
                  Math.round((severityCounts[sev] / maxBar) * 140)
                );
                return (
                  <div
                    key={sev}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        maxWidth: 56,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        minHeight: 140,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: barH,
                          background: severityColor(sev),
                          borderRadius: 6,
                          transition: "height 0.2s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: TEXT_DIM,
                        textAlign: "center",
                        fontFamily: heading,
                      }}
                    >
                      {sev.slice(0, 4)}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: heading,
                        color: TEXT,
                      }}
                    >
                      {severityCounts[sev]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <Card
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                padding: 18,
              }}
            >
              <h3
                style={{
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "0 0 10px",
                  color: TEXT_DIM,
                }}
              >
                Weighted risk score
              </h3>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: heading,
                  color: ACCENT,
                }}
              >
                {weightedScore}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: TEXT_DIM }}>
                Weights: Critical 10, High 7, Medium 4, Low 2, Info 0.5
              </p>
            </Card>
            <Card
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                padding: 18,
              }}
            >
              <h3
                style={{
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "0 0 10px",
                  color: TEXT_DIM,
                }}
              >
                Overall risk rating
              </h3>
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontFamily: heading,
                  fontWeight: 800,
                  fontSize: 14,
                  background: `${overallRating.color}22`,
                  color: overallRating.color,
                  border: `1px solid ${overallRating.color}55`,
                }}
              >
                {overallRating.label}
              </span>
            </Card>
            <Card
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                padding: 18,
              }}
            >
              <h3
                style={{
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "0 0 10px",
                  color: TEXT_DIM,
                }}
              >
                Remediation timeline (est.)
              </h3>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: heading,
                  color: TEXT,
                }}
              >
                ~{timelineWeeks} week{timelineWeeks !== 1 ? "s" : ""}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: TEXT_DIM }}>
                Heuristic from severity mix (critical×3, high×2, medium×1,
                low/info×0.25).
              </p>
            </Card>
          </div>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h3
              style={{
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 700,
                margin: "0 0 14px",
                color: ACCENT,
              }}
            >
              Findings by category
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        flex: "0 0 140px",
                        fontSize: 12,
                        fontFamily: heading,
                        color: TEXT,
                      }}
                    >
                      {cat}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        background: BG_ALT,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(count / findingsForMetrics.length) * 100}%`,
                          height: "100%",
                          background: ACCENT,
                          borderRadius: 5,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        flex: "0 0 28px",
                        textAlign: "right",
                        fontSize: 12,
                        fontWeight: 700,
                        color: ACCENT,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h3
              style={{
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 700,
                margin: "0 0 14px",
                color: ACCENT,
              }}
            >
              Remediation priority matrix (effort vs impact)
            </h3>
            <div
              style={{
                position: "relative",
                height: 280,
                border: `1px dashed ${BORDER}`,
                borderRadius: 10,
                background: BG_ALT,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 8,
                  bottom: 8,
                  width: 1,
                  background: BORDER,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  right: 8,
                  height: 1,
                  background: BORDER,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: 8,
                  fontSize: 10,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                Low effort
              </span>
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: 8,
                  fontSize: 10,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                High effort
              </span>
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 8,
                  fontSize: 10,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                Low impact
              </span>
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 8,
                  fontSize: 10,
                  color: TEXT_DIM,
                  fontFamily: heading,
                }}
              >
                High impact
              </span>
              {remediationMatrix.map((cell, i) => {
                const ix =
                  cell.effort === "High"
                    ? 0.72 + (i % 3) * 0.04
                    : cell.effort === "Medium"
                      ? 0.42 + (i % 2) * 0.06
                      : 0.18 + (i % 2) * 0.05;
                const iy =
                  cell.impact === "High"
                    ? 0.22 + (i % 4) * 0.05
                    : cell.impact === "Medium"
                      ? 0.48 + (i % 3) * 0.04
                      : 0.72 + (i % 2) * 0.04;
                return (
                  <div
                    key={`${cell.title}-${i}`}
                    title={`${cell.title} — impact ${cell.impact}, effort ${cell.effort}`}
                    style={{
                      position: "absolute",
                      left: `${ix * 100}%`,
                      top: `${iy * 100}%`,
                      transform: "translate(-50%, -50%)",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        cell.impact === "High" ? "#F87171" : ACCENT,
                      boxShadow: `0 0 0 2px ${BG_ALT}`,
                    }}
                  />
                );
              })}
            </div>
            <p style={{ margin: 0, fontSize: 11, color: TEXT_DIM }}>
              Dots positioned from severity-derived impact/effort; hover for
              titles.
            </p>
          </Card>

          <Card
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              padding: 20,
            }}
          >
            <h3
              style={{
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 700,
                margin: "0 0 10px",
                color: ACCENT,
              }}
            >
              Executive summary (auto-generated)
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                color: TEXT,
                fontFamily: heading,
              }}
            >
              {autoExecSummary}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  FileSearch,
  LogIn,
  FolderOpen,
  Settings,
  Database,
  Key,
  AlertTriangle,
  Network,
  Clock,
  CheckSquare,
  Square,
  Crosshair,
  Radar,
  Eye,
  HardDrive,
  Plug,
  ClipboardList,
  Github,
  Cloud,
  LayoutGrid,
  GitBranch,
  Link2,
  Bug,
  FileText,
  KeyRound,
  BookOpen,
  Server,
  Layers,
  Cpu,
  Loader2,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Input } from '../components/ui/Input.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const ACCENT = '#38BDF8';

const DNS_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA'];

const COMMON_SUBDOMAIN_PREFIXES = [
  'www',
  'mail',
  'ftp',
  'dev',
  'staging',
  'api',
  'admin',
  'test',
  'beta',
  'portal',
  'vpn',
  'remote',
  'cdn',
  'assets',
  'static',
  'blog',
  'shop',
  'app',
  'dashboard',
  'docs',
  'status',
  'monitor',
  'git',
  'ci',
  'jenkins',
  'grafana',
  'kibana',
  'elastic',
  'redis',
  'mysql',
  'postgres',
  'mongo',
  'phpmyadmin',
  'webmail',
  'owa',
  'autodiscover',
  'cpanel',
  'plesk',
  'whm',
  'sso',
  'auth',
  'login',
  'id',
  'accounts',
];

const TECH_SIGNATURES = {
  WordPress: ['wp-content', 'wp-includes'],
  React: ['_next', 'react', '__NEXT'],
  Vue: ['vue', 'nuxt'],
  Angular: ['ng-', 'angular'],
  Laravel: ['laravel', 'XSRF-TOKEN'],
  Django: ['csrfmiddlewaretoken', 'django'],
  Express: ['X-Powered-By: Express'],
  nginx: ['Server: nginx'],
  Apache: ['Server: Apache'],
  Cloudflare: ['cf-ray', 'cloudflare'],
  AWS: ['x-amz-', 'AmazonS3'],
  'Next.js': ['__NEXT_DATA__', 'x-nextjs'],
  Drupal: ['Drupal', 'drupal.js'],
  Joomla: ['joomla', '/media/jui/'],
  PHP: ['PHPSESSID', 'X-Powered-By: PHP'],
  'ASP.NET': ['__VIEWSTATE', 'ASP.NET'],
  'Ruby on Rails': ['X-Request-Id', '_session_id'],
  Spring: ['JSESSIONID'],
  Varnish: ['X-Varnish', 'Via: varnish'],
};

const INTERESTING_HEADER_KEYS = [
  'server',
  'x-powered-by',
  'x-aspnet-version',
  'x-generator',
  'via',
  'cf-ray',
  'x-nextjs',
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
];

// ─── GOOGLE DORK TEMPLATES ────────────────────────────
const dorkTemplates = [
  { id: 'site', label: 'Site-specific', icon: Globe, color: '#7DD3FC', generate: (d) => `site:${d}` },
  { id: 'files', label: 'File finder', icon: FileSearch, color: '#A78BFA', generate: (d) => `site:${d} filetype:pdf|doc|xls|sql|env|log|bak` },
  { id: 'login', label: 'Login pages', icon: LogIn, color: '#F472B6', generate: (d) => `site:${d} inurl:login|admin|dashboard` },
  { id: 'dirs', label: 'Exposed dirs', icon: FolderOpen, color: '#FBBF24', generate: (d) => `site:${d} intitle:"index of"` },
  { id: 'config', label: 'Config files', icon: Settings, color: '#34D399', generate: (d) => `site:${d} ext:xml|conf|cnf|ini|env|yml` },
  { id: 'database', label: 'Database files', icon: Database, color: '#F87171', generate: (d) => `site:${d} ext:sql|db|sqlite|mdb` },
  { id: 'sensitive', label: 'Sensitive info', icon: Key, color: '#FB923C', generate: (d) => `site:${d} intext:password|username|api_key` },
  { id: 'errors', label: 'Error pages', icon: AlertTriangle, color: '#E879F9', generate: (d) => `site:${d} intext:"error"|"warning"|"stack trace"` },
  { id: 'subdomains', label: 'Subdomains', icon: Network, color: '#2DD4BF', generate: (d) => `site:*.${d} -www` },
  { id: 'cached', label: 'Cached/old', icon: Clock, color: '#94A3B8', generate: (d) => `cache:${d}` },
  { id: 'backup', label: 'Backup files', icon: HardDrive, color: '#FDE68A', generate: (d) => `site:${d} ext:bak|old|orig|save|swp|swo` },
  { id: 'api', label: 'API endpoints', icon: Plug, color: '#67E8F9', generate: (d) => `site:${d} inurl:api|rest|v1|v2|graphql` },
  { id: 'pastebin', label: 'Pastebin leaks', icon: ClipboardList, color: '#FCA5A5', generate: (d) => `site:pastebin.com "${d}"` },
  { id: 'ghsecrets', label: 'GitHub secrets', icon: Github, color: '#A5B4FC', generate: (d) => `site:github.com "${d}" password|secret|token|api_key` },
  { id: 'cloud', label: 'Cloud storage', icon: Cloud, color: '#6EE7B7', generate: (d) => `site:s3.amazonaws.com|blob.core.windows.net "${d}"` },
  { id: 'wordpress', label: 'WordPress', icon: LayoutGrid, color: '#7DD3FC', generate: (d) => `site:${d} inurl:wp-content|wp-admin|wp-includes` },
  { id: 'phpmyadmin', label: 'phpMyAdmin', icon: Database, color: '#F472B6', generate: (d) => `site:${d} inurl:phpmyadmin` },
  { id: 'envfile', label: 'Environment files', icon: Settings, color: '#86EFAC', generate: (d) => `site:${d} intitle:"Environment" filetype:env` },
  { id: 'gitexp', label: 'Exposed git', icon: GitBranch, color: '#FBBF24', generate: (d) => `site:${d} inurl:.git` },
  { id: 'openredir', label: 'Open redirects', icon: Link2, color: '#FB923C', generate: (d) => `site:${d} inurl:redirect|return|url=|next=` },
  { id: 'ssrf', label: 'SSRF candidates', icon: Network, color: '#C4B5FD', generate: (d) => `site:${d} inurl:url=|path=|src=|load=|fetch=` },
  { id: 'debug', label: 'Debug pages', icon: Bug, color: '#F9A8D4', generate: (d) => `site:${d} intext:"debug"|"phpinfo"|"test page"` },
  { id: 'logs', label: 'Exposed logs', icon: FileText, color: '#94A3B8', generate: (d) => `site:${d} ext:log|txt intext:error|exception|fatal` },
  { id: 'jwt', label: 'JWT tokens', icon: KeyRound, color: '#FDE047', generate: (d) => `site:${d} intext:"eyJ"` },
  { id: 'swagger', label: 'Swagger / API docs', icon: BookOpen, color: '#5EEAD4', generate: (d) => `site:${d} inurl:swagger|api-docs|openapi` },
];

// ─── OSINT TOOLS DIRECTORY ────────────────────────────
const toolCategories = {
  'Domains & IPs': [
    { name: 'Shodan', desc: 'Search engine for Internet-connected devices, open ports, and services', url: 'https://shodan.io', letter: 'S', color: '#F87171' },
    { name: 'Censys', desc: 'Internet-wide scanning platform for discovering hosts and services', url: 'https://censys.io', letter: 'C', color: '#A78BFA' },
    { name: 'VirusTotal', desc: 'Analyze domains, IPs, and files for malicious indicators', url: 'https://virustotal.com', letter: 'V', color: '#34D399' },
    { name: 'crt.sh', desc: 'Certificate transparency log search — find subdomains via SSL certs', url: 'https://crt.sh', letter: 'c', color: '#FBBF24' },
    { name: 'SecurityTrails', desc: 'Historical DNS data, WHOIS history, and subdomain enumeration', url: 'https://securitytrails.com', letter: 'S', color: '#7DD3FC' },
    { name: 'DNSDumpster', desc: 'Free domain research tool for DNS recon and mapping', url: 'https://dnsdumpster.com', letter: 'D', color: '#FB923C' },
  ],
  'Email & Username': [
    { name: 'theHarvester', desc: 'Gather emails, subdomains, hosts, and names from public sources', url: 'https://github.com/laramies/theHarvester', letter: 'H', color: '#34D399' },
    { name: 'Sherlock', desc: 'Hunt usernames across 400+ social networks simultaneously', url: 'https://github.com/sherlock-project/sherlock', letter: 'S', color: '#7DD3FC' },
    { name: 'Holehe', desc: 'Check if an email is registered on various websites', url: 'https://github.com/megadose/holehe', letter: 'H', color: '#E879F9' },
    { name: 'Have I Been Pwned', desc: 'Check if accounts have been compromised in data breaches', url: 'https://haveibeenpwned.com', letter: 'H', color: '#F87171' },
    { name: 'Hunter.io', desc: 'Find professional email addresses associated with a domain', url: 'https://hunter.io', letter: 'H', color: '#FB923C' },
  ],
  'Social Media': [
    { name: 'Maltego', desc: 'Visual link analysis and data mining for OSINT investigations', url: 'https://maltego.com', letter: 'M', color: '#FBBF24' },
    { name: 'SpiderFoot', desc: 'Automated OSINT collection with 200+ data source modules', url: 'https://spiderfoot.net', letter: 'S', color: '#F472B6' },
    { name: 'Recon-ng', desc: 'Full-featured web recon framework written in Python', url: 'https://github.com/lanmaster53/recon-ng', letter: 'R', color: '#34D399' },
    { name: 'Social Searcher', desc: 'Free social media search engine for public posts', url: 'https://social-searcher.com', letter: 'S', color: '#A78BFA' },
  ],
  'Search Engines': [
    { name: 'Google', desc: 'Advanced operators for targeted reconnaissance queries', url: 'https://google.com', letter: 'G', color: '#7DD3FC' },
    { name: 'Bing', desc: 'Alternative search engine with unique indexing and IP search', url: 'https://bing.com', letter: 'B', color: '#34D399' },
    { name: 'DuckDuckGo', desc: 'Privacy-focused search with bang shortcuts for recon', url: 'https://duckduckgo.com', letter: 'D', color: '#FB923C' },
    { name: 'Wayback Machine', desc: 'View archived snapshots of websites over time', url: 'https://web.archive.org', letter: 'W', color: '#FBBF24' },
    { name: 'IntelX', desc: 'Search engine for leaked data, darknet, and OSINT sources', url: 'https://intelx.io', letter: 'I', color: '#F87171' },
  ],
  Metadata: [
    { name: 'ExifTool', desc: 'Read, write, and edit metadata in images, documents, and media', url: 'https://exiftool.org', letter: 'E', color: '#A78BFA' },
    { name: 'FOCA', desc: 'Extract metadata and hidden info from documents (Office, PDF)', url: 'https://github.com/ElevenPaths/FOCA', letter: 'F', color: '#E879F9' },
    { name: 'Metagoofil', desc: 'Extract metadata from public documents found via Google', url: 'https://github.com/laramies/metagoofil', letter: 'M', color: '#34D399' },
    { name: 'Jeffrey Exif Viewer', desc: 'Online EXIF data viewer for uploaded images', url: 'http://exif.regex.info', letter: 'J', color: '#FBBF24' },
  ],
  'Vulnerability DBs': [
    { name: 'CVE Details', desc: 'Browse and search the CVE vulnerability database', url: 'https://cvedetails.com', letter: 'C', color: '#F87171' },
    { name: 'Exploit-DB', desc: 'Archive of public exploits and vulnerable software', url: 'https://exploit-db.com', letter: 'E', color: '#FB923C' },
    { name: 'NVD', desc: 'NIST National Vulnerability Database with CVSS scores', url: 'https://nvd.nist.gov', letter: 'N', color: '#7DD3FC' },
    { name: 'Vulners', desc: 'Vulnerability intelligence search engine and API', url: 'https://vulners.com', letter: 'V', color: '#34D399' },
    { name: 'Snyk Vuln DB', desc: 'Open source vulnerability database for dependencies', url: 'https://security.snyk.io', letter: 'S', color: '#A78BFA' },
  ],
};

const passiveSteps = [
  { title: 'WHOIS Lookup', desc: 'Identify domain registrant, registrar, nameservers, and creation/expiry dates', tools: 'whois target.com | host target.com' },
  { title: 'DNS Enumeration', desc: 'Discover DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) for the target', tools: 'dig any target.com | dnsenum target.com | fierce -dns target.com' },
  { title: 'Certificate Transparency', desc: 'Search CT logs to discover subdomains from issued SSL certificates', tools: 'crt.sh | censys.io | certspotter' },
  { title: 'Google Dorking', desc: 'Use advanced search operators to find exposed files, directories, and sensitive data', tools: 'site: filetype: inurl: intitle: intext: cache:' },
  { title: 'Social Media Recon', desc: 'Gather employee info, email patterns, tech stack clues from public profiles', tools: 'LinkedIn | Twitter/X | Sherlock | theHarvester' },
  { title: 'Wayback Machine', desc: 'Review archived versions of the target site for old endpoints, removed pages, and leaked info', tools: 'web.archive.org | waybackurls | gau' },
  { title: 'GitHub / Code Search', desc: 'Search for leaked credentials, API keys, internal URLs, and config files in public repos', tools: 'github.com/search | trufflehog | gitleaks | gitrob' },
  { title: 'Shodan / Censys', desc: 'Discover exposed services, open ports, banners, and technologies without active scanning', tools: 'shodan.io | censys.io | zoomeye.org' },
  { title: 'Email Harvesting', desc: 'Collect email addresses associated with the target domain', tools: 'theHarvester | hunter.io | phonebook.cz' },
];

const activeSteps = [
  { title: 'Port Scanning', desc: 'Identify open ports and running services on the target infrastructure', tools: 'nmap -sV -sC -p- target | masscan -p1-65535 target --rate=1000' },
  { title: 'Service Enumeration', desc: 'Fingerprint service versions and gather banner info for vulnerability mapping', tools: 'nmap -sV -A target | nc -nv target port | whatweb target' },
  { title: 'Directory Bruteforcing', desc: 'Discover hidden directories, files, and API endpoints on web servers', tools: 'gobuster dir -u target -w wordlist | feroxbuster | dirsearch' },
  { title: 'Virtual Host Discovery', desc: 'Find additional websites/apps hosted on the same IP via vhost enumeration', tools: 'gobuster vhost -u target -w vhosts.txt | ffuf -H "Host: FUZZ.target"' },
  { title: 'Parameter Discovery', desc: 'Find hidden GET/POST parameters for injection testing', tools: 'arjun -u target | paramspider -d target | ffuf -w params.txt' },
  { title: 'Technology Fingerprinting', desc: 'Identify web frameworks, CMS, server software, and JavaScript libraries', tools: 'wappalyzer | whatweb target | wafw00f target | builtwith.com' },
  { title: 'Subdomain Bruteforce', desc: 'Actively resolve potential subdomains from wordlists', tools: 'subfinder -d target | amass enum -d target | knockpy target' },
  { title: 'Vulnerability Scanning', desc: 'Run automated scans to detect known vulnerabilities in discovered services', tools: 'nikto -h target | nuclei -u target | nmap --script vuln target' },
];

// ─── HELPERS ──────────────────────────────────────────

function normalizeDomain(raw) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .toLowerCase();
}

function normalizeUrl(raw) {
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function parseHeaderSignature(sig) {
  const idx = sig.indexOf(': ');
  if (idx === -1) return null;
  return { name: sig.slice(0, idx).trim(), value: sig.slice(idx + 2).trim() };
}

function headerMatchesPattern(headersLower, sig) {
  const parsed = parseHeaderSignature(sig);
  if (parsed) {
    const hv = headersLower[parsed.name.toLowerCase()];
    if (!hv) return false;
    return hv.includes(parsed.value.toLowerCase());
  }
  if (sig.toLowerCase().startsWith('x-amz-')) {
    return Object.keys(headersLower).some((k) => k.startsWith('x-amz-'));
  }
  return false;
}

function analyzeTech(headers, body) {
  const headersLower = {};
  headers.forEach((h) => {
    headersLower[h.name.toLowerCase()] = (h.value || '').toLowerCase();
  });
  const bodyLower = (body || '').toLowerCase();
  const findings = [];
  const allHeaderStr = Object.entries(headersLower)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const bareHeaderName = (sig) => /^[\w-]+$/.test(sig) && !sig.includes(':');

  for (const [tech, sigs] of Object.entries(TECH_SIGNATURES)) {
    let best = null;
    for (const sig of sigs) {
      const parsed = parseHeaderSignature(sig);
      if (parsed) {
        if (headerMatchesPattern(headersLower, sig)) {
          best = { tech, confidence: 'high', reason: `Header · ${sig}` };
          break;
        }
      } else if (bareHeaderName(sig) && headersLower[sig.toLowerCase()]) {
        best = { tech, confidence: 'high', reason: `Header · ${sig} present` };
        break;
      } else if (sig.toLowerCase() === 'cf-ray' && headersLower['cf-ray']) {
        best = { tech, confidence: 'high', reason: 'Header · cf-ray present' };
        break;
      } else if (sig.toLowerCase() === 'x-amz-' && Object.keys(headersLower).some((k) => k.startsWith('x-amz-'))) {
        best = { tech, confidence: 'high', reason: 'Header · x-amz-*' };
        break;
      } else if (bodyLower.includes(sig.toLowerCase()) || allHeaderStr.includes(sig.toLowerCase())) {
        const inBody = bodyLower.includes(sig.toLowerCase());
        const conf = inBody ? 'medium' : 'low';
        if (!best) {
          best = { tech, confidence: conf, reason: inBody ? `Body · "${sig}"` : `Headers · "${sig}"` };
        }
      }
    }
    if (best) findings.push(best);
  }

  const dedup = new Map();
  findings.forEach((f) => {
    const prev = dedup.get(f.tech);
    if (!prev || (f.confidence === 'high' && prev.confidence !== 'high')) dedup.set(f.tech, f);
  });
  return Array.from(dedup.values()).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}

function collectInterestingHeaders(headerList) {
  return headerList.filter((h) => {
    const k = h.name.toLowerCase();
    return INTERESTING_HEADER_KEYS.includes(k) || k.startsWith('x-') || k === 'server' || k === 'via';
  });
}

function parseRdapSummary(data) {
  if (!data || typeof data !== 'object') return { rows: [], rawNote: null };
  const rows = [];

  if (Array.isArray(data.status) && data.status.length) {
    rows.push({ label: 'Status', value: data.status.join(', ') });
  }

  const events = data.events || [];
  events.forEach((ev) => {
    if (ev.eventAction && ev.eventDate) {
      rows.push({ label: ev.eventAction.replace(/_/g, ' '), value: ev.eventDate });
    }
  });

  const ns = data.nameservers || [];
  if (ns.length) {
    const names = ns.map((n) => n.ldhName || n.unicodeName || JSON.stringify(n)).filter(Boolean);
    if (names.length) rows.push({ label: 'Nameservers', value: names.join(', ') });
  }

  const entities = data.entities || [];
  entities.forEach((ent) => {
    const roles = ent.roles || [];
    if (roles.includes('registrar') || roles.includes('reseller')) {
      const vcard = ent.vcardArray;
      if (vcard && Array.isArray(vcard[1])) {
        const fn = vcard[1].find((row) => row[0] === 'fn');
        if (fn && fn[3]) rows.push({ label: 'Registrar (vcard)', value: fn[3] });
      }
      if (ent.handle) rows.push({ label: `${roles[0] || 'Entity'} handle`, value: ent.handle });
    }
  });

  if (data.port43) rows.push({ label: 'WHOIS port43', value: data.port43 });
  if (data.ldhName) rows.push({ label: 'Domain', value: data.ldhName });

  return { rows, rawNote: data.rdapConformance ? null : null };
}

function dnsAnswersToRows(json) {
  if (!json || json.Status !== 0) return [];
  const answers = json.Answer || json.answer || [];
  return answers.map((a) => ({
    name: a.name || '—',
    ttl: a.TTL ?? a.ttl ?? '—',
    data: a.data ?? a.rdata ?? JSON.stringify(a),
  }));
}

// ─── UI BITS ───────────────────────────────────────────

function SectionHeader({ icon: Icon, color, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>{title}</span>
    </div>
  );
}

function DorkButton({ template, onGenerate }) {
  const Icon = template.icon;
  return (
    <button
      type="button"
      onClick={() => onGenerate(template)}
      style={{
        background: '#161B28',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 8,
        padding: '10px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.15s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${template.color}40`;
        e.currentTarget.style.background = '#1A2035';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.background = '#161B28';
      }}
    >
      <Icon size={14} style={{ color: template.color, flexShrink: 0 }} />
      <span style={{ fontFamily: mono, fontSize: 11, color: '#D1D5DB', textAlign: 'left' }}>{template.label}</span>
    </button>
  );
}

function DorkResult({ dork }) {
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(dork)}`;
  return (
    <div
      style={{
        background: '#0B0F18',
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <pre
        style={{
          fontFamily: mono,
          fontSize: 12,
          color: '#7DD3FC',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          flex: 1,
          lineHeight: '20px',
        }}
      >
        {dork}
      </pre>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <CopyButton text={dork} />
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            borderRadius: 6,
            color: '#7DD3FC',
            transition: 'all 0.15s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(125,211,252,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Open in Google"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function ToolCard({ name, desc, url, letter, color, category }) {
  return (
    <div
      style={{
        background: '#161B28',
        borderRadius: 10,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: mono,
              fontSize: 14,
              fontWeight: 700,
              color,
              flexShrink: 0,
            }}
          >
            {letter}
          </div>
          <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{name}</span>
        </div>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: `${color}CC`,
            background: `${color}12`,
            border: `1px solid ${color}25`,
            borderRadius: 5,
            padding: '2px 7px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {category}
        </span>
      </div>
      <span style={{ fontFamily: mono, fontSize: 11, color: '#9CA3AF', lineHeight: '18px' }}>{desc}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: '#7DD3FC',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
        }}
      >
        <ExternalLink size={11} />
        {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </a>
    </div>
  );
}

function ReconStep({ step, index }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      style={{
        background: '#161B28',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        cursor: 'pointer',
        transition: 'all 0.15s',
        opacity: checked ? 0.5 : 1,
      }}
      onClick={() => setChecked(!checked)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setChecked((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div style={{ paddingTop: 1, flexShrink: 0 }}>
        {checked ? <CheckSquare size={16} style={{ color: '#6EE7B7' }} /> : <Square size={16} style={{ color: '#4B5563' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: heading,
            fontSize: 12,
            fontWeight: 600,
            color: checked ? '#6B7280' : '#E2E8F0',
            textDecoration: checked ? 'line-through' : 'none',
          }}
        >
          {index + 1}. {step.title}
        </span>
        <span style={{ fontFamily: mono, fontSize: 10, color: '#9CA3AF', lineHeight: '16px' }}>{step.desc}</span>
        <div
          style={{
            background: '#0B0F18',
            borderRadius: 6,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <pre
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: '#D1D5DB',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              flex: 1,
              lineHeight: '16px',
            }}
          >
            {step.tools}
          </pre>
          <CopyButton text={step.tools} />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: heading,
        fontSize: 12,
        fontWeight: 600,
        padding: '10px 14px',
        borderRadius: 8,
        border: active ? `1px solid ${ACCENT}55` : '1px solid rgba(255,255,255,0.06)',
        background: active ? 'rgba(56,189,248,0.12)' : '#12161F',
        color: active ? ACCENT : '#94A3B8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
      {label}
    </button>
  );
}

function ConfidenceBadge({ level }) {
  const colors = {
    high: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)', fg: '#6EE7B7' },
    medium: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', fg: '#FBBF24' },
    low: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', fg: '#94A3B8' },
  };
  const c = colors[level] || colors.low;
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '2px 8px',
        borderRadius: 5,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.fg,
      }}
    >
      {level}
    </span>
  );
}

// ─── MAIN ───────────────────────────────────────────────

export default function OSINT() {
  const [activeTab, setActiveTab] = useState('dorks');

  const [domain, setDomain] = useState('');
  const [generatedDorks, setGeneratedDorks] = useState([]);

  const [dnsInput, setDnsInput] = useState('');
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsByType, setDnsByType] = useState({});
  const [rdapRows, setRdapRows] = useState([]);
  const [dnsError, setDnsError] = useState('');

  const [subInput, setSubInput] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subRows, setSubRows] = useState([]);
  const [subFilter, setSubFilter] = useState('');
  const [subError, setSubError] = useState('');

  const [techUrl, setTechUrl] = useState('');
  const [techLoading, setTechLoading] = useState(false);
  const [techFindings, setTechFindings] = useState([]);
  const [techHeaders, setTechHeaders] = useState([]);
  const [techError, setTechError] = useState('');
  const [techNote, setTechNote] = useState('');

  const targetDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'target.com';

  const handleGenerateDork = (template) => {
    const dork = template.generate(targetDomain);
    setGeneratedDorks((prev) => {
      if (prev.some((d) => d.id === template.id)) {
        return prev.map((d) => (d.id === template.id ? { ...d, dork } : d));
      }
      return [...prev, { id: template.id, label: template.label, dork }];
    });
  };

  const handleGenerateAll = () => {
    setGeneratedDorks(
      dorkTemplates.map((t) => ({
        id: t.id,
        label: t.label,
        dork: t.generate(targetDomain),
      }))
    );
  };

  const runDnsLookup = useCallback(async () => {
    const d = normalizeDomain(dnsInput);
    if (!d) {
      setDnsError('Enter a domain.');
      return;
    }
    setDnsError('');
    setDnsLoading(true);
    setDnsByType({});
    setRdapRows([]);
    try {
      const results = {};
      await Promise.all(
        DNS_TYPES.map(async (type) => {
          const url = `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${type}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`DNS ${type}: HTTP ${res.status}`);
          const json = await res.json();
          results[type] = json;
        })
      );
      setDnsByType(results);

      const rdapRes = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`);
      if (rdapRes.ok) {
        const rdapJson = await rdapRes.json();
        const { rows } = parseRdapSummary(rdapJson);
        setRdapRows(rows);
      } else {
        setRdapRows([{ label: 'RDAP', value: `HTTP ${rdapRes.status} — open rdap.org in browser for this TLD` }]);
      }
    } catch (e) {
      setDnsError(e.message || String(e));
    } finally {
      setDnsLoading(false);
    }
  }, [dnsInput]);

  const guessRows = useMemo(() => {
    const d = normalizeDomain(subInput);
    if (!d) return [];
    return COMMON_SUBDOMAIN_PREFIXES.map((p) => ({
      subdomain: `${p}.${d}`,
      issuer: '—',
      not_before: '—',
      source: 'guess',
    }));
  }, [subInput]);

  const runSubdomainSearch = useCallback(async () => {
    const d = normalizeDomain(subInput);
    if (!d) {
      setSubError('Enter a domain.');
      return;
    }
    setSubError('');
    setSubLoading(true);
    setSubRows([]);
    try {
      const q = encodeURIComponent(`%.${d}`);
      const url = `https://crt.sh/?q=${q}&output=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`crt.sh HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected crt.sh response');

      const map = new Map();
      const root = d.toLowerCase();

      data.forEach((row) => {
        const issuer = row.issuer_name || '—';
        const nb = row.not_before || '—';
        const raw = row.name_value || '';
        raw.split('\n').forEach((line) => {
          let name = line.trim().toLowerCase();
          if (!name) return;
          if (name.startsWith('*.')) name = name.slice(2);
          if (name === root || name.endsWith(`.${root}`)) {
            const display = line.trim();
            const key = name;
            if (!map.has(key) || (nb !== '—' && map.get(key).not_before === '—')) {
              map.set(key, { subdomain: display, issuer, not_before: nb, source: 'ct' });
            }
          }
        });
      });

      const sorted = Array.from(map.values()).sort((a, b) => a.subdomain.localeCompare(b.subdomain));
      setSubRows(sorted);
    } catch (e) {
      setSubError(e.message || String(e));
    } finally {
      setSubLoading(false);
    }
  }, [subInput]);

  const filteredSubRows = useMemo(() => {
    const q = subFilter.trim().toLowerCase();
    if (!q) return subRows;
    return subRows.filter((r) => r.subdomain.toLowerCase().includes(q));
  }, [subRows, subFilter]);

  const copyAllSubdomains = () => {
    const text = filteredSubRows.map((r) => r.subdomain).join('\n');
    if (text) navigator.clipboard.writeText(text);
  };

  const runTechScan = useCallback(async () => {
    const u = normalizeUrl(techUrl);
    if (!u) {
      setTechError('Enter a URL.');
      return;
    }
    setTechError('');
    setTechNote('');
    setTechLoading(true);
    setTechFindings([]);
    setTechHeaders([]);
    try {
      const res = await fetch(u, {
        method: 'GET',
        redirect: 'follow',
        headers: { Accept: 'text/html,application/xhtml+xml,*/*' },
      });
      const headerList = [];
      res.headers.forEach((value, name) => {
        headerList.push({ name, value });
      });
      setTechHeaders(headerList);

      let body = '';
      try {
        body = await res.text();
      } catch (bodyErr) {
        setTechNote(`Body not fully readable: ${bodyErr.message || bodyErr}`);
      }

      const findings = analyzeTech(headerList, body);
      setTechFindings(findings);

      if (findings.length === 0) {
        setTechNote(
          (prev) =>
            prev ||
            'No signatures matched. Targets without CORS often hide headers/body from browsers — try DevTools Network on the site, or a same-origin URL.'
        );
      }
    } catch (e) {
      setTechError(
        e.message ||
          'Fetch failed (often CORS). Browsers only expose response details when the target sends Access-Control-Allow-Origin.'
      );
    } finally {
      setTechLoading(false);
    }
  }, [techUrl]);

  const interestingTechHeaders = useMemo(() => collectInterestingHeaders(techHeaders), [techHeaders]);

  const tabs = [
    { id: 'dorks', label: 'Google Dorks', icon: Search },
    { id: 'dns', label: 'DNS & WHOIS', icon: Server },
    { id: 'subs', label: 'Subdomains', icon: Layers },
    { id: 'tech', label: 'Tech Detector', icon: Cpu },
    { id: 'tools', label: 'Tool Directory', icon: Crosshair },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(56,189,248,0.15)',
            border: '1px solid rgba(56,189,248,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Globe size={18} style={{ color: ACCENT }} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: '#E2E8F0',
            margin: 0,
          }}
        >
          OSINT & Recon
        </h1>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: ACCENT,
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 5,
            padding: '3px 8px',
            fontWeight: 600,
          }}
        >
          live lookups + dorks
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          paddingBottom: 4,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map((t) => (
          <TabButton key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} icon={t.icon} label={t.label} />
        ))}
      </div>

      {activeTab === 'dorks' && (
        <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionHeader icon={Search} color="#7DD3FC" title="Google Dork Generator" />

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Input
                  label="Target Domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateAll}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0B0F18',
                  background: '#7DD3FC',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 18px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Generate All
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 8,
              }}
            >
              {dorkTemplates.map((t) => (
                <DorkButton key={t.id} template={t} onGenerate={handleGenerateDork} />
              ))}
            </div>

            {generatedDorks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    fontFamily: heading,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Generated Dorks — {targetDomain}
                </div>
                {generatedDorks.map((d) => (
                  <DorkResult key={d.id} dork={d.dork} />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'dns' && (
        <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHeader icon={Server} color="#67E8F9" title="DNS & RDAP / WHOIS-style" />
            <p style={{ fontFamily: mono, fontSize: 10, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Uses Google DNS JSON API and rdap.org (follows redirects to the correct registry). No API keys.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Input label="Domain" placeholder="example.com" value={dnsInput} onChange={(e) => setDnsInput(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button
                type="button"
                onClick={runDnsLookup}
                disabled={dnsLoading}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0B0F18',
                  background: '#67E8F9',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  cursor: dnsLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: dnsLoading ? 0.75 : 1,
                }}
              >
                {dnsLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Lookup
              </button>
            </div>
            {dnsError && (
              <div style={{ fontFamily: mono, fontSize: 11, color: '#F87171' }}>{dnsError}</div>
            )}

            {Object.keys(dnsByType).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DNS_TYPES.map((type) => {
                  const json = dnsByType[type];
                  const rows = dnsAnswersToRows(json);
                  const statusBad = json && json.Status !== 0;
                  return (
                    <div key={type}>
                      <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>{type} records</div>
                      {statusBad && (
                        <div style={{ fontFamily: mono, fontSize: 10, color: '#FBBF24' }}>Status {json.Status} (no data or NXDOMAIN)</div>
                      )}
                      {rows.length === 0 && !statusBad ? (
                        <div style={{ fontFamily: mono, fontSize: 10, color: '#64748B' }}>No answers</div>
                      ) : (
                        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                            <thead>
                              <tr style={{ background: '#161B28', color: '#9CA3AF', textAlign: 'left' }}>
                                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '8px 10px', fontWeight: 600 }}>TTL</th>
                                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => (
                                <tr key={`${type}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' }}>
                                  <td style={{ padding: '8px 10px', wordBreak: 'break-all' }}>{row.name}</td>
                                  <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{row.ttl}</td>
                                  <td style={{ padding: '8px 10px', wordBreak: 'break-all', color: '#7DD3FC' }}>{row.data}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {rdapRows.length > 0 && (
              <div>
                <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: '#A5B4FC', marginBottom: 8 }}>RDAP / registration</div>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#161B28', color: '#9CA3AF', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600, width: '28%' }}>Field</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rdapRows.map((row, i) => (
                        <tr key={`rdap-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' }}>
                          <td style={{ padding: '8px 10px', color: '#94A3B8', verticalAlign: 'top' }}>{row.label}</td>
                          <td style={{ padding: '8px 10px', wordBreak: 'break-word' }}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a
                    href={dnsInput.trim() ? `https://rdap.org/domain/${encodeURIComponent(normalizeDomain(dnsInput))}` : 'https://rdap.org'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: mono, fontSize: 10, color: '#A5B4FC' }}
                  >
                    Open RDAP JSON in browser
                    <ExternalLink size={10} style={{ display: 'inline', marginLeft: 4 }} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'subs' && (
        <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionHeader icon={Layers} color="#C4B5FD" title="Subdomain finder (Certificate Transparency)" />
            <p style={{ fontFamily: mono, fontSize: 10, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Queries crt.sh for <code style={{ color: '#94A3B8' }}>%.{`{domain}`}</code>. Deduped and sorted. Plus a static wordlist appended to your domain (guesses only — not DNS-verified).
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Input label="Domain" placeholder="example.com" value={subInput} onChange={(e) => setSubInput(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button
                type="button"
                onClick={runSubdomainSearch}
                disabled={subLoading}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0B0F18',
                  background: '#C4B5FD',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  cursor: subLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {subLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Search CT logs
              </button>
            </div>
            {subError && <div style={{ fontFamily: mono, fontSize: 11, color: '#F87171' }}>{subError}</div>}

            {subRows.length > 0 && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
                    Found {subRows.length} unique subdomains (CT)
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ minWidth: 160 }}>
                      <Input label="Filter" placeholder="contains…" value={subFilter} onChange={(e) => setSubFilter(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <button
                      type="button"
                      onClick={copyAllSubdomains}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#E2E8F0',
                        background: '#1E293B',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      Copy All ({filteredSubRows.length})
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#161B28', color: '#9CA3AF', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Subdomain</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Issuer</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>not_before</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubRows.map((row, i) => (
                        <tr key={`${row.subdomain}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' }}>
                          <td style={{ padding: '8px 10px', wordBreak: 'break-all', color: '#7DD3FC' }}>{row.subdomain}</td>
                          <td style={{ padding: '8px 10px', wordBreak: 'break-word', color: '#94A3B8', maxWidth: 280 }}>{row.issuer}</td>
                          <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{row.not_before}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <CopyButton text={row.subdomain} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {normalizeDomain(subInput) && guessRows.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Common subdomain guesses</div>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', maxHeight: 240, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#161B28' }}>
                      <tr style={{ color: '#9CA3AF', textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px', fontWeight: 600 }}>Guess</th>
                        <th style={{ padding: '6px 10px', fontWeight: 600 }}>Issuer</th>
                        <th style={{ padding: '6px 10px', fontWeight: 600 }}>not_before</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guessRows.map((row) => (
                        <tr key={row.subdomain} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#CBD5E1' }}>
                          <td style={{ padding: '6px 10px', wordBreak: 'break-all' }}>{row.subdomain}</td>
                          <td style={{ padding: '6px 10px', color: '#475569' }}>{row.issuer}</td>
                          <td style={{ padding: '6px 10px', color: '#475569' }}>{row.not_before}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'tech' && (
        <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionHeader icon={Cpu} color="#34D399" title="Tech stack detector" />
            <p style={{ fontFamily: mono, fontSize: 10, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Fetches the URL in-browser, reads visible headers and HTML when CORS allows. Many sites block cross-origin reads; when they do, use DevTools on that origin or a backend fetcher.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Input label="URL" placeholder="https://example.com" value={techUrl} onChange={(e) => setTechUrl(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button
                type="button"
                onClick={runTechScan}
                disabled={techLoading}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0B0F18',
                  background: '#34D399',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  cursor: techLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {techLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Analyze
              </button>
            </div>
            {techError && <div style={{ fontFamily: mono, fontSize: 11, color: '#F87171' }}>{techError}</div>}
            {techNote && !techError && <div style={{ fontFamily: mono, fontSize: 10, color: '#FBBF24' }}>{techNote}</div>}

            {techFindings.length > 0 && (
              <div>
                <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Detected technologies</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {techFindings.map((f) => (
                    <div
                      key={f.tech}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '10px 12px',
                        background: '#161B28',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{f.tech}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <ConfidenceBadge level={f.confidence} />
                        <span style={{ fontFamily: mono, fontSize: 10, color: '#64748B', maxWidth: 320, textAlign: 'right' }}>{f.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interestingTechHeaders.length > 0 && (
              <div>
                <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Interesting headers (visible to JS)</div>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: '#161B28', color: '#9CA3AF', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Header</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interestingTechHeaders.map((h) => (
                        <tr key={h.name} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' }}>
                          <td style={{ padding: '8px 10px', color: '#7DD3FC', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{h.name}</td>
                          <td style={{ padding: '8px 10px', wordBreak: 'break-all' }}>{h.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {techHeaders.length > 0 && interestingTechHeaders.length === 0 && !techError && (
              <div style={{ fontFamily: mono, fontSize: 10, color: '#64748B' }}>
                No interesting headers in the CORS-visible set. A permissive Access-Control-Expose-Headers would reveal Server, X-Powered-By, etc.
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
            <SectionHeader icon={Crosshair} color="#A78BFA" title="OSINT Tools Directory" />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(toolCategories).map(([category, tools]) => (
                <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      fontFamily: heading,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {category}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 10,
                    }}
                  >
                    {tools.map((tool) => (
                      <ToolCard key={tool.name} {...tool} category={category} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ background: '#0F141E', borderColor: 'rgba(255,255,255,0.06)' }}>
            <SectionHeader icon={Radar} color="#6EE7B7" title="Recon Methodology" />
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(110,231,183,0.15)',
                  }}
                >
                  <Eye size={14} style={{ color: '#6EE7B7' }} />
                  <span
                    style={{
                      fontFamily: heading,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#6EE7B7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Passive Recon
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 9, color: '#4B5563' }}>(no direct interaction)</span>
                </div>
                {passiveSteps.map((step, i) => (
                  <ReconStep key={step.title} step={step} index={i} />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(248,113,113,0.15)',
                  }}
                >
                  <Radar size={14} style={{ color: '#F87171' }} />
                  <span
                    style={{
                      fontFamily: heading,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#F87171',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Active Recon
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 9, color: '#4B5563' }}>(direct target interaction)</span>
                </div>
                {activeSteps.map((step, i) => (
                  <ReconStep key={step.title} step={step} index={i} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

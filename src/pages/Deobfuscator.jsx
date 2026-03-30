import { useState, useMemo, useCallback } from 'react';
import {
  Unplug, Code2, Globe, Search, Binary, Shuffle,
  Download, Play, RotateCcw, Eye,
  BarChart3, Hash, FileText, Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const accent = '#FBBF24';
const dimText = '#6B7280';
const labelStyle = {
  fontFamily: mono, fontSize: 10, fontWeight: 600,
  color: dimText, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const textareaStyle = {
  fontFamily: mono, fontSize: 12, lineHeight: 1.6,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6, padding: 12, color: '#E2E8F0', width: '100%',
  minHeight: 180, resize: 'vertical', outline: 'none',
};
const btnStyle = (active) => ({
  fontFamily: mono, fontSize: 11, fontWeight: 600,
  padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
  border: 'none', transition: 'all 0.15s',
  background: active ? accent : 'rgba(255,255,255,0.05)',
  color: active ? '#0F172A' : '#9CA3AF',
});
const smallBtn = {
  fontFamily: mono, fontSize: 11, padding: '5px 12px', borderRadius: 5,
  border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)',
  color: '#9CA3AF', transition: 'all 0.15s',
};
const toggleStyle = (on) => ({
  fontFamily: mono, fontSize: 10, padding: '3px 10px', borderRadius: 4,
  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  background: on ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
  color: on ? accent : '#6B7280',
});
const sectionTitle = {
  fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#CBD5E1',
  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
};

const TABS = [
  { id: 'js', label: 'JavaScript', icon: Code2 },
  { id: 'html', label: 'HTML/PHP', icon: Globe },
  { id: 'strings', label: 'String Analysis', icon: Search },
  { id: 'hex', label: 'Hex/Binary', icon: Binary },
  { id: 'reverse', label: 'Code Reverser', icon: Shuffle },
];

/* ─── SYNTAX HIGHLIGHTER ─── */
function highlightJS(code) {
  const parts = [];
  const kw = /\b(function|var|let|const|if|else|for|while|do|return|new|this|class|extends|import|export|default|switch|case|break|continue|throw|try|catch|finally|typeof|instanceof|void|delete|in|of|async|await|yield|null|undefined|true|false)\b/g;
  const str = /(["'`])(?:\\.|(?!\1)[^\\])*\1/g;
  const num = /\b(0x[\da-fA-F]+|0o[0-7]+|0b[01]+|\d+\.?\d*(?:e[+-]?\d+)?)\b/g;
  const cmt = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

  const tokens = [];
  for (const re of [cmt, str, kw, num]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code))) {
      tokens.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: re === kw ? 'kw' : re === str ? 'str' : re === num ? 'num' : 'cmt' });
    }
  }
  tokens.sort((a, b) => a.start - b.start);

  const colors = { kw: '#C4B5FD', str: '#6EE7B7', num: '#FBBF24', cmt: '#4B5563' };
  let pos = 0;
  const used = [];
  for (const t of tokens) {
    if (t.start < pos) continue;
    if (t.start > pos) parts.push(<span key={`p${pos}`}>{code.slice(pos, t.start)}</span>);
    parts.push(<span key={`t${t.start}`} style={{ color: colors[t.type] }}>{t.text}</span>);
    pos = t.end;
    used.push(t);
  }
  if (pos < code.length) parts.push(<span key="end">{code.slice(pos)}</span>);
  return parts;
}

/* ─── JS TRANSFORMS ─── */
function beautifyJS(code) {
  let depth = 0;
  let result = '';
  let inStr = false;
  let strChar = '';
  const indent = () => '  '.repeat(depth);

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : '';

    if (inStr) {
      result += ch;
      if (ch === strChar && prev !== '\\') inStr = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = true;
      strChar = ch;
      result += ch;
    } else if (ch === '{') {
      depth++;
      result += ' {\n' + indent();
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
      result = result.replace(/\s+$/, '');
      result += '\n' + indent() + '}';
      if (i + 1 < code.length && code[i + 1] !== ';' && code[i + 1] !== ',' && code[i + 1] !== ')') {
        result += '\n' + indent();
      }
    } else if (ch === ';') {
      result += ';\n' + indent();
    } else if (ch === '\n' || ch === '\r') {
      continue;
    } else {
      result += ch;
    }
  }
  return result.replace(/^\s*\n/gm, '').replace(/[ \t]+$/gm, '');
}

function reconstructStrings(code) {
  return code
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\([0-3]?[0-7]{1,2})/g, (m, oct) => {
      const v = parseInt(oct, 8);
      return v > 0 && v < 128 ? String.fromCharCode(v) : m;
    });
}

function unwrapEval(code) {
  return code.replace(/\beval\s*\(\s*/g, '/* eval unwrapped */ (');
}

function simplifyArrayDeref(code) {
  return code.replace(/(_0x[a-fA-F0-9]+)\[['"](\w+)['"]\]/g, (_, obj, prop) => `${obj}.${prop}`);
}

function removeDeadCode(code) {
  return code
    .replace(/if\s*\(\s*false\s*\)\s*\{[^}]*\}/g, '')
    .replace(/if\s*\(\s*!1\s*\)\s*\{[^}]*\}/g, '')
    .replace(/\{\s*\}/g, '{}')
    .replace(/;{2,}/g, ';');
}

function foldConstants(code) {
  code = code.replace(/\b0x([0-9a-fA-F]+)\b/g, (_, h) => String(parseInt(h, 16)));
  code = code.replace(/(\d+)\s*\+\s*(\d+)/g, (_, a, b) => String(Number(a) + Number(b)));
  code = code.replace(/(\d+)\s*\*\s*(\d+)/g, (_, a, b) => String(Number(a) * Number(b)));
  code = code.replace(/(\d+)\s*-\s*(\d+)/g, (_, a, b) => String(Number(a) - Number(b)));
  code = code.replace(/(["'`])([^"'`]*)\1\s*\+\s*(["'`])([^"'`]*)\3/g, (_, q1, s1, _q2, s2) => `${q1}${s1}${s2}${q1}`);
  return code;
}

function resolveCharCodes(code) {
  code = code.replace(/String\.fromCharCode\(([^)]+)\)/g, (_, args) => {
    try {
      const chars = args.split(',').map(a => parseInt(a.trim(), 10));
      if (chars.some(isNaN)) return _;
      return `"${chars.map(c => String.fromCharCode(c)).join('')}"`;
    } catch { return _; }
  });
  code = code.replace(/parseInt\(\s*["']([0-9a-fA-F]+)["']\s*,\s*16\s*\)/g, (_, hex) => String(parseInt(hex, 16)));
  return code;
}

const JS_TRANSFORMS = [
  { id: 'beautify', label: 'Beautify/Format', fn: beautifyJS },
  { id: 'strings', label: 'String Reconstruction', fn: reconstructStrings },
  { id: 'eval', label: 'Eval Unwrap', fn: unwrapEval },
  { id: 'arrayderef', label: 'Array Deref Simplify', fn: simplifyArrayDeref },
  { id: 'deadcode', label: 'Dead Code Removal', fn: removeDeadCode },
  { id: 'fold', label: 'Constant Folding', fn: foldConstants },
  { id: 'charcode', label: 'CharCode Resolution', fn: resolveCharCodes },
];

/* ─── HTML/PHP TRANSFORMS ─── */
function decodeHTMLEntities(code) {
  const el = document.createElement('textarea');
  el.innerHTML = code;
  return el.value;
}

function unescapeScriptJS(code) {
  return code.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, body, close) => {
    try {
      const decoded = body
        .replace(/\\x([0-9a-fA-F]{2})/g, (__, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (__, h) => String.fromCharCode(parseInt(h, 16)));
      return open + decoded + close;
    } catch { return _; }
  });
}

function decodeBase64Calls(code) {
  return code.replace(/base64_decode\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)/g, (_, b) => {
    try { return `"${atob(b)}"`; } catch { return _; }
  });
}

function beautifyHTML(code) {
  let depth = 0;
  const lines = code.replace(/>\s*</g, '>\n<').split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('</')) depth = Math.max(0, depth - 1);
    const out = '  '.repeat(depth) + trimmed;
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
      if (!/^<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)\b/i.test(trimmed)) depth++;
    }
    return out;
  }).join('\n');
}

function extractURLs(code) {
  const urlRe = /https?:\/\/[^\s"'<>`]+/g;
  return [...new Set(code.match(urlRe) || [])];
}

function extractScripts(code) {
  const scripts = [];
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(code))) scripts.push(m[1].trim());
  return scripts.filter(Boolean);
}

/* ─── STRING ANALYSIS ─── */
function detectCharset(text) {
  const sets = [];
  if (/^[\x00-\x7F]*$/.test(text)) sets.push('ASCII');
  if (/[À-ÿ]/.test(text)) sets.push('Latin Extended');
  if (/[\u0400-\u04FF]/.test(text)) sets.push('Cyrillic');
  if (/[\u4E00-\u9FFF]/.test(text)) sets.push('CJK');
  if (/[\u0600-\u06FF]/.test(text)) sets.push('Arabic');
  if (/[\u3040-\u30FF]/.test(text)) sets.push('Japanese');
  if (/[\uAC00-\uD7AF]/.test(text)) sets.push('Korean');
  if (/[\u0370-\u03FF]/.test(text)) sets.push('Greek');
  if (sets.length === 0) sets.push('UTF-8 (mixed)');
  return sets;
}

function shannonEntropy(text) {
  if (!text.length) return 0;
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  let e = 0;
  for (const k in freq) {
    const p = freq[k] / text.length;
    e -= p * Math.log2(p);
  }
  return e;
}

function extractEmbeddedStrings(text) {
  const results = { strings: [], base64: [], urls: [], emails: [], ips: [], paths: [] };
  const strRe = /(["'])(?:\\.|(?!\1)[^\\])*\1/g;
  let m;
  while ((m = strRe.exec(text))) results.strings.push(m[0]);
  const b64Re = /[A-Za-z0-9+/]{20,}={0,2}/g;
  while ((m = b64Re.exec(text))) results.base64.push(m[0]);
  const urlRe = /https?:\/\/[^\s"'<>]+/g;
  while ((m = urlRe.exec(text))) results.urls.push(m[0]);
  const emailRe = /[\w.-]+@[\w.-]+\.\w{2,}/g;
  while ((m = emailRe.exec(text))) results.emails.push(m[0]);
  const ipRe = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  while ((m = ipRe.exec(text))) results.ips.push(m[0]);
  const pathRe = /(?:\/[\w.-]+){2,}/g;
  while ((m = pathRe.exec(text))) results.paths.push(m[0]);
  return results;
}

function detectPatterns(text) {
  const patterns = [];
  if (/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text)) patterns.push('JWT Token');
  if (/AKIA[0-9A-Z]{16}/.test(text)) patterns.push('AWS Access Key');
  if (/[a-fA-F0-9]{32}/.test(text)) patterns.push('MD5 Hash');
  if (/[a-fA-F0-9]{40}/.test(text)) patterns.push('SHA1 Hash');
  if (/[a-fA-F0-9]{64}/.test(text)) patterns.push('SHA256 Hash');
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text)) patterns.push('UUID');
  if (/(?:sk|pk)[-_](?:test|live)[-_][a-zA-Z0-9]{10,}/.test(text)) patterns.push('Stripe Key');
  if (/ghp_[a-zA-Z0-9]{36}/.test(text)) patterns.push('GitHub PAT');
  if (/xox[bpas]-[a-zA-Z0-9-]+/.test(text)) patterns.push('Slack Token');
  if (/AIza[0-9A-Za-z_-]{35}/.test(text)) patterns.push('Google API Key');
  return patterns;
}

function charFrequency(text) {
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([ch, count]) => ({
      char: ch === ' ' ? '␣' : ch === '\n' ? '↵' : ch === '\t' ? '⇥' : ch,
      code: ch.charCodeAt(0),
      count,
      pct: ((count / text.length) * 100).toFixed(1),
    }));
}

/* ─── HEX/BINARY ─── */
function parseHexInput(input) {
  const cleaned = input.replace(/[^0-9a-fA-F]/g, '');
  const bytes = [];
  for (let i = 0; i < cleaned.length - 1; i += 2) {
    bytes.push(parseInt(cleaned.substr(i, 2), 16));
  }
  return bytes;
}

function formatByte(b, mode) {
  switch (mode) {
    case 'hex': return b.toString(16).padStart(2, '0');
    case 'dec': return b.toString(10).padStart(3, ' ');
    case 'oct': return b.toString(8).padStart(3, '0');
    case 'bin': return b.toString(2).padStart(8, '0');
    default: return b.toString(16).padStart(2, '0');
  }
}

/* ─── CODE REVERSER ─── */
function decodeJSFuck(code) {
  try {
    const safeCode = code.replace(/[^[\]()!+]/g, '');
    if (safeCode.length < 5) return 'Input too short';
    const fn = new Function(`return String(${safeCode})`);
    return fn();
  } catch (e) {
    return `Decode error: ${e.message}`;
  }
}

function runBrainfuck(code, inputStr = '') {
  const tape = new Array(30000).fill(0);
  let ptr = 0, pc = 0, ic = 0, out = '';
  const ops = code.replace(/[^><+\-.,[\]]/g, '');
  const loops = {};
  const stack = [];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '[') stack.push(i);
    else if (ops[i] === ']') { const j = stack.pop(); loops[j] = i; loops[i] = j; }
  }
  let steps = 0;
  while (pc < ops.length && steps++ < 1000000) {
    switch (ops[pc]) {
      case '>': ptr++; break;
      case '<': ptr--; break;
      case '+': tape[ptr] = (tape[ptr] + 1) & 255; break;
      case '-': tape[ptr] = (tape[ptr] - 1 + 256) & 255; break;
      case '.': out += String.fromCharCode(tape[ptr]); break;
      case ',': tape[ptr] = ic < inputStr.length ? inputStr.charCodeAt(ic++) : 0; break;
      case '[': if (tape[ptr] === 0) pc = loops[pc]; break;
      case ']': if (tape[ptr] !== 0) pc = loops[pc]; break;
    }
    pc++;
  }
  return { output: out, tape: tape.slice(0, Math.max(ptr + 10, 20)), ptr };
}

function ookToBF(code) {
  const tokens = code.match(/Ook[.!?]/g);
  if (!tokens || tokens.length % 2 !== 0) return '';
  let bf = '';
  for (let i = 0; i < tokens.length; i += 2) {
    const pair = tokens[i] + ' ' + tokens[i + 1];
    const map = {
      'Ook. Ook.': '', 'Ook. Ook?': '[', 'Ook? Ook.': ']',
      'Ook! Ook!': '.', 'Ook! Ook.': '<', 'Ook. Ook!': '>',
      'Ook! Ook?': '-', 'Ook? Ook!': '+', 'Ook? Ook?': ',',
    };
    bf += map[pair] || '';
  }
  return bf;
}

function tryBaseDecodes(input) {
  const results = {};
  try { results.base64 = atob(input.trim()); } catch { results.base64 = null; }
  try {
    const hex = input.trim().replace(/\s/g, '');
    if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0) {
      let str = '';
      for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      results.base16 = str;
    }
  } catch { results.base16 = null; }

  const b32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  try {
    const clean = input.trim().replace(/=/g, '').toUpperCase();
    if (/^[A-Z2-7]+$/.test(clean)) {
      let bits = '';
      for (const c of clean) bits += b32Alphabet.indexOf(c).toString(2).padStart(5, '0');
      let str = '';
      for (let i = 0; i + 8 <= bits.length; i += 8) str += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
      results.base32 = str;
    }
  } catch { results.base32 = null; }

  const b58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  try {
    const clean = input.trim();
    if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(clean)) {
      let num = 0n;
      for (const c of clean) num = num * 58n + BigInt(b58Alphabet.indexOf(c));
      let hex = num.toString(16);
      if (hex.length % 2) hex = '0' + hex;
      let str = '';
      for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      results.base58 = str;
    }
  } catch { results.base58 = null; }

  const b85Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';
  try {
    const clean = input.trim().replace(/<~|~>/g, '');
    if (clean.length >= 5) {
      const bytes = [];
      for (let i = 0; i < clean.length; i += 5) {
        const chunk = clean.substr(i, 5);
        let val = 0;
        for (const c of chunk) val = val * 85 + b85Chars.indexOf(c);
        const n = chunk.length === 5 ? 4 : chunk.length - 1;
        for (let j = 3; j >= 4 - n; j--) bytes.push((val >> (j * 8)) & 0xFF);
      }
      results.base85 = bytes.map(b => String.fromCharCode(b)).join('');
    }
  } catch { results.base85 = null; }

  return results;
}

function rotBruteforce(text) {
  const results = [];
  for (let r = 1; r <= 25; r++) {
    const shifted = text.replace(/[a-zA-Z]/g, ch => {
      const base = ch >= 'a' ? 97 : 65;
      return String.fromCharCode(((ch.charCodeAt(0) - base + r) % 26) + base);
    });
    results.push({ rot: r, text: shifted });
  }
  return results;
}

/* ─── TAB COMPONENTS ─── */

function JSTab() {
  const [input, setInput] = useState('');
  const [toggles, setToggles] = useState(() => Object.fromEntries(JS_TRANSFORMS.map(t => [t.id, true])));

  const output = useMemo(() => {
    let code = input;
    for (const t of JS_TRANSFORMS) {
      if (toggles[t.id]) code = t.fn(code);
    }
    return code;
  }, [input, toggles]);

  const downloadJS = useCallback(() => {
    const blob = new Blob([output], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deobfuscated.js'; a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Obfuscated Input</div>
        <textarea
          style={textareaStyle}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste obfuscated JavaScript here..."
          spellCheck={false}
        />
      </Card>

      <Card>
        <div style={{ ...labelStyle, marginBottom: 10 }}>Transforms</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {JS_TRANSFORMS.map(t => (
            <button
              key={t.id}
              style={toggleStyle(toggles[t.id])}
              onClick={() => setToggles(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
            >{t.label}</button>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={labelStyle}>Deobfuscated Output</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <CopyButton text={output} />
            <button style={smallBtn} onClick={downloadJS}>
              <Download size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              .js
            </button>
          </div>
        </div>
        <pre style={{
          ...textareaStyle, minHeight: 200, overflow: 'auto',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {output ? highlightJS(output) : <span style={{ color: '#4B5563' }}>Output will appear here...</span>}
        </pre>
      </Card>
    </div>
  );
}

function HTMLTab() {
  const [input, setInput] = useState('');
  const [processed, urls, scripts] = useMemo(() => {
    let code = input;
    code = decodeHTMLEntities(code);
    code = unescapeScriptJS(code);
    code = decodeBase64Calls(code);
    code = beautifyHTML(code);
    return [code, extractURLs(code), extractScripts(input)];
  }, [input]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ ...labelStyle, marginBottom: 8 }}>HTML / PHP Input</div>
        <textarea style={textareaStyle} value={input} onChange={e => setInput(e.target.value)}
          placeholder="Paste obfuscated HTML or PHP here..." spellCheck={false} />
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={labelStyle}>Deobfuscated Output</div>
          <CopyButton text={processed} />
        </div>
        <pre style={{ ...textareaStyle, minHeight: 180, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
          {processed || <span style={{ color: '#4B5563' }}>Output will appear here...</span>}
        </pre>
      </Card>

      {urls.length > 0 && (
        <Card>
          <div style={sectionTitle}><Globe size={13} /> Extracted URLs ({urls.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {urls.map((u, i) => (
              <div key={i} style={{ fontFamily: mono, fontSize: 11, color: '#6EE7B7', padding: '3px 8px',
                background: 'rgba(110,231,183,0.06)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u}</span>
                <CopyButton text={u} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {scripts.length > 0 && (
        <Card>
          <div style={sectionTitle}><Code2 size={13} /> Extracted Scripts ({scripts.length})</div>
          {scripts.map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: dimText }}>Script {i + 1}</span>
                <CopyButton text={s} />
              </div>
              <pre style={{ ...textareaStyle, minHeight: 60, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 11 }}>
                {highlightJS(s)}
              </pre>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function StringsTab() {
  const [input, setInput] = useState('');

  const analysis = useMemo(() => {
    if (!input) return null;
    return {
      charsets: detectCharset(input),
      entropy: shannonEntropy(input),
      lineEntropies: input.split('\n').filter(Boolean).map((line, i) => ({
        line: i + 1, entropy: shannonEntropy(line), preview: line.slice(0, 60),
      })),
      embedded: extractEmbeddedStrings(input),
      patterns: detectPatterns(input),
      freq: charFrequency(input),
    };
  }, [input]);

  const maxFreq = analysis ? Math.max(...analysis.freq.map(f => f.count)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Input Text / Code</div>
        <textarea style={textareaStyle} value={input} onChange={e => setInput(e.target.value)}
          placeholder="Paste any text or code for analysis..." spellCheck={false} />
      </Card>

      {analysis && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Card>
              <div style={sectionTitle}><FileText size={13} /> Charset Detection</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysis.charsets.map(cs => (
                  <span key={cs} style={{ fontFamily: mono, fontSize: 11, color: accent,
                    background: 'rgba(251,191,36,0.1)', padding: '3px 10px', borderRadius: 4 }}>{cs}</span>
                ))}
              </div>
            </Card>

            <Card>
              <div style={sectionTitle}><BarChart3 size={13} /> Entropy</div>
              <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: accent }}>
                {analysis.entropy.toFixed(4)}
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: dimText, marginTop: 2 }}>
                {analysis.entropy < 3 ? 'Low — structured/repetitive' :
                 analysis.entropy < 5 ? 'Medium — natural text' :
                 analysis.entropy < 6.5 ? 'High — compressed/encoded' : 'Very high — encrypted/random'}
              </div>
            </Card>
          </div>

          {analysis.patterns.length > 0 && (
            <Card>
              <div style={sectionTitle}><Zap size={13} /> Pattern Detection</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysis.patterns.map(p => (
                  <span key={p} style={{ fontFamily: mono, fontSize: 11, color: '#F87171',
                    background: 'rgba(248,113,113,0.1)', padding: '3px 10px', borderRadius: 4 }}>⚠ {p}</span>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div style={sectionTitle}><Search size={13} /> Embedded Strings</div>
            {Object.entries(analysis.embedded).map(([type, items]) => items.length > 0 && (
              <div key={type} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: dimText, textTransform: 'uppercase', marginBottom: 4 }}>
                  {type} ({items.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {items.slice(0, 20).map((item, i) => (
                    <div key={i} style={{ fontFamily: mono, fontSize: 11, color: '#CBD5E1',
                      background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</div>
                  ))}
                  {items.length > 20 && <div style={{ fontFamily: mono, fontSize: 10, color: dimText }}>...and {items.length - 20} more</div>}
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={sectionTitle}><Hash size={13} /> Character Frequency</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
              {analysis.freq.map(f => (
                <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, fontSize: 11 }}>
                  <span style={{ color: accent, width: 20, textAlign: 'center' }}>{f.char}</span>
                  <span style={{ color: '#4B5563', fontSize: 9, width: 30 }}>0x{f.code.toString(16).padStart(2, '0')}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(f.count / maxFreq) * 100}%`, height: '100%', background: accent, borderRadius: 4, opacity: 0.6 }} />
                  </div>
                  <span style={{ color: '#9CA3AF', width: 45, textAlign: 'right' }}>{f.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={sectionTitle}><BarChart3 size={13} /> Per-Line Entropy</div>
            <div style={{ maxHeight: 250, overflow: 'auto' }}>
              {analysis.lineEntropies.slice(0, 50).map(le => (
                <div key={le.line} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', fontFamily: mono, fontSize: 10 }}>
                  <span style={{ color: dimText, width: 30, textAlign: 'right' }}>L{le.line}</span>
                  <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min((le.entropy / 8) * 100, 100)}%`, height: '100%', borderRadius: 3,
                      background: le.entropy > 6 ? '#F87171' : le.entropy > 4 ? accent : '#6EE7B7',
                    }} />
                  </div>
                  <span style={{ color: '#9CA3AF', width: 35 }}>{le.entropy.toFixed(2)}</span>
                  <span style={{ color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{le.preview}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function HexTab() {
  const [input, setInput] = useState('');
  const [displayMode, setDisplayMode] = useState('hex');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedByte, setSelectedByte] = useState(null);

  const bytes = useMemo(() => parseHexInput(input), [input]);

  const filteredIndices = useMemo(() => {
    if (!searchTerm) return null;
    const searchBytes = parseHexInput(searchTerm);
    if (searchBytes.length === 0) return null;
    const indices = new Set();
    for (let i = 0; i <= bytes.length - searchBytes.length; i++) {
      if (searchBytes.every((b, j) => bytes[i + j] === b)) {
        for (let j = 0; j < searchBytes.length; j++) indices.add(i + j);
      }
    }
    return indices;
  }, [bytes, searchTerm]);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < bytes.length; i += 16) {
      result.push({
        offset: i,
        bytes: bytes.slice(i, i + 16),
        startIdx: i,
      });
    }
    return result;
  }, [bytes]);

  const modes = ['hex', 'dec', 'oct', 'bin'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Hex / Binary Input</div>
        <textarea style={textareaStyle} value={input} onChange={e => setInput(e.target.value)}
          placeholder="Paste hex dump (e.g. 48 65 6c 6c 6f 20 57 6f 72 6c 64)..." spellCheck={false} />
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {modes.map(m => (
              <button key={m} style={toggleStyle(displayMode === m)}
                onClick={() => setDisplayMode(m)}>{m.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={12} style={{ color: dimText }} />
            <input
              style={{ ...textareaStyle, minHeight: 'unset', padding: '4px 10px', width: 140, fontSize: 11 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search hex..."
            />
          </div>
        </div>

        {bytes.length > 0 && (
          <div style={{ fontFamily: mono, fontSize: 11, overflow: 'auto', maxHeight: 400 }}>
            <div style={{ display: 'flex', gap: 16, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
              <span style={{ color: dimText, width: 70, flexShrink: 0 }}>Offset</span>
              <span style={{ color: dimText, flex: 1 }}>{displayMode.toUpperCase()} Bytes</span>
              <span style={{ color: dimText, width: 170, flexShrink: 0 }}>ASCII</span>
            </div>
            {rows.map(row => (
              <div key={row.offset} style={{ display: 'flex', gap: 16, padding: '2px 0', lineHeight: 1.8 }}>
                <span style={{ color: '#7DD3FC', width: 70, flexShrink: 0 }}>
                  {row.offset.toString(16).padStart(8, '0')}
                </span>
                <span style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: displayMode === 'bin' ? 4 : 6 }}>
                  {row.bytes.map((b, j) => {
                    const idx = row.startIdx + j;
                    const isMatch = filteredIndices && filteredIndices.has(idx);
                    const isSelected = selectedByte === idx;
                    return (
                      <span key={j}
                        onClick={() => setSelectedByte(isSelected ? null : idx)}
                        style={{
                          cursor: 'pointer', borderRadius: 2, padding: '0 2px',
                          background: isSelected ? 'rgba(251,191,36,0.25)' : isMatch ? 'rgba(110,231,183,0.15)' : 'transparent',
                          color: isMatch ? '#6EE7B7' : b >= 32 && b < 127 ? '#E2E8F0' : '#F87171',
                        }}>
                        {formatByte(b, displayMode)}
                      </span>
                    );
                  })}
                </span>
                <span style={{ width: 170, flexShrink: 0 }}>
                  {row.bytes.map((b, j) => {
                    const idx = row.startIdx + j;
                    const isSelected = selectedByte === idx;
                    const ch = b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
                    return (
                      <span key={j} style={{
                        color: b >= 32 && b < 127 ? '#6EE7B7' : '#4B5563',
                        background: isSelected ? 'rgba(251,191,36,0.25)' : 'transparent',
                        borderRadius: 2,
                      }}>{ch}</span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedByte !== null && selectedByte < bytes.length && (
        <Card>
          <div style={sectionTitle}><Eye size={13} /> Byte Inspector — Offset 0x{selectedByte.toString(16).padStart(2, '0')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'HEX', value: '0x' + bytes[selectedByte].toString(16).padStart(2, '0').toUpperCase() },
              { label: 'DEC', value: bytes[selectedByte].toString(10) },
              { label: 'OCT', value: '0o' + bytes[selectedByte].toString(8).padStart(3, '0') },
              { label: 'BIN', value: bytes[selectedByte].toString(2).padStart(8, '0') },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: dimText, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: accent }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontFamily: mono, fontSize: 12, color: '#CBD5E1' }}>
            ASCII: {bytes[selectedByte] >= 32 && bytes[selectedByte] < 127
              ? `"${String.fromCharCode(bytes[selectedByte])}"` : '(non-printable)'}
          </div>
        </Card>
      )}
    </div>
  );
}

function ReverseTab() {
  const [subTab, setSubTab] = useState('jsfuck');
  const [input, setInput] = useState('');
  const [bfInput, setBfInput] = useState('');

  const result = useMemo(() => {
    if (!input) return null;
    switch (subTab) {
      case 'jsfuck': return { text: decodeJSFuck(input) };
      case 'brainfuck': return runBrainfuck(input, bfInput);
      case 'ook': {
        const bf = ookToBF(input);
        if (!bf) return { output: 'Invalid Ook! code', tape: [], ptr: 0, bf };
        const r = runBrainfuck(bf);
        return { ...r, bf };
      }
      case 'base': return tryBaseDecodes(input);
      case 'rot': return rotBruteforce(input);
      default: return null;
    }
  }, [input, subTab, bfInput]);

  const subTabs = [
    { id: 'jsfuck', label: 'JSFuck' },
    { id: 'brainfuck', label: 'Brainfuck' },
    { id: 'ook', label: 'Ook!' },
    { id: 'base', label: 'Base-N' },
    { id: 'rot', label: 'ROT' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {subTabs.map(t => (
            <button key={t.id} style={toggleStyle(subTab === t.id)}
              onClick={() => { setSubTab(t.id); setInput(''); }}>{t.label}</button>
          ))}
        </div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>
          {{
            jsfuck: 'JSFuck Code', brainfuck: 'Brainfuck Code', ook: 'Ook! Code',
            base: 'Encoded String', rot: 'Ciphertext',
          }[subTab]}
        </div>
        <textarea style={textareaStyle} value={input} onChange={e => setInput(e.target.value)}
          placeholder={{
            jsfuck: 'Paste JSFuck code ([][(![]+[])...)...',
            brainfuck: 'Paste Brainfuck code (+-><.,[]...',
            ook: 'Paste Ook! code (Ook. Ook! Ook? ...)',
            base: 'Paste encoded string to try all base decodings...',
            rot: 'Paste ciphertext to see all ROT shifts...',
          }[subTab]}
          spellCheck={false}
        />
        {subTab === 'brainfuck' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...labelStyle, marginBottom: 4 }}>Program Input (stdin)</div>
            <input style={{ ...textareaStyle, minHeight: 'unset', padding: '6px 10px' }}
              value={bfInput} onChange={e => setBfInput(e.target.value)} placeholder="Optional input for , commands" />
          </div>
        )}
      </Card>

      {result && (
        <>
          {subTab === 'jsfuck' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={sectionTitle}><Zap size={13} /> Decoded Output</div>
                <CopyButton text={result.text} />
              </div>
              <pre style={{ ...textareaStyle, minHeight: 80, whiteSpace: 'pre-wrap' }}>{result.text}</pre>
            </Card>
          )}

          {(subTab === 'brainfuck' || subTab === 'ook') && (
            <>
              {subTab === 'ook' && result.bf && (
                <Card>
                  <div style={sectionTitle}><Code2 size={13} /> Brainfuck Translation</div>
                  <pre style={{ fontFamily: mono, fontSize: 11, color: '#CBD5E1', wordBreak: 'break-all' }}>{result.bf}</pre>
                </Card>
              )}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={sectionTitle}><Play size={13} /> Output</div>
                  <CopyButton text={result.output} />
                </div>
                <pre style={{ ...textareaStyle, minHeight: 60, whiteSpace: 'pre-wrap' }}>{result.output || '(no output)'}</pre>
              </Card>
              <Card>
                <div style={sectionTitle}><Binary size={13} /> Memory Tape</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {result.tape.map((v, i) => (
                    <div key={i} style={{
                      width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: mono, fontSize: 9, borderRadius: 3,
                      background: i === result.ptr ? 'rgba(251,191,36,0.2)' : v > 0 ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.03)',
                      color: i === result.ptr ? accent : v > 0 ? '#6EE7B7' : '#4B5563',
                      border: i === result.ptr ? `1px solid ${accent}` : '1px solid transparent',
                    }}>{v}</div>
                  ))}
                </div>
                <div style={{ fontFamily: mono, fontSize: 9, color: dimText, marginTop: 6 }}>
                  Pointer at cell {result.ptr}
                </div>
              </Card>
            </>
          )}

          {subTab === 'base' && (
            <Card>
              <div style={sectionTitle}><Shuffle size={13} /> Base-N Decode Results</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(result).map(([base, val]) => (
                  <div key={base} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      fontFamily: mono, fontSize: 10, fontWeight: 600, color: val ? '#6EE7B7' : '#F87171',
                      background: val ? 'rgba(110,231,183,0.1)' : 'rgba(248,113,113,0.1)',
                      padding: '3px 8px', borderRadius: 3, width: 60, textAlign: 'center', flexShrink: 0,
                    }}>{base}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <pre style={{ fontFamily: mono, fontSize: 11, color: val ? '#CBD5E1' : '#4B5563',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, margin: 0 }}>
                        {val || 'Could not decode'}
                      </pre>
                      {val && <CopyButton text={val} />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {subTab === 'rot' && (
            <Card>
              <div style={sectionTitle}><RotateCcw size={13} /> ROT Bruteforce (all 25 shifts)</div>
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {result.map(r => (
                  <div key={r.rot} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }}>
                    <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: accent,
                      width: 45, flexShrink: 0 }}>ROT{r.rot.toString().padStart(2, '0')}</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: '#CBD5E1', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</span>
                    <CopyButton text={r.text} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Deobfuscator() {
  const [activeTab, setActiveTab] = useState('js');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Unplug size={18} style={{ color: accent }} />
        </div>
        <span style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>
          Deobfuscator
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: 4, borderRadius: 8,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              ...btnStyle(active),
              display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
            }}>
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'js' && <JSTab />}
      {activeTab === 'html' && <HTMLTab />}
      {activeTab === 'strings' && <StringsTab />}
      {activeTab === 'hex' && <HexTab />}
      {activeTab === 'reverse' && <ReverseTab />}
    </div>
  );
}

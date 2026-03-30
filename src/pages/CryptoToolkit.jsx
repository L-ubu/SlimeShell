import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Lock, Upload, BarChart3, KeyRound, BookOpen, Trophy, Hash, Binary,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { hashAll, md5 } from '../lib/hashing.js';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const bg = '#141820';
const cardBg = '#1E2536';
const accent = '#6EE7B7';
const textPri = '#E2E8F0';
const textMut = '#94A3B8';
const warn = '#FBBF24';

const ENG_LETTER_FREQ = {
  a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702, f: 0.02228, g: 0.02015,
  h: 0.06094, i: 0.06966, j: 0.00153, k: 0.00772, l: 0.04025, m: 0.02406, n: 0.06749,
  o: 0.07507, p: 0.01929, q: 0.00095, r: 0.05987, s: 0.06327, t: 0.09056, u: 0.02758,
  v: 0.00978, w: 0.0236, x: 0.0015, y: 0.01974, z: 0.00074,
};
const ENG_ORDER = Object.keys(ENG_LETTER_FREQ).sort((a, b) => ENG_LETTER_FREQ[b] - ENG_LETTER_FREQ[a]);

function bufferToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function digestAlgo(algo, buffer) {
  const h = await crypto.subtle.digest(algo, buffer);
  return bufferToHex(h);
}

function u8ToBinaryStr(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return s;
}

async function hashFileBuffer(buf) {
  const bin = u8ToBinaryStr(new Uint8Array(buf));
  const [md5H, sha1H, sha256H, sha384H, sha512H] = await Promise.all([
    md5(bin),
    digestAlgo('SHA-1', buf),
    digestAlgo('SHA-256', buf),
    digestAlgo('SHA-384', buf),
    digestAlgo('SHA-512', buf),
  ]);
  return { MD5: md5H, 'SHA-1': sha1H, 'SHA-256': sha256H, 'SHA-384': sha384H, 'SHA-512': sha512H };
}

async function hmacSign(hashName, keyStr, msgStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keyStr),
    { name: 'HMAC', hash: hashName },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msgStr));
  return bufferToHex(sig);
}

function parseFlexibleInput(raw, asHex) {
  const t = raw.trim();
  if (asHex) {
    const hex = t.replace(/\s/g, '');
    if (hex.length % 2) throw new Error('Odd hex length');
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    return out;
  }
  return new TextEncoder().encode(t);
}

function xorRepeat(data, key) {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i % key.length];
  return out;
}

function bytesToHex(u8) {
  return [...u8].map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToAsciiPrintable(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i++) {
    const c = u8[i];
    s += c >= 32 && c < 127 ? String.fromCharCode(c) : '.';
  }
  return s;
}

function chiSquaredEnglish(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters.length) return 1e9;
  const counts = {};
  for (const ch of letters) counts[ch] = (counts[ch] || 0) + 1;
  const n = letters.length;
  let chi = 0;
  for (const L of 'abcdefghijklmnopqrstuvwxyz') {
    const expected = (ENG_LETTER_FREQ[L] || 0) * n;
    const obs = counts[L] || 0;
    if (expected > 0) chi += ((obs - expected) ** 2) / expected;
  }
  return chi;
}

function indexOfCoincidence(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (letters.length < 2) return 0;
  const freq = {};
  for (const ch of letters) freq[ch] = (freq[ch] || 0) + 1;
  let sum = 0;
  for (const c of Object.values(freq)) sum += c * (c - 1);
  return sum / (letters.length * (letters.length - 1));
}

function ngrams(text, n) {
  const t = text.replace(/\s/g, '');
  const map = {};
  for (let i = 0; i <= t.length - n; i++) {
    const g = t.slice(i, i + n);
    map[g] = (map[g] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20);
}

function gcd(a, b) {
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function modInverse(a, m) {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR > 1) return null;
  return ((oldS % m) + m) % m;
}

function vigenereCore(text, key, decrypt) {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text.replace(/[a-z]/gi, ch => {
    const up = ch === ch.toUpperCase();
    const base = up ? 65 : 97;
    const c = ch.charCodeAt(0) - base;
    const kk = k.charCodeAt(ki % k.length) - 97;
    ki++;
    const shift = decrypt ? (26 - kk) % 26 : kk;
    const nc = (c + shift) % 26;
    return String.fromCharCode(base + nc);
  });
}

function vigenereAutoEncrypt(plain, key) {
  const k0 = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k0) return plain;
  const letters = plain.toLowerCase().replace(/[^a-z]/g, '');
  const stream = k0 + letters;
  let si = 0;
  return plain.replace(/[a-z]/gi, ch => {
    const up = ch === ch.toUpperCase();
    const base = up ? 65 : 97;
    const c = ch.toLowerCase().charCodeAt(0) - 97;
    const kk = stream.charCodeAt(si++) - 97;
    const nc = (c + kk) % 26;
    return String.fromCharCode(base + nc);
  });
}

function vigenereAutoDecrypt(cipher, key) {
  const k0 = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k0) return cipher;
  let out = '';
  let ki = 0;
  let plainSoFar = '';
  for (const ch of cipher) {
    if (/[a-z]/i.test(ch)) {
      const up = ch === ch.toUpperCase();
      const base = up ? 65 : 97;
      const c = ch.toLowerCase().charCodeAt(0) - 97;
      const kk = ki < k0.length ? k0.charCodeAt(ki) - 97 : plainSoFar.charCodeAt(plainSoFar.length - 1) - 97;
      ki++;
      const nc = (c - kk + 26) % 26;
      const pt = String.fromCharCode(97 + nc);
      plainSoFar += pt;
      out += String.fromCharCode(base + nc);
    } else out += ch;
  }
  return out;
}

function kasiskiExamination(cipher) {
  const clean = cipher.toUpperCase().replace(/[^A-Z]/g, '');
  const repeats = [];
  for (let len = 3; len <= 5; len++) {
    const seen = {};
    for (let i = 0; i <= clean.length - len; i++) {
      const sub = clean.slice(i, i + len);
      if (!seen[sub]) seen[sub] = [];
      seen[sub].push(i);
    }
    for (const [sub, pos] of Object.entries(seen)) {
      if (pos.length >= 2) {
        for (let a = 0; a < pos.length; a++) {
          for (let b = a + 1; b < pos.length; b++) {
            const d = pos[b] - pos[a];
            if (d > 0) repeats.push({ sub, distance: d });
          }
        }
      }
    }
  }
  const distances = repeats.map(r => r.distance);
  const candidates = {};
  for (let kl = 2; kl <= 20; kl++) {
    let score = 0;
    for (const d of distances) if (d % kl === 0) score++;
    if (score) candidates[kl] = score;
  }
  const sorted = Object.entries(candidates).sort((a, b) => b[1] - a[1]).slice(0, 12);
  return { repeats: repeats.slice(0, 40), keyLengthCandidates: sorted };
}

function railFenceEncrypt(text, rails) {
  const zig = Array.from({ length: rails }, () => []);
  let r = 0; let dir = 1;
  for (const ch of text) {
    zig[r].push(ch);
    r += dir;
    if (r === 0 || r === rails - 1) dir *= -1;
  }
  return zig.map(row => row.join('')).join('');
}

function railFenceDecrypt(cipher, rails) {
  const n = cipher.length;
  const pat = Array(n).fill(0);
  let r = 0; let dir = 1;
  for (let i = 0; i < n; i++) { pat[i] = r; r += dir; if (r === 0 || r === rails - 1) dir *= -1; }
  const counts = Array(rails).fill(0);
  for (const x of pat) counts[x]++;
  const rows = [];
  let idx = 0;
  for (let rr = 0; rr < rails; rr++) {
    rows.push(cipher.slice(idx, idx + counts[rr]).split(''));
    idx += counts[rr];
  }
  const ptr = Array(rails).fill(0);
  let out = '';
  for (let i = 0; i < n; i++) out += rows[pat[i]][ptr[pat[i]]++];
  return out;
}

function railPatternMatrix(text, rails) {
  const rows = Array.from({ length: rails }, () => Array(text.length).fill(' '));
  let r = 0; let dir = 1;
  for (let i = 0; i < text.length; i++) {
    rows[r][i] = text[i] || '·';
    r += dir;
    if (r === 0 || r === rails - 1) dir *= -1;
  }
  return rows;
}

function columnarReadOrder(kwUpper) {
  const indexed = [...kwUpper].map((ch, i) => ({ ch, i }));
  indexed.sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i);
  return indexed.map(x => x.i);
}

function columnarEncrypt(plain, keyword) {
  const kw = keyword.replace(/\s/g, '').toUpperCase();
  if (!kw) return plain;
  const cols = kw.length;
  const pad = (cols - (plain.length % cols)) % cols;
  const padded = plain + 'X'.repeat(pad);
  const rows = padded.length / cols;
  const readOrder = columnarReadOrder(kw);
  let out = '';
  for (const c of readOrder) {
    for (let rr = 0; rr < rows; rr++) out += padded[rr * cols + c];
  }
  return out;
}

function columnarDecrypt(cipher, keyword) {
  const kw = keyword.replace(/\s/g, '').toUpperCase();
  if (!kw) return cipher;
  const cols = kw.length;
  const n = cipher.length;
  const rows = n / cols;
  if (!Number.isInteger(rows) || rows < 1) return cipher;
  const readOrder = columnarReadOrder(kw);
  const colChunks = {};
  let pos = 0;
  for (const c of readOrder) {
    colChunks[c] = cipher.slice(pos, pos + rows);
    pos += rows;
  }
  let plain = '';
  for (let rr = 0; rr < rows; rr++) {
    for (let c = 0; c < cols; c++) plain += colChunks[c][rr] || '';
  }
  return plain.replace(/X+$/i, '');
}

function playfairKeyGrid(keyword) {
  const seen = new Set();
  const grid = [];
  const add = ch => {
    let x = ch;
    if (x === 'j') x = 'i';
    if (!seen.has(x) && /[a-z]/i.test(x)) { seen.add(x); grid.push(x); }
  };
  for (const ch of keyword.toLowerCase()) add(ch);
  for (let c = 97; c <= 122; c++) if (c !== 106) add(String.fromCharCode(c));
  return grid;
}

function playfairPairs(text) {
  let t = text.toLowerCase().replace(/[^a-z]/g, '').replace(/j/g, 'i');
  const pairs = [];
  for (let i = 0; i < t.length; i += 2) {
    let a = t[i]; let b = t[i + 1] || 'x';
    if (a === b) { b = 'x'; i--; }
    pairs.push(a + b);
  }
  return pairs;
}

function playfairTransform(text, keyword, decrypt) {
  const grid = playfairKeyGrid(keyword);
  const pos = {};
  grid.forEach((ch, i) => { pos[ch] = { r: Math.floor(i / 5), c: i % 5 }; });
  const pairs = playfairPairs(text);
  let out = '';
  const sh = decrypt ? -1 : 1;
  for (const pr of pairs) {
    const [a, b] = pr;
    const A = pos[a]; const B = pos[b];
    if (!A || !B) { out += pr; continue; }
    let ar; let ac; let br; let bc;
    if (A.r === B.r) {
      ar = A.r; ac = (A.c + sh + 5) % 5; br = B.r; bc = (B.c + sh + 5) % 5;
    } else if (A.c === B.c) {
      ar = (A.r + sh + 5) % 5; ac = A.c; br = (B.r + sh + 5) % 5; bc = B.c;
    } else {
      ar = A.r; ac = B.c; br = B.r; bc = A.c;
    }
    out += grid[ar * 5 + ac] + grid[br * 5 + bc];
  }
  return out;
}

function affineEncrypt(text, a, b) {
  if (modInverse(a, 26) === null) return '';
  return text.replace(/[a-z]/gi, ch => {
    const up = ch === ch.toUpperCase();
    const x = ch.toLowerCase().charCodeAt(0) - 97;
    const y = (a * x + b) % 26;
    return String.fromCharCode((up ? 65 : 97) + y);
  });
}

function affineDecrypt(text, a, b) {
  const ai = modInverse(a, 26);
  if (ai === null) return '';
  return text.replace(/[a-z]/gi, ch => {
    const up = ch === ch.toUpperCase();
    const y = ch.toLowerCase().charCodeAt(0) - 97;
    const x = (ai * (y - b + 2600)) % 26;
    return String.fromCharCode((up ? 65 : 97) + x);
  });
}

function parseSubMap(mapStr, enc) {
  const m = {};
  const parts = mapStr.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    const segs = p.split(/[-=→>]/).map(x => x?.trim());
    const from = segs[0]; const to = segs[1];
    if (from && to && from.length === 1 && to.length === 1) {
      if (enc) m[from.toLowerCase()] = to.toLowerCase();
      else m[to.toLowerCase()] = from.toLowerCase();
    }
  }
  return m;
}

function substitutionMap(text, m) {
  return text.replace(/[a-z]/gi, ch => {
    const low = ch.toLowerCase();
    const rep = m[low] || low;
    return ch === ch.toUpperCase() ? rep.toUpperCase() : rep;
  });
}

function freqAutoSolve(cipher) {
  const letters = cipher.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters.length) return '';
  const freq = {};
  for (const ch of letters) freq[ch] = (freq[ch] || 0) + 1;
  const sortedCipher = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  const map = {};
  for (let i = 0; i < sortedCipher.length && i < ENG_ORDER.length; i++) map[sortedCipher[i]] = ENG_ORDER[i];
  return substitutionMap(cipher, map);
}

function fieldLabel(t) {
  return <div style={{ fontFamily: heading, fontSize: 11, fontWeight: 600, color: textMut, marginBottom: 6 }}>{t}</div>;
}

function textAreaStyle(h = 100) {
  return {
    width: '100%',
    minHeight: h,
    fontFamily: mono,
    fontSize: 12,
    color: textPri,
    background: bg,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 10,
    resize: 'vertical',
    boxSizing: 'border-box',
  };
}

function inputStyle() {
  return {
    width: '100%',
    fontFamily: mono,
    fontSize: 12,
    color: textPri,
    background: bg,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 10px',
    boxSizing: 'border-box',
  };
}

function tabBtn(active, onClick, children) {
  return (
    <button type="button" onClick={onClick} style={{
      fontFamily: mono,
      fontSize: 11,
      fontWeight: 600,
      padding: '8px 10px',
      borderRadius: 8,
      border: `1px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(110,231,183,0.12)' : cardBg,
      color: active ? accent : textMut,
      cursor: 'pointer',
    }}>{children}</button>
  );
}

function preBlock(t) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 10, color: textPri, background: bg, padding: 12, borderRadius: 8,
      overflow: 'auto', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.06)', margin: '8px 0',
    }}>{t}</pre>
  );
}

function HashingTab() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [hmacKey, setHmacKey] = useState('');
  const [hmac256, setHmac256] = useState('');
  const [hmac512, setHmac512] = useState('');
  const [cmpA, setCmpA] = useState('');
  const [cmpB, setCmpB] = useState('');
  const [fileHashes, setFileHashes] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const finput = useRef(null);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!input) { setHashes({}); return; }
      const h = await hashAll(input);
      if (!c) setHashes(h);
    })();
    return () => { c = true; };
  }, [input]);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!hmacKey || !input) { setHmac256(''); setHmac512(''); return; }
      const [a, b] = await Promise.all([hmacSign('SHA-256', hmacKey, input), hmacSign('SHA-512', hmacKey, input)]);
      if (!c) { setHmac256(a); setHmac512(b); }
    })();
    return () => { c = true; };
  }, [hmacKey, input]);

  const onFile = useCallback(async f => {
    setFileHashes(await hashFileBuffer(await f.arrayBuffer()));
  }, []);

  const cmpMatch = cmpA.trim() && cmpB.trim() && cmpA.trim().toLowerCase() === cmpB.trim().toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fieldLabel('Input')}
      <textarea value={input} onChange={e => setInput(e.target.value)} style={textAreaStyle(90)} placeholder="Text to hash…" />
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>Digests</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(algo => (
          <div key={algo} style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: textMut, width: 72, flexShrink: 0 }}>{algo}</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: textPri, wordBreak: 'break-all', flex: 1 }}>{hashes[algo] || '—'}</span>
            {hashes[algo] ? <CopyButton text={hashes[algo]} /> : null}
          </div>
        ))}
      </div>
      {fieldLabel('HMAC key')}
      <input value={hmacKey} onChange={e => setHmacKey(e.target.value)} style={inputStyle()} placeholder="Secret key…" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, color: textMut, marginBottom: 4 }}>HMAC-SHA256</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <code style={{ fontFamily: mono, fontSize: 10, color: textPri, wordBreak: 'break-all', flex: 1 }}>{hmac256 || '—'}</code>
            {hmac256 ? <CopyButton text={hmac256} /> : null}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, color: textMut, marginBottom: 4 }}>HMAC-SHA512</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <code style={{ fontFamily: mono, fontSize: 10, color: textPri, wordBreak: 'break-all', flex: 1 }}>{hmac512 || '—'}</code>
            {hmac512 ? <CopyButton text={hmac512} /> : null}
          </div>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => finput.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') finput.current?.click(); }}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? accent : 'rgba(110,231,183,0.25)'}`,
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(110,231,183,0.06)' : 'transparent',
        }}
      >
        <Upload size={28} color={accent} style={{ marginBottom: 8 }} />
        <div style={{ fontFamily: heading, fontSize: 13, color: textPri }}>Hash file</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: textMut }}>Drop or click</div>
        <input ref={finput} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
      {fileHashes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(fileHashes).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: textMut, width: 70 }}>{k}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: textPri, flex: 1, wordBreak: 'break-all' }}>{v}</span>
              <CopyButton text={v} />
            </div>
          ))}
        </div>
      )}
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>Compare hashes</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input value={cmpA} onChange={e => setCmpA(e.target.value)} style={inputStyle()} placeholder="Hash A" />
        <input value={cmpB} onChange={e => setCmpB(e.target.value)} style={inputStyle()} placeholder="Hash B" />
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, color: cmpMatch ? accent : '#F87171' }}>
        {cmpA.trim() && cmpB.trim() ? (cmpMatch ? 'Match (case-insensitive)' : 'No match') : 'Enter two hashes'}
      </div>
    </div>
  );
}

function XorTab() {
  const [dataIn, setDataIn] = useState('');
  const [keyIn, setKeyIn] = useState('');
  const [dataHex, setDataHex] = useState(false);
  const [keyHex, setKeyHex] = useState(false);
  const [vizText, setVizText] = useState('Hello');
  const [vizKey, setVizKey] = useState('KEY');
  const [kpPlain, setKpPlain] = useState('');
  const [kpCipher, setKpCipher] = useState('');
  const [kpDataHex, setKpDataHex] = useState(true);
  const [kpKeyHex, setKpKeyHex] = useState(true);

  const xorResult = useMemo(() => {
    try {
      const d = parseFlexibleInput(dataIn, dataHex);
      const k = parseFlexibleInput(keyIn, keyHex);
      if (!k.length) return { err: 'Empty key', hex: '', ascii: '' };
      const x = xorRepeat(d, k);
      return { err: null, hex: bytesToHex(x), ascii: bytesToAsciiPrintable(x), raw: x };
    } catch (e) {
      return { err: String(e.message || e), hex: '', ascii: '' };
    }
  }, [dataIn, keyIn, dataHex, keyHex]);

  const brute = useMemo(() => {
    try {
      const d = parseFlexibleInput(dataIn, dataHex);
      const scores = [];
      for (let b = 0; b < 256; b++) {
        const k = new Uint8Array([b]);
        const x = xorRepeat(d, k);
        const txt = new TextDecoder('utf-8', { fatal: false }).decode(x);
        scores.push({ key: b, chi: chiSquaredEnglish(txt), preview: bytesToAsciiPrintable(x).slice(0, 64) });
      }
      return scores.sort((a, b) => a.chi - b.chi).slice(0, 32);
    } catch { return []; }
  }, [dataIn, dataHex]);

  const keyFind = useMemo(() => {
    try {
      const p = parseFlexibleInput(kpPlain, kpDataHex);
      const c = parseFlexibleInput(kpCipher, kpKeyHex);
      if (p.length !== c.length) return { err: `Length mismatch: plain ${p.length} vs cipher ${c.length}`, hex: '', ascii: '' };
      const k = new Uint8Array(p.length);
      for (let i = 0; i < p.length; i++) k[i] = p[i] ^ c[i];
      return { err: null, hex: bytesToHex(k), ascii: bytesToAsciiPrintable(k) };
    } catch (e) {
      return { err: String(e.message || e), hex: '', ascii: '' };
    }
  }, [kpPlain, kpCipher, kpDataHex, kpKeyHex]);

  const vizRows = useMemo(() => {
    const enc = new TextEncoder();
    const d = enc.encode(vizText || '');
    const k = enc.encode(vizKey || '\0');
    if (!k.length) return [];
    const rows = [];
    for (let i = 0; i < Math.min(d.length, 96); i++) {
      rows.push({ i, byte: d[i], keyByte: k[i % k.length], out: d[i] ^ k[i % k.length], ki: i % k.length });
    }
    return rows;
  }, [vizText, vizKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>XOR encrypt / decrypt</div>
      <label style={{ fontFamily: mono, fontSize: 10, color: textMut, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={dataHex} onChange={e => setDataHex(e.target.checked)} /> Input as hex
      </label>
      <textarea value={dataIn} onChange={e => setDataIn(e.target.value)} style={textAreaStyle(80)} placeholder="Plaintext or hex…" />
      <label style={{ fontFamily: mono, fontSize: 10, color: textMut, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={keyHex} onChange={e => setKeyHex(e.target.checked)} /> Key as hex
      </label>
      <input value={keyIn} onChange={e => setKeyIn(e.target.value)} style={inputStyle()} placeholder="Key (text or hex)…" />
      {xorResult.err && <div style={{ color: '#F87171', fontFamily: mono, fontSize: 11 }}>{xorResult.err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          {fieldLabel('Output (hex)')}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <pre style={{ ...textAreaStyle(60), margin: 0, flex: 1 }}>{xorResult.hex || '—'}</pre>
            {xorResult.hex ? <CopyButton text={xorResult.hex} /> : null}
          </div>
        </div>
        <div>
          {fieldLabel('Output (ASCII printable)')}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <pre style={{ ...textAreaStyle(60), margin: 0, flex: 1 }}>{xorResult.ascii || '—'}</pre>
            {xorResult.ascii ? <CopyButton text={xorResult.ascii} /> : null}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>Single-byte XOR brute (ranked by χ² vs English)</div>
      <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
          <thead>
            <tr style={{ background: bg, color: textMut }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Key</th>
              <th style={{ textAlign: 'left', padding: 6 }}>χ²</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {brute.map(row => (
              <tr key={row.key} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 6, color: accent }}>0x{row.key.toString(16).padStart(2, '0')}</td>
                <td style={{ padding: 6, color: textPri }}>{row.chi.toFixed(1)}</td>
                <td style={{ padding: 6, color: textMut }}>{row.preview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>Repeating-key XOR visualization</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          {fieldLabel('Text')}
          <input value={vizText} onChange={e => setVizText(e.target.value)} style={inputStyle()} />
        </div>
        <div>
          {fieldLabel('Key')}
          <input value={vizKey} onChange={e => setVizKey(e.target.value)} style={inputStyle()} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontFamily: mono, fontSize: 10 }}>
        {vizRows.map(r => (
          <span
            key={r.i}
            title={`i=${r.i} keyIdx=${r.ki}`}
            style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '4px 3px',
              background: `hsl(${(r.ki * 47) % 360} 35% 22%)`, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ color: textMut }}>{r.byte.toString(16).padStart(2, '0')}</span>
            <span style={{ color: warn }}>⊕</span>
            <span style={{ color: textMut }}>{r.keyByte.toString(16).padStart(2, '0')}</span>
            <span style={{ color: accent, marginTop: 2 }}>{(r.out >= 32 && r.out < 127) ? String.fromCharCode(r.out) : '·'}</span>
          </span>
        ))}
      </div>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>XOR key recovery (known plaintext + ciphertext)</div>
      <label style={{ fontFamily: mono, fontSize: 10, color: textMut }}><input type="checkbox" checked={kpDataHex} onChange={e => setKpDataHex(e.target.checked)} /> Plaintext hex</label>
      <textarea value={kpPlain} onChange={e => setKpPlain(e.target.value)} style={textAreaStyle(50)} placeholder="Known plaintext bytes…" />
      <label style={{ fontFamily: mono, fontSize: 10, color: textMut }}><input type="checkbox" checked={kpKeyHex} onChange={e => setKpKeyHex(e.target.checked)} /> Ciphertext hex</label>
      <textarea value={kpCipher} onChange={e => setKpCipher(e.target.value)} style={textAreaStyle(50)} placeholder="Ciphertext bytes…" />
      {keyFind.err && <div style={{ color: '#F87171', fontFamily: mono, fontSize: 11 }}>{keyFind.err}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: textPri, wordBreak: 'break-all' }}>{keyFind.hex || '—'}</span>
        {keyFind.hex ? <CopyButton text={keyFind.hex} /> : null}
        <span style={{ fontFamily: mono, fontSize: 10, color: textMut }}>{keyFind.ascii}</span>
      </div>
    </div>
  );
}

function barColor(ch) {
  if (/[a-z]/i.test(ch)) return '#6EE7B7';
  if (/[0-9]/.test(ch)) return '#7DD3FC';
  return '#C4B5FD';
}

function FrequencyTab() {
  const [cipher, setCipher] = useState('');
  const [sortMode, setSortMode] = useState('freq');
  const ic = useMemo(() => indexOfCoincidence(cipher), [cipher]);
  const bigrams = useMemo(() => ngrams(cipher, 2), [cipher]);
  const trigrams = useMemo(() => ngrams(cipher, 3), [cipher]);
  const freqMap = useMemo(() => {
    const m = {};
    for (const ch of cipher) m[ch] = (m[ch] || 0) + 1;
    return m;
  }, [cipher]);
  const maxF = useMemo(() => Math.max(0, ...Object.values(freqMap)), [freqMap]);
  const bars = useMemo(() => {
    let entries = Object.entries(freqMap);
    if (sortMode === 'freq') entries.sort((a, b) => b[1] - a[1]);
    else entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }, [freqMap, sortMode]);

  let icHint = 'IC varies — likely transposition, mixed alphabet, or short text';
  if (ic > 0.06) icHint = 'IC ≈ English (~0.067) — monoalphabetic substitution or plaintext';
  else if (ic > 0.045 && ic < 0.055) icHint = 'IC ~0.038–0.05 — often polyalphabetic (Vigenère) or compressed/binary';
  else if (ic < 0.045 && cipher.replace(/\s/g, '').length > 30) icHint = 'Low IC — polyalphabetic (Vigenère), or high diversity';

  const engOverlay = useMemo(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return letters.map(L => {
      const exp = ENG_LETTER_FREQ[L.toLowerCase()] || 0;
      return { L, pct: exp * 100 };
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fieldLabel('Ciphertext')}
      <textarea value={cipher} onChange={e => setCipher(e.target.value)} style={textAreaStyle(100)} placeholder="Paste ciphertext…" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabBtn(sortMode === 'freq', () => setSortMode('freq'), 'Sort: frequency')}
        {tabBtn(sortMode === 'alpha', () => setSortMode('alpha'), 'Sort: alphabetical')}
      </div>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>Character frequency</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflow: 'auto' }}>
        {bars.map(([ch, count]) => {
          const pct = maxF ? (count / maxF) * 100 : 0;
          const disp = ch === ' ' ? '␠' : ch === '\n' ? '↵' : ch === '\t' ? '⇥' : ch;
          return (
            <div key={JSON.stringify(ch) + count} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: textMut, width: 28 }}>{disp}</span>
              <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: barColor(ch), transition: 'width 0.2s' }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: textPri, width: 36, textAlign: 'right' }}>{count}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: accent }}>English letter frequency (reference %)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {engOverlay.map(({ L, pct }) => (
          <span key={L} style={{ fontFamily: mono, fontSize: 9, color: textMut, background: bg, padding: '2px 6px', borderRadius: 4 }}>
            {L}:{pct.toFixed(1)}%
          </span>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, color: textPri }}>
        Index of Coincidence: <span style={{ color: accent, fontWeight: 700 }}>{ic.toFixed(4)}</span>
        <div style={{ fontSize: 11, color: textMut, marginTop: 6 }}>{icHint}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: accent, marginBottom: 8 }}>Top bigrams</div>
          <table style={{ width: '100%', fontFamily: mono, fontSize: 10, borderCollapse: 'collapse' }}>
            <tbody>
              {bigrams.map(([g, c]) => (
                <tr key={g} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 4, color: textPri }}>{g}</td>
                  <td style={{ padding: 4, color: textMut, textAlign: 'right' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: accent, marginBottom: 8 }}>Top trigrams</div>
          <table style={{ width: '100%', fontFamily: mono, fontSize: 10, borderCollapse: 'collapse' }}>
            <tbody>
              {trigrams.map(([g, c]) => (
                <tr key={g} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 4, color: textPri }}>{g}</td>
                  <td style={{ padding: 4, color: textMut, textAlign: 'right' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClassicalTab() {
  const [vigIn, setVigIn] = useState('');
  const [vigKey, setVigKey] = useState('KEY');
  const [vigOut, setVigOut] = useState('');
  const [subIn, setSubIn] = useState('');
  const [subMap, setSubMap] = useState('a>z\nb>y');
  const [subOut, setSubOut] = useState('');
  const [rfIn, setRfIn] = useState('WEAREDISCOVERED');
  const [rfRails, setRfRails] = useState(3);
  const [rfOut, setRfOut] = useState('');
  const [colIn, setColIn] = useState('ATTACKATDAWN');
  const [colKey, setColKey] = useState('ZEBRA');
  const [colOut, setColOut] = useState('');
  const [pfIn, setPfIn] = useState('hide the gold');
  const [pfKey, setPfKey] = useState('playfair');
  const [pfOut, setPfOut] = useState('');
  const [afIn, setAfIn] = useState('affine');
  const [afA, setAfA] = useState('5');
  const [afB, setAfB] = useState('8');
  const [afOut, setAfOut] = useState('');
  const kas = useMemo(() => kasiskiExamination(vigIn), [vigIn]);
  const rfMat = useMemo(() => railPatternMatrix(rfIn.slice(0, 48), Math.min(10, Math.max(2, rfRails))), [rfIn, rfRails]);
  const colOrder = useMemo(() => {
    const kw = colKey.replace(/\s/g, '').toUpperCase();
    if (!kw) return [];
    const ro = columnarReadOrder(kw);
    return ro.map((ci, ri) => ({ col: ci, letter: kw[ci], readIndex: ri + 1 }));
  }, [colKey]);
  const pfGrid = useMemo(() => playfairKeyGrid(pfKey), [pfKey]);

  const affinePairs = useMemo(() => {
    const pairs = [];
    for (let a = 1; a < 26; a++) {
      if (gcd(a, 26) !== 1) continue;
      for (let b = 0; b < 26; b++) pairs.push({ a, b });
    }
    return pairs;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Vigenère</div>
      <textarea value={vigIn} onChange={e => setVigIn(e.target.value)} style={textAreaStyle(70)} />
      <input value={vigKey} onChange={e => setVigKey(e.target.value)} style={inputStyle()} placeholder="Key" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setVigOut(vigenereCore(vigIn, vigKey, false))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer', background: 'rgba(110,231,183,0.12)', color: accent, borderColor: accent }}>Encrypt</button>
        <button type="button" onClick={() => setVigOut(vigenereCore(vigIn, vigKey, true))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
        <button type="button" onClick={() => setVigOut(vigenereAutoEncrypt(vigIn, vigKey))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Auto-key encrypt</button>
        <button type="button" onClick={() => setVigOut(vigenereAutoDecrypt(vigIn, vigKey))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Auto-key decrypt</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(50), margin: 0, flex: 1 }}>{vigOut || '—'}</pre>
        {vigOut ? <CopyButton text={vigOut} /> : null}
      </div>
      <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: accent }}>Kasiski helper</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: textMut, maxHeight: 120, overflow: 'auto' }}>
        {kas.repeats.slice(0, 15).map((r, i) => <div key={i}>{r.sub} @ distance {r.distance}</div>)}
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: textPri }}>Key length candidates (divisor hits): {kas.keyLengthCandidates.map(([k, s]) => `${k}:${s}`).join(', ') || '—'}</div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Substitution</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: textMut }}>Mapping lines: plain → cipher (e.g. a→z or a-z)</div>
      <textarea value={subMap} onChange={e => setSubMap(e.target.value)} style={textAreaStyle(60)} />
      <textarea value={subIn} onChange={e => setSubIn(e.target.value)} style={textAreaStyle(60)} placeholder="Text…" />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setSubOut(substitutionMap(subIn, parseSubMap(subMap, true)))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Encrypt</button>
        <button type="button" onClick={() => setSubOut(substitutionMap(subIn, parseSubMap(subMap, false)))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
        <button type="button" onClick={() => setSubOut(freqAutoSolve(subIn))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Freq auto-solve</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(50), margin: 0, flex: 1 }}>{subOut || '—'}</pre>
        {subOut ? <CopyButton text={subOut} /> : null}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Rail fence</div>
      <input type="number" min={2} max={10} value={rfRails} onChange={e => setRfRails(Number(e.target.value))} style={{ ...inputStyle(), maxWidth: 120 }} />
      <textarea value={rfIn} onChange={e => setRfIn(e.target.value)} style={textAreaStyle(50)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setRfOut(railFenceEncrypt(rfIn, Math.min(10, Math.max(2, rfRails))))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Encrypt</button>
        <button type="button" onClick={() => setRfOut(railFenceDecrypt(rfIn, Math.min(10, Math.max(2, rfRails))))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
      </div>
      <pre style={{ fontFamily: mono, fontSize: 9, color: textPri, background: bg, padding: 8, borderRadius: 8, overflow: 'auto' }}>
        {rfMat.map((row, ri) => <div key={ri}>{row.join(' ')}</div>)}
      </pre>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(40), margin: 0, flex: 1 }}>{rfOut || '—'}</pre>
        {rfOut ? <CopyButton text={rfOut} /> : null}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Columnar transposition</div>
      <input value={colKey} onChange={e => setColKey(e.target.value)} style={inputStyle()} placeholder="Keyword" />
      <div style={{ fontFamily: mono, fontSize: 10, color: textMut }}>Read order (columns): {colOrder.map(c => `${c.letter}(${c.col})`).join(' → ') || '—'}</div>
      <textarea value={colIn} onChange={e => setColIn(e.target.value)} style={textAreaStyle(50)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setColOut(columnarEncrypt(colIn, colKey))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Encrypt</button>
        <button type="button" onClick={() => setColOut(columnarDecrypt(colIn, colKey))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(40), margin: 0, flex: 1 }}>{colOut || '—'}</pre>
        {colOut ? <CopyButton text={colOut} /> : null}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Playfair</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, maxWidth: 220 }}>
        {pfGrid.map((ch, i) => (
          <div key={i} style={{ fontFamily: mono, fontSize: 14, textAlign: 'center', padding: 8, background: cardBg, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: accent }}>{ch}</div>
        ))}
      </div>
      <input value={pfKey} onChange={e => setPfKey(e.target.value)} style={inputStyle()} placeholder="Keyword" />
      <textarea value={pfIn} onChange={e => setPfIn(e.target.value)} style={textAreaStyle(40)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setPfOut(playfairTransform(pfIn, pfKey, false))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Encrypt</button>
        <button type="button" onClick={() => setPfOut(playfairTransform(pfIn, pfKey, true))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(40), margin: 0, flex: 1 }}>{pfOut || '—'}</pre>
        {pfOut ? <CopyButton text={pfOut} /> : null}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>Affine (a,b mod 26, gcd(a,26)=1)</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={afA} onChange={e => setAfA(e.target.value)} style={{ ...inputStyle(), maxWidth: 80 }} placeholder="a" />
        <input value={afB} onChange={e => setAfB(e.target.value)} style={{ ...inputStyle(), maxWidth: 80 }} placeholder="b" />
      </div>
      <textarea value={afIn} onChange={e => setAfIn(e.target.value)} style={textAreaStyle(40)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setAfOut(affineEncrypt(afIn, Number(afA) || 1, Number(afB) || 0))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Encrypt</button>
        <button type="button" onClick={() => setAfOut(affineDecrypt(afIn, Number(afA) || 1, Number(afB) || 0))} style={{ ...inputStyle(), width: 'auto', cursor: 'pointer' }}>Decrypt</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <pre style={{ ...textAreaStyle(40), margin: 0, flex: 1 }}>{afOut || '—'}</pre>
        {afOut ? <CopyButton text={afOut} /> : null}
      </div>
      <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: accent }}>Affine brute force ({affinePairs.length} keys)</div>
      <div style={{ maxHeight: 160, overflow: 'auto', fontFamily: mono, fontSize: 9, color: textMut }}>
        {affinePairs.slice(0, 80).map(({ a, b }) => (
          <span key={`${a}-${b}`} style={{ display: 'inline-block', marginRight: 8, marginBottom: 4 }}>
            ({a},{b}): {affineEncrypt(afIn.slice(0, 24), a, b).slice(0, 20)}…
          </span>
        ))}
        {affinePairs.length > 80 ? '…' : ''}
      </div>
    </div>
  );
}

const OPENSSL_CMDS = [
  'openssl genrsa -out key.pem 2048',
  'openssl rsa -in key.pem -pubout -out pub.pem',
  'openssl genpkey -algorithm RSA -out rsa.pem -pkeyopt rsa_keygen_bits:4096',
  'openssl req -new -x509 -key key.pem -out cert.pem -days 365',
  'openssl rsa -in key.pem -text -noout',
  'openssl dgst -sha256 file.bin',
  'openssl dgst -md5 file.bin',
  'openssl enc -aes-256-cbc -salt -in plain.txt -out cipher.bin',
  'openssl enc -aes-256-cbc -d -in cipher.bin -out plain.txt',
  'openssl enc -aes-256-gcm -K $(openssl rand -hex 32) -iv $(openssl rand -hex 12) …',
  'openssl rand -hex 32',
  'openssl s_client -connect host:443 -servername host',
  'openssl s_client -connect host:443 -showcerts',
  'openssl x509 -in cert.pem -text -noout',
  'openssl verify -CAfile ca.pem cert.pem',
  'openssl pkcs12 -export -out bundle.p12 -inkey key.pem -in cert.pem',
  'openssl dhparam -out dh.pem 2048',
  'openssl ecparam -name prime256v1 -genkey -noout -out ec.pem',
  'openssl pkey -in ec.pem -pubout -out ec_pub.pem',
  'openssl cms -encrypt -recip cert.pem -out msg.cms plain.txt',
  'openssl cms -decrypt -in msg.cms -recip key.pem -out plain.txt',
  'openssl rsautl -encrypt -pubin -inkey pub.pem -in key.bin -out enc.bin',
  'openssl rsautl -decrypt -inkey key.pem -in enc.bin -out key.bin',
  'openssl speed rsa2048',
  'openssl ciphers -v HIGH',
  'openssl crl2pkcs7 -nocrl -certfile cert.pem -out chain.p7b',
  'openssl pkcs7 -print_certs -in chain.p7b',
  'openssl asn1parse -inform DER -in file.der',
  'openssl passwd -6 -salt xyz password',
  'openssl kdf -kdfopt digest:SHA256 -kdfopt keylen:32 HKDF …',
  'openssl pkeyutl -sign -inkey key.pem -in data.bin -out sig.bin',
  'openssl pkeyutl -verify -pubin -inkey pub.pem -in data.bin -sigfile sig.bin',
];

const GPG_CMDS = [
  'gpg --full-generate-key',
  'gpg --list-keys',
  'gpg --export -a USER > pub.asc',
  'gpg --import pub.asc',
  'gpg --encrypt --recipient USER file.txt',
  'gpg --decrypt file.txt.gpg',
  'gpg --sign file.txt',
  'gpg --clearsign file.txt',
  'gpg --verify file.sig',
  'gpg --detach-sign file.bin',
  'gpg --recv-keys KEYID',
  'gpg --edit-key USER',
  'gpg --delete-secret-keys USER',
  'gpg --armor --export-secret-keys USER',
  'gpg --symmetric --cipher-algo AES256 secret.txt',
];

const PY_CRYPTO = `from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Random import get_random_bytes
key = get_random_bytes(32); iv = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_CBC, iv)
ct = cipher.encrypt(pad(b"secret", AES.block_size))

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
key = RSA.generate(2048)
enc = PKCS1_OAEP.new(key.publickey()).encrypt(b"hi")

from Crypto.Hash import SHA256, HMAC
HMAC.new(b"key", msg=b"data", digestmod=SHA256).hexdigest()`;

const CYBERCHEF_OPS = 'From Base64, To Hex, XOR, ROT13, AES Encrypt, AES Decrypt, RC4, Blowfish, Derive PBKDF2 key, HMAC, RSA Encrypt, Parse ASN.1, Swap endianness, RC2, DES, Triple DES, Substitute, Regular expression, Find / Replace, Split, Join, Magic';

function ModernCryptoTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: mono, fontSize: 11, color: textPri }}>
      <div style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: accent }}>AES block modes (text diagrams)</div>
      {preBlock(`ECB — Electronic Codebook
┌────┐ ┌────┐ ┌────┐
│ P1 │→│ E  │→│ C1 │   Same Pi → same Ci (no IV). Patterns leak.
└────┘ └────┘ └────┘   Never use for structured data.`)}
      {preBlock(`CBC — Cipher Block Chaining
      IV
       ↓
P1──XOR──→[E]──→C1──┐
                    │ XOR
P2──XOR←──────────┘→[E]──→C2
IV must be unpredictable (random). Decrypt: Di = Dec(Ci) XOR Ci-1 (or IV).`)}
      {preBlock(`CTR — Counter
Nonce||Counter ─→ [E_key] ─→ keystream ─XOR─→ plaintext
Stream-like; parallel encrypt/decrypt. Never reuse (nonce,key) pair.`)}
      {preBlock(`GCM — Galois/Counter Mode
CTR encryption + GHASH MAC. Outputs ciphertext + auth tag.
IV/nonce uniqueness critical; provides AEAD (confidentiality + integrity).`)}
      {preBlock(`CFB — Cipher Feedback
Shift register + encrypt + XOR plaintext; ciphertext fed back. Self-synchronizing variant possible. IV required.`)}
      {preBlock(`OFB — Output Feedback
Keystream from repeated encryption of prior output; XOR with P. Errors propagate; IV required.`)}

      <div style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: accent }}>RSA overview</div>
      <ul style={{ color: textMut, lineHeight: 1.6, paddingLeft: 18 }}>
        <li>Key gen: pick primes p,q; n=pq; φ(n)=(p-1)(q-1); choose e coprime to φ; d=e⁻¹ mod φ.</li>
        <li>Encrypt (raw): c = m^e mod n (only for small m with padding in practice).</li>
        <li>Signing: signature = H(m)^d mod n; verify with e.</li>
        <li>Attacks: small e=3 on tiny m (cube root); common modulus (same n, different e,d leaks); Wiener’s (small d); Håstad broadcast (same m, small e, different moduli).</li>
      </ul>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>openssl ({OPENSSL_CMDS.length}+)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {OPENSSL_CMDS.map(cmd => (
          <div key={cmd} style={{ display: 'flex', alignItems: 'center', gap: 6, background: bg, padding: '4px 8px', borderRadius: 6 }}>
            <code style={{ flex: 1, fontSize: 10, wordBreak: 'break-all' }}>{cmd}</code>
            <CopyButton text={cmd} />
          </div>
        ))}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>gpg ({GPG_CMDS.length}+)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {GPG_CMDS.map(cmd => (
          <div key={cmd} style={{ display: 'flex', alignItems: 'center', gap: 6, background: bg, padding: '4px 8px', borderRadius: 6 }}>
            <code style={{ flex: 1, fontSize: 10 }}>{cmd}</code>
            <CopyButton text={cmd} />
          </div>
        ))}
      </div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>PyCryptodome snippets</div>
      {preBlock(PY_CRYPTO)}

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: warn }}>CyberChef-style operations</div>
      <div style={{ color: textMut, fontSize: 10, lineHeight: 1.5 }}>{CYBERCHEF_OPS}</div>

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent }}>Padding oracle (CBC)</div>
      {preBlock(`Server decrypts CBC ciphertext and returns error if PKCS#7 padding invalid.
Attacker flips bytes in block Ci-1 so that after decrypt, P’i has valid padding.
Iterate byte-by-byte from last position to recover plaintext without key.`)}

      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent }}>Hash length extension</div>
      {preBlock(`Many old MACs used secret_prefix || message with Merkle–Damgård hashes (MD5, SHA1, SHA256).
Given H(secret||message) but not secret, attacker can append glue blocks and continuation to forge H(secret||message||glue||extra) knowing only hash output and length of secret. Fix: HMAC or modern hashes with proper domain separation.`)}
    </div>
  );
}

const CTF_ROWS = [
  { type: 'Caesar / ROT', desc: 'Shift substitution on letters.', approach: 'Try all 25 shifts or score with frequency analysis.', tools: 'CyberChef ROT, Python chr/ord loops', ex: 'echo "uryyb" | caesar 13' },
  { type: 'Vigenère', desc: 'Polyalphabetic repeating-key shift.', approach: 'IC for key length; Kasiski; split cosets; freq per stream.', tools: 'This page Kasiski + Vigenère tab', ex: 'Split by period, solve as Caesar each' },
  { type: 'RSA small n', desc: 'Modulus factors easily.', approach: 'FactorDB or trial division / Pollard rho.', tools: 'https://factordb.com, sage, RsaCtfTool', ex: 'RsaCtfTool --attack factordb -n N' },
  { type: 'RSA small e', desc: 'e=3, m^e < n → cube root.', approach: 'Take integer cube root of c.', tools: 'gmpy2 iroot, RsaCtfTool', ex: 'gmpy2.iroot(c, 3)' },
  { type: 'XOR', desc: 'Single or repeating key XOR.', approach: 'Single-byte χ²; known plaintext key recovery; crib drag.', tools: 'This page XOR tab', ex: 'xor known PT bytes with CT' },
  { type: 'Nested Base64', desc: 'Multiple layers of b64.', approach: 'Recursive decode until stable.', tools: 'CyberChef “From Base64” chain', ex: 'while b64decode: s=b64decode(s)' },
  { type: 'Custom encoding', desc: 'Weird alphabets or graphs.', approach: 'Pattern frequency, unique symbols, try dcode.fr mappings.', tools: 'https://www.dcode.fr', ex: 'Identify alphabet size → substitution' },
  { type: 'ECB cut-and-paste', desc: 'Blocks independent.', approach: 'Reorder / duplicate AES blocks to forge messages.', tools: 'PoC with openssl enc -aes-128-ecb', ex: 'Swap ciphertext blocks' },
  { type: 'CBC bit flipping', desc: 'Flip bits in Ci-1 to control Pi after decrypt.', approach: 'XOR desired delta into previous block or IV.', tools: 'Custom script', ex: "P'i = P XOR (oldCi-1 XOR newCi-1)" },
  { type: 'Padding oracle', desc: 'Padding valid/invalid leak.', approach: 'Byte-by-byte CBC decryption (see Modern tab).', tools: 'padbuster, custom', ex: '256 tries per byte position' },
  { type: 'Hash collision / birthday', desc: 'Find two messages with same hash.', approach: 'Birthday bound ~2^(n/2) for n-bit hash.', tools: 'hashclash research tools', ex: '2^64 work for 128-bit hash' },
];

function CtfTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent }}>Useful sites</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['https://factordb.com', 'https://quipqiup.com', 'https://www.dcode.fr', 'RsaCtfTool (GitHub)'].map(u => (
          <code key={u} style={{ fontFamily: mono, fontSize: 10, color: warn, background: bg, padding: '4px 8px', borderRadius: 6 }}>{u}</code>
        ))}
      </div>
      {CTF_ROWS.map(row => (
        <Card key={row.type} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: accent, marginBottom: 8 }}>{row.type}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: textMut, marginBottom: 6 }}>{row.desc}</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: textPri }}><span style={{ color: warn }}>Approach:</span> {row.approach}</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: textPri, marginTop: 4 }}><span style={{ color: warn }}>Tools:</span> {row.tools}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <code style={{ fontFamily: mono, fontSize: 10, color: textMut, flex: 1, wordBreak: 'break-all' }}>{row.ex}</code>
            <CopyButton text={row.ex} />
          </div>
        </Card>
      ))}
    </div>
  );
}

const TAB_META = [
  { id: 'hash', label: 'Hashing', Icon: Hash, Comp: HashingTab },
  { id: 'xor', label: 'XOR', Icon: Binary, Comp: XorTab },
  { id: 'freq', label: 'Frequency', Icon: BarChart3, Comp: FrequencyTab },
  { id: 'classical', label: 'Classical', Icon: KeyRound, Comp: ClassicalTab },
  { id: 'modern', label: 'Modern ref', Icon: BookOpen, Comp: ModernCryptoTab },
  { id: 'ctf', label: 'CTF ref', Icon: Trophy, Comp: CtfTab },
];

export default function CryptoToolkit() {
  const [tab, setTab] = useState('hash');
  const Active = TAB_META.find(t => t.id === tab)?.Comp || HashingTab;

  return (
    <div style={{ minHeight: '100%', background: '#141820', padding: 20, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={20} color={warn} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, color: textPri, margin: 0 }}>Crypto Toolkit</h1>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, padding: 10, background: '#1A1F2E', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {TAB_META.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${tab === id ? accent : 'rgba(255,255,255,0.08)'}`,
                background: tab === id ? 'rgba(110,231,183,0.12)' : cardBg,
                color: tab === id ? accent : textMut,
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <Card style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Active />
        </Card>
      </div>
    </div>
  );
}

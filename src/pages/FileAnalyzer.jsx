import { useCallback, useRef, useState } from 'react';
import { FileSearch, Upload } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const pageBg = '#060910';
const textPrimary = '#E8EDF5';
const textMuted = '#8B95A8';
const accent = '#7DD3FC';

/** RFC 1321 MD5 (binary input → lowercase hex). */
function md5(arrayBuffer) {
  const input = new Uint8Array(arrayBuffer);
  const origLen = input.length;
  const zeros = (56 - ((origLen + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(origLen + 1 + zeros + 8);
  padded.set(input);
  padded[origLen] = 0x80;
  const bitLen = BigInt(origLen) * 8n;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Number(bitLen & 0xffffffffn), true);
  dv.setUint32(padded.length - 4, Number((bitLen >> 32n) & 0xffffffffn), true);

  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const w = new DataView(padded.buffer);
  const nChunk = padded.length / 64;

  for (let chunk = 0; chunk < nChunk; chunk++) {
    const off = chunk * 64;
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = w.getUint32(off + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F;
      let g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true);
  odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true);
  odv.setUint32(12, d0, true);
  return Array.from(out)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatBytes(n) {
  if (n === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log2(n) / 10), units.length - 1);
  const v = n / 1024 ** i;
  const rounded = i === 0 ? n : v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v);
  return `${rounded} ${units[i]}`;
}

function hexFirstN(bytes, n) {
  const u8 = new Uint8Array(bytes);
  const slice = u8.slice(0, Math.min(n, u8.length));
  return Array.from(slice)
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

function asciiAt(u8, start, len) {
  let s = '';
  for (let i = 0; i < len && start + i < u8.length; i++) {
    s += String.fromCharCode(u8[start + i]);
  }
  return s;
}

function detectFileType(buffer) {
  const u8 = new Uint8Array(buffer);
  if (u8.length === 0) return 'Unknown (empty)';

  const b = (i) => u8[i] ?? 0;

  if (u8.length >= 8 && b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) {
    return 'PNG image';
  }
  if (u8.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) {
    return 'JPEG image';
  }
  if (u8.length >= 6 && (asciiAt(u8, 0, 6) === 'GIF87a' || asciiAt(u8, 0, 6) === 'GIF89a')) {
    return 'GIF image';
  }
  if (u8.length >= 5 && asciiAt(u8, 0, 5) === '%PDF-') {
    return 'PDF document';
  }
  if (u8.length >= 4 && b(0) === 0x50 && b(1) === 0x4b) {
    if (b(2) === 0x03 && b(3) === 0x04) return 'ZIP archive (local file)';
    if (b(2) === 0x05 && b(3) === 0x06) return 'ZIP archive (empty/end of central dir)';
    if (b(2) === 0x07 && b(3) === 0x08) return 'ZIP archive (spanning)';
    if (b(2) === 0x01 && b(3) === 0x02) return 'ZIP archive (central directory)';
    return 'ZIP / Office Open XML (PK)';
  }
  if (u8.length >= 4 && b(0) === 0x7f && b(1) === 0x45 && b(2) === 0x4c && b(3) === 0x46) {
    return 'ELF executable / object';
  }
  if (u8.length >= 2 && b(0) === 0x4d && b(1) === 0x5a) {
    return 'PE executable (Windows) / MZ';
  }
  if (u8.length >= 2 && b(0) === 0x1f && b(1) === 0x8b) {
    return 'GZIP compressed';
  }
  if (u8.length >= 262) {
    const ustar = asciiAt(u8, 257, 5);
    if (ustar === 'ustar') {
      return 'TAR archive (ustar)';
    }
  }
  if (u8.length >= 3 && asciiAt(u8, 0, 3) === 'ID3') {
    return 'MP3 (ID3 tag)';
  }
  if (u8.length >= 2 && b(0) === 0xff && (b(1) & 0xe0) === 0xe0) {
    return 'MP3 / MPEG audio (frame sync)';
  }
  if (u8.length >= 12) {
    const ftyp = asciiAt(u8, 4, 4);
    if (ftyp === 'ftyp') {
      const brand = asciiAt(u8, 8, 4).replace(/\0/g, '');
      return `MP4 / ISO base media (ftyp: ${brand || '???'})`;
    }
  }
  if (u8.length >= 4 && b(0) === 0x00 && b(1) === 0x61 && b(2) === 0x73 && b(3) === 0x6d) {
    return 'WebAssembly (WASM)';
  }
  if (u8.length >= 16) {
    const head = asciiAt(u8, 0, 16);
    if (head.startsWith('SQLite format 3')) {
      return 'SQLite database';
    }
  }
  if (u8.length >= 4 && asciiAt(u8, 0, 4) === 'RIFF' && u8.length >= 12 && asciiAt(u8, 8, 4) === 'WAVE') {
    return 'WAVE audio';
  }
  if (u8.length >= 4 && asciiAt(u8, 0, 4) === 'OggS') {
    return 'OGG container';
  }
  if (u8.length >= 4 && b(0) === 0xca && b(1) === 0xfe && b(2) === 0xba && b(3) === 0xbe) {
    return 'Java class / Mach-O fat binary';
  }
  if (u8.length >= 4 && b(0) === 0xfe && b(1) === 0xed && b(2) === 0xfa && (b(3) === 0xcf || b(3) === 0xce)) {
    return 'Mach-O binary (macOS)';
  }
  if (u8.length >= 8 && asciiAt(u8, 0, 8) === '\x89HDF\r\n\x1a\n') {
    return 'HDF5 / NetCDF (HDF)';
  }

  return 'Unknown / generic binary';
}

function shannonEntropy(uint8) {
  if (uint8.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < uint8.length; i++) {
    counts[uint8[i]]++;
  }
  const n = uint8.length;
  let ent = 0;
  for (let i = 0; i < 256; i++) {
    const c = counts[i];
    if (c === 0) continue;
    const p = c / n;
    ent -= p * Math.log2(p);
  }
  return ent;
}

function entropyStyle(h) {
  if (h < 3) return { label: 'Low (text/structured)', color: '#34D399', bar: '#34D399' };
  if (h < 6) return { label: 'Medium (code/mixed)', color: '#FBBF24', bar: '#FBBF24' };
  if (h < 7.5) return { label: 'High (compressed/encrypted)', color: '#F87171', bar: '#F87171' };
  return { label: 'Very High (encrypted/random)', color: '#EF4444', bar: '#EF4444' };
}

function extractStrings(uint8, minLen = 4) {
  const strings = [];
  let cur = [];
  for (let i = 0; i < uint8.length; i++) {
    const b = uint8[i];
    if (b >= 0x20 && b <= 0x7e) {
      cur.push(b);
    } else {
      if (cur.length >= minLen) {
        strings.push(String.fromCharCode.apply(null, cur));
      }
      cur = [];
    }
  }
  if (cur.length >= minLen) {
    strings.push(String.fromCharCode.apply(null, cur));
  }
  return strings;
}

async function digestHex(algorithm, buffer) {
  const hash = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function rowLabelStyle() {
  return {
    fontFamily: mono,
    fontSize: 11,
    color: textMuted,
    minWidth: 72,
    flexShrink: 0,
  };
}

function rowValueStyle() {
  return {
    fontFamily: mono,
    fontSize: 11,
    color: textPrimary,
    wordBreak: 'break-all',
    flex: 1,
  };
}

export default function FileAnalyzer() {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [md5Hex, setMd5Hex] = useState('');
  const [sha1Hex, setSha1Hex] = useState('');
  const [sha256Hex, setSha256Hex] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [strings, setStrings] = useState([]);
  const [magicHex, setMagicHex] = useState('');
  const [magicType, setMagicType] = useState('');

  const reset = useCallback(() => {
    setFile(null);
    setBuffer(null);
    setAnalyzing(false);
    setProgress(0);
    setMd5Hex('');
    setSha1Hex('');
    setSha256Hex('');
    setEntropy(0);
    setStrings([]);
    setMagicHex('');
    setMagicType('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const runAnalysis = useCallback(async (ab) => {
    setAnalyzing(true);
    setProgress(0);
    const u8 = new Uint8Array(ab);

    setMagicHex(hexFirstN(ab, 16));
    setMagicType(detectFileType(ab));
    setProgress(8);
    await new Promise((r) => requestAnimationFrame(r));

    setMd5Hex(md5(ab));
    setProgress(28);
    await new Promise((r) => requestAnimationFrame(r));

    const s1 = await digestHex('SHA-1', ab);
    setSha1Hex(s1);
    setProgress(52);
    await new Promise((r) => requestAnimationFrame(r));

    const s256 = await digestHex('SHA-256', ab);
    setSha256Hex(s256);
    setProgress(72);
    await new Promise((r) => requestAnimationFrame(r));

    const ent = shannonEntropy(u8);
    setEntropy(ent);
    setProgress(85);
    await new Promise((r) => requestAnimationFrame(r));

    const strs = extractStrings(u8, 4);
    setStrings(strs);
    setProgress(100);
    setAnalyzing(false);
  }, []);

  const readFile = useCallback(
    (f) => {
      if (!f) return;
      setFile(f);
      setBuffer(null);
      setMd5Hex('');
      setSha1Hex('');
      setSha256Hex('');
      setEntropy(0);
      setStrings([]);
      setMagicHex('');
      setMagicType('');
      setAnalyzing(true);
      setProgress(0);

      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          setProgress(Math.min(5, Math.round((e.loaded / e.total) * 5)));
        }
      };
      reader.onload = () => {
        const ab = reader.result;
        setBuffer(ab);
        runAnalysis(ab);
      };
      reader.onerror = () => {
        setAnalyzing(false);
        setProgress(0);
      };
      reader.readAsArrayBuffer(f);
    },
    [runAnalysis],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) readFile(f);
    },
    [readFile],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  }, []);

  const onInputChange = useCallback(
    (e) => {
      const f = e.target.files?.[0];
      if (f) readFile(f);
    },
    [readFile],
  );

  const entStyle = entropyStyle(entropy);
  const stringPreview = strings.slice(0, 100);
  const hasResults = file && buffer && !analyzing;

  return (
    <div style={{ background: pageBg, minHeight: '100%', padding: '24px 20px 40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(125,211,252,0.12)',
              border: '1px solid rgba(125,211,252,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSearch size={20} color={accent} strokeWidth={2} />
          </div>
          <h1
            style={{
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              color: textPrimary,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            File Analyzer
          </h1>
        </div>

        {!file && (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              border: dragOver ? `2px solid ${accent}` : '2px dashed rgba(125,211,252,0.2)',
              borderRadius: 16,
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              background: dragOver ? 'rgba(125,211,252,0.04)' : 'transparent',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
          >
            <Upload size={40} color={accent} strokeWidth={1.75} style={{ opacity: 0.9 }} />
            <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 600, color: textPrimary }}>
              Drop a file here or click to browse
            </span>
            <span style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>All processing happens in your browser</span>
            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={onInputChange}
            />
          </div>
        )}

        {file && analyzing && (
          <Card style={{ borderColor: 'rgba(125,211,252,0.15)' }}>
            <ProgressBar value={progress} max={100} label={buffer ? 'Analyzing' : 'Reading file'} />
          </Card>
        )}

        {hasResults && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  fontFamily: heading,
                  fontSize: 13,
                  fontWeight: 600,
                  color: accent,
                  background: 'rgba(125,211,252,0.1)',
                  border: '1px solid rgba(125,211,252,0.35)',
                  borderRadius: 10,
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>

            <Card style={{ borderColor: 'rgba(125,211,252,0.12)' }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>
                File info
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={rowLabelStyle()}>Name</span>
                  <span style={rowValueStyle()}>{file.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={rowLabelStyle()}>Size</span>
                  <span style={rowValueStyle()}>{formatBytes(file.size)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={rowLabelStyle()}>MIME</span>
                  <span style={rowValueStyle()}>{file.type || '(none / unknown)'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={rowLabelStyle()}>Modified</span>
                  <span style={rowValueStyle()}>
                    {new Date(file.lastModified).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            </Card>

            <Card style={{ borderColor: 'rgba(125,211,252,0.12)' }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>
                Magic bytes
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: textPrimary, marginBottom: 10, wordBreak: 'break-all' }}>
                {magicHex || '—'}
              </div>
              <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 500, color: textMuted }}>
                Detected: <span style={{ color: accent }}>{magicType}</span>
              </div>
            </Card>

            <Card style={{ borderColor: 'rgba(125,211,252,0.12)' }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>
                Hashes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'MD5', value: md5Hex },
                  { label: 'SHA-1', value: sha1Hex },
                  { label: 'SHA-256', value: sha256Hex },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={rowLabelStyle()}>{label}</span>
                    <span style={rowValueStyle()}>{value || '—'}</span>
                    {value ? <CopyButton text={value} /> : null}
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ borderColor: 'rgba(125,211,252,0.12)' }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>
                Entropy
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: entStyle.color }}>
                  {entropy.toFixed(4)}
                </span>
                <span style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>bits / byte (max 8)</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: '#0B0F18',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (entropy / 8) * 100)}%`,
                    background: entStyle.bar,
                    borderRadius: 4,
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
              <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: entStyle.color }}>{entStyle.label}</div>
            </Card>

            <Card style={{ borderColor: 'rgba(125,211,252,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent }}>Strings</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>
                  Showing {stringPreview.length} of {strings.length} (min length 4, ASCII)
                </div>
              </div>
              <pre
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: textPrimary,
                  background: '#0B0F18',
                  borderRadius: 10,
                  padding: 12,
                  margin: 0,
                  maxHeight: 300,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {stringPreview.length ? stringPreview.join('\n') : 'No printable ASCII strings found.'}
              </pre>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

import { useCallback, useRef, useState } from "react";
import {
  Eye,
  Upload,
  Image,
  Type,
  ScanSearch,
  Download,
  Lock,
  Unlock,
  EyeOff,
  Palette,
  Binary,
  BookOpen,
  Waves,
  Network,
  ListOrdered,
  FileStack,
  Wrench,
  Trophy,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const pageBg = "#141820";
const surfaceBg = "#1A1F2E";
const textPrimary = "#E8EDF5";
const textMuted = "#8B95A8";
const accent = "#6EE7B7";

const accentBg = "rgba(110,231,183,0.12)";
const accentBorder = "rgba(110,231,183,0.35)";
const accentBorderSoft = "rgba(110,231,183,0.15)";
const cardBg = "#1E2536";

const TABS = [
  { id: "image", label: "Image Stego", icon: Image },
  { id: "text", label: "Text Stego", icon: Type },
  { id: "audio", label: "Audio Stego", icon: Waves },
  { id: "file", label: "File Stego", icon: FileStack },
  { id: "tools", label: "Tools Reference", icon: Wrench },
  { id: "ctf", label: "CTF Challenges", icon: Trophy },
];

function formatBytes(n) {
  if (n === 0) return "0 bytes";
  const units = ["bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log2(n) / 10), units.length - 1);
  const v = n / 1024 ** i;
  return `${i === 0 ? n : v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

function extractStrings(uint8, minLen = 4) {
  const strings = [];
  let cur = [];
  for (let i = 0; i < uint8.length; i++) {
    const b = uint8[i];
    if (b >= 0x20 && b <= 0x7e) {
      cur.push(b);
    } else {
      if (cur.length >= minLen) strings.push(String.fromCharCode(...cur));
      cur = [];
    }
  }
  if (cur.length >= minLen) strings.push(String.fromCharCode(...cur));
  return strings;
}

function getMagicBytes(u8) {
  const slice = u8.slice(0, 16);
  return Array.from(slice)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

function detectImageFormat(u8) {
  const b = (i) => u8[i] ?? 0;
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47)
    return "PNG";
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return "JPEG";
  if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46) return "GIF";
  if (b(0) === 0x42 && b(1) === 0x4d) return "BMP";
  if (b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46) {
    if (b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50)
      return "WEBP";
  }
  return "Unknown";
}

function parseJpegExif(u8) {
  const tags = {};
  let i = 2;
  while (i < u8.length - 1) {
    if (u8[i] !== 0xff) break;
    const marker = u8[i + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const segLen = (u8[i + 2] << 8) | u8[i + 3];
    if (marker === 0xe1) {
      const exifStr = String.fromCharCode(
        u8[i + 4],
        u8[i + 5],
        u8[i + 6],
        u8[i + 7],
      );
      if (exifStr === "Exif") {
        tags.hasExif = true;
        const tiffStart = i + 10;
        if (tiffStart + 8 < u8.length) {
          const byteOrder = (u8[tiffStart] << 8) | u8[tiffStart + 1];
          tags.byteOrder =
            byteOrder === 0x4d4d
              ? "Big Endian (Motorola)"
              : "Little Endian (Intel)";
          const le = byteOrder !== 0x4d4d;
          const read16 = (off) =>
            le ? (u8[off + 1] << 8) | u8[off] : (u8[off] << 8) | u8[off + 1];
          const read32 = (off) =>
            le
              ? (u8[off + 3] << 24) |
                (u8[off + 2] << 16) |
                (u8[off + 1] << 8) |
                u8[off]
              : (u8[off] << 24) |
                (u8[off + 1] << 16) |
                (u8[off + 2] << 8) |
                u8[off + 3];
          const ifdOffset = read32(tiffStart + 4);
          const ifdStart = tiffStart + ifdOffset;
          if (ifdStart + 2 < u8.length) {
            const entryCount = read16(ifdStart);
            tags.ifdEntries = entryCount;
            for (let e = 0; e < Math.min(entryCount, 50); e++) {
              const entryOff = ifdStart + 2 + e * 12;
              if (entryOff + 12 > u8.length) break;
              const tagId = read16(entryOff);
              const val = read32(entryOff + 8);
              if (tagId === 0x0100) tags.imageWidth = val;
              if (tagId === 0x0101) tags.imageHeight = val;
              if (tagId === 0x0112) tags.orientation = val;
              if (tagId === 0x010f) {
                const strOff = tiffStart + val;
                if (strOff < u8.length) {
                  let s = "";
                  for (
                    let c = 0;
                    c < 64 && strOff + c < u8.length && u8[strOff + c];
                    c++
                  ) {
                    s += String.fromCharCode(u8[strOff + c]);
                  }
                  if (s) tags.make = s;
                }
              }
            }
          }
        }
      }
    }
    i += 2 + segLen;
  }
  return tags;
}

function drawHistogram(canvas, imgData) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const rCounts = new Uint32Array(256);
  const gCounts = new Uint32Array(256);
  const bCounts = new Uint32Array(256);

  for (let i = 0; i < imgData.data.length; i += 4) {
    rCounts[imgData.data[i]]++;
    gCounts[imgData.data[i + 1]]++;
    bCounts[imgData.data[i + 2]]++;
  }

  let max = 0;
  for (let i = 0; i < 256; i++) {
    if (rCounts[i] > max) max = rCounts[i];
    if (gCounts[i] > max) max = gCounts[i];
    if (bCounts[i] > max) max = bCounts[i];
  }

  ctx.fillStyle = surfaceBg;
  ctx.fillRect(0, 0, w, h);

  const barW = w / 256;
  const channels = [
    { counts: rCounts, color: "rgba(239,68,68,0.55)" },
    { counts: gCounts, color: "rgba(110,231,183,0.55)" },
    { counts: bCounts, color: "rgba(96,165,250,0.55)" },
  ];

  for (const { counts, color } of channels) {
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) {
      const barH = max > 0 ? (counts[i] / max) * (h - 10) : 0;
      ctx.fillRect(i * barW, h - barH, barW + 0.5, barH);
    }
  }
}

function countZeroWidthChars(s) {
  let n = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp === 0x200b || cp === 0x200c || cp === 0x200d || cp === 0xfeff) n++;
  }
  return n;
}

/** U+200B = 0, U+200C = 1; U+200D frames payload */
const ZW_0 = "\u200B";
const ZW_1 = "\u200C";
const ZW_MARK = "\u200D";

function encodeZeroWidth(visible, hidden) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(hidden);
  const msgBitLen = bytes.length * 8;
  const bits = [];
  for (let i = 31; i >= 0; i--) bits.push((msgBitLen >> i) & 1);
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  const zwPayload =
    ZW_MARK + bits.map((b) => (b === 0 ? ZW_0 : ZW_1)).join("") + ZW_MARK;
  const mid = Math.floor(visible.length / 2) || 1;
  return visible.slice(0, mid) + zwPayload + visible.slice(mid);
}

function decodeZeroWidth(text) {
  const parts = text.split(ZW_MARK);
  if (parts.length < 3)
    return {
      message: "",
      error: "No framed zero-width payload (U+200D markers) found.",
    };
  const inner = parts.slice(1, -1).join(ZW_MARK);
  const bits = [];
  for (const ch of inner) {
    if (ch === ZW_0) bits.push(0);
    else if (ch === ZW_1) bits.push(1);
  }
  if (bits.length < 32) return { message: "", error: "Payload too short." };
  let len = 0;
  for (let i = 0; i < 32; i++) len = (len << 1) | bits[i];
  const need = 32 + len;
  if (bits.length < need || len < 0 || len > 10_000_000) {
    return {
      message: "",
      error: "Invalid length prefix or truncated payload.",
    };
  }
  const bytes = [];
  for (let i = 32; i < need; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    bytes.push(byte);
  }
  try {
    return {
      message: new TextDecoder().decode(new Uint8Array(bytes)),
      error: "",
    };
  } catch {
    return { message: "", error: "Invalid UTF-8 in decoded bytes." };
  }
}

function encodeWhitespace(coverText, hiddenMsg) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(hiddenMsg);
  const lines = coverText.split("\n");
  const bits = [];
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  const result = [];
  let bitIdx = 0;
  for (let i = 0; i < lines.length && bitIdx < bits.length; i++) {
    let trailing = "";
    for (let j = 0; j < 8 && bitIdx < bits.length; j++, bitIdx++) {
      trailing += bits[bitIdx] === 1 ? "\t" : " ";
    }
    result.push(lines[i] + trailing);
  }
  for (let i = result.length; i < lines.length; i++) {
    result.push(lines[i]);
  }
  return result.join("\n");
}

function decodeWhitespace(text) {
  const lines = text.split("\n");
  const bits = [];
  for (const line of lines) {
    const m = line.match(/\s+$/);
    if (!m) continue;
    const trailing = m[0];
    for (const ch of trailing) {
      if (ch === " ") bits.push(0);
      else if (ch === "\t") bits.push(1);
    }
  }
  const bytes = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    bytes.push(byte);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function decodeAcrostic(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l[0] ?? "")
    .join("");
}

function encodeAcrostic(coverLinesText, secret) {
  const lines = coverLinesText.split("\n");
  const chars = [...secret];
  const out = [];
  const n = Math.max(lines.length, chars.length);
  for (let i = 0; i < n; i++) {
    const ch = chars[i] ?? "";
    const rest = lines[i] ?? "";
    out.push(ch + rest);
  }
  return out.join("\n");
}

function decodeCapitalLetters(text) {
  return [...text].filter((ch) => ch >= "A" && ch <= "Z").join("");
}

function encodeCapitalLetters(coverText, secret) {
  const sec = secret.replace(/[^A-Za-z]/g, "");
  const words = coverText.split(/(\s+)/);
  let si = 0;
  return words
    .map((w) => {
      if (/^\s+$/.test(w) || !w) return w;
      if (si >= sec.length) return w;
      const wantUpper = sec[si];
      si++;
      if (!w.length) return w;
      const first = w[0];
      const rest = w.slice(1);
      const mapped =
        first.toLowerCase() === wantUpper.toLowerCase()
          ? wantUpper.toUpperCase() + rest
          : first + rest;
      return mapped;
    })
    .join("");
}

/** Extra space after word = 1, single space = 0 (between words only) */
function encodeWordSpacing(sentence, hidden) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(hidden);
  const bits = [];
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return sentence;
  const gaps = words.length - 1;
  const out = [words[0]];
  for (let g = 0; g < gaps; g++) {
    const bit = bits[g % bits.length];
    out.push(bit === 1 ? "  " : " ");
    out.push(words[g + 1]);
  }
  return out.join("");
}

function decodeWordSpacing(sentence) {
  const bits = [];
  const re = /(\s+)/g;
  let lastEnd = 0;
  let first = true;
  let m;
  while ((m = re.exec(sentence)) !== null) {
    if (first) {
      first = false;
      lastEnd = m.index + m[0].length;
      continue;
    }
    const ws = m[1];
    if (ws.length >= 2) bits.push(1);
    else bits.push(0);
    lastEnd = m.index + m[0].length;
  }
  const bytes = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    bytes.push(byte);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

const HOMOGLYPHS = {
  a: ["а", "ɑ", "α"],
  c: ["с", "ϲ"],
  e: ["е", "ë"],
  o: ["о", "ο", "ᴏ"],
  p: ["р", "ρ"],
  x: ["х", "ẋ"],
  y: ["у", "ý"],
  A: ["А", "Α"],
  B: ["В", "Β"],
  C: ["С", "Ϲ"],
  E: ["Е", "Ε"],
  H: ["Н", "Η"],
  I: ["І", "Ι"],
  K: ["К", "Κ"],
  M: ["М", "Μ"],
  N: ["Ν"],
  O: ["О", "Ο"],
  P: ["Р", "Ρ"],
  S: ["Ѕ"],
  T: ["Т", "Τ"],
  X: ["Х", "Χ"],
  Z: ["Ζ"],
};

function detectHomoglyphs(text) {
  const allHomoglyphs = {};
  for (const [ascii, alts] of Object.entries(HOMOGLYPHS)) {
    for (const alt of alts) allHomoglyphs[alt] = ascii;
  }
  const found = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (allHomoglyphs[ch]) {
      found.push({
        index: i,
        char: ch,
        codepoint: `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
        looksLike: allHomoglyphs[ch],
      });
    }
  }
  return found;
}

function homoglyphEncodeAscii(plain, secretBits) {
  const bits =
    typeof secretBits === "string"
      ? [...new TextEncoder().encode(secretBits)].flatMap((byte) =>
          Array.from({ length: 8 }, (_, b) => (byte >> (7 - b)) & 1),
        )
      : secretBits;
  let bi = 0;
  return [...plain]
    .map((ch) => {
      const alts = HOMOGLYPHS[ch];
      if (!alts || bi >= bits.length) return ch;
      const useAlt = bits[bi] === 1;
      bi++;
      return useAlt ? alts[0] : ch;
    })
    .join("");
}

function homoglyphToAsciiGuess(text) {
  const map = {};
  for (const [ascii, alts] of Object.entries(HOMOGLYPHS)) {
    for (const alt of alts) map[alt] = ascii;
  }
  return [...text].map((ch) => map[ch] ?? ch).join("");
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function getImageData(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

function imageDataToDataURL(imgData) {
  const c = document.createElement("canvas");
  c.width = imgData.width;
  c.height = imgData.height;
  c.getContext("2d").putImageData(imgData, 0, 0);
  return c.toDataURL("image/png");
}

function downloadDataURL(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function CodeBlock({ code, style: sx }) {
  return (
    <div
      style={{
        position: "relative",
        background: surfaceBg,
        border: `1px solid ${accentBorderSoft}`,
        borderRadius: 10,
        padding: "10px 40px 10px 12px",
        marginBottom: 10,
        ...sx,
      }}
    >
      <pre
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: textPrimary,
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.5,
        }}
      >
        {code}
      </pre>
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function DropZone({ onFile, accept, label }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
      }}
      style={{
        border: dragOver ? `2px solid ${accent}` : `2px dashed ${accentBorder}`,
        borderRadius: 16,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        background: dragOver ? accentBg : "transparent",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <Upload
        size={32}
        color={accent}
        strokeWidth={1.75}
        style={{ opacity: 0.9 }}
      />
      <span
        style={{
          fontFamily: heading,
          fontSize: 14,
          fontWeight: 600,
          color: textPrimary,
        }}
      >
        {label || "Drop an image here or click to browse"}
      </span>
      <span style={{ fontFamily: mono, fontSize: 10, color: textMuted }}>
        PNG, JPG, GIF, BMP, WEBP
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/*"}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontFamily: heading,
        fontSize: 14,
        fontWeight: 600,
        color: accent,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Btn({
  onClick,
  children,
  active,
  small,
  disabled,
  style: extraStyle,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: mono,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        color: active ? pageBg : accent,
        background: active ? accent : accentBg,
        border: `1px solid ${active ? accent : accentBorder}`,
        borderRadius: 8,
        padding: small ? "4px 10px" : "6px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

function Prose({ children }) {
  return (
    <p
      style={{
        fontFamily: mono,
        fontSize: 11,
        color: textPrimary,
        lineHeight: 1.7,
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }) {
  return (
    <ul
      style={{
        margin: "0 0 14px",
        paddingLeft: 18,
        fontFamily: mono,
        fontSize: 11,
        color: textMuted,
        lineHeight: 1.65,
      }}
    >
      {items.map((t, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ========== TAB 1: IMAGE STEGO ========== */
function ImageStegoTab() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [info, setInfo] = useState(null);
  const [histogram, setHistogram] = useState("");
  const [strings, setStrings] = useState([]);
  const [img, setImg] = useState(null);

  const [lsbMode, setLsbMode] = useState("extract");
  const [channel, setChannel] = useState("R");
  const [bitPlane, setBitPlane] = useState(0);
  const [outputFormat, setOutputFormat] = useState("text");
  const [result, setResult] = useState("");
  const [resultImg, setResultImg] = useState("");
  const [embedText, setEmbedText] = useState("");
  const [stegoPreview, setStegoPreview] = useState("");
  const [stegoDataUrl, setStegoDataUrl] = useState("");

  const [bitPlanes, setBitPlanes] = useState([]);
  const [channels, setChannels] = useState({ r: "", g: "", b: "", a: "" });
  const [showBitPlanes, setShowBitPlanes] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [transforms, setTransforms] = useState({
    invert: "",
    contrast: "",
    grayscale: "",
  });

  const analyze = useCallback(async (f) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const ab = await f.arrayBuffer();
    const u8 = new Uint8Array(ab);
    const format = detectImageFormat(u8);
    const magic = getMagicBytes(u8);
    const exif = format === "JPEG" ? parseJpegExif(u8) : {};

    const loaded = await loadImageFromFile(f);
    setImg(loaded);
    const imgData = getImageData(loaded);

    const colorSet = new Set();
    for (let i = 0; i < imgData.data.length; i += 4) {
      colorSet.add(
        (imgData.data[i] << 16) |
          (imgData.data[i + 1] << 8) |
          imgData.data[i + 2],
      );
    }

    setInfo({
      width: loaded.naturalWidth,
      height: loaded.naturalHeight,
      size: f.size,
      format,
      magic,
      bitsPerPixel:
        (imgData.data.length / (loaded.naturalWidth * loaded.naturalHeight)) *
        8,
      uniqueColors: colorSet.size,
      exif,
    });

    const hCanvas = document.createElement("canvas");
    hCanvas.width = 512;
    hCanvas.height = 160;
    drawHistogram(hCanvas, imgData);
    setHistogram(hCanvas.toDataURL());

    setStrings(extractStrings(u8, 4).slice(0, 200));
    setResult("");
    setResultImg("");
    setStegoPreview("");
    setStegoDataUrl("");
    setBitPlanes([]);
    setChannels({ r: "", g: "", b: "", a: "" });
    setShowBitPlanes(false);
    setShowChannels(false);
    setTransforms({ invert: "", contrast: "", grayscale: "" });
  }, []);

  const extractLSB = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    const channelIndices =
      channel === "All" ? [0, 1, 2] : [["R", "G", "B"].indexOf(channel)];
    const bits = [];
    for (let i = 0; i < px.length; i += 4) {
      for (const ci of channelIndices) {
        bits.push((px[i + ci] >> bitPlane) & 1);
      }
    }
    if (outputFormat === "binary") {
      setResult(bits.slice(0, 10000).join(""));
      setResultImg("");
    } else if (outputFormat === "text") {
      let decoded = "";
      const isEmbedChannel = channel === "R" && bitPlane === 0;
      if (isEmbedChannel && bits.length >= 32) {
        let msgBitLen = 0;
        for (let i = 0; i < 32; i++) msgBitLen = (msgBitLen << 1) | bits[i];
        if (
          msgBitLen > 0 &&
          msgBitLen <= 10_000_000 &&
          32 + msgBitLen <= bits.length
        ) {
          const bytes = [];
          for (let i = 32; i < 32 + msgBitLen; i += 8) {
            let byte = 0;
            for (let b = 0; b < 8 && i + b < 32 + msgBitLen; b++)
              byte = (byte << 1) | bits[i + b];
            bytes.push(byte);
          }
          try {
            decoded = new TextDecoder("utf-8", { fatal: true }).decode(
              new Uint8Array(bytes),
            );
          } catch {
            /* not a valid embed, fall through */
          }
        }
      }
      if (!decoded) {
        const chars = [];
        for (let i = 0; i + 7 < bits.length && chars.length < 5000; i += 8) {
          let byte = 0;
          for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
          if (byte === 0) break;
          if (byte >= 32 && byte <= 126) chars.push(String.fromCharCode(byte));
          else chars.push(".");
        }
        decoded = chars.join("");
      }
      setResult(decoded);
      setResultImg("");
    } else {
      const outData = new ImageData(data.width, data.height);
      for (let i = 0; i < px.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const val = ((px[i + c] >> bitPlane) & 1) * 255;
          outData.data[i + c] = channelIndices.includes(c) ? val : 0;
        }
        outData.data[i + 3] = 255;
      }
      setResultImg(imageDataToDataURL(outData));
      setResult("");
    }
  }, [img, channel, bitPlane, outputFormat]);

  const embedLSB = useCallback(() => {
    if (!img || !embedText) return;
    const data = getImageData(img);
    const px = data.data;
    const msgBits = [];
    const encoder = new TextEncoder();
    const msgBytes = encoder.encode(embedText);
    const msgBitLen = msgBytes.length * 8;
    const lenBits = [];
    for (let i = 31; i >= 0; i--) lenBits.push((msgBitLen >> i) & 1);
    msgBits.push(...lenBits);
    for (const byte of msgBytes) {
      for (let b = 7; b >= 0; b--) msgBits.push((byte >> b) & 1);
    }
    const maxBits = Math.floor(px.length / 4);
    if (msgBits.length > maxBits) {
      setResult("Message too long for this image!");
      return;
    }
    for (let i = 0; i < msgBits.length; i++) {
      const pxIdx = i * 4;
      px[pxIdx] = (px[pxIdx] & 0xfe) | msgBits[i];
    }
    const outUrl = imageDataToDataURL(data);
    setStegoPreview(outUrl);
    setStegoDataUrl(outUrl);
    setResult(
      `Embedded ${embedText.length} characters (${msgBits.length} bits) into R channel LSB`,
    );
  }, [img, embedText]);

  const generateBitPlanes = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    const w = data.width;
    const h = data.height;
    const planes = [];
    for (const chName of ["R", "G", "B"]) {
      const chIdx = ["R", "G", "B"].indexOf(chName);
      for (let bp = 0; bp < 8; bp++) {
        const out = new ImageData(w, h);
        for (let i = 0; i < px.length; i += 4) {
          const val = ((px[i + chIdx] >> bp) & 1) * 255;
          out.data[i] = chName === "R" ? val : 0;
          out.data[i + 1] = chName === "G" ? val : 0;
          out.data[i + 2] = chName === "B" ? val : 0;
          out.data[i + 3] = 255;
        }
        planes.push({ channel: chName, bit: bp, src: imageDataToDataURL(out) });
      }
    }
    setBitPlanes(planes);
    setShowBitPlanes(true);
  }, [img]);

  const generateChannels = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    const w = data.width;
    const h = data.height;
    const make = (chIdx) => {
      const out = new ImageData(w, h);
      for (let i = 0; i < px.length; i += 4) {
        if (chIdx === 3) {
          const a = px[i + 3];
          out.data[i] = a;
          out.data[i + 1] = a;
          out.data[i + 2] = a;
          out.data[i + 3] = 255;
        } else {
          out.data[i] = chIdx === 0 ? px[i] : 0;
          out.data[i + 1] = chIdx === 1 ? px[i + 1] : 0;
          out.data[i + 2] = chIdx === 2 ? px[i + 2] : 0;
          out.data[i + 3] = 255;
        }
      }
      return imageDataToDataURL(out);
    };
    setChannels({ r: make(0), g: make(1), b: make(2), a: make(3) });
    setShowChannels(true);
  }, [img]);

  const generateInvert = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      px[i] = 255 - px[i];
      px[i + 1] = 255 - px[i + 1];
      px[i + 2] = 255 - px[i + 2];
    }
    setTransforms((prev) => ({ ...prev, invert: imageDataToDataURL(data) }));
  }, [img]);

  const generateContrast = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    let min = 255;
    let max = 0;
    for (let i = 0; i < px.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        if (px[i + c] < min) min = px[i + c];
        if (px[i + c] > max) max = px[i + c];
      }
    }
    const range = max - min || 1;
    for (let i = 0; i < px.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        px[i + c] = Math.round(((px[i + c] - min) / range) * 255);
      }
    }
    setTransforms((prev) => ({ ...prev, contrast: imageDataToDataURL(data) }));
  }, [img]);

  const generateGrayscale = useCallback(() => {
    if (!img) return;
    const data = getImageData(img);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const gray = Math.round(
        px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114,
      );
      px[i] = gray;
      px[i + 1] = gray;
      px[i + 2] = gray;
    }
    setTransforms((prev) => ({ ...prev, grayscale: imageDataToDataURL(data) }));
  }, [img]);

  const textareaStyle = {
    fontFamily: mono,
    fontSize: 12,
    color: textPrimary,
    background: surfaceBg,
    border: `1px solid ${accentBorderSoft}`,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    resize: "vertical",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DropZone onFile={analyze} />

      {info && img && (
        <>
          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>File info</SectionTitle>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    borderRadius: 8,
                    background: surfaceBg,
                    border: `1px solid ${accentBorderSoft}`,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: 1,
                  minWidth: 200,
                }}
              >
                {[
                  ["Dimensions", `${info.width} × ${info.height} px`],
                  ["File size", formatBytes(info.size)],
                  ["Format", info.format],
                  ["Color depth", `${info.bitsPerPixel} bits/pixel (RGBA)`],
                  ["Unique colors", info.uniqueColors.toLocaleString()],
                  ["Magic bytes", info.magic],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: textMuted,
                        minWidth: 100,
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: textPrimary,
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {Object.keys(info.exif).length > 0 && (
            <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
              <SectionTitle>EXIF / metadata</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {info.exif.hasExif && (
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: accent,
                      marginBottom: 4,
                    }}
                  >
                    EXIF data found (APP1 marker 0xFFE1)
                  </div>
                )}
                {[
                  info.exif.byteOrder && ["Byte order", info.exif.byteOrder],
                  info.exif.ifdEntries && ["IFD entries", info.exif.ifdEntries],
                  info.exif.imageWidth && ["EXIF width", info.exif.imageWidth],
                  info.exif.imageHeight && [
                    "EXIF height",
                    info.exif.imageHeight,
                  ],
                  info.exif.orientation && [
                    "Orientation",
                    info.exif.orientation,
                  ],
                  info.exif.make && ["Camera make", info.exif.make],
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 8 }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: textMuted,
                          minWidth: 100,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: textPrimary,
                        }}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>Metadata stripping</SectionTitle>
            <Prose>
              EXIF, IPTC, XMP, and thumbnail blobs can leak GPS, device serials,
              software versions, or CTF flags. Stripping does not remove LSB or
              appended file data.
            </Prose>
            <CodeBlock code="exiftool -all= -overwrite_original image.jpg" />
            <CodeBlock code="exiv2 rm image.jpg" />
            <CodeBlock code="magick mogrify -strip *.jpg" />
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>Pixel value analysis (histogram)</SectionTitle>
            {histogram && (
              <img
                src={histogram}
                alt="histogram"
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: `1px solid ${accentBorderSoft}`,
                }}
              />
            )}
            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: textMuted,
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              LSB embedding can create paired spikes at 2n and 2n+1. Compare
              channels and look for unnatural regularity.
            </p>
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>Bit plane viewer (R / G / B)</SectionTitle>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <Btn onClick={generateBitPlanes}>
                <Binary size={12} style={{ marginRight: 4 }} />
                Generate all 24 planes
              </Btn>
            </div>
            {showBitPlanes && bitPlanes.length > 0 && (
              <>
                {["R", "G", "B"].map((ch) => (
                  <div key={ch} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 8,
                        color:
                          ch === "R"
                            ? "#EF4444"
                            : ch === "G"
                              ? accent
                              : "#60A5FA",
                      }}
                    >
                      {ch} channel
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {bitPlanes
                        .filter((p) => p.channel === ch)
                        .map((p) => (
                          <div
                            key={`${p.channel}-${p.bit}`}
                            style={{ position: "relative" }}
                          >
                            <img
                              src={p.src}
                              alt={`${p.channel} ${p.bit}`}
                              style={{
                                width: "100%",
                                borderRadius: 6,
                                border: `1px solid ${accentBorderSoft}`,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 4,
                                left: 4,
                                fontFamily: mono,
                                fontSize: 9,
                                background: "rgba(0,0,0,0.75)",
                                color: textPrimary,
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              bit {p.bit}
                              {p.bit === 0 ? " LSB" : p.bit === 7 ? " MSB" : ""}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                downloadDataURL(
                                  p.src,
                                  `${p.channel}_bit${p.bit}.png`,
                                )
                              }
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(0,0,0,0.6)",
                                border: "none",
                                borderRadius: 4,
                                padding: 3,
                                cursor: "pointer",
                              }}
                            >
                              <Download size={10} color={textPrimary} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>Color channel separation</SectionTitle>
            <Btn onClick={generateChannels}>
              <Palette size={12} style={{ marginRight: 4 }} />
              Show R / G / B / Alpha
            </Btn>
            {showChannels && (channels.r || channels.g) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {[
                  [channels.r, "RED", "channel_red.png"],
                  [channels.g, "GREEN", "channel_green.png"],
                  [channels.b, "BLUE", "channel_blue.png"],
                  [channels.a, "ALPHA (as gray)", "channel_alpha.png"],
                ].map(
                  ([src, lab, fn]) =>
                    src && (
                      <div key={lab}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              color: textMuted,
                            }}
                          >
                            {lab}
                          </span>
                          <Btn small onClick={() => downloadDataURL(src, fn)}>
                            <Download size={10} />
                          </Btn>
                        </div>
                        <img
                          src={src}
                          alt={lab}
                          style={{
                            width: "100%",
                            borderRadius: 8,
                            border: `1px solid ${accentBorderSoft}`,
                          }}
                        />
                      </div>
                    ),
                )}
              </div>
            )}
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>Quick transforms</SectionTitle>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn onClick={generateInvert}>Invert</Btn>
              <Btn onClick={generateContrast}>Enhance contrast</Btn>
              <Btn onClick={generateGrayscale}>Grayscale</Btn>
            </div>
            {transforms.invert && (
              <img
                src={transforms.invert}
                alt="inv"
                style={{
                  marginTop: 12,
                  maxWidth: "100%",
                  borderRadius: 8,
                  border: `1px solid ${accentBorderSoft}`,
                }}
              />
            )}
            {transforms.contrast && (
              <img
                src={transforms.contrast}
                alt="contrast"
                style={{
                  marginTop: 12,
                  maxWidth: "100%",
                  borderRadius: 8,
                  border: `1px solid ${accentBorderSoft}`,
                }}
              />
            )}
            {transforms.grayscale && (
              <img
                src={transforms.grayscale}
                alt="gray"
                style={{
                  marginTop: 12,
                  maxWidth: "100%",
                  borderRadius: 8,
                  border: `1px solid ${accentBorderSoft}`,
                }}
              />
            )}
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <SectionTitle>Extracted strings</SectionTitle>
              <span
                style={{ fontFamily: mono, fontSize: 10, color: textMuted }}
              >
                {strings.length} strings (min 4, ASCII)
              </span>
            </div>
            <pre
              style={{
                fontFamily: mono,
                fontSize: 11,
                lineHeight: 1.5,
                color: textPrimary,
                background: surfaceBg,
                borderRadius: 10,
                padding: 12,
                margin: 0,
                maxHeight: 220,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {strings.length
                ? strings.join("\n")
                : "No printable ASCII strings found."}
            </pre>
          </Card>

          <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
            <SectionTitle>LSB — text in pixels</SectionTitle>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Btn
                active={lsbMode === "extract"}
                onClick={() => setLsbMode("extract")}
              >
                <Unlock size={12} style={{ marginRight: 4 }} />
                Extract
              </Btn>
              <Btn
                active={lsbMode === "embed"}
                onClick={() => setLsbMode("embed")}
              >
                <Lock size={12} style={{ marginRight: 4 }} />
                Embed
              </Btn>
            </div>
            {lsbMode === "extract" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: textMuted,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    CHANNEL
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["R", "G", "B", "All"].map((ch) => (
                      <Btn
                        key={ch}
                        small
                        active={channel === ch}
                        onClick={() => setChannel(ch)}
                      >
                        {ch}
                      </Btn>
                    ))}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: textMuted,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    BIT PLANE
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((bp) => (
                      <Btn
                        key={bp}
                        small
                        active={bitPlane === bp}
                        onClick={() => setBitPlane(bp)}
                      >
                        {bp}
                        {bp === 0 ? " LSB" : bp === 7 ? " MSB" : ""}
                      </Btn>
                    ))}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: textMuted,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    OUTPUT
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      ["text", "Text"],
                      ["binary", "Binary"],
                      ["image", "Image"],
                    ].map(([val, label]) => (
                      <Btn
                        key={val}
                        small
                        active={outputFormat === val}
                        onClick={() => setOutputFormat(val)}
                      >
                        {label}
                      </Btn>
                    ))}
                  </div>
                </div>
                <Btn onClick={extractLSB}>Extract bits</Btn>
              </div>
            )}
            {lsbMode === "embed" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <textarea
                  placeholder="Secret message…"
                  value={embedText}
                  onChange={(e) => setEmbedText(e.target.value)}
                  style={textareaStyle}
                />
                <div
                  style={{ fontFamily: mono, fontSize: 10, color: textMuted }}
                >
                  Max capacity ≈{" "}
                  {Math.floor(
                    (img.naturalWidth * img.naturalHeight * 1 - 32) / 8,
                  )}{" "}
                  chars (R LSB, 32-bit length prefix)
                </div>
                <Btn onClick={embedLSB} disabled={!embedText}>
                  Embed message
                </Btn>
              </div>
            )}
          </Card>

          {result && (
            <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <SectionTitle>LSB result</SectionTitle>
                {outputFormat !== "image" && <CopyButton text={result} />}
              </div>
              <pre
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: textPrimary,
                  background: surfaceBg,
                  borderRadius: 8,
                  padding: 10,
                  margin: 0,
                  maxHeight: 240,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {result}
              </pre>
            </Card>
          )}

          {resultImg && (
            <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <SectionTitle>Bit plane preview</SectionTitle>
                <Btn
                  small
                  onClick={() => downloadDataURL(resultImg, "bitplane.png")}
                >
                  <Download size={12} style={{ marginRight: 4 }} />
                  Save
                </Btn>
              </div>
              <img
                src={resultImg}
                alt="bit plane"
                style={{
                  maxWidth: "100%",
                  borderRadius: 8,
                  border: `1px solid ${accentBorderSoft}`,
                }}
              />
            </Card>
          )}

          {stegoPreview && preview && (
            <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
              <SectionTitle>Original vs stego</SectionTitle>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: textMuted,
                      marginBottom: 6,
                    }}
                  >
                    ORIGINAL
                  </div>
                  <img
                    src={preview}
                    alt="orig"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      border: `1px solid ${accentBorderSoft}`,
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: textMuted,
                      marginBottom: 6,
                    }}
                  >
                    STEGO
                  </div>
                  <img
                    src={stegoPreview}
                    alt="stego"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      border: `1px solid ${accentBorderSoft}`,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn
                  onClick={() =>
                    downloadDataURL(stegoDataUrl, "stego_output.png")
                  }
                >
                  <Download size={12} style={{ marginRight: 4 }} />
                  Download PNG
                </Btn>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const TEXT_METHODS = [
  {
    id: "zero-width",
    label: "Zero-Width",
    desc: "Hide data using invisible Unicode characters (U+200B/U+200C) framed by U+200D markers.",
    hasEncode: true,
    hasDecode: true,
    coverLabel: "Visible text",
  },
  {
    id: "whitespace",
    label: "Whitespace",
    desc: "Encode data as trailing spaces (0) and tabs (1) at the end of each line.",
    hasEncode: true,
    hasDecode: true,
    coverLabel: "Cover text (multi-line)",
  },
  {
    id: "acrostic",
    label: "Acrostic",
    desc: "Hide a message by using the first character of each line.",
    hasEncode: true,
    hasDecode: true,
    coverLabel: "Cover lines",
  },
  {
    id: "capitals",
    label: "Capital Letters",
    desc: "Encode a secret by capitalizing the first letter of selected words.",
    hasEncode: true,
    hasDecode: true,
    coverLabel: "Cover text",
  },
  {
    id: "word-spacing",
    label: "Word Spacing",
    desc: "Single space = 0, double space = 1 between words.",
    hasEncode: true,
    hasDecode: true,
    coverLabel: "Cover sentence",
  },
  {
    id: "homoglyph",
    label: "Homoglyphs",
    desc: "Replace ASCII characters with visually identical Unicode lookalikes to hide bits.",
    hasEncode: true,
    hasDecode: true,
    hasDetect: true,
    coverLabel: "Plain ASCII text",
  },
];

function TextStegoTab() {
  const [method, setMethod] = useState("zero-width");
  const [mode, setMode] = useState("encode");
  const [cover, setCover] = useState("");
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const m = TEXT_METHODS.find((t) => t.id === method);

  const run = useCallback(() => {
    setError("");
    setOutput("");
    try {
      if (mode === "encode") {
        if (!cover || !secret) {
          setError("Provide both cover text and secret message.");
          return;
        }
        let result = "";
        switch (method) {
          case "zero-width":
            result = encodeZeroWidth(cover, secret);
            break;
          case "whitespace":
            result = encodeWhitespace(cover, secret);
            break;
          case "acrostic":
            result = encodeAcrostic(cover, secret);
            break;
          case "capitals":
            result = encodeCapitalLetters(cover, secret);
            break;
          case "word-spacing":
            result = encodeWordSpacing(cover, secret);
            break;
          case "homoglyph":
            result = homoglyphEncodeAscii(cover, secret);
            break;
        }
        setOutput(result);
      } else if (mode === "decode") {
        if (!input) {
          setError("Paste encoded text to decode.");
          return;
        }
        let result = "";
        switch (method) {
          case "zero-width": {
            const r = decodeZeroWidth(input);
            if (r.error) {
              setError(r.error);
              return;
            }
            result = r.message;
            break;
          }
          case "whitespace":
            result = decodeWhitespace(input);
            break;
          case "acrostic":
            result = decodeAcrostic(input);
            break;
          case "capitals":
            result = decodeCapitalLetters(input);
            break;
          case "word-spacing":
            result = decodeWordSpacing(input);
            break;
          case "homoglyph":
            result = homoglyphToAsciiGuess(input);
            break;
        }
        setOutput(result);
      } else {
        if (!input) {
          setError("Paste text to analyze.");
          return;
        }
        const hits = detectHomoglyphs(input);
        const zwCount = countZeroWidthChars(input);
        const parts = [];
        if (zwCount > 0) parts.push(`${zwCount} zero-width character(s) found`);
        if (hits.length > 0) {
          parts.push(
            `${hits.length} homoglyph(s):\n` +
              hits
                .map(
                  (h) =>
                    `  pos ${h.index}: '${h.looksLike}' → ${h.codepoint} (${h.char})`,
                )
                .join("\n"),
          );
        }
        setOutput(
          parts.length ? parts.join("\n\n") : "No hidden characters detected.",
        );
      }
    } catch (e) {
      setError(e.message || "Unknown error");
    }
  }, [method, mode, cover, secret, input]);

  const inputStyle = {
    width: "100%",
    minHeight: 80,
    background: pageBg,
    border: `1px solid ${accentBorderSoft}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontFamily: mono,
    fontSize: 12,
    color: textPrimary,
    resize: "vertical",
    outline: "none",
  };

  const btnStyle = {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 18px",
    borderRadius: 8,
    cursor: "pointer",
    border: `1px solid ${accentBorder}`,
    background: accentBg,
    color: accent,
    transition: "all 0.15s",
  };

  return (
    <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Type size={18} style={{ color: accent }} />
          <span
            style={{
              fontFamily: heading,
              fontSize: 16,
              fontWeight: 700,
              color: textPrimary,
            }}
          >
            Text Steganography
          </span>
        </div>

        {/* Method selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TEXT_METHODS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setMethod(t.id);
                setOutput("");
                setError("");
              }}
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 6,
                cursor: "pointer",
                border: `1px solid ${t.id === method ? accentBorder : "rgba(255,255,255,0.06)"}`,
                background: t.id === method ? accentBg : "transparent",
                color: t.id === method ? accent : textMuted,
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: textMuted,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {m?.desc}
        </p>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 0 }}>
          {["encode", "decode", ...(m?.hasDetect ? ["detect"] : [])].map(
            (md) => {
              const active = md === mode;
              return (
                <button
                  key={md}
                  onClick={() => {
                    setMode(md);
                    setOutput("");
                    setError("");
                  }}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 16px",
                    cursor: "pointer",
                    border: `1px solid ${active ? accentBorder : "rgba(255,255,255,0.06)"}`,
                    background: active ? accentBg : "transparent",
                    color: active ? accent : textMuted,
                    borderRadius:
                      md === "encode"
                        ? "6px 0 0 6px"
                        : md === "detect" || (md === "decode" && !m?.hasDetect)
                          ? "0 6px 6px 0"
                          : 0,
                    marginLeft: md !== "encode" ? -1 : 0,
                    transition: "all 0.15s",
                  }}
                >
                  {md[0].toUpperCase() + md.slice(1)}
                </button>
              );
            },
          )}
        </div>

        {/* Inputs */}
        {mode === "encode" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 600,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {m?.coverLabel || "Cover text"}
              </label>
              <textarea
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Enter cover text..."
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 600,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Secret message
              </label>
              <textarea
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret message..."
                style={{ ...inputStyle, minHeight: 50 }}
              />
            </div>
          </div>
        )}
        {(mode === "decode" || mode === "detect") && (
          <div>
            <label
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 4,
              }}
            >
              {mode === "detect" ? "Text to analyze" : "Encoded text"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "detect"
                  ? "Paste suspicious text..."
                  : "Paste encoded text..."
              }
              style={inputStyle}
            />
          </div>
        )}

        <button onClick={run} style={btnStyle}>
          {mode === "encode"
            ? "Encode"
            : mode === "decode"
              ? "Decode"
              : "Detect"}
        </button>

        {error && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "#FB7185",
              background: "rgba(251,113,133,0.08)",
              border: "1px solid rgba(251,113,133,0.2)",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            {error}
          </div>
        )}

        {output && (
          <div style={{ position: "relative" }}>
            <label
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 600,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 4,
              }}
            >
              Result
            </label>
            <div style={{ position: "absolute", top: 0, right: 0 }}>
              <CopyButton text={output} />
            </div>
            <pre
              style={{
                background: pageBg,
                border: `1px solid ${accentBorderSoft}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: mono,
                fontSize: 12,
                color: textPrimary,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: 300,
                overflow: "auto",
                margin: 0,
              }}
            >
              {output}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}

const STEGO_TOOLS = [
  {
    category: "Metadata",
    tools: [
      {
        name: "exiftool",
        desc: "Read/write/strip metadata from images, audio, video, PDF",
        cmds: [
          { label: "View all metadata", cmd: "exiftool image.png" },
          { label: "Strip all metadata", cmd: "exiftool -all= image.png" },
          { label: "Export to JSON", cmd: "exiftool -j image.png" },
        ],
      },
      {
        name: "pngcheck",
        desc: "Validate PNG structure and detect anomalies",
        cmds: [
          { label: "Verbose check", cmd: "pngcheck -v image.png" },
          { label: "Print text chunks", cmd: "pngcheck -t image.png" },
        ],
      },
    ],
  },
  {
    category: "Extraction & Carving",
    tools: [
      {
        name: "binwalk",
        desc: "Scan for embedded files and extract them",
        cmds: [
          { label: "Scan for signatures", cmd: "binwalk image.png" },
          { label: "Extract embedded files", cmd: "binwalk -e image.png" },
          { label: "Entropy analysis", cmd: "binwalk -E image.png" },
        ],
      },
      {
        name: "foremost",
        desc: "Carve files from raw data by header/footer",
        cmds: [
          { label: "Carve all types", cmd: "foremost -i image.png -o output/" },
          {
            label: "Carve specific type",
            cmd: "foremost -t jpg -i dump.raw -o output/",
          },
        ],
      },
    ],
  },
  {
    category: "Image Steganography",
    tools: [
      {
        name: "steghide",
        desc: "Hide/extract data in JPEG/BMP/WAV/AU using passphrase",
        cmds: [
          {
            label: "Embed data",
            cmd: "steghide embed -cf cover.jpg -ef secret.txt -p password",
          },
          {
            label: "Extract data",
            cmd: "steghide extract -sf stego.jpg -p password",
          },
          { label: "Get file info", cmd: "steghide info stego.jpg" },
        ],
      },
      {
        name: "zsteg",
        desc: "Detect LSB steganography in PNG/BMP",
        cmds: [
          { label: "All checks", cmd: "zsteg image.png" },
          { label: "Specific bit plane", cmd: "zsteg -b 1 image.png" },
          { label: "Extract payload", cmd: 'zsteg -e "b1,r,lsb,xy" image.png' },
        ],
      },
      {
        name: "stegsolve",
        desc: "Visual analysis with bit plane viewer and frame browser",
        cmds: [{ label: "Launch GUI", cmd: "java -jar stegsolve.jar" }],
      },
      {
        name: "stegseek",
        desc: "Brute-force steghide passphrases (fast wordlist attack)",
        cmds: [
          {
            label: "Crack with wordlist",
            cmd: "stegseek stego.jpg wordlist.txt",
          },
          {
            label: "Seed crack (no wordlist)",
            cmd: "stegseek --seed stego.jpg",
          },
        ],
      },
    ],
  },
  {
    category: "Audio Steganography",
    tools: [
      {
        name: "sonic-visualiser",
        desc: "Spectrogram analysis for hidden audio messages",
        cmds: [{ label: "Open file", cmd: "sonic-visualiser audio.wav" }],
      },
      {
        name: "Audacity",
        desc: "Waveform + spectrogram viewer, reverse audio",
        cmds: [{ label: "Open file", cmd: "audacity audio.wav" }],
      },
      {
        name: "deepsound",
        desc: "Extract hidden files from audio (Windows)",
        cmds: [{ label: "Open", cmd: "DeepSound.exe" }],
      },
    ],
  },
  {
    category: "Strings & Hex",
    tools: [
      {
        name: "strings",
        desc: "Extract printable strings from binary data",
        cmds: [
          { label: "Default (min 4 chars)", cmd: "strings image.png" },
          { label: "Unicode strings", cmd: "strings -e l image.png" },
          { label: "Min length 8", cmd: "strings -n 8 image.png" },
        ],
      },
      {
        name: "xxd",
        desc: "Hex dump / reverse hex dump",
        cmds: [
          { label: "Hex dump", cmd: "xxd image.png | head -50" },
          { label: "Binary dump", cmd: "xxd -b image.png | head -20" },
          {
            label: "Reverse (hex to bin)",
            cmd: "xxd -r hexdump.txt > output.bin",
          },
        ],
      },
    ],
  },
];

function ToolsRefTab() {
  const cmdStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    background: pageBg,
    border: `1px solid ${accentBorderSoft}`,
    borderRadius: 6,
    padding: "6px 10px",
    fontFamily: mono,
    fontSize: 11,
    color: textPrimary,
  };

  return (
    <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Wrench size={18} style={{ color: accent }} />
          <span
            style={{
              fontFamily: heading,
              fontSize: 16,
              fontWeight: 700,
              color: textPrimary,
            }}
          >
            Stego Tools Reference
          </span>
        </div>

        {STEGO_TOOLS.map((cat) => (
          <div key={cat.category}>
            <h3
              style={{
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 700,
                color: accent,
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {cat.category}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cat.tools.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    background: surfaceBg,
                    border: `1px solid ${accentBorderSoft}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: accent,
                      }}
                    >
                      {tool.name}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: textMuted,
                      }}
                    >
                      {tool.desc}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {tool.cmds.map((c) => (
                      <div key={c.cmd} style={cmdStyle}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              color: textMuted,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {c.label}
                          </span>
                          <code
                            style={{
                              fontSize: 11,
                              color: textPrimary,
                              wordBreak: "break-all",
                            }}
                          >
                            {c.cmd}
                          </code>
                        </div>
                        <CopyButton text={c.cmd} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ComingSoonTab({ icon: Icon, label }) {
  return (
    <Card style={{ borderColor: accentBorderSoft, background: cardBg }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "40px 24px",
        }}
      >
        <Icon size={40} style={{ color: textMuted, opacity: 0.4 }} />
        <span
          style={{
            fontFamily: heading,
            fontSize: 16,
            fontWeight: 600,
            color: textMuted,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: textMuted,
            opacity: 0.6,
          }}
        >
          Coming soon
        </span>
      </div>
    </Card>
  );
}

export default function Stego() {
  const [activeTab, setActiveTab] = useState("image");
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          background: cardBg,
          border: `1px solid ${accentBorderSoft}`,
          borderRadius: 10,
          padding: 8,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                color: active ? pageBg : textMuted,
                background: active ? accent : "transparent",
                border: `1px solid ${active ? accent : "transparent"}`,
                borderRadius: 7,
                padding: "7px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon size={13} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "image" && <ImageStegoTab />}
      {activeTab === "text" && <TextStegoTab />}
      {activeTab === "audio" && (
        <ComingSoonTab icon={Waves} label="Audio Stego" />
      )}
      {activeTab === "file" && (
        <ComingSoonTab icon={FileStack} label="File Stego" />
      )}
      {activeTab === "tools" && <ToolsRefTab />}
      {activeTab === "ctf" && (
        <ComingSoonTab icon={Trophy} label="CTF Challenges" />
      )}
    </div>
  );
}

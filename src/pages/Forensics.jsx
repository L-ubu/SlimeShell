import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Upload,
  Binary,
  Type,
  FileSignature,
  Camera,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Card } from '../components/ui/Card.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const pageBg = '#141820';
const surfaceBg = '#1A1F2E';
const cardBg = '#1E2536';
const textPrimary = '#E8EDF5';
const textMuted = '#8B95A8';
const accent = '#6EE7B7';
const accentMuted = 'rgba(110, 231, 183, 0.15)';
const accentBorder = 'rgba(110, 231, 183, 0.35)';
const headerIconAccent = '#A78BFA';

const ROWS_PER_VIEW = 160;
const BYTES_PER_ROW = 16;

function formatBytes(n) {
  if (n === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log2(n) / 10), units.length - 1);
  const v = n / 1024 ** i;
  const rounded = i === 0 ? n : v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v);
  return `${rounded} ${units[i]}`;
}

function u8(b, i) {
  return b[i] ?? 0;
}

/** Parse pasted hex dump (with optional offset prefixes) or continuous hex into Uint8Array */
function parseHexOrText(input, mode) {
  const s = input.trim();
  if (!s) return new Uint8Array(0);
  if (mode === 'text') {
    return new Uint8Array(Array.from(s, (c) => c.charCodeAt(0) & 0xff));
  }
  const lines = s.split(/\r?\n/);
  const bytes = [];
  const hexPair = /[0-9a-fA-F]{2}/g;
  for (const line of lines) {
    let rest = line.replace(/^\s*[0-9a-fA-F]{1,8}:\s*/i, '').replace(/^\s*[0-9a-fA-F]{8,}\s+/i, '');
    const pipe = rest.indexOf('|');
    if (pipe >= 0) rest = rest.slice(0, pipe);
    let m;
    const local = rest;
    hexPair.lastIndex = 0;
    while ((m = hexPair.exec(local)) !== null) {
      bytes.push(parseInt(m[0], 16));
    }
  }
  if (bytes.length === 0) {
    const only = s.replace(/[^0-9a-fA-F]/g, '');
    if (only.length >= 2 && only.length % 2 === 0) {
      for (let i = 0; i < only.length; i += 2) {
        bytes.push(parseInt(only.slice(i, i + 2), 16));
      }
    }
  }
  return new Uint8Array(bytes);
}

function asciiChar(b) {
  return b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.';
}

/** Build search pattern: returns { bytes: Uint8Array } or null */
function parseSearchQuery(q, preferHex) {
  const t = q.trim();
  if (!t) return null;
  const hexOnly = t.replace(/[^0-9a-fA-F]/g, '');
  const looksHex =
    preferHex ||
    (/^[0-9a-fA-F\s]+$/i.test(t) && hexOnly.length >= 2 && hexOnly.length % 2 === 0 && t.length < 256);
  if (looksHex && hexOnly.length >= 2 && hexOnly.length % 2 === 0) {
    const arr = new Uint8Array(hexOnly.length / 2);
    for (let i = 0; i < hexOnly.length; i += 2) {
      arr[i / 2] = parseInt(hexOnly.slice(i, i + 2), 16);
    }
    return { bytes: arr };
  }
  return { bytes: new Uint8Array(Array.from(t, (c) => c.charCodeAt(0) & 0xff)) };
}

function findAllMatches(haystack, needle) {
  if (!needle || needle.length === 0) return [];
  const out = [];
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let ok = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(i);
  }
  return out;
}

function isInMatchRanges(offset, len, ranges) {
  const end = offset + len;
  for (const [a, b] of ranges) {
    if (offset < b && end > a) return true;
  }
  return false;
}

/** --- Magic / signature database --- */
function matchMagic(u8b) {
  const b = (i) => u8b[i] ?? 0;
  const str4 = (o) =>
    String.fromCharCode(b(o), b(o + 1), b(o + 2), b(o + 3));
  const checks = [
    { name: 'PNG image', mime: 'image/png', ext: '.png', desc: 'Portable Network Graphics', test: () => b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 },
    { name: 'JPEG image', mime: 'image/jpeg', ext: '.jpg', desc: 'JFIF / EXIF JPEG', test: () => b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff },
    { name: 'GIF image', mime: 'image/gif', ext: '.gif', desc: 'Graphics Interchange Format', test: () => b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38 },
    { name: 'BMP image', mime: 'image/bmp', ext: '.bmp', desc: 'Windows Bitmap', test: () => b(0) === 0x42 && b(1) === 0x4d },
    { name: 'TIFF (LE)', mime: 'image/tiff', ext: '.tif', desc: 'Tagged Image File (Intel byte order)', test: () => b(0) === 0x49 && b(1) === 0x49 && b(2) === 0x2a && b(3) === 0x00 },
    { name: 'TIFF (BE)', mime: 'image/tiff', ext: '.tif', desc: 'Tagged Image File (Motorola byte order)', test: () => b(0) === 0x4d && b(1) === 0x4d && b(2) === 0x00 && b(3) === 0x2a },
    { name: 'WebP', mime: 'image/webp', ext: '.webp', desc: 'RIFF WebP container', test: () => str4(0) === 'RIFF' && str4(8) === 'WEBP' },
    { name: 'ICO', mime: 'image/x-icon', ext: '.ico', desc: 'Windows icon', test: () => b(0) === 0x00 && b(1) === 0x00 && b(2) === 0x01 && b(3) === 0x00 },
    { name: 'PSD (Photoshop)', mime: 'image/vnd.adobe.photoshop', ext: '.psd', desc: 'Adobe Photoshop', test: () => str4(0) === '8BPS' },
    { name: 'PDF document', mime: 'application/pdf', ext: '.pdf', desc: 'Portable Document Format', test: () => str4(0) === '%PDF' },
    { name: 'ZIP archive', mime: 'application/zip', ext: '.zip', desc: 'ZIP / Office Open XML container', test: () => b(0) === 0x50 && b(1) === 0x4b && (b(2) === 0x03 || b(2) === 0x05 || b(2) === 0x07) },
    { name: 'RAR archive', mime: 'application/x-rar-compressed', ext: '.rar', desc: 'Roshal Archive v1.5+', test: () => b(0) === 0x52 && b(1) === 0x61 && b(2) === 0x72 && b(3) === 0x21 },
    { name: '7-Zip', mime: 'application/x-7z-compressed', ext: '.7z', desc: '7z archive', test: () => b(0) === 0x37 && b(1) === 0x7a && b(2) === 0xbc && b(3) === 0xaf },
    { name: 'GZIP', mime: 'application/gzip', ext: '.gz', desc: 'GNU zip compressed', test: () => b(0) === 0x1f && b(1) === 0x8b },
    { name: 'BZIP2', mime: 'application/x-bzip2', ext: '.bz2', desc: 'Bzip2 compression', test: () => b(0) === 0x42 && b(1) === 0x5a && b(2) === 0x68 },
    { name: 'XZ compressed', mime: 'application/x-xz', ext: '.xz', desc: 'XZ / LZMA2', test: () => b(0) === 0xfd && b(1) === 0x37 && b(2) === 0x7a && b(3) === 0x58 },
    { name: 'LZ4 frame', mime: 'application/x-lz4', ext: '.lz4', desc: 'LZ4 frame format', test: () => b(0) === 0x04 && b(1) === 0x22 && b(2) === 0x4d && b(3) === 0x18 },
    { name: 'Zstandard', mime: 'application/zstd', ext: '.zst', desc: 'Zstandard compression', test: () => b(0) === 0x28 && b(1) === 0xb5 && b(2) === 0x2f && b(3) === 0xfd },
    { name: 'ELF executable', mime: 'application/x-elf', ext: '', desc: 'Executable and Linkable Format', test: () => b(0) === 0x7f && b(1) === 0x45 && b(2) === 0x4c && b(3) === 0x46 },
    { name: 'PE / DOS executable', mime: 'application/x-msdownload', ext: '.exe', desc: 'Windows PE or MZ stub', test: () => b(0) === 0x4d && b(1) === 0x5a },
    { name: 'Mach-O (32-bit BE)', mime: 'application/x-mach-binary', ext: '', desc: 'Mach object file', test: () => b(0) === 0xfe && b(1) === 0xed && b(2) === 0xfa && b(3) === 0xce },
    { name: 'Mach-O (32-bit LE)', mime: 'application/x-mach-binary', ext: '', desc: 'Mach object file', test: () => b(0) === 0xce && b(1) === 0xfa && b(2) === 0xed && b(3) === 0xfe },
    { name: 'Mach-O (64-bit LE)', mime: 'application/x-mach-binary', ext: '', desc: 'Mach-O 64-bit LE', test: () => b(0) === 0xcf && b(1) === 0xfa && b(2) === 0xed && b(3) === 0xfe },
    { name: 'Mach-O (64-bit BE)', mime: 'application/x-mach-binary', ext: '', desc: 'Mach-O 64-bit BE', test: () => b(0) === 0xfe && b(1) === 0xed && b(2) === 0xfa && b(3) === 0xcf },
    { name: 'Dalvik DEX', mime: 'application/x-dex', ext: '.dex', desc: 'Android Dalvik bytecode', test: () => str4(0) === 'dex\n' || (b(0) === 0x64 && b(1) === 0x65 && b(2) === 0x78 && b(3) === 0x0a) },
    { name: 'Java class file', mime: 'application/java-vm', ext: '.class', desc: 'JVM bytecode', test: () => b(0) === 0xca && b(1) === 0xfe && b(2) === 0xba && b(3) === 0xbe },
    { name: 'MP3 (ID3)', mime: 'audio/mpeg', ext: '.mp3', desc: 'MPEG audio with ID3 tag', test: () => b(0) === 0x49 && b(1) === 0x44 && b(2) === 0x33 },
    { name: 'MP3 (frame sync)', mime: 'audio/mpeg', ext: '.mp3', desc: 'MPEG-1 Layer 3', test: () => b(0) === 0xff && (b(1) & 0xe0) === 0xe0 },
    { name: 'MP4 / ISO BMFF', mime: 'video/mp4', ext: '.mp4', desc: 'ISO Base Media (ftyp)', test: () => u8b.length >= 12 && str4(4) === 'ftyp' },
    { name: 'WAV audio', mime: 'audio/wav', ext: '.wav', desc: 'RIFF WAVE', test: () => str4(0) === 'RIFF' && str4(8) === 'WAVE' },
    { name: 'OGG container', mime: 'audio/ogg', ext: '.ogg', desc: 'Ogg multimedia', test: () => str4(0) === 'OggS' },
    { name: 'FLAC audio', mime: 'audio/flac', ext: '.flac', desc: 'Free Lossless Audio Codec', test: () => str4(0) === 'fLaC' },
    { name: 'AVI video', mime: 'video/x-msvideo', ext: '.avi', desc: 'RIFF AVI', test: () => str4(0) === 'RIFF' && str4(8) === 'AVI ' },
    { name: 'TAR (ustar)', mime: 'application/x-tar', ext: '.tar', desc: 'POSIX tar archive', test: () => u8b.length >= 262 && str4(257) === 'ustar' },
    { name: 'SQLite database', mime: 'application/x-sqlite3', ext: '.db', desc: 'SQLite 3.x database', test: () => str4(0) === 'SQLi' && b(4) === 0x74 && b(5) === 0x65 },
    { name: 'MySQL ISAM', mime: 'application/octet-stream', ext: '.MYD', desc: 'MySQL MyISAM data (typical)', test: () => b(0) === 0xfe && b(1) === 0x01 && b(2) === 0x03 && b(3) === 0x00 },
    { name: 'PCAP (LE)', mime: 'application/vnd.tcpdump.pcap', ext: '.pcap', desc: 'Packet capture (little-endian)', test: () => b(0) === 0xd4 && b(1) === 0xc3 && b(2) === 0xb2 && b(3) === 0xa1 },
    { name: 'PCAP (BE)', mime: 'application/vnd.tcpdump.pcap', ext: '.pcap', desc: 'Packet capture (big-endian)', test: () => b(0) === 0xa1 && b(1) === 0xb2 && b(2) === 0xc3 && b(3) === 0xd4 },
    { name: 'PCAPNG', mime: 'application/vnd.tcpdump.pcapng', ext: '.pcapng', desc: 'PCAP Next Generation', test: () => b(0) === 0x0a && b(1) === 0x0d && b(2) === 0x0d && b(3) === 0x0a },
    { name: 'Windows Minidump', mime: 'application/x-minidump', ext: '.dmp', desc: 'Windows crash minidump', test: () => str4(0) === 'MDMP' },
    { name: 'Windows Shortcut (LNK)', mime: 'application/x-ms-shortcut', ext: '.lnk', desc: 'Shell link', test: () => b(0) === 0x4c && b(1) === 0x00 && b(2) === 0x00 && b(3) === 0x00 },
    { name: 'Windows Registry hive', mime: 'application/octet-stream', ext: '', desc: 'Registry hive (regf)', test: () => str4(0) === 'regf' },
    { name: 'Berkeley DB (wallet.dat candidate)', mime: 'application/octet-stream', ext: '.dat', desc: 'Berkeley DB page header (often wallet.dat)', test: () => b(0) === 0x62 && b(1) === 0x31 && b(2) === 0x05 && b(3) === 0x00 },
    { name: 'PGP/GPG key (binary)', mime: 'application/pgp-keys', ext: '.gpg', desc: 'OpenPGP packet stream', test: () => b(0) === 0x99 || b(0) === 0x95 },
    { name: 'Shell script', mime: 'text/x-shellscript', ext: '.sh', desc: 'Shebang script', test: () => b(0) === 0x23 && b(1) === 0x21 },
    { name: 'UTF-8 BOM text', mime: 'text/plain', ext: '.txt', desc: 'UTF-8 byte order mark', test: () => b(0) === 0xef && b(1) === 0xbb && b(2) === 0xbf },
    { name: 'UTF-16 LE BOM', mime: 'text/plain', ext: '.txt', desc: 'UTF-16 LE BOM', test: () => b(0) === 0xff && b(1) === 0xfe },
    { name: 'UTF-16 BE BOM', mime: 'text/plain', ext: '.txt', desc: 'UTF-16 BE BOM', test: () => b(0) === 0xfe && b(1) === 0xff },
    { name: 'WebAssembly', mime: 'application/wasm', ext: '.wasm', desc: 'WebAssembly binary', test: () => b(0) === 0x00 && b(1) === 0x61 && b(2) === 0x73 && b(3) === 0x6d },
    { name: 'Rich Text Format', mime: 'application/rtf', ext: '.rtf', desc: 'Microsoft RTF', test: () => b(0) === 0x7b && b(1) === 0x5c && b(2) === 0x72 && b(3) === 0x74 },
    { name: 'CAB archive', mime: 'application/vnd.ms-cab-compressed', ext: '.cab', desc: 'Microsoft Cabinet', test: () => b(0) === 0x4d && b(1) === 0x53 && b(2) === 0x43 && b(3) === 0x46 },
    { name: 'PostScript', mime: 'application/postscript', ext: '.ps', desc: 'Adobe PostScript', test: () => b(0) === 0x25 && b(1) === 0x21 },
    { name: 'Flash SWF (zlib)', mime: 'application/x-shockwave-flash', ext: '.swf', desc: 'Compressed Flash', test: () => b(0) === 0x43 && b(1) === 0x57 && b(2) === 0x53 },
    { name: 'Flash SWF (uncompressed)', mime: 'application/x-shockwave-flash', ext: '.swf', desc: 'Flash SWF', test: () => b(0) === 0x46 && b(1) === 0x57 && b(2) === 0x53 },
    { name: 'Android binary XML', mime: 'application/octet-stream', ext: '.axml', desc: 'AXML header', test: () => b(0) === 0x03 && b(1) === 0x00 && b(2) === 0x08 && b(3) === 0x00 },
    { name: 'VirtualBox VDI', mime: 'application/octet-stream', ext: '.vdi', desc: 'Virtual Disk Image', test: () => str4(0) === '<<< ' },
    { name: 'VMware VMDK', mime: 'application/octet-stream', ext: '.vmdk', desc: 'VMware virtual disk', test: () => str4(0) === 'KDMV' },
    { name: 'QCOW2 image', mime: 'application/octet-stream', ext: '.qcow2', desc: 'QEMU copy-on-write', test: () => b(0) === 0x51 && b(1) === 0x46 && b(2) === 0x49 && b(3) === 0xfb },
    { name: 'Adobe Flash video', mime: 'video/x-flv', ext: '.flv', desc: 'FLV container', test: () => b(0) === 0x46 && b(1) === 0x4c && b(2) === 0x56 && b(3) === 0x01 },
    { name: 'Matroska / WebM', mime: 'video/x-matroska', ext: '.mkv', desc: 'EBML (Matroska/WebM)', test: () => b(0) === 0x1a && b(1) === 0x45 && b(2) === 0xdf && b(3) === 0xa3 },
    { name: 'Compound Document (OLE2 / MSI)', mime: 'application/msword', ext: '.doc', desc: 'Microsoft OLE2 compound document', test: () => b(0) === 0xd0 && b(1) === 0xcf && b(2) === 0x11 && b(3) === 0xe0 },
    { name: 'LZMA alone', mime: 'application/x-lzma', ext: '.lzma', desc: 'LZMA stream', test: () => b(0) === 0x5d && b(1) === 0x00 && b(2) === 0x00 },
    { name: 'Amiga IFF / RIFF FORM', mime: 'application/octet-stream', ext: '', desc: 'Interchange File Format (FORM)', test: () => b(0) === 0x46 && b(1) === 0x4f && b(2) === 0x52 && b(3) === 0x4d },
    { name: 'LZIP', mime: 'application/x-lzip', ext: '.lz', desc: 'Lzip compressed', test: () => b(0) === 0x4c && b(1) === 0x5a && b(2) === 0x49 && b(3) === 0x50 },
    { name: 'MacPaint', mime: 'application/octet-stream', ext: '.mac', desc: 'MacPaint image', test: () => str4(0) === 'PNTG' },
    { name: 'TrueType font', mime: 'font/ttf', ext: '.ttf', desc: 'TrueType / OpenType', test: () => b(0) === 0x00 && b(1) === 0x01 && b(2) === 0x00 && b(3) === 0x00 },
    { name: 'OpenType font', mime: 'font/otf', ext: '.otf', desc: 'OpenType with CFF', test: () => b(0) === 0x4f && b(1) === 0x54 && b(2) === 0x54 && b(3) === 0x4f },
    { name: 'DER X.509 certificate', mime: 'application/pkix-cert', ext: '.der', desc: 'ASN.1 DER (common cert)', test: () => b(0) === 0x30 && b(1) === 0x82 },
    { name: 'PEM text (detect)', mime: 'application/x-pem-file', ext: '.pem', desc: 'ASCII-armored (starts with -----BEGIN)', test: () => {
      const head = String.fromCharCode(...u8b.slice(0, 27));
      return head.startsWith('-----BEGIN');
    } },
    { name: 'MySQL InnoDB tablespace', mime: 'application/octet-stream', ext: '.ibd', desc: 'Possible InnoDB .ibd (not definitive)', test: () => u8b.length > 38 && b(0) === 0 && b(1) === 0 && b(2) === 0 && b(3) === 1 },
    { name: 'XML document', mime: 'application/xml', ext: '.xml', desc: 'XML declaration or root', test: () => {
      const h = String.fromCharCode(...u8b.slice(0, 5));
      return h.startsWith('<?xml') || h.startsWith('<svg') || String.fromCharCode(...u8b.slice(0, 9)).toLowerCase().startsWith('<!doctype');
    } },
    { name: 'HTML document', mime: 'text/html', ext: '.html', desc: 'HTML markup', test: () => {
      const t = String.fromCharCode(...u8b.slice(0, 64)).toLowerCase();
      return t.includes('<html') || t.includes('<!doctype html');
    } },
    { name: 'JSON text', mime: 'application/json', ext: '.json', desc: 'JSON (leading brace/bracket)', test: () => {
      const t = String.fromCharCode(...u8b.slice(0, 32)).trimStart();
      return t.startsWith('{') || t.startsWith('[');
    } },
    { name: 'DER ASN.1 sequence', mime: 'application/pkcs7-mime', ext: '.der', desc: 'DER SEQUENCE (common cert/CMS)', test: () => b(0) === 0x30 && (b(1) === 0x82 || b(1) === 0x81 || b(1) < 0x80) },
  ];
  for (const c of checks) {
    try {
      if (c.test()) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function hexPrefix(u8b, n) {
  return Array.from(u8b.slice(0, Math.min(n, u8b.length)))
    .map((x) => x.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

const EXIF_TAG_NAMES = {
  0x0100: 'ImageWidth',
  0x0101: 'ImageLength',
  0x010e: 'ImageDescription',
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x8769: 'ExifIFDPointer',
  0x8825: 'GPSInfoIFDPointer',
  0x9003: 'DateTimeOriginal',
  0x9004: 'DateTimeDigitized',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISOSpeedRatings',
  0x920a: 'FocalLength',
};

const GPS_TAG_NAMES = {
  0x0001: 'GPSLatitudeRef',
  0x0002: 'GPSLatitude',
  0x0003: 'GPSLongitudeRef',
  0x0004: 'GPSLongitude',
  0x0006: 'GPSAltitude',
};

function createExifReader(u8, tiffStart) {
  const byteOrder = (u8[tiffStart] << 8) | u8[tiffStart + 1];
  const le = byteOrder !== 0x4d4d;
  const read16 = (off) => (le ? (u8[off + 1] << 8) | u8[off] : (u8[off] << 8) | u8[off + 1]);
  const read32 = (off) =>
    le
      ? (u8[off + 3] << 24) | (u8[off + 2] << 16) | (u8[off + 1] << 8) | u8[off]
      : (u8[off] << 24) | (u8[off + 1] << 16) | (u8[off + 2] << 8) | u8[off + 3];
  const readRational = (off) => {
    const num = read32(off);
    const den = read32(off + 4);
    return den ? num / den : num;
  };

  function parseIFD(ifdOff, tagNames) {
    const rows = [];
    if (ifdOff < 0) return { rows, next: 0, subIFDs: [] };
    const ifdStart = tiffStart + ifdOff;
    if (ifdStart + 2 > u8.length) return { rows, next: 0, subIFDs: [] };
    const n = read16(ifdStart);
    const subIFDs = [];
    for (let e = 0; e < n; e++) {
      const entryOff = ifdStart + 2 + e * 12;
      if (entryOff + 12 > u8.length) break;
      const tag = read16(entryOff);
      const type = read16(entryOff + 2);
      const count = read32(entryOff + 4);
      const valueOff = read32(entryOff + 8);
      const name = tagNames[tag] || `Tag_0x${tag.toString(16)}`;
      let display = '';
      const componentSizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1 };
      const comp = componentSizes[type] || 1;
      const total = comp * count;

      if (type === 2) {
        if (total <= 4) {
          let s = '';
          for (let i = 0; i < count - 1 && i < 4; i++) s += String.fromCharCode(u8[entryOff + 8 + i]);
          display = s;
        } else {
          const base = tiffStart + valueOff;
          let s = '';
          for (let i = 0; i < count - 1 && base + i < u8.length; i++) {
            const c = u8[base + i];
            if (c === 0) break;
            s += String.fromCharCode(c);
          }
          display = s;
        }
      } else if (type === 3) {
        if (count === 1) display = String(read16(entryOff + 8));
        else {
          const base = total <= 4 ? entryOff + 8 : tiffStart + valueOff;
          const parts = [];
          for (let k = 0; k < Math.min(count, 8); k++) parts.push(String(read16(base + k * 2)));
          display = parts.join(', ');
        }
      } else if (type === 4 && count === 1) {
        display = String(read32(entryOff + 8));
      } else if (type === 5) {
        const base = tiffStart + valueOff;
        if (count === 1) {
          const r = readRational(base);
          display = Number.isFinite(r) ? String(r) : '?';
        } else {
          const parts = [];
          for (let k = 0; k < Math.min(count, 8); k++) {
            parts.push(readRational(base + k * 8).toFixed(5));
          }
          display = parts.join(', ');
        }
      } else if (type === 1 && count <= 4) {
        const parts = [];
        for (let i = 0; i < count; i++) parts.push(String(u8[entryOff + 8 + i]));
        display = parts.join('.');
      } else {
        display = `(type ${type}, count ${count})`;
      }

      rows.push({ name, tag, display });
      if (tag === 0x8769) subIFDs.push({ off: valueOff, names: EXIF_TAG_NAMES });
      if (tag === 0x8825) subIFDs.push({ off: valueOff, names: GPS_TAG_NAMES });
    }
    const nextOff = read32(ifdStart + 2 + n * 12);
    return { rows, next: nextOff, subIFDs };
  }

  return { read16, read32, parseIFD, tiffStart, le };
}

function parseJpegExifFull(u8) {
  let i = 2;
  let thumbDataUrl = null;
  while (i < u8.length - 1) {
    if (u8[i] !== 0xff) break;
    const marker = u8[i + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const segLen = (u8[i + 2] << 8) | u8[i + 3];
    if (marker === 0xe1 && segLen > 8) {
      const sig = String.fromCharCode(u8[i + 4], u8[i + 5], u8[i + 6], u8[i + 7]);
      if (sig === 'Exif') {
        const tiffStart = i + 10;
        if (tiffStart + 8 >= u8.length) break;
        const { parseIFD, read32 } = createExifReader(u8, tiffStart);
        const ifd0Off = read32(tiffStart + 4);
        const allRows = [];
        const seen = new Set();
        const visit = (off, names) => {
          const key = `${off}`;
          if (seen.has(key)) return;
          seen.add(key);
          const { rows, next, subIFDs } = parseIFD(off, names);
          for (const r of rows) allRows.push(r);
          for (const s of subIFDs) visit(s.off, s.names);
          if (next) visit(next, names);
        };
        visit(ifd0Off, EXIF_TAG_NAMES);

        let hasGps = false;
        for (const r of allRows) {
          if (r.name.startsWith('GPS') && r.display && !r.display.startsWith('(type')) hasGps = true;
        }

        for (let j = i; j < Math.min(i + 2 + segLen, u8.length) - 1; j++) {
          if (u8[j] === 0xff && u8[j + 1] === 0xd8) {
            let k = j;
            while (k < Math.min(i + 2 + segLen, u8.length) - 1) {
              if (u8[k] === 0xff && u8[k + 1] === 0xd9) {
                const slice = u8.slice(j, k + 2);
                const blob = new Blob([slice], { type: 'image/jpeg' });
                thumbDataUrl = URL.createObjectURL(blob);
                break;
              }
              k++;
            }
            break;
          }
        }

        return { rows: allRows, hasGps, thumbDataUrl };
      }
    }
    i += 2 + segLen;
  }
  return { rows: [], hasGps: false, thumbDataUrl: null };
}

function parseTiffExifFull(u8) {
  if (u8.length < 8) return { rows: [], hasGps: false, thumbDataUrl: null };
  const le = u8[0] === 0x49 && u8[1] === 0x49 && u8[2] === 0x2a && u8[3] === 0;
  const be = u8[0] === 0x4d && u8[1] === 0x4d && u8[2] === 0 && u8[3] === 0x2a;
  if (!le && !be) return null;
  const { parseIFD, read32 } = createExifReader(u8, 0);
  const ifd0Off = read32(4);
  const allRows = [];
  const seen = new Set();
  const visit = (off, names) => {
    const key = `${off}`;
    if (seen.has(key)) return;
    seen.add(key);
    const { rows, next, subIFDs } = parseIFD(off, names);
    for (const r of rows) allRows.push(r);
    for (const s of subIFDs) visit(s.off, s.names);
    if (next) visit(next, names);
  };
  visit(ifd0Off, EXIF_TAG_NAMES);
  let hasGps = false;
  for (const r of allRows) {
    if (r.name.startsWith('GPS') && r.display && !r.display.startsWith('(type')) hasGps = true;
  }
  return { rows: allRows, hasGps, thumbDataUrl: null };
}

function extractStringsAscii(u8b, minLen) {
  const out = [];
  let cur = [];
  let start = 0;
  for (let i = 0; i < u8b.length; i++) {
    const bt = u8b[i];
    if (bt >= 0x20 && bt <= 0x7e) {
      if (cur.length === 0) start = i;
      cur.push(bt);
    } else {
      if (cur.length >= minLen) out.push({ offset: start, text: String.fromCharCode(...cur), len: cur.length });
      cur = [];
    }
  }
  if (cur.length >= minLen) out.push({ offset: start, text: String.fromCharCode(...cur), len: cur.length });
  return out;
}

function tryReadUtf8Char(buf, i) {
  const b0 = buf[i];
  if (b0 === undefined) return null;
  if (b0 < 0x80) return { ch: b0, len: 1 };
  if ((b0 & 0xe0) === 0xc0) {
    if (i + 1 >= buf.length) return null;
    const b1 = buf[i + 1];
    if ((b1 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 0x1f) << 6) | (b1 & 0x3f);
    if (cp < 0x80) return null;
    return { ch: cp, len: 2 };
  }
  if ((b0 & 0xf0) === 0xe0) {
    if (i + 2 >= buf.length) return null;
    const b1 = buf[i + 1];
    const b2 = buf[i + 2];
    if ((b1 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f);
    if (cp < 0x800 || (cp >= 0xd800 && cp <= 0xdfff)) return null;
    return { ch: cp, len: 3 };
  }
  if ((b0 & 0xf8) === 0xf0) {
    if (i + 3 >= buf.length) return null;
    const b1 = buf[i + 1];
    const b2 = buf[i + 2];
    const b3 = buf[i + 3];
    if ((b1 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80 || (b3 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 7) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
    if (cp < 0x10000 || cp > 0x10ffff) return null;
    return { ch: cp, len: 4 };
  }
  return null;
}

function extractStringsUtf8(u8b, minLen) {
  const out = [];
  let runStart = -1;
  let acc = '';
  const flush = () => {
    if (acc.length >= minLen) out.push({ offset: runStart, text: acc, len: acc.length });
    acc = '';
    runStart = -1;
  };
  for (let i = 0; i < u8b.length; ) {
    const u = tryReadUtf8Char(u8b, i);
    if (!u) {
      flush();
      i++;
      continue;
    }
    const { ch, len } = u;
    const printable = (ch >= 0x20 && ch < 0x7f) || ch >= 0xa0;
    if (printable) {
      if (runStart < 0) runStart = i;
      acc += String.fromCodePoint(ch);
      i += len;
    } else {
      flush();
      i += len;
    }
  }
  flush();
  return out;
}

function extractStringsUtf16(u8b, minLen, le) {
  const out = [];
  for (let i = 0; i <= u8b.length - 2; i += 2) {
    let j = i;
    const chars = [];
    while (j + 1 < u8b.length) {
      const lo = u8b[j];
      const hi = u8b[j + 1];
      const code = le ? lo | (hi << 8) : hi | (lo << 8);
      if (code >= 0x20 && code <= 0x7e) {
        chars.push(String.fromCharCode(code));
        j += 2;
      } else break;
    }
    if (chars.length >= minLen) out.push({ offset: i, text: chars.join(''), len: chars.length });
  }
  return out;
}

function extractAllStrings(u8b, minLen, encoding) {
  if (encoding === 'ascii') return extractStringsAscii(u8b, minLen);
  if (encoding === 'utf8') return extractStringsUtf8(u8b, minLen);
  if (encoding === 'utf16le') return extractStringsUtf16(u8b, minLen, true);
  if (encoding === 'utf16be') return extractStringsUtf16(u8b, minLen, false);
  return extractStringsAscii(u8b, minLen);
}

const URL_RE = /https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
const PATH_RE = /(?:\/[\w.-]+){2,}|[a-z]:\\[^<>|"]+/i;
const KEYWORD_RE = /password|secret|key|token|admin|credential|apikey|bearer|jwt/i;

function stringInterestLevel(text) {
  let score = 0;
  if (URL_RE.test(text)) score += 2;
  if (EMAIL_RE.test(text)) score += 2;
  if (IPV4_RE.test(text)) score += 1;
  if (PATH_RE.test(text)) score += 1;
  if (KEYWORD_RE.test(text)) score += 2;
  return score;
}

const FORENSICS_COMMANDS = [
  {
    title: 'Volatility (memory)',
    items: [
      { cmd: 'vol -f mem.dump windows.info', desc: 'OS & kernel (Vol3)', example: 'vol -f memory.raw windows.info' },
      { cmd: 'volatility -f mem.dump imageinfo', desc: 'Suggest profile (Vol2)', example: 'volatility -f win7.vmem imageinfo' },
      { cmd: 'volatility ... pslist', desc: 'Running processes', example: 'volatility -f x.raw --profile=Win7SP1x64 pslist' },
      { cmd: 'volatility ... pstree', desc: 'Process tree', example: 'volatility -f mem.dump --profile=Win10x64 pstree' },
      { cmd: 'volatility ... netscan', desc: 'TCP/UDP endpoints', example: 'volatility -f mem.dump --profile=Win10x64 netscan' },
      { cmd: 'volatility ... filescan', desc: 'FILE_OBJECT paths', example: 'volatility -f mem.dump --profile=Win7SP1x64 filescan' },
      { cmd: 'volatility ... dumpfiles -Q <phys> -D out/', desc: 'Dump from physical offset', example: 'volatility -f mem.dump dumpfiles -Q 0x1234000 -D ./out' },
      { cmd: 'volatility ... hashdump', desc: 'NTLM from SAM', example: 'volatility -f mem.dump --profile=Win7SP1x64 hashdump' },
      { cmd: 'volatility ... hivelist', desc: 'Registry hives', example: 'volatility -f mem.dump --profile=Win10x64 hivelist' },
      { cmd: 'volatility ... timeliner', desc: 'Memory timeline', example: 'volatility -f mem.dump --profile=Win10x64 timeliner' },
      { cmd: 'volatility ... malfind', desc: 'Injected / hollowed code', example: 'volatility -f mem.dump --profile=Win10x64 malfind' },
      { cmd: 'volatility ... cmdscan', desc: 'Console commands', example: 'volatility -f mem.dump --profile=Win7SP1x64 cmdscan' },
      { cmd: 'volatility ... consoles', desc: 'Console buffers', example: 'volatility -f mem.dump --profile=Win10x64 consoles' },
      { cmd: 'volatility ... svcscan', desc: 'Windows services', example: 'volatility -f mem.dump svcscan' },
      { cmd: 'volatility ... dlllist', desc: 'Loaded DLLs', example: 'volatility -f mem.dump dlllist -p 1234' },
      { cmd: 'volatility ... handles', desc: 'Kernel handles', example: 'volatility -f mem.dump handles -p 4' },
      { cmd: 'volatility ... memmap', desc: 'Process memory map', example: 'volatility -f mem.dump memmap -p 432' },
      { cmd: 'volatility ... envars', desc: 'Environment variables', example: 'volatility -f mem.dump envars' },
      { cmd: 'volatility ... screenshot', desc: 'GDI screenshots (Vol2)', example: 'volatility -f mem.dump screenshot -D ./shots' },
      { cmd: 'volatility ... yarascan -Y "MZ"', desc: 'YARA on memory', example: 'volatility -f mem.dump yarascan -Y "malware"' },
      { cmd: 'volatility ... moddump', desc: 'Dump kernel drivers', example: 'volatility -f mem.dump moddump -D ./mods' },
    ],
  },
  {
    title: 'Autopsy / Sleuth Kit',
    items: [
      { cmd: 'mmls disk.e01', desc: 'Partition layout', example: 'mmls evidence.dd' },
      { cmd: 'fsstat -o 2048 disk.img', desc: 'Filesystem superblock', example: 'fsstat -o 1052672 evidence.raw' },
      { cmd: 'fls -r -m / disk.img', desc: 'Recursive listing (mactime)', example: 'fls -r -m / -o 2048 ntfs.img' },
      { cmd: 'icat disk.img inode > out', desc: 'Extract by inode', example: 'icat -o 2048 disk.img 12345 > doc.pdf' },
      { cmd: 'blkls -a disk.img', desc: 'Unallocated blocks', example: 'blkls -e disk.img > unalloc.raw' },
      { cmd: 'sorter -i disk.img -o out/', desc: 'Sort by type', example: 'sorter -i ntfs.img -o sorted/' },
      { cmd: 'mactime -b bodyfile.txt', desc: 'Timeline from body', example: 'mactime -b body.txt -d > timeline.txt' },
      { cmd: 'img_stat image.e01', desc: 'E01 metadata', example: 'img_stat laptop.E01' },
      { cmd: 'istat disk.img inode', desc: 'Inode / MFT entry', example: 'istat -o 2048 disk.img 128' },
      { cmd: 'ils disk.img', desc: 'Inode metadata', example: 'ils -o 2048 ext4.img' },
      { cmd: 'jls disk.img', desc: 'NTFS $LogFile journal', example: 'jls -o 2048 ntfs.img' },
      { cmd: 'tsk_gettimes -i raw disk.img', desc: 'MAC bodyfile', example: 'tsk_gettimes disk.dd > body.txt' },
      { cmd: 'sigfind -o 512 53 46 44', desc: 'Find signature at offsets', example: 'sigfind -b 512 46494e47 disk.img' },
      { cmd: 'disktype disk.img', desc: 'Identify FS', example: 'disktype usb.dd' },
      { cmd: 'mmcat disk.e01 2 > part2.raw', desc: 'Export partition', example: 'mmcat laptop.E01 3 > p3.raw' },
    ],
  },
  {
    title: 'File analysis',
    items: [
      { cmd: 'file -k suspicious.bin', desc: 'Magic identification', example: 'file -k malware.exe' },
      { cmd: 'strings -n 8 binary', desc: 'Printable strings', example: 'strings -n 6 -el dll.dll' },
      { cmd: 'xxd binary | less', desc: 'Hex dump', example: 'xxd -g 1 -l 256 firmware.bin' },
      { cmd: 'hexdump -C binary', desc: 'Hex + ASCII', example: 'hexdump -C -n 512 bootsect' },
      { cmd: 'binwalk -e firmware.bin', desc: 'Carve embedded', example: 'binwalk -Me router.img' },
      { cmd: 'foremost -i disk.img -o out/', desc: 'Header carving', example: 'foremost -t jpeg,pdf -i usb.dd' },
      { cmd: 'scalpel -o out/ disk.img', desc: 'Configurable carve', example: 'scalpel -c scalpel.conf mem.dump' },
      { cmd: 'exiftool -a image.jpg', desc: 'File metadata', example: 'exiftool -n -G1 photo.jpg' },
      { cmd: 'pdf-parser.py doc.pdf', desc: 'PDF structure', example: 'pdf-parser.py -a malware.pdf' },
      { cmd: 'oledump.py doc.xls', desc: 'OLE streams', example: 'oledump.py -s 7 -d invoice.xls' },
      { cmd: 'olevba macro.doc', desc: 'VBA macros', example: 'olevba suspicious.docm' },
      { cmd: '7z l archive.zip', desc: 'Archive listing', example: '7z l -slt evidence.zip' },
      { cmd: 'ent file.dat', desc: 'Entropy', example: 'ent -b shellcode.bin' },
      { cmd: 'ssdeep -b *', desc: 'Fuzzy hash', example: 'ssdeep -r malware_samples/' },
      { cmd: 'yara -r rules.yar dir/', desc: 'YARA scan', example: 'yara -s rules/malware.yar .' },
    ],
  },
  {
    title: 'Disk & memory acquisition',
    items: [
      { cmd: 'dd if=/dev/sdb of=image.dd bs=4M', desc: 'Raw copy', example: 'dd if=/dev/disk2 of=usb.dd conv=noerror,sync' },
      { cmd: 'dc3dd if=/dev/sdb of=img.dd hash=md5', desc: 'DD + hash', example: 'dc3dd if=disk of=out.dd hlog=hash.log' },
      { cmd: 'ewfacquire /dev/sdb', desc: 'E01 image', example: 'ewfacquire -t case -u evidence /dev/sdc' },
      { cmd: 'aff4imager -o evidence.aff4', desc: 'AFF4', example: 'aff4imager -i /dev/sda -o case.aff4' },
      { cmd: 'insmod lime.ko path=/tmp/mem.lime', desc: 'LiME RAM', example: 'insmod lime.ko "path=/cases/ram.lime dio=1"' },
      { cmd: 'avml memory.lime', desc: 'MS AVML', example: 'sudo avml --compress /cases/linux.lime' },
      { cmd: 'FTK Imager', desc: 'GUI imaging', example: 'Create Disk Image → E01' },
      { cmd: 'guymager', desc: 'Linux imager GUI', example: 'Device → Acquire' },
      { cmd: 'xmount --in ewf disk.E01 /mnt/x', desc: 'Mount E01', example: 'xmount --in ewf --out vmdk case.E01 ./vmdk' },
      { cmd: 'qemu-img convert -f raw -O qcow2 in out', desc: 'Convert format', example: 'qemu-img info evidence.dd' },
    ],
  },
  {
    title: 'Network forensics',
    items: [
      { cmd: 'tcpdump -i eth0 -w cap.pcap', desc: 'Capture', example: 'tcpdump -nn -s0 -w out.pcap host 10.0.0.5' },
      { cmd: 'tshark -r cap.pcap -Y http', desc: 'Display filter', example: 'tshark -r pcap -T fields -e http.host' },
      { cmd: 'NetworkMiner', desc: 'PCAP → artifacts', example: 'Open pcap → Files tab' },
      { cmd: 'zeek -r traffic.pcap', desc: 'NSM logs', example: 'zeek -C -r evidence.pcap local' },
      { cmd: 'snort -r cap.pcap -c snort.conf', desc: 'IDS on PCAP', example: 'snort -c snort.conf -r mal.pcap' },
      { cmd: 'capinfos cap.pcap', desc: 'PCAP stats', example: 'capinfos -M evidence.pcap' },
      { cmd: 'mergecap -w all.pcap *.pcap', desc: 'Merge', example: 'mergecap -w merged.pcap part*.pcap' },
      { cmd: 'editcap -F pcapng in out', desc: 'Convert PCAP', example: 'editcap -A "2024-01-01" trim.pcap slice.pcap' },
      { cmd: 'tcpflow -r cap.pcap', desc: 'TCP flows to files', example: 'tcpflow -o flows/ evidence.pcap' },
      { cmd: 'ngrep -d eth0 "GET"', desc: 'Pattern grep', example: 'ngrep -I http.pcap "password"' },
    ],
  },
  {
    title: 'Windows forensics',
    items: [
      { cmd: 'reg export HKLM\\\\SAM sam.hive', desc: 'Export hive', example: 'reg export HKLM\\\\SYSTEM sys.hiv' },
      { cmd: 'RegRipper -r NTUSER.DAT -p userassist', desc: 'Hive plugins', example: 'rip.pl -r SOFTWARE -p uninstall' },
      { cmd: 'wevtutil epl Security.evtx sec.bin', desc: 'Export EVTX', example: 'wevtutil qe Security /c:10 /f:text' },
      { cmd: 'Get-WinEvent -LogName Security', desc: 'PowerShell events', example: 'Get-WinEvent -FilterHashtable @{LogName="Security";ID=4624}' },
      { cmd: 'PECmd -f Prefetch\\\\CALC.EXE-*.pf', desc: 'Prefetch', example: 'PECmd -d C:\\\\Windows\\\\Prefetch --csv out' },
      { cmd: 'MFTECmd -f MFT', desc: '$MFT parse', example: 'MFTECmd -f \\\\.\\\\C: --csv mft_out' },
      { cmd: 'fsutil usn readjournal', desc: 'USN Journal', example: 'fsutil usn readjournal C: csv' },
      { cmd: 'SRUDB / SRUM', desc: 'Resource usage DB', example: 'srum-dump.exe -i SRUDB.dat -o csv' },
      { cmd: 'LECmd -f shortcut.lnk', desc: 'LNK metadata', example: 'LECmd -f evil.lnk --csv' },
      { cmd: 'JLECmd', desc: 'Jump lists', example: 'JLECmd -f AutomaticDestinations-ms' },
      { cmd: 'Amcache.hve', desc: 'Execution artifacts', example: 'AmcacheParser -f Amcache.hve --csv' },
    ],
  },
  {
    title: 'Linux forensics',
    items: [
      { cmd: 'grep -R "" /var/log/', desc: 'Log triage', example: 'zgrep -i fail /var/log/auth.log*' },
      { cmd: 'journalctl -u ssh', desc: 'systemd journal', example: 'journalctl -b -p err' },
      { cmd: '~/.bash_history', desc: 'Shell history', example: 'strings -a .bash_history | tail' },
      { cmd: 'crontab -l; ls /etc/cron*', desc: 'Cron', example: 'grep -r "" /var/spool/cron/' },
      { cmd: 'last -f /var/log/wtmp', desc: 'Logins', example: 'lastlog | head' },
      { cmd: 'lastb', desc: 'Failed logins', example: 'sudo lastb | head' },
      { cmd: 'aureport --auth', desc: 'auditd', example: 'ausearch -m USER_LOGIN -ts today' },
      { cmd: 'ls -la /etc/passwd', desc: 'Account files', example: 'getent passwd | wc -l' },
      { cmd: 'lsof -nP', desc: 'Open files', example: 'lsof -i -P -n | grep LISTEN' },
      { cmd: 'ss -tulpn', desc: 'Sockets', example: 'ss -plant' },
      { cmd: 'find / -mtime -1 -type f', desc: 'Recent files', example: 'find /home -name "*.sh" -executable' },
    ],
  },
];

function DropZone({ onData, accept, label, monoHint }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) {
        const r = new FileReader();
        r.onload = () => onData(new Uint8Array(r.result));
        r.readAsArrayBuffer(f);
      }
    },
    [onData],
  );
  return (
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
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
      }}
      style={{
        border: dragOver ? `2px solid ${accent}` : `2px dashed ${accentBorder}`,
        borderRadius: 12,
        minHeight: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        background: dragOver ? accentMuted : 'transparent',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <Upload size={28} color={accent} strokeWidth={1.75} style={{ opacity: 0.9 }} />
      <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: textPrimary }}>{label}</span>
      {monoHint ? (
        <span style={{ fontFamily: mono, fontSize: 10, color: textMuted }}>{monoHint}</span>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const r = new FileReader();
            r.onload = () => onData(new Uint8Array(r.result));
            r.readAsArrayBuffer(f);
          }
        }}
      />
    </div>
  );
}

const TABS = [
  { id: 'hex', label: 'Hex Viewer', icon: Binary },
  { id: 'strings', label: 'Strings', icon: Type },
  { id: 'magic', label: 'File Magic', icon: FileSignature },
  { id: 'exif', label: 'EXIF', icon: Camera },
  { id: 'ref', label: 'CLI Reference', icon: Terminal },
];

export default function Forensics() {
  const [tab, setTab] = useState('hex');

  const [hexInput, setHexInput] = useState('');
  const [hexMode, setHexMode] = useState('hex');
  const [hexBytes, setHexBytes] = useState(new Uint8Array(0));
  const [hexSearch, setHexSearch] = useState('');
  const [hexSearchHex, setHexSearchHex] = useState(false);
  const [hexViewStart, setHexViewStart] = useState(0);
  const [hexGoto, setHexGoto] = useState('');

  const [strData, setStrData] = useState(new Uint8Array(0));
  const [strMinLen, setStrMinLen] = useState(4);
  const [strEncoding, setStrEncoding] = useState('ascii');
  const [strFilter, setStrFilter] = useState('');

  const [magicData, setMagicData] = useState(new Uint8Array(0));

  const [exifData, setExifData] = useState(new Uint8Array(0));
  const [exifParsed, setExifParsed] = useState({
    rows: [],
    hasGps: false,
    thumbDataUrl: null,
    error: null,
  });
  const exifThumbRef = useRef(null);

  useEffect(() => {
    if (!exifData.length) {
      setExifParsed({ rows: [], hasGps: false, thumbDataUrl: null, error: null });
      return undefined;
    }
    const isJpeg = exifData[0] === 0xff && exifData[1] === 0xd8;
    const isTiff =
      (exifData[0] === 0x49 && exifData[1] === 0x49 && exifData[2] === 0x2a && exifData[3] === 0) ||
      (exifData[0] === 0x4d && exifData[1] === 0x4d && exifData[2] === 0 && exifData[3] === 0x2a);
    if (!isJpeg && !isTiff) {
      setExifParsed({
        rows: [],
        hasGps: false,
        thumbDataUrl: null,
        error: 'Load a JPEG or TIFF with TIFF/EXIF IFDs.',
      });
      return undefined;
    }
    const p = isJpeg ? parseJpegExifFull(exifData) : parseTiffExifFull(exifData);
    if (!p) {
      setExifParsed({
        rows: [],
        hasGps: false,
        thumbDataUrl: null,
        error: 'Could not parse TIFF header.',
      });
      return undefined;
    }
    exifThumbRef.current = p.thumbDataUrl;
    setExifParsed({ ...p, error: null });
    return () => {
      if (exifThumbRef.current) {
        URL.revokeObjectURL(exifThumbRef.current);
        exifThumbRef.current = null;
      }
    };
  }, [exifData]);

  const applyHexFromInput = useCallback(() => {
    setHexBytes(parseHexOrText(hexInput, hexMode));
    setHexViewStart(0);
  }, [hexInput, hexMode]);

  const hexParsed = useMemo(() => hexBytes, [hexBytes]);
  const searchParsed = useMemo(() => parseSearchQuery(hexSearch, hexSearchHex), [hexSearch, hexSearchHex]);
  const matchRanges = useMemo(() => {
    if (!searchParsed?.bytes?.length) return [];
    const matches = findAllMatches(hexParsed, searchParsed.bytes);
    const len = searchParsed.bytes.length;
    return matches.map((o) => [o, o + len]);
  }, [hexParsed, searchParsed]);

  const hexRowStart = Math.floor(hexViewStart / BYTES_PER_ROW);
  const totalRows = Math.ceil(hexParsed.length / BYTES_PER_ROW) || 1;
  const visibleRows = Math.min(ROWS_PER_VIEW, totalRows - hexRowStart);
  const canPrev = hexRowStart > 0;
  const canNext = hexRowStart + visibleRows < totalRows;

  const stringsList = useMemo(() => {
    const raw = extractAllStrings(strData, strMinLen, strEncoding);
    if (!strFilter.trim()) return raw;
    const q = strFilter.toLowerCase();
    return raw.filter((s) => s.text.toLowerCase().includes(q) || String(s.offset).includes(q));
  }, [strData, strMinLen, strEncoding, strFilter]);

  const magicResult = useMemo(() => {
    if (!magicData.length) return null;
    return matchMagic(magicData);
  }, [magicData]);

  const cardStyle = { background: cardBg, border: '1px solid rgba(255,255,255,0.06)' };

  return (
    <div style={{ minHeight: '100%', background: pageBg, padding: 24, color: textPrimary }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${headerIconAccent}22`,
            border: `1px solid ${headerIconAccent}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Search size={20} color={headerIconAccent} strokeWidth={2} />
        </div>
        <h1 style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, margin: 0, color: textPrimary }}>
          Forensics Toolkit
        </h1>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 10,
                border: active ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
                background: active ? accentMuted : surfaceBg,
                color: active ? accent : textMuted,
                cursor: 'pointer',
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'hex' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={cardStyle}>
            <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>
              Load data
            </div>
            <DropZone
              label="Drop file or click to load binary"
              onData={(u8arr) => {
                setHexBytes(u8arr);
                setHexViewStart(0);
              }}
            />
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setHexMode('hex')}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${hexMode === 'hex' ? accent : 'rgba(255,255,255,0.1)'}`,
                  background: hexMode === 'hex' ? accentMuted : 'transparent',
                  color: hexMode === 'hex' ? accent : textMuted,
                  cursor: 'pointer',
                }}
              >
                Parse as hex dump
              </button>
              <button
                type="button"
                onClick={() => setHexMode('text')}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${hexMode === 'text' ? accent : 'rgba(255,255,255,0.1)'}`,
                  background: hexMode === 'text' ? accentMuted : 'transparent',
                  color: hexMode === 'text' ? accent : textMuted,
                  cursor: 'pointer',
                }}
              >
                Raw text → bytes
              </button>
            </div>
            <textarea
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Paste hex dump or raw text, then Parse…"
              style={{
                marginTop: 12,
                width: '100%',
                minHeight: 100,
                boxSizing: 'border-box',
                padding: 12,
                borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.08)`,
                background: surfaceBg,
                color: textPrimary,
                fontFamily: mono,
                fontSize: 11,
                resize: 'vertical',
              }}
            />
            <button
              type="button"
              onClick={applyHexFromInput}
              style={{
                marginTop: 10,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${accent}`,
                background: accentMuted,
                color: accent,
                cursor: 'pointer',
              }}
            >
              Parse textarea → buffer
            </button>
          </Card>

          <Card style={cardStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: textMuted }}>
                {hexParsed.length} bytes ({formatBytes(hexParsed.length)})
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, fontSize: 11, color: textMuted }}>
                <input type="checkbox" checked={hexSearchHex} onChange={(e) => setHexSearchHex(e.target.checked)} />
                Treat search as hex
              </label>
              <input
                type="text"
                value={hexSearch}
                onChange={(e) => setHexSearch(e.target.value)}
                placeholder="Search ASCII or hex…"
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: surfaceBg,
                  color: textPrimary,
                  fontFamily: mono,
                  fontSize: 11,
                }}
              />
              <span style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>
                {matchRanges.length} match{matchRanges.length === 1 ? '' : 'es'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>Go to offset (hex or dec):</span>
              <input
                type="text"
                value={hexGoto}
                onChange={(e) => setHexGoto(e.target.value)}
                style={{
                  width: 120,
                  padding: '6px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: surfaceBg,
                  color: accent,
                  fontFamily: mono,
                  fontSize: 11,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = hexGoto.trim();
                  if (!v) return;
                  const n = v.startsWith('0x') || /[a-f]/i.test(v) ? parseInt(v.replace(/^0x/i, ''), 16) : parseInt(v, 10);
                  if (!Number.isFinite(n) || n < 0) return;
                  const row = Math.floor(n / BYTES_PER_ROW);
                  setHexViewStart(row * BYTES_PER_ROW);
                }}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${accentBorder}`,
                  background: accentMuted,
                  color: accent,
                  cursor: 'pointer',
                }}
              >
                Jump
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setHexViewStart((s) => Math.max(0, s - ROWS_PER_VIEW * BYTES_PER_ROW))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: surfaceBg,
                  color: canPrev ? textPrimary : textMuted,
                  cursor: canPrev ? 'pointer' : 'not-allowed',
                  fontFamily: mono,
                  fontSize: 11,
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>
                Rows {hexRowStart + 1}–{hexRowStart + visibleRows} / {totalRows} (showing {ROWS_PER_VIEW} max)
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() =>
                  setHexViewStart((s) => Math.min(Math.max(0, totalRows * BYTES_PER_ROW - ROWS_PER_VIEW * BYTES_PER_ROW), s + ROWS_PER_VIEW * BYTES_PER_ROW))
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: surfaceBg,
                  color: canNext ? textPrimary : textMuted,
                  cursor: canNext ? 'pointer' : 'not-allowed',
                  fontFamily: mono,
                  fontSize: 11,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                lineHeight: 1.55,
                background: surfaceBg,
                borderRadius: 8,
                padding: 12,
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.06)',
                maxHeight: 480,
                overflowY: 'auto',
              }}
            >
              {hexParsed.length === 0 ? (
                <span style={{ color: textMuted }}>No data loaded.</span>
              ) : (
                Array.from({ length: visibleRows }, (_, ri) => {
                  const row = hexRowStart + ri;
                  const off = row * BYTES_PER_ROW;
                  const line = hexParsed.slice(off, off + BYTES_PER_ROW);
                  const hexCells = [];
                  for (let i = 0; i < BYTES_PER_ROW; i++) {
                    const globalOff = off + i;
                    const byteVal = line[i];
                    const isHit =
                      byteVal !== undefined &&
                      isInMatchRanges(globalOff, 1, matchRanges);
                    const gap = i === 8 ? '  ' : ' ';
                    if (byteVal === undefined) {
                      hexCells.push(<span key={i}>{gap}  </span>);
                    } else {
                      hexCells.push(
                        <span key={i}>
                          {gap}
                          <span
                            style={{
                              color: accent,
                              background: isHit ? 'rgba(110,231,183,0.25)' : 'transparent',
                              borderRadius: 2,
                              padding: '0 1px',
                            }}
                          >
                            {byteVal.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                        </span>,
                      );
                    }
                  }
                  const asciiChars = [];
                  for (let i = 0; i < BYTES_PER_ROW; i++) {
                    const globalOff = off + i;
                    const byteVal = line[i];
                    const isHit =
                      byteVal !== undefined && isInMatchRanges(globalOff, 1, matchRanges);
                    asciiChars.push(
                      <span
                        key={i}
                        style={{
                          color: textMuted,
                          opacity: 0.85,
                          background: isHit ? 'rgba(110,231,183,0.2)' : 'transparent',
                        }}
                      >
                        {byteVal === undefined ? ' ' : asciiChar(byteVal)}
                      </span>,
                    );
                  }
                  return (
                    <div key={off} style={{ display: 'flex', gap: 12, whiteSpace: 'pre' }}>
                      <span style={{ color: textMuted, minWidth: 72, userSelect: 'none' }}>
                        {off.toString(16).toUpperCase().padStart(8, '0')}
                      </span>
                      <span style={{ flex: 1 }}>{hexCells}</span>
                      <span style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 10 }}>{asciiChars}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'strings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={cardStyle}>
            <DropZone
              label="Drop file or load binary"
              onData={setStrData}
            />
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontFamily: heading, fontSize: 12, color: textMuted, marginBottom: 8 }}>Min length ({strMinLen})</div>
                <input
                  type="range"
                  min={4}
                  max={20}
                  value={strMinLen}
                  onChange={(e) => setStrMinLen(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ fontFamily: heading, fontSize: 12, color: textMuted, marginBottom: 8 }}>Encoding</div>
                <select
                  value={strEncoding}
                  onChange={(e) => setStrEncoding(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: surfaceBg,
                    color: textPrimary,
                    fontFamily: mono,
                    fontSize: 11,
                  }}
                >
                  <option value="ascii">ASCII</option>
                  <option value="utf8">UTF-8</option>
                  <option value="utf16le">UTF-16 LE</option>
                  <option value="utf16be">UTF-16 BE</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={strFilter}
                onChange={(e) => setStrFilter(e.target.value)}
                placeholder="Filter results…"
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: surfaceBg,
                  color: textPrimary,
                  fontFamily: mono,
                  fontSize: 11,
                }}
              />
              <span style={{ fontFamily: mono, fontSize: 12, color: accent }}>
                Found {stringsList.length} strings
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(stringsList.map((s) => s.text).join('\n'))}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${accent}`,
                  background: accentMuted,
                  color: accent,
                  cursor: 'pointer',
                }}
              >
                Copy All Strings
              </button>
            </div>
          </Card>
          <Card style={{ ...cardStyle, maxHeight: 520, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
              <thead>
                <tr style={{ color: textMuted, textAlign: 'left' }}>
                  <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Offset</th>
                  <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Len</th>
                  <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>String</th>
                  <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {stringsList.map((s, idx) => {
                  const hi = stringInterestLevel(s.text) > 0;
                  return (
                    <tr
                      key={`${s.offset}-${idx}`}
                      style={{
                        background: hi ? 'rgba(167,139,250,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <td style={{ padding: 8, color: textMuted }}>0x{s.offset.toString(16)}</td>
                      <td style={{ padding: 8, color: textMuted }}>{s.len}</td>
                      <td style={{ padding: 8, color: textPrimary, wordBreak: 'break-all' }}>{s.text}</td>
                      <td style={{ padding: 4 }}>
                        <CopyButton text={s.text} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {strData.length === 0 ? (
              <div style={{ fontFamily: mono, fontSize: 11, color: textMuted, padding: 16 }}>Load a file to extract strings.</div>
            ) : null}
          </Card>
        </div>
      )}

      {tab === 'magic' && (
        <Card style={cardStyle}>
          <DropZone label="Drop any file to inspect magic bytes" onData={setMagicData} />
          {magicData.length > 0 && (
            <div style={{ marginTop: 20 }}>
              {magicResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: accent }}>{magicResult.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 12, color: textPrimary }}>
                    <div>
                      <span style={{ color: textMuted }}>MIME: </span>
                      {magicResult.mime}
                    </div>
                    <div>
                      <span style={{ color: textMuted }}>Extension: </span>
                      {magicResult.ext || '—'}
                    </div>
                    <div>
                      <span style={{ color: textMuted }}>Description: </span>
                      {magicResult.desc}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: textMuted }}>First bytes (hex): </span>
                      {hexPrefix(magicData, 16)}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: '#FBBF24' }}>Unknown</div>
                  <p style={{ fontFamily: mono, fontSize: 12, color: textMuted }}>
                    No signature matched. First 64 bytes (hex) for manual analysis:
                  </p>
                  <pre
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: accent,
                      background: surfaceBg,
                      padding: 12,
                      borderRadius: 8,
                      overflowX: 'auto',
                      wordBreak: 'break-all',
                    }}
                  >
                    {hexPrefix(magicData, 64)}
                  </pre>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: heading, fontSize: 12, color: textMuted, marginBottom: 6 }}>Raw first 64 bytes</div>
                <pre
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: textPrimary,
                    background: surfaceBg,
                    padding: 12,
                    borderRadius: 8,
                    overflowX: 'auto',
                  }}
                >
                  {hexPrefix(magicData, 64)}
                </pre>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'exif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={cardStyle}>
            <DropZone label="Drop JPEG (or TIFF with JPEG compression)" accept="image/jpeg,image/tif,image/tiff,.jpg,.jpeg" onData={setExifData} />
            {exifParsed.error && (
              <div style={{ marginTop: 12, fontFamily: mono, fontSize: 12, color: '#FBBF24' }}>{exifParsed.error}</div>
            )}
            {exifParsed.hasGps && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(251,113,133,0.12)',
                  border: '1px solid rgba(251,113,133,0.35)',
                  fontFamily: heading,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FB7185',
                }}
              >
                This image has GPS data — location privacy risk.
              </div>
            )}
            {exifParsed.thumbDataUrl && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontFamily: heading, fontSize: 12, color: textMuted, marginBottom: 8 }}>EXIF thumbnail</div>
                <img
                  src={exifParsed.thumbDataUrl}
                  alt="EXIF thumb"
                  style={{ maxWidth: 320, maxHeight: 320, borderRadius: 8, border: `1px solid ${accentBorder}` }}
                />
              </div>
            )}
          </Card>
          {exifData.length > 0 && !exifParsed.error && (
            <Card style={cardStyle}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12 }}>Tags</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                <thead>
                  <tr style={{ color: textMuted, textAlign: 'left' }}>
                    <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Tag</th>
                    <th style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {exifParsed.rows.map((r, i) => (
                    <tr key={`${r.name}-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: 8, color: accent }}>{r.name}</td>
                      <td style={{ padding: 8, color: textPrimary, wordBreak: 'break-all' }}>{r.display}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {exifParsed.rows.length === 0 && (
                <p style={{ color: textMuted, fontFamily: mono, fontSize: 12 }}>No EXIF IFD entries found.</p>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === 'ref' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FORENSICS_COMMANDS.map((section) => (
            <Card key={section.title} style={cardStyle}>
              <div style={{ fontFamily: heading, fontSize: 16, fontWeight: 700, color: accent, marginBottom: 14 }}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.items.map((item, idx) => (
                  <div
                    key={`${section.title}-${idx}`}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: surfaceBg,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <code style={{ fontFamily: mono, fontSize: 12, color: accent, fontWeight: 600 }}>{item.cmd}</code>
                      <CopyButton text={item.example} />
                    </div>
                    <p style={{ fontFamily: heading, fontSize: 12, color: textMuted, margin: '6px 0 4px' }}>{item.desc}</p>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: mono,
                        fontSize: 10,
                        color: textPrimary,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.example}
                    </pre>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

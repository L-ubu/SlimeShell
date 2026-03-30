const transforms = [
  { id: 'base64-encode', label: 'Base64 Encode', group: 'Base64' },
  { id: 'base64-decode', label: 'Base64 Decode', group: 'Base64' },
  { id: 'url-encode', label: 'URL Encode', group: 'URL' },
  { id: 'url-decode', label: 'URL Decode', group: 'URL' },
  { id: 'url-double-encode', label: 'URL Double Encode', group: 'URL' },
  { id: 'url-double-decode', label: 'URL Double Decode', group: 'URL' },
  { id: 'hex-encode', label: 'Hex Encode', group: 'Hex' },
  { id: 'hex-decode', label: 'Hex Decode', group: 'Hex' },
  { id: 'hex-0x-encode', label: 'Hex 0x Encode', group: 'Hex' },
  { id: 'hex-0x-decode', label: 'Hex 0x Decode', group: 'Hex' },
  { id: 'html-encode', label: 'HTML Entity Encode', group: 'HTML' },
  { id: 'html-decode', label: 'HTML Entity Decode', group: 'HTML' },
  { id: 'rot13', label: 'ROT13', group: 'Cipher' },
  { id: 'rot47', label: 'ROT47', group: 'Cipher' },
  { id: 'rot-all', label: 'ROT All (1–25)', group: 'Cipher' },
  { id: 'binary-encode', label: 'Binary Encode', group: 'Binary' },
  { id: 'binary-decode', label: 'Binary Decode', group: 'Binary' },
  { id: 'reverse', label: 'Reverse String', group: 'Text' },
  { id: 'uppercase', label: 'UPPERCASE', group: 'Text' },
  { id: 'lowercase', label: 'lowercase', group: 'Text' },
  { id: 'unicode-escape', label: 'Unicode Escape', group: 'Unicode' },
  { id: 'unicode-unescape', label: 'Unicode Unescape', group: 'Unicode' },
  { id: 'unicode-fullwidth', label: 'Unicode Fullwidth', group: 'Unicode' },
  { id: 'atbash', label: 'Atbash Cipher', group: 'Cipher' },
  { id: 'decimal-encode', label: 'Decimal (char codes)', group: 'Numeric' },
  { id: 'decimal-decode', label: 'Decimal Decode', group: 'Numeric' },
  { id: 'octal-encode', label: 'Octal Encode', group: 'Numeric' },
  { id: 'octal-decode', label: 'Octal Decode', group: 'Numeric' },
  { id: 'morse-encode', label: 'Morse Encode', group: 'Morse' },
  { id: 'morse-decode', label: 'Morse Decode', group: 'Morse' },
  { id: 'caesar-encode', label: 'Caesar Cipher (shift 3)', group: 'Cipher' },
  { id: 'caesar-decode', label: 'Caesar Decipher (shift 3)', group: 'Cipher' },
  { id: 'base32-encode', label: 'Base32 Encode', group: 'Base32' },
  { id: 'base32-decode', label: 'Base32 Decode', group: 'Base32' },
  { id: 'base58-encode', label: 'Base58 Encode', group: 'Base58' },
  { id: 'base58-decode', label: 'Base58 Decode', group: 'Base58' },
  { id: 'base85-encode', label: 'ASCII85 Encode', group: 'Base85' },
  { id: 'base85-decode', label: 'ASCII85 Decode', group: 'Base85' },
  { id: 'jwt-decode', label: 'JWT Decode', group: 'JWT' },
  { id: 'punycode-encode', label: 'Punycode Encode', group: 'Punycode' },
  { id: 'punycode-decode', label: 'Punycode Decode', group: 'Punycode' },
  { id: 'nato-encode', label: 'NATO Phonetic Encode', group: 'NATO' },
  { id: 'nato-decode', label: 'NATO Phonetic Decode', group: 'NATO' },
  { id: 'braille-encode', label: 'Braille Encode', group: 'Braille' },
  { id: 'braille-decode', label: 'Braille Decode', group: 'Braille' },
  { id: 'bacon-encode', label: "Bacon's Cipher Encode", group: 'Cipher' },
  { id: 'bacon-decode', label: "Bacon's Cipher Decode", group: 'Cipher' },
  { id: 'a1z26-encode', label: 'A1Z26 Encode', group: 'Cipher' },
  { id: 'a1z26-decode', label: 'A1Z26 Decode', group: 'Cipher' },
  { id: 'tap-encode', label: 'Tap Code Encode', group: 'Cipher' },
  { id: 'tap-decode', label: 'Tap Code Decode', group: 'Cipher' },
  { id: 'xor-encode', label: 'XOR Encode (key 0x42)', group: 'XOR' },
  { id: 'xor-decode', label: 'XOR Decode (key 0x42)', group: 'XOR' },
];

function rot(str, shift, start, end) {
  return str.replace(/./g, c => {
    const code = c.charCodeAt(0);
    if (code >= start && code <= end) {
      return String.fromCharCode(((code - start + shift) % (end - start + 1)) + start);
    }
    return c;
  });
}

const MORSE_MAP = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
  'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
  'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---',
  '3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.'  :'.-.-.-',
  ',':'--..--','?':'..--..','!':'-.-.--','/' :'-..-.','(':'-.--.', ')':'-.--.-','&':'.-...',':':'---...',
  ';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.',
  ' ':'/',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

function morseEncode(text) {
  return text.toUpperCase().split('').map(c => MORSE_MAP[c] || c).join(' ');
}

function morseDecode(text) {
  return text.trim().split(/\s{3,}/).map(word =>
    word.split(/\s+/).map(c => MORSE_REV[c] || c).join('')
  ).join(' ');
}

function caesarShift(text, shift) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let bits = '', out = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  while (bits.length % 5 !== 0) bits += '0';
  for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  while (out.length % 8 !== 0) out += '=';
  return out;
}

function base32Decode(input) {
  const clean = input.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/** Bitcoin Base58 alphabet */
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(str) {
  const bytes = new TextEncoder().encode(str);
  if (bytes.length === 0) return '';
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let out = '';
  for (let k = 0; k < bytes.length && bytes[k] === 0; k++) out += B58[0];
  for (let q = digits.length - 1; q >= 0; q--) out += B58[digits[q]];
  return out;
}

function base58Decode(input) {
  const str = input.trim();
  if (!str) return '';
  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const v = B58.indexOf(str[i]);
    if (v === -1) throw new Error('Invalid Base58 character');
    let carry = v;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let k = 0; k < str.length && str[k] === B58[0]; k++) bytes.push(0);
  return new TextDecoder().decode(new Uint8Array(bytes.reverse()));
}

/** Adobe ASCII85: encodes binary to !..u, wrapped in <~ ~> */
function ascii85Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let out = '<~';
  let i = 0;
  while (i < bytes.length) {
    const chunk = bytes.subarray(i, i + 4);
    i += chunk.length;
    let value = 0;
    for (let j = 0; j < chunk.length; j++) value = value * 256 + chunk[j];
    const n = chunk.length;
    if (n < 4) value <<= 8 * (4 - n);
    if (n === 4 && value === 0) {
      out += 'z';
      continue;
    }
    const enc = [];
    for (let j = 0; j < 5; j++) {
      enc.unshift((value % 85) + 33);
      value = Math.floor(value / 85);
    }
    const take = n + 1;
    for (let j = 0; j < take; j++) out += String.fromCharCode(enc[j]);
  }
  out += '~>';
  return out;
}

function ascii85Decode(input) {
  let s = input.replace(/\s/g, '');
  if (s.startsWith('<~')) s = s.slice(2);
  if (s.endsWith('~>')) s = s.slice(0, -2);
  const bytes = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === 'z') {
      bytes.push(0, 0, 0, 0);
      i++;
      continue;
    }
    const remaining = s.length - i;
    const take = remaining >= 5 ? 5 : remaining;
    let chunk = s.slice(i, i + take);
    i += take;
    const rawLen = chunk.length;
    if (rawLen < 2) throw new Error('ASCII85 group needs at least 2 characters');
    while (chunk.length < 5) chunk += 'u';
    let value = 0;
    for (let j = 0; j < 5; j++) {
      const c = chunk.charCodeAt(j);
      if (c < 33 || c > 117) throw new Error('Invalid ASCII85 character');
      value = value * 85 + (c - 33);
    }
    const outCount = i >= s.length && rawLen < 5 ? rawLen - 1 : 4;
    const b = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
    bytes.push(...b.slice(0, outCount));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function jwtDecodeParts(input) {
  const parts = input.trim().split('.');
  if (parts.length < 2) throw new Error('JWT must have at least header.payload');
  const b64urlToJson = (b64) => {
    let s = b64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (s.length % 4)) % 4;
    s += '='.repeat(pad);
    const json = decodeURIComponent(escape(atob(s)));
    return JSON.stringify(JSON.parse(json), null, 2);
  };
  const header = b64urlToJson(parts[0]);
  const payload = b64urlToJson(parts[1]);
  return `=== Header ===\n${header}\n\n=== Payload ===\n${payload}`;
}

/** RFC 3492 Punycode (adapted from punycode.js by Mathias Bynens, MIT) */
const _pcMaxInt = 2147483647;
const _pcBase = 36;
const _pcTMin = 1;
const _pcTMax = 26;
const _pcSkew = 38;
const _pcDamp = 700;
const _pcInitialBias = 72;
const _pcInitialN = 128;
const _pcDelimiter = '-';
const _pcBaseMinusTMin = _pcBase - _pcTMin;

function _pcUcs2decode(string) {
  const output = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      const extra = string.charCodeAt(counter++);
      if ((extra & 0xfc00) === 0xdc00) {
        output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

function _pcBasicToDigit(codePoint) {
  if (codePoint >= 0x30 && codePoint < 0x3a) return 26 + (codePoint - 0x30);
  if (codePoint >= 0x41 && codePoint < 0x5b) return codePoint - 0x41;
  if (codePoint >= 0x61 && codePoint < 0x7b) return codePoint - 0x61;
  return _pcBase;
}

function _pcDigitToBasic(digit, flag) {
  return digit + 22 + 75 * (digit < 26 ? 1 : 0) - ((flag !== 0 ? 1 : 0) << 5);
}

function _pcAdapt(delta, numPoints, firstTime) {
  let k = 0;
  delta = firstTime ? Math.floor(delta / _pcDamp) : delta >> 1;
  delta += Math.floor(delta / numPoints);
  for (; delta > (_pcBaseMinusTMin * _pcTMax) >> 1; k += _pcBase) {
    delta = Math.floor(delta / _pcBaseMinusTMin);
  }
  return Math.floor(k + ((_pcBaseMinusTMin + 1) * delta) / (delta + _pcSkew));
}

function punycodeDecode(input) {
  const output = [];
  const inputLength = input.length;
  let i = 0;
  let n = _pcInitialN;
  let bias = _pcInitialBias;
  let basic = input.lastIndexOf(_pcDelimiter);
  if (basic < 0) basic = 0;
  for (let j = 0; j < basic; j++) {
    if (input.charCodeAt(j) >= 0x80) throw new Error('Invalid punycode: non-basic');
    output.push(input.charCodeAt(j));
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
    const oldi = i;
    for (let w = 1, k = _pcBase; ; k += _pcBase) {
      if (index >= inputLength) throw new Error('Invalid punycode');
      const digit = _pcBasicToDigit(input.charCodeAt(index++));
      if (digit >= _pcBase) throw new Error('Invalid punycode');
      if (digit > Math.floor((_pcMaxInt - i) / w)) throw new Error('Punycode overflow');
      i += digit * w;
      const t = k <= bias ? _pcTMin : k >= bias + _pcTMax ? _pcTMax : k - bias;
      if (digit < t) break;
      const baseMinusT = _pcBase - t;
      if (w > Math.floor(_pcMaxInt / baseMinusT)) throw new Error('Punycode overflow');
      w *= baseMinusT;
    }
    const out = output.length + 1;
    bias = _pcAdapt(i - oldi, out, oldi === 0);
    if (Math.floor(i / out) > _pcMaxInt - n) throw new Error('Punycode overflow');
    n += Math.floor(i / out);
    i %= out;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

function punycodeEncode(input) {
  const output = [];
  const inputCodePoints = _pcUcs2decode(input);
  const inputLength = inputCodePoints.length;
  let n = _pcInitialN;
  let delta = 0;
  let bias = _pcInitialBias;
  for (const currentValue of inputCodePoints) {
    if (currentValue < 0x80) output.push(String.fromCharCode(currentValue));
  }
  const basicLength = output.length;
  let handledCPCount = basicLength;
  if (basicLength) output.push(_pcDelimiter);
  while (handledCPCount < inputLength) {
    let m = _pcMaxInt;
    for (const currentValue of inputCodePoints) {
      if (currentValue >= n && currentValue < m) m = currentValue;
    }
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > Math.floor((_pcMaxInt - delta) / handledCPCountPlusOne)) {
      throw new Error('Punycode overflow');
    }
    delta += (m - n) * handledCPCountPlusOne;
    n = m;
    for (const currentValue of inputCodePoints) {
      if (currentValue < n && ++delta > _pcMaxInt) throw new Error('Punycode overflow');
      if (currentValue === n) {
        let q = delta;
        for (let k = _pcBase; ; k += _pcBase) {
          const t = k <= bias ? _pcTMin : k >= bias + _pcTMax ? _pcTMax : k - bias;
          if (q < t) break;
          const qMinusT = q - t;
          const baseMinusT = _pcBase - t;
          output.push(String.fromCharCode(_pcDigitToBasic(t + (qMinusT % baseMinusT), 0)));
          q = Math.floor(qMinusT / baseMinusT);
        }
        output.push(String.fromCharCode(_pcDigitToBasic(q, 0)));
        bias = _pcAdapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        handledCPCount++;
      }
    }
    delta++;
    n++;
  }
  return output.join('');
}

const NATO_WORDS = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India',
  'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo',
  'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu',
];
const NATO_MAP = Object.fromEntries(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c, i) => [c, NATO_WORDS[i]])
);
const NATO_REV = Object.fromEntries(
  NATO_WORDS.map((w, i) => [w.toLowerCase(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]])
);
NATO_REV['xray'] = 'X';
NATO_REV['x-ray'] = 'X';

function natoEncode(text) {
  return text.toUpperCase().split('').map((c) => {
    if (c === ' ') return '/';
    const m = NATO_MAP[c];
    return m || c;
  }).join(' ');
}

function natoDecode(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') return ' ';
      const key = token.replace(/-/g, '').toLowerCase();
      const k2 = token.toLowerCase();
      return NATO_REV[k2] || NATO_REV[key] || token;
    })
    .join('');
}

/** Unicode Braille: U+2800 + dot bitmask (1..6 per Braille order) */
const BRAILLE_LETTER_BITS = {
  a: 0x01, b: 0x03, c: 0x09, d: 0x19, e: 0x11, f: 0x0b, g: 0x1b, h: 0x13, i: 0x0a, j: 0x1a,
  k: 0x05, l: 0x07, m: 0x0d, n: 0x1d, o: 0x15, p: 0x0f, q: 0x1f, r: 0x17, s: 0x0e, t: 0x1e,
  u: 0x25, v: 0x27, w: 0x3a, x: 0x2d, y: 0x3d, z: 0x35,
};
const BRAILLE_REV = Object.fromEntries(
  Object.entries(BRAILLE_LETTER_BITS).map(([k, v]) => [v, k])
);

function brailleEncode(text) {
  return text
    .toLowerCase()
    .split('')
    .map((c) => {
      if (c === ' ') return ' ';
      const bits = BRAILLE_LETTER_BITS[c];
      if (bits === undefined) return c;
      return String.fromCodePoint(0x2800 + bits);
    })
    .join('');
}

function brailleDecode(text) {
  return [...text]
    .map((ch) => {
      const cp = ch.codePointAt(0);
      if (cp >= 0x2800 && cp <= 0x28ff) {
        const bits = cp - 0x2800;
        return BRAILLE_REV[bits] || ch;
      }
      return ch;
    })
    .join('');
}

/** Bacon: A=aaaaa … Z=bbaab (standard 24-letter I/J U/V variant extended to 26) */
const BACON_PATTERNS = [
  'aaaaa', 'aaaab', 'aaaba', 'aaabb', 'aabaa', 'aabab', 'aabba', 'aabbb', 'abaaa', 'abaab',
  'ababa', 'ababb', 'abbaa', 'abbab', 'abbba', 'abbbb', 'baaaa', 'baaab', 'baaba', 'baabb',
  'babaa', 'babab', 'babba', 'babbb', 'bbaaa', 'bbaab',
];
const BACON_REV = Object.fromEntries(BACON_PATTERNS.map((p, i) => [p, String.fromCharCode(97 + i)]));

function baconEncode(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .map((c) => BACON_PATTERNS[c.charCodeAt(0) - 97] || '')
    .filter(Boolean)
    .join(' ');
}

function baconDecode(text) {
  const norm = text.toLowerCase().replace(/[^ab]/g, '');
  const parts = [];
  for (let i = 0; i + 5 <= norm.length; i += 5) {
    const chunk = norm.slice(i, i + 5);
    parts.push(BACON_REV[chunk] || '?');
  }
  return parts.join('');
}

function a1z26Encode(text) {
  return text
    .toUpperCase()
    .split('')
    .map((c) => {
      if (c === ' ') return '';
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String(code - 64);
      return c;
    })
    .filter((x) => x !== '')
    .join('-');
}

function a1z26Decode(text) {
  return text
    .split(/[\s\-]+/)
    .filter(Boolean)
    .map((t) => {
      const n = parseInt(t, 10);
      if (n >= 1 && n <= 26) return String.fromCharCode(64 + n);
      return t;
    })
    .join('');
}

/** Tap code: 5x5 Polybius, C and K share same cell (row,col 1-5) */
const TAP_GRID = [
  ['a', 'b', 'c', 'd', 'e'],
  ['f', 'g', 'h', 'i', 'k'],
  ['l', 'm', 'n', 'o', 'p'],
  ['q', 'r', 's', 't', 'u'],
  ['v', 'w', 'x', 'y', 'z'],
];
const TAP_POS = {};
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    TAP_POS[TAP_GRID[r][c]] = [r + 1, c + 1];
  }
}
TAP_POS.j = TAP_POS.i;

function tapEncode(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .map((c) => {
      const ch = c === 'j' ? 'i' : c;
      const pos = TAP_POS[ch];
      if (!pos) return '';
      return `${pos[0]}${pos[1]}`;
    })
    .filter(Boolean)
    .join(' ');
}

function tapDecode(text) {
  const tokens = text.trim().split(/\s+/);
  let out = '';
  for (const tok of tokens) {
    const digits = tok.replace(/\D/g, '');
    if (digits.length >= 2) {
      const r = parseInt(digits[0], 10) - 1;
      const c = parseInt(digits[1], 10) - 1;
      if (r >= 0 && r < 5 && c >= 0 && c < 5) out += TAP_GRID[r][c];
    }
  }
  return out;
}

const XOR_KEY = 0x42;

function xorTransform(input) {
  const bytes = new TextEncoder().encode(input);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ XOR_KEY;
  return new TextDecoder().decode(out);
}

function hex0xEncode(input) {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => '0x' + b.toString(16).padStart(2, '0'))
    .join(' ');
}

function hex0xDecode(input) {
  const hexes = input.match(/0x[0-9a-fA-F]{2}/g) || [];
  return new TextDecoder().decode(new Uint8Array(hexes.map((h) => parseInt(h.slice(2), 16))));
}

function unicodeFullwidth(input) {
  return [...input]
    .map((c) => {
      const code = c.codePointAt(0);
      if (code === 0x20) return '\u3000';
      if (code >= 0x21 && code <= 0x7e) return String.fromCodePoint(0xff00 + (code - 0x21));
      return c;
    })
    .join('');
}

function rotAll(input) {
  const lines = [];
  for (let s = 1; s <= 25; s++) {
    lines.push(`ROT ${s}: ${caesarShift(input, s)}`);
  }
  return lines.join('\n');
}

function applyTransform(id, input) {
  if (!input) return '';
  try {
    switch (id) {
      case 'base64-encode': return btoa(unescape(encodeURIComponent(input)));
      case 'base64-decode': return decodeURIComponent(escape(atob(input)));
      case 'url-encode': return encodeURIComponent(input);
      case 'url-decode': return decodeURIComponent(input);
      case 'url-double-encode': return encodeURIComponent(encodeURIComponent(input));
      case 'url-double-decode': return decodeURIComponent(decodeURIComponent(input));
      case 'hex-encode': return Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      case 'hex-decode': return new TextDecoder().decode(new Uint8Array(input.trim().split(/[\s,]+/).map(h => parseInt(h, 16))));
      case 'hex-0x-encode': return hex0xEncode(input);
      case 'hex-0x-decode': return hex0xDecode(input);
      case 'html-encode': {
        const el = document.createElement('span');
        el.textContent = input;
        return el.innerHTML;
      }
      case 'html-decode': {
        const el = document.createElement('span');
        el.innerHTML = input;
        return el.textContent;
      }
      case 'rot13': return input.replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      case 'rot47': return rot(input, 47, 33, 126);
      case 'rot-all': return rotAll(input);
      case 'binary-encode': return Array.from(new TextEncoder().encode(input)).map(b => b.toString(2).padStart(8, '0')).join(' ');
      case 'binary-decode': return new TextDecoder().decode(new Uint8Array(input.trim().split(/\s+/).map(b => parseInt(b, 2))));
      case 'reverse': return [...input].reverse().join('');
      case 'uppercase': return input.toUpperCase();
      case 'lowercase': return input.toLowerCase();
      case 'unicode-escape': return Array.from(input).map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
      case 'unicode-unescape': return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      case 'unicode-fullwidth': return unicodeFullwidth(input);
      case 'atbash': return input.replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
      });
      case 'decimal-encode': return Array.from(new TextEncoder().encode(input)).join(' ');
      case 'decimal-decode': return new TextDecoder().decode(new Uint8Array(input.trim().split(/\s+/).map(Number)));
      case 'octal-encode': return Array.from(new TextEncoder().encode(input)).map(b => b.toString(8).padStart(3, '0')).join(' ');
      case 'octal-decode': return new TextDecoder().decode(new Uint8Array(input.trim().split(/\s+/).map(s => parseInt(s, 8))));
      case 'morse-encode': return morseEncode(input);
      case 'morse-decode': return morseDecode(input);
      case 'caesar-encode': return caesarShift(input, 3);
      case 'caesar-decode': return caesarShift(input, -3);
      case 'base32-encode': return base32Encode(input);
      case 'base32-decode': return base32Decode(input);
      case 'base58-encode': return base58Encode(input);
      case 'base58-decode': return base58Decode(input);
      case 'base85-encode': return ascii85Encode(input);
      case 'base85-decode': return ascii85Decode(input);
      case 'jwt-decode': return jwtDecodeParts(input);
      case 'punycode-encode': return punycodeEncode(input);
      case 'punycode-decode': {
        let s = input.trim();
        if (s.toLowerCase().startsWith('xn--')) s = s.slice(4);
        return punycodeDecode(s);
      }
      case 'nato-encode': return natoEncode(input);
      case 'nato-decode': return natoDecode(input);
      case 'braille-encode': return brailleEncode(input);
      case 'braille-decode': return brailleDecode(input);
      case 'bacon-encode': return baconEncode(input);
      case 'bacon-decode': return baconDecode(input);
      case 'a1z26-encode': return a1z26Encode(input);
      case 'a1z26-decode': return a1z26Decode(input);
      case 'tap-encode': return tapEncode(input);
      case 'tap-decode': return tapDecode(input);
      case 'xor-encode':
      case 'xor-decode': return xorTransform(input);
      default: return input;
    }
  } catch (e) {
    return `[Error: ${e.message}]`;
  }
}

function getInverse(id) {
  if (id === 'jwt-decode' || id === 'unicode-fullwidth' || id === 'rot-all') return id;
  if (id.endsWith('-encode')) return id.replace('-encode', '-decode');
  if (id.endsWith('-decode')) return id.replace('-decode', '-encode');
  return id;
}

function detectEncodings(input) {
  if (!input || !input.trim()) return [];
  const results = [];
  const trimmed = input.trim();

  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length >= 4 && trimmed.length % 4 <= 1) {
    try {
      const decoded = decodeURIComponent(escape(atob(trimmed)));
      if (decoded && /^[\x20-\x7E\n\r\t]+$/.test(decoded))
        results.push({ encoding: 'Base64', confidence: 95, decoded, transform: 'base64-decode' });
    } catch {}
  }

  if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed) && trimmed.length >= 2) {
    try {
      const decoded = base58Decode(trimmed);
      if (decoded && /^[\x20-\x7E\n\r\t\u00a0-\uffff]*$/.test(decoded) && decoded.length > 0)
        results.push({ encoding: 'Base58', confidence: 82, decoded, transform: 'base58-decode' });
    } catch {}
  }

  if (trimmed.startsWith('eyJ') && trimmed.split('.').length >= 3) {
    try {
      const decoded = jwtDecodeParts(trimmed);
      results.push({ encoding: 'JWT', confidence: 92, decoded, transform: 'jwt-decode' });
    } catch {}
  }

  if (/^(\d{1,2})([\s\-]+(\d{1,2}))+$/i.test(trimmed)) {
    const parts = trimmed.split(/[\s\-]+/).filter(Boolean);
    if (parts.length >= 2 && parts.every((p) => {
      const n = parseInt(p, 10);
      return n >= 1 && n <= 26;
    })) {
      try {
        const decoded = a1z26Decode(trimmed);
        if (/^[a-zA-Z]+$/.test(decoded.replace(/\s/g, '')) || decoded.length >= parts.length)
          results.push({ encoding: 'A1Z26', confidence: 78, decoded, transform: 'a1z26-decode' });
      } catch {}
    }
  }

  if (/^[A-Z2-7]+=*$/i.test(trimmed) && trimmed.length >= 8) {
    try {
      const decoded = base32Decode(trimmed);
      if (decoded && /^[\x20-\x7E\n\r\t]+$/.test(decoded))
        results.push({ encoding: 'Base32', confidence: 80, decoded, transform: 'base32-decode' });
    } catch {}
  }

  if (/(%[0-9A-Fa-f]{2})+/.test(trimmed)) {
    try {
      const decoded = decodeURIComponent(trimmed);
      if (decoded !== trimmed)
        results.push({ encoding: 'URL Encoded', confidence: 90, decoded, transform: 'url-decode' });
    } catch {}
  }

  if (/^([0-9a-fA-F]{2}[\s,]*)+$/.test(trimmed)) {
    try {
      const decoded = new TextDecoder().decode(new Uint8Array(trimmed.split(/[\s,]+/).map(h => parseInt(h, 16))));
      if (/^[\x20-\x7E\n\r\t]+$/.test(decoded))
        results.push({ encoding: 'Hex', confidence: 85, decoded, transform: 'hex-decode' });
    } catch {}
  }

  if (/^([01]{8}\s*)+$/.test(trimmed)) {
    try {
      const decoded = new TextDecoder().decode(new Uint8Array(trimmed.split(/\s+/).map(b => parseInt(b, 2))));
      if (/^[\x20-\x7E\n\r\t]+$/.test(decoded))
        results.push({ encoding: 'Binary', confidence: 90, decoded, transform: 'binary-decode' });
    } catch {}
  }

  if (/^[.\-/\s]+$/.test(trimmed) && trimmed.includes('.')) {
    const decoded = morseDecode(trimmed);
    if (decoded && decoded.length > 0)
      results.push({ encoding: 'Morse Code', confidence: 85, decoded, transform: 'morse-decode' });
  }

  if (/^(\d{1,3}\s+)+\d{1,3}$/.test(trimmed)) {
    try {
      const nums = trimmed.split(/\s+/).map(Number);
      if (nums.every(n => n >= 32 && n <= 126)) {
        const decoded = String.fromCharCode(...nums);
        results.push({ encoding: 'Decimal (ASCII)', confidence: 80, decoded, transform: 'decimal-decode' });
      }
    } catch {}
  }

  if (/^(\d{3}\s+)+\d{3}$/.test(trimmed)) {
    try {
      const nums = trimmed.split(/\s+/).map(s => parseInt(s, 8));
      if (nums.every(n => n >= 32 && n <= 126)) {
        const decoded = String.fromCharCode(...nums);
        results.push({ encoding: 'Octal', confidence: 75, decoded, transform: 'octal-decode' });
      }
    } catch {}
  }

  if (/^(\\u[0-9a-fA-F]{4})+$/.test(trimmed)) {
    const decoded = trimmed.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    results.push({ encoding: 'Unicode Escape', confidence: 95, decoded, transform: 'unicode-unescape' });
  }

  if (/&\w+;/.test(trimmed) || /&#\d+;/.test(trimmed)) {
    const el = document.createElement('span');
    el.innerHTML = trimmed;
    const decoded = el.textContent;
    if (decoded !== trimmed)
      results.push({ encoding: 'HTML Entities', confidence: 90, decoded, transform: 'html-decode' });
  }

  if (/^[a-zA-Z\s]+$/.test(trimmed) && trimmed.length >= 4) {
    const rot13d = caesarShift(trimmed, 13);
    results.push({ encoding: 'ROT13 (possible)', confidence: 40, decoded: rot13d, transform: 'rot13' });

    for (let shift = 1; shift <= 25; shift++) {
      if (shift === 13) continue;
      const shifted = caesarShift(trimmed, -shift);
      const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'flag', 'ctf', 'hack'];
      const lower = shifted.toLowerCase();
      const hits = commonWords.filter(w => lower.includes(w));
      if (hits.length >= 2) {
        results.push({ encoding: `Caesar (shift ${shift})`, confidence: 60 + hits.length * 5, decoded: shifted, transform: 'caesar-decode' });
      }
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results;
}

export { transforms, applyTransform, getInverse, detectEncodings, morseEncode, morseDecode };

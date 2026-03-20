export const transforms = {
  'base64-encode': {
    label: 'Base64 Encode',
    fn: (input) => btoa(unescape(encodeURIComponent(input))),
  },
  'base64-decode': {
    label: 'Base64 Decode',
    fn: (input) => {
      try { return decodeURIComponent(escape(atob(input))) }
      catch { return '[Invalid Base64]' }
    },
  },
  'hex-encode': {
    label: 'Hex Encode',
    fn: (input) => Array.from(new TextEncoder().encode(input)).map((b) => b.toString(16).padStart(2, '0')).join(' '),
  },
  'hex-decode': {
    label: 'Hex Decode',
    fn: (input) => {
      try {
        const bytes = input.replace(/\s+/g, '').match(/.{2}/g)?.map((h) => parseInt(h, 16)) || []
        return new TextDecoder().decode(new Uint8Array(bytes))
      } catch { return '[Invalid Hex]' }
    },
  },
  'url-encode': {
    label: 'URL Encode',
    fn: (input) => encodeURIComponent(input),
  },
  'url-decode': {
    label: 'URL Decode',
    fn: (input) => {
      try { return decodeURIComponent(input) }
      catch { return '[Invalid URL encoding]' }
    },
  },
  'rot13': {
    label: 'ROT13',
    fn: (input) => input.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    }),
  },
  'rot47': {
    label: 'ROT47',
    fn: (input) => input.replace(/[!-~]/g, (c) => {
      return String.fromCharCode(((c.charCodeAt(0) - 33 + 47) % 94) + 33)
    }),
  },
  'binary-encode': {
    label: 'Binary Encode',
    fn: (input) => Array.from(new TextEncoder().encode(input)).map((b) => b.toString(2).padStart(8, '0')).join(' '),
  },
  'binary-decode': {
    label: 'Binary Decode',
    fn: (input) => {
      try {
        const bytes = input.trim().split(/\s+/).map((b) => parseInt(b, 2))
        return new TextDecoder().decode(new Uint8Array(bytes))
      } catch { return '[Invalid Binary]' }
    },
  },
  'html-encode': {
    label: 'HTML Encode',
    fn: (input) => input.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  },
  'html-decode': {
    label: 'HTML Decode',
    fn: (input) => {
      const el = document.createElement('textarea')
      el.innerHTML = input
      return el.value
    },
  },
  'reverse': {
    label: 'Reverse String',
    fn: (input) => [...input].reverse().join(''),
  },
  'uppercase': {
    label: 'To Uppercase',
    fn: (input) => input.toUpperCase(),
  },
  'lowercase': {
    label: 'To Lowercase',
    fn: (input) => input.toLowerCase(),
  },
  'morse-encode': {
    label: 'Morse Encode',
    fn: (input) => {
      const MORSE = { 'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.', ' ': '/' }
      return input.toUpperCase().split('').map((c) => MORSE[c] || c).join(' ')
    },
  },
  'morse-decode': {
    label: 'Morse Decode',
    fn: (input) => {
      const MORSE_REV = {'.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9','/':' '}
      return input.split(' ').map((c) => MORSE_REV[c] || c).join('')
    },
  },
}

export const transformList = Object.entries(transforms).map(([id, t]) => ({ id, label: t.label }))

export function applyTransform(id, input) {
  const t = transforms[id]
  if (!t) return input
  try { return t.fn(input) }
  catch { return '[Error]' }
}

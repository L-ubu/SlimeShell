async function hashWith(algorithm, text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function md5(text) {
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476
  const bytes = new TextEncoder().encode(text)
  const bits = bytes.length * 8
  const padding = new Uint8Array(((bytes.length + 8 + 64) & ~63) - bytes.length)
  padding[0] = 0x80
  const view = new DataView(padding.buffer)
  view.setUint32(padding.length - 8, bits, true)
  const msg = new Uint8Array(bytes.length + padding.length)
  msg.set(bytes); msg.set(padding, bytes.length)

  const K = new Uint32Array(64)
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21]

  for (let o = 0; o < msg.length; o += 64) {
    const M = new Uint32Array(16)
    for (let j = 0; j < 16; j++) M[j] = msg[o+j*4] | (msg[o+j*4+1]<<8) | (msg[o+j*4+2]<<16) | (msg[o+j*4+3]<<24)
    let a=h0, b=h1, c=h2, d=h3
    for (let i = 0; i < 64; i++) {
      let f, g
      if (i<16) { f=(b&c)|((~b)&d); g=i }
      else if (i<32) { f=(d&b)|((~d)&c); g=(5*i+1)%16 }
      else if (i<48) { f=b^c^d; g=(3*i+5)%16 }
      else { f=c^(b|(~d)); g=(7*i)%16 }
      f = (f + a + K[i] + M[g]) >>> 0
      a = d; d = c; c = b
      b = (b + ((f << s[i]) | (f >>> (32-s[i])))) >>> 0
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0
  }
  return [h0,h1,h2,h3].map(v => {
    const b = [(v)&0xFF,(v>>8)&0xFF,(v>>16)&0xFF,(v>>24)&0xFF]
    return b.map(x=>x.toString(16).padStart(2,'0')).join('')
  }).join('')
}

export const sha1 = (text) => hashWith('SHA-1', text)
export const sha256 = (text) => hashWith('SHA-256', text)
export const sha512 = (text) => hashWith('SHA-512', text)

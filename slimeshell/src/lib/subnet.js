export function calculateSubnet(cidr) {
  const [ipStr, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr, 10)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null

  const parts = ipStr.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null

  const ip = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | ~mask) >>> 0
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0
  const hostCount = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2
  const wildcard = (~mask) >>> 0

  const toIp = (n) => [
    (n >>> 24) & 0xFF,
    (n >>> 16) & 0xFF,
    (n >>> 8) & 0xFF,
    n & 0xFF,
  ].join('.')

  return {
    network: toIp(network),
    broadcast: toIp(broadcast),
    firstHost: toIp(firstHost),
    lastHost: toIp(lastHost),
    hostCount,
    subnetMask: toIp(mask),
    wildcard: toIp(wildcard),
    prefix,
    cidr: `${toIp(network)}/${prefix}`,
  }
}

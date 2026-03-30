// Well-known ports reference (real data)
const commonPorts = [
  { port: 20, service: 'FTP Data', protocol: 'TCP', desc: 'File Transfer Protocol data channel' },
  { port: 21, service: 'FTP', protocol: 'TCP', desc: 'File Transfer Protocol control' },
  { port: 22, service: 'SSH', protocol: 'TCP', desc: 'Secure Shell' },
  { port: 23, service: 'Telnet', protocol: 'TCP', desc: 'Unencrypted text communications' },
  { port: 25, service: 'SMTP', protocol: 'TCP', desc: 'Simple Mail Transfer Protocol' },
  { port: 53, service: 'DNS', protocol: 'TCP/UDP', desc: 'Domain Name System' },
  { port: 67, service: 'DHCP', protocol: 'UDP', desc: 'Dynamic Host Configuration (server)' },
  { port: 68, service: 'DHCP', protocol: 'UDP', desc: 'Dynamic Host Configuration (client)' },
  { port: 69, service: 'TFTP', protocol: 'UDP', desc: 'Trivial File Transfer Protocol' },
  { port: 80, service: 'HTTP', protocol: 'TCP', desc: 'Hypertext Transfer Protocol' },
  { port: 88, service: 'Kerberos', protocol: 'TCP/UDP', desc: 'Network authentication protocol' },
  { port: 110, service: 'POP3', protocol: 'TCP', desc: 'Post Office Protocol v3' },
  { port: 111, service: 'RPCbind', protocol: 'TCP/UDP', desc: 'ONC RPC portmapper' },
  { port: 119, service: 'NNTP', protocol: 'TCP', desc: 'Network News Transfer Protocol' },
  { port: 123, service: 'NTP', protocol: 'UDP', desc: 'Network Time Protocol' },
  { port: 135, service: 'MS-RPC', protocol: 'TCP', desc: 'Microsoft RPC Endpoint Mapper' },
  { port: 137, service: 'NetBIOS', protocol: 'UDP', desc: 'NetBIOS Name Service' },
  { port: 138, service: 'NetBIOS', protocol: 'UDP', desc: 'NetBIOS Datagram Service' },
  { port: 139, service: 'NetBIOS', protocol: 'TCP', desc: 'NetBIOS Session Service' },
  { port: 143, service: 'IMAP', protocol: 'TCP', desc: 'Internet Message Access Protocol' },
  { port: 161, service: 'SNMP', protocol: 'UDP', desc: 'Simple Network Management Protocol' },
  { port: 162, service: 'SNMP Trap', protocol: 'UDP', desc: 'SNMP notifications' },
  { port: 389, service: 'LDAP', protocol: 'TCP', desc: 'Lightweight Directory Access Protocol' },
  { port: 443, service: 'HTTPS', protocol: 'TCP', desc: 'HTTP over TLS/SSL' },
  { port: 445, service: 'SMB', protocol: 'TCP', desc: 'Server Message Block / CIFS' },
  { port: 464, service: 'Kerberos', protocol: 'TCP/UDP', desc: 'Kerberos change/set password' },
  { port: 500, service: 'IKE', protocol: 'UDP', desc: 'Internet Key Exchange (IPsec/VPN)' },
  { port: 514, service: 'Syslog', protocol: 'UDP', desc: 'System Logging Protocol' },
  { port: 515, service: 'LPD', protocol: 'TCP', desc: 'Line Printer Daemon' },
  { port: 520, service: 'RIP', protocol: 'UDP', desc: 'Routing Information Protocol' },
  { port: 530, service: 'RPC', protocol: 'TCP/UDP', desc: 'Remote Procedure Call' },
  { port: 543, service: 'klogin', protocol: 'TCP', desc: 'Kerberos login' },
  { port: 587, service: 'SMTP', protocol: 'TCP', desc: 'Email message submission' },
  { port: 631, service: 'IPP', protocol: 'TCP', desc: 'Internet Printing Protocol (CUPS)' },
  { port: 636, service: 'LDAPS', protocol: 'TCP', desc: 'LDAP over TLS/SSL' },
  { port: 873, service: 'rsync', protocol: 'TCP', desc: 'rsync file synchronization' },
  { port: 993, service: 'IMAPS', protocol: 'TCP', desc: 'IMAP over TLS/SSL' },
  { port: 995, service: 'POP3S', protocol: 'TCP', desc: 'POP3 over TLS/SSL' },
  { port: 1080, service: 'SOCKS', protocol: 'TCP', desc: 'SOCKS proxy' },
  { port: 1433, service: 'MSSQL', protocol: 'TCP', desc: 'Microsoft SQL Server' },
  { port: 1434, service: 'MSSQL', protocol: 'UDP', desc: 'Microsoft SQL Monitor' },
  { port: 1521, service: 'Oracle', protocol: 'TCP', desc: 'Oracle database' },
  { port: 1723, service: 'PPTP', protocol: 'TCP', desc: 'Point-to-Point Tunneling Protocol' },
  { port: 2049, service: 'NFS', protocol: 'TCP/UDP', desc: 'Network File System' },
  { port: 3306, service: 'MySQL', protocol: 'TCP', desc: 'MySQL database' },
  { port: 3389, service: 'RDP', protocol: 'TCP', desc: 'Remote Desktop Protocol' },
  { port: 5432, service: 'PostgreSQL', protocol: 'TCP', desc: 'PostgreSQL database' },
  { port: 5900, service: 'VNC', protocol: 'TCP', desc: 'Virtual Network Computing' },
  { port: 5985, service: 'WinRM', protocol: 'TCP', desc: 'Windows Remote Management (HTTP)' },
  { port: 5986, service: 'WinRM', protocol: 'TCP', desc: 'Windows Remote Management (HTTPS)' },
  { port: 6379, service: 'Redis', protocol: 'TCP', desc: 'Redis key-value store' },
  { port: 6667, service: 'IRC', protocol: 'TCP', desc: 'Internet Relay Chat' },
  { port: 8080, service: 'HTTP Alt', protocol: 'TCP', desc: 'Alternative HTTP / proxy' },
  { port: 8443, service: 'HTTPS Alt', protocol: 'TCP', desc: 'Alternative HTTPS' },
  { port: 8888, service: 'HTTP Alt', protocol: 'TCP', desc: 'Alternative HTTP' },
  { port: 9090, service: 'WebSocket', protocol: 'TCP', desc: 'WebSocket / management console' },
  { port: 9200, service: 'Elasticsearch', protocol: 'TCP', desc: 'Elasticsearch REST API' },
  { port: 11211, service: 'Memcached', protocol: 'TCP/UDP', desc: 'Memcached caching system' },
  { port: 27017, service: 'MongoDB', protocol: 'TCP', desc: 'MongoDB database' },
];

function calcSubnet(cidr) {
  const [ip, bits] = cidr.split('/');
  const mask = parseInt(bits);
  if (isNaN(mask) || mask < 0 || mask > 32) return null;

  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;

  const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const maskNum = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
  const network = (ipNum & maskNum) >>> 0;
  const broadcast = (network | (~maskNum >>> 0)) >>> 0;
  const firstHost = mask >= 31 ? network : (network + 1) >>> 0;
  const lastHost = mask >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const totalHosts = mask >= 31 ? (mask === 32 ? 1 : 2) : Math.pow(2, 32 - mask) - 2;

  const toIP = n => `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;

  return {
    ip,
    cidr: `/${mask}`,
    netmask: toIP(maskNum),
    network: toIP(network),
    broadcast: toIP(broadcast),
    firstHost: toIP(firstHost),
    lastHost: toIP(lastHost),
    totalHosts,
    wildcardMask: toIP(~maskNum >>> 0),
    ipClass: parts[0] < 128 ? 'A' : parts[0] < 192 ? 'B' : parts[0] < 224 ? 'C' : parts[0] < 240 ? 'D' : 'E',
    isPrivate: (parts[0] === 10) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168),
  };
}

export { commonPorts, calcSubnet };

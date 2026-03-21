import { useState } from 'react'
import { FileText, Download, Eye, Plus, Trash2, ChevronDown, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const reportTypes = ['Pentest Report', 'Bug Bounty', 'Vulnerability Assessment', 'Incident Response', 'CTF Writeup']
const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Informational']

const initialFindings = [
  { id: 1, title: 'SQL Injection in Login Form', severity: 'Critical', status: 'confirmed', cvss: 9.8, description: 'The login form is vulnerable to SQL injection via the username parameter. An attacker can bypass authentication and extract database contents.' },
  { id: 2, title: 'Cross-Site Scripting (Reflected)', severity: 'High', status: 'confirmed', cvss: 7.5, description: 'Reflected XSS found in the search functionality. User input is rendered without sanitization.' },
  { id: 3, title: 'Missing Rate Limiting on API', severity: 'Medium', status: 'confirmed', cvss: 5.3, description: 'The authentication API endpoint lacks rate limiting, allowing brute-force attacks.' },
  { id: 4, title: 'Server Version Disclosure', severity: 'Low', status: 'confirmed', cvss: 3.1, description: 'The server response headers reveal the exact version of Apache and PHP being used.' },
  { id: 5, title: 'Missing Security Headers', severity: 'Low', status: 'confirmed', cvss: 2.5, description: 'Several security headers are missing: X-Frame-Options, X-Content-Type-Options, Content-Security-Policy.' },
]

const severityColors = { Critical: 'rose', High: 'gold', Medium: 'lavender', Low: 'sky', Informational: 'muted' }
const severityIcons = { Critical: AlertTriangle, High: AlertTriangle, Medium: Info, Low: Info, Informational: CheckCircle }

export default function Reports() {
  const [title, setTitle] = useState('Penetration Test Report - ACME Corp')
  const [type, setType] = useState('Pentest Report')
  const [findings, setFindings] = useState(initialFindings)
  const [client, setClient] = useState('ACME Corporation')
  const [tester, setTester] = useState('ghost_byte')
  const [dateRange, setDateRange] = useState('Mar 10-18, 2026')

  const removeFinding = (id) => {
    setFindings(findings.filter((f) => f.id !== id))
  }

  const criticalCount = findings.filter((f) => f.severity === 'Critical').length
  const highCount = findings.filter((f) => f.severity === 'High').length
  const mediumCount = findings.filter((f) => f.severity === 'Medium').length
  const lowCount = findings.filter((f) => f.severity === 'Low' || f.severity === 'Informational').length

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[calc(100vh-120px)]">
      {/* Config Panel */}
      <div className="w-full md:w-[380px] md:min-w-[380px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Report Config</span>
          <div className="space-y-3">
            <Input label="Report Title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Report title" />
            <div>
              <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5" htmlFor="report-type-select">Report Type</label>
              <select
                id="report-type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Report type"
                className="w-full bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
                  font-mono text-[12px] text-text-primary focus:outline-none focus:border-mint/15
                  focus-visible:ring-2 focus-visible:ring-mint cursor-pointer appearance-none"
              >
                {reportTypes.map((rt) => (
                  <option key={rt} value={rt} className="bg-slime-card">{rt}</option>
                ))}
              </select>
            </div>
            <Input label="Client" value={client} onChange={(e) => setClient(e.target.value)} aria-label="Client name" />
            <Input label="Tester" value={tester} onChange={(e) => setTester(e.target.value)} aria-label="Tester name" />
            <Input label="Date Range" value={dateRange} onChange={(e) => setDateRange(e.target.value)} aria-label="Date range" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Findings ({findings.length})</span>
            <Button variant="ghost" size="small" aria-label="Add finding"><Plus size={12} /> Add</Button>
          </div>
          <div className="space-y-1.5 overflow-y-auto">
            {findings.map((finding) => {
              const Icon = severityIcons[finding.severity]
              return (
                <div key={finding.id} className="bg-slime-code rounded-md p-2.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={12} className={`text-${severityColors[finding.severity] === 'rose' ? 'rose' : severityColors[finding.severity] === 'gold' ? 'gold' : 'text-dim'}`} />
                    <span className="font-mono text-[11px] text-text-primary flex-1 truncate">{finding.title}</span>
                    <button
                      onClick={() => removeFinding(finding.id)}
                      aria-label={`Remove finding: ${finding.title}`}
                      className="text-text-faint hover:text-rose cursor-pointer focus-visible:ring-2 focus-visible:ring-mint rounded"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={severityColors[finding.severity]}>{finding.severity}</Badge>
                    <span className="font-mono text-[11px] text-text-faint">CVSS {finding.cvss}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" aria-label="Export report as PDF"><Download size={14} /> Export PDF</Button>
          <Button variant="ghost" aria-label="Preview report"><Eye size={14} /></Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] font-semibold uppercase text-mint">Live Preview</span>
          <Badge color="mint" pill>{type}</Badge>
        </div>

        <div className="flex-1 bg-slime-code rounded-md border border-white/[0.04] overflow-y-auto p-6">
          {/* Report Header */}
          <div className="border-b border-white/[0.06] pb-4 mb-4">
            <div className="font-mono text-[11px] text-text-faint uppercase mb-2">Confidential</div>
            <h1 className="font-heading font-bold text-[24px] text-text-primary">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="font-mono text-[11px] text-text-dim">Client: <span className="text-text-secondary">{client}</span></span>
              <span className="font-mono text-[11px] text-text-dim">Tester: <span className="text-text-secondary">{tester}</span></span>
              <span className="font-mono text-[11px] text-text-dim">Date: <span className="text-text-secondary">{dateRange}</span></span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h2 className="font-heading font-bold text-[16px] text-mint mb-2">Executive Summary</h2>
            <p className="font-mono text-[11px] text-text-secondary leading-relaxed mb-3">
              A {type.toLowerCase()} was performed against {client} infrastructure during {dateRange}.
              The assessment identified <span className="text-rose font-semibold">{criticalCount} critical</span>,{' '}
              <span className="text-gold font-semibold">{highCount} high</span>,{' '}
              <span className="text-lavender font-semibold">{mediumCount} medium</span>, and{' '}
              <span className="text-sky-accent font-semibold">{lowCount} low</span> severity findings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { label: 'Critical', count: criticalCount, color: 'rose' },
                { label: 'High', count: highCount, color: 'gold' },
                { label: 'Medium', count: mediumCount, color: 'lavender' },
                { label: 'Low/Info', count: lowCount, color: 'sky' },
              ].map((s) => (
                <div key={s.label} className="bg-slime-terminal rounded-md p-2 text-center">
                  <div className={`font-heading font-bold text-[22px] text-${s.color === 'sky' ? 'sky-accent' : s.color}`}>{s.count}</div>
                  <div className="font-mono text-[11px] text-text-faint">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings Detail */}
          <div>
            <h2 className="font-heading font-bold text-[16px] text-mint mb-3">Findings</h2>
            {findings.map((finding, i) => (
              <div key={finding.id} className="mb-4 border border-white/[0.04] rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[11px] text-text-faint">F-{String(i + 1).padStart(3, '0')}</span>
                  <h3 className="font-heading font-semibold text-[14px] text-text-primary flex-1">{finding.title}</h3>
                  <Badge color={severityColors[finding.severity]}>{finding.severity}</Badge>
                  <span className="font-mono text-[11px] text-gold">CVSS {finding.cvss}</span>
                </div>
                <p className="font-mono text-[11px] text-text-secondary leading-relaxed">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'
import { md5, sha1, sha256, sha512 } from '../lib/hashing.js'
import { calculateSubnet } from '../lib/subnet.js'
import portsData from '../data/ports.json'

const tabs = [
  { id: 'hash', label: 'Hash Gen' },
  { id: 'subnet', label: 'Subnet Calc' },
  { id: 'ports', label: 'Port Ref' },
  { id: 'flag', label: 'Flag Fmt' },
  { id: 'ascii', label: 'ASCII Art' },
]

function HashGenerator() {
  const [text, setText] = useState('')
  const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '', sha512: '' })

  useEffect(() => {
    if (!text) { setHashes({ md5: '', sha1: '', sha256: '', sha512: '' }); return }
    let cancelled = false
    Promise.all([md5(text), sha1(text), sha256(text), sha512(text)]).then(([m, s1, s2, s5]) => {
      if (!cancelled) setHashes({ md5: m, sha1: s1, sha256: s2, sha512: s5 })
    })
    return () => { cancelled = true }
  }, [text])

  const algos = [
    { name: 'MD5', value: hashes.md5, color: 'text-mint' },
    { name: 'SHA-1', value: hashes.sha1, color: 'text-lavender' },
    { name: 'SHA-256', value: hashes.sha256, color: 'text-gold' },
    { name: 'SHA-512', value: hashes.sha512, color: 'text-sky-accent' },
  ]

  return (
    <div className="space-y-4">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to hash..." label="Input Text" aria-label="Text to hash" />
      <div className="space-y-2">
        {algos.map((algo) => (
          <div key={algo.name} className="bg-slime-code rounded-md p-4">
            <div className="flex items-center justify-between mb-1">
              <span className={`font-mono text-[11px] font-semibold uppercase ${algo.color}`}>{algo.name}</span>
              {algo.value && <CopyButton text={algo.value} source={`Hash ${algo.name}`} size="small" />}
            </div>
            <pre className="font-mono text-[11px] text-text-secondary break-all whitespace-pre-wrap">
              {algo.value || <span className="text-text-faint">—</span>}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubnetCalculator() {
  const [cidr, setCidr] = useState('192.168.1.0/24')
  const result = calculateSubnet(cidr)

  const fields = result ? [
    { label: 'Network', value: result.network },
    { label: 'Broadcast', value: result.broadcast },
    { label: 'First Host', value: result.firstHost },
    { label: 'Last Host', value: result.lastHost },
    { label: 'Host Count', value: result.hostCount.toLocaleString() },
    { label: 'Subnet Mask', value: result.subnetMask },
    { label: 'Wildcard Mask', value: result.wildcard },
    { label: 'CIDR', value: result.cidr },
  ] : []

  return (
    <div className="space-y-4">
      <Input value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="192.168.1.0/24" label="CIDR Notation" aria-label="CIDR notation input" />
      {result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label} className="bg-slime-code rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">{f.label}</span>
                <CopyButton text={String(f.value)} source={`Subnet ${f.label}`} size="small" />
              </div>
              <div className="font-mono text-[13px] text-mint mt-1">{f.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slime-code rounded-md p-4 text-center text-text-dim text-[12px] font-mono">
          Enter a valid CIDR notation (e.g., 192.168.1.0/24)
        </div>
      )}
    </div>
  )
}

function PortReference() {
  const [search, setSearch] = useState('')
  const filtered = portsData.filter((p) =>
    String(p.port).includes(search) ||
    p.service.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ports..."
          aria-label="Search ports by number, service, or description"
          className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
            font-mono text-[12px] text-text-primary placeholder:text-text-faint
            focus:bg-slime-code focus:border-mint/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint transition-colors"
        />
      </div>
      <div className="bg-slime-code rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
        <table className="w-full" role="table" aria-label="Common ports reference">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left font-mono text-[11px] font-semibold uppercase text-text-dim px-3 py-2">Port</th>
              <th className="text-left font-mono text-[11px] font-semibold uppercase text-text-dim px-3 py-2">Proto</th>
              <th className="text-left font-mono text-[11px] font-semibold uppercase text-text-dim px-3 py-2">Service</th>
              <th className="text-left font-mono text-[11px] font-semibold uppercase text-text-dim px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.port} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="font-mono text-[12px] text-mint px-3 py-2">{p.port}</td>
                <td className="px-3 py-2"><Badge color="muted">{p.protocol}</Badge></td>
                <td className="font-mono text-[12px] text-text-secondary px-3 py-2">{p.service}</td>
                <td className="font-mono text-[11px] text-text-muted px-3 py-2">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FlagFormatter() {
  const [flag, setFlag] = useState('')
  const formats = [
    { name: 'HTB', prefix: 'HTB' },
    { name: 'picoCTF', prefix: 'picoCTF' },
    { name: 'flag', prefix: 'flag' },
    { name: 'THM', prefix: 'THM' },
    { name: 'CTF', prefix: 'CTF' },
  ]

  return (
    <div className="space-y-4">
      <Input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="Enter raw flag text..." label="Raw Flag" aria-label="Raw flag text input" />
      {flag && (
        <div className="space-y-2">
          {formats.map((f) => {
            const formatted = `${f.prefix}{${flag}}`
            return (
              <div key={f.name} className="flex items-center justify-between bg-slime-code rounded-md p-4">
                <span className="font-mono text-[12px] text-text-secondary">{formatted}</span>
                <CopyButton text={formatted} source={`Flag ${f.name}`} size="small" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AsciiArt() {
  const [text, setText] = useState('SLIME')

  const generateBlock = (t) => {
    const chars = {
      'A': ['  ##  ','##  ##','######','##  ##','##  ##'],
      'B': ['#####','##  ##','#####','##  ##','#####'],
      'C': [' ####','##   ','##   ','##   ',' ####'],
      'D': ['#### ','##  ##','##  ##','##  ##','#### '],
      'E': ['#####','##   ','#### ','##   ','#####'],
      'F': ['#####','##   ','#### ','##   ','##   '],
      'G': [' ####','##   ','## ##','##  ##',' ####'],
      'H': ['##  ##','##  ##','######','##  ##','##  ##'],
      'I': ['#####','  ## ','  ## ','  ## ','#####'],
      'J': ['#####','   ##','   ##','#  ##',' ### '],
      'K': ['##  ##','## ## ','###  ','## ## ','##  ##'],
      'L': ['##   ','##   ','##   ','##   ','#####'],
      'M': ['## ##','#####','## ##','##  #','##  #'],
      'N': ['##  ##','### ##','######','## ###','##  ##'],
      'O': [' ### ','##  ##','##  ##','##  ##',' ### '],
      'P': ['#####','##  ##','#####','##   ','##   '],
      'Q': [' ### ','##  ##','## ###',' ####','   ##'],
      'R': ['#####','##  ##','#####','## ## ','##  ##'],
      'S': [' ####','##   ',' ### ','   ##','#### '],
      'T': ['#####','  ## ','  ## ','  ## ','  ## '],
      'U': ['##  ##','##  ##','##  ##','##  ##',' #### '],
      'V': ['##  ##','##  ##','##  ##',' ## ## ','  ##  '],
      'W': ['##  ##','##  ##','## ###','#####',' # # '],
      'X': ['##  ##',' #### ','  ##  ',' #### ','##  ##'],
      'Y': ['##  ##',' #### ','  ##  ','  ##  ','  ##  '],
      'Z': ['#####','   ##',' ### ','##   ','#####'],
      ' ': ['     ','     ','     ','     ','     '],
      '0': [' ### ','## ##','## ##','## ##',' ### '],
      '1': ['  #  ',' ##  ','  #  ','  #  ',' ### '],
      '2': [' ### ','   ##',' ### ','##   ','#####'],
      '3': [' ### ','   ##',' ### ','   ##',' ### '],
      '4': ['##  ##','##  ##','######','    ##','    ##'],
      '5': ['#####','##   ','#### ','   ##','#### '],
      '6': [' ####','##   ','#####','##  ##',' ####'],
      '7': ['#####','   ##','  ## ','  ## ','  ## '],
      '8': [' ####','##  ##',' ####','##  ##',' ####'],
      '9': [' ####','##  ##',' #####','   ##',' ####'],
    }
    const upper = t.toUpperCase()
    const lines = ['', '', '', '', '']
    for (const ch of upper) {
      const art = chars[ch] || ['?????','?????','?????','?????','?????']
      for (let i = 0; i < 5; i++) lines[i] += art[i] + '  '
    }
    return lines.join('\n')
  }

  const output = generateBlock(text)

  return (
    <div className="space-y-4">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text..." label="Text" aria-label="Text for ASCII art generation" />
      <div className="relative group">
        <pre className="bg-slime-code rounded-md p-4 font-mono text-[11px] text-mint overflow-x-auto leading-[1.2]">
          {output}
        </pre>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={output} source="ASCII Art" />
        </div>
      </div>
    </div>
  )
}

export default function Utilities() {
  const [tab, setTab] = useState('hash')

  const content = {
    hash: <HashGenerator />,
    subnet: <SubnetCalculator />,
    ports: <PortReference />,
    flag: <FlagFormatter />,
    ascii: <AsciiArt />,
  }

  return (
    <div className="flex flex-col gap-3.5 max-w-4xl">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
      <Card>{content[tab]}</Card>
    </div>
  )
}

import { useState } from 'react'
import { Upload, FileText, Binary, Hash, Search, AlertTriangle, Info } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import Button from '../components/ui/Button.jsx'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'hex', label: 'Hex View' },
  { id: 'strings', label: 'Strings' },
  { id: 'metadata', label: 'Metadata' },
]

const sampleFile = {
  name: 'suspicious_binary.elf',
  size: '14,328 bytes',
  type: 'ELF 64-bit LSB executable',
  mime: 'application/x-executable',
  md5: 'a3f5b2c1d4e6f7890123456789abcdef',
  sha1: 'abc123def456789012345678901234567890abcd',
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  entropy: 6.42,
  magicBytes: '7f 45 4c 46',
  magicType: 'ELF Magic Number',
}

const sampleHex = [
  { offset: '00000000', hex: '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00', ascii: '.ELF............' },
  { offset: '00000010', hex: '02 00 3e 00 01 00 00 00 40 10 40 00 00 00 00 00', ascii: '..>.....@.@.....' },
  { offset: '00000020', hex: '40 00 00 00 00 00 00 00 98 31 00 00 00 00 00 00', ascii: '@........1......' },
  { offset: '00000030', hex: '00 00 00 00 40 00 38 00 09 00 40 00 1e 00 1d 00', ascii: '....@.8...@.....' },
  { offset: '00000040', hex: '06 00 00 00 05 00 00 00 40 00 00 00 00 00 00 00', ascii: '........@.......' },
  { offset: '00000050', hex: '40 00 40 00 00 00 00 00 40 00 40 00 00 00 00 00', ascii: '@.@.....@.@.....' },
  { offset: '00000060', hex: 'f8 01 00 00 00 00 00 00 f8 01 00 00 00 00 00 00', ascii: '................' },
  { offset: '00000070', hex: '08 00 00 00 00 00 00 00 03 00 00 00 04 00 00 00', ascii: '................' },
  { offset: '00000080', hex: '38 02 00 00 00 00 00 00 38 02 40 00 00 00 00 00', ascii: '8.......8.@.....' },
  { offset: '00000090', hex: '38 02 40 00 00 00 00 00 1c 00 00 00 00 00 00 00', ascii: '8.@.............' },
  { offset: '000000a0', hex: '2f 6c 69 62 36 34 2f 6c 64 2d 6c 69 6e 75 78 2d', ascii: '/lib64/ld-linux-' },
  { offset: '000000b0', hex: '78 38 36 2d 36 34 2e 73 6f 2e 32 00 04 00 00 00', ascii: 'x86-64.so.2.....' },
]

const sampleStrings = [
  { offset: '0x00a0', value: '/lib64/ld-linux-x86-64.so.2', type: 'path' },
  { offset: '0x0234', value: 'libc.so.6', type: 'library' },
  { offset: '0x0240', value: '__libc_start_main', type: 'symbol' },
  { offset: '0x0260', value: 'socket', type: 'function' },
  { offset: '0x0268', value: 'connect', type: 'function' },
  { offset: '0x0270', value: 'send', type: 'function' },
  { offset: '0x0278', value: 'recv', type: 'function' },
  { offset: '0x0310', value: '/bin/sh', type: 'shell' },
  { offset: '0x0318', value: '10.10.14.5', type: 'ip_address' },
  { offset: '0x0328', value: 'GET /exfil?data=', type: 'http' },
  { offset: '0x0340', value: 'Authorization: Bearer', type: 'http' },
  { offset: '0x0380', value: '/etc/passwd', type: 'path' },
  { offset: '0x0390', value: '/etc/shadow', type: 'path' },
  { offset: '0x03a0', value: 'ENCRYPTED_KEY_', type: 'crypto' },
]

const stringTypeColors = {
  path: 'mint',
  library: 'muted',
  symbol: 'lavender',
  function: 'sky',
  shell: 'rose',
  ip_address: 'gold',
  http: 'gold',
  crypto: 'rose',
}

const sampleMetadata = [
  { key: 'File Format', value: 'ELF 64-bit LSB executable' },
  { key: 'Architecture', value: 'x86-64' },
  { key: 'OS/ABI', value: 'UNIX - System V' },
  { key: 'Type', value: 'EXEC (Executable file)' },
  { key: 'Entry Point', value: '0x401040' },
  { key: 'Sections', value: '30' },
  { key: 'Symbols', value: '42' },
  { key: 'Linked Libraries', value: 'libc.so.6, libpthread.so.0' },
  { key: 'Compiler', value: 'GCC 11.3.0' },
  { key: 'Build ID', value: 'a1b2c3d4e5f6' },
  { key: 'RELRO', value: 'Partial RELRO' },
  { key: 'Stack Canary', value: 'No canary found' },
  { key: 'NX', value: 'NX enabled' },
  { key: 'PIE', value: 'No PIE' },
]

export default function FileAnalyzer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [fileLoaded, setFileLoaded] = useState(true)
  const [stringFilter, setStringFilter] = useState('')

  const filteredStrings = sampleStrings.filter((s) =>
    s.value.toLowerCase().includes(stringFilter.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3.5">
      {/* Drop Zone */}
      {!fileLoaded ? (
        <Card>
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop file here to analyze or click to select"
            className="border-2 border-dashed border-white/[0.08] rounded-lg py-16 flex flex-col items-center justify-center
              hover:border-mint/20 transition-colors cursor-pointer
              focus-visible:ring-2 focus-visible:ring-mint focus:outline-none"
            onClick={() => setFileLoaded(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFileLoaded(true) }}
          >
            <Upload size={40} className="text-text-dim mb-3" />
            <div className="font-heading font-semibold text-[14px] text-text-muted mb-1">Drop file here to analyze</div>
            <div className="font-mono text-[11px] text-text-faint">or click to select a file</div>
          </div>
        </Card>
      ) : (
        <>
          {/* File Info Bar */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose/10 flex items-center justify-center">
                <FileText size={20} className="text-rose" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-[16px] text-text-primary">{sampleFile.name}</h2>
                  <Badge color="rose">Suspicious</Badge>
                </div>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="font-mono text-[11px] text-text-dim">{sampleFile.size}</span>
                  <span className="font-mono text-[11px] text-text-dim">{sampleFile.type}</span>
                  <span className="font-mono text-[11px] text-text-dim">Entropy: {sampleFile.entropy}</span>
                </div>
              </div>
              <Button variant="secondary" size="small" onClick={() => setFileLoaded(false)}>New File</Button>
            </div>
          </Card>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Magic Bytes</span>
                <div className="bg-slime-code rounded-md p-3 border border-white/[0.04]">
                  <div className="font-mono text-[16px] text-mint font-bold tracking-wider">{sampleFile.magicBytes}</div>
                  <div className="font-mono text-[11px] text-text-dim mt-1">{sampleFile.magicType}</div>
                </div>
              </Card>
              <Card>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Hashes</span>
                <div className="space-y-2">
                  {[
                    ['MD5', sampleFile.md5],
                    ['SHA1', sampleFile.sha1],
                    ['SHA256', sampleFile.sha256],
                  ].map(([label, hash]) => (
                    <div key={label}>
                      <span className="font-mono text-[11px] text-text-faint">{label}</span>
                      <div className="font-mono text-[11px] text-text-secondary truncate">{hash}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="col-span-1 md:col-span-2">
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Suspicious Indicators</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="bg-rose/5 border border-rose/10 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={12} className="text-rose" />
                      <span className="font-mono text-[11px] text-rose font-semibold">Network Activity</span>
                    </div>
                    <span className="font-mono text-[11px] text-text-dim">Contains socket/connect calls and IP address</span>
                  </div>
                  <div className="bg-rose/5 border border-rose/10 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={12} className="text-rose" />
                      <span className="font-mono text-[11px] text-rose font-semibold">Shell Access</span>
                    </div>
                    <span className="font-mono text-[11px] text-text-dim">References /bin/sh - possible reverse shell</span>
                  </div>
                  <div className="bg-gold/5 border border-gold/10 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Info size={12} className="text-gold" />
                      <span className="font-mono text-[11px] text-gold font-semibold">File Access</span>
                    </div>
                    <span className="font-mono text-[11px] text-text-dim">Reads /etc/passwd and /etc/shadow</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'hex' && (
            <Card>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Hex Dump</span>
              <div className="bg-slime-code rounded-md border border-white/[0.04] p-3 overflow-auto">
                <div className="font-mono text-[11px]">
                  <div className="flex items-center gap-4 mb-2 text-text-faint border-b border-white/[0.04] pb-1.5">
                    <span className="w-20">Offset</span>
                    <span className="flex-1">Hex</span>
                    <span>ASCII</span>
                  </div>
                  {sampleHex.map((row) => (
                    <div key={row.offset} className="flex items-center gap-4 py-0.5 hover:bg-white/[0.02]">
                      <span className="text-text-dim w-20">{row.offset}</span>
                      <span className="text-mint flex-1 tracking-wider">{row.hex}</span>
                      <span className="text-lavender">{row.ascii}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'strings' && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">
                  Extracted Strings ({filteredStrings.length})
                </span>
                <div className="relative w-60">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input
                    value={stringFilter}
                    onChange={(e) => setStringFilter(e.target.value)}
                    placeholder="Filter strings..."
                    aria-label="Filter extracted strings"
                    className="w-full bg-slime-code border border-white/[0.06] rounded-md pl-7 pr-3 py-1.5
                      font-mono text-[11px] text-text-primary placeholder:text-text-faint
                      focus:outline-none focus:border-mint/15
                      focus-visible:ring-2 focus-visible:ring-mint transition-colors"
                  />
                </div>
              </div>
              <div className="bg-slime-code rounded-md border border-white/[0.04] overflow-auto">
                {filteredStrings.map((str, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0">
                    <span className="font-mono text-[11px] text-text-faint w-14">{str.offset}</span>
                    <span className="font-mono text-[11px] text-text-secondary flex-1">{str.value}</span>
                    <Badge color={stringTypeColors[str.type]}>{str.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'metadata' && (
            <Card>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">File Metadata</span>
              <div className="space-y-1">
                {sampleMetadata.map((meta) => (
                  <div key={meta.key} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/[0.02] transition-colors">
                    <span className="font-mono text-[11px] text-text-dim w-40">{meta.key}</span>
                    <span className={`font-mono text-[11px] ${
                      meta.value.includes('No canary') || meta.value.includes('No PIE') || meta.value === 'Partial RELRO'
                        ? 'text-rose' : meta.value === 'NX enabled' ? 'text-mint' : 'text-text-primary'
                    }`}>{meta.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

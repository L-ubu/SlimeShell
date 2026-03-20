import { useState, useMemo } from 'react'
import { Search, Copy, BookOpen, Check, X } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const commonPatterns = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', category: 'Validation' },
  { name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', category: 'Network' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]+', category: 'Web' },
  { name: 'MAC Address', pattern: '([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}', category: 'Network' },
  { name: 'Hash (MD5)', pattern: '\\b[a-fA-F0-9]{32}\\b', category: 'Crypto' },
  { name: 'Hash (SHA256)', pattern: '\\b[a-fA-F0-9]{64}\\b', category: 'Crypto' },
  { name: 'Base64', pattern: '[A-Za-z0-9+/]{4,}={0,2}', category: 'Encoding' },
  { name: 'JWT Token', pattern: 'eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+', category: 'Auth' },
  { name: 'Phone Number', pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}', category: 'Validation' },
  { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', category: 'Identifiers' },
  { name: 'CTF Flag', pattern: '\\w+\\{[^}]+\\}', category: 'CTF' },
  { name: 'SSH Private Key', pattern: '-----BEGIN (?:RSA |EC )?PRIVATE KEY-----', category: 'Secrets' },
]

const sampleTestString = `Server logs from 10.10.14.5:
User ghost_byte logged in from 192.168.1.100 at 2026-03-20T14:32:00Z
Email: ghost@slimeshell.io
MAC: AA:BB:CC:DD:EE:FF
API Key: eyJhbGciOiJIUzI1NiIs.eyJzdWIiOiIxMjM0NTY3.Rl0bCVgrmrh6aG
Hash: a3f5b2c1d4e6f7890123456789abcdef
Flag: HTB{r3g3x_m4st3r_2026}
UUID: 550e8400-e29b-41d4-a716-446655440000
URL: https://api.slimeshell.io/v1/users
Phone: +1-555-123-4567
Base64: SGVsbG8gV29ybGQh`

const categoryColors = {
  Validation: 'mint',
  Network: 'sky',
  Web: 'lavender',
  Crypto: 'gold',
  Encoding: 'rose',
  Auth: 'rose',
  Identifiers: 'muted',
  CTF: 'mint',
  Secrets: 'rose',
}

export default function Regex() {
  const [pattern, setPattern] = useState('\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b')
  const [flags, setFlags] = useState('gm')
  const [testString, setTestString] = useState(sampleTestString)

  const { matches, highlightedText, error } = useMemo(() => {
    if (!pattern) return { matches: [], highlightedText: testString, error: null }
    try {
      const regex = new RegExp(pattern, flags)
      const found = []
      let match
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      while ((match = re.exec(testString)) !== null) {
        found.push({ value: match[0], index: match.index, length: match[0].length })
        if (!regex.global) break
      }

      let highlighted = testString
      const parts = []
      let lastIndex = 0
      for (const m of found) {
        if (m.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false })
        }
        parts.push({ text: m.value, isMatch: true })
        lastIndex = m.index + m.length
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false })
      }

      return { matches: found, highlightedText: parts, error: null }
    } catch (e) {
      return { matches: [], highlightedText: [{ text: testString, isMatch: false }], error: e.message }
    }
  }, [pattern, flags, testString])

  const loadPattern = (p) => {
    setPattern(p.pattern)
  }

  return (
    <div className="space-y-4">
      {/* Pattern Input */}
      <Card>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block font-mono text-[10px] font-semibold uppercase text-text-dim mb-1.5">Pattern</label>
            <div className="flex items-center">
              <span className="font-mono text-[14px] text-text-faint mr-1">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 bg-slime-code border border-white/[0.04] rounded-md px-3 py-2.5
                  font-mono text-[12px] text-mint placeholder:text-text-faint
                  focus:outline-none focus:border-mint/15 transition-colors"
              />
              <span className="font-mono text-[14px] text-text-faint mx-1">/</span>
              <input
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-16 bg-slime-code border border-white/[0.04] rounded-md px-2 py-2.5
                  font-mono text-[12px] text-lavender text-center
                  focus:outline-none focus:border-mint/15"
                placeholder="flags"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <CopyButton text={pattern} source="Regex Pattern" />
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 bg-rose/10 rounded-md px-3 py-2">
            <X size={12} className="text-rose" />
            <span className="font-mono text-[10px] text-rose">{error}</span>
          </div>
        )}

        {!error && pattern && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Check size={12} className="text-mint" />
              <span className="font-mono text-[10px] text-mint">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
            {matches.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {matches.slice(0, 5).map((m, i) => (
                  <Badge key={i} color="mint">{m.value.length > 30 ? m.value.slice(0, 30) + '...' : m.value}</Badge>
                ))}
                {matches.length > 5 && <Badge color="muted">+{matches.length - 5} more</Badge>}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* Test String */}
        <div className="col-span-2 space-y-4">
          <Card className="flex flex-col">
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim mb-2">Test String</span>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
                text-text-secondary resize-none focus:outline-none focus:border-mint/15 min-h-[150px]"
              spellCheck={false}
            />
          </Card>

          {/* Highlighted Output */}
          <Card>
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim mb-2 block">Match Highlighting</span>
            <div className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px] whitespace-pre-wrap min-h-[150px]">
              {Array.isArray(highlightedText) ? highlightedText.map((part, i) => (
                part.isMatch ? (
                  <mark key={i} className="bg-mint/20 text-mint rounded px-0.5">{part.text}</mark>
                ) : (
                  <span key={i} className="text-text-secondary">{part.text}</span>
                )
              )) : <span className="text-text-secondary">{testString}</span>}
            </div>
          </Card>

          {/* Match Details */}
          {matches.length > 0 && (
            <Card>
              <span className="font-mono text-[10px] font-semibold uppercase text-text-dim mb-2 block">Match Details</span>
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-2 py-1">
                  <span className="font-mono text-[9px] text-text-faint w-8">#</span>
                  <span className="font-mono text-[9px] text-text-faint flex-1">Match</span>
                  <span className="font-mono text-[9px] text-text-faint w-16 text-right">Index</span>
                  <span className="font-mono text-[9px] text-text-faint w-16 text-right">Length</span>
                </div>
                {matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/[0.02]">
                    <span className="font-mono text-[10px] text-text-dim w-8">{i + 1}</span>
                    <span className="font-mono text-[10px] text-mint flex-1 truncate">{m.value}</span>
                    <span className="font-mono text-[10px] text-text-dim w-16 text-right">{m.index}</span>
                    <span className="font-mono text-[10px] text-text-dim w-16 text-right">{m.length}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Common Patterns Library */}
        <Card className="h-fit">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-text-dim" />
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Pattern Library</span>
          </div>
          <div className="space-y-1.5">
            {commonPatterns.map((p) => (
              <button
                key={p.name}
                onClick={() => loadPattern(p)}
                className="w-full text-left bg-slime-code rounded-md p-2 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-text-secondary">{p.name}</span>
                  <Badge color={categoryColors[p.category]}>{p.category}</Badge>
                </div>
                <div className="font-mono text-[9px] text-text-faint truncate">{p.pattern}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

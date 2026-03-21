import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'
import payloadsData from '../data/payloads.json'

const categories = ['All', 'XSS', 'SQLi', 'SSTI', 'LFI', 'CMDi', 'SSRF', 'XXE', 'Upload']

const categoryColors = {
  XSS: 'mint',
  SQLi: 'lavender',
  SSTI: 'gold',
  LFI: 'rose',
  CMDi: 'sky',
  SSRF: 'pink',
  XXE: 'gold',
  Upload: 'muted',
}

export default function Payloads() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categoryCounts = useMemo(() => {
    const counts = { All: payloadsData.length }
    payloadsData.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [])

  const filtered = useMemo(() => {
    return payloadsData.filter((p) => {
      const matchCategory = activeCategory === 'All' || p.category === activeCategory
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.payload.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [search, activeCategory])

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full">
      {/* Categories */}
      <div className="w-full md:w-[280px] md:min-w-[280px]">
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Categories</span>
          <nav aria-label="Payload categories">
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer text-left
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${activeCategory === cat
                      ? 'bg-mint/[0.06] border-l-[3px] border-mint text-mint'
                      : 'border-l-[3px] border-transparent text-text-muted hover:bg-white/[0.02] hover:text-text-secondary'
                    }
                  `}
                >
                  <span className="font-heading font-semibold text-[13px]">{cat}</span>
                  <span className={`font-mono text-[11px] rounded-full px-1.5 py-0.5
                    ${activeCategory === cat ? 'bg-mint/20 text-mint' : 'bg-white/[0.04] text-text-dim'}
                  `}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </Card>
      </div>

      {/* Payload List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payloads..."
              aria-label="Search payloads by title, content, or description"
              className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
                font-mono text-[12px] text-text-primary placeholder:text-text-faint
                focus:bg-slime-code focus:border-mint/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint transition-colors"
            />
          </div>
        </div>

        {filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-heading font-semibold text-[13px] text-text-secondary">{p.title}</span>
                  <Badge color={categoryColors[p.category]}>{p.category}</Badge>
                </div>
                <p className="font-mono text-[11px] text-text-dim mb-2">{p.description}</p>
                <pre className="bg-slime-code rounded-md p-3 font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                  {p.payload}
                </pre>
              </div>
              <CopyButton text={p.payload} source={`Payload: ${p.title}`} className="shrink-0 mt-1" />
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-dim font-mono text-[12px]">
            No payloads found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Bookmark, ExternalLink, Search, FolderOpen, Plus, Star, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const bookmarkFolders = [
  {
    id: 'tools',
    name: 'Tools & Resources',
    color: 'mint',
    bookmarks: [
      { id: 1, title: 'CyberChef', url: 'https://gchq.github.io/CyberChef/', desc: 'Swiss army knife for encoding', tags: ['encoding', 'crypto'], starred: true },
      { id: 2, title: 'GTFOBins', url: 'https://gtfobins.github.io/', desc: 'Unix binaries exploitation', tags: ['privesc', 'linux'], starred: true },
      { id: 3, title: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings', desc: 'Useful payloads and bypass', tags: ['payloads', 'web'], starred: false },
      { id: 4, title: 'RevShells', url: 'https://www.revshells.com/', desc: 'Reverse shell generator', tags: ['shells', 'exploit'], starred: false },
      { id: 5, title: 'ExploitDB', url: 'https://www.exploit-db.com/', desc: 'Exploit database', tags: ['exploits', 'cve'], starred: true },
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Training',
    color: 'lavender',
    bookmarks: [
      { id: 6, title: 'HackTricks', url: 'https://book.hacktricks.xyz/', desc: 'Hacking tricks and methodology', tags: ['methodology', 'pentest'], starred: true },
      { id: 7, title: 'PortSwigger Web Academy', url: 'https://portswigger.net/web-security', desc: 'Free web security training', tags: ['web', 'training'], starred: true },
      { id: 8, title: 'PwnCollege', url: 'https://pwn.college/', desc: 'Binary exploitation learning', tags: ['pwn', 'training'], starred: false },
      { id: 9, title: 'CryptoHack', url: 'https://cryptohack.org/', desc: 'Learn cryptography', tags: ['crypto', 'training'], starred: false },
    ],
  },
  {
    id: 'platforms',
    name: 'CTF Platforms',
    color: 'gold',
    bookmarks: [
      { id: 10, title: 'HackTheBox', url: 'https://www.hackthebox.com/', desc: 'Hacking labs and CTFs', tags: ['ctf', 'labs'], starred: true },
      { id: 11, title: 'TryHackMe', url: 'https://tryhackme.com/', desc: 'Guided hacking lessons', tags: ['ctf', 'learning'], starred: false },
      { id: 12, title: 'CTFtime', url: 'https://ctftime.org/', desc: 'CTF event tracker', tags: ['ctf', 'calendar'], starred: true },
      { id: 13, title: 'PicoCTF', url: 'https://picoctf.org/', desc: 'Beginner-friendly CTF', tags: ['ctf', 'beginner'], starred: false },
    ],
  },
  {
    id: 'osint',
    name: 'OSINT Resources',
    color: 'sky',
    bookmarks: [
      { id: 14, title: 'Shodan', url: 'https://www.shodan.io/', desc: 'Internet-connected device search', tags: ['osint', 'recon'], starred: true },
      { id: 15, title: 'Censys', url: 'https://search.censys.io/', desc: 'Internet-wide scanning', tags: ['osint', 'scanning'], starred: false },
      { id: 16, title: 'VirusTotal', url: 'https://www.virustotal.com/', desc: 'File and URL analysis', tags: ['malware', 'analysis'], starred: true },
    ],
  },
]

export default function Bookmarks() {
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState(bookmarkFolders.map((f) => f.id))

  const toggleFolder = (id) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const matchesSearch = (bookmark) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      bookmark.title.toLowerCase().includes(q) ||
      bookmark.url.toLowerCase().includes(q) ||
      bookmark.desc.toLowerCase().includes(q) ||
      bookmark.tags.some((t) => t.includes(q))
    )
  }

  const totalBookmarks = bookmarkFolders.reduce((sum, f) => sum + f.bookmarks.length, 0)
  const starredCount = bookmarkFolders.reduce(
    (sum, f) => sum + f.bookmarks.filter((b) => b.starred).length, 0
  )

  return (
    <div className="flex flex-col gap-3.5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            aria-label="Search bookmarks"
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none
              focus-visible:ring-2 focus-visible:ring-mint transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-text-dim">{totalBookmarks} bookmarks</span>
          <span className="font-mono text-[11px] text-gold">★ {starredCount}</span>
        </div>
        <Button variant="ghost" size="small"><Plus size={12} /> Add</Button>
      </div>

      {/* Bookmark Folders */}
      {bookmarkFolders.map((folder) => {
        const filteredBookmarks = folder.bookmarks.filter(matchesSearch)
        if (search && filteredBookmarks.length === 0) return null
        const isExpanded = expandedFolders.includes(folder.id)

        return (
          <Card key={folder.id}>
            <button
              onClick={() => toggleFolder(folder.id)}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${folder.name}`}
              className="flex items-center gap-2 w-full text-left cursor-pointer mb-2
                focus-visible:ring-2 focus-visible:ring-mint focus:outline-none rounded-md"
            >
              <FolderOpen size={16} className={`text-${folder.color === 'sky' ? 'sky-accent' : folder.color}`} />
              <span className="font-heading font-semibold text-[14px] text-text-primary flex-1">{folder.name}</span>
              <Badge color={folder.color}>{filteredBookmarks.length}</Badge>
            </button>

            {isExpanded && (
              <div className="space-y-1 mt-2">
                {filteredBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/[0.02] transition-colors group"
                  >
                    <Bookmark size={14} className="text-text-dim flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-[12px] text-text-secondary group-hover:text-mint transition-colors">
                          {bm.title}
                        </span>
                        {bm.starred && <Star size={10} className="text-gold fill-gold" />}
                      </div>
                      <div className="font-mono text-[11px] text-text-faint truncate">{bm.url}</div>
                      <div className="font-mono text-[11px] text-text-dim mt-0.5">{bm.desc}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bm.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[10px] text-text-dim bg-white/[0.04] rounded px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${bm.title} in new tab`}
                      className="text-text-faint hover:text-mint transition-colors
                        focus-visible:ring-2 focus-visible:ring-mint focus:outline-none rounded"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import { Flag, Trophy, Clock, ChevronRight, Users, Target } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'

const activeCTF = {
  name: 'HTB Cyber Apocalypse 2026',
  platform: 'HackTheBox',
  timeLeft: '2d 14h 32m',
  startDate: 'Mar 18, 2026',
  endDate: 'Mar 22, 2026',
  teamName: 'SlimeSquad',
  rank: 42,
  totalTeams: 1847,
  progress: 18,
  total: 24,
  points: 4250,
  challenges: [
    { id: 1, name: 'Void Whisper', category: 'web', points: 300, solved: true, solvedBy: 'ghost_byte', time: '1h 23m' },
    { id: 2, name: 'Neural Cascade', category: 'crypto', points: 350, solved: true, solvedBy: 'cipher_punk', time: '2h 45m' },
    { id: 3, name: 'Stack Smasher', category: 'pwn', points: 400, solved: true, solvedBy: 'ghost_byte', time: '3h 12m' },
    { id: 4, name: 'Phantom Gate', category: 'web', points: 250, solved: true, solvedBy: 'null_ref', time: '0h 45m' },
    { id: 5, name: 'Binary Maze', category: 'rev', points: 500, solved: false, solvedBy: null, time: null },
    { id: 6, name: 'Data Ghost', category: 'forensics', points: 300, solved: true, solvedBy: 'ghost_byte', time: '1h 55m' },
    { id: 7, name: 'Quantum Lock', category: 'crypto', points: 450, solved: false, solvedBy: null, time: null },
    { id: 8, name: 'Shell Storm', category: 'pwn', points: 350, solved: true, solvedBy: 'cipher_punk', time: '4h 10m' },
    { id: 9, name: 'Hidden Pixels', category: 'stego', points: 200, solved: true, solvedBy: 'null_ref', time: '0h 30m' },
    { id: 10, name: 'Root Access', category: 'pwn', points: 500, solved: false, solvedBy: null, time: null },
  ],
  categories: [
    { name: 'Web', solved: 4, total: 5, color: 'mint' },
    { name: 'Crypto', solved: 3, total: 5, color: 'lavender' },
    { name: 'Pwn', solved: 3, total: 4, color: 'rose' },
    { name: 'Rev', solved: 4, total: 5, color: 'sky' },
    { name: 'Forensics', solved: 4, total: 5, color: 'gold' },
  ],
}

const completedCTFs = [
  { name: 'PicoCTF 2026', platform: 'picoCTF', rank: 15, total: 2340, solved: 38, outOf: 40, points: 14200, date: 'Feb 2026' },
  { name: 'CSAW CTF Quals', platform: 'CTFd', rank: 28, total: 890, solved: 22, outOf: 30, points: 3800, date: 'Jan 2026' },
  { name: 'DiceCTF 2025', platform: 'CTFd', rank: 53, total: 1200, solved: 15, outOf: 25, points: 2900, date: 'Dec 2025' },
  { name: 'Google CTF', platform: 'Google', rank: 112, total: 4500, solved: 8, outOf: 20, points: 1600, date: 'Nov 2025' },
  { name: 'Hack.lu CTF', platform: 'CTFd', rank: 67, total: 780, solved: 12, outOf: 18, points: 2100, date: 'Oct 2025' },
  { name: 'DownUnderCTF', platform: 'CTFd', rank: 31, total: 3200, solved: 28, outOf: 35, points: 5400, date: 'Sep 2025' },
]

const categoryFilter = ['All', 'web', 'crypto', 'pwn', 'rev', 'forensics', 'stego']

export default function CTFs() {
  const [filter, setFilter] = useState('All')
  const [showSolved, setShowSolved] = useState('all')

  const filteredChallenges = activeCTF.challenges.filter((ch) => {
    const catMatch = filter === 'All' || ch.category === filter
    const solvedMatch = showSolved === 'all' || (showSolved === 'solved' ? ch.solved : !ch.solved)
    return catMatch && solvedMatch
  })

  return (
    <div className="space-y-4">
      {/* Active CTF Header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase text-mint">Active CTF</span>
            <h2 className="font-heading font-bold text-[20px] text-text-primary mt-0.5">{activeCTF.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge color="mint" pill>{activeCTF.platform}</Badge>
              <span className="font-mono text-[11px] text-text-dim">{activeCTF.startDate} — {activeCTF.endDate}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gold" />
              <span className="font-heading font-bold text-[18px] text-gold">{activeCTF.timeLeft}</span>
            </div>
            <div className="font-mono text-[11px] text-text-faint mt-0.5">remaining</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="font-mono text-[11px] text-text-dim uppercase">Rank</div>
            <div className="font-heading font-bold text-[22px] text-mint">#{activeCTF.rank}</div>
            <span className="font-mono text-[11px] text-text-faint">of {activeCTF.totalTeams}</span>
          </div>
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="font-mono text-[11px] text-text-dim uppercase">Points</div>
            <div className="font-heading font-bold text-[22px] text-lavender">{activeCTF.points}</div>
          </div>
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="font-mono text-[11px] text-text-dim uppercase">Solved</div>
            <div className="font-heading font-bold text-[22px] text-text-primary">
              {activeCTF.progress}<span className="text-text-faint text-[14px]">/{activeCTF.total}</span>
            </div>
          </div>
          <div className="bg-slime-code rounded-md p-2.5">
            <div className="font-mono text-[11px] text-text-dim uppercase">Team</div>
            <div className="flex items-center gap-1 mt-1">
              <Users size={14} className="text-text-dim" />
              <span className="font-mono text-[12px] text-text-primary">{activeCTF.teamName}</span>
            </div>
          </div>
        </div>

        <ProgressBar value={activeCTF.progress} max={activeCTF.total} className="mb-2" />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-text-faint">Challenge Progress</span>
          <span className="font-mono text-[11px] text-mint">{Math.round((activeCTF.progress / activeCTF.total) * 100)}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
          {activeCTF.categories.map((cat) => (
            <div key={cat.name} className="bg-slime-code rounded-md p-2">
              <div className="font-mono text-[11px] text-text-dim uppercase">{cat.name}</div>
              <div className="font-heading font-bold text-[16px] text-text-primary mt-0.5">
                {cat.solved}<span className="text-text-faint text-[12px]">/{cat.total}</span>
              </div>
              <ProgressBar value={cat.solved} max={cat.total} color={cat.color} className="mt-1" />
            </div>
          ))}
        </div>
      </Card>

      {/* Challenge List */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Challenges</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1" role="group" aria-label="Solved status filter">
              {['all', 'solved', 'unsolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setShowSolved(s)}
                  aria-pressed={showSolved === s}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${showSolved === s ? 'bg-mint/10 text-mint' : 'text-text-dim hover:text-text-muted'}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Category filter">
              {categoryFilter.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                  className={`px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${filter === cat ? 'bg-mint/10 text-mint' : 'text-text-dim hover:text-text-muted'}`}
                >
                  {cat === 'All' ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-1 overflow-y-auto">
          {filteredChallenges.map((ch) => (
            <div key={ch.id} className="flex items-center gap-3 py-2 px-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${ch.solved ? 'bg-mint/10' : 'bg-slime-code'}`}>
                {ch.solved ? <Flag size={12} className="text-mint" /> : <Target size={12} className="text-text-faint" />}
              </div>
              <span className="font-mono text-[12px] text-text-primary flex-1">{ch.name}</span>
              <Badge category={ch.category}>{ch.category}</Badge>
              <span className="font-mono text-[11px] text-gold w-16 text-right">{ch.points} pts</span>
              {ch.solved ? (
                <>
                  <span className="font-mono text-[11px] text-text-dim w-20 text-right">{ch.solvedBy}</span>
                  <span className="font-mono text-[11px] text-text-faint w-14 text-right">{ch.time}</span>
                </>
              ) : (
                <span className="font-mono text-[11px] text-rose w-36 text-right">Unsolved</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Completed CTFs */}
      <Card>
        <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Completed CTFs</span>
        <div className="space-y-1 overflow-y-auto">
          {completedCTFs.map((ctf) => (
            <div key={ctf.name} className="flex items-center gap-3 py-2 px-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
              <Trophy size={16} className="text-gold flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-[13px] text-text-secondary">{ctf.name}</div>
                <div className="font-mono text-[11px] text-text-faint">{ctf.date} · {ctf.platform}</div>
              </div>
              <div className="text-right mr-2">
                <div className="font-heading font-bold text-[14px] text-mint">#{ctf.rank}</div>
                <div className="font-mono text-[10px] text-text-faint">of {ctf.total}</div>
              </div>
              <div className="text-right mr-2">
                <div className="font-mono text-[11px] text-text-primary">{ctf.solved}/{ctf.outOf}</div>
                <div className="font-mono text-[10px] text-text-faint">solved</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-lavender">{ctf.points} pts</span>
              </div>
              <ChevronRight size={14} className="text-text-faint" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

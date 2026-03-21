import { useState, useMemo } from 'react'
import { User, Flag, Code, Trophy, Zap, Star, TrendingUp, Award } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Heatmap from '../components/ui/Heatmap.jsx'

const profile = {
  username: 'ghost_byte',
  avatar: null,
  level: 42,
  xp: 8750,
  xpToNext: 10000,
  rank: 'Elite Hacker',
  joinDate: 'Jan 2024',
  bio: 'CTF player | Bug bounty hunter | Pwn & Web specialist',
  socials: {
    github: 'ghost-byte',
    twitter: '@ghost_byte',
    htb: 'ghost_byte',
  },
}

const stats = [
  { label: 'CTFs Completed', value: 47, icon: Flag, color: 'text-mint', trend: '+3 this month' },
  { label: 'Flags Captured', value: 312, icon: Zap, color: 'text-lavender', trend: '+12 this week' },
  { label: 'Scripts Written', value: 89, icon: Code, color: 'text-gold', trend: '+5 new' },
  { label: 'Global Rank', value: '#42', icon: Trophy, color: 'text-sky-accent', trend: '↑ 8 places' },
]

const categoryBreakdown = [
  { name: 'Web', solved: 87, total: 100, color: 'mint' },
  { name: 'Crypto', solved: 64, total: 100, color: 'lavender' },
  { name: 'Pwn', solved: 52, total: 100, color: 'rose' },
  { name: 'Reverse', solved: 45, total: 100, color: 'sky' },
  { name: 'Forensics', solved: 38, total: 100, color: 'gold' },
  { name: 'Stego', solved: 26, total: 100, color: 'pink' },
]

const achievements = [
  { name: 'First Blood', desc: 'First solve on a challenge', icon: '🩸', earned: true },
  { name: 'Speed Demon', desc: 'Solve 5 challenges in 1 hour', icon: '⚡', earned: true },
  { name: 'Polyglot', desc: 'Solve challenges in 5 categories', icon: '🌐', earned: true },
  { name: 'Night Owl', desc: 'Submit a flag after midnight', icon: '🦉', earned: true },
  { name: 'Century', desc: 'Capture 100 flags', icon: '💯', earned: true },
  { name: 'Team Player', desc: 'Win a team CTF', icon: '🤝', earned: false },
]

export default function Profile() {
  const heatmapData = useMemo(() => {
    const data = {}
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (Math.random() > 0.4) {
        data[key] = Math.floor(Math.random() * 15)
      }
    }
    return data
  }, [])

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Profile Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-mint/20 to-lavender/20 flex items-center justify-center border border-white/[0.06]">
            <User size={36} className="text-mint" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-heading font-bold text-[22px] text-text-primary">{profile.username}</h2>
              <Badge color="mint" pill>{profile.rank}</Badge>
            </div>
            <p className="font-mono text-[11px] text-text-muted mt-0.5">{profile.bio}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="font-mono text-[11px] text-text-faint">Joined {profile.joinDate}</span>
              <span className="font-mono text-[11px] text-text-dim">
                GitHub: <span className="text-mint">{profile.socials.github}</span>
              </span>
              <span className="font-mono text-[11px] text-text-dim">
                HTB: <span className="text-mint">{profile.socials.htb}</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-gold" />
              <span className="font-heading font-bold text-[28px] text-gold">Lv.{profile.level}</span>
            </div>
            <div className="mt-1">
              <ProgressBar value={profile.xp} max={profile.xpToNext} color="gold" />
              <span className="font-mono text-[11px] text-text-faint">{profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">{stat.label}</span>
                  <div className={`font-heading font-bold text-[28px] ${stat.color} leading-tight mt-1`}>
                    {stat.value}
                  </div>
                  <span className="font-mono text-[11px] text-text-faint">{stat.trend}</span>
                </div>
                <Icon size={20} className="text-text-dim" strokeWidth={1.5} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Activity Heatmap */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Activity Heatmap</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-mint" />
            <span className="font-mono text-[11px] text-mint">23 day streak</span>
          </div>
        </div>
        <Heatmap data={heatmapData} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Category Breakdown */}
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Category Breakdown</span>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-text-secondary">{cat.name}</span>
                  <span className="font-mono text-[11px] text-text-dim">{cat.solved} solved</span>
                </div>
                <ProgressBar value={cat.solved} max={cat.total} color={cat.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">
            Achievements ({achievements.filter((a) => a.earned).length}/{achievements.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.name}
                className={`rounded-md p-2.5 ${ach.earned ? 'bg-slime-code' : 'bg-slime-code opacity-40'}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[16px]">{ach.icon}</span>
                  <span className="font-heading font-semibold text-[12px] text-text-primary">{ach.name}</span>
                </div>
                <span className="font-mono text-[11px] text-text-dim">{ach.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

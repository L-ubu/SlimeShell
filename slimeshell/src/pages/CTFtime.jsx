import { useState, useEffect } from 'react'
import { Calendar, Clock, Trophy, Users, Star, ExternalLink, MapPin } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'

const upcomingCTFs = [
  { id: 1, name: 'PlaidCTF 2026', organizer: 'PPP', date: 'Apr 12-14, 2026', format: 'Jeopardy', weight: 98.5, url: '#', onsite: false, registered: true, difficulty: 'Hard' },
  { id: 2, name: 'DEF CON CTF Quals', organizer: 'Nautilus', date: 'May 3-5, 2026', format: 'Jeopardy', weight: 100.0, url: '#', onsite: false, registered: false, difficulty: 'Expert' },
  { id: 3, name: 'ångstromCTF 2026', organizer: 'ångstrom', date: 'Apr 25-29, 2026', format: 'Jeopardy', weight: 56.2, url: '#', onsite: false, registered: true, difficulty: 'Medium' },
  { id: 4, name: 'NahamCon CTF', organizer: 'NahamSec', date: 'May 15-17, 2026', format: 'Jeopardy', weight: 35.8, url: '#', onsite: false, registered: false, difficulty: 'Easy' },
  { id: 5, name: 'HITCON CTF Quals', organizer: 'HITCON', date: 'Jun 21-23, 2026', format: 'Jeopardy', weight: 89.4, url: '#', onsite: false, registered: false, difficulty: 'Hard' },
  { id: 6, name: 'Google CTF', organizer: 'Google', date: 'Jul 5-7, 2026', format: 'Jeopardy', weight: 99.3, url: '#', onsite: false, registered: false, difficulty: 'Expert' },
]

const teamScoreboard = [
  { rank: 1, name: 'PPP', country: 'US', points: 1245.8, ctfs: 42 },
  { rank: 2, name: 'Dragon Sector', country: 'PL', points: 1198.3, ctfs: 38 },
  { rank: 3, name: 'Organizers', country: 'KR', points: 1156.7, ctfs: 35 },
  { rank: 4, name: 'Blue Water', country: 'US', points: 1089.2, ctfs: 40 },
  { rank: 5, name: 'hxp', country: 'DE', points: 1042.5, ctfs: 31 },
  { rank: 6, name: 'perfect blue', country: 'US', points: 998.1, ctfs: 29 },
  { rank: 7, name: 'Balsn', country: 'TW', points: 945.6, ctfs: 27 },
  { rank: 8, name: 'Maple Bacon', country: 'CA', points: 923.4, ctfs: 33 },
  { rank: 9, name: 'cr0wn', country: 'EU', points: 901.8, ctfs: 26 },
  { rank: 10, name: 'SlimeSquad', country: 'US', points: 876.3, ctfs: 24, isUser: true },
]

const difficultyColors = {
  Easy: 'mint',
  Medium: 'gold',
  Hard: 'rose',
  Expert: 'lavender',
}

export default function CTFtime() {
  const [timerTarget] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 23)
    d.setHours(d.getHours() + 5)
    d.setMinutes(d.getMinutes() + 42)
    return d
  })
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const diff = timerTarget - now
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [timerTarget])

  return (
    <div className="space-y-4">
      {/* Challenge Timer */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase text-mint">Next CTF</span>
            <h2 className="font-heading font-bold text-[18px] text-text-primary mt-0.5">PlaidCTF 2026</h2>
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={12} className="text-text-dim" />
              <span className="font-mono text-[10px] text-text-dim">Apr 12-14, 2026</span>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Min', value: timeLeft.minutes },
              { label: 'Sec', value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="bg-slime-code rounded-md px-4 py-3 text-center min-w-[70px]">
                <div className="font-heading font-bold text-[28px] text-mint leading-none">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="font-mono text-[9px] text-text-dim uppercase mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3.5">
        {/* Upcoming CTFs */}
        <div className="col-span-2">
          <Card>
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Upcoming CTFs</span>
            <div className="space-y-1">
              {upcomingCTFs.map((ctf) => (
                <div key={ctf.id} className="flex items-center gap-3 py-2.5 px-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-[13px] text-text-secondary">{ctf.name}</span>
                      {ctf.registered && <Badge color="mint" pill>Registered</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[9px] text-text-faint">{ctf.organizer}</span>
                      <span className="font-mono text-[9px] text-text-faint">·</span>
                      <span className="font-mono text-[9px] text-text-faint">{ctf.date}</span>
                    </div>
                  </div>
                  <Badge color={difficultyColors[ctf.difficulty]}>{ctf.difficulty}</Badge>
                  <Badge color="muted">{ctf.format}</Badge>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-gold" />
                      <span className="font-mono text-[11px] text-gold">{ctf.weight}</span>
                    </div>
                    <span className="font-mono text-[8px] text-text-faint">weight</span>
                  </div>
                  <a href={ctf.url} className="text-text-dim hover:text-mint transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Team Scoreboard */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Global Scoreboard</span>
            <Trophy size={14} className="text-gold" />
          </div>
          <div className="space-y-1">
            {teamScoreboard.map((team) => (
              <div
                key={team.rank}
                className={`flex items-center gap-2 py-2 px-2 rounded-md transition-colors
                  ${team.isUser ? 'bg-mint/[0.06] border border-mint/[0.12]' : 'hover:bg-white/[0.02]'}`}
              >
                <span className={`font-heading font-bold text-[14px] w-6 text-center ${
                  team.rank <= 3 ? 'text-gold' : 'text-text-dim'
                }`}>
                  {team.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`font-mono text-[11px] ${team.isUser ? 'text-mint font-semibold' : 'text-text-secondary'}`}>
                    {team.name}
                  </span>
                </div>
                <Badge color="muted" pill>{team.country}</Badge>
                <span className="font-mono text-[10px] text-text-muted w-16 text-right">{team.points}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

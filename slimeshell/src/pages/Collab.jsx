import { useState } from 'react'
import { Users, MessageSquare, Trophy, Target, Send, User, Flag, Clock } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const teamMembers = [
  { id: 1, name: 'ghost_byte', role: 'Captain', status: 'online', avatar: '👻', points: 2150, specialty: 'Web/Pwn' },
  { id: 2, name: 'cipher_punk', role: 'Member', status: 'online', avatar: '🔐', points: 1850, specialty: 'Crypto' },
  { id: 3, name: 'null_ref', role: 'Member', status: 'online', avatar: '🎯', points: 1620, specialty: 'Rev/Forensics' },
  { id: 4, name: 'data_witch', role: 'Member', status: 'away', avatar: '🧙', points: 1400, specialty: 'OSINT/Stego' },
  { id: 5, name: 'root_kit', role: 'Member', status: 'offline', avatar: '💀', points: 980, specialty: 'Pwn' },
]

const scoreboard = [
  { rank: 1, team: 'CyberPhantoms', points: 8200, solved: 20 },
  { rank: 2, team: 'B1naryBr34k3rs', points: 7850, solved: 19 },
  { rank: 3, team: 'SlimeSquad', points: 7620, solved: 18, isUs: true },
  { rank: 4, team: 'NullPointers', points: 7100, solved: 17 },
  { rank: 5, team: 'ExploitDev', points: 6800, solved: 16 },
  { rank: 6, team: 'StackSmashers', points: 6450, solved: 15 },
  { rank: 7, team: 'CipherCrew', points: 5900, solved: 14 },
  { rank: 8, team: 'ByteForce', points: 5200, solved: 12 },
]

const challengeAssignments = [
  { id: 1, name: 'Binary Maze', category: 'rev', points: 500, assignedTo: 'cipher_punk', status: 'working', progress: 60 },
  { id: 2, name: 'Quantum Lock', category: 'crypto', points: 450, assignedTo: 'cipher_punk', status: 'working', progress: 35 },
  { id: 3, name: 'Root Access', category: 'pwn', points: 500, assignedTo: 'ghost_byte', status: 'working', progress: 80 },
  { id: 4, name: 'Dark Protocol', category: 'web', points: 350, assignedTo: 'null_ref', status: 'stuck', progress: 20 },
  { id: 5, name: 'Pixel Ghost', category: 'stego', points: 250, assignedTo: 'data_witch', status: 'queued', progress: 0 },
]

const chatMessages = [
  { id: 1, user: 'ghost_byte', avatar: '👻', time: '14:32', message: 'Almost got RCE on "Root Access" — heap overflow in custom allocator' },
  { id: 2, user: 'cipher_punk', avatar: '🔐', time: '14:35', message: 'Nice! I found the RSA weakness in "Quantum Lock" — trying Coppersmith attack' },
  { id: 3, user: 'null_ref', avatar: '🎯', time: '14:38', message: 'Stuck on "Dark Protocol" — the WAF is blocking all my XSS attempts. Any ideas?' },
  { id: 4, user: 'ghost_byte', avatar: '👻', time: '14:40', message: 'Try DOM-based XSS or mutation XSS. The WAF might not inspect those.' },
  { id: 5, user: 'data_witch', avatar: '🧙', time: '14:42', message: 'I\'ll pick up "Pixel Ghost" next. Looks like LSB stego.' },
  { id: 6, user: 'cipher_punk', avatar: '🔐', time: '14:45', message: '🚩 Got it! Quantum Lock solved — small exponent attack worked!' },
  { id: 7, user: 'ghost_byte', avatar: '👻', time: '14:46', message: 'Let\'s go! 🎉 Submit it quick' },
]

const statusColors = { online: 'mint', away: 'gold', offline: 'muted' }
const assignmentStatusColors = { working: 'mint', stuck: 'rose', queued: 'muted', solved: 'lavender' }

export default function Collab() {
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(chatMessages)

  const sendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setMessages([...messages, {
      id: Date.now(),
      user: 'ghost_byte',
      avatar: '👻',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      message: chatInput,
    }])
    setChatInput('')
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      {/* Left Column: Scoreboard + Assignments */}
      <div className="flex flex-col gap-4 overflow-auto">
        {/* Team Scoreboard */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-gold" />
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Live Scoreboard</span>
          </div>
          <div className="space-y-1">
            {scoreboard.map((team) => (
              <div
                key={team.rank}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors
                  ${team.isUs ? 'bg-mint/[0.06] border border-mint/[0.12]' : 'hover:bg-white/[0.02]'}`}
              >
                <span className={`font-heading font-bold text-[13px] w-5 text-center ${
                  team.rank <= 3 ? 'text-gold' : 'text-text-dim'
                }`}>{team.rank}</span>
                <span className={`font-mono text-[11px] flex-1 ${team.isUs ? 'text-mint font-semibold' : 'text-text-secondary'}`}>
                  {team.team}
                </span>
                <span className="font-mono text-[10px] text-text-muted">{team.solved} solved</span>
                <span className="font-mono text-[10px] text-lavender w-14 text-right">{team.points}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Challenge Assignments */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-mint" />
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Assignments</span>
          </div>
          <div className="space-y-2">
            {challengeAssignments.map((ch) => (
              <div key={ch.id} className="bg-slime-code rounded-md p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-text-primary flex-1">{ch.name}</span>
                  <Badge category={ch.category}>{ch.category}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <User size={10} className="text-text-faint" />
                  <span className="font-mono text-[9px] text-text-dim">{ch.assignedTo}</span>
                  <Badge color={assignmentStatusColors[ch.status]}>{ch.status}</Badge>
                  <span className="font-mono text-[9px] text-gold ml-auto">{ch.points} pts</span>
                </div>
                {ch.progress > 0 && (
                  <div className="w-full h-1 bg-slime-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-mint-dark to-mint rounded-full transition-all"
                      style={{ width: `${ch.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Center: Chat Panel */}
      <Card className="flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-mint" />
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Team Chat</span>
          <span className="font-mono text-[9px] text-text-faint ml-auto">{messages.length} messages</span>
        </div>

        <div className="flex-1 overflow-auto space-y-3 mb-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="text-[16px] flex-shrink-0 mt-0.5">{msg.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-mint font-semibold">{msg.user}</span>
                  <span className="font-mono text-[8px] text-text-faint">{msg.time}</span>
                </div>
                <p className="font-mono text-[11px] text-text-secondary leading-relaxed mt-0.5">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message team..."
            className="flex-1 bg-slime-code border border-white/[0.06] rounded-lg px-3 py-2
              font-mono text-[11px] text-text-primary placeholder:text-text-faint
              focus:outline-none focus:border-mint/15 transition-colors"
          />
          <Button variant="primary" size="small" type="submit"><Send size={12} /></Button>
        </form>
      </Card>

      {/* Right Column: Team Members */}
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-lavender" />
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">
              Team Members ({teamMembers.filter((m) => m.status === 'online').length}/{teamMembers.length} online)
            </span>
          </div>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-2 px-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
                <div className="relative">
                  <span className="text-[20px]">{member.avatar}</span>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slime-card"
                    style={{ backgroundColor: member.status === 'online' ? '#6EE7B7' : member.status === 'away' ? '#FBBF24' : '#4B5563' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-text-primary font-semibold">{member.name}</span>
                    {member.role === 'Captain' && <Badge color="gold">Captain</Badge>}
                  </div>
                  <span className="font-mono text-[9px] text-text-dim">{member.specialty}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] text-lavender">{member.points}</div>
                  <div className="font-mono text-[8px] text-text-faint">pts</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-3">Team Stats</span>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim">Total Points</span>
              <span className="font-heading font-bold text-[16px] text-mint">
                {teamMembers.reduce((s, m) => s + m.points, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim">Rank</span>
              <span className="font-heading font-bold text-[16px] text-gold">#3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim">Challenges Solved</span>
              <span className="font-heading font-bold text-[16px] text-lavender">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim">In Progress</span>
              <span className="font-heading font-bold text-[16px] text-text-primary">
                {challengeAssignments.filter((c) => c.status === 'working').length}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

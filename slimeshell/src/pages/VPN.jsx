import { useState } from 'react'
import { Shield, Wifi, WifiOff, Globe, Clock, ArrowUpDown, Server, MapPin } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const vpnConnections = [
  {
    id: 1,
    name: 'HTB VPN',
    provider: 'HackTheBox',
    server: 'eu-free-1.hackthebox.com',
    protocol: 'OpenVPN',
    ip: '10.10.14.5',
    publicIp: '185.232.xx.xx',
    location: 'Frankfurt, DE',
    uptime: '2h 34m',
    bytesIn: '142 MB',
    bytesOut: '38 MB',
    status: 'connected',
    latency: '24ms',
  },
  {
    id: 2,
    name: 'TryHackMe VPN',
    provider: 'TryHackMe',
    server: 'eu-regular-1.tryhackme.com',
    protocol: 'OpenVPN',
    ip: '10.8.0.12',
    publicIp: '—',
    location: 'London, UK',
    uptime: '—',
    bytesIn: '—',
    bytesOut: '—',
    status: 'disconnected',
    latency: '—',
  },
  {
    id: 3,
    name: 'ProtonVPN',
    provider: 'Proton',
    server: 'us-ny-01.protonvpn.net',
    protocol: 'WireGuard',
    ip: '10.2.0.2',
    publicIp: '198.54.xx.xx',
    location: 'New York, US',
    uptime: '—',
    bytesIn: '—',
    bytesOut: '—',
    status: 'disconnected',
    latency: '—',
  },
  {
    id: 4,
    name: 'PwnBox Tunnel',
    provider: 'Custom',
    server: 'tunnel.pwnbox.io',
    protocol: 'WireGuard',
    ip: '172.16.0.5',
    publicIp: '45.33.xx.xx',
    location: 'Amsterdam, NL',
    uptime: '—',
    bytesIn: '—',
    bytesOut: '—',
    status: 'error',
    latency: '—',
  },
]

const statusConfig = {
  connected: { color: 'mint', label: 'Connected', icon: Wifi },
  disconnected: { color: 'muted', label: 'Disconnected', icon: WifiOff },
  connecting: { color: 'gold', label: 'Connecting...', icon: Wifi },
  error: { color: 'rose', label: 'Error', icon: WifiOff },
}

export default function VPN() {
  const [connections, setConnections] = useState(vpnConnections)

  const toggleConnection = (id) => {
    setConnections(connections.map((c) => {
      if (c.id !== id) return c
      if (c.status === 'connected') return { ...c, status: 'disconnected', uptime: '—', bytesIn: '—', bytesOut: '—', latency: '—' }
      return { ...c, status: 'connected', uptime: '0h 0m', bytesIn: '0 MB', bytesOut: '0 MB', latency: '32ms' }
    }))
  }

  const activeConn = connections.find((c) => c.status === 'connected')

  return (
    <div className="flex flex-col gap-3.5">
      {/* Active Connection Banner */}
      {activeConn && (
        <Card className="border-l-4 border-mint">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center">
              <Shield size={20} className="text-mint" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-[16px] text-text-primary">VPN Active</h3>
                <Badge color="mint" pill>Protected</Badge>
              </div>
              <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                <span className="font-mono text-[11px] text-text-dim">
                  IP: <span className="text-mint">{activeConn.ip}</span>
                </span>
                <span className="font-mono text-[11px] text-text-dim">
                  Server: <span className="text-text-secondary">{activeConn.server}</span>
                </span>
                <span className="font-mono text-[11px] text-text-dim">
                  Latency: <span className="text-text-secondary">{activeConn.latency}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-text-dim" />
                <span className="font-mono text-[12px] text-text-primary">{activeConn.uptime}</span>
              </div>
              <div className="font-mono text-[11px] text-text-faint">uptime</div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      {activeConn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">VPN IP</span>
            <div className="font-heading font-bold text-[18px] text-mint mt-1">{activeConn.ip}</div>
          </Card>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Location</span>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={14} className="text-lavender" />
              <span className="font-heading font-semibold text-[14px] text-text-primary">{activeConn.location}</span>
            </div>
          </Card>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Traffic In</span>
            <div className="font-heading font-bold text-[18px] text-sky-accent mt-1">{activeConn.bytesIn}</div>
          </Card>
          <Card>
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Traffic Out</span>
            <div className="font-heading font-bold text-[18px] text-gold mt-1">{activeConn.bytesOut}</div>
          </Card>
        </div>
      )}

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {connections.map((conn) => {
          const config = statusConfig[conn.status]
          const StatusIcon = config.icon
          return (
            <Card key={conn.id} active={conn.status === 'connected'}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon size={16} className={conn.status === 'connected' ? 'text-mint' : 'text-text-dim'} />
                  <h3 className="font-heading font-semibold text-[14px] text-text-primary">{conn.name}</h3>
                </div>
                <Badge color={config.color} pill>{config.label}</Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-dim">Provider</span>
                  <span className="font-mono text-[11px] text-text-secondary">{conn.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-dim">Server</span>
                  <span className="font-mono text-[11px] text-text-secondary truncate ml-4">{conn.server}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-dim">Protocol</span>
                  <Badge color="muted">{conn.protocol}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-dim">Location</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-text-faint" />
                    <span className="font-mono text-[11px] text-text-secondary">{conn.location}</span>
                  </div>
                </div>
                {conn.status === 'connected' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-text-dim">IP Address</span>
                      <span className="font-mono text-[11px] text-mint">{conn.ip}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Uptime</span>
                      <span className="font-mono text-[11px] text-text-primary">{conn.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Traffic</span>
                      <div className="flex items-center gap-1">
                        <ArrowUpDown size={10} className="text-text-faint" />
                        <span className="font-mono text-[11px] text-text-secondary">↓{conn.bytesIn} ↑{conn.bytesOut}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant={conn.status === 'connected' ? 'destructive' : 'ghost'}
                size="small"
                className="w-full"
                onClick={() => toggleConnection(conn.id)}
              >
                {conn.status === 'connected' ? 'Disconnect' : 'Connect'}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

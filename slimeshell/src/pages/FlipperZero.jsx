import { useState } from 'react'
import { Radio, Wifi, Cpu, Usb, Nfc, Zap, Clock, Battery, HardDrive, Signal } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'

const deviceInfo = {
  name: 'Flipper-0x42',
  firmware: 'Xtreme 0.92.2',
  serial: 'FL-2026-A7B3C9',
  battery: 78,
  storage: { used: 12.4, total: 64 },
  uptime: '3d 7h 42m',
  connected: true,
}

const signalModules = [
  { id: 'subghz', name: 'Sub-GHz', icon: Radio, captures: 47, lastUsed: '12 min ago', freq: '433.92 MHz', color: 'mint', status: 'active' },
  { id: 'rfid', name: 'RFID', icon: Wifi, captures: 23, lastUsed: '2 hours ago', freq: '125 kHz', color: 'lavender', status: 'idle' },
  { id: 'nfc', name: 'NFC', icon: Nfc, captures: 31, lastUsed: '45 min ago', freq: '13.56 MHz', color: 'gold', status: 'scanning' },
  { id: 'ir', name: 'Infrared', icon: Zap, captures: 89, lastUsed: '1 day ago', freq: '38 kHz', color: 'rose', status: 'idle' },
  { id: 'badusb', name: 'BadUSB', icon: Usb, captures: 12, lastUsed: '3 hours ago', freq: 'USB HID', color: 'sky', status: 'idle' },
]

const recentCaptures = [
  { id: 1, name: 'garage_door_signal.sub', module: 'Sub-GHz', freq: '433.92 MHz', time: '12 min ago', size: '2.4 KB' },
  { id: 2, name: 'hotel_keycard.nfc', module: 'NFC', freq: '13.56 MHz', time: '45 min ago', size: '1.1 KB' },
  { id: 3, name: 'office_badge.rfid', module: 'RFID', freq: '125 kHz', time: '2 hours ago', size: '0.3 KB' },
  { id: 4, name: 'tv_samsung_power.ir', module: 'Infrared', freq: '38 kHz', time: '1 day ago', size: '0.8 KB' },
  { id: 5, name: 'rickroll_payload.txt', module: 'BadUSB', freq: 'USB HID', time: '3 hours ago', size: '1.5 KB' },
  { id: 6, name: 'gate_remote_315.sub', module: 'Sub-GHz', freq: '315 MHz', time: '5 hours ago', size: '3.1 KB' },
  { id: 7, name: 'ac_remote_lg.ir', module: 'Infrared', freq: '38 kHz', time: '2 days ago', size: '1.2 KB' },
]

const moduleColors = {
  'Sub-GHz': 'mint',
  'RFID': 'lavender',
  'NFC': 'gold',
  'Infrared': 'rose',
  'BadUSB': 'sky',
}

const statusColors = {
  active: 'mint',
  scanning: 'gold',
  idle: 'muted',
}

export default function FlipperZero() {
  const [selectedModule, setSelectedModule] = useState(null)

  return (
    <div className="flex flex-col gap-3.5">
      {/* Device Info & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center">
              <Cpu size={20} className="text-mint" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[16px] text-text-primary">{deviceInfo.name}</h3>
              <span className="font-mono text-[11px] text-text-dim">{deviceInfo.serial}</span>
            </div>
            <Badge color={deviceInfo.connected ? 'mint' : 'rose'} pill className="ml-auto">
              {deviceInfo.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-slime-code rounded-md p-2.5">
              <div className="font-mono text-[11px] text-text-dim uppercase">Firmware</div>
              <div className="font-mono text-[12px] text-text-primary mt-0.5">{deviceInfo.firmware}</div>
            </div>
            <div className="bg-slime-code rounded-md p-2.5">
              <div className="font-mono text-[11px] text-text-dim uppercase">Uptime</div>
              <div className="font-mono text-[12px] text-mint mt-0.5">{deviceInfo.uptime}</div>
            </div>
            <div className="bg-slime-code rounded-md p-2.5">
              <div className="font-mono text-[11px] text-text-dim uppercase">Battery</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Battery size={14} className={deviceInfo.battery > 20 ? 'text-mint' : 'text-rose'} />
                <span className="font-mono text-[12px] text-text-primary">{deviceInfo.battery}%</span>
              </div>
              <ProgressBar value={deviceInfo.battery} className="mt-1" color={deviceInfo.battery > 20 ? 'mint' : 'rose'} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Storage</span>
              <div className="font-heading font-bold text-[28px] text-lavender leading-tight mt-1">
                {deviceInfo.storage.used}<span className="text-text-faint text-[14px]">GB</span>
              </div>
              <span className="font-mono text-[11px] text-text-faint">of {deviceInfo.storage.total} GB</span>
            </div>
            <HardDrive size={20} className="text-text-dim" strokeWidth={1.5} />
          </div>
          <ProgressBar value={deviceInfo.storage.used} max={deviceInfo.storage.total} color="lavender" className="mt-2" />
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Total Captures</span>
              <div className="font-heading font-bold text-[28px] text-gold leading-tight mt-1">
                {signalModules.reduce((sum, m) => sum + m.captures, 0)}
              </div>
              <span className="font-mono text-[11px] text-text-faint">across {signalModules.length} modules</span>
            </div>
            <Signal size={20} className="text-text-dim" strokeWidth={1.5} />
          </div>
        </Card>
      </div>

      {/* Signal Modules */}
      <div>
        <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-2">Signal Modules</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {signalModules.map((mod) => {
            const Icon = mod.icon
            return (
              <Card
                key={mod.id}
                active={selectedModule === mod.id}
                onClick={() => setSelectedModule(selectedModule === mod.id ? null : mod.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} className={`text-${mod.color === 'sky' ? 'sky-accent' : mod.color}`} />
                  <Badge color={statusColors[mod.status]}>{mod.status}</Badge>
                </div>
                <div className="font-heading font-semibold text-[13px] text-text-primary">{mod.name}</div>
                <div className="font-mono text-[11px] text-text-dim mt-0.5">{mod.freq}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-heading font-bold text-[20px] text-text-primary">{mod.captures}</span>
                  <span className="font-mono text-[10px] text-text-faint">{mod.lastUsed}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Captures */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Recent Captures</span>
          <span className="font-mono text-[11px] text-mint">{recentCaptures.length} files</span>
        </div>
        <div className="space-y-1 overflow-y-auto">
          {recentCaptures.map((capture) => (
            <div key={capture.id} className="flex items-center gap-3 py-2 px-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
              <div className="w-7 h-7 rounded-md bg-slime-code flex items-center justify-center">
                <Signal size={14} className="text-text-dim" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[11px] text-text-secondary truncate">{capture.name}</div>
                <div className="font-mono text-[11px] text-text-faint">{capture.freq}</div>
              </div>
              <Badge color={moduleColors[capture.module]}>{capture.module}</Badge>
              <span className="font-mono text-[11px] text-text-faint">{capture.size}</span>
              <span className="font-mono text-[11px] text-text-faint">{capture.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

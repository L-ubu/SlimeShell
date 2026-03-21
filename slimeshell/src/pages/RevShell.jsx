import { useState } from 'react'
import { Copy } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Badge from '../components/ui/Badge.jsx'
import CodeBlock from '../components/ui/CodeBlock.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'
import { shells } from '../lib/revshells.js'

const osOptions = ['Linux', 'Windows', 'macOS']
const shellOptions = { Linux: ['/bin/sh', '/bin/bash'], Windows: ['cmd.exe', 'powershell'], macOS: ['/bin/sh', '/bin/bash', '/bin/zsh'] }
const encodingOptions = ['None', 'Base64', 'URL']

export default function RevShell() {
  const [ip, setIp] = useState('10.10.14.1')
  const [port, setPort] = useState('4444')
  const [os, setOs] = useState('Linux')
  const [shell, setShell] = useState('/bin/sh')
  const [encoding, setEncoding] = useState('None')

  const encode = (cmd) => {
    if (encoding === 'Base64') return `echo ${btoa(cmd)} | base64 -d | bash`
    if (encoding === 'URL') return encodeURIComponent(cmd)
    return cmd
  }

  const listenerCmd = `nc -lvnp ${port}`

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3.5 h-full">
      {/* Config Panel */}
      <div className="w-full md:w-[350px] md:min-w-[350px] flex flex-col gap-3.5">
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Configuration</span>

          <Input label="LHOST" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.14.1" className="mb-3" aria-label="Listener host IP address" />
          <Input label="LPORT" value={port} onChange={(e) => setPort(e.target.value)} placeholder="4444" className="mb-3" aria-label="Listener port number" />

          <fieldset className="mb-3">
            <legend className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">OS Target</legend>
            <div className="flex gap-1.5" role="group" aria-label="Operating system target">
              {osOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => { setOs(o); setShell(shellOptions[o][0]) }}
                  aria-pressed={os === o}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[11px] transition-all cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${os === o ? 'bg-mint/[0.08] border border-mint/15 text-mint' : 'bg-slime-code text-text-dim border border-transparent hover:text-text-muted'}
                  `}
                >
                  {o}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-3">
            <legend className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Shell</legend>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Shell type">
              {shellOptions[os].map((s) => (
                <button
                  key={s}
                  onClick={() => setShell(s)}
                  aria-pressed={shell === s}
                  className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-all cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${shell === s ? 'bg-mint/[0.08] border border-mint/15 text-mint' : 'bg-slime-code text-text-dim border border-transparent hover:text-text-muted'}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Encoding</legend>
            <div className="flex gap-1.5" role="group" aria-label="Encoding type">
              {encodingOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEncoding(e)}
                  aria-pressed={encoding === e}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[11px] transition-all cursor-pointer
                    focus-visible:ring-2 focus-visible:ring-mint
                    ${encoding === e ? 'bg-mint/[0.08] border border-mint/15 text-mint' : 'bg-slime-code text-text-dim border border-transparent hover:text-text-muted'}
                  `}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Listener Command</span>
            <CopyButton text={listenerCmd} source="Listener" />
          </div>
          <pre className="bg-slime-code rounded-md p-3 font-mono text-[12px] text-mint">{listenerCmd}</pre>
        </Card>
      </div>

      {/* Shell List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        {shells.map((s) => {
          const cmd = encode(s.template(ip, port, shell))
          return (
            <Card key={s.id}>
              <div className="flex items-center gap-2 mb-2">
                <Badge color={s.color}>{s.name}</Badge>
                {s.subtype && <Badge color="muted">{s.subtype}</Badge>}
              </div>
              <div className="relative group">
                <pre className="bg-slime-code rounded-md p-3 font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                  {cmd}
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton text={cmd} source={`RevShell ${s.name}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

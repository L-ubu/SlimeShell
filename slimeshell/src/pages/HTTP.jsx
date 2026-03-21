import { useState } from 'react'
import { Send, Plus, Trash2, Clock, Copy } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const methodColors = {
  GET: 'mint', POST: 'lavender', PUT: 'gold', PATCH: 'sky',
  DELETE: 'rose', HEAD: 'muted', OPTIONS: 'muted',
}

const bodyTabs = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'auth', label: 'Auth' },
]

const responseTabs = [
  { id: 'body', label: 'Response Body' },
  { id: 'headers', label: 'Response Headers' },
]

const sampleResponseHeaders = [
  { key: 'Content-Type', value: 'application/json; charset=utf-8' },
  { key: 'Server', value: 'nginx/1.22.1' },
  { key: 'X-Powered-By', value: 'Express' },
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'X-Request-Id', value: 'a3f5b2c1-d4e6-f789-0123-456789abcdef' },
  { key: 'Cache-Control', value: 'no-cache, no-store' },
  { key: 'Content-Length', value: '342' },
]

const sampleResponse = `{
  "status": "success",
  "data": {
    "user": {
      "id": 1337,
      "username": "ghost_byte",
      "email": "ghost@slimeshell.io",
      "role": "admin",
      "created_at": "2024-01-15T10:30:00Z",
      "last_login": "2026-03-20T14:32:00Z",
      "permissions": ["read", "write", "admin"],
      "profile": {
        "level": 42,
        "xp": 8750,
        "rank": "Elite Hacker"
      }
    }
  },
  "meta": {
    "request_id": "a3f5b2c1",
    "response_time": "23ms"
  }
}`

const requestHistory = [
  { method: 'GET', url: '/api/v1/users/me', status: 200, time: '23ms' },
  { method: 'POST', url: '/api/v1/auth/login', status: 200, time: '145ms' },
  { method: 'GET', url: '/api/v1/challenges', status: 200, time: '67ms' },
  { method: 'PUT', url: '/api/v1/users/1337', status: 403, time: '12ms' },
  { method: 'DELETE', url: '/api/v1/sessions/old', status: 204, time: '8ms' },
]

export default function HTTP() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://api.example.com/api/v1/users/me')
  const [activeBodyTab, setActiveBodyTab] = useState('headers')
  const [activeResponseTab, setActiveResponseTab] = useState('body')
  const [headers, setHeaders] = useState([
    { key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIs...', enabled: true },
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'User-Agent', value: 'SlimeShell/1.0', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ])
  const [body, setBody] = useState('{\n  "username": "ghost_byte",\n  "action": "update_profile"\n}')
  const [hasResponse, setHasResponse] = useState(true)

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index, field, value) => {
    setHeaders(headers.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return 'mint'
    if (code >= 300 && code < 400) return 'gold'
    if (code >= 400 && code < 500) return 'rose'
    return 'rose'
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
      {/* Request Bar */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-label="HTTP method"
          className={`bg-slime-card border border-white/[0.06] rounded-lg px-3 py-2.5
            font-mono text-[12px] font-bold focus:outline-none cursor-pointer appearance-none w-28
            focus-visible:ring-2 focus-visible:ring-mint
            ${method === 'GET' ? 'text-mint' : method === 'POST' ? 'text-lavender' : method === 'DELETE' ? 'text-rose' : 'text-gold'}`}
        >
          {methods.map((m) => (
            <option key={m} value={m} className="bg-slime-card text-text-primary">{m}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL..."
          aria-label="Request URL"
          className="flex-1 bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
            font-mono text-[12px] text-text-primary placeholder:text-text-faint
            focus:bg-slime-code focus:border-mint/15 focus:outline-none
            focus-visible:ring-2 focus-visible:ring-mint transition-colors"
        />
        <Button variant="primary" onClick={() => setHasResponse(true)}>
          <Send size={14} /> Send
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Request Config */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs tabs={bodyTabs} activeTab={activeBodyTab} onChange={setActiveBodyTab} />

          <Card className="flex-1 mt-3 flex flex-col overflow-auto">
            {activeBodyTab === 'headers' && (
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                      aria-label={`Enable header ${h.key || 'unnamed'}`}
                      className="accent-mint cursor-pointer"
                    />
                    <input
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                      placeholder="Header name"
                      aria-label={`Header name ${i + 1}`}
                      className="flex-1 bg-slime-code border border-white/[0.04] rounded-md px-2.5 py-1.5
                        font-mono text-[11px] text-text-primary placeholder:text-text-faint
                        focus:outline-none focus:border-mint/15
                        focus-visible:ring-2 focus-visible:ring-mint"
                    />
                    <input
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                      placeholder="Value"
                      aria-label={`Header value ${i + 1}`}
                      className="flex-[2] bg-slime-code border border-white/[0.04] rounded-md px-2.5 py-1.5
                        font-mono text-[11px] text-text-primary placeholder:text-text-faint
                        focus:outline-none focus:border-mint/15
                        focus-visible:ring-2 focus-visible:ring-mint"
                    />
                    <button
                      onClick={() => removeHeader(i)}
                      aria-label={`Remove header ${h.key || i + 1}`}
                      className="text-text-faint hover:text-rose cursor-pointer p-1
                        focus-visible:ring-2 focus-visible:ring-mint focus:outline-none rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  aria-label="Add new header"
                  className="w-full border border-dashed border-white/[0.08] rounded-md py-2 text-text-dim
                    font-mono text-[11px] hover:border-mint/20 hover:text-mint transition-colors cursor-pointer
                    flex items-center justify-center gap-1
                    focus-visible:ring-2 focus-visible:ring-mint focus:outline-none"
                >
                  <Plus size={12} /> Add Header
                </button>
              </div>
            )}

            {activeBodyTab === 'body' && (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-label="Request body"
                className="flex-1 bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
                  text-mint resize-none focus:outline-none focus:border-mint/15
                  focus-visible:ring-2 focus-visible:ring-mint whitespace-pre min-h-[200px]"
                spellCheck={false}
              />
            )}

            {activeBodyTab === 'params' && (
              <div className="font-mono text-[11px] text-text-dim p-4">
                Query parameters will be extracted from the URL automatically.
                <div className="mt-2 bg-slime-code rounded-md p-2.5 border border-white/[0.04]">
                  <span className="text-text-faint text-[11px]">No query parameters detected</span>
                </div>
              </div>
            )}

            {activeBodyTab === 'auth' && (
              <div className="space-y-3 p-1">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Auth Type</label>
                  <select
                    aria-label="Authentication type"
                    className="w-full bg-slime-code border border-white/[0.04] rounded-md px-3 py-2
                      font-mono text-[11px] text-text-primary focus:outline-none cursor-pointer appearance-none
                      focus-visible:ring-2 focus-visible:ring-mint"
                  >
                    <option className="bg-slime-code">Bearer Token</option>
                    <option className="bg-slime-code">Basic Auth</option>
                    <option className="bg-slime-code">API Key</option>
                    <option className="bg-slime-code">No Auth</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Token</label>
                  <input
                    defaultValue="eyJhbGciOiJIUzI1NiIs..."
                    aria-label="Authentication token"
                    className="w-full bg-slime-code border border-white/[0.04] rounded-md px-3 py-2
                      font-mono text-[11px] text-text-primary focus:outline-none focus:border-mint/15
                      focus-visible:ring-2 focus-visible:ring-mint"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* History */}
          <Card className="mt-3">
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-2">Recent Requests</span>
            <div className="space-y-1">
              {requestHistory.map((req, i) => (
                <div key={i} className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <Badge color={methodColors[req.method]}>{req.method}</Badge>
                  <span className="font-mono text-[11px] text-text-secondary flex-1 truncate">{req.url}</span>
                  <Badge color={statusColor(req.status)}>{req.status}</Badge>
                  <span className="font-mono text-[11px] text-text-faint">{req.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Response */}
        <div className="flex-1 flex flex-col min-w-0">
          {hasResponse ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Badge color="mint" pill>200 OK</Badge>
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-text-dim" />
                  <span className="font-mono text-[11px] text-text-dim">23ms</span>
                </div>
                <span className="font-mono text-[11px] text-text-dim">342 bytes</span>
              </div>

              <Tabs tabs={responseTabs} activeTab={activeResponseTab} onChange={setActiveResponseTab} />

              <Card className="flex-1 mt-3 flex flex-col overflow-auto">
                {activeResponseTab === 'body' && (
                  <div className="flex-1 relative">
                    <div className="absolute top-2 right-2 z-10">
                      <CopyButton text={sampleResponse} source="HTTP Response" />
                    </div>
                    <pre className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
                      text-mint overflow-auto h-full whitespace-pre">
                      {sampleResponse}
                    </pre>
                  </div>
                )}

                {activeResponseTab === 'headers' && (
                  <div className="space-y-1">
                    {sampleResponseHeaders.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-white/[0.02]">
                        <span className="font-mono text-[11px] text-text-dim w-48">{h.key}</span>
                        <span className="font-mono text-[11px] text-text-secondary flex-1 truncate">{h.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Send size={32} className="text-text-dim mx-auto mb-2" />
                <span className="font-mono text-[12px] text-text-dim">Send a request to see the response</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

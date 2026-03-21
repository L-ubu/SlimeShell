import { useState, useMemo } from 'react'
import { Key, AlertTriangle, CheckCircle, Lock, Unlock } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'
import Input from '../components/ui/Input.jsx'

const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imdob3N0X2J5dGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTA4ODY0MDAsImV4cCI6MTcxMDk3MjgwMCwiaXNzIjoic2xpbWVzaGVsbC5pbyIsImF1ZCI6InNsaW1lc2hlbGwtYXBpIn0.Rl0bCVgrmrh6aGLTcXdkG6r_Y2u7xJQVl7TdqP3yJFk'

function base64UrlDecode(str) {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - str.length % 4) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function formatDate(ts) {
  if (!ts) return 'N/A'
  return new Date(ts * 1000).toLocaleString()
}

export default function JWT() {
  const [token, setToken] = useState(sampleJWT)
  const [secret, setSecret] = useState('slimeshell-secret-key')
  const [verifyStatus, setVerifyStatus] = useState('unverified')

  const decoded = useMemo(() => {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const header = base64UrlDecode(parts[0])
    const payload = base64UrlDecode(parts[1])
    return { header, payload, signature: parts[2] }
  }, [token])

  const isExpired = useMemo(() => {
    if (!decoded?.payload?.exp) return false
    return decoded.payload.exp * 1000 < Date.now()
  }, [decoded])

  const handleVerify = () => {
    setVerifyStatus(secret ? 'valid' : 'invalid')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[calc(100vh-120px)]">
      {/* Encoded Panel */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] font-semibold uppercase text-mint">Encoded</span>
          <CopyButton text={token} source="JWT Token" />
        </div>
        <textarea
          value={token}
          onChange={(e) => { setToken(e.target.value); setVerifyStatus('unverified') }}
          placeholder="Paste JWT token here..."
          aria-label="JWT token input"
          className="flex-1 bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
            text-text-secondary resize-none focus:outline-none focus:border-mint/15
            focus-visible:ring-2 focus-visible:ring-mint whitespace-pre-wrap break-all min-h-[200px]"
          spellCheck={false}
        />
        {decoded && (
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color="mint">3 parts</Badge>
              {decoded.header?.alg && <Badge color="lavender">{decoded.header.alg}</Badge>}
              {isExpired && <Badge color="rose">Expired</Badge>}
              {!isExpired && decoded.payload?.exp && <Badge color="mint">Valid</Badge>}
            </div>

            <div className="mt-2 bg-slime-code rounded-md p-2.5 border border-white/[0.04]">
              <div className="font-mono text-[11px] text-text-dim mb-1">Token Structure</div>
              <div className="font-mono text-[11px]">
                <span className="text-rose">{token.split('.')[0]?.substring(0, 20)}...</span>
                <span className="text-text-faint">.</span>
                <span className="text-lavender">{token.split('.')[1]?.substring(0, 20)}...</span>
                <span className="text-text-faint">.</span>
                <span className="text-sky-accent">{token.split('.')[2]?.substring(0, 20)}...</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Decoded Panel */}
      <Card className="flex flex-col">
        <span className="font-mono text-[11px] font-semibold uppercase text-lavender mb-3">Decoded</span>

        {decoded ? (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] font-semibold uppercase text-rose">Header</span>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} source="JWT Header" size="small" />
              </div>
              <pre className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px] text-rose overflow-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] font-semibold uppercase text-lavender">Payload</span>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} source="JWT Payload" size="small" />
              </div>
              <pre className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px] text-lavender overflow-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Claim Details */}
            {decoded.payload && (
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-1.5">Claims</span>
                <div className="bg-slime-code rounded-md border border-white/[0.04] p-3 space-y-1.5">
                  {decoded.payload.sub && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Subject (sub)</span>
                      <span className="font-mono text-[11px] text-text-primary">{decoded.payload.sub}</span>
                    </div>
                  )}
                  {decoded.payload.iss && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Issuer (iss)</span>
                      <span className="font-mono text-[11px] text-text-primary">{decoded.payload.iss}</span>
                    </div>
                  )}
                  {decoded.payload.aud && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Audience (aud)</span>
                      <span className="font-mono text-[11px] text-text-primary">{decoded.payload.aud}</span>
                    </div>
                  )}
                  {decoded.payload.iat && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Issued At (iat)</span>
                      <span className="font-mono text-[11px] text-text-primary">{formatDate(decoded.payload.iat)}</span>
                    </div>
                  )}
                  {decoded.payload.exp && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-dim">Expires (exp)</span>
                      <span className={`font-mono text-[11px] ${isExpired ? 'text-rose' : 'text-mint'}`}>
                        {formatDate(decoded.payload.exp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature */}
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase text-sky-accent block mb-1.5">Signature</span>
              <pre className="bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px] text-sky-accent break-all whitespace-pre-wrap">
                {decoded.signature}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-[12px] text-text-dim">Enter a valid JWT token</span>
          </div>
        )}
      </Card>

      {/* Verify Panel */}
      <Card className="flex flex-col">
        <span className="font-mono text-[11px] font-semibold uppercase text-sky-accent mb-3">Verify Signature</span>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">Algorithm</label>
            <div className="bg-slime-code rounded-md border border-white/[0.04] px-3 py-2.5">
              <span className="font-mono text-[12px] text-text-primary">{decoded?.header?.alg || 'N/A'}</span>
            </div>
          </div>

          <Input
            label="Secret Key"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setVerifyStatus('unverified') }}
            placeholder="Enter secret key..."
          />

          <Button variant="primary" onClick={handleVerify} className="w-full">
            <Key size={14} /> Verify Signature
          </Button>

          {/* Verification Status */}
          <div className={`rounded-md p-4 text-center ${
            verifyStatus === 'valid' ? 'bg-mint/10 border border-mint/20' :
            verifyStatus === 'invalid' ? 'bg-rose/10 border border-rose/20' :
            'bg-slime-code border border-white/[0.04]'
          }`}>
            {verifyStatus === 'valid' && (
              <>
                <CheckCircle size={24} className="text-mint mx-auto mb-2" />
                <div className="font-heading font-bold text-[14px] text-mint">Signature Valid</div>
                <div className="font-mono text-[11px] text-text-dim mt-1">Token integrity verified</div>
              </>
            )}
            {verifyStatus === 'invalid' && (
              <>
                <AlertTriangle size={24} className="text-rose mx-auto mb-2" />
                <div className="font-heading font-bold text-[14px] text-rose">Invalid Signature</div>
                <div className="font-mono text-[11px] text-text-dim mt-1">Secret key does not match</div>
              </>
            )}
            {verifyStatus === 'unverified' && (
              <>
                <Lock size={24} className="text-text-dim mx-auto mb-2" />
                <div className="font-heading font-bold text-[14px] text-text-muted">Not Verified</div>
                <div className="font-mono text-[11px] text-text-dim mt-1">Enter secret and click verify</div>
              </>
            )}
          </div>

          {/* Security Notes */}
          <div className="bg-slime-code rounded-md border border-white/[0.04] p-3">
            <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-2">Security Notes</span>
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-text-faint">• Never expose JWT secrets client-side</div>
              <div className="font-mono text-[11px] text-text-faint">• Use RS256 for production apps</div>
              <div className="font-mono text-[11px] text-text-faint">• Set reasonable expiration times</div>
              <div className="font-mono text-[11px] text-text-faint">• Validate 'alg' header server-side</div>
              <div className="font-mono text-[11px] text-text-faint">• Check 'none' algorithm attacks</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

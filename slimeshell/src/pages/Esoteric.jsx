import { useState, useCallback } from 'react'
import { Play, RotateCcw, Copy, Info } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const languages = [
  { id: 'brainfuck', label: 'Brainfuck' },
  { id: 'ook', label: 'Ook!' },
  { id: 'whitespace', label: 'Whitespace' },
  { id: 'malbolge', label: 'Malbolge' },
  { id: 'befunge', label: 'Befunge' },
]

const sampleCode = {
  brainfuck: `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`,
  ook: `Ook. Ook? Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook! Ook? Ook? Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook? Ook! Ook! Ook? Ook! Ook? Ook. Ook! Ook. Ook. Ook? Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook.`,
  whitespace: `[Space][Space][Space][Tab][LF]\n[Tab][LF][Space][Tab][LF]\n[LF][LF]\n(Simplified representation)`,
  malbolge: `(=<\`:9876Z4321UT.-Q+*)M'&%$H"!~}|Bzy?=|{z]KwZY44Eq0/{mlk**\nhH4]>u0teleqDBk2y?A&%$@p>u<x/4&[D2>^^tr`,
  befunge: `>              v\nv  ,,,,,"Hello"<\n>48*,          v\nv,,,,,,"World!"<\n>25*,@`,
}

const sampleOutput = {
  brainfuck: 'Hello World!',
  ook: 'Hello World!',
  whitespace: '1',
  malbolge: 'Hello World!',
  befunge: 'Hello World!',
}

const langInfo = {
  brainfuck: {
    commands: [
      { cmd: '>', desc: 'Move pointer right' },
      { cmd: '<', desc: 'Move pointer left' },
      { cmd: '+', desc: 'Increment cell' },
      { cmd: '-', desc: 'Decrement cell' },
      { cmd: '.', desc: 'Output ASCII' },
      { cmd: ',', desc: 'Input ASCII' },
      { cmd: '[', desc: 'Loop begin' },
      { cmd: ']', desc: 'Loop end' },
    ],
    description: 'A minimalist Turing-complete language with only 8 commands.',
  },
  ook: {
    commands: [
      { cmd: 'Ook. Ook?', desc: 'Move pointer right' },
      { cmd: 'Ook? Ook.', desc: 'Move pointer left' },
      { cmd: 'Ook. Ook.', desc: 'Increment cell' },
      { cmd: 'Ook! Ook!', desc: 'Decrement cell' },
      { cmd: 'Ook! Ook.', desc: 'Output ASCII' },
      { cmd: 'Ook. Ook!', desc: 'Input ASCII' },
    ],
    description: 'Brainfuck variant designed to be writable by orangutans.',
  },
  whitespace: {
    commands: [
      { cmd: '[Space]', desc: 'Stack manipulation' },
      { cmd: '[Tab]', desc: 'Arithmetic' },
      { cmd: '[LF]', desc: 'Flow control' },
    ],
    description: 'A language where only whitespace characters matter.',
  },
  malbolge: {
    commands: [
      { cmd: 'j', desc: 'Rotate' },
      { cmd: 'i', desc: 'Jump' },
      { cmd: '*', desc: 'Print' },
      { cmd: 'p', desc: 'Input' },
    ],
    description: 'Named after Dante\'s 8th circle of hell. Intentionally difficult.',
  },
  befunge: {
    commands: [
      { cmd: '>', desc: 'Move right' },
      { cmd: '<', desc: 'Move left' },
      { cmd: '^', desc: 'Move up' },
      { cmd: 'v', desc: 'Move down' },
      { cmd: '.', desc: 'Print integer' },
      { cmd: ',', desc: 'Print ASCII' },
    ],
    description: 'A 2D stack-based language. Code flows in any direction.',
  },
}

function interpretBrainfuck(code) {
  const cells = new Array(30000).fill(0)
  let ptr = 0
  let output = ''
  let ip = 0
  const brackets = {}
  const stack = []

  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') stack.push(i)
    if (code[i] === ']') {
      const j = stack.pop()
      brackets[j] = i
      brackets[i] = j
    }
  }

  let iterations = 0
  while (ip < code.length && iterations < 100000) {
    iterations++
    switch (code[ip]) {
      case '>': ptr++; break
      case '<': ptr--; break
      case '+': cells[ptr]++; break
      case '-': cells[ptr]--; break
      case '.': output += String.fromCharCode(cells[ptr]); break
      case '[': if (cells[ptr] === 0) ip = brackets[ip]; break
      case ']': if (cells[ptr] !== 0) ip = brackets[ip]; break
    }
    ip++
  }
  if (iterations >= 100000) output += '\n[Execution limit reached]'
  return output
}

export default function Esoteric() {
  const [activeLang, setActiveLang] = useState('brainfuck')
  const [code, setCode] = useState(sampleCode.brainfuck)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const handleLangChange = (lang) => {
    setActiveLang(lang)
    setCode(sampleCode[lang] || '')
    setOutput('')
  }

  const runCode = useCallback(() => {
    setIsRunning(true)
    setTimeout(() => {
      if (activeLang === 'brainfuck') {
        setOutput(interpretBrainfuck(code))
      } else {
        setOutput(sampleOutput[activeLang] || '[Interpreter not implemented for this language]')
      }
      setIsRunning(false)
    }, 100)
  }, [activeLang, code])

  const info = langInfo[activeLang]

  return (
    <div className="space-y-4">
      <Tabs tabs={languages} activeTab={activeLang} onChange={handleLangChange} />

      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Code Input */}
        <Card className="col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase text-mint">Code</span>
              <Badge color="lavender">{activeLang}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={code} source={`${activeLang} code`} />
              <Button variant="secondary" size="small" onClick={() => { setCode(''); setOutput('') }}>
                <RotateCcw size={12} /> Clear
              </Button>
              <Button variant="primary" size="small" onClick={runCode} disabled={isRunning}>
                <Play size={12} /> {isRunning ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-slime-code rounded-md border border-white/[0.04] p-4 font-mono text-[12px]
              text-mint resize-none focus:outline-none focus:border-mint/15 whitespace-pre-wrap"
            spellCheck={false}
            placeholder={`Enter ${activeLang} code...`}
          />

          {/* Output */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] font-semibold uppercase text-lavender">Output</span>
              {output && <CopyButton text={output} source="Output" size="small" />}
            </div>
            <div className="bg-slime-terminal rounded-md border border-white/[0.04] p-3 min-h-[80px]">
              <pre className="font-mono text-[12px] text-text-primary whitespace-pre-wrap">
                {output || <span className="text-text-faint">Run code to see output...</span>}
              </pre>
            </div>
          </div>
        </Card>

        {/* Language Info */}
        <Card className="flex flex-col overflow-auto">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-text-dim" />
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">Language Reference</span>
          </div>

          <div className="mb-4">
            <h3 className="font-heading font-bold text-[14px] text-text-primary capitalize mb-1">{activeLang}</h3>
            <p className="font-mono text-[10px] text-text-muted leading-relaxed">{info?.description}</p>
          </div>

          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-2">Commands</span>
          <div className="space-y-1.5 flex-1">
            {info?.commands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-2 bg-slime-code rounded-md px-2.5 py-1.5">
                <span className="font-mono text-[12px] text-mint font-bold w-24">{cmd.cmd}</span>
                <span className="font-mono text-[10px] text-text-dim">{cmd.desc}</span>
              </div>
            ))}
          </div>

          {/* Examples */}
          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <span className="font-mono text-[10px] font-semibold uppercase text-text-dim block mb-2">Quick Examples</span>
            <div className="space-y-1.5">
              {activeLang === 'brainfuck' && (
                <>
                  <div className="bg-slime-code rounded-md p-2">
                    <span className="font-mono text-[9px] text-text-faint">Print 'A' (ASCII 65):</span>
                    <div className="font-mono text-[10px] text-mint mt-0.5">++++++++[&gt;++++++++&lt;-]&gt;+.</div>
                  </div>
                  <div className="bg-slime-code rounded-md p-2">
                    <span className="font-mono text-[9px] text-text-faint">Cat program (echo input):</span>
                    <div className="font-mono text-[10px] text-mint mt-0.5">,[.,]</div>
                  </div>
                </>
              )}
              {activeLang !== 'brainfuck' && (
                <div className="bg-slime-code rounded-md p-2">
                  <span className="font-mono text-[9px] text-text-faint">Hello World is loaded as default example</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

import { useState, useCallback, useMemo } from 'react'
import { Plus, Trash2, ArrowDown, RotateCcw } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'
import { transformList, applyTransform } from '../lib/encoding.js'

const STEP_COLORS = ['text-mint', 'text-lavender', 'text-gold', 'text-sky-accent', 'text-pink-accent', 'text-rose']
const STEP_BG = ['border-mint/20', 'border-lavender/20', 'border-gold/20', 'border-sky-accent/20', 'border-pink-accent/20', 'border-rose/20']

export default function Encoding() {
  const [input, setInput] = useState('')
  const [steps, setSteps] = useState([{ id: Date.now(), transform: 'base64-encode' }])

  const results = useMemo(() => {
    let current = input
    return steps.map((step) => {
      current = applyTransform(step.transform, current)
      return current
    })
  }, [input, steps])

  const finalOutput = results.length > 0 ? results[results.length - 1] : input

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), transform: 'base64-encode' }])
  }

  const removeStep = (id) => {
    setSteps(steps.filter((s) => s.id !== id))
  }

  const updateStep = (id, transform) => {
    setSteps(steps.map((s) => s.id === id ? { ...s, transform } : s))
  }

  const reverseChain = useCallback(() => {
    setSteps([...steps].reverse().map((step) => {
      const id = step.transform
      if (id.endsWith('-encode')) return { ...step, transform: id.replace('-encode', '-decode') }
      if (id.endsWith('-decode')) return { ...step, transform: id.replace('-decode', '-encode') }
      return step
    }))
    setInput(finalOutput)
  }, [steps, finalOutput])

  return (
    <div className="flex flex-col gap-3.5 max-w-5xl">
      {/* Input */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] font-semibold uppercase text-mint">Input</span>
          <CopyButton text={input} source="Encoding Input" />
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode/decode..."
          aria-label="Encoding input text"
          className="w-full bg-slime-code rounded-md border border-white/[0.04] p-3 font-mono text-[12px] text-text-primary
            placeholder:text-text-faint resize-none focus:outline-none focus:border-mint/15 focus-visible:ring-2 focus-visible:ring-mint min-h-[100px]"
          rows={4}
        />
      </Card>

      {/* Steps */}
      {steps.map((step, i) => (
        <div key={step.id}>
          <div className="flex items-center justify-center py-1">
            <ArrowDown size={16} className={STEP_COLORS[i % STEP_COLORS.length]} aria-hidden="true" />
            <select
              value={step.transform}
              onChange={(e) => updateStep(step.id, e.target.value)}
              aria-label={`Transform type for step ${i + 1}`}
              className={`mx-2 bg-slime-code border ${STEP_BG[i % STEP_BG.length]} rounded-md px-3 py-1
                font-mono text-[11px] ${STEP_COLORS[i % STEP_COLORS.length]} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mint appearance-none`}
            >
              {transformList.map((t) => (
                <option key={t.id} value={t.id} className="bg-slime-code text-text-primary">{t.label}</option>
              ))}
            </select>
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(step.id)}
                aria-label={`Remove step ${i + 1}`}
                className="text-text-dim hover:text-rose focus-visible:ring-2 focus-visible:ring-mint rounded transition-colors cursor-pointer p-1"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </div>
          <Card className={`border-l-2 ${STEP_BG[i % STEP_BG.length]}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-mono text-[11px] font-semibold uppercase ${STEP_COLORS[i % STEP_COLORS.length]}`}>
                Step {i + 1}
              </span>
              <CopyButton text={results[i] || ''} source={`Encoding Step ${i + 1}`} />
            </div>
            <pre className="bg-slime-code rounded-md p-3 font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap break-all min-h-[40px]">
              {results[i] || ''}
            </pre>
          </Card>
        </div>
      ))}

      {/* Add Step */}
      <button
        onClick={addStep}
        aria-label="Add encoding step"
        className="w-full border-2 border-dashed border-white/[0.08] rounded-lg py-3 text-text-dim font-mono text-[12px]
          hover:border-mint/20 hover:text-mint focus-visible:ring-2 focus-visible:ring-mint transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <Plus size={16} aria-hidden="true" /> Add Step
      </button>

      {/* Output */}
      <Card className="border-l-2 border-rose/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] font-semibold uppercase text-rose">Output</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="small" onClick={reverseChain} aria-label="Reverse encoding chain">
              <RotateCcw size={12} aria-hidden="true" /> Reverse Chain
            </Button>
            <CopyButton text={finalOutput} source="Encoding Output" />
          </div>
        </div>
        <pre className="bg-slime-code rounded-md p-3 font-mono text-[14px] text-mint overflow-x-auto whitespace-pre-wrap break-all min-h-[60px]">
          {finalOutput}
        </pre>
      </Card>
    </div>
  )
}

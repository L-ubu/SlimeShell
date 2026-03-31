import { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, ArrowDown, RotateCcw, ChevronUp, ChevronDown, Wand2 } from 'lucide-react';
import { transforms, applyTransform, getInverse, detectEncodings } from '../lib/encoding.js';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const STEP_COLORS = ['#6EE7B7', '#A78BFA', '#FBBF24', '#7DD3FC', '#F472B6', '#FB7185'];
const groups = [...new Set(transforms.map(t => t.group))];
const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

function confidenceBarColor(confidence) {
  if (confidence >= 80) return '#6EE7B7';
  if (confidence >= 50) return '#FBBF24';
  return '#F87171';
}

let nextId = 1;
const makeStep = (transformId = transforms[0].id) => ({ key: nextId++, transformId });

export default function Encoding() {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState([makeStep()]);
  const [autoDecodeOn, setAutoDecodeOn] = useState(true);

  const detections = useMemo(() => {
    if (!autoDecodeOn || !input.trim()) return [];
    return detectEncodings(input).slice(0, 8);
  }, [input, autoDecodeOn]);

  const outputs = useMemo(() => {
    const results = [];
    let current = input;
    for (const step of steps) {
      current = applyTransform(step.transformId, current);
      results.push(current);
    }
    return results;
  }, [input, steps]);

  const finalOutput = outputs.length > 0 ? outputs[outputs.length - 1] : input;

  const addStep = useCallback(() => setSteps(prev => [...prev, makeStep()]), []);
  const removeStep = useCallback((key) => setSteps(prev => prev.length > 1 ? prev.filter(s => s.key !== key) : prev), []);
  const updateStep = useCallback((key, transformId) => setSteps(prev => prev.map(s => s.key === key ? { ...s, transformId } : s)), []);
  const moveStep = useCallback((index, dir) => {
    setSteps(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const reverseChain = useCallback(() => {
    setSteps(prev => [...prev].reverse().map(s => ({ ...s, key: nextId++, transformId: getInverse(s.transformId) })));
    setInput(finalOutput);
  }, [finalOutput]);

  const clearAll = useCallback(() => { setInput(''); setSteps([makeStep()]); }, []);

  const useDetection = useCallback((transformId, originalEncoded) => {
    setSteps([{ key: nextId++, transformId }]);
    setInput(originalEncoded);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>
            Encoding Playground
          </span>
          <ToolHelp title="Encoding" description="Multi-step encode/decode pipeline. Chain transforms together to encode or decode text through multiple steps." steps={["Paste or type your input text in the input area","Add encoding steps using the dropdown (Base64, Hex, URL, etc.)","Reorder or remove steps as needed","Copy the final output"]} tips={["Auto-detect identifies the encoding of your input","You can chain unlimited steps together","Use the inverse button to quickly decode"]} />
          <span style={{
            fontFamily: mono, fontSize: 10, color: '#6B7280',
            background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 8px',
          }}>
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            role="switch"
            aria-checked={autoDecodeOn}
            onClick={() => setAutoDecodeOn(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 999, padding: '4px 10px 4px 6px', cursor: 'pointer',
              fontFamily: mono, fontSize: 10, fontWeight: 600, color: '#94A3B8',
              transition: 'background 150ms, border-color 150ms',
            }}
            className="hover:border-mint/20"
          >
            <span style={{
              width: 28, height: 16, borderRadius: 8,
              background: autoDecodeOn ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.08)',
              position: 'relative', flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 2, left: autoDecodeOn ? 14 : 2,
                width: 12, height: 12, borderRadius: '50%',
                background: autoDecodeOn ? '#6EE7B7' : '#64748B',
                transition: 'left 150ms',
              }} />
            </span>
            Auto Decode
          </button>
          <Button variant="ghost" size="sm" onClick={reverseChain}>
            <RotateCcw size={13} /> Reverse Chain
          </Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>Clear</Button>
        </div>
      </div>

      {/* Input */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Input
            </span>
            <CopyButton text={input} />
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste text to encode/decode..."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', background: '#0F1520',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
              padding: 14, fontFamily: mono, fontSize: 12,
              color: '#E2E8F0', resize: 'vertical', outline: 'none', lineHeight: 1.6,
            }}
            className="placeholder:text-[#4B5563] focus:border-mint/20"
          />
        </div>
      </Card>

      {/* Auto Decoder */}
      {autoDecodeOn && (
        <Card style={{
          background: 'rgba(110,231,183,0.03)',
          borderLeft: '3px solid #6EE7B7',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wand2 size={18} style={{ color: '#6EE7B7', flexShrink: 0 }} />
              <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
                Auto Decoder
              </span>
            </div>

            {(!input.trim() || detections.length === 0) ? (
              <p style={{
                margin: 0, fontFamily: mono, fontSize: 11, color: '#64748B', fontStyle: 'italic',
              }}>
                Paste encoded text to auto-detect the encoding
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {detections.map((d, idx) => (
                  <div
                    key={`${d.transform}-${d.encoding}-${idx}`}
                    style={{
                      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
                    }}
                  >
                    <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
                      {d.encoding}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          height: 4, borderRadius: 2, background: '#1A1F2E', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${Math.min(100, Math.max(0, d.confidence))}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: confidenceBarColor(d.confidence),
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontFamily: mono, fontSize: 11, color: '#94A3B8', flexShrink: 0, minWidth: 36,
                        textAlign: 'right',
                      }}>
                        {d.confidence}%
                      </span>
                    </div>
                    <pre style={{
                      background: '#0B0F18', border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 8, padding: 12, fontFamily: mono, fontSize: 11,
                      color: '#6EE7B7', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      margin: 0, lineHeight: 1.5, maxHeight: 160, overflowY: 'auto', boxSizing: 'border-box',
                    }}>
                      {d.decoded}
                    </pre>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => useDetection(d.transform, input)}
                      >
                        Use this
                      </Button>
                      <CopyButton text={d.decoded} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Steps */}
      {steps.map((step, i) => {
        const color = STEP_COLORS[i % STEP_COLORS.length];
        return (
          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Arrow connector */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 4px' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
              }}>
                <div style={{ width: 1, height: 10, background: `${color}40` }} />
                <ArrowDown size={14} style={{ color, margin: '-3px 0' }} />
              </div>
            </div>

            {/* Step card */}
            <Card style={{ borderLeft: `2px solid ${color}`, paddingLeft: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: mono, fontSize: 10, fontWeight: 700, color,
                    background: `${color}14`, borderRadius: 4, padding: '3px 10px', flexShrink: 0,
                  }}>
                    STEP {i + 1}
                  </span>

                  <select
                    value={step.transformId}
                    onChange={e => updateStep(step.key, e.target.value)}
                    style={{
                      flex: 1, background: '#0F1520', border: `1px solid ${color}30`,
                      borderRadius: 6, padding: '7px 12px', fontFamily: mono, fontSize: 11,
                      color: '#E2E8F0', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {groups.map(group => (
                      <optgroup key={group} label={group}>
                        {transforms.filter(t => t.group === group).map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      style={{
                        background: 'none', border: 'none', padding: 5, cursor: i > 0 ? 'pointer' : 'default',
                        color: i > 0 ? '#6B7280' : '#2A2F3A', display: 'flex',
                      }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveStep(i, 1)}
                      disabled={i === steps.length - 1}
                      style={{
                        background: 'none', border: 'none', padding: 5,
                        cursor: i < steps.length - 1 ? 'pointer' : 'default',
                        color: i < steps.length - 1 ? '#6B7280' : '#2A2F3A', display: 'flex',
                      }}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => removeStep(step.key)}
                      disabled={steps.length === 1}
                      style={{
                        background: 'none', border: 'none', padding: 5, display: 'flex',
                        cursor: steps.length > 1 ? 'pointer' : 'default',
                        color: steps.length > 1 ? '#6B7280' : '#2A2F3A',
                      }}
                      className="hover:text-rose"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <CopyButton text={outputs[i] || ''} />
                </div>

                <pre style={{
                  background: '#0B0F18', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 8, padding: 14, fontFamily: mono, fontSize: 12,
                  color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  margin: 0, minHeight: 38, lineHeight: 1.6,
                  maxHeight: 200, overflowY: 'auto', boxSizing: 'border-box',
                }}>
                  {outputs[i] || <span style={{ color: '#3B4252', fontStyle: 'italic' }}>no output</span>}
                </pre>
              </div>
            </Card>
          </div>
        );
      })}

      {/* Add step */}
      <button
        onClick={addStep}
        style={{
          width: '100%', padding: '12px 0',
          background: 'transparent', border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: mono, fontSize: 11, fontWeight: 500,
          color: '#4B5563', transition: 'all 150ms',
        }}
        className="hover:border-mint/30 hover:text-mint"
      >
        <Plus size={14} /> Add Step
      </button>

      {/* Final output */}
      <Card style={{ borderLeft: '3px solid #FB7185' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: '#FB7185', letterSpacing: '0.03em' }}>
              FINAL OUTPUT
            </span>
            <CopyButton text={finalOutput} />
          </div>
          <pre style={{
            background: '#0B0F18', border: '1px solid rgba(251,113,133,0.1)',
            borderRadius: 8, padding: 14, fontFamily: mono, fontSize: 12,
            color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            margin: 0, minHeight: 52, lineHeight: 1.6,
            maxHeight: 300, overflowY: 'auto', boxSizing: 'border-box',
          }}>
            {finalOutput || <span style={{ color: '#3B4252', fontStyle: 'italic' }}>output will appear here</span>}
          </pre>
        </div>
      </Card>
    </div>
  );
}

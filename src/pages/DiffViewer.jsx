import { useMemo, useState, useCallback } from 'react';
import { GitCompare, ArrowLeftRight, Trash2, LayoutGrid, Columns2 } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const textareaStyle = {
  width: '100%',
  minHeight: 200,
  resize: 'vertical',
  boxSizing: 'border-box',
  background: '#0B0F18',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  fontFamily: mono,
  fontSize: 12,
  color: '#E2E8F0',
  padding: 12,
  outline: 'none',
};

const lineNumStyle = {
  width: '4ch',
  minWidth: '4ch',
  flexShrink: 0,
  textAlign: 'right',
  color: '#3B4252',
  userSelect: 'none',
};

/**
 * LCS-based line diff: returns ordered ops with 1-based line numbers for display.
 */
function computeLineDiff(leftLines, rightLines) {
  const m = leftLines.length;
  const n = rightLines.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const ops = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      ops.unshift({
        type: 'equal',
        text: leftLines[i - 1],
        leftLine: i,
        rightLine: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({
        type: 'insert',
        text: rightLines[j - 1],
        rightLine: j,
      });
      j--;
    } else {
      ops.unshift({
        type: 'delete',
        text: leftLines[i - 1],
        leftLine: i,
      });
      i--;
    }
  }
  return ops;
}

function diffStats(ops) {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const op of ops) {
    if (op.type === 'insert') additions++;
    else if (op.type === 'delete') deletions++;
    else unchanged++;
  }
  return { additions, deletions, unchanged };
}

function formatDiffForCopy(ops) {
  return ops
    .map((op) => {
      if (op.type === 'equal') return ` ${op.text}`;
      if (op.type === 'delete') return `-${op.text}`;
      return `+${op.text}`;
    })
    .join('\n');
}

export default function DiffViewer() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [viewMode, setViewMode] = useState('unified');

  const leftLines = useMemo(() => original.split('\n'), [original]);
  const rightLines = useMemo(() => modified.split('\n'), [modified]);

  const ops = useMemo(
    () => computeLineDiff(leftLines, rightLines),
    [leftLines, rightLines],
  );

  const stats = useMemo(() => diffStats(ops), [ops]);
  const copyText = useMemo(() => formatDiffForCopy(ops), [ops]);

  const swap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
  }, [original, modified]);

  const clear = useCallback(() => {
    setOriginal('');
    setModified('');
  }, []);

  const badgeBase = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 6,
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 600,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(125,211,252,0.12)',
            border: '1px solid rgba(125,211,252,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GitCompare size={20} color="#7DD3FC" strokeWidth={2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: '#E2E8F0',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Diff Viewer
        </h1>
        <ToolHelp title="Diff Viewer" description="Side-by-side text comparison tool. Paste two texts and see the differences highlighted." steps={["Paste original text on the left","Paste modified text on the right","Differences are highlighted automatically","Use for comparing configs, code, or outputs"]} tips={["Added lines show in green, removed in red","Useful for spotting changes in CTF challenges","Works with any plain text content"]} />
      </header>

      {/* Text inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Card style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontFamily: heading,
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
            }}
          >
            Original
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text…"
            style={textareaStyle}
            spellCheck={false}
          />
        </Card>
        <Card style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              fontFamily: heading,
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
            }}
          >
            Modified
          </label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text…"
            style={textareaStyle}
            spellCheck={false}
          />
        </Card>
      </div>

      {/* Controls + stats */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={swap}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: heading,
              fontSize: 13,
              fontWeight: 600,
              color: '#E2E8F0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeftRight size={16} color="#94A3B8" />
            Swap
          </button>
          <button
            type="button"
            onClick={clear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: heading,
              fontSize: 13,
              fontWeight: 600,
              color: '#E2E8F0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} color="#94A3B8" />
            Clear
          </button>
          <div
            style={{
              display: 'inline-flex',
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: heading,
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 12px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'unified' ? 'rgba(125,211,252,0.15)' : 'rgba(255,255,255,0.04)',
                color: viewMode === 'unified' ? '#7DD3FC' : '#94A3B8',
              }}
            >
              <LayoutGrid size={14} />
              Unified
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sideBySide')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: heading,
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 12px',
                border: 'none',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                background:
                  viewMode === 'sideBySide' ? 'rgba(125,211,252,0.15)' : 'rgba(255,255,255,0.04)',
                color: viewMode === 'sideBySide' ? '#7DD3FC' : '#94A3B8',
              }}
            >
              <Columns2 size={14} />
              Side by Side
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              ...badgeBase,
              background: 'rgba(110,231,183,0.12)',
              color: '#6EE7B7',
              border: '1px solid rgba(110,231,183,0.2)',
            }}
          >
            +{stats.additions} additions
          </span>
          <span
            style={{
              ...badgeBase,
              background: 'rgba(251,113,133,0.12)',
              color: '#FB7185',
              border: '1px solid rgba(251,113,133,0.2)',
            }}
          >
            −{stats.deletions} deletions
          </span>
          <span
            style={{
              ...badgeBase,
              background: 'rgba(148,163,184,0.1)',
              color: '#94A3B8',
              border: '1px solid rgba(148,163,184,0.15)',
            }}
          >
            {stats.unchanged} unchanged
          </span>
          {ops.length > 0 && <CopyButton text={copyText} />}
        </div>
      </div>

      {/* Diff output */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontFamily: heading,
            fontSize: 12,
            fontWeight: 600,
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Diff output</span>
        </div>
        <div
          style={{
            background: '#0B0F18',
            fontFamily: mono,
            fontSize: 12,
            lineHeight: 1.5,
            maxHeight: 'min(60vh, 520px)',
            overflow: 'auto',
            padding: '10px 0',
          }}
        >
          {ops.length === 0 && original === '' && modified === '' ? (
            <div style={{ padding: '24px 16px', color: '#4B5563', textAlign: 'center' }}>
              Enter text in both fields to see the diff.
            </div>
          ) : viewMode === 'unified' ? (
            ops.map((op, idx) => {
              const rowStyle = {
                display: 'flex',
                alignItems: 'stretch',
                minHeight: 22,
                whiteSpace: 'pre',
                padding: '2px 12px',
              };
              if (op.type === 'delete') {
                return (
                  <div
                    key={`u-${idx}`}
                    style={{
                      ...rowStyle,
                      background: 'rgba(251,113,133,0.08)',
                      color: '#FB7185',
                    }}
                  >
                    <span style={lineNumStyle}>{op.leftLine}</span>
                    <span style={{ ...lineNumStyle, marginLeft: 8 }} />
                    <span style={{ width: '1.2ch', flexShrink: 0 }}>−</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {op.text}
                    </span>
                  </div>
                );
              }
              if (op.type === 'insert') {
                return (
                  <div
                    key={`u-${idx}`}
                    style={{
                      ...rowStyle,
                      background: 'rgba(110,231,183,0.08)',
                      color: '#6EE7B7',
                    }}
                  >
                    <span style={lineNumStyle} />
                    <span style={{ ...lineNumStyle, marginLeft: 8 }}>{op.rightLine}</span>
                    <span style={{ width: '1.2ch', flexShrink: 0 }}>+</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {op.text}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={`u-${idx}`}
                  style={{
                    ...rowStyle,
                    color: '#4B5563',
                  }}
                >
                  <span style={lineNumStyle}>{op.leftLine}</span>
                  <span style={{ ...lineNumStyle, marginLeft: 8 }}>{op.rightLine}</span>
                  <span style={{ width: '1.2ch', flexShrink: 0 }}> </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {op.text}
                  </span>
                </div>
              );
            })
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0,
              }}
            >
              <div
                style={{
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  minWidth: 0,
                }}
              >
                {ops.map((op, idx) => {
                  const rowStyle = {
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: 22,
                    whiteSpace: 'pre',
                    padding: '2px 10px',
                  };
                  if (op.type === 'insert') {
                    return (
                      <div
                        key={`l-${idx}`}
                        style={{
                          ...rowStyle,
                          background: 'transparent',
                          color: '#3B4252',
                        }}
                      >
                        <span style={lineNumStyle} />
                        <span style={{ width: '1.2ch', flexShrink: 0, color: '#3B4252' }}> </span>
                        <span style={{ flex: 1 }}> </span>
                      </div>
                    );
                  }
                  const isDel = op.type === 'delete';
                  return (
                    <div
                      key={`l-${idx}`}
                      style={{
                        ...rowStyle,
                        background: isDel ? 'rgba(251,113,133,0.08)' : 'transparent',
                        color: isDel ? '#FB7185' : '#4B5563',
                      }}
                    >
                      <span style={lineNumStyle}>{op.leftLine}</span>
                      <span style={{ width: '1.2ch', flexShrink: 0 }}>
                        {isDel ? '−' : ' '}
                      </span>
                      <span style={{ flex: 1, overflow: 'hidden' }}>
                        {isDel || op.type === 'equal' ? op.text : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ minWidth: 0 }}>
                {ops.map((op, idx) => {
                  const rowStyle = {
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: 22,
                    whiteSpace: 'pre',
                    padding: '2px 10px',
                  };
                  if (op.type === 'delete') {
                    return (
                      <div
                        key={`r-${idx}`}
                        style={{
                          ...rowStyle,
                          background: 'transparent',
                          color: '#3B4252',
                        }}
                      >
                        <span style={lineNumStyle} />
                        <span style={{ width: '1.2ch', flexShrink: 0 }}> </span>
                        <span style={{ flex: 1 }}> </span>
                      </div>
                    );
                  }
                  const isIns = op.type === 'insert';
                  return (
                    <div
                      key={`r-${idx}`}
                      style={{
                        ...rowStyle,
                        background: isIns ? 'rgba(110,231,183,0.08)' : 'transparent',
                        color: isIns ? '#6EE7B7' : '#4B5563',
                      }}
                    >
                      <span style={lineNumStyle}>{op.rightLine}</span>
                      <span style={{ width: '1.2ch', flexShrink: 0 }}>
                        {isIns ? '+' : ' '}
                      </span>
                      <span style={{ flex: 1, overflow: 'hidden' }}>
                        {isIns || op.type === 'equal' ? op.text : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

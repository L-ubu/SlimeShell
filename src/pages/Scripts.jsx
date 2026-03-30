import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { builtinScripts, categories, languageColors } from '../lib/scripts-data.js';
import { Search, FileCode } from 'lucide-react';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

function ScriptViewer({ script }) {
  if (!script) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}>
        <div style={{ textAlign: 'center' }}>
          <FileCode size={48} strokeWidth={1} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontFamily: heading, fontSize: 14 }}>Select a script to view</p>
        </div>
      </div>
    );
  }

  const lines = script.content.split('\n');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(15,21,32,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileCode size={14} style={{ color: languageColors[script.language] || '#6B7280' }} />
          <span style={{ fontFamily: mono, fontSize: 12, color: '#E2E8F0', fontWeight: 600 }}>
            {script.name}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: mono, fontWeight: 600,
            background: `${languageColors[script.language] || '#6B7280'}15`,
            color: languageColors[script.language] || '#6B7280',
          }}>
            {script.language}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <CopyButton text={script.content} />
        </div>
      </div>

      <div style={{
        flex: 1, overflow: 'auto', padding: 0, background: '#0B0F18',
        display: 'flex',
      }}>
        <div style={{
          padding: '12px 0', minWidth: 44, textAlign: 'right',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          userSelect: 'none',
        }}>
          {lines.map((_, i) => (
            <div key={i} style={{
              padding: '0 10px', fontFamily: mono, fontSize: 11,
              lineHeight: '20px', color: '#3B4252',
            }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre style={{
          flex: 1, margin: 0, padding: 12, fontFamily: mono, fontSize: 11,
          lineHeight: '20px', color: '#D1D5DB', overflowX: 'auto',
          whiteSpace: 'pre',
        }}>
          {lines.map((line, i) => (
            <div key={i}>
              {colorize(line, script.language)}
            </div>
          ))}
        </pre>
      </div>

      <div style={{
        padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(15,21,32,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: '#4B5563' }}>
          {lines.length} lines · {script.language}
        </span>
        <span style={{ fontFamily: heading, fontSize: 11, color: '#6B7280' }}>
          {script.description}
        </span>
      </div>
    </div>
  );
}

function colorize(line, lang) {
  if (lang === 'markdown') {
    if (line.startsWith('# ')) return <span style={{ color: '#6EE7B7', fontWeight: 700 }}>{line}</span>;
    if (line.startsWith('## ')) return <span style={{ color: '#A78BFA', fontWeight: 600 }}>{line}</span>;
    if (line.startsWith('```')) return <span style={{ color: '#4B5563' }}>{line}</span>;
    return line;
  }

  if (line.trimStart().startsWith('#') && (lang === 'bash' || lang === 'python')) {
    return <span style={{ color: '#4B5563', fontStyle: 'italic' }}>{line}</span>;
  }

  if (lang === 'php' && (line.trimStart().startsWith('//') || line.trimStart().startsWith('<?php'))) {
    return <span style={{ color: '#4B5563', fontStyle: 'italic' }}>{line}</span>;
  }

  const parts = [];
  let remaining = line;
  let key = 0;

  const keywords = lang === 'python'
    ? /\b(def|class|import|from|if|else|elif|while|for|return|try|except|with|as|in|not|and|or|True|False|None|print|sys|self)\b/g
    : /\b(if|then|fi|else|elif|do|done|while|for|in|case|esac|function|return|echo|exit|read|local|export|source|eval|exec|set|unset|shift|trap)\b/g;

  const stringRe = /(["'])(?:(?!\1|\\).|\\.)*?\1/g;
  const varRe = /\$\{?[\w@#?!*]+\}?/g;

  let hasStrings = false;
  remaining.replace(stringRe, (m, _q, offset) => {
    hasStrings = true;
    const before = remaining.substring(0, offset);
    if (before && !parts.length) {
      parts.push(<span key={key++}>{applyKeywords(before, keywords, key)}</span>);
    }
    parts.push(<span key={key++} style={{ color: '#FBBF24' }}>{m}</span>);
  });

  if (!hasStrings) {
    return applyKeywords(line, keywords, 0);
  }

  return parts.length ? parts : line;
}

function applyKeywords(text, re, startKey) {
  const parts = [];
  let last = 0;
  let key = startKey;
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<span key={`kw-${key++}`} style={{ color: '#F472B6', fontWeight: 500 }}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 1 ? parts : text;
}

export default function Scripts() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);

  const filtered = useMemo(() => {
    return builtinScripts.filter(s => {
      const matchCat = !activeCategory || s.category === activeCategory;
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.content.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Sidebar file browser */}
      <div style={{
        width: 290, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#11151E', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}>
        {/* Search */}
        <div style={{ padding: '14px 14px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#0B0F18', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '8px 12px',
          }}>
            <Search size={13} style={{ color: '#4B5563', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scripts..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: mono, fontSize: 11, color: '#E2E8F0', width: '100%',
              }}
            />
          </div>
        </div>

        {/* Category chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 14px 12px',
        }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
              fontFamily: mono, fontSize: 10, fontWeight: 600,
              background: !activeCategory ? 'rgba(110,231,183,0.08)' : 'transparent',
              color: !activeCategory ? '#6EE7B7' : '#6B7280',
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={{
                padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: activeCategory === cat ? 'rgba(110,231,183,0.08)' : 'transparent',
                color: activeCategory === cat ? '#6EE7B7' : '#6B7280',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

        {/* Script list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
          {filtered.map(script => {
            const active = selectedScript?.id === script.id;
            return (
              <button
                key={script.id}
                onClick={() => setSelectedScript(script)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(110,231,183,0.06)' : 'transparent',
                  borderLeft: active ? '2px solid #6EE7B7' : '2px solid transparent',
                  transition: 'background 100ms',
                }}
              >
                <FileCode size={13} style={{
                  color: languageColors[script.language] || '#6B7280', flexShrink: 0,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: mono, fontSize: 11, color: active ? '#E2E8F0' : '#9CA3AF',
                    fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {script.name}
                  </div>
                  <div style={{
                    fontFamily: heading, fontSize: 10, color: '#4B5563',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginTop: 1,
                  }}>
                    {script.description}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{
              padding: 20, textAlign: 'center', fontFamily: heading,
              fontSize: 12, color: '#4B5563',
            }}>
              No scripts found
            </div>
          )}
        </div>

        {/* Count */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)',
          fontFamily: mono, fontSize: 10, color: '#3B4252',
        }}>
          {filtered.length} script{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Script viewer */}
      <Card style={{
        flex: 1, padding: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <ScriptViewer script={selectedScript} />
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronRight, Variable } from 'lucide-react';

const mono = 'JetBrains Mono, monospace';

export function VariableBar({ vars, setVar, fields }) {
  const [expanded, setExpanded] = useState(false);
  const visibleFields = fields || Object.keys(vars).slice(0, 6);

  return (
    <div style={{
      background: 'rgba(110,231,183,0.03)',
      border: '1px solid rgba(110,231,183,0.08)',
      borderRadius: 8,
      padding: expanded ? '10px 14px' : '6px 14px',
      transition: 'all 200ms ease',
    }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6EE7B7', fontFamily: mono, fontSize: 10,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: 0, width: '100%',
        }}
      >
        <Variable size={12} />
        Variables
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {!expanded && (
          <span style={{ color: '#4B5563', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            {visibleFields.slice(0, 3).map(f => `${f}=${vars[f] || ''}`).join('  ')}
          </span>
        )}
      </button>
      {expanded && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          marginTop: 10,
        }}>
          {visibleFields.map(field => (
            <label key={field} style={{
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              <span style={{
                fontFamily: mono, fontSize: 9, color: '#6EE7B7',
                fontWeight: 600, textTransform: 'uppercase',
              }}>
                {field}
              </span>
              <input
                type="text"
                value={vars[field] || ''}
                onChange={e => setVar(field, e.target.value)}
                style={{
                  fontFamily: mono, fontSize: 11,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4, padding: '4px 8px',
                  color: '#CBD5E1', width: 130,
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(110,231,183,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

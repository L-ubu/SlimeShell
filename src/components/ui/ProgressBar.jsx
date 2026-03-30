export function ProgressBar({ value = 0, max = 100, label, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            {label}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 3, background: '#0F1520', overflow: 'hidden', width: '100%' }}>
        <div
          style={{
            height: '100%', borderRadius: 3, width: `${pct}%`,
            background: 'linear-gradient(90deg, #34D399, #6EE7B7)',
            transition: 'width 500ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

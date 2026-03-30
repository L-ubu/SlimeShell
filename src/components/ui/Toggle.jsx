export function Toggle({ checked = false, onChange, label, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer ${className}`}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 cursor-pointer
          ${checked ? 'bg-mint/30' : 'bg-white/8'}`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-3 h-3 rounded-full transition-all duration-200
            ${checked ? 'translate-x-3.5 bg-mint' : 'translate-x-0 bg-text-dim'}`}
        />
      </button>
      {label && (
        <span className="font-mono text-[11px] text-text-muted select-none">
          {label}
        </span>
      )}
    </label>
  );
}

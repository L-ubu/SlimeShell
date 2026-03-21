export default function Toggle({ enabled, onChange, label, className = '' }) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label || 'Toggle'}
        onClick={() => onChange(!enabled)}
        className={`
          relative w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer
          focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base
          ${enabled ? 'bg-mint' : 'bg-gray-600'}
        `}
      >
        <span className={`
          block w-4 h-4 rounded-full transition-transform duration-200
          ${enabled ? 'translate-x-4 bg-white' : 'translate-x-0 bg-text-muted'}
        `} />
      </button>
      {label && <span className="font-mono text-[12px] text-text-secondary">{label}</span>}
    </label>
  )
}

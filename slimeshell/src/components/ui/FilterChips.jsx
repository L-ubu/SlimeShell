export default function FilterChips({ options, selected, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`} role="radiogroup">
      {options.map((option) => {
        const isSelected = selected === option.id
        return (
          <button
            key={option.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.id)}
            className={`
              px-3 py-1.5 rounded-md font-mono text-[11px] transition-all duration-150 cursor-pointer
              focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-1 focus-visible:ring-offset-slime-base
              ${isSelected
                ? 'bg-mint/[0.06] border border-mint/[0.12] text-mint'
                : 'text-text-dim hover:text-text-muted border border-transparent'
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

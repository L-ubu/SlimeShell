export function FilterChips({ options, selected = [], onChange, className = '' }) {
  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange?.(next);
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold
              transition-all duration-150 cursor-pointer border
              ${isActive
                ? 'bg-mint/12 border-mint/20 text-mint'
                : 'bg-transparent border-white/6 text-text-dim hover:text-text-muted hover:border-white/10'
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

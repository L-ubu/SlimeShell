export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex border-b border-white/[0.04] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2.5 font-heading font-semibold text-[13px] transition-colors cursor-pointer
              border-b-2 -mb-px
              focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset
              ${isActive
                ? 'border-mint text-mint'
                : 'border-transparent text-text-dim hover:text-text-muted'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-[11px] font-mono ${isActive ? 'text-mint/70' : 'text-text-faint'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

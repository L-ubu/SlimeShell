export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-white/[0.04] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2 font-heading font-semibold text-[13px] transition-colors cursor-pointer
              border-b-2 -mb-px
              ${isActive
                ? 'border-mint text-mint'
                : 'border-transparent text-text-dim hover:text-text-muted'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-[10px] font-mono ${isActive ? 'text-mint/70' : 'text-text-faint'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

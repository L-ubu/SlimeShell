import { useState } from "react";

export function Tabs({ tabs, defaultTab, onChange, className = "" }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value);

  const handleClick = (value) => {
    setActive(value);
    onChange?.(value);
  };

  return (
    <div
      className={`flex gap-1.5 rounded-lg p-2 border border-white/6 bg-card/60 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleClick(tab.value)}
          className={`px-4 py-2 rounded-md font-mono text-xs font-semibold
            transition-all duration-150 cursor-pointer
            ${
              active === tab.value
                ? "bg-mint/12 text-mint border border-mint/15"
                : "text-text-dim hover:text-text-muted hover:bg-white/5 border border-transparent"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

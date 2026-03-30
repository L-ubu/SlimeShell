import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, className = "", ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-mono text-[10px] font-semibold text-text-dim uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`bg-card border border-white/6 rounded-lg px-4 py-3
          font-mono text-xs text-text-primary placeholder:text-text-faint
          focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/20
          transition-colors ${className}`}
        {...props}
      />
    </div>
  );
});

import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, className = '', id, 'aria-label': ariaLabel, ...props }, ref) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block font-mono text-[11px] font-semibold uppercase text-text-dim mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-label={ariaLabel || (!label ? undefined : undefined)}
        className="w-full bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
          font-mono text-[13px] text-text-primary placeholder:text-text-faint
          focus:bg-slime-code focus:border-mint/20 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-colors"
        {...props}
      />
    </div>
  )
})

export default Input

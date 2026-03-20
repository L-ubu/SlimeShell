import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-mono text-[10px] font-semibold uppercase text-text-dim mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className="w-full bg-slime-card border border-white/[0.06] rounded-lg px-3.5 py-2.5
          font-mono text-[12px] text-text-primary placeholder:text-text-faint
          focus:bg-slime-code focus:border-mint/15 focus:outline-none transition-colors"
        {...props}
      />
    </div>
  )
})

export default Input

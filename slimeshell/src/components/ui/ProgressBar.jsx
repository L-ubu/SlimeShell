export default function ProgressBar({ value, max = 100, color = 'mint', label, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const gradients = {
    mint: 'from-mint-dark to-mint',
    lavender: 'from-lavender to-[#C4B5FD]',
    rose: 'from-rose to-[#FDA4AF]',
    gold: 'from-gold to-[#FDE68A]',
    sky: 'from-sky-accent to-[#BAE6FD]',
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `${Math.round(pct)}% complete`}
      className={`w-full h-1.5 bg-slime-code rounded-[3px] overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-[3px] bg-gradient-to-r ${gradients[color] || gradients.mint} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

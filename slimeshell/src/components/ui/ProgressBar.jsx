export default function ProgressBar({ value, max = 100, color = 'mint', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const gradients = {
    mint: 'from-mint-dark to-mint',
    lavender: 'from-lavender to-[#C4B5FD]',
    rose: 'from-rose to-[#FDA4AF]',
    gold: 'from-gold to-[#FDE68A]',
  }

  return (
    <div className={`w-full h-1.5 bg-slime-card rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color] || gradients.mint} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

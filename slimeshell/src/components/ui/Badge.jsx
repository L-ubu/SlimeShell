const colorMap = {
  mint: { bg: 'bg-mint/10', text: 'text-mint' },
  rose: { bg: 'bg-rose/10', text: 'text-rose' },
  lavender: { bg: 'bg-lavender/10', text: 'text-lavender' },
  gold: { bg: 'bg-gold/10', text: 'text-gold' },
  sky: { bg: 'bg-sky-accent/10', text: 'text-sky-accent' },
  pink: { bg: 'bg-pink-accent/10', text: 'text-pink-accent' },
  muted: { bg: 'bg-white/[0.06]', text: 'text-text-muted' },
}

const categoryColors = {
  web: 'mint',
  crypto: 'lavender',
  pwn: 'rose',
  forensics: 'gold',
  rev: 'sky',
  stego: 'pink',
  misc: 'muted',
  osint: 'mint',
}

export default function Badge({ children, color = 'mint', category, pill = false, className = '' }) {
  const resolvedColor = category ? (categoryColors[category.toLowerCase()] || 'muted') : color
  const style = colorMap[resolvedColor] || colorMap.mint

  return (
    <span className={`
      inline-flex items-center ${style.bg} ${style.text}
      font-mono font-semibold leading-none whitespace-nowrap
      ${pill ? 'rounded-[10px] text-[10px] px-2.5 py-1' : 'rounded-[4px] text-[9px] px-1.5 py-0.5'}
      ${className}
    `}>
      {children}
    </span>
  )
}

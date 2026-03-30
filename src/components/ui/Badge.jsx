const colorMap = {
  mint: 'bg-mint/10 text-mint',
  rose: 'bg-rose/10 text-rose',
  lavender: 'bg-lavender/10 text-lavender',
  gold: 'bg-gold/10 text-gold',
  sky: 'bg-sky/10 text-sky',
  pink: 'bg-pink/10 text-pink',
  muted: 'bg-white/6 text-text-muted',
};

export function Badge({ color = 'mint', children, className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5
        font-mono text-[10px] font-semibold leading-tight
        ${colorMap[color] || colorMap.mint} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

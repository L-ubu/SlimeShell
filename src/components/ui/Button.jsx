const variants = {
  primary:
    'bg-mint text-terminal font-bold hover:brightness-110 active:brightness-95',
  ghost:
    'bg-mint/8 border border-mint/15 text-mint hover:bg-mint/15 active:bg-mint/20',
  secondary:
    'bg-card text-text-muted hover:text-text-secondary hover:bg-white/4 active:bg-white/6',
  destructive:
    'bg-rose/10 text-rose hover:bg-rose/20 active:bg-rose/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-xs',
  lg: 'px-5 py-2.5 text-sm',
  icon: 'p-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[6px] font-mono
        transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Button({ children, variant = 'primary', size = 'normal', onClick, className = '', disabled = false, type = 'button', 'aria-label': ariaLabel }) {
  const variants = {
    primary: 'bg-mint text-slime-terminal font-bold hover:bg-mint-dark',
    ghost: 'bg-mint/[0.08] border border-mint/15 text-mint hover:bg-mint/[0.14]',
    secondary: 'bg-slime-card text-text-muted hover:text-text-secondary hover:bg-white/[0.06]',
    destructive: 'bg-rose/10 text-rose hover:bg-rose/20',
  }

  const sizes = {
    small: 'px-2.5 py-1.5 text-[11px]',
    normal: 'px-4 py-2 text-[12px]',
    large: 'px-6 py-2.5 text-[13px]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        rounded-md font-mono font-semibold transition-all duration-150 inline-flex items-center gap-1.5
        focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

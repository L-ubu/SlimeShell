export default function Card({ children, className = '', active = false, onClick, as: Tag = 'div' }) {
  const interactive = !!onClick
  const Component = interactive ? 'button' : Tag

  return (
    <Component
      onClick={onClick}
      {...(interactive ? { type: 'button' } : {})}
      className={`
        rounded-[12px] py-5 px-6 text-left w-full
        ${active
          ? 'bg-mint/[0.04] border border-mint/[0.12]'
          : 'bg-slime-card border border-white/[0.04]'
        }
        ${interactive ? 'cursor-pointer hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-slime-base transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}

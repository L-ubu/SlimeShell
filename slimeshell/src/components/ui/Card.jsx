export default function Card({ children, className = '', active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg p-3.5
        ${active
          ? 'bg-mint/[0.04] border border-mint/[0.12]'
          : 'bg-slime-card border border-transparent'
        }
        ${onClick ? 'cursor-pointer hover:bg-white/[0.03] transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

import CopyButton from './CopyButton.jsx'

export default function CodeBlock({ children, language, showCopy = true, className = '' }) {
  return (
    <div className={`relative group bg-slime-code rounded-md border border-white/[0.04] ${className}`}>
      {language && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04]">
          <span className="font-mono text-[9px] font-semibold uppercase text-text-dim">{language}</span>
          {showCopy && <CopyButton text={typeof children === 'string' ? children : ''} size="small" />}
        </div>
      )}
      <pre className="px-3 py-3 overflow-x-auto">
        <code className="font-mono text-[11px] text-mint leading-relaxed whitespace-pre">
          {children}
        </code>
      </pre>
      {!language && showCopy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={typeof children === 'string' ? children : ''} />
        </div>
      )}
    </div>
  )
}

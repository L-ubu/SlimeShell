import CopyButton from './CopyButton.jsx'

export default function CodeBlock({ children, language, showCopy = true, className = '' }) {
  return (
    <div className={`relative group bg-slime-code rounded-lg border border-white/[0.04] ${className}`} role="region" aria-label={language ? `${language} code block` : 'Code block'}>
      {language && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
          <span className="font-mono text-[10px] font-semibold uppercase text-text-dim">{language}</span>
          {showCopy && <CopyButton text={typeof children === 'string' ? children : ''} size="small" />}
        </div>
      )}
      <pre className="px-4 py-3 overflow-x-auto">
        <code className="font-mono text-[12px] text-mint leading-relaxed whitespace-pre">
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

import { CopyButton } from './CopyButton';

export function CodeBlock({ children, language, className = '' }) {
  const code = typeof children === 'string' ? children : '';

  return (
    <div className={`relative group ${className}`}>
      <pre className="bg-code rounded-lg p-3 overflow-x-auto">
        <code className="font-mono text-[11px] leading-relaxed text-text-secondary">
          {children}
        </code>
      </pre>
      {language && (
        <span className="absolute top-2 left-3 font-mono text-[9px] text-text-faint uppercase tracking-wider">
          {language}
        </span>
      )}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

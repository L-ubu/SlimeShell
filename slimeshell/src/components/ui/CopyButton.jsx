import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore.js'

export default function CopyButton({ text, source = '', size = 'normal', className = '' }) {
  const [copied, setCopied] = useState(false)
  const addToClipboard = useAppStore((s) => s.addToClipboard)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      addToClipboard({ content: text, source })
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const iconSize = size === 'small' ? 12 : 14

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      className={`
        inline-flex items-center gap-1 rounded-md transition-all duration-150 cursor-pointer
        focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-1 focus-visible:ring-offset-slime-base
        ${size === 'small' ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1.5 text-[11px]'}
        ${copied
          ? 'bg-mint/10 text-mint'
          : 'bg-white/[0.04] text-text-dim hover:text-text-muted hover:bg-white/[0.08]'
        }
        ${className}
      `}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {size !== 'small' && <span className="font-mono">{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  )
}

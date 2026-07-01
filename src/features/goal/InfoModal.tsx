import { useEffect } from 'react'
import { X } from 'lucide-react'

interface InfoModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * Centered modal dialog with a translucent grey scrim.
 * Matches the Figma Modal component (title row + close, white card, soft shadow).
 */
export function InfoModal({ open, title, onClose, children }: InfoModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-lg"
      onMouseDown={onClose}
    >
      {/* Translucent grey scrim */}
      <div className="absolute inset-0" style={{ background: 'rgba(42, 43, 63, 0.4)' }} aria-hidden />

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-[600px] rounded-lg bg-surface p-lg shadow-[0_8px_32px_rgba(42,43,63,0.24)]"
      >
        <div className="mb-md flex items-start justify-between gap-md">
          <h2 className="text-lg font-medium leading-snug text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-xxs -mt-xxs flex size-6 shrink-0 items-center justify-center rounded-sm text-ink-subdued transition-colors hover:bg-surface-pale hover:text-ink"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

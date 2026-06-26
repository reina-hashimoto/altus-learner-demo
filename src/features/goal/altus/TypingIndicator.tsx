import altusLogo from '@/assets/altus-logo.png'

/**
 * "Altus is thinking" — ported 1:1 from admin-agent: the Altus fox logo
 * (56px artwork, ~half-scale visible) gently pulsing, then three dots
 * (purple-400 lead, purple-200 trailing) fading in on a staggered loop.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-xs py-xxs animate-altus-fadein" role="status" aria-live="polite">
      <img
        src={altusLogo}
        alt="Altus"
        className="size-[56px] shrink-0 object-contain"
        style={{ animation: 'foxPulse 1s ease-in-out infinite' }}
      />
      <span className="-ml-[14px] text-sm font-medium text-ink-subdued">Altus is thinking</span>
      <span className="flex items-center gap-xxs" aria-hidden>
        {[
          { bg: 'var(--color-purple-400)', delay: '0ms' },
          { bg: 'var(--color-purple-200)', delay: '120ms' },
          { bg: 'var(--color-purple-200)', delay: '240ms' },
        ].map((d, i) => (
          <span
            key={i}
            className="size-2 rounded-round"
            style={{ background: d.bg, animation: `altusFadeIn 500ms ease-in-out ${d.delay} infinite alternate` }}
          />
        ))}
      </span>
    </div>
  )
}

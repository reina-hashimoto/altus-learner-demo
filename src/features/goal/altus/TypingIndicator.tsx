import { AltusMark } from './AltusMark'

/** "Altus is thinking" with three pulsing dots. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-xs text-sm text-ink-subdued">
      <AltusMark size={16} />
      <span>Altus is thinking</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-round bg-brand-bright"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  )
}

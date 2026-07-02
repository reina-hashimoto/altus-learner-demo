import { Check } from 'lucide-react'

const GOAL_GREEN = '#0e8a5f'

/** Green completion check that pops in beside the goal title, then bursts a sparkle. */
export function GoalCompleteCheck() {
  return (
    <span className="relative flex shrink-0 items-center">
      <span
        className="check-pop flex size-7 items-center justify-center rounded-round text-white shadow-sm"
        style={{ background: GOAL_GREEN }}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
      {/* Sparkle burst — fires just after the pop settles */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span
          className="celebrate-ring absolute left-1/2 top-1/2 size-7 rounded-round"
          style={{ border: `2px solid ${GOAL_GREEN}`, animationDelay: '0.45s' }}
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="celebrate-spark absolute left-1/2 top-1/2 leading-none"
            style={
              {
                ['--a']: `${i * 36}deg`,
                ['--d']: `${i % 2 === 0 ? 34 : 24}px`,
                color: GOAL_GREEN,
                fontSize: i % 2 === 0 ? 14 : 10,
                animationDelay: '0.45s',
              } as React.CSSProperties
            }
          >
            ✦
          </span>
        ))}
      </span>
    </span>
  )
}

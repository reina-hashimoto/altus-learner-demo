import { Info, Flame, MonitorPlay, FlaskConical, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Dual-arc progress ring: orange = minutes, teal = visits (from Figma streak card). */
function StreakRing() {
  const size = 64
  const stroke = 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  // Two arcs split around the circle: minutes (20/30) and visits (1/1).
  const minutesPct = 20 / 30
  const visitsPct = 1 / 1
  // Each arc occupies roughly half the ring with a small gap.
  const half = circ / 2
  const gap = 6
  return (
    <span className="relative flex size-16 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        {/* minutes arc — top half, orange */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${half - gap} ${circ - (half - gap)}`}
          strokeDashoffset={0}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-orange-300)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(half - gap) * minutesPct} ${circ - (half - gap) * minutesPct}`}
          strokeDashoffset={0}
        />
        {/* visits arc — bottom half, teal/green */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${half - gap} ${circ - (half - gap)}`}
          strokeDashoffset={-half}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-green-300)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(half - gap) * visitsPct} ${circ - (half - gap) * visitsPct}`}
          strokeDashoffset={-half}
        />
      </svg>
    </span>
  )
}

/** "Start a weekly streak" card. Subtitle differs slightly between screens. */
export function StreakCard({ subtitle }: { subtitle?: string }) {
  return (
    <section className="flex flex-col rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-xxs">
          <h2 className="text-lg font-medium text-ink">Start a weekly streak</h2>
          <p className="text-sm text-ink-subdued">
            {subtitle ?? 'Just 30 mins a week help you achieve your goals'}
          </p>
        </div>
        <Info className="size-5 shrink-0 text-ink-subdued" strokeWidth={1.75} />
      </div>

      <div className="mt-lg flex items-center gap-xl">
        <div className="flex items-center gap-sm">
          <Flame className="size-7 text-brand" strokeWidth={2} fill="var(--color-purple-100)" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm text-ink">
              <span className="text-lg font-bold">1</span> week
            </span>
            <span className="text-xs text-ink-subdued">Current streak</span>
          </span>
        </div>

        <div className="flex items-center gap-md">
          <StreakRing />
          <ul className="flex flex-col gap-xs text-sm text-ink">
            <li className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-orange-300)]" />
              <span className="font-bold">20</span>
              <span className="-ml-1 text-ink-subdued">/30 min</span>
            </li>
            <li className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-green-300)]" />
              <span className="font-bold">1</span>
              <span className="-ml-1 text-ink-subdued">/1 visit</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-md flex justify-end">
        <Button udStyle="ghost" size="small">View activity</Button>
      </div>
    </section>
  )
}

const CHALLENGE_ITEMS = [
  { id: 'learn', label: 'Learn', sub: 'Video, article', Icon: MonitorPlay, active: true },
  { id: 'practice', label: 'Practice', sub: 'Role play, Lab', Icon: FlaskConical, active: true },
  { id: 'assess', label: 'Assess', sub: 'Quiz, assessment', Icon: ClipboardCheck, active: false },
]

/** "Weekly challenge" card — one activity in each learning type. */
export function WeeklyChallengeCard() {
  return (
    <section className="flex flex-col rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-xxs">
          <h2 className="text-lg font-medium text-ink">Weekly challenge</h2>
          <p className="text-sm text-ink-subdued">Complete one activity in each learning type</p>
        </div>
        <Info className="size-5 shrink-0 text-ink-subdued" strokeWidth={1.75} />
      </div>

      <div className="mt-lg flex items-center gap-xl">
        {CHALLENGE_ITEMS.map(({ id, label, sub, Icon, active }) => (
          <div key={id} className="flex items-center gap-sm">
            <span
              className={
                active
                  ? 'flex size-10 items-center justify-center rounded-round bg-[var(--color-green-400)] text-on-brand'
                  : 'flex size-10 items-center justify-center rounded-round border border-line text-ink-subdued'
              }
            >
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-ink">{label}</span>
              <span className="text-xs text-ink-subdued">{sub}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-md flex justify-end">
        <Button udStyle="ghost" size="small">View activity</Button>
      </div>
    </section>
  )
}

/** The shared two-card row + week label that closes screens A & B. */
export function StreakChallengeRow({ streakSubtitle }: { streakSubtitle?: string }) {
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-right text-xs text-ink-subdued">Feb 22-28, 2026</p>
      <div className="grid grid-cols-2 gap-lg">
        <StreakCard subtitle={streakSubtitle} />
        <WeeklyChallengeCard />
      </div>
    </div>
  )
}

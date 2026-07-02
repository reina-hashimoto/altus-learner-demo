/**
 * Goal header for the Personal goal flow. Mirrors the flex-pm GoalHeader layout
 * but with a Personal-goal ORANGE tag and mutable weekly-time / target-date /
 * role meta. Renders a placeholder-bar skeleton before the goal is built.
 */
import { Flag, CalendarDays, Clock, User, Check } from 'lucide-react'
import { PERSONAL_GOAL } from './data'

const GOAL_GREEN = '#0e8a5f'

/** Split "2 hours/week" → { amount, unit }. */
function splitWeekly(weekly: string): { amount: string; unit: string } {
  const i = weekly.lastIndexOf('/')
  if (i === -1) return { amount: weekly, unit: '/week' }
  return { amount: weekly.slice(0, i).trim(), unit: `/${weekly.slice(i + 1).trim()}` }
}

/** Green completion check that pops in beside the title, then bursts a sparkle. */
function GoalCompleteCheck() {
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

export function PersonalGoalHeader({
  skeleton,
  weeklyTime,
  role,
  dueDate,
  daysLeft,
  completedLabel,
  complete,
}: {
  skeleton: boolean
  weeklyTime: string
  role: string
  dueDate: string
  daysLeft: string
  /** When set (goal complete), the date line reads "Completed <Month Year>". */
  completedLabel?: string | null
  complete?: boolean
}) {
  const { amount, unit } = splitWeekly(weeklyTime)

  return (
    <div className="flex flex-col gap-xs">
      <span
        className="inline-flex w-fit items-center gap-xs rounded-sm px-xs py-0.5 text-xs font-bold text-ink"
        style={{ background: 'var(--color-orange-150)' }}
      >
        <Flag className="size-3.5" strokeWidth={2} />
        Personal goal
      </span>

      {skeleton ? (
        <>
          <div className="mt-xxs h-8 w-[62%] animate-pulse rounded-sm bg-surface-midtone" />
          <div className="mt-xs flex flex-wrap items-center gap-md">
            <div className="h-4 w-40 animate-pulse rounded-sm bg-surface-midtone" />
            <div className="h-4 w-24 animate-pulse rounded-sm bg-surface-midtone" />
            <div className="h-4 w-32 animate-pulse rounded-sm bg-surface-midtone" />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-sm">
            {complete && <GoalCompleteCheck />}
            <h1 className="text-xxl font-medium leading-tight text-ink">{PERSONAL_GOAL.title}</h1>
          </div>
          <div className="mt-xxs flex flex-wrap items-center gap-md text-sm text-ink-subdued">
            {completedLabel ? (
              <span className="flex items-center gap-xs">
                <CalendarDays className="size-4" strokeWidth={1.75} />
                <span className="font-bold text-ink">Completed</span>
                <span>{completedLabel}</span>
              </span>
            ) : (
              <span className="flex items-center gap-xs">
                <CalendarDays className="size-4" strokeWidth={1.75} />
                <span className="font-bold text-ink">{daysLeft}</span>
                <span>·</span>
                <span>{dueDate}</span>
              </span>
            )}
            <span className="flex items-center gap-xs">
              <Clock className="size-4" strokeWidth={1.75} />
              <span className="font-bold text-ink">{amount}</span>
              <span>{unit}</span>
            </span>
            <span className="flex items-center gap-xs">
              <User className="size-4" strokeWidth={1.75} />
              <span className="font-bold text-ink">{role}</span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

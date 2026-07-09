/**
 * Goal header for the Personal goal flow. Mirrors the flex-pm GoalHeader layout
 * but with a Personal-goal ORANGE tag and mutable weekly-time / target-date /
 * role meta. Renders a placeholder-bar skeleton before the goal is built.
 */
import { Flag, CalendarDays, Clock } from 'lucide-react'
import { PERSONAL_GOAL } from './data'
import { GoalCompleteCheck } from '@/features/goal/GoalCompleteCheck'

/** Split "2 hours/week" → { amount, unit }. */
function splitWeekly(weekly: string): { amount: string; unit: string } {
  const i = weekly.lastIndexOf('/')
  if (i === -1) return { amount: weekly, unit: '/week' }
  return { amount: weekly.slice(0, i).trim(), unit: `/${weekly.slice(i + 1).trim()}` }
}

export function PersonalGoalHeader({
  skeleton,
  weeklyTime,
  dueDate,
  daysLeft,
  completedLabel,
  complete,
}: {
  skeleton: boolean
  weeklyTime: string
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
          </div>
        </>
      )}
    </div>
  )
}
